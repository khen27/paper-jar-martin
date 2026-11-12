Re-render (needs `pip install bpy OpenEXR numpy pillow`, ffmpeg for video):
  python3 jar3d.py --res 1024 --samples 192 --out icon.png              # static icon
  python3 jar3d.py --mode layers --res 1200 --samples 128 --out layers_exr && python3 exr2png.py layers_exr layers 1024
  python3 jar3d.py --mode anim --res 512 --samples 40 --out anim_hi && python3 encode_anim.py
Paths inside the scripts point to /home/claude; adjust before running.
