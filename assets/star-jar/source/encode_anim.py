import os, numpy as np, OpenEXR, subprocess
from PIL import Image
src="anim_hi"; out="kit/anim"; fr=f"{out}/frames"; os.makedirs(fr, exist_ok=True)
def load(p):
    with OpenEXR.File(p) as f:
        ch=f.channels(); a = ch["RGBA"].pixels if "RGBA" in ch else np.stack([ch[c].pixels for c in "RGBA"],-1)
    return a.astype(np.float32)
def srgb(x):
    x=np.clip(x,0,1); return np.where(x<=0.0031308,12.92*x,1.055*np.power(x,1/2.4)-0.055)
def to8(a,g=1.35):
    P,A=a[...,:3],a[...,3]; A2=np.clip(np.maximum(A,P.max(-1)*g),0,1)
    return (np.dstack([srgb(P/np.maximum(A2[...,None],1e-5)),A2])*255+.5).astype(np.uint8)
fs=sorted(f for f in os.listdir(src) if f.endswith(".exr"))
arrs=[to8(load(f"{src}/{f}")) for f in fs]
alpha=np.max(np.stack([a[...,3] for a in arrs]),0)
ys,xs=np.where(alpha>8); l,r,t,b=xs.min(),xs.max(),ys.min(),ys.max()
side=int(max(r-l,b-t)*1.04); cx,cy=(l+r)/2,(t+b)/2
x0,y0=int(round(cx-side/2)),int(round(cy-side/2))
ims=[]
for i,a in enumerate(arrs):
    c=Image.new("RGBA",(side,side),(0,0,0,0)); c.paste(Image.fromarray(a,"RGBA"),(-x0,-y0))
    c=c.resize((512,512),Image.LANCZOS); c.save(f"{fr}/f{i+1:03d}.png"); ims.append(c)
d=round(1000/24)
ims[0].save(f"{out}/jar-loop.webp",save_all=True,append_images=ims[1:],duration=d,loop=0,quality=88,method=6,lossless=False)
ims[0].save(f"{out}/jar-loop.png",save_all=True,append_images=ims[1:],duration=d,loop=0,format="PNG")
subprocess.run(["ffmpeg","-y","-loglevel","error","-framerate","24","-i",f"{fr}/f%03d.png","-c:v","libvpx-vp9",
                "-pix_fmt","yuva420p","-b:v","0","-crf","30","-auto-alt-ref","0",f"{out}/jar-loop.webm"],check=True)
# preview mp4 on the app's background (3 loops)
subprocess.run(["ffmpeg","-y","-loglevel","error","-f","lavfi","-i","color=c=0x66344a:s=512x512:r=24","-stream_loop","2",
                "-framerate","24","-i",f"{fr}/f%03d.png","-filter_complex","[0][1]overlay=shortest=1,format=yuv420p",
                "-c:v","libx264","-crf","18","/home/claude/jar-loop-preview.mp4"],check=True)
sheet=Image.new("RGBA",(256*6,256*2),(102,52,72,255))
for k,i in enumerate(range(0,60,5)):
    t=ims[i].resize((256,256)); sheet.alpha_composite(t,((k%6)*256,(k//6)*256))
sheet.save("/home/claude/anim_sheet.png")
for f in ("jar-loop.webp","jar-loop.png","jar-loop.webm"): print(f, os.path.getsize(f"{out}/{f}")//1024,"KB")
