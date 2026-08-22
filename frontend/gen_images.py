from PIL import Image, ImageDraw, ImageFont
import os

OUT = "/Users/adarsha/workspace/tour/frontend/public/activities"
W, H = 800, 600


def gradient(draw, w, h, top, bottom):
    for y in range(h):
        r = int(top[0] + (bottom[0] - top[0]) * y / h)
        g = int(top[1] + (bottom[1] - top[1]) * y / h)
        b = int(top[2] + (bottom[2] - top[2]) * y / h)
        draw.line([(0, y), (w, y)], fill=(r, g, b))


def draw_text(draw, text, y, size=28):
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", size)
    except Exception:
        font = ImageFont.load_default()
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) // 2, y), text, fill="white", font=font)


def draw_mountain(draw, pts, color):
    draw.polygon(pts, fill=color)


def draw_triangle(draw, cx, cy, size, color):
    draw.polygon([(cx, cy - size), (cx - size, cy + size), (cx + size, cy + size)], fill=color)


# 1. Bhote Koshi Rafting
img = Image.new("RGB", (W, H))
d = ImageDraw.Draw(img)
gradient(d, W, H, (30, 58, 95), (14, 116, 144))
draw_mountain(d, [(0, 380), (200, 200), (400, 380)], (71, 85, 105))
draw_mountain(d, [(250, 380), (450, 140), (650, 380)], (51, 65, 85))
draw_mountain(d, [(500, 380), (680, 220), (800, 380)], (71, 85, 105))
draw_mountain(d, [(350, 160), (450, 140), (550, 160), (500, 170), (400, 170)], (226, 232, 240))
d.rectangle([250, 380, 550, 600], fill=(14, 165, 233))
d.ellipse([370, 440, 430, 460], fill=(245, 158, 11))
d.ellipse([372, 442, 428, 458], fill=(251, 191, 36))
for x, y in [(385, 430), (400, 428), (415, 430)]:
    d.ellipse([x - 4, y - 4, x + 4, y + 4], fill=(120, 53, 15))
draw_text(d, "Bhote Koshi White-Water Rafting", 550, 30)
img.save(os.path.join(OUT, "bhote_koshi_rafting.png"))

# 2. Paragliding
img = Image.new("RGB", (W, H))
d = ImageDraw.Draw(img)
gradient(d, W, H, (14, 165, 233), (224, 242, 254))
draw_mountain(d, [(0, 420), (180, 220), (360, 420)], (107, 114, 128))
draw_mountain(d, [(300, 420), (500, 160), (700, 420)], (75, 85, 99))
draw_mountain(d, [(650, 420), (750, 280), (800, 420)], (107, 114, 128))
d.ellipse([580, 60, 720, 140], fill=(251, 191, 36), outline=(245, 158, 11), width=3)
d.ellipse([350, 430, 450, 455], fill=(2, 132, 199), outline=None)
d.arc([320, 190, 480, 250], 180, 0, fill=(239, 68, 68), width=20)
d.arc([330, 195, 470, 245], 180, 0, fill=(220, 38, 38), width=14)
for lx, ly, px, py in [(360, 210, 385, 270), (390, 205, 395, 270), (420, 210, 405, 270)]:
    d.line([(lx, ly), (px, py)], fill=(55, 65, 81), width=1)
d.ellipse([388, 272, 404, 288], fill=(30, 41, 59))
draw_text(d, "Tandem Paragliding - Pokhara", 550, 30)
img.save(os.path.join(OUT, "paragliding.png"))

