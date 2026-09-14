// Production roster asset registry.
// The playable roster is intentionally limited to six fighters with authored source assets in hand.
// A fighter only replaces the fallback runtime when a browser-ready local GLB is present and marked ready.

export const CHARACTER_ASSETS={
  trump:{path:null,status:'source-acquired',sourceFormat:'GLB',sourceFile:'donald-trump-rigged.zip / Donald_Trump_Rigged.glb',targetPath:'./assets/characters/trump/trump.glb',targetTriangles:70000,sourceUrl:'https://sketchfab.com/3d-models/donald-trump-rigged-50624472b28b444bbf272142f588897f',license:'CC Attribution',sourceNote:'Actual rigged source supplied. Preserve likeness, armature and textures; convert/optimise only as needed for browser delivery.'},
  netanyahu:{path:null,status:'source-acquired',sourceFormat:'BLEND (gzip-compressed)',sourceFile:'benjamin-netanyahu.zip / Sketchfab_2025_07_31_17_42_26.blend',targetPath:'./assets/characters/netanyahu/netanyahu.glb',targetTriangles:70000,sourceUrl:'https://sketchfab.com/3d-models/benjamin-netanyahu-ccd90e7e03db4be695aa0831a393586d',license:'CC Attribution',sourceNote:'Actual source supplied. Blend contains a Mixamo-style humanoid rig; export to GLB and validate browser materials/animations.'},
  kirk:{path:null,status:'source-acquired',sourceFormat:'FBX',sourceFile:'charlie-kirk-freedom-shirt.zip / model.fbx',targetPath:'./assets/characters/kirk/kirk.glb',targetTriangles:65000,sourceUrl:'https://sketchfab.com/3d-models/charlie-kirk-freedom-shirt-5221d24464ae48a3b6e1ce24c416d608',license:'CC Attribution',sourceNote:'Actual FBX/PBR source supplied. Skeleton data is present. Export to GLB, remove/replace source-shirt branding if required, and retarget combat clips.'},
  floyd:{path:null,status:'source-acquired',sourceFormat:'FBX',sourceFile:'george-floyd.zip / GeorgeFloyd_02.fbx',targetPath:'./assets/characters/floyd/floyd.glb',targetTriangles:70000,sourceUrl:'https://sketchfab.com/3d-models/george-floyd-31dd30a0c3ad4b91b9df29ba6aa0b905',license:'CC Attribution',sourceNote:'Actual high-resolution FBX source supplied. Optimise/retopologise and rig for gameplay. No real-world death content.'},
  wojak:{path:null,status:'source-acquired',sourceFormat:'Alembic',sourceFile:'wojak.zip / model.zip / wojak.abc',targetPath:'./assets/characters/wojak/wojak.glb',targetTriangles:40000,sourceUrl:'https://sketchfab.com/3d-models/wojak-07f8022dee8b402e951ae87ce61aebf5',license:'CC Attribution',sourceNote:'Actual Alembic source and textures supplied. Convert to GLB and bind/retarget to combat rig while preserving the authored Wojak face.'},
  gigachad:{path:null,status:'source-acquired',sourceFormat:'RAR containing OBJ/MTL',sourceFile:'giga-chad-ernest-khalimov-replica.zip / GigaChad.rar / punk.obj',targetPath:'./assets/characters/gigachad/gigachad.glb',targetTriangles:80000,sourceUrl:'https://sketchfab.com/3d-models/giga-chad-ernest-khalimov-replica-405a54167dfc439d937973bab248ea26',license:'CC Attribution',sourceNote:'Actual OBJ/PBR source supplied. Extract, convert to GLB and bind to the common combat rig.'}
};

export const REFERENCE_ASSETS={
  commonRig:{path:'./assets/characters/reference/quaternius-common-rig.glb',status:'reference-only',license:'CC0 1.0',purpose:'Skeleton/skinning/retargeting reference only. Never a production roster visual.'},
  formalRig:{path:'./assets/characters/reference/formal-rig-reference.glb',status:'reference-only',license:'CC0 base + MIT modifications',purpose:'Formal-clothing deformation reference only. Never a production roster visual.'},
  humanRig:{path:'./assets/characters/reference/quaternius-human.glb',status:'reference-only',license:'CC0 1.0',purpose:'Secondary humanoid deformation reference only. Never a production roster visual.'}
};

export const authoredAssetFor=id=>CHARACTER_ASSETS[id]??null;
export const hasAuthoredAsset=id=>Boolean(CHARACTER_ASSETS[id]?.path&&CHARACTER_ASSETS[id]?.status==='ready');
export const assetStatusFor=id=>CHARACTER_ASSETS[id]?.status||'missing';

export const CHARACTER_ASSET_REQUIREMENTS={
  format:'GLB 2.0 production output',
  rig:'Common humanoid combat skeleton; hips/root, spine, chest, neck, head, clavicles, upper/lower arms, hands, upper/lower legs, feet',
  materials:'PBR baseColor + normal + roughness/metalness; embedded or local textures only',
  animationClips:['idle','walk','run','light','heavy','grapple','block','hit','knockdown','getup','special','victory','ko'],
  webTargets:{desktopTriangles:'55k-90k',mobileTriangles:'25k-55k',textureMaxDesktop:2048,textureMaxMobile:1024},
  likeness:'Use the acquired authored source likenesses. Do not substitute generic procedural heads for the six roster slots.',
  fallback:'Procedural likeness geometry is debug-only and must not be treated as final character art.',
  gate:'status=ready requires the local fighter-specific GLB at targetPath, verified source/licence, acceptable mesh quality, PBR materials, rig, scale, combat animation mapping and mobile performance validation.'
};
