import json

file_path = "public/data/recipes.json"

try:
    with open(file_path, "r", encoding="utf-8") as f:
        recipes = json.load(f)
except FileNotFoundError:
    print("recipes.json not found!")
    exit(1)

max_id = max([r.get('id', 0) for r in recipes], default=0)

missing_recipes = [
    {"title": "Porc sauté aux nouilles", "chapter": "Plats de Résistance"},
    {"title": "Rouleaux de printemps", "chapter": "Entrées et Apéros"},
    {"title": "Tomates farcies au boeuf", "chapter": "Plats de Résistance"},
    {"title": "Samoussa au thon", "chapter": "Entrées et Apéros"},
    {"title": "Colombo au porc", "chapter": "Plats de Résistance"}
]

added_count = 0
for item in missing_recipes:
    if any(r.get("title") == item["title"] for r in recipes):
        continue
    
    max_id += 1
    new_recipe = {
        "id": max_id,
        "title": item["title"],
        "chapter": item["chapter"],
        "ingredients": "À compléter...",
        "instructions": ["À compléter..."],
        "tags": ["À compléter"],
        "prepTime": "?",
        "difficulty": "?"
    }
    recipes.append(new_recipe)
    added_count += 1
    print(f"Added missing recipe: {item['title']}")

# Fix typo in Porc au caramel
typo_fixed = False
for r in recipes:
    if r.get("title") == "Porc au caramel" and isinstance(r.get("ingredients"), str):
        if "nloc" in r["ingredients"]:
            r["ingredients"] = r["ingredients"].replace("nloc", "nuoc")
            typo_fixed = True
            print("Fixed typo 'nloc' -> 'nuoc' in Porc au caramel")

if added_count > 0 or typo_fixed:
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(recipes, f, ensure_ascii=False, indent=2)
    print("Saved recipes.json successfully.")
else:
    print("No changes needed in recipes.json.")
