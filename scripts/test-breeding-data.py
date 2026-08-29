#!/usr/bin/env python3
"""Validate the compact v0.8 breeding dataset and representative outcomes."""

from __future__ import annotations

import json
from collections import deque
from pathlib import Path


source = Path("js/breeding-data.js").read_text(encoding="utf-8")
data = json.loads(source[source.index("{") : source.rindex("}") + 1])
pals = data["pals"]
children = data["children"]
gender_combos = data["genderCombos"]
by_id = {pal[0]: pal for pal in pals}
index_by_id = {pal[0]: pal[3] for pal in pals}


def pair_index(a_index: int, b_index: int) -> int:
    low, high = sorted((a_index, b_index))
    return low * len(pals) - low * (low - 1) // 2 + high - low


def outcomes(a: str, b: str, gender_a=None, gender_b=None) -> list[tuple[str, tuple | None]]:
    if a not in by_id or b not in by_id or (gender_a and gender_a == gender_b):
        return []
    a_index, b_index = index_by_id[a], index_by_id[b]
    gendered = []
    pair_has_gender_rule = False
    for combo in gender_combos:
        if combo[0] == a_index and combo[2] == b_index:
            genders = (combo[1], combo[3])
        elif combo[0] == b_index and combo[2] == a_index:
            genders = (combo[3], combo[1])
        else:
            continue
        pair_has_gender_rule = True
        if gender_a is None or genders == (gender_a[0], gender_b[0]):
            gendered.append((pals[combo[4]][0], genders))
    if gendered or pair_has_gender_rule:
        return gendered
    child_index = children[pair_index(a_index, b_index)]
    return [] if child_index < 0 else [(pals[child_index][0], None)]


def shortest_route(start: str, target: str):
    if start == target:
        return []
    previous = {start: None}
    queue = deque([start])
    while queue and target not in previous:
        current = queue.popleft()
        for partner in pals:
            for child, genders in outcomes(current, partner[0]):
                if child in previous:
                    continue
                previous[child] = (current, partner[0], genders)
                queue.append(child)
    if target not in previous:
        return None
    route = []
    current = target
    while current != start:
        parent, partner, genders = previous[current]
        route.append((parent, partner, current, genders))
        current = parent
    return list(reversed(route))


assert data["meta"]["palCount"] == len(pals) == 298
assert data["meta"]["outcomeCount"] == 44552
assert len(by_id) == len(pals)
assert len(children) == 298 * 299 // 2
assert children.count(-1) == 1
assert len(gender_combos) == 2
assert outcomes("SheepBall", "SheepBall")[0][0] == "SheepBall"
assert outcomes("SheepBall", "ChickenPal")[0][0] == "Ganesha"
assert outcomes("DomeArmorDragon", "ClioneTwins")[0][0] == "HerculesBeetle"
assert outcomes("Manticore", "CatVampire")[0][0] == "Manticore_Dark"
assert outcomes("BirdDragon", "IceFox")[0][0] == "BirdDragon_Ice"
assert outcomes("CatMage", "FoxMage", "Female", "Male")[0][0] == "CatMage_Fire"
assert outcomes("CatMage", "FoxMage", "Male", "Female")[0][0] == "FoxMage_Dark"
assert outcomes("CatMage", "FoxMage", "Female", "Female") == []
assert outcomes("YakushimaMonster001", "YakushimaBoss001")[0][0] == "YakushimaBoss001"
assert outcomes("YakushimaBoss001", "YakushimaBoss001")[0][0] == "YakushimaBoss001"
assert shortest_route("SheepBall", "SheepBall") == []

route_cases = []
for start, target in [("PinkCat", "Monkey"), ("PinkCat", "CloverFairy"), ("PinkCat", "Ganesha")]:
    route = shortest_route(start, target)
    assert route is not None and route[-1][2] == target, (start, target)
    assert all(step[2] in {child for child, _ in outcomes(step[0], step[1])} for step in route)
    route_cases.append((start, target, len(route)))

assert shortest_route("PinkCat", "JetDragon") is None
print(
    f"Validated {len(pals)} Pals, {data['meta']['outcomeCount']} outcomes, "
    f"gender rules and shortest routes {route_cases}."
)
