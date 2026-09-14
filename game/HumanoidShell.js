import { THREE } from '../vendor/three.js';

const PROFILE={
  trump:{shoulder:.345,chest:.325,rib:.300,waist:.255,hip:.275,depth:.66,y0:-.42,y1:.58},
  netanyahu:{shoulder:.315,chest:.300,rib:.280,waist:.235,hip:.250,depth:.65,y0:-.42,y1:.57},
  kirk:{shoulder:.325,chest:.300,rib:.270,waist:.225,hip:.240,depth:.62,y0:-.43,y1:.59},
  floyd:{shoulder:.385,chest:.365,rib:.340,waist:.290,hip:.315,depth:.70,y0:-.43,y1:.60},
  wojak:{shoulder:.300,chest:.280,rib:.255,waist:.220,hip:.235,depth:.61,y0:-.42,y1:.57},
  gigachad:{shoulder:.415,chest:.385,rib:.335,waist:.245,hip:.280,depth:.68,y0:-.43,y1:.61},
  agarthan:{shoulder:.285,chest:.260,rib:.235,waist:.198,hip:.215,depth:.58,y0:-.44,y1:.62},
  greek:{shoulder:.390,chest:.365,rib:.335,waist:.285,hip:.310,depth:.70,y0:-.43,y1:.61}
};

function shellGeometry(p){
  const pts=[
    new THREE.Vector2(p.hip,p.y0),
    new THREE.Vector2(p.waist,-.30),
    new THREE.Vector2(p.waist*.98,-.18),
    new THREE.Vector2(p.rib,-.02),
    new THREE.Vector2(p.chest,.18),
    new THREE.Vector2(p.shoulder,.38),
    new THREE.Vector2(p.shoulder*.92,.50),
    new THREE.Vector2(p.chest*.78,p.y1)
  ];
  const g=new THREE.LatheGeometry(pts,24);g.computeVertexNormals();return g;
}

function hideLegacyTorso(f){
  if(f.chestMesh)f.chestMesh.visible=false;
  for(const o of f.torso.children){
    if(!o.isMesh||o===f.chestMesh)continue;
    const type=o.geometry?.type||'';
    if(type==='CylinderGeometry'&&o.position.y<-.12)o.visible=false;
  }
}

export function applyHumanoidShell(f){
  if(!f?.torso||f.humanoidShellApplied)return;const p=PROFILE[f.def.id]||PROFILE.netanyahu;
  hideLegacyTorso(f);
  const base=f.chestMesh?.material;
  if(base){
    const shell=new THREE.Mesh(shellGeometry(p),base);shell.name='humanoid-torso-shell';shell.position.y=.08;shell.scale.z=p.depth;shell.castShadow=true;shell.receiveShadow=true;f.torso.add(shell);f.humanoidTorso=shell;
  }
  const broad=f.def.id==='gigachad'?1.04:f.def.id==='floyd'||f.def.id==='greek'?1.02:1;
  const shoulder=p.shoulder*broad*.98;
  if(f.leftArm)f.leftArm.position.x=-shoulder;
  if(f.rightArm)f.rightArm.position.x=shoulder;
  if(f.leftArm)f.leftArm.position.y=.50;
  if(f.rightArm)f.rightArm.position.y=.50;
  if(f.pelvis){
    for(const o of f.pelvis.children)if(o.isMesh){o.scale.x*=.82;o.scale.z*=.84;}
  }
  f.humanoidShellApplied=true;
}
