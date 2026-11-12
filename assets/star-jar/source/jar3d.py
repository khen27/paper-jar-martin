import bpy, bmesh, math, random, sys
from mathutils import Vector, Euler

RES = int(sys.argv[sys.argv.index("--res")+1]) if "--res" in sys.argv else 512
SAMPLES = int(sys.argv[sys.argv.index("--samples")+1]) if "--samples" in sys.argv else 48
OUT = sys.argv[sys.argv.index("--out")+1] if "--out" in sys.argv else "/home/claude/render.png"
MODE = sys.argv[sys.argv.index("--mode")+1] if "--mode" in sys.argv else "still"

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

def hexrgb(h, a=1.0):
    h = h.lstrip('#')
    c = [int(h[i:i+2],16)/255 for i in (0,2,4)]
    lin = [ (x/12.92) if x<=0.04045 else ((x+0.055)/1.055)**2.4 for x in c]
    return (*lin, a)

# ---------------- materials ----------------
def plastic(name, hexcol, rough=0.32, coat=0.6, glow=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = hexrgb(hexcol)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Coat Weight"].default_value = coat
    b.inputs["Coat Roughness"].default_value = 0.12
    b.inputs["Specular IOR Level"].default_value = 0.5
    b.inputs["Emission Color"].default_value = hexrgb(hexcol)
    b.inputs["Emission Strength"].default_value = glow
    return m

def glass_mat():
    m = bpy.data.materials.new("Glass"); m.use_nodes = True
    nt = m.node_tree; N = nt.nodes; L = nt.links
    N.clear()
    out = N.new("ShaderNodeOutputMaterial")
    lw = N.new("ShaderNodeLayerWeight"); lw.inputs["Blend"].default_value = 0.45
    # transparency amount: high in the middle, lower toward silhouettes
    ramp = N.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.0
    ramp.color_ramp.elements[0].color = (0.95,0.95,0.95,1)   # center: 80% see-through
    ramp.color_ramp.elements[1].position = 1.0
    ramp.color_ramp.elements[1].color = (0.50,0.50,0.50,1)   # edges: mostly frosted
    L.new(lw.outputs["Facing"], ramp.inputs["Fac"])
    body = N.new("ShaderNodeBsdfPrincipled")
    body.inputs["Base Color"].default_value = hexrgb("#8FD3FF")
    body.inputs["Roughness"].default_value = 0.06
    body.inputs["Coat Weight"].default_value = 1.0
    body.inputs["Coat Roughness"].default_value = 0.03
    body.inputs["Emission Color"].default_value = hexrgb("#BFE6FF")
    body.inputs["Emission Strength"].default_value = 0.0
    tr = N.new("ShaderNodeBsdfTransparent"); tr.inputs["Color"].default_value = hexrgb("#E8F7FF")
    mix = N.new("ShaderNodeMixShader")
    L.new(ramp.outputs["Color"], mix.inputs["Fac"])
    L.new(body.outputs["BSDF"], mix.inputs[1])
    L.new(tr.outputs["BSDF"], mix.inputs[2])
    # specular sparkle on top (pure highlights)
    gl = N.new("ShaderNodeBsdfGlossy"); gl.inputs["Roughness"].default_value = 0.04
    gl.inputs["Color"].default_value = (0.22,0.22,0.22,1)
    add = N.new("ShaderNodeAddShader")
    L.new(mix.outputs["Shader"], add.inputs[0]); L.new(gl.outputs["BSDF"], add.inputs[1])
    L.new(add.outputs["Shader"], out.inputs["Surface"])
    m.blend_method = 'BLEND' if hasattr(m,'blend_method') else None
    return m

STAR_HEX = {
    "pink":"#FF4F9A", "yellow":"#FFC41F", "green":"#3FD460", "blue":"#2F8BFF",
    "purple":"#9A5BFF", "orange":"#FF8A1F", "teal":"#16CDB8", "red":"#FF3D57",
}
STAR_MATS = {k: plastic("star_"+k, v, glow=0.18) for k,v in STAR_HEX.items()}
LID_MAT = plastic("lid", "#FFCB2E", rough=0.28, coat=0.8)
LID_SIDE = plastic("lid_side", "#FFA514", rough=0.3, coat=0.8)
GLASS = glass_mat()

# ---------------- star mesh (puffy) ----------------
def make_star_mesh(R=1.0, r=0.48, h=0.30):
    bm = bmesh.new()
    rim_top, rim_mid, rim_bot = [], [], []
    for i in range(10):
        a = math.radians(90 + i*36)
        rad = R if i%2==0 else r
        x, y = rad*math.cos(a), rad*math.sin(a)
        rim_top.append(bm.verts.new((x*0.92, y*0.92, h)))
        rim_mid.append(bm.verts.new((x*1.0, y*1.0, 0)))
        rim_bot.append(bm.verts.new((x*0.92, y*0.92, -h)))
    ct = bm.verts.new((0,0,h*1.55)); cb = bm.verts.new((0,0,-h*1.55))
    for i in range(10):
        j = (i+1)%10
        bm.faces.new((ct, rim_top[i], rim_top[j]))
        bm.faces.new((cb, rim_bot[j], rim_bot[i]))
        bm.faces.new((rim_top[i], rim_mid[i], rim_mid[j], rim_top[j]))
        bm.faces.new((rim_mid[i], rim_bot[i], rim_bot[j], rim_mid[j]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new("Star")
    bm.to_mesh(me); bm.free()
    for p in me.polygons: p.use_smooth = True
    return me

STAR_ME = make_star_mesh()

def add_star(loc, size, color, rot, name="inner"):
    ob = bpy.data.objects.new(name, STAR_ME.copy())
    ob.data.materials.append(STAR_MATS[color])
    ob.location = loc; ob.scale = (size,size,size); ob.rotation_euler = rot
    sub = ob.modifiers.new("sub","SUBSURF"); sub.levels = 2; sub.render_levels = 3
    scene.collection.objects.link(ob)
    return ob

# ---------------- jar (lathe) ----------------
def jar_radius(z):
    # outer silhouette of a chunky mason jar
    pts = [(0.00,0.00),(0.70,0.00),(0.92,0.05),(1.00,0.22),(1.02,0.60),(1.02,1.45),
           (0.98,1.70),(0.88,1.86),(0.80,1.95),(0.78,2.05),(0.78,2.18)]
    return pts

prof = jar_radius(0)
bm = bmesh.new()
verts = [bm.verts.new((r,0,z)) for r,z in prof]
for a,b in zip(verts[:-1], verts[1:]): bm.edges.new((a,b))
geom = bm.verts[:] + bm.edges[:]
bmesh.ops.spin(bm, geom=geom, cent=(0,0,0), axis=(0,0,1), angle=math.radians(360), steps=64, use_duplicate=False)
bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-4)
bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
jme = bpy.data.meshes.new("Jar"); bm.to_mesh(jme); bm.free()
for p in jme.polygons: p.use_smooth = True
jar = bpy.data.objects.new("Jar", jme); scene.collection.objects.link(jar)
jar.data.materials.append(GLASS)
jar.scale=(1.12,1.12,1.0)
sub = jar.modifiers.new("sub","SUBSURF"); sub.levels = 2; sub.render_levels = 2

# thick glass lip
bpy.ops.mesh.primitive_torus_add(major_radius=0.885, minor_radius=0.085, location=(0,0,2.19),
                                 major_segments=64, minor_segments=24)
lip = bpy.context.active_object; lip.data.materials.append(GLASS)
for p in lip.data.polygons: p.use_smooth = True
# thread band under lip
bpy.ops.mesh.primitive_torus_add(major_radius=0.895, minor_radius=0.05, location=(0,0,2.05),
                                 major_segments=64, minor_segments=16)
band = bpy.context.active_object; band.data.materials.append(GLASS)
for p in band.data.polygons: p.use_smooth = True

def inner_r(z):
    pts = prof
    for (r1,z1),(r2,z2) in zip(pts[:-1],pts[1:]):
        if z1 <= z <= z2 and z2>z1:
            t=(z-z1)/(z2-z1); return (r1+(r2-r1)*t)*1.12 - 0.10
    return 0.6

# ---------------- stars inside ----------------
random.seed(7)
colors = list(STAR_HEX.keys())
placed = []
attempts = 0
while len(placed) < 34 and attempts < 400000:
    attempts += 1
    z = random.uniform(0.30, 2.02)
    size = random.uniform(0.31, 0.40)
    ang = random.uniform(0, 2*math.pi)
    rr = math.sqrt(random.random()) * max(0.0, inner_r(z) - size*0.85)
    x, y = rr*math.cos(ang), rr*math.sin(ang)
    p = Vector((x,y,z))
    if any((p-q).length < (size+s)*0.66 for q,s,_ in placed): continue
    # avoid same color touching
    near = [c for q,s,c in placed if (p-q).length < 0.75]
    choices = [c for c in colors if c not in near] or colors
    placed.append((p,size,random.choice(choices)))

for p,size,c in placed:
    # face roughly toward camera (-Y) with lively tilt
    rot = Euler((math.radians(90 + random.uniform(-24,24)),
                 math.radians(random.uniform(-24,24)),
                 math.radians(random.uniform(0,72))), 'ZXY')
    add_star(p, size, c, rot)
INNER = [o for o in scene.objects if o.name.startswith("inner")]

# hero star popping out of the mouth (top-right like the original)
HERO = add_star((0.62,-0.30,2.50), 0.42, "pink", Euler((math.radians(82), math.radians(-14), math.radians(16)),'XYZ'), name="hero")
# two small escapees
SPARK = add_star((1.10,-0.05,3.05), 0.22, "yellow", Euler((math.radians(80), math.radians(25), math.radians(-12)),'XYZ'), name="spark")
MOUTH = add_star((0.05,-0.35,2.30), 0.30, "blue", Euler((math.radians(95), math.radians(10), math.radians(40)),'XYZ'), name="inner_mouth")

# ---------------- lid (tilted open, top-left) ----------------
bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=1.0, depth=0.28, location=(0,0,0))
lid = bpy.context.active_object; lid.name = "lid"
for p in lid.data.polygons: p.use_smooth = True
lid.data.materials.append(LID_MAT)
bv = lid.modifiers.new("bevel","BEVEL"); bv.width = 0.11; bv.segments = 8; bv.limit_method='ANGLE'
ls = lid.modifiers.new("sub","SUBSURF"); ls.levels = 1; ls.render_levels = 2
lid.location = (-0.50, 0.10, 2.86)
lid.rotation_euler = Euler((math.radians(18), math.radians(-24), 0), 'XYZ')

# ---------------- camera (long lens, near-isometric) ----------------
cam_data = bpy.data.cameras.new("cam"); cam_data.lens = 160
cam = bpy.data.objects.new("cam", cam_data); scene.collection.objects.link(cam)
target = Vector((0.08, 0, 1.68))
cam.location = target + Vector((0, -19.5, 4.6))
d = target - cam.location
cam.rotation_euler = d.to_track_quat('-Z','Y').to_euler()
scene.camera = cam

# ---------------- lighting (soft studio) ----------------
def area(name, loc, size, energy, color=(1,1,1), sx=None, sy=None):
    ld = bpy.data.lights.new(name, 'AREA'); ld.energy = energy; ld.color = color
    if sx: ld.shape='RECTANGLE'; ld.size=sx; ld.size_y=sy
    else: ld.shape='DISK'; ld.size = size
    ob = bpy.data.objects.new(name, ld); scene.collection.objects.link(ob)
    ob.location = loc
    ob.rotation_euler = (Vector((0,0,1.4)) - Vector(loc)).to_track_quat('-Z','Y').to_euler()
    return ob

area("key",  (-5.5,-6.5,8.0), 6.0, 440)                       # big soft key, top-left-front
area("strip",(-3.4,-5.2,0.9), 0, 110, sx=0.35, sy=2.4)           # tall strip -> vertical glass highlight
area("fill", (6.5,-5.0,3.0), 6.0, 140, color=(0.92,0.95,1.0))   # cool fill right
area("rim",  (2.0, 6.0,6.0), 4.0, 260, color=(1.0,0.95,0.98)) # back rim glow
area("top",  (0,0,9), 5.0, 90)

world = bpy.data.worlds.new("w"); scene.world = world; world.use_nodes = True
bg = world.node_tree.nodes["Background"]; bg.inputs["Color"].default_value = (1,1,1,1); bg.inputs["Strength"].default_value = 0.35

# ---------------- render settings ----------------
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = SAMPLES
scene.cycles.use_denoising = True
scene.cycles.transparent_max_bounces = 64
scene.cycles.max_bounces = 8
scene.render.film_transparent = True
scene.render.resolution_x = RES; scene.render.resolution_y = RES
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.view_settings.view_transform = 'Standard'
scene.view_settings.look = 'None'
scene.view_settings.exposure = 0.0
GLASS_OBS = [jar, lip, band]

if MODE == "still":
    scene.render.filepath = OUT
    bpy.ops.render.render(write_still=True)
    print("DONE", OUT, len(placed), "stars")
elif MODE == "layers":
    exec(open("/home/claude/mode_layers.py").read())
elif MODE == "anim":
    exec(open("/home/claude/mode_anim.py").read())
