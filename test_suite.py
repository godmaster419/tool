#!/usr/bin/env python3
"""
Comprehensive Media Suite Test Runner
Tests Python processors and Next.js API endpoints.
"""

import os
import sys
import io
import json
import time
import requests
from PIL import Image, ImageDraw

BASE_URL = "http://localhost:3000"

def generate_test_image(filename="test_sample.png", width=400, height=300, color=(120, 80, 220)):
    """Generate a sample PNG image."""
    img = Image.new("RGBA", (width, height), color)
    draw = ImageDraw.Draw(img)
    draw.rectangle([50, 50, 350, 250], fill=(255, 100, 100, 255), outline=(255, 255, 255, 255), width=4)
    draw.ellipse([100, 80, 300, 220], fill=(50, 200, 120, 255))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()

def generate_test_jpg(filename="test_sample.jpg", width=400, height=300):
    """Generate a sample JPG image."""
    img = Image.new("RGB", (width, height), (70, 140, 240))
    draw = ImageDraw.Draw(img)
    draw.text((100, 140), "TEST MEDIA", fill=(255, 255, 255))
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=90)
    return buf.getvalue()

def test_api_endpoint(name, method, path, files=None, data=None, expected_status=200):
    """Test an HTTP API endpoint."""
    url = f"{BASE_URL}{path}"
    try:
        if method == "POST":
            res = requests.post(url, files=files, data=data, timeout=30)
        else:
            res = requests.get(url, timeout=10)
        
        status_ok = res.status_code == expected_status
        content_type = res.headers.get("content-type", "")
        content_length = len(res.content)
        
        print(f"[{'PASS' if status_ok else 'FAIL'}] {name} ({path}): HTTP {res.status_code} | Type: {content_type} | Size: {content_length} bytes")
        return status_ok
    except Exception as e:
        print(f"[ERROR] {name} ({path}): {e}")
        return False

def main():
    print("=" * 60)
    print("MEDIA SUITE — AUTOMATED SYSTEM VERIFICATION")
    print("=" * 60)

    sample_png = generate_test_image()
    sample_jpg = generate_test_jpg()

    passed = 0
    total = 0

    # 1. Test Static Pages
    pages = [
        ("Home Page", "/"),
        ("Tools Directory", "/tools"),
        ("Background Remover Page", "/tools/advanced/bg-remove"),
        ("Meme Generator Page", "/tools/advanced/meme"),
        ("Collage Maker Page", "/tools/advanced/collage"),
        ("Image Resizer Page", "/tools/image/resize"),
        ("Image Crop Page", "/tools/image/crop"),
        ("Image Compress Page", "/tools/image/compress"),
        ("OCR Image Page", "/tools/ocr/image-to-text"),
        ("PDF Compress Page", "/tools/pdf/compress"),
    ]

    print("\n--- 1. Testing Page Routes ---")
    for name, path in pages:
        total += 1
        if test_api_endpoint(name, "GET", path):
            passed += 1

    # 2. Test Image Processing API Endpoints
    print("\n--- 2. Testing Image APIs ---")
    
    # Resize
    total += 1
    if test_api_endpoint("Resize API", "POST", "/api/image/resize", 
                         files={"file": ("sample.png", sample_png, "image/png")},
                         data={"width": "200", "height": "150", "maintainAspect": "true"}):
        passed += 1

    # Crop
    total += 1
    if test_api_endpoint("Crop API", "POST", "/api/image/crop",
                         files={"file": ("sample.png", sample_png, "image/png")},
                         data={"x": "10", "y": "10", "width": "100", "height": "100"}):
        passed += 1

    # Flip
    total += 1
    if test_api_endpoint("Flip API", "POST", "/api/image/flip",
                         files={"file": ("sample.png", sample_png, "image/png")},
                         data={"direction": "horizontal"}):
        passed += 1

    # Rotate
    total += 1
    if test_api_endpoint("Rotate API", "POST", "/api/image/rotate",
                         files={"file": ("sample.png", sample_png, "image/png")},
                         data={"angle": "90"}):
        passed += 1

    # Enlarge
    total += 1
    if test_api_endpoint("Enlarge API", "POST", "/api/image/enlarge",
                         files={"file": ("sample.png", sample_png, "image/png")},
                         data={"scale": "2"}):
        passed += 1

    # Compress
    total += 1
    if test_api_endpoint("Compress API", "POST", "/api/image/compress",
                         files={"file": ("sample.jpg", sample_jpg, "image/jpeg")},
                         data={"quality": "75"}):
        passed += 1

    # Color Picker
    total += 1
    if test_api_endpoint("Color Picker API", "POST", "/api/image/color-picker",
                         files={"file": ("sample.png", sample_png, "image/png")}):
        passed += 1

    # Conversions
    total += 1
    if test_api_endpoint("PNG to JPG API", "POST", "/api/convert/png-to-jpg",
                         files={"file": ("sample.png", sample_png, "image/png")}):
        passed += 1

    total += 1
    if test_api_endpoint("JPG to PNG API", "POST", "/api/convert/jpg-to-png",
                         files={"file": ("sample.jpg", sample_jpg, "image/jpeg")}):
        passed += 1

    # 3. Test Advanced Python-Powered Tools
    print("\n--- 3. Testing Advanced & Creative APIs ---")
    
    # Meme Generator
    total += 1
    if test_api_endpoint("Meme Generator API", "POST", "/api/advanced/meme",
                         files={"file": ("sample.jpg", sample_jpg, "image/jpeg")},
                         data={"topText": "HELLO", "bottomText": "WORLD"}):
        passed += 1

    # Collage Maker
    total += 1
    if test_api_endpoint("Collage Maker API", "POST", "/api/advanced/collage",
                         files=[("files", ("img1.jpg", sample_jpg, "image/jpeg")),
                                ("files", ("img2.jpg", sample_jpg, "image/jpeg"))],
                         data={"layout": "grid", "cols": "2"}):
        passed += 1

    # AI Background Remover
    total += 1
    if test_api_endpoint("AI Background Remover API", "POST", "/api/advanced/bg-remove",
                         files={"file": ("sample.png", sample_png, "image/png")}):
        passed += 1

    print("\n" + "=" * 60)
    print(f"RESULTS: {passed} / {total} Tests Passed ({passed/total*100:.1f}%)")
    print("=" * 60)

if __name__ == "__main__":
    main()