# 3. Everest Base Camp Trek
img = Image.new("RGB", (W, H))
d = ImageDraw.Draw(img)
gradient(d, W, H, (15, 23, 42), (125, 211, 252))
draw_mountain(d, [(250, 500), (400, 80), (550, 500)], (51, 65, 85))
draw_mountain(d, [(370, 110), (400, 80), (430, 110), (440, 150), (360, 150)], (226, 232, 240))
draw_mountain(d, [(450, 500), (580, 180), (710, 500)], (71, 85, 105))
draw_mountain(d, [(565, 200), (580, 180), (595, 200)], (226, 232, 240))
draw_mountain(d, [(100, 500), (220, 260), (340, 500)], (100, 116, 139))
draw_mountain(d, [(210, 270), (220, 260), (230, 270)], (226, 232, 240))
d.line([(400, 500), (380, 440), (390, 380), (380, 320), (395, 260)], fill=(217, 119, 6), width=3)
d.line([(400, 500), (400, 500)], fill=(217, 119, 6), width=3)
for x, y in [(390, 430), (383, 370)]:
    d.ellipse([x - 4, y - 4, x + 4, y + 4], fill=(30, 41, 59))
draw_text(d, "Everest Base Camp Trek", 550, 30)
img.save(os.path.join(OUT, "everest_base camp trek.png"))

# 4. Janaki Mandir
img = Image.new("RGB", (W, H))
d = ImageDraw.Draw(img)
gradient(d, W, H, (245, 158, 11), (254, 243, 199))
d.ellipse([600, 40, 700, 120], fill=(245, 158, 11), outline=None)
d.rectangle([250, 320, 550, 500], fill=(220, 38, 38))
d.rectangle([260, 330, 540, 490], fill=(239, 68, 68))
for x in [280, 340, 448, 508]:
    d.rectangle([x, 320, x + 12, 500], fill=(251, 191, 36))
d.pieslice([270, 300, 410, 360], 180, 360, fill=(220, 38, 38))
d.pieslice([390, 300, 530, 360], 180, 360, fill=(185, 28, 28))
d.polygon([(390, 210), (380, 280), (420, 280)], fill=(251, 191, 36))
d.ellipse([393, 200, 407, 214], fill=(245, 158, 11))
d.rectangle([230, 500, 570, 515], fill=(146, 64, 14))
d.rectangle([220, 515, 580, 540], fill=(120, 53, 15))
draw_text(d, "Janaki Mandir Tour", 555, 30)
img.save(os.path.join(OUT, "janaki_mandir.png"))

# 5. Upper Mustang Trek
img = Image.new("RGB", (W, H))
d = ImageDraw.Draw(img)
gradient(d, W, H, (30, 58, 95), (245, 158, 11))
draw_mountain(d, [(0, 400), (150, 250), (300, 400)], (180, 83, 9))
draw_mountain(d, [(200, 400), (350, 180), (500, 400)], (146, 64, 14))
draw_mountain(d, [(400, 400), (550, 220), (700, 400)], (180, 83, 9))
draw_mountain(d, [(600, 400), (720, 280), (800, 400)], (146, 64, 14))
d.rectangle([0, 400, 800, 600], fill=(217, 119, 6), outline=None)
d.rectangle([370, 350, 430, 400], fill=(120, 53, 15))
d.rectangle([385, 340, 415, 400], fill=(146, 64, 14))
d.polygon([(395, 310), (385, 340), (415, 340)], fill=(226, 232, 240))
d.ellipse([397, 305, 413, 321], fill=(251, 191, 36))
for x, y in [(310, 378), (318, 377), (326, 376), (334, 377), (342, 378)]:
    d.rectangle([x, y, x + 6, y + 4], fill=[(59, 130, 246), (255, 255, 255), (239, 68, 68), (34, 197, 94), (251, 191, 36)][[(310, 378), (318, 377), (326, 376), (334, 377), (342, 378)].index((x, y))])
d.ellipse([235, 425, 275, 450], fill=(68, 64, 60))
d.ellipse([230, 418, 250, 435], fill=(68, 64, 60))
draw_text(d, "Upper Mustang Trek", 555, 30)
img.save(os.path.join(OUT, "upper mustang.png"))

print("All 5 PNG images generated.")
