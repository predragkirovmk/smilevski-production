import os
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Pillow library is not installed. Please run: pip install Pillow")
    exit(1)

def optimize_images(input_dir, output_dir, max_size=1920):
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    
    extensions = {'.jpg', '.jpeg', '.png', '.webp'}
    count = 0
    saved_bytes = 0
    
    # Mirror the directory structure and convert images
    for file_path in input_path.rglob('*'):
        if file_path.is_file() and file_path.suffix.lower() in extensions:
            try:
                rel_path = file_path.relative_to(input_path)
                out_file_path = output_path / rel_path.with_suffix('.webp')
                
                # Make sure destination folder exists
                out_file_path.parent.mkdir(parents=True, exist_ok=True)
                
                original_size = file_path.stat().st_size
                
                with Image.open(file_path) as img:
                    # Convert to RGB to avoid issues with transparent PNGs when converting to standard WebP/JPEG
                    if img.mode in ('RGBA', 'P', 'CMYK'):
                        img = img.convert('RGB')
                        
                    # Resize keeping aspect ratio (LANCZOS is high quality downsampling)
                    img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
                    
                    # Save highly optimized WebP file
                    img.save(out_file_path, 'WEBP', quality=80)
                
                new_size = out_file_path.stat().st_size
                saved_bytes += (original_size - new_size)
                count += 1
                
                print(f"✅ {rel_path.name} -> Reduced by {((original_size - new_size) / original_size * 100):.1f}%")
                
            except Exception as e:
                print(f"❌ Failed to process {file_path.name}: {e}")
                
    saved_mb = saved_bytes / (1024 * 1024)
    print("=" * 40)
    print(f"Successfully optimized {count} images.")
    print(f"Saved to: {output_dir}")
    print(f"Total space saved: {saved_mb:.2f} MB")

if __name__ == "__main__":
    # Your current big folder
    input_folder = "/Users/pedza/Desktop/smile"
    
    # We will create a fresh new folder so we don't accidentally ruin your originals
    output_folder = "/Users/pedza/Desktop/smile_optimized"
    
    print(f"Starting image optimization...")
    print(f"Reading from: {input_folder}")
    print(f"Saving to: {output_folder}")
    print("-" * 40)
    
    optimize_images(input_folder, output_folder)
