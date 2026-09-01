#!/usr/bin/env python3
"""Validate the generated Palworld Nyu Tools condensation dataset."""

from __future__ import annotations

import json
import re
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = PROJECT_ROOT / "js" / "condensation-data.js"
PARTNER_FILE = PROJECT_ROOT / "data" / "partner-skills-fr.json"
PORTRAIT_ROOT = PROJECT_ROOT / "assets" / "pals" / "condensation"


def load_dataset() -> tuple[dict, list[dict]]:
    source = DATA_FILE.read_text(encoding="utf-8")
    meta_match = re.search(r"window\.CONDENSATION_META=(.*);", source)
    pals_match = re.search(r"window\.CONDENSATION_PALS=(.*);", source)
    if not meta_match or not pals_match:
        raise AssertionError("Generated JavaScript dataset is malformed")
    return json.loads(meta_match.group(1)), json.loads(pals_match.group(1))


def main() -> None:
    meta, pals = load_dataset()
    partner_skills = json.loads(PARTNER_FILE.read_text(encoding="utf-8"))["skills"]
    by_code = {pal["code"]: pal for pal in pals}

    assert meta["palCount"] == 298 == len(pals)
    assert meta["terrariaCount"] == 11
    assert len(by_code) == len(pals), "Duplicate internal codes"
    assert len({pal["id"] for pal in pals}) == len(pals), "Duplicate stable IDs"
    assert len({pal["portrait"] for pal in pals}) == len(pals), "Duplicate portraits"
    assert sum(bool(pal["crossover"]) for pal in pals) == 11
    assert meta["partnerSkillCount"] == len(pals)
    assert "Astralym" in meta["excluded"]

    for pal in pals:
        assert len(pal["levels"]) == 5
        assert pal["partner"]["name"]
        assert pal["partner"]["description"]
        assert pal["partner"] == partner_skills[pal["code"]], pal["code"]
        assert (PROJECT_ROOT / pal["partner"]["icon"]).is_file(), pal["partner"]["icon"]
        for effect in pal["partner"]["effects"]:
            assert effect["label"]
            assert len(effect["values"]) == 5
        assert all(len(levels) == 12 for levels in pal["levels"])
        assert (PROJECT_ROOT / pal["portrait"]).is_file(), pal["portrait"]
        base = pal["levels"][0]
        for index in range(12):
            values = [levels[index] for levels in pal["levels"]]
            assert values == sorted(values), (pal["code"], index, values)
            assert all(0 <= value <= 10 for value in values)
            if base[index] == 0:
                assert values == [0, 0, 0, 0, 0]

    # Palpedia visual references requested for all five states.
    assert by_code["Carbunclo"]["levels"] == [
        [0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0],
        [0, 0, 2, 0, 1, 1, 1, 0, 1, 0, 0, 0],
        [0, 0, 2, 0, 2, 1, 1, 0, 1, 0, 0, 0],
        [0, 0, 2, 0, 2, 2, 1, 0, 1, 0, 0, 0],
        [0, 0, 3, 0, 3, 3, 2, 0, 2, 0, 0, 0],
    ]
    assert by_code["BluePlatypus"]["levels"] == [
        [0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0],
        [0, 2, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0],
        [0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 1, 0],
        [0, 2, 0, 0, 2, 0, 0, 0, 0, 0, 2, 0],
        [0, 3, 0, 0, 3, 0, 0, 0, 0, 0, 3, 0],
    ]
    assert by_code["BluePlatypus_Fire"]["levels"] == [
        [2, 2, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0],
        [3, 2, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0],
        [3, 3, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0],
        [3, 3, 0, 0, 2, 0, 0, 0, 0, 0, 1, 0],
        [4, 4, 0, 0, 3, 0, 0, 0, 0, 0, 2, 0],
    ]

    # One suitability, two suitabilities, many suitabilities and equal bases.
    assert [row[1] for row in by_code["Ganesha"]["levels"]] == [1, 2, 3, 4, 5]
    assert sum(value > 0 for value in by_code["BerryGoat"]["levels"][0]) == 2
    assert sum(value > 0 for value in by_code["SoldierBee"]["levels"][0]) == 7
    assert len({value for value in by_code["Carbunclo"]["levels"][0] if value > 0}) == 1

    # Endgame high level and an unnumbered Terraria Pal.
    assert [row[7] for row in by_code["DomeArmorDragon"]["levels"]] == [8, 9, 10, 10, 10]
    terraria = by_code["YakushimaBoss001"]
    assert terraria["crossover"] and terraria["number"] is None
    assert [row[10] for row in terraria["levels"]] == [4, 5, 6, 7, 8]

    # Partner-skill structures requested for the UI.
    assert by_code["PinkCat"]["partner"]["effects"][0]["values"] == [
        "+100", "+120", "+140", "+160", "+200"
    ]
    assert len(by_code["WingGolem"]["partner"]["effects"]) == 2
    assert by_code["FireKirin"]["partner"]["effects"][0]["values"] == [
        "+5%", "+7%", "+10%", "+14%", "+20%"
    ]
    assert by_code["LongCat"]["partner"]["effects"] == []
    assert by_code["ThunderFluffyBird"]["partner"]["effects"][0]["values"] == [
        "+20%", "+22%", "+26%", "+32%", "+40%"
    ]

    assert len(list(PORTRAIT_ROOT.glob("*.webp"))) == len(pals)
    print(
        f"Validated {len(pals)} Pals, {meta['terrariaCount']} Terraria entries, "
        f"{len(list(PORTRAIT_ROOT.glob('*.webp')))} local portraits."
    )


if __name__ == "__main__":
    main()
