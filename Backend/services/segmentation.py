import cv2
import numpy as np
from PIL import Image


def detect_surface_mask(image_path: str):
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError('Invalid image file')

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (7, 7), 0)
    edges = cv2.Canny(blurred, 40, 120)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (11, 11))
    closed = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel, iterations=3)
    contours, _ = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    mask = np.zeros_like(gray, dtype=np.uint8)
    detected = False

    if contours:
        largest = max(contours, key=cv2.contourArea)
        area = cv2.contourArea(largest)
        image_area = gray.shape[0] * gray.shape[1]
        if area > image_area * 0.03:
            hull = cv2.convexHull(largest)
            cv2.drawContours(mask, [hull], -1, 255, cv2.FILLED)
            mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=2)
            detected = True

    if not detected:
        height, width = gray.shape
        x0 = width // 8
        y0 = height // 8
        x1 = width * 7 // 8
        y1 = height * 7 // 8
        cv2.rectangle(mask, (x0, y0), (x1, y1), 255, cv2.FILLED)

    mask = cv2.GaussianBlur(mask, (11, 11), 0)
    return Image.fromarray(mask).convert('L'), detected
