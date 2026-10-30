"""Original synthetic pendulum video. Requires Pillow and ffmpeg; no network/model calls."""
from PIL import Image, ImageDraw, ImageFont
import math, subprocess
from pathlib import Path
root = Path(__file__).resolve().parents[1]
out = root / 'public' / 'pendulum-synthetic.mp4'
font = ImageFont.truetype('/System/Library/Fonts/Menlo.ttc', 13) if Path('/System/Library/Fonts/Menlo.ttc').exists() else ImageFont.load_default()
proc = subprocess.Popen(['ffmpeg','-y','-f','rawvideo','-vcodec','rawvideo','-pix_fmt','rgb24','-s','960x540','-r','30','-i','-','-an','-vcodec','libx264','-pix_fmt','yuv420p','-movflags','+faststart',str(out)],stdin=subprocess.PIPE,stderr=subprocess.PIPE)
for frame in range(360):
    t=frame/30
    im=Image.new('RGB',(960,540),'#e9edf0'); d=ImageDraw.Draw(im)
    for x in range(0,960,30): d.line((x,0,x,540),fill='#dde3e8')
    for y in range(0,540,30): d.line((0,y,960,y),fill='#dde3e8')
    d.line((480,90,480,430),fill='#b6c2cc',width=1)
    d.rounded_rectangle((380,43,580,62),radius=5,fill='#26394b')
    d.ellipse((472,62,488,78),fill='#607488')
    x=480+180*math.exp(-.09*t)*math.cos(3.6*t+.2); y=70+math.sqrt(335**2-(x-480)**2)
    d.line((480,70,x,y),fill='#677889',width=3)
    d.ellipse((x-20,y-20,x+20,y+20),fill='#2357e9',outline='#173db5',width=2)
    d.ellipse((x-10,y-12,x-3,y-5),fill='#91b2ff')
    d.rounded_rectangle((100,460,400,490),radius=3,fill='#fdfcf8',outline='#99a8b6')
    for n in range(51):
        xx=100+n*6;d.line((xx,460,xx,475 if n%5==0 else 469),fill='#687887')
    d.text((106,495),'0                         0.50 m',font=font,fill='#526373')
    d.text((24,23),'TWINLAB / GENERATED EXPERIMENT',font=font,fill='#526373')
    d.text((24,510),'SYNTHETIC SAMPLE · not a physical measurement',font=font,fill='#526373')
    d.text((834,23),f'{t:05.2f} s',font=font,fill='#526373')
    proc.stdin.write(im.tobytes())
proc.stdin.close()
err=proc.stderr.read();code=proc.wait()
if code: raise RuntimeError(err.decode())
print(out)
