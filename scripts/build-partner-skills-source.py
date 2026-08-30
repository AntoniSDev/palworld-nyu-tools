#!/usr/bin/env python3
"""Build the local French partner-skill source used by the condensation generator.

Inputs are saved HTML snapshots from paldb.cc/fr/Partner_Skill (official French
localization strings) and palworld-db.com/partner-skills (rank-by-rank values).
The public application never contacts either website at runtime.
"""

from __future__ import annotations

import argparse
import html
import json
import re
from pathlib import Path


LABELS_FR = {
    "Max Inventory Weight": "Capacité de charge",
    "Ranged Attack": "Attaque",
    "Defense": "Défense",
    "Move Speed": "Vitesse de déplacement",
    "Move Speed Grass": "Vitesse de déplacement sur l’herbe",
    "Move Speed Ground": "Vitesse de déplacement au sol",
    "Move Speed Snow": "Vitesse de déplacement sur la neige",
    "Swim Speed": "Vitesse de nage",
    "Work Speed": "Vitesse de travail",
    "Partner Skill Cool Time Decrease": "Réduction du temps de recharge des compétences partenaires",
    "Pal Egg Hatching Speed": "Vitesse d’éclosion des œufs",
    "Logging": "Efficacité d’abattage",
    "Mining": "Efficacité d’extraction",
    "Gathering Yield": "Rendement de collecte",
    "Item Weight Reduction": "Réduction du poids des objets",
    "Damage Rate By Equipped Weapon": "Dégâts de l’arme équipée",
    "Damage Up Partner Skill Attack": "Puissance de la compétence partenaire",
    "Damage Up Last Bullet": "Dégâts de la dernière balle",
    "Attack Speed Up": "Vitesse d’attaque",
    "Body Parts Weak Damage": "Dégâts aux points faibles",
    "Recover HPOn HPThreshold": "PV restaurés",
    "Regene HP Rate": "Régénération des PV",
    "Hunger Drain": "Réduction de la faim",
    "Sanity Decrease": "Réduction de la perte de MEN",
    "Life Steal": "Vol de vie",
    "Fall Damage Rate": "Réduction des dégâts de chute",
    "Air Dash": "Puissance de la ruée aérienne",
    "Jump Count Increase": "Sauts supplémentaires",
    "Jump Power Increase": "Puissance de saut",
    "Climb Move Speed Rate": "Vitesse d’escalade",
    "Reload Speed Up": "Vitesse de rechargement",
    "Equipment Durability Rate": "Durabilité de l’équipement",
    "Shield Damage Cut Rate": "Réduction des dégâts du bouclier",
    "Player Shield Recover Start Time Rate": "Délai de récupération du bouclier",
    "Capture Level Sneak Bonus": "Bonus de capture furtive",
    "Enemy Sight Detection Rate": "Détection par les ennemis",
    "Breed Speed In Base Camp": "Vitesse de reproduction à la base",
    "Farm Crop Growup Speed": "Vitesse de croissance des cultures",
    "Farm Crop Harvest Num Rate": "Quantité récoltée",
    "Fishing Start Progress Add": "Progression initiale de pêche",
    "Fishing Success Amount Up": "Quantité obtenue en pêche",
    "Fishing Failed Amount Down": "Réduction des échecs de pêche",
    "Fishing Good Talent Pal Probability": "Chance d’obtenir un Pal talentueux en pêche",
    "Avoid Duration Up Partner Skill": "Durée d’esquive",
    "Player Arrow Explosion": "Dégâts d’explosion des flèches",
    "Player Low Health Blast": "Puissance de l’explosion à faibles PV",
    "Player Inflict Effect Melee Hit Barrier": "Fenêtre pour déclencher la barrière",
    "Attack Rate HPThreshold": "Attaque à faibles PV",
    "Bullet Hit Stack Buff": "Bonus cumulable par balle touchée",
    "Capture Level Up If Target Freeze": "Bonus de capture sur une cible gelée",
    "Capture Level Up If Target Ivy Cling": "Bonus de capture sur une cible entravée",
    "Damage Up To Non Battle Enemy": "Dégâts sur les ennemis hors combat",
    "Defeat Enemy Active Skill Cool Time Decrease": "Réduction du temps de recharge après une élimination",
    "Defeat Enemy Stack Buff": "Bonus cumulable après une élimination",
    "Defuser Explosive Spore": "Puissance des spores explosives",
    "Egg Alpha Conversion": "Chance d’obtenir un Pal Alpha dans un œuf",
    "Egg Obtain Extra Egg": "Chance d’obtenir un œuf supplémentaire",
    "Fishing Enemy Add Drop": "Butin supplémentaire sur les ennemis pêchés",
    "Fishing Item Add Drop": "Objets supplémentaires obtenus en pêche",
    "Fishing Salvage Item Drop": "Objets de récupération obtenus en pêche",
    "Gain Item Drop": "Objets supplémentaires obtenus",
    "Item Corruption Speed Rate": "Vitesse de détérioration des objets",
    "Lava Damage Invalid": "Protection contre les dégâts de lave",
    "Meat Cut Add Item Drop": "Objets supplémentaires lors de la découpe",
    "Pal Exp Increase": "EXP obtenue par les Pals",
    "Player Element Step Attack Leaf": "Dégâts de l’attaque végétale du joueur",
    "Player Inflict Effect Attack Burning Apply Explosion": "Explosion sur une cible brûlée",
    "Player Inflict Effect Attack Burning Apply Fire Vortex": "Vortex de feu sur une cible brûlée",
    "Player Inflict Effect Attack Electrified Apply Spark": "Étincelle sur une cible électrisée",
    "Player Inflict Effect Attack Ivy Cling Apply Explosion": "Explosion sur une cible entravée",
    "Player Inflict Effect Attack Poisoned Apply Attack Down": "Réduction d’attaque sur une cible empoisonnée",
    "Player Inflict Effect Attack Wet Apply Freeze": "Gel d’une cible trempée",
    "Player Inflict Effect Weak Point Hit Damage Up": "Dégâts aux points faibles du joueur",
    "Regene Stomatch Hungriest": "Restauration de la satiété",
    "Sphere Recovery": "Récupération des Sphères",
    "Syncro Passive When Capture": "Chance de transmettre une compétence passive à la capture",
    "Temperature Resist Cold": "Résistance au froid",
    "Temperature Resist Heat": "Résistance à la chaleur",
    "Normal Damage": "Dégâts Non élém.",
    "Dark Damage": "Dégâts de Ténèbres",
}

