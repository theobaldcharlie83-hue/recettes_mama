"""
Remplace le contenu placeholder ("A completer...") des 5 recettes ajoutees
par append_missing.py (ids 48-52) par la transcription reelle des photos
manuscrites, maintenant retrouvees et associees (voir manuscriptImages).
Normalise aussi le champ "image" manquant pour ces 5 recettes.
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RECIPES_PATH = os.path.join(ROOT, "public", "data", "recipes.json")

CONTENT = {
    48: {  # Porc sauté aux nouilles
        "ingredients": "Huile d'olive (4cc), 2 oignons, 200g de haricots verts, 100g de poivrons, 200g de filet mignon de porc, 15g d'ail en poudre, 2 CS de sauce soja salée, 1 cc de vinaigre, 200g de nouilles cuites.",
        "instructions": [
            "Verser l'huile d'olive (4cc) dans un wok. Faire chauffer 3 min sur feu moyen.",
            "Peler et émincer 2 oignons. Couper 200g d'haricots verts en morceaux d'1 centimètre.",
            "Faire revenir les haricots verts et les oignons. Ajouter 100g de poivrons émincés. Faire cuire 10 min.",
            "Ajouter le porc coupé en fines lanières (200g de filet mignon), 15g d'ail en poudre, 2 CS de sauce soja salée, 1 cc de vinaigre et les nouilles cuites (200g) (à cuire au préalable selon les indications du sachet).",
            "Faire sauter pendant une quinzaine de minutes."
        ],
        "tags": ["WW", "Asiatique"],
        "prepTime": "30 min",
        "difficulty": "Facile",
    },
    49: {  # Rouleaux de printemps
        "ingredients": "20g de vermicelles de riz, 100g de germe de soja, 100g de carottes, 35g de crevettes, feuilles de riz, feuilles de menthe, salade (10g), 125ml de sauce pour nem, jus de citron.",
        "instructions": [
            "Mettre une casserole à bouillir. Plonger 20g de vermicelles de riz crus.",
            "Rincer les 100g de germe de soja. Râper 100g de carottes. Couper les 35g de crevettes en 2 dans la longueur.",
            "Mettre 1 feuille de riz dans un bol d'eau tiède pour la ramollir, puis la poser sur un linge.",
            "Déposer au milieu de la feuille de riz 2 feuilles de menthe, 3 demi-crevettes, de la salade (10g), le germe de soja, les carottes râpées (~20g) puis le vermicelle (~10g). Asperger de quelques gouttes de sauce soja salée.",
            "Rabattre un bord de la feuille, ramener les côtés et finir d'enrouler en serrant. Réserver au frais pendant 15 min.",
            "Dans un ramequin, mélanger 125ml de sauce pour nem, 20g de carottes râpées et 15g de jus de citron : la sauce est prête."
        ],
        "tags": ["WW", "Asiatique", "Frais"],
        "prepTime": "45 min",
        "difficulty": "Moyen",
    },
    50: {  # Tomates farcies au boeuf
        "ingredients": "4 grosses tomates, 200g de bœuf haché 5%, 1 gousse d'ail, 1 échalote, 1 oignon, 1 tranche de pain de mie, un peu de lait, 4cc de persil, sel, poivre.",
        "instructions": [
            "Préchauffer le four à 180°C. Découper un chapeau dans les tomates, les évider de leur pulpe.",
            "Dans un récipient, mélanger 200g de bœuf haché 5% avec l'ail (1 gousse), 1 échalote, 1 oignon et 1 tranche de pain de mie (trempée dans du lait chaud et égouttée).",
            "Ajouter 4cc de persil, saler et poivrer. Rajouter un peu de la pulpe des tomates.",
            "Farcir les tomates avec la préparation, les disposer dans un plat à gratin.",
            "Enfourner pour 40 min. Verser un peu d'eau au fond du plat de temps en temps et mouiller les tomates avec le jus pendant la cuisson. Recoiffer les tomates à mi-cuisson."
        ],
        "tags": ["WW", "Four"],
        "prepTime": "1h",
        "difficulty": "Moyen",
    },
    51: {  # Samoussa au thon
        "ingredients": "200g de thon, 6 Vache qui rit (ou Kiri), 1 CS de curry, persil, feuilles de brick, huile.",
        "instructions": [
            "Émietter le thon (200g) et le mélanger avec 6 Vache qui rit (ou Kiri).",
            "Ajouter le curry (1 CS) et le persil, puis mélanger.",
            "Mettre 1 CS de farce sur la feuille de brick.",
            "Plier en triangle et faire dorer dans une poêle avec de l'huile."
        ],
        "tags": ["WW", "Apéritif"],
        "prepTime": "20 min",
        "difficulty": "Facile",
    },
    52: {  # Colombo au porc
        "ingredients": "600g de filet mignon de porc, jus de citron, 2 oignons, 1 gousse d'ail, 1 CS d'huile d'olive, 2 courgettes, 2 CS de colombo, 1 CS de garam masala, 1 pincée de piment, 250g de pommes de terre, riz (facultatif).",
        "instructions": [
            "Couper 600g de filet mignon de porc, mariner avec du jus de citron pendant 2h.",
            "Mettre 2 oignons + 1 gousse d'ail dans le bol du Thermomix. Mélanger 5 sec / vit 5.",
            "Ajouter 1 CS d'huile d'olive + 2 courgettes. Cuire 10 min / 95°C / vit 1.",
            "Ajouter 2 CS de colombo + 1 CS de garam masala.",
            "Ajouter la viande + 1 pincée de piment. Cuire 10 min / 95°C / vit 1.",
            "Cuire 250g de pommes de terre dans la cocotte et les rajouter.",
            "Servir avec du riz si on veut."
        ],
        "tags": ["WW", "Thermomix"],
        "prepTime": "2h30",
        "difficulty": "Moyen",
    },
}


def main():
    with open(RECIPES_PATH, "r", encoding="utf-8") as f:
        recipes = json.load(f)

    updated = 0
    for recipe in recipes:
        data = CONTENT.get(recipe["id"])
        if not data:
            continue
        recipe["ingredients"] = data["ingredients"]
        recipe["instructions"] = data["instructions"]
        recipe["tags"] = data["tags"]
        recipe["prepTime"] = data["prepTime"]
        recipe["difficulty"] = data["difficulty"]
        recipe.setdefault("image", "/default_recipe.png")
        updated += 1

    with open(RECIPES_PATH, "w", encoding="utf-8", newline="\n") as f:
        json.dump(recipes, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"{updated}/5 recettes completees avec leur vrai contenu.")


if __name__ == "__main__":
    main()
