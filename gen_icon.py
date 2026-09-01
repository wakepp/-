"""生成命令助手图标：深色渐变 + 命令方块绿边框 + 大号 / 符号"""
from PIL import Image, ImageDraw, ImageFont

W = H = 512
img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(img)

# 垂直渐变深绿黑背景
for y in range(H):
    t = y / H
    r = int(20 + 26 * (1 - t))
    g = int(30 + 44 * (1 - t))
    b = int(22 + 24 * (1 - t))
    d.line([(0, y), (W, y)], fill=(r, g, b, 255))

# iOS 圆角遮罩
mask = Image.new("L", (W, H), 0)
ImageDraw.Draw(mask).rounded_rectangle([0, 0, W, H], radius=110, fill=255)
img.putalpha(mask)

# 命令方块风格绿色边框
d.rounded_rectangle([14, 14, W - 14, H - 14], radius=98,
                    outline=(85, 255, 85, 255), width=10)

# 中央大号 "/" 符号
font = None
for p in (r"C:\Windows\Fonts\consolab.ttf",
          r"C:\Windows\Fonts\consola.ttf",
          r"C:\Windows\Fonts\arialbd.ttf",
          r"C:\Windows\Fonts\arial.ttf"):
    try:
        font = ImageFont.truetype(p, 320)
        break
    except Exception:
        continue
if font is None:
    font = ImageFont.load_default()

d.text((W // 2 + 8, H // 2 - 10), "/", font=font,
       fill=(85, 255, 85, 255), anchor="mm")

out = r"c:\Users\Administrator\Desktop\ios软件注册器\命令助手\www\icon.png"
img.save(out)
print("OK:", out)