ELEMENTS_FR = {
    "Normal": "Non élém.", "Fire": "Feu", "Water": "Eau", "Leaf": "Herbe",
    "Electricity": "Électricité", "Ice": "Glace", "Earth": "Terre",
    "Dark": "Ténèbres", "Dragon": "Dragon",
}

TERRARIA_EFFECTS = {
    "YakushimaBoss001": [("Puissance de la compétence partenaire", ["×1,1", "×1,3", "×1,6", "×2", "×2,5"])],
    "YakushimaBoss001_Small": [("Attaque des Pals de Ténèbres", ["+15 %", "+17 %", "+20 %", "+24 %", "+30 %"])],
    "YakushimaMonster002": [("Objets obtenus sur les Pals de Ténèbres", ["+40 %", "+50 %", "+60 %", "+70 %", "+80 %"])],
}

# Palworld DB ne structure qu'une des deux progressions de Sekhmet dans sa
# table récapitulative. Les deux effets sont pourtant présents dans la
# description canonique PalDB et suivent chacun leur propre courbe.
STRUCTURED_EFFECT_OVERRIDES = {
    "Sekhmet": [
        ("Vitesse de travail des Anubis", ["+20%", "+24%", "+28%", "+32%", "+40%"]),
        ("Efficacité personnelle de Sekhmet", ["+30%", "+36%", "+42%", "+48%", "+60%"]),
    ],
}


def text_content(fragment: str) -> str:
    fragment = re.sub(r"<script\b.*?</script>", " ", fragment, flags=re.I | re.S)
    fragment = re.sub(r"<style\b.*?</style>", " ", fragment, flags=re.I | re.S)
    fragment = re.sub(r"<[^>]+>", " ", fragment)
    text = re.sub(r"\s+", " ", html.unescape(fragment)).strip()
    return re.sub(r"\s+([.,;:])", r"\1", text)


def parse_french_skills(source: str) -> dict[str, dict[str, str]]:
    result: dict[str, dict[str, str]] = {}
    for block in source.split('<div class="col"><div class="card itemPopup">')[1:]:
        code_match = re.search(r'data-pal-id="([^"]+)"', block)
        skill_match = re.search(r'border-left: solid white"><span class="ms-2">(.*?)</span>\s*Lv\.1', block, re.S)
        if not code_match or not skill_match:
            continue
        code = code_match.group(1)
        if code in result:
            continue
        after_skill = block[skill_match.end():]
        descriptions = re.findall(r'<div class="flex-grow-1 ms-2">(.*?)</div>\s*</div>', after_skill, re.S)
        description = text_content(descriptions[-1]) if descriptions else ""
        description = re.sub(r"\s*Technologies\s+\d+\s*$", "", description).strip()
        result[code] = {
            "name": text_content(skill_match.group(1)),
            "description": description,
        }
    return result


