import { THREE } from '../vendor/three.js';

const mat=(color,rough=.62,metal=.02)=>new THREE.MeshPhysicalMaterial({color,roughness:rough,metalness:metal,clearcoat:rough<.5?.08:.02,clearcoatRoughness:.72});
const add=(p,g,m,pos=[0,0,0],rot=[0,0,0],scale=[1,1,1])=>{const x=new THREE.Mesh(g,m);x.position.set(...pos);x.rotation.set(...rot);x.scale.set(...scale);x.castShadow=true;x.receiveShadow=true;p.add(x);return x};

function hand(f,pivot,skin,mirror=1){
  // Compact mitten/palm mass reads cleanly at gameplay distance. Fingers are deliberately restrained to avoid a spiky procedural silhouette.
  add(pivot,new THREE.CapsuleGeometry(.075,.13,6,10),skin,[0,-.58,.035],[0,0,mirror*.04],[1.05,.90,.72]);
  add(pivot,new THREE.CapsuleGeometry(.026,.10,5,8),skin,[mirror*.078,-.60,.052],[.25,0,mirror*.62],[.92,.88,.86]);
}

export function addAnatomyDetail(f){
  if(!f?.torso||f.anatomyDetailAdded)return;const d=f.def,id=d.id,formal=['trump','netanyahu','kirk'].includes(id),stone=id==='greek';
  const skin=mat(stone?0xd7d2c8:d.palette.skin,stone?.92:.57),cloth=mat(d.palette.primary,.76,.025),cloth2=mat(d.palette.secondary,.72,.03);
  // Shoulder transition masses only. RigPolish owns the actual joint bridging so geometry is not duplicated three times.
  add(f.torso,new THREE.CapsuleGeometry(.095,.25,7,12),formal?cloth:skin,[-.39,.57,.005],[0,0,-1.18],[1.02,.82,.92]);
  add(f.torso,new THREE.CapsuleGeometry(.095,.25,7,12),formal?cloth:skin,[.39,.57,.005],[0,0,1.18],[1.02,.82,.92]);
  if(formal){
    // Jacket sleeves cover most of the forearm, leaving the wrist/hand exposed.
    for(const fore of[f.leftFore,f.rightFore]){add(fore,new THREE.CapsuleGeometry(.112,.30,7,12),cloth,[0,-.22,0],[0,0,0],[1.0,1,.96]);add(fore,new THREE.TorusGeometry(.112,.012,8,18),cloth2,[0,-.43,0],[Math.PI/2,0,0]);}
  }
  hand(f,f.leftFore,skin,-1);hand(f,f.rightFore,skin,1);
  // Follow the animated pivots rather than adding static hip/calf duplicates to the world group.
  const legMat=stone?skin:cloth;
  for(const leg of[f.leftLeg,f.rightLeg])add(leg,new THREE.CapsuleGeometry(.175,.25,7,11),legMat,[0,-.30,.015],[0,0,0],[1.01,1.02,.94]);
  for(const shin of[f.leftShin,f.rightShin])add(shin,new THREE.CapsuleGeometry(.135,.22,7,11),legMat,[0,-.29,-.005],[0,0,0],[1.0,1.03,.94]);
  // Only an ankle cuff here. CharacterDetail/RigPolish own footwear to prevent triple-stacked shoes.
  for(const shin of[f.leftShin,f.rightShin])add(shin,new THREE.CylinderGeometry(.105,.10,.09,12),legMat,[0,-.62,.015]);
  f.anatomyDetailAdded=true;
}
