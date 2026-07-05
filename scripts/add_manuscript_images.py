"""
Associe les photos manuscrites traitees (public/manuscript/full|thumb/*.jpg)
aux recettes de public/data/recipes.json via un champ "manuscriptImages"
(liste de noms de fichiers, communs aux dossiers full/ et thumb/).

Le mapping a ete etabli par lecture visuelle de chaque photo (l'OCR
automatique etait inexploitable sur cette ecriture manuscrite).
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RECIPES_PATH = os.path.join(ROOT, "public", "data", "recipes.json")

ID_TO_FILES = {
    1: ["20251214_114002.jpg"],
    2: ["20251214_113958.jpg"],
    3: ["20251214_114013.jpg"],
    4: ["20251214_114059.jpg"],
    5: ["20251214_113412.jpg"],
    6: ["20251214_113241.jpg"],
    7: ["20251214_114018.jpg"],
    8: ["20251214_113353.jpg"],
    9: ["20251214_113435.jpg"],
    10: ["20251214_113359.jpg"],
    11: ["20251214_113212.jpg"],
    12: ["20251214_113235.jpg"],
    13: ["20251214_113200.jpg"],
    14: ["20251214_113141.jpg"],
    15: ["20251214_114125.jpg"],
    16: ["20251214_114055.jpg"],
    17: ["20251214_113347.jpg"],
    18: ["20251214_114026.jpg"],
    19: ["20251214_114114.jpg", "20251214_113229.jpg"],
    20: ["20251214_113155.jpg"],
    21: ["20251214_113217.jpg"],
    22: ["20251214_113149.jpg"],
    23: ["20251214_113205.jpg"],
    24: ["20251214_113835.jpg"],
    25: ["20251214_114049.jpg"],
    26: ["20251214_113322.jpg"],
    27: ["20251214_113340.jpg"],
    28: ["20251214_113811.jpg"],
    29: ["20251214_113816.jpg"],
    30: ["20251214_113828.jpg"],
    31: ["20251214_113223.jpg"],
    32: ["20251214_113405.jpg"],
    33: ["20251214_114131.jpg"],
    34: ["20251214_113328.jpg"],
    35: ["20251214_113333.jpg"],
    36: ["20251214_114037.jpg"],
    37: ["20251214_113423.jpg"],
    38: ["20251214_114137.jpg"],
    39: ["20251214_114043.jpg"],
    40: ["20251214_114031.jpg"],
    41: ["20251214_113843.jpg"],
    42: ["20251214_113952.jpg"],
    43: ["20251214_114108.jpg"],
    44: ["20251214_113417.jpg"],
    45: ["20251214_113429.jpg"],
    46: ["20251214_113822.jpg"],
    47: ["20251214_113946.jpg"],
    48: ["20251214_113849.jpg"],
    49: ["20251214_113856.jpg"],
    50: ["20251214_113902.jpg"],
    51: ["20251214_113918.jpg"],
    52: ["20251214_113939.jpg"],
}


def main():
    with open(RECIPES_PATH, "r", encoding="utf-8") as f:
        recipes = json.load(f)

    missing = []
    for recipe in recipes:
        files = ID_TO_FILES.get(recipe["id"])
        if not files:
            missing.append((recipe["id"], recipe["title"]))
            continue
        recipe["manuscriptImages"] = files

    if missing:
        print("ATTENTION, recettes sans photo associee:")
        for rid, title in missing:
            print(f"  id={rid} title={title}")

    with open(RECIPES_PATH, "w", encoding="utf-8", newline="\n") as f:
        json.dump(recipes, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"{len(recipes) - len(missing)}/{len(recipes)} recettes mises a jour avec manuscriptImages.")


if __name__ == "__main__":
    main()
