import os
import pytesseract
from PIL import Image

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

image_dir = r"C:\Users\Charlie\desktop\Charlie\Livre recettes Mag\Images"
output_file = "ocr_dump.txt"

with open(output_file, "w", encoding="utf-8") as f:
    for filename in sorted(os.listdir(image_dir)):
        if filename.endswith(".jpg"):
            path = os.path.join(image_dir, filename)
            try:
                text = pytesseract.image_to_string(Image.open(path), lang='fra')
                f.write(f"--- {filename} ---\n")
                f.write(text + "\n\n")
            except Exception as e:
                f.write(f"--- {filename} ERROR ---\n{e}\n\n")

print("OCR dump complete.", flush=True)
