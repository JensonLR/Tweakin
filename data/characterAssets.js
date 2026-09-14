// Authored character asset registry.
// Procedural fighters are legacy fallback only. Public-facing presentation should
// prefer authored GLB assets once a model has been licensed, optimised and added.

export const CHARACTER_ASSETS={
  trump:{path:null,status:'sourcing',targetTriangles:70000,sourceNote:'Use a licensed realistic, rigged likeness with game-ready topology and PBR textures.'},
  netanyahu:{path:null,status:'sourcing',targetTriangles:70000,sourceNote:'Use a licensed realistic, rigged likeness or commission/author an equivalent game-ready model.'},
  kirk:{path:null,status:'sourcing',targetTriangles:65000,sourceNote:'Use a licensed realistic, rigged likeness or author from a high-quality human base.'},
  floyd:{path:null,status:'sourcing',targetTriangles:70000,sourceNote:'Use a licensed respectful likeness; no real-world death recreation or related content.'},
  wojak:{path:null,status:'sourcing',targetTriangles:40000,sourceNote:'Author a premium stylised Wojak interpretation on the common humanoid combat rig.'},
  gigachad:{path:null,status:'sourcing',targetTriangles:80000,sourceNote:'Use a licensed/authorised high-fidelity muscular likeness on the common humanoid combat rig.'},
  agarthan:{path:null,status:'sourcing',targetTriangles:75000,sourceNote:'Use a pale-silver high-fidelity humanoid/alien base, then art-direct wardrobe and face to TWEAKIN.'},
  greek:{path:null,status:'sourcing',targetTriangles:80000,sourceNote:'Use a public-domain or commercially licensed classical male sculpture scan, retopologised and rigged for combat.'}
};

export const authoredAssetFor=id=>CHARACTER_ASSETS[id]??null;
export const hasAuthoredAsset=id=>Boolean(CHARACTER_ASSETS[id]?.path&&CHARACTER_ASSETS[id]?.status==='ready');

export const CHARACTER_ASSET_REQUIREMENTS={
  format:'GLB 2.0 preferred',
  rig:'Common humanoid combat skeleton; hips/root, spine, chest, neck, head, clavicles, upper/lower arms, hands, upper/lower legs, feet',
  materials:'PBR baseColor + normal + roughness/metalness; embedded or local textures only',
  animationClips:['idle','walk','run','light_1','light_2','heavy_1','heavy_2','grapple','block','parry','evade','hit_light','hit_heavy','knockdown','getup','special_1','special_2','victory','ko'],
  webTargets:{desktopTriangles:'55k-90k',mobileTriangles:'25k-55k',textureMaxDesktop:2048,textureMaxMobile:1024},
  likeness:'No generic placeholder heads for real-person roster slots.',
  fallback:'Legacy procedural geometry is debug/fallback only and must not be presented as final character art.'
};
