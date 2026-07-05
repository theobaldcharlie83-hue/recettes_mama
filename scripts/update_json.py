import json

def update_recipes():
    with open("public/data/recipes.json", "r", encoding="utf-8") as f:
        recipes = json.load(f)

    for i, r in enumerate(recipes):
        r["id"] = i + 1
        if "image" not in r:
            r["image"] = "/default_recipe.png"
        if "prepTime" not in r:
            r["prepTime"] = "15" # Valeur par défaut
        if "difficulty" not in r:
            r["difficulty"] = "Facile" # Valeur par défaut

    with open("public/data/recipes.json", "w", encoding="utf-8") as f:
        json.dump(recipes, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    update_recipes()
    print("Recipes updated!")
