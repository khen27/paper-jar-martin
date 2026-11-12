# executed inside jar3d.py namespace (MODE == "anim")
import os
from mathutils import Quaternion, Matrix

OUTDIR = OUT
os.makedirs(OUTDIR, exist_ok=True)
FRAMES = 60          # 2.5s @ 24fps, frame 61 == frame 1
scene.frame_start, scene.frame_end = 1, FRAMES
scene.render.fps = 24
random.seed(11)

# more headroom for the pop
cam.data.lens = 124
target = Vector((0.10, 0, 2.02))
cam.location = target + Vector((0, -19.5, 4.6))
cam.rotation_euler = (target - cam.location).to_track_quat('-Z','Y').to_euler()

# root for squash & stretch, pivot at jar base
root = bpy.data.objects.new("root", None); scene.collection.objects.link(root)
movers = GLASS_OBS + INNER + [MOUTH, lid, HERO, SPARK]
for o in movers:
    o.parent = root

def key(ob, f, **kw):
    for attr, val in kw.items():
        setattr(ob, attr, val)
        ob.keyframe_insert(data_path=attr, frame=f)

# ---- jar squash & stretch ----
S = lambda xy, z: (xy, xy, z)
for f, sc in [(1,S(1,1)), (8,S(1,1)), (13,S(1.06,0.91)), (18,S(0.96,1.07)), (23,S(1.02,0.98)), (28,S(1,1)),
              (37,S(1.015,0.985)), (41,S(1,1)), (61,S(1,1))]:
    key(root, f, scale=sc)

# ---- lid: pop up + flip, fall back with bounce ----
L0, R0 = Vector(lid.location), Euler(lid.rotation_euler)
def lid_pose(dz=0, dx=0, rx=0, ry=0):
    return dict(location=L0 + Vector((dx, 0, dz)),
                rotation_euler=Euler((R0.x + math.radians(rx), R0.y + math.radians(ry), R0.z), 'XYZ'))
for f, p in [(1,{}), (12,{}), (14,dict(dz=-0.04)), (21,dict(dz=0.74, dx=-0.16, rx=18, ry=-20)),
             (25,dict(dz=0.82, dx=-0.18, rx=22, ry=-25)), (32,{}), (35,dict(dz=0.10, rx=4, ry=-4)),
             (38,{}), (40,dict(dz=0.025)), (42,{}), (61,{})]:
    key(lid, f, **lid_pose(**p))

# ---- hero star: shoot up, 144deg spin (5-fold symmetric -> loops clean), land with bounce ----
HERO.rotation_mode = 'QUATERNION'
H0 = Vector(HERO.location); Q0 = HERO.rotation_euler.to_quaternion() if False else Euler((math.radians(82), math.radians(-14), math.radians(16)),'XYZ').to_quaternion()
HERO.rotation_quaternion = Q0
s0 = HERO.scale[0]
def hero_pose(dz=0, dx=0, spin=0, sc=1.0, tilt=0):
    q = Q0 @ Quaternion((0,0,1), math.radians(spin)) @ Quaternion((1,0,0), math.radians(tilt))
    return dict(location=H0 + Vector((dx, -0.05*sc, dz)), rotation_quaternion=q, scale=(s0*sc,)*3)
for f, p in [(1,{}), (12,dict(dz=-0.06, sc=0.95)), (16,dict(dz=0.35, dx=-0.02, spin=40, sc=1.08)),
             (21,dict(dz=0.80, dx=-0.08, spin=90, sc=1.18, tilt=-10)), (25,dict(dz=0.88, dx=-0.10, spin=118, sc=1.18, tilt=-6)),
             (31,dict(dz=0.08, dx=0.02, spin=144, sc=1.0)), (33,dict(dz=-0.04, spin=144, sc=0.97)),
             (36,dict(dz=0.10, spin=144, sc=1.02)), (39,dict(spin=144)), (61,dict(spin=144))]:
    key(HERO, f, **hero_pose(**p))
# frame 1 at spin 0 and frame 61 at spin 144 look identical (5-fold star) -> seamless

# ---- spark star: steady 72deg spin over the loop + twinkle on the pop ----
SPARK.rotation_mode = 'QUATERNION'
SQ0 = Euler((math.radians(80), math.radians(25), math.radians(-12)),'XYZ').to_quaternion()
sp0 = SPARK.scale[0]; SL0 = Vector(SPARK.location)
for f in range(1, 62, 6):
    t = (f-1)/60
    sc = 1.0
    if 17 <= f <= 31: sc = 1.55 if f in (19, 25) else 1.25
    SPARK.rotation_quaternion = SQ0 @ Quaternion((0,0,1), math.radians(72*t))
    SPARK.scale = (sp0*sc,)*3
    SPARK.location = SL0 + Vector((0, 0, 0.05*math.sin(2*math.pi*t)))
    SPARK.keyframe_insert("rotation_quaternion", frame=f)
    SPARK.keyframe_insert("scale", frame=f)
    SPARK.keyframe_insert("location", frame=f)

# ---- inner stars: jiggle when the jar springs ----
for o in INNER + [MOUTH]:
    base_l = Vector(o.location); base_r = Euler(o.rotation_euler); mode = base_r.order
    h = max(0.2, o.location.z / 2.1)              # higher stars fly more
    up = random.uniform(0.05, 0.13) * h
    jr = [math.radians(random.uniform(-14, 14)) for _ in range(3)]
    d = random.randint(-1, 1)                      # slight timing offset per star
    def pose(dz=0, k=0.0):
        return dict(location=base_l + Vector((0, 0, dz)),
                    rotation_euler=Euler((base_r.x + jr[0]*k, base_r.y + jr[1]*k, base_r.z + jr[2]*k), mode))
    for f, p in [(1,{}), (12+d,dict(dz=-0.03*h)), (18+d,dict(dz=up, k=1.0)), (24+d,dict(dz=-0.02*h, k=-0.4)),
                 (29+d,dict(dz=0.015*h, k=0.15)), (34+d,{}), (61,{})]:
        key(o, f, **pose(**p))

# smooth curves everywhere
for ob in scene.objects:
    ad = ob.animation_data
    if ad and ad.action:
        for layer in getattr(ad.action, "layers", []):
            for strip in layer.strips:
                for cb in strip.channelbags:
                    for fc in cb.fcurves:
                        for kp in fc.keyframe_points:
                            kp.interpolation = 'BEZIER'; kp.handle_left_type = kp.handle_right_type = 'AUTO_CLAMPED'
        if hasattr(ad.action, "fcurves"):
            for fc in ad.action.fcurves:
                for kp in fc.keyframe_points:
                    kp.interpolation = 'BEZIER'; kp.handle_left_type = kp.handle_right_type = 'AUTO_CLAMPED'

scene.render.use_persistent_data = True
frames = sys.argv[sys.argv.index("--frames")+1] if "--frames" in sys.argv else f"1-{FRAMES}"
a, b = map(int, frames.split("-"))
step = int(sys.argv[sys.argv.index("--step")+1]) if "--step" in sys.argv else 1
for f in range(a, b+1, step):
    scene.frame_set(f)
    scene.render.image_settings.file_format = 'OPEN_EXR'
    scene.render.image_settings.color_depth = '16'
    scene.render.filepath = os.path.join(OUTDIR, f"f{f:03d}.exr")
    bpy.ops.render.render(write_still=True)
    print("FRAME", f, flush=True)
