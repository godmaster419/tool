#!/usr/bin/env python3
"""
Video Compressor — Python Processor
Uses: MoviePy + ffmpeg
Compresses video files by adjusting bitrate, resolution, and codec.

Usage (CLI):
    python video_compress.py <input_path> <output_path> [--quality medium] [--max-width 1280]

Usage (module):
    from video_compress import compress_video
    compress_video("input.mp4", "output.mp4", quality="medium")
"""

import sys
import os
import json
import argparse
from moviepy import VideoFileClip


# Quality presets: (video_bitrate, audio_bitrate, max_width)
QUALITY_PRESETS = {
    "low":    ("500k",  "64k",  640),
    "medium": ("1500k", "128k", 1280),
    "high":   ("3000k", "192k", 1920),
    "ultra":  ("5000k", "256k", 3840),
}


def compress_video(input_path, output_path, quality="medium", max_width=None):
    """
    Compress a video file.

    Args:
        input_path: Path to the input video file.
        output_path: Path for the compressed output video.
        quality: Quality preset ("low", "medium", "high", "ultra").
        max_width: Override maximum width in pixels.

    Returns:
        dict with compression metadata.
    """
    preset = QUALITY_PRESETS.get(quality, QUALITY_PRESETS["medium"])
    video_bitrate, audio_bitrate, preset_max_width = preset

    target_width = max_width or preset_max_width

    original_size = os.path.getsize(input_path)

    clip = VideoFileClip(input_path)

    # Resize if video is wider than target
    if clip.w > target_width:
        aspect_ratio = clip.h / clip.w
        new_height = int(target_width * aspect_ratio)
        # Ensure even dimensions for codec compatibility
        new_height = new_height + (new_height % 2)
        clip = clip.resized((target_width, new_height))

    clip.write_videofile(
        output_path,
        codec="libx264",
        audio_codec="aac",
        bitrate=video_bitrate,
        audio_bitrate=audio_bitrate,
        preset="medium",
        threads=4,
        logger=None,  # suppress verbose output
    )

    clip.close()

    compressed_size = os.path.getsize(output_path)

    return {
        "originalSize": original_size,
        "compressedSize": compressed_size,
        "savings": round((1 - compressed_size / original_size) * 100) if original_size > 0 else 0,
        "duration": round(clip.duration, 2),
        "width": clip.w,
        "height": clip.h,
        "quality": quality,
    }


def main():
    parser = argparse.ArgumentParser(description="Compress a video file")
    parser.add_argument("input", help="Input video file path")
    parser.add_argument("output", help="Output video file path")
    parser.add_argument("--quality", default="medium",
                        choices=["low", "medium", "high", "ultra"],
                        help="Quality preset")
    parser.add_argument("--max-width", type=int, default=None,
                        help="Maximum output width in pixels")

    args = parser.parse_args()

    result = compress_video(args.input, args.output, args.quality, args.max_width)
    print(json.dumps(result))


if __name__ == "__main__":
    main()
