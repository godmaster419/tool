#!/usr/bin/env python3
"""
Collage Maker — Python Processor
Uses: Pillow
Creates photo collages from multiple images with configurable layouts.

Usage (CLI):
    python collage_maker.py --images img1.jpg img2.jpg img3.jpg --output collage.jpg --layout grid --cols 3

Usage (module):
    from collage_maker import create_collage
    result = create_collage(image_buffers, layout="grid", cols=3)
"""

import sys
import os
import json
import argparse
import io
from PIL import Image


def create_collage(
    image_buffers,
    layout="grid",
    cols=3,
    spacing=10,
    bg_color=(20, 20, 40),
    cell_width=400,
    cell_height=400,
    border_radius=0,
):
    """
    Create a photo collage from multiple images.

    Args:
        image_buffers: List of image bytes.
        layout: Layout type ("grid", "horizontal", "vertical").
        cols: Number of columns for grid layout.
        spacing: Spacing between images in pixels.
        bg_color: Background color as RGB tuple.
        cell_width: Width of each cell in pixels.
        cell_height: Height of each cell in pixels.

    Returns:
        dict with output bytes and metadata.
    """
    images = []
    for buf in image_buffers:
        img = Image.open(io.BytesIO(buf))
        img = img.convert("RGB")
        images.append(img)

    if not images:
        raise ValueError("No images provided")

    count = len(images)

    if layout == "horizontal":
        cols = count
        rows = 1
    elif layout == "vertical":
        cols = 1
        rows = count
    else:  # grid
        rows = (count + cols - 1) // cols

    canvas_width = cols * cell_width + (cols + 1) * spacing
    canvas_height = rows * cell_height + (rows + 1) * spacing

    canvas = Image.new("RGB", (canvas_width, canvas_height), bg_color)

    for idx, img in enumerate(images):
        row = idx // cols
        col = idx % cols

        # Resize image to fit cell (cover mode)
        img_ratio = img.width / img.height
        cell_ratio = cell_width / cell_height

        if img_ratio > cell_ratio:
            # Image is wider — fit by height
            new_height = cell_height
            new_width = int(new_height * img_ratio)
        else:
            # Image is taller — fit by width
            new_width = cell_width
            new_height = int(new_width / img_ratio)

        img_resized = img.resize((new_width, new_height), Image.LANCZOS)

        # Center crop to cell size
        left = (new_width - cell_width) // 2
        top = (new_height - cell_height) // 2
        img_cropped = img_resized.crop(
            (left, top, left + cell_width, top + cell_height)
        )

        x = spacing + col * (cell_width + spacing)
        y = spacing + row * (cell_height + spacing)

        canvas.paste(img_cropped, (x, y))

    # Save to buffer
    output = io.BytesIO()
    canvas.save(output, format="JPEG", quality=92)
    output_bytes = output.getvalue()

    return {
        "buffer": output_bytes,
        "metadata": {
            "width": canvas_width,
            "height": canvas_height,
            "imageCount": count,
            "layout": layout,
            "cols": cols,
            "rows": rows,
            "size": len(output_bytes),
        },
    }


def main():
    parser = argparse.ArgumentParser(description="Create a photo collage")
    parser.add_argument("--images", nargs="+", required=True, help="Input image paths")
    parser.add_argument("--output", required=True, help="Output collage path")
    parser.add_argument("--layout", default="grid", choices=["grid", "horizontal", "vertical"])
    parser.add_argument("--cols", type=int, default=3, help="Columns for grid layout")
    parser.add_argument("--spacing", type=int, default=10, help="Spacing between images")
    parser.add_argument("--cell-width", type=int, default=400, help="Cell width in pixels")
    parser.add_argument("--cell-height", type=int, default=400, help="Cell height in pixels")

    args = parser.parse_args()

    image_buffers = []
    for path in args.images:
        with open(path, "rb") as f:
            image_buffers.append(f.read())

    result = create_collage(
        image_buffers,
        layout=args.layout,
        cols=args.cols,
        spacing=args.spacing,
        cell_width=args.cell_width,
        cell_height=args.cell_height,
    )

    with open(args.output, "wb") as f:
        f.write(result["buffer"])

    print(json.dumps(result["metadata"]))


if __name__ == "__main__":
    main()