def effect_label(raw: str) -> str | None:
    if raw == "Curve Type" or raw.startswith("Element ") or raw == "Low Gravity":
        return None
    if raw in LABELS_FR:
        return LABELS_FR[raw]
    if raw.startswith("Work Suitability Add Rank "):
        work = raw.removeprefix("Work Suitability Add Rank ")
        work_names = {
            "Collection": "Collecte", "Cool": "Réfrigération", "Deforest": "Abattage",
            "Emit Flame": "Allumage de feu", "Generate Electricity": "Génération d’énergie",
            "Handcraft": "Artisanat", "Mining": "Extraction", "Monster Farm": "Exploitation",
            "Product Medicine": "Pharmacie", "Seeding": "Semence", "Transport": "Transport",
            "Watering": "Arrosage",
        }
        return f"Capacité de travail — {work_names.get(work, work)}"
    for prefix, label in (
        ("Element Add Item Drop ", "Objets obtenus sur les Pals de {element}"),
        ("Element Boost Weakness ", "Dégâts de {element} aux points faibles"),
        ("Additional Effect ", "Chance d’infliger l’effet {element}"),
        ("Resist Additional Effect ", "Résistance à l’effet {element}"),
    ):
        if raw.startswith(prefix):
            element = ELEMENTS_FR.get(raw.removeprefix(prefix), raw.removeprefix(prefix))
            return label.format(element=element)
    if raw.endswith(" Resist"):
        element = ELEMENTS_FR.get(raw.removesuffix(" Resist"), raw.removesuffix(" Resist"))
        return f"Résistance aux dégâts de {element}"
    if raw.startswith("Damage Rate If Defender "):
        state = raw.removeprefix("Damage Rate If Defender ").lower()
        return f"Dégâts sur une cible affectée ({state})"
    return "Valeur de l’effet"


def normalize_values(raw_label: str, values: list[str]) -> list[str]:
    cleaned = [text_content(value).replace("—", "Aucun bonus") for value in values]
    if raw_label == "Max Inventory Weight" or raw_label.startswith("Work Suitability Add Rank "):
        cleaned = [value.removesuffix("%") for value in cleaned]
    if raw_label == "Player Inflict Effect Melee Hit Barrier":
        cleaned = [f"{value.removeprefix('+').removesuffix('%')} s" for value in cleaned]
    return [value.replace(".", ",") for value in cleaned]


def parse_scales(source: str) -> dict[str, list[dict[str, object]]]:
    result: dict[str, list[dict[str, object]]] = {}
    for block in source.split('<div class="pscard">')[1:]:
        code_match = re.search(r'src="/pals/([^"]+)\.png', block)
        if not code_match:
            continue
        effects: list[dict[str, object]] = []
        for row in re.findall(r"<tr>(.*?)</tr>", block, re.S):
            cells = re.findall(r"<td>(.*?)</td>", row, re.S)
            if len(cells) != 6:
                continue
            raw_label = text_content(cells[0])
            label = effect_label(raw_label)
            if label is None:
                continue
            effects.append({
                "label": label,
                "values": normalize_values(raw_label, cells[1:]),
            })
        result[code_match.group(1)] = effects
    return result


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--paldb-fr-html", type=Path, required=True)
    parser.add_argument("--scales-html", type=Path, required=True)
    parser.add_argument("--output", type=Path, default=Path(__file__).resolve().parents[1] / "data" / "partner-skills-fr.json")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    french = parse_french_skills(args.paldb_fr_html.read_text(encoding="utf-8"))
    scales = parse_scales(args.scales_html.read_text(encoding="utf-8"))
    for code, effects in TERRARIA_EFFECTS.items():
        scales[code] = [{"label": label, "values": values} for label, values in effects]
    for code, effects in STRUCTURED_EFFECT_OVERRIDES.items():
        scales[code] = [{"label": label, "values": values} for label, values in effects]

    output = {
        "meta": {
            "localizationSource": "paldb.cc/fr/Partner_Skill, retrieved 2026-08-26",
            "scaleSource": "palworld-db.com/partner-skills, retrieved 2026-08-26",
        },
        "skills": {
            code: {**entry, "effects": scales.get(code, [])}
            for code, entry in sorted(french.items())
        },
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"French skills: {len(french)}; scale entries: {len(scales)}; output: {len(output['skills'])}")


if __name__ == "__main__":
    main()
