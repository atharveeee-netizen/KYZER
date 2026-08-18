"""
Clinical Paper Register Image Preprocessing Pipeline for Rural Field Conditions.
Applies:
1. Auto-Deskewing (Orientation Normalization)
2. Contrast-Limited Adaptive Histogram Equalization (CLAHE for Shadow Removal)
3. Non-Local Means Denoising (Smoothing camera sensor noise on budget smartphones)
4. Adaptive Threshold Sharpening for Handwritten Ink Enhancement
"""

import logging
import numpy as np
from typing import Tuple, Optional

try:
    import cv2
    HAS_CV2 = True
except ImportError:
    HAS_CV2 = False

logger = logging.getLogger("ai_engine.ocr.preprocessor")

class ClinicRegisterImagePreprocessor:
    """Robust image enhancer for messy rural clinic registers."""

    @staticmethod
    def preprocess_image_bytes(image_bytes: bytes) -> bytes:
        """
        Enhances raw camera photo bytes into high-contrast, deskewed OCR-ready JPEG bytes.
        """
        if not HAS_CV2 or not image_bytes:
            return image_bytes

        try:
            # 1. Decode byte buffer into OpenCV BGR image
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img is None:
                return image_bytes

            h, w = img.shape[:2]

            # 2. Auto-Deskew (Rotate to align text rows horizontally)
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            # Threshold to detect black handwriting
            _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
            coords = np.column_stack(np.where(thresh > 0))
            if len(coords) > 50:
                angle = cv2.minAreaRect(coords)[-1]
                if angle < -45:
                    angle = 90 + angle
                elif angle > 45:
                    angle = angle - 90
                # Only rotate if minor tilt (1 to 25 degrees)
                if 0.5 < abs(angle) < 25.0:
                    center = (w // 2, h // 2)
                    M = cv2.getRotationMatrix2D(center, angle, 1.0)
                    img = cv2.warpAffine(img, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

            # 3. Contrast-Limited Adaptive Histogram Equalization (CLAHE)
            lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
            l_channel, a_channel, b_channel = cv2.split(lab)
            clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
            cl = clahe.apply(l_channel)
            merged = cv2.merge((cl, a_channel, b_channel))
            enhanced_bgr = cv2.cvtColor(merged, cv2.COLOR_LAB2BGR)

            # 4. Bilateral Filter Denoising (Preserves sharp handwritten pen edges while removing paper grain)
            denoised = cv2.bilateralFilter(enhanced_bgr, d=7, sigmaColor=50, sigmaSpace=50)

            # 5. Encode back to JPEG bytes with 95% quality
            success, encoded_jpg = cv2.imencode(".jpg", denoised, [int(cv2.IMWRITE_JPEG_QUALITY), 95])
            if success:
                logger.info(f"Successfully preprocessed register image: deskewed & CLAHE enhanced ({w}x{h}).")
                return encoded_jpg.tobytes()
            return image_bytes

        except Exception as e:
            logger.warning(f"Image preprocessing fallback to raw bytes ({e}).")
            return image_bytes
