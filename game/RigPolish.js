import { THREE } from '../vendor/three.js';

const makeMat=(color,rough=.62,metal=.02)=>new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal});
const add=(parent,geo,mat,pos=[0,0,0],scale=[1,1,1])=>{const m=new THREE.Mesh(geo,mat);m.position.set(...pos);m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m};

export function addRigPolish(f){
  if(!f?.group||f.rigPolishAdded)return;
  const d=f.def,formal=['trump','netanyahu','kirk'].includes(d.id),stone=d.id==='greek';
  const skin=makeMat(stone?0xd7d2c8:d.palette.skin,stone?.92:.58),cloth=makeMat(d.palette.primary,.72,.025),shoe=makeMat(stone?0xc8c2b8:0x151518,.82,.04);
  const upperMat=formal?cloth:skin,legMat=stone?skin:cloth;
  // Connected ball joints hide the mechanical gaps without changing the animation rig.
  for(const arm of [f.leftArm,f.rightArm]) add(arm,new THREE.SphereGeometry(.155,14,10),upperMat,[0,-.035,0],[1.05,.96,1.02]);
  for(const fore of [f.leftFore,f.rightFore]) add(fore,new THREE.SphereGeometry(.125,12,9),skin,[0,-.02,0],[1.03,.92,1]);
  for(const leg of [f.leftLeg,f.rightLeg]) add(leg,new THREE.SphereGeometry(.205,14,10),legMat,[0,-.035,0],[1.05,.9,1]);
  for(const shin of [f.leftShin,f.rightShin]) add(shin,new THREE.SphereGeometry(.16,12,9),legMat,[0,-.02,0],[1.04,.9,1]);
  // Pelvis and waist bridge the independently animated torso and legs.
  add(f.group,new THREE.CapsuleGeometry(.34,.28,8,14),legMat,[0,1.13,0],[1.04,.78,.82]);
  add(f.root,new THREE.CylinderGeometry(.31,.36,.26,14),formal?cloth:legMat,[0,.08,0],[1,.92,.82]);
  // Collar/neck mass prevents floating heads during hit reactions and finishers.
  add(f.torso,new THREE.CylinderGeometry(.17,.21,.24,14),skin,[0,.80,0],[1,.96,1]);
  if(formal){
    add(f.torso,new THREE.BoxGeometry(.58,.12,.30,2,1,2),cloth,[0,.61,0],[1,.9,1]);
  }
  // Rounded shoe fronts read as feet rather than detached blocks at distance.
  for(const shin of [f.leftShin,f.rightShin]) add(shin,new THREE.CapsuleGeometry(.115,.22,6,10),shoe,[0,-.72,.13],[1.12,.72,1.55]);
  f.rigPolishAdded=true;
}
