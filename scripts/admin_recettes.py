import json
import os

FILE_PATH = "public/data/recipes.json"

def load_recipes():
    if not os.path.exists(FILE_PATH):
        return []
    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_recipes(recipes):
    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        json.dump(recipes, f, ensure_ascii=False, indent=2)

def main():
    while True:
        recipes = load_recipes()
        print(f"\n--- Recettes de Mama ({len(recipes)} recettes) ---")
        print("1. Lister les recettes")
        print("2. Ajouter une recette")
        print("3. Quitter")
        
        choice = input("Choix: ")
        
        if choice == '1':
            for r in recipes:
                print(f"[{r.get('id', '?')}] {r.get('title')} ({r.get('chapter')})")
        
        elif choice == '2':
            title = input("Titre: ")
            chapter = input("Chapitre (ex: Plats de Résistance): ")
            ingredients = input("Ingrédients (\\n pour retour ligne): ").replace("\\n", "\n")
            
            # Instructions: multiple lines
            print("Instructions (vide pour terminer):")
            instructions = []
            while True:
                step = input(f"Etape {len(instructions)+1}: ")
                if not step:
                    break
                instructions.append(step)
                
            tags_input = input("Tags (séparés par virgule, ex: WW,Thermomix): ")
            tags = [t.strip() for t in tags_input.split(',')] if tags_input else []
            
            prep_time = input("Temps de préparation (min): ")
            difficulty = input("Difficulté (Facile/Moyen/Difficile): ")
            
            new_id = max([r.get('id', 0) for r in recipes], default=0) + 1
            
            recipes.append({
                "id": new_id,
                "title": title,
                "chapter": chapter,
                "ingredients": ingredients,
                "instructions": instructions,
                "tags": tags,
                "prepTime": prep_time,
                "difficulty": difficulty
            })
            save_recipes(recipes)
            print("=> Recette ajoutée avec succès!")
            
        elif choice == '3':
            break

if __name__ == "__main__":
    main()
