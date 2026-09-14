"""Headless Blender conversion for the six acquired TWEAKIN authored fighter sources.
Run with: blender -b --python tools/convert_roster_assets.py
"""
from pathlib import Path
import bpy, gzip, shutil, os, subprocess, tempfile

ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'assets'/'character-sources'
DST=ROOT/'assets'/'characters'
DST.mkdir(parents=True,exist_ok=True)


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def normalize_scene(target_height=1.82):
    from mathutils import Vector
    objs=[o for o in bpy.context.scene.objects if o.type in {'MESH','ARMATURE','EMPTY'}]
    meshes=[o for o in objs if o.type=='MESH']
    if not meshes:
        raise RuntimeError('No meshes found after import')
    def points():
        bpy.context.view_layer.update()
        return [o.matrix_world @ Vector(c) for o in meshes for c in o.bound_box]
    pts=points(); h=max(p.z for p in pts)-min(p.z for p in pts)
    if h<=1e-5: raise RuntimeError('Invalid character bounds')
    scale=target_height/h
    roots=[o for o in objs if o.parent is None]
    for o in roots: o.scale*=scale
    pts=points(); dz=-min(p.z for p in pts)
    for o in roots: o.location.z+=dz


def export_glb(fid):
    out=DST/fid/f'{fid}.glb'; out.parent.mkdir(parents=True,exist_ok=True)
    normalize_scene()
    bpy.ops.export_scene.gltf(filepath=str(out),export_format='GLB',export_animations=True,export_skins=True,export_morph=True,export_yup=True)
    if out.stat().st_size<10000: raise RuntimeError(f'Bad GLB output: {out}')
    print('EXPORTED',fid,out.stat().st_size)


def import_fbx(p):
    bpy.ops.import_scene.fbx(filepath=str(p),automatic_bone_orientation=False)


def import_obj(p):
    if hasattr(bpy.ops.wm,'obj_import'): bpy.ops.wm.obj_import(filepath=str(p))
    else: bpy.ops.import_scene.obj(filepath=str(p))


def trump():
    reset(); bpy.ops.import_scene.gltf(filepath=str(SRC/'trump.glb')); export_glb('trump')


def netanyahu():
    tmp=SRC/'netanyahu.blend'
    with gzip.open(SRC/'netanyahu.blend.gz','rb') as fi, open(tmp,'wb') as fo: shutil.copyfileobj(fi,fo)
    try:
        bpy.ops.wm.open_mainfile(filepath=str(tmp)); export_glb('netanyahu')
    finally: tmp.unlink(missing_ok=True)


def kirk():
    reset(); import_fbx(SRC/'kirk.fbx'); export_glb('kirk')


def floyd():
    reset(); import_fbx(SRC/'floyd.fbx'); export_glb('floyd')


def wojak():
    reset(); bpy.ops.wm.alembic_import(filepath=str(SRC/'wojak.abc')); export_glb('wojak')


def gigachad():
    with tempfile.TemporaryDirectory() as td:
        cmds=[['unrar','x','-o+',str(SRC/'gigachad.rar'),td+os.sep],['7z','x',str(SRC/'gigachad.rar'),f'-o{td}','-y']]
        for cmd in cmds:
            try:
                subprocess.run(cmd,check=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT); break
            except Exception: continue
        else: raise RuntimeError('Could not extract gigachad.rar')
        obj=next(Path(td).rglob('*.obj'))
        reset(); import_obj(obj); export_glb('gigachad')


for fn in [trump,netanyahu,kirk,floyd,wojak,gigachad]:
    fn()
