import os
from PIL import Image

public_dir = r"c:\STATICODER\MyEdudocs\myedudocs\client\public"

def optimize_image(filename, max_width=None, quality=80):
    filepath = os.path.join(public_dir, filename)
    if not os.path.exists(filepath):
        print(f"File not found: {filename}")
        return

    try:
        with Image.open(filepath) as img:
            # Convert RGBA to RGB if saving as JPEG, but WebP/PNG support transparency.
            # Convert to WebP
            webp_filename = os.path.splitext(filename)[0] + ".webp"
            webp_filepath = os.path.join(public_dir, webp_filename)
            
            # Resize if max_width is specified
            if max_width and img.width > max_width:
                height = int(img.height * (max_width / img.width))
                resized_img = img.resize((max_width, height), Image.Resampling.LANCZOS)
                resized_img.save(webp_filepath, "WEBP", quality=quality)
                # Overwrite original PNG with optimized smaller version
                resized_img.save(filepath, "PNG", optimize=True)
                print(f"Resized and optimized {filename} -> WebP size: {os.path.getsize(webp_filepath)} bytes, PNG size: {os.path.getsize(filepath)} bytes")
            else:
                img.save(webp_filepath, "WEBP", quality=quality)
                img.save(filepath, "PNG", optimize=True)
                print(f"Optimized {filename} -> WebP size: {os.path.getsize(webp_filepath)} bytes, PNG size: {os.path.getsize(filepath)} bytes")
    except Exception as e:
        print(f"Error optimizing {filename}: {e}")

# Optimize stats avatars (they are loaded as tiny 96px avatars)
optimize_image("stats1.png", max_width=192)
optimize_image("stats2.png", max_width=192)
optimize_image("stats3.png", max_width=192)

# Optimize logo images
optimize_image("EduDocsNewLogo.png", max_width=400)
optimize_image("My Edudocs logo.png", max_width=400)
optimize_image("logo.png", max_width=200)

# Optimize other large images
optimize_image("NumberSpeaks.png", max_width=800)
optimize_image("hero-back.png", max_width=1600)
optimize_image("heroback.png", max_width=1600)
optimize_image("image.png", max_width=800)

# Also check for other PNGs in public folder
for f in os.listdir(public_dir):
    if f.lower().endswith(".png") and f not in ["stats1.png", "stats2.png", "stats3.png", "EduDocsNewLogo.png", "My Edudocs logo.png", "logo.png", "NumberSpeaks.png", "hero-back.png", "heroback.png", "image.png"]:
        optimize_image(f, max_width=1000)
