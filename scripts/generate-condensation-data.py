#!/usr/bin/env python3
"""Generate the compact, local condensation dataset used by Palworld Nyu Tools.

Sources are intentionally supplied as local paths so this script never makes
network requests. It combines MagitekZed/palworld-helper's obtainable roster
and portraits with KrisCris/Palworld-Pal-Editor's French names, best work
suitability and Palworld 1.0 condensation rules.
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
from pathlib import Path


WORK_TYPES = (
    ("Kindling", "EPalWorkSuitability::EmitFlame"),
    ("Watering", "EPalWorkSuitability::Watering"),
    ("Planting", "EPalWorkSuitability::Seeding"),
    ("Generating Electricity", "EPalWorkSuitability::GenerateElectricity"),
    ("Handiwork", "EPalWorkSuitability::Handcraft"),
    ("Gathering", "EPalWorkSuitability::Collection"),
    ("Lumbering", "EPalWorkSuitability::Deforest"),
    ("Mining", "EPalWorkSuitability::Mining"),
    ("Medicine Production", "EPalWorkSuitability::ProductMedicine"),
    ("Cooling", "EPalWorkSuitability::Cool"),
    ("Transporting", "EPalWorkSuitability::Transport"),
    ("Farming", "EPalWorkSuitability::MonsterFarm"),
)
WORK_INDEX = {internal: index for index, (_, internal) in enumerate(WORK_TYPES)}
INTERNAL_ORDER = tuple(internal for _, internal in WORK_TYPES)

ELEMENTS_FR = {
    "Neutral": "Neutre",
    "Fire": "Feu",
    "Water": "Eau",
    "Grass": "Plante",
    "Electric": "Électrique",
    "Ice": "Glace",
    "Ground": "Terre",
    "Dark": "Ténèbres",
    "Dragon": "Dragon",
}


def condensation_bonus(base: dict[str, int], stars: int, best: str | None) -> dict[str, int]:
    """Mirror Palworld-Pal-Editor's condensation_work_suitability_bonus()."""
    base = {key: value for key, value in base.items() if value > 0}
    bonus = {key: 0 for key in base}
    if best == "EPalWorkSuitability::None":
        best = None
    if not base:
        return bonus

    current = base.copy()

    def nth_highest(index: int) -> str | None:
        values = sorted(set(current.values()), reverse=True)
        if index >= len(values):
            return None
        return next((key for key in INTERNAL_ORDER if current.get(key) == values[index]), None)

    for step in range(1, min(stars, 4) + 1):
        if step == 4:
            for key in base:
                bonus[key] += 1
                current[key] += 1
            continue

        if len(current) == 1:
            target = next(iter(current))
        elif step == 1:
            target = best
        elif step == 2:
            target = nth_highest(1) or best
        elif len(current) == 2:
            target = best
        else:
            target = nth_highest(2) or nth_highest(1) or best

        if target is not None:
            if target in bonus:
                bonus[target] += 1
            current[target] = current.get(target, 0) + 1

    return bonus


def palpedia_levels(base: dict[str, int], stars: int, best: str | None) -> dict[str, int]:
    """Mirror Palpedia 1.0.3's public work-suitability table for comparison."""
    ordered = sorted(
        ((key, value) for key, value in base.items() if value > 0),
        key=lambda item: (-item[1], INTERNAL_ORDER.index(item[0])),
    )
    keys = [key for key, _ in ordered]
    if best in keys:
        keys = [best, *(key for key in keys if key != best)]
    result = {key: base[key] for key in keys}
    if not keys:
        return result
    for step in range(1, min(stars, 3) + 1):
        result[keys[(step - 1) % len(keys)]] += 1
    if stars >= 4:
        for key in keys:
            result[key] += 1
    return {key: min(value, 10) for key, value in result.items()}


def compact_levels(base: dict[str, int], stars: int, best: str | None) -> list[int]:
    bonus = condensation_bonus(base, stars, best)
    return [min(base.get(internal, 0) + bonus.get(internal, 0), 10) for _, internal in WORK_TYPES]


