// Production roster asset registry.
// A roster fighter may only replace the fallback mesh when its own likeness/model GLB
// is local, licensed, rigged, animated and explicitly marked status:'ready'.
// Reference rigs below are development/retargeting aids only and MUST NOT render as roster fighters.

export const CHARACTER_ASSETS={
  trump:{path:null,status:'download-gated',targetTriangles:70000,sourceUrl:'https://sketchfab.com/3d-models/donald-trump-rigged-50624472b28b444bbf272142f588897f',license:'CC Attribution',sourceNote:'Preferred free candidate: rigged Donald Trump, ~73.8k triangles. Download package is account-gated by Sketchfab; integrate only after the package, attribution, rig and animation set are validated.'},
  netanyahu:{path:null,status:'download-gated',targetTriangles:70000,sourceUrl:'https://sketchfab.com/3d-models/benjamin-netanyahu-ccd90e7e03db4be695aa0831a393586d',license:'CC Attribution',sourceNote:'Free authored Netanyahu candidate, ~176.6k triangles. Requires retopology/LOD, rigging and combat-animation validation before use.'},
  kirk:{path:null,status:'download-gated',targetTriangles:65000,sourceUrl:'https://sketchfab.com/3d-models/charlie-kirk-freedom-shirt-5221d24464ae48a3b6e1ce24c416d608',license:'CC Attribution',sourceNote:'Free authored Charlie Kirk candidate, ~48.2k triangles with PBR textures. Replace source-shirt branding and validate common rig + combat clips before use.'},
  floyd:{path:null,status:'download-gated',targetTriangles:70000,sourceUrl:'https://sketchfab.com/3d-models/george-floyd-31dd30a0c3ad4b91b9df29ba6aa0b905',license:'CC Attribution',sourceNote:'Free high-resolution authored source (~1.3M triangles). Requires respectful optimisation, rigging and LOD work. No real-world death content.'},
  wojak:{path:null,status:'download-gated',targetTriangles:40000,sourceUrl:'https://sketchfab.com/3d-models/wojak-07f8022dee8b402e951ae87ce61aebf5',license:'CC Attribution',sourceNote:'Free authored Wojak candidate, ~35.4k triangles. Validate topology, rig and full combat animation set before use.'},
  gigachad:{path:null,status:'download-gated',targetTriangles:80000,sourceUrl:'https://sketchfab.com/3d-models/giga-chad-ernest-khalimov-replica-405a54167dfc439d937973bab248ea26',license:'CC Attribution',sourceNote:'Free authored Gigachad likeness candidate, ~49.2k triangles. Requires rig replacement/validation and combat animation retargeting before use.'},
  agarthan:{path:null,status:'download-gated',targetTriangles:75000,sourceUrl:'https://sketchfab.com/3d-models/rigged-alien-3122cef0f7a348b1801dae23cbe65368',license:'CC Attribution',sourceNote:'~77.8k-triangle rigged alien candidate. Requires attribution plus TWEAKIN pale-silver materials, wardrobe, identity pass and combat clips.'},
  greek:{path:null,status:'source-found',targetTriangles:80000,sourceUrl:'https://www.metmuseum.org/art/collection/search/242211',license:'Public Domain / Met Open Access',sourceNote:'Met Herakles public-domain sculptural source. Requires retopology, rigging, material pass and full combat animation set before use.'}
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
  format:'GLB 2.0 preferred',
  rig:'Common humanoid combat skeleton; hips/root, spine, chest, neck, head, clavicles, upper/lower arms, hands, upper/lower legs, feet',
  materials:'PBR baseColor + normal + roughness/metalness; embedded or local textures only',
  animationClips:['idle','walk','run','light','heavy','grapple','block','hit','knockdown','getup','special','victory','ko'],
  webTargets:{desktopTriangles:'55k-90k',mobileTriangles:'25k-55k',textureMaxDesktop:2048,textureMaxMobile:1024},
  likeness:'No generic placeholder heads or generic reference-rig bodies for real-person roster slots.',
  fallback:'Legacy procedural geometry is temporary fallback/debug art only, not final character art.',
  gate:'status=ready requires a local fighter-specific path, verified source/licence, acceptable mesh quality, PBR materials, rig, scale, all required combat clips and mobile performance validation.'
};
