#!/usr/bin/env python3
"""Crop, resize and encode a photo into one of the site's image slots.

Every slot on the site has a fixed filename and a fixed aspect ratio. The HTML
references both a .webp and a .jpg for each one via <picture>, and the browser
prefers the WebP — so replacing only the .jpg leaves the old photo on screen.
Worse, a <source> pointing at a missing WebP does NOT fall back to the <img>;
the image simply fails. This script always writes both, so neither trap applies.

Usage
-----
    pip install Pillow
    python3 docs/prepare-photo.py <source-image> <slot> [--zoom 1.4] [--focus 50,35]

    <slot>   one of: hero, editorial, gallery-fullbody, gallery-field,
                     gallery-coach, community-band, og-image
    --zoom   >1 crops tighter on the subject. Use when the subject is small in
             frame. 1.0 = fit the whole frame to the slot's aspect ratio.
    --focus  x,y percentage of the ORIGINAL image to keep centred, default
             50,50. A standing subject usually wants a lower y (e.g. 50,60);
             a head-and-shoulders crop wants a higher one (e.g. 50,25).

Example — a full-length outdoor shot where the subject is small, going into the
wide editorial band, zoomed in and centred slightly below the middle:

    python3 docs/prepare-photo.py ~/lake.jpg editorial --zoom 1.8 --focus 50,62
"""
import argparse
import os
import sys

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit("Pillow is not installed. Run:  pip install Pillow")

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "img")

# name -> (width, height). 2x the CSS display size where the slot is small, so
# it stays sharp on a phone screen.
SLOTS = {
    "hero":             (1000, 1334),   # 3:4 portrait
    "editorial":        (1400, 1867),   # 3:4 portrait, displayed as a wide band
    "gallery-fullbody": (800, 1000),    # 4:5 portrait
    "gallery-field":    (1200, 675),    # 16:9
    "gallery-coach":    (600, 600),     # 1:1
    "community-band":   (1600, 667),    # ~2.4:1
    "og-image":         (1200, 630),    # social card, fixed by the platforms
}


def build(src_path, slot, zoom, focus):
    w, h = SLOTS[slot]
    im = Image.open(src_path)
    im = ImageOps.exif_transpose(im)          # honour the rotation flag
    im = im.convert("RGB")                     # drop alpha, normalise HEIC/PNG

    fx, fy = focus
    target_ratio = w / h
    sw, sh = im.size

    # Largest box of the target aspect ratio that fits, then divided by zoom.
    if sw / sh > target_ratio:
        box_h = sh / zoom
        box_w = box_h * target_ratio
    else:
        box_w = sw / zoom
        box_h = box_w / target_ratio

    box_w, box_h = min(box_w, sw), min(box_h, sh)

    # Centre the box on the focus point, then push it back inside the image.
    cx, cy = sw * fx / 100.0, sh * fy / 100.0
    left = max(0, min(cx - box_w / 2, sw - box_w))
    top = max(0, min(cy - box_h / 2, sh - box_h))

    im = im.crop((round(left), round(top), round(left + box_w), round(top + box_h)))
    im = im.resize((w, h), Image.LANCZOS)

    jpg = os.path.join(ROOT, slot + ".jpg")
    webp = os.path.join(ROOT, slot + ".webp")
    im.save(jpg, "JPEG", quality=82, optimize=True, progressive=True)
    im.save(webp, "WEBP", quality=80, method=6)

    for p in (jpg, webp):
        print(f"  wrote {os.path.relpath(p, os.path.join(ROOT, '..', '..'))}"
              f"  {w}x{h}  {os.path.getsize(p)/1024:.0f} KB")


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("source")
    ap.add_argument("slot", choices=sorted(SLOTS))
    ap.add_argument("--zoom", type=float, default=1.0)
    ap.add_argument("--focus", default="50,50")
    a = ap.parse_args()

    if a.zoom < 1.0:
        sys.exit("--zoom must be 1.0 or greater (1.0 = no crop-in).")
    try:
        fx, fy = (float(v) for v in a.focus.split(","))
    except ValueError:
        sys.exit("--focus must look like 50,60")
    if not (0 <= fx <= 100 and 0 <= fy <= 100):
        sys.exit("--focus values are percentages, 0-100.")
    if not os.path.exists(a.source):
        sys.exit(f"No such file: {a.source}")

    print(f"{a.slot}  <-  {a.source}  (zoom {a.zoom}, focus {a.focus})")
    build(a.source, a.slot, a.zoom, (fx, fy))
    print("\nBoth .jpg and .webp written. Commit both, or the browser keeps "
          "showing the old photo from the stale WebP.")


if __name__ == "__main__":
    main()
