import os
from rembg import remove
from PIL import Image, ImageEnhance
import io

folder = "public/images/products/laptops/MacBook Air"
files = ["Midnight air 13.png", "silver air 13.png", "Skyblue air 13.png", "starlight air 13.png"]

for f in files:
    input_path = os.path.join(folder, f)
    print(f"Processing {f}...")
    
    with open(input_path, 'rb') as i:
        input_data = i.read()
    
    # Remove background
    output_data = remove(input_data)
    
    # Open with PIL to enhance sharpness
    img = Image.open(io.BytesIO(output_data))
    enhancer = ImageEnhance.Sharpness(img)
    img_sharpened = enhancer.enhance(1.5) # Increase sharpness
    
    # Save back
    img_sharpened.save(input_path)
    print(f"Finished {f}")