def safe_id(code: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", code.lower()).strip("-")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--helper-root", type=Path, required=True)
    parser.add_argument("--editor-root", type=Path, required=True)
    parser.add_argument("--project-root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--partner-source", type=Path)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    helper_file = args.helper_root / "data" / "pals_work_suitability.json"
    editor_file = (
        args.editor_root
        / "src"
        / "palworld_pal_editor"
        / "assets"
        / "data"
        / "pal_data.json"
    )
    helper = json.loads(helper_file.read_text(encoding="utf-8"))
    editor = json.loads(editor_file.read_text(encoding="utf-8"))
    partner_file = args.partner_source or args.project_root / "data" / "partner-skills-fr.json"
    partner_source = json.loads(partner_file.read_text(encoding="utf-8"))
    partner_skills = partner_source["skills"]
    pals = helper["pals"]

    if helper["meta"].get("game_version", "").split()[0] != "1.0":
        raise ValueError("The helper dataset is not marked as Palworld 1.0 data")
    if len({pal["code"] for pal in pals}) != len(pals):
        raise ValueError("Duplicate internal Pal codes found in the source roster")

    output_dir = args.project_root / "assets" / "pals" / "condensation"
    output_dir.mkdir(parents=True, exist_ok=True)
    expected_portraits: set[str] = set()
    output: list[dict[str, object]] = []
    source_mismatches: list[str] = []
    palpedia_differences: set[str] = set()

    for pal in pals:
        code = pal["code"]
        if code not in editor:
            raise KeyError(f"Missing editor entry for {code}")
        editor_pal = editor[code]
        if code not in partner_skills:
            raise KeyError(f"Missing partner skill entry for {code}")
        base = {
            internal: int(pal.get("works", {}).get(helper_name, 0))
            for helper_name, internal in WORK_TYPES
        }
        editor_levels = {
            internal: int(editor_pal.get("Suitabilities", {}).get(internal, 0))
            for _, internal in WORK_TYPES
        }
        if base != editor_levels:
            source_mismatches.append(code)

        icon_name = Path(pal["icon"]).name
        source_icon = args.helper_root / "icons" / "pals" / icon_name
        if not source_icon.is_file():
            raise FileNotFoundError(f"Missing portrait for {code}: {source_icon}")
        expected_portraits.add(icon_name)
        shutil.copy2(source_icon, output_dir / icon_name)

        best = editor_pal.get("BestWorkSuitability")
        levels = [compact_levels(base, stars, best) for stars in range(5)]
        for stars in range(5):
            generated = {
                internal: levels[stars][WORK_INDEX[internal]]
                for _, internal in WORK_TYPES
                if levels[stars][WORK_INDEX[internal]] > 0
            }
            if generated != palpedia_levels(base, stars, best):
                palpedia_differences.add(code)

        output.append(
            {
                "id": safe_id(code),
                "code": code,
                "name": editor_pal.get("I18n", {}).get("fr") or pal["name"],
                "number": pal.get("paldex") or None,
                "elements": [ELEMENTS_FR[element] for element in pal.get("elements", [])],
                "portrait": f"assets/pals/condensation/{icon_name}",
                "levels": levels,
                "partner": partner_skills[code],
                "crossover": bool(pal.get("crossover")),
            }
        )

    for existing in output_dir.glob("*.webp"):
        if existing.name not in expected_portraits:
            existing.unlink()

    if source_mismatches:
        raise ValueError(
            "Work suitability mismatches between source datasets: "
            + ", ".join(source_mismatches)
        )

    output.sort(
        key=lambda pal: (
            pal["number"] is None,
            int(re.match(r"\d+", pal["number"])[0]) if pal["number"] else 9999,
            pal["number"] or "",
            pal["name"],
        )
    )
    metadata = {
        "gameVersion": helper["meta"]["game_version"],
        "palCount": len(output),
        "terrariaCount": sum(1 for pal in output if pal["crossover"]),
        "partnerSkillCount": sum(1 for pal in output if pal["partner"]["name"]),
        "partnerScaledCount": sum(1 for pal in output if pal["partner"]["effects"]),
        "excluded": helper["meta"].get("excluded"),
        "palpediaAlgorithmDifferences": len(palpedia_differences),
    }
    data_file = args.project_root / "js" / "condensation-data.js"
    serialized_meta = json.dumps(metadata, ensure_ascii=False, separators=(",", ":"))
    serialized_pals = json.dumps(output, ensure_ascii=False, separators=(",", ":"))
    data_file.write_text(
        f"window.CONDENSATION_META={serialized_meta};\n"
        f"window.CONDENSATION_PALS={serialized_pals};\n",
        encoding="utf-8",
    )

    print(json.dumps(metadata, ensure_ascii=False, indent=2))
    if palpedia_differences:
        print("Palpedia algorithm differences:", ", ".join(sorted(palpedia_differences)))


if __name__ == "__main__":
    main()
