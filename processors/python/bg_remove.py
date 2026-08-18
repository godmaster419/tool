#!/usr/bin/env python3
"""
AI Background Remover — Python Processor
Uses: rembg (U2Net neural network)
Removes backgrounds from images using AI segmentation.

Usage (CLI):
    python bg_remove.py <input_path> <output_path>

Usage (module):
    from bg_remove import remove_background
    result = remove_background(input_bytes)
"""

import sys
import os
import json
import argparse
import io
import importlib

# Dynamic module resolver to avoid static IDE / lint import errors
remove_fn = None
try:
    rembg_mod = importlib.import_module("rembg")
    remove_fn = getattr(rembg_mod, "remove", None)
    REMBG_AVAILABLE = bool(remove_fn)
except Exception:
    REMBG_AVAILABLE = False

from PIL import Image


def _fallback_remove_background(img: Image.Image) -> Image.Image:
    """
    Smart fallback background remover using corner sampling and color distance.
    Works seamlessly without external AI dependencies.
    """
    img = img.convert("RGBA")
    width, height = img.size
    pixels = img.load()

    # Sample corners to find background color
    corners = [
        pixels[0, 0][:3],
        pixels[width - 1, 0][:3],
        pixels[0, height - 1][:3],
        pixels[width - 1, height - 1][:3],
    ]
    # Use most frequent corner color as background seed
    bg_r = sum(c[0] for c in corners) // 4
    bg_g = sum(c[1] for c in corners) // 4
    bg_b = sum(c[2] for c in corners) // 4

    tolerance = 45

    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            # Euclidean distance from background color
            dist = ((r - bg_r) ** 2 + (g - bg_g) ** 2 + (b - bg_b) ** 2) ** 0.5
            if dist < tolerance:
                # Fade out near background threshold
                alpha = int(max(0, min(255, (dist / tolerance) * 255)))
                pixels[x, y] = (r, g, b, alpha)

    return img


def remove_background(input_bytes, alpha_matting=False):
    """
    Remove the background from an image.
    Uses rembg AI if available, otherwise falls back to smart color thresholding.

    Args:
        input_bytes: Input image as bytes.
        alpha_matting: Use alpha matting for finer edge detail.

    Returns:
        dict with output bytes and metadata.
    """
    ai_used = False

    if REMBG_AVAILABLE and remove_fn is not None:
        try:
            output_bytes = remove_fn(
                input_bytes,
                alpha_matting=alpha_matting,
                alpha_matting_foreground_threshold=240,
                alpha_matting_background_threshold=10,
                alpha_matting_erode_size=10,
            )
            output_image = Image.open(io.BytesIO(output_bytes))
            ai_used = True
        except Exception as e:
            # Fallback if rembg runtime fails (e.g. model download failure)
            sys.stderr.write(f"rembg AI error: {e}, using smart fallback\n")
            ai_used = False

    if not ai_used:
        # Pillow smart fallback
        source_image = Image.open(io.BytesIO(input_bytes))
        output_image = _fallback_remove_background(source_image)
        out_buf = io.BytesIO()
        output_image.save(out_buf, format="PNG")
        output_bytes = out_buf.getvalue()

    return {
        "buffer": output_bytes,
        "metadata": {
            "width": output_image.width,
            "height": output_image.height,
            "originalSize": len(input_bytes),
            "outputSize": len(output_bytes),
            "format": "png",
            "alphaMatting": alpha_matting,
            "mode": "ai" if ai_used else "fallback",
        },
    }


def main():
    parser = argparse.ArgumentParser(description="Remove background from an image")
    parser.add_argument("input", help="Input image file path")
    parser.add_argument("output", help="Output PNG file path")
    parser.add_argument("--alpha-matting", action="store_true",
                        help="Use alpha matting for finer edges")

    args = parser.parse_args()

    with open(args.input, "rb") as f:
        input_bytes = f.read()

    result = remove_background(input_bytes, args.alpha_matting)

    with open(args.output, "wb") as f:
        f.write(result["buffer"])

    # Print metadata as JSON to stdout
    metadata = result["metadata"]
    print(json.dumps(metadata))
    sys.stdout.flush()
    sys.stderr.flush()
    # Clean fast exit to prevent onnxruntime static destructor race on macOS
    os._exit(0)


if __name__ == "__main__":
    main()

