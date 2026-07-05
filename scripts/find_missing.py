import os
import pytesseract
from PIL import Image
import sys

# Define path to tesseract.exe in case it's not in PATH
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

image_dir = r"C:\Users\Charlie\desktop\Charlie\Livre recettes Mag\Images"

targets = {
    "nouille": "Porc sauté aux nouilles",
    "printemps": "Rouleaux de printemps",
    "tomates farci": "Tomates farcies au boeuf",
    "farcies": "Tomates farcies au boeuf",
    "samoussa": "Samoussa au thon",
    "colombo": "Colombo au porc"
}

found = {}

print("Scanning images...", flush=True)

try:
    for filename in os.listdir(image_dir):
        if filename.endswith(".jpg"):
            path = os.path.join(image_dir, filename)
            print(f"Checking {filename}...", flush=True)
            text = pytesseract.image_to_string(Image.open(path), lang='fra').lower()
            
            for keyword, title in targets.items():
                if keyword in text and title not in found:
                    found[title] = filename
                    print(f"  --> MATcH: [{filename}] looks like: {title}", flush=True)
except Exception as e:
    print(f"Error: {e}", flush=True)

print("\n--- RESULTS ---", flush=True)
for title, filename in found.items():
    print(f"{title}: {filename}", flush=True)
