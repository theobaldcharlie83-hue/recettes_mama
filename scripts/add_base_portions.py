"""
Ajoute un champ "basePortions" aux recettes pour lesquelles le nombre de
portions/parts de base est explicitement indique sur la page manuscrite
(ex: "pour 4", "6 pers", "x30", "~12 cookies"). Necessaire pour que le
recalcul des ingredients selon les portions choisies parte de la bonne base
au lieu d'un 4 fixe pour toutes les recettes.

Les recettes dont la page manuscrite n'indique pas de nombre clair (sauces,
techniques, recettes au poids) ne recoivent pas ce champ : l'app retombe
alors sur une base par defaut (4) sans rien casser.
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RECIPES_PATH = os.path.join(ROOT, "public", "data", "recipes.json")

ID_TO_BASE_PORTIONS = {
    6: 4,    # Velouté aux Poivrons et au Boursin
    7: 6,    # Soupe de Légumes
    8: 4,    # Tarte Fine Courgettes/Chèvre
    10: 6,   # Clafoutis Salé au Chèvre
    11: 4,   # Clafoutis de Tomates au Jambon
    12: 4,   # Soufflé de Butternut
    13: 4,   # Gratin de Courgettes
    14: 4,   # Ratatouille
    15: 6,   # Tian Provençal
    16: 4,   # Courgettes/Feta rôtie
    17: 4,   # Jardinière
    18: 4,   # Gratin de Butternut
    19: 6,   # Lasagnes épinard/Ricotta
    20: 4,   # Pot au feu
    21: 4,   # Porc au caramel
    22: 2,   # Grillade de riz
    24: 4,   # Poulet tikka Massala
    25: 6,   # Lasagne bolognaise
    26: 4,   # Hachis au potimarron
    27: 4,   # Tartiflette
    30: 4,   # Fondue de poireaux au saumon (WW)
    31: 6,   # Gâteau au yaourt
    32: 11,  # Fondant au chocolat (pour 11 fondants)
    33: 8,   # Tarte banane/chocolat
    34: 6,   # Tarte pralinées
    36: 6,   # Tarte aux pommes
    38: 15,  # Madeleines au yaourt (~15 madeleines)
    39: 14,  # Mandises (x14)
    40: 12,  # Cookies (~12 cookies)
    41: 16,  # Cake à la banane (WW) (16 parts)
    42: 14,  # Cake à la banane (Léger) (14 parts)
    43: 9,   # Gaufres (8 à 10 gaufres)
    44: 30,  # Crêpes (x30)
    48: 4,   # Porc sauté aux nouilles
    49: 4,   # Rouleaux de printemps
}


def main():
    with open(RECIPES_PATH, "r", encoding="utf-8") as f:
        recipes = json.load(f)

    updated = 0
    for recipe in recipes:
        base = ID_TO_BASE_PORTIONS.get(recipe["id"])
        if base:
            recipe["basePortions"] = base
            updated += 1

    with open(RECIPES_PATH, "w", encoding="utf-8", newline="\n") as f:
        json.dump(recipes, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"{updated}/{len(recipes)} recettes mises a jour avec basePortions.")


if __name__ == "__main__":
    main()
