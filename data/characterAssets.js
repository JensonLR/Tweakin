// Authored character asset registry.
// Procedural fighters are legacy fallback only. Public-facing presentation should
// prefer authored GLB assets once a model has been acquired, optimised and validated.

export const CHARACTER_ASSETS={
  trump:{path:null,status:'download-gated',targetTriangles:70000,sourceUrl:'https://sketchfab.com/3d-models/donald-trump-rigged-50624472b28b444bbf272142f588897f',license:'CC Attribution',sourceNote:'Preferred free candidate: rigged Donald Trump, ~73.8k triangles. Download package is account-gated by Sketchfab; integrate immediately once package is available.'},
  netanyahu:{path:null,status:'download-gated',targetTriangles:70000,sourceUrl:'https://sketchfab.com/3d-models/benjamin-netanyahu-ccd90e7e03db4be695aa0831a393586d',license:'CC Attribution',sourceNote:'Free authored Netanyahu candidate, ~176.6k triangles. Requires retopology/LOD pass and common-rig validation after download.'},
  kirk:{path:null,status:'download-gated',targetTriangles:65000,sourceUrl:'https://sketchfab.com/3d-models/charlie-kirk-freedom-shirt-5221d24464ae48a3b6e1ce24c416d608',license:'CC Attribution',sourceNote:'Free authored Charlie Kirk candidate, ~48.2k triangles with PBR textures. Remove/replace source-shirt branding during TWEAKIN art-direction and validate rigging after acquisition.'},
  floyd:{path:null,status:'download-gated',targetTriangles:70000,sourceUrl:'https://sketchfab.com/3d-models/george-floyd-31dd30a0c3ad4b91b9df29ba6aa0b905',license:'CC Attribution',sourceNote:'Free high-resolution authored source (~1.3M triangles). Requires respectful optimisation, rigging and LOD work. No real-world death content.'},
  wojak:{path:null,status:'download-gated',targetTriangles:40000,sourceUrl:'https://sketchfab.com/3d-models/wojak-07f8022dee8b402e951ae87ce61aebf5',license:'CC Attribution',sourceNote:'Free authored Wojak candidate, ~35.4k triangles. Strong match for target web budget; validate rig/animation readiness after download.'},
  gigachad:{path:null,status:'download-gated',targetTriangles:80000,sourceUrl:'https://sketchfab.com/3d-models/giga-chad-ernest-khalimov-replica-405a54167dfc439d937973bab248ea26',license:'CC Attribution',sourceNote:'Free authored Gigachad likeness candidate, ~49.2k triangles. A separate Mixamo-rigged CyberChad option also exists if the likeness source needs rig replacement.'},
  agarthan:{path:null,status:'download-gated',targetTriangles:75000,sourceUrl:'https://sketchfab.com/3d-models/rigged-alien-3122cef0f7a348b1801dae23cbe65368',license:'CC Attribution',sourceNote:'~77.8k-triangle rigged alien candidate. Requires attribution plus TWEAKIN pale-silver materials, wardrobe and identity art-direction.'},
  greek:{path:null,status:'source-found',targetTriangles:80000,sourceUrl:'https://www.metmuseum.org/art/collection/search/242211',license:'Public Domain / Met Open Access',sourceNote:'Met Herakles public-domain sculptural source. Automated GLB fetch did not return a package; continue acquisition/retopo route rather than claiming ready.'}
};

export const REFERENCE_ASSETS={
  commonRig:{path:'./assets/characters/reference/quaternius-common-rig.glb',status:'ready',license:'CC0 1.0',purpose:'Canonical authored humanoid skeleton and skinning reference.'},
  formalRig:{path:'./assets/characters/reference/formal-rig-reference.glb',status:'ready',license:'CC0 base + MIT modifications',purpose:'Formal-clothing rig/material integration reference.'},
  humanRig:{path:'./assets/characters/reference/quaternius-human.glb',status:'ready',license:'CC0 1.0',purpose:'Secondary human deformation and retargeting reference.'}
};

export const authoredAssetFor=id=>CHARACTER_ASSETS[id]??null;
export const hasAuthoredAsset=id=>Boolean(CHARACTER_ASSETS[id]?.path&&CHARACTER_ASSETS[id]?.status==='ready');
export const assetStatusFor=id=>CHARACTER_ASSETS[id]?.status||'missing';

export const CHARACTER_ASSET_REQUIREMENTS={
  format:'GLB 2.0 preferred',
  rig:'Common humanoid combat skeleton; hips/root, spine, chest, neck, head, clavicles, upper/lower arms, hands, upper/lower legs, feet',
  materials:'PBR baseColor + normal + roughness/metalness; embedded or local textures only',
  animationClips:['idle','walk','run','light_1','light_2','heavy_1','heavy_2','grapple','block','parry','evade','hit_light','hit_heavy','knockdown','getup','special_1','special_2','victory','ko'],
  webTargets:{desktopTriangles:'55k-90k',mobileTriangles:'25k-55k',textureMaxDesktop:2048,textureMaxMobile:1024},
  likeness:'No generic placeholder heads for real-person roster slots.',
  fallback:'Legacy procedural geometry is debug/fallback only and must not be presented as final character art.',
  gate:'A fighter is not status=ready until licence/source, mesh quality, rig, PBR materials, scale, animation mapping and mobile performance have passed.'
};
