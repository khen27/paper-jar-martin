# executed inside jar3d.py namespace (MODE == "layers")
import json, os
from bpy_extras.object_utils import world_to_camera_view

OUTDIR = OUT  # directory
os.makedirs(OUTDIR, exist_ok=True)
dg = bpy.context.evaluated_depsgraph_get()

def split_glass(ob):
    """Bake modifiers, then cut at y=0 (the silhouette plane for this camera)."""
    eval_ob = ob.evaluated_get(dg)
    me = bpy.data.meshes.new_from_object(eval_ob)
    halves = {}
    for side in ("front", "back"):
        bm = bmesh.new(); bm.from_mesh(me)
        bm.transform(ob.matrix_world)
        geom = bm.verts[:] + bm.edges[:] + bm.faces[:]
        # front = y<0 (toward camera). clear_outer removes +normal side.
        bmesh.ops.bisect_plane(bm, geom=geom, plane_co=(0,0,0), plane_no=(0,1,0),
                               clear_outer=(side=="front"), clear_inner=(side=="back"))
        m2 = bpy.data.meshes.new(f"{ob.name}_{side}"); bm.to_mesh(m2); bm.free()
        for p in m2.polygons: p.use_smooth = True
        o2 = bpy.data.objects.new(f"{ob.name}_{side}", m2)
        o2.data.materials.append(GLASS)
        scene.collection.objects.link(o2)
        halves[side] = o2
    ob.hide_render = True
    return halves

front, back = [], []
for g in GLASS_OBS:
    h = split_glass(g); front.append(h["front"]); back.append(h["back"])

LAYERS = {
    "01-glass-back":  back,
    "02-stars":       INNER + [MOUTH],
    "03-glass-front": front,
    "04-lid":         [lid],
    "05-hero-star":   [HERO],
    "06-spark-star":  [SPARK],
}
ALL = [o for o in scene.objects if o.type == 'MESH' and not o.hide_render]

only = sys.argv[sys.argv.index("--only")+1].split(",") if "--only" in sys.argv else list(LAYERS) + ["00-full"]
for name in only:
    keep = set(ALL) if name == "00-full" else set(LAYERS[name])
    for o in ALL:
        o.hide_render = o not in keep
    scene.render.image_settings.file_format = 'OPEN_EXR'
    scene.render.image_settings.color_depth = '32'
    scene.render.filepath = os.path.join(OUTDIR, name + ".exr")
    bpy.ops.render.render(write_still=True)
    print("LAYER", name, flush=True)

# pivots (fraction of the raw render frame, y down)
def proj(v):
    c = world_to_camera_view(scene, scene.camera, Vector(v))
    return [round(c.x, 5), round(1 - c.y, 5)]

piv = {
    "jarBase":    proj((0, 0, 0.0)),
    "jarCenter":  proj((0, 0, 1.1)),
    "jarMouth":   proj((0, 0, 2.2)),
    "lidCenter":  proj(lid.matrix_world.translation),
    "heroCenter": proj(HERO.matrix_world.translation),
    "sparkCenter":proj(SPARK.matrix_world.translation),
    "starsCenter":proj((0, 0, 1.15)),
}
json.dump(piv, open(os.path.join(OUTDIR, "pivots_raw.json"), "w"), indent=2)
print("PIVOTS", piv)
