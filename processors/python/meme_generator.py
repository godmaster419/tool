#!/usr/bin/env python3
"""
Meme Generator — Python Processor
Uses: Pillow
Creates memes with customizable text overlays on images.

Usage (CLI):
    python meme_generator.py <input_path> <output_path> --top "TOP TEXT" --bottom "BOTTOM TEXT"

Usage (module):
    from meme_generator import generate_meme
    result = generate_meme(input_bytes, top_text="TOP", bottom_text="BOTTOM")
"""

import sys
import os
import json
import argparse
import io
from PIL import Image, ImageDraw, ImageFont


def get_font(size):
    """Get a bold font, falling back to default if Impact is not available."""
    font_paths = [
        "/usr/share/fonts/truetype/msttcorefonts/Impact.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/System/Library/Fonts/Supplemental/Impact.ttf",
        "/Library/Fonts/Impact.ttf",
        "C:\\Windows\\Fonts\\impact.ttf",
    ]

    for path in font_paths:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)

    # Fallback to default font
    try:
        return ImageFont.truetype("DejaVuSans-Bold.ttf", size)
    except (OSError, IOError):
        return ImageFont.load_default()


def draw_text_with_outline(draw, position, text, font, fill="white", outline="black", outline_width=3):
    """Draw text with an outline for readability."""
    x, y = position

    # Draw outline
    for dx in range(-outline_width, outline_width + 1):
        for dy in range(-outline_width, outline_width + 1):
            if dx != 0 or dy != 0:
                draw.text((x + dx, y + dy), text, font=font, fill=outline)

    # Draw main text
    draw.text((x, y), text, font=font, fill=fill)


def generate_meme(
    input_bytes,
    top_text="",
    bottom_text="",
    font_size_ratio=0.08,
    text_color="white",
    outline_color="black",
):
    """
    Generate a meme from an image with top and bottom text.

    Args:
        input_bytes: Input image as bytes.
        top_text: Text for the top of the image.
        bottom_text: Text for the bottom of the image.
        font_size_ratio: Font size as ratio of image height.
        text_color: Text fill color.
        outline_color: Text outline color.

    Returns:
        dict with output bytes and metadata.
    """
    img = Image.open(io.BytesIO(input_bytes)).convert("RGB")
    draw = ImageDraw.Draw(img)

    font_size = max(int(img.height * font_size_ratio), 20)
    font = get_font(font_size)

    padding = int(img.height * 0.02)

    # Draw top text (centered)
    if top_text:
        text_upper = top_text.upper()
        bbox = draw.textbbox((0, 0), text_upper, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        x = (img.width - text_width) // 2
        y = padding

        draw_text_with_outline(draw, (x, y), text_upper, font, text_color, outline_color)

    # Draw bottom text (centered)
    if bottom_text:
        text_upper = bottom_text.upper()
        bbox = draw.textbbox((0, 0), text_upper, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        x = (img.width - text_width) // 2
        y = img.height - text_height - padding * 2

        draw_text_with_outline(draw, (x, y), text_upper, font, text_color, outline_color)

    # Save to buffer
    output = io.BytesIO()
    img.save(output, format="JPEG", quality=92)
    output_bytes = output.getvalue()

    return {
        "buffer": output_bytes,
        "metadata": {
            "width": img.width,
            "height": img.height,
            "topText": top_text,
            "bottomText": bottom_text,
            "size": len(output_bytes),
        },
    }


def main():
    parser = argparse.ArgumentParser(description="Generate a meme")
    parser.add_argument("input", help="Input image file path")
    parser.add_argument("output", help="Output meme file path")
    parser.add_argument("--top", default="", help="Top text")
    parser.add_argument("--bottom", default="", help="Bottom text")
    parser.add_argument("--font-size", type=float, default=0.08,
                        help="Font size as ratio of image height")

    args = parser.parse_args()

    with open(args.input, "rb") as f:
        input_bytes = f.read()

    result = generate_meme(
        input_bytes,
        top_text=args.top,
        bottom_text=args.bottom,
        font_size_ratio=args.font_size,
    )

    with open(args.output, "wb") as f:
        f.write(result["buffer"])

    print(json.dumps(result["metadata"]))


if __name__ == "__main__":
    main()
