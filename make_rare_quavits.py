import sys
from PIL import Image
import colorsys

img = Image.open('public/images/quavits.png').convert('RGBA')
r, g, b, a = img.split()

def hue_shift(pr, pg, pb, h_shift):
    h, l, s = colorsys.rgb_to_hls(pr/255., pg/255., pb/255.)
    new_r, new_g, new_b = colorsys.hls_to_rgb((h + h_shift) % 1.0, l, s)
    return int(new_r * 255), int(new_g * 255), int(new_b * 255)

new_pixels = []
for pr, pg, pb, pa in zip(r.getdata(), g.getdata(), b.getdata(), a.getdata()):
    new_r, new_g, new_b = hue_shift(pr, pg, pb, 0.45) # Shift to blueish
    new_pixels.append((new_r, new_g, new_b, pa))

img.putdata(new_pixels)
img.save('public/images/rare_quavits.png')
print("Successfully saved rare_quavits.png")
