// Authored character asset registry.
// Procedural fighters are legacy fallback only. Public-facing presentation should
// prefer authored GLB assets once a model has been licensed, optimised and added.

export const CHARACTER_ASSETS={
  trump:{path:null,status:'license-required',targetTriangles:70000,sourceUrl:'https://nilefox717.itch.io/donald-trump-3d-model',license:'Commercial asset licence; purchase required before redistribution in project.',sourceNote:'Preferred reference candidate: realistic, rigged, ~70k triangles, 2K textures, FBX. Do not scrape or ship until licensed.'},
  netanyahu:{path:null,status:'sourcing',targetTriangles:70000,sourceUrl:null,license:null,sourceNote:'Use a licensed realistic, rigged likeness or commission/author an equivalent game-ready model.'},
  kirk:{path:null,status:'sourcing',targetTriangles:65000,sourceUrl:null,license:null,sourceNote:'Use a licensed realistic, rigged likeness or author from a high-quality human base.'},
  floyd:{path:null,status:'sourcing',targetTriangles:70000,sourceUrl:null,license:null,sourceNote:'Use a licensed respectful likeness; no real-world death recreation or related content.'},
  wojak:{path:null,status:'authoring',targetTriangles:40000,sourceUrl:null,license:'Original TWEAKIN asset required.',sourceNote:'Author a premium stylised Wojak interpretation on the common humanoid combat rig.'},
  gigachad:{path:null,status:'sourcing',targetTriangles:80000,sourceUrl:null,license:null,sourceNote:'Use a licensed/authorised high-fidelity muscular likeness on the common humanoid combat rig.'},
  agarthan:{path:null,status:'candidate-found',targetTriangles:75000,sourceUrl:'https://sketchfab.com/3d-models/rigged-alien-3122cef0f7a348b1801dae23cbe65368',license:'CC Attribution',sourceNote:'77.8k-triangle rigged alien candidate. Requires attribution, art-direction pass, clothing, face/material work and rig validation before ready.'},
  greek:{path:null,status:'candidate-found',targetTriangles:80000,sourceUrl:'https://www.metmuseum.org/art/collection/search/242211',license:'Public Domain / Met Open Access',sourceNote:'Met 3D scan candidate: Classical Cypriot Herakles. Use as sculptural source, then retopologise, rebuild missing combat anatomy as required and rig to common skeleton.'}
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
  gate:'A fighter is not status=ready until licence, mesh quality, rig, PBR materials, scale, animation mapping and mobile performance have all passed.'
};
