import pytesseract
from PIL import Image

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

files = [
    r"C:\Users\Charlie\.gemini\antigravity\brain\f8db001f-b3f1-47ef-b345-e34820d9d43f\uploaded_media_1771691516847.img",
    r"C:\Users\Charlie\.gemini\antigravity\brain\f8db001f-b3f1-47ef-b345-e34820d9d43f\uploaded_media_1771693341076.img"
]

for f in files:
    print(f"--- OCR for {f} ---")
    try:
        text = pytesseract.image_to_string(Image.open(f), lang='fra')
        print(text)
    except Exception as e:
        print(f"Error: {e}")
    print("\n")
