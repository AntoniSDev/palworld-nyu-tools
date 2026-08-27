#!/usr/bin/env python3
"""Build the compact, browser-ready Palworld 1.0 breeding dataset.

Inputs are the extracted pals.json / combos.json files from
ICSharperNow/palworld-breeding-calculator and this project's generated French
condensation roster. Only the 287 released, non-crossover Pals shared by both
sources are published.
"""

from __future__ import annotations

import argparse
import json
import re
import unicodedata
from pathlib import Path


SOURCE_REVISION = "2d622d64140fc90b1ac913c139d91dfd150d15dd"


def read_condensation_roster(path: Path) -> list[dict]:
    source = path.read_text(encoding="utf-8")
    start = source.index("[")
    end = source.rindex("]") + 1
    return json.loads(source[start:end])


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pals", type=Path, required=True)
    parser.add_argument("--combos", type=Path, required=True)
    parser.add_argument("--outcomes", type=Path, required=True)
    parser.add_argument("--condensation", type=Path, default=Path("js/condensation-data.js"))
    parser.add_argument("--output", type=Path, default=Path("js/breeding-data.js"))
    args = parser.parse_args()

    source_pals = json.loads(args.pals.read_text(encoding="utf-8"))
    source_combos = json.loads(args.combos.read_text(encoding="utf-8"))
    outcome_snapshot = json.loads(args.outcomes.read_text(encoding="utf-8"))
    local_by_code = {
        pal["code"]: pal
        for pal in read_condensation_roster(args.condensation)
        if not pal.get("crossover", False)
    }

    included = [pal for pal in source_pals if pal["id"] in local_by_code]
    included_ids = {pal["id"] for pal in included}
    if len(included) != 287:
        raise SystemExit(f"Expected 287 released Pals, found {len(included)}")

    pals = []
    id_to_index = {}
    for index, source_pal in enumerate(included):
        local = local_by_code[source_pal["id"]]
        id_to_index[source_pal["id"]] = index
        pals.append(
            [
                source_pal["id"],
                local["name"],
                local["portrait"],
                index,
            ]
        )

    def slugify(value: str) -> str:
        ascii_value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
        return re.sub(r"[^a-z0-9]+", "-", ascii_value.lower()).strip("-")

    slug_to_id = {slugify(pal["name"]): pal["id"] for pal in included}
    pair_count = len(pals) * (len(pals) + 1) // 2
    children = [-1] * pair_count
    gender_combos = []

    def pair_index(a_index: int, b_index: int) -> int:
        low, high = sorted((a_index, b_index))
        return low * len(pals) - low * (low - 1) // 2 + high - low

    included_records = 0
    for record in outcome_snapshot["records"]:
        if not all(record[key] in slug_to_id for key in ("parent_a", "parent_b", "child")):
            continue
        a_id = slug_to_id[record["parent_a"]]
        b_id = slug_to_id[record["parent_b"]]
        child_id = slug_to_id[record["child"]]
        a_index = id_to_index[a_id]
        b_index = id_to_index[b_id]
        child_index = id_to_index[child_id]
        included_records += 1
        if record["parent_a_gender"]:
            gender_combos.append(
                [
                    a_index,
                    "M" if record["parent_a_gender"] == "male" else "F",
                    b_index,
                    "M" if record["parent_b_gender"] == "male" else "F",
                    child_index,
                ]
            )
        else:
            children[pair_index(a_index, b_index)] = child_index

    if included_records != 41329 or children.count(-1) != 1 or len(gender_combos) != 2:
        raise SystemExit(
            f"Unexpected outcome coverage: {included_records} records, "
            f"{children.count(-1)} gender-only pair, {len(gender_combos)} gender rules"
        )

    payload = {
        "meta": {
            "gameVersion": "1.0.0",
            "compatibleThrough": "1.0.3",
            "palCount": len(pals),
            "outcomeCount": included_records,
            "specialRuleCount": len(source_combos),
            "source": "Palweave Palworld 1.0 audited outcomes, mapped with ICSharperNow game tables",
            "sourceRevision": SOURCE_REVISION,
            "outcomeSha256": "9f558802ed3fa14b52c352d18a05cd40b295e636ccca249376293e80dc1643c4",
        },
        "pals": pals,
        "children": children,
        "genderCombos": gender_combos,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    serialized = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    args.output.write_text(f"window.BREEDING_DATA={serialized};\n", encoding="utf-8")
    print(f"Generated {len(pals)} Pals and {included_records} outcomes in {args.output}")


if __name__ == "__main__":
    main()
