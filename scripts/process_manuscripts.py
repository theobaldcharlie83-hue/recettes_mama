"""
Traite les photos brutes du carnet manuscrit (dossier Images/) :
- recadrage automatique de la page (retrait de la nappe en fond)
- amelioration du contraste et de la balance des blancs (CLAHE + gray-world)
- export optimise (pleine page + vignette) dans public/manuscript/

Les photos originales ne sont jamais modifiees.
"""
import os
import cv2
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(ROOT, "Images")
OUT_FULL = os.path.join(ROOT, "public", "manuscript", "full")
OUT_THUMB = os.path.join(ROOT, "public", "manuscript", "thumb")

FULL_MAX_SIDE = 1800
THUMB_MAX_SIDE = 420
JPEG_QUALITY_FULL = 84
JPEG_QUALITY_THUMB = 78


def find_page_crop(img, pad=20):
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    s = hsv[:, :, 1]
    blur = cv2.GaussianBlur(s, (35, 35), 0)
    _, thresh = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    kernel = np.ones((25, 25), np.uint8)
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)

    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        margin_x = int(img.shape[1] * 0.06)
        margin_y = int(img.shape[0] * 0.06)
        return img[margin_y:img.shape[0] - margin_y, margin_x:img.shape[1] - margin_x]

    largest = max(contours, key=cv2.contourArea)
    x, y, w, h = cv2.boundingRect(largest)
    area_ratio = (w * h) / (img.shape[0] * img.shape[1])

    if area_ratio > 0.95 or area_ratio < 0.15:
        margin_x = int(img.shape[1] * 0.06)
        margin_y = int(img.shape[0] * 0.06)
        return img[margin_y:img.shape[0] - margin_y, margin_x:img.shape[1] - margin_x]

    x = max(0, x - pad)
    y = max(0, y - pad)
    w = min(img.shape[1] - x, w + 2 * pad)
    h = min(img.shape[0] - y, h + 2 * pad)
    return img[y:y + h, x:x + w]


def enhance(img):
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l2 = clahe.apply(l)
    lab2 = cv2.merge((l2, a, b))
    result = cv2.cvtColor(lab2, cv2.COLOR_LAB2BGR).astype(np.float32)

    for i in range(3):
        channel = result[:, :, i]
        mean = channel.mean()
        if 0 < mean < 200:
            result[:, :, i] = channel * (200.0 / mean)

    return np.clip(result, 0, 255).astype(np.uint8)


def resize_max_side(img, max_side):
    h, w = img.shape[:2]
    scale = max_side / max(h, w)
    if scale >= 1:
        return img
    return cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)


def process_all():
    os.makedirs(OUT_FULL, exist_ok=True)
    os.makedirs(OUT_THUMB, exist_ok=True)

    files = sorted(f for f in os.listdir(SRC_DIR) if f.lower().endswith(".jpg"))
    print(f"{len(files)} photos a traiter...")

    for i, filename in enumerate(files, 1):
        src_path = os.path.join(SRC_DIR, filename)
        img = cv2.imread(src_path)
        if img is None:
            print(f"[{i}/{len(files)}] {filename} -> ERREUR lecture")
            continue

        cropped = find_page_crop(img)
        enhanced = enhance(cropped)

        full = resize_max_side(enhanced, FULL_MAX_SIDE)
        thumb = resize_max_side(enhanced, THUMB_MAX_SIDE)

        base_name = os.path.splitext(filename)[0] + ".jpg"
        cv2.imwrite(os.path.join(OUT_FULL, base_name), full, [cv2.IMWRITE_JPEG_QUALITY, JPEG_QUALITY_FULL])
        cv2.imwrite(os.path.join(OUT_THUMB, base_name), thumb, [cv2.IMWRITE_JPEG_QUALITY, JPEG_QUALITY_THUMB])

        print(f"[{i}/{len(files)}] {filename} -> {full.shape[1]}x{full.shape[0]} OK")

    print("Termine.")


if __name__ == "__main__":
    process_all()
