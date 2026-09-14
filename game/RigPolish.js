import { THREE } from '../vendor/three.js';

const makeMat=(color,rough=.62,metal=.02)=>new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal});
const add=(parent,geo,mat,pos=[0,0,0],scale=[1,1,1],rot=[0,0,0])=>{const m=new THREE.Mesh(geo,mat);m.position.set(...pos);m.scale.set(...scale);m.rotation.set(...rot);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m};

export function addRigPolish(f){
  if(!f?.group||f.rigPolishAdded)return;
  const d=f.def,formal=['trump','netanyahu','kirk'].includes(d.id),stone=d.id==='greek';
  const skin=makeMat(stone?0xd7d2c8:d.palette.skin,stone?.92:.58),cloth=makeMat(d.palette.primary,.76,.025),shoe=makeMat(stone?0xc8c2b8:0x151518,.84,.04);
  const upperMat=formal?cloth:skin,legMat=stone?skin:cloth;
  for(const arm of [f.leftArm,f.rightArm]) add(arm,new THREE.SphereGeometry(.070,14,10),upperMat,[0,-.025,0],[1.0,.72,.88]);
  for(const fore of [f.leftFore,f.rightFore]) add(fore,new THREE.SphereGeometry(.060,13,9),skin,[0,-.012,0],[1,.70,.86]);
  for(const leg of [f.leftLeg,f.rightLeg]) add(leg,new THREE.SphereGeometry(.094,14,10),legMat,[0,-.025,0],[1,.72,.88]);
  for(const shin of [f.leftShin,f.rightShin]) add(shin,new THREE.SphereGeometry(.075,13,9),legMat,[0,-.012,0],[1,.70,.86]);
  add(f.root,new THREE.CylinderGeometry(.205,.235,.14,18),formal?cloth:legMat,[0,.07,0],[1,.82,.74]);
  add(f.torso,new THREE.CylinderGeometry(.092,.112,.16,18),skin,[0,.80,0],[1,.88,.90]);
  for(const [fore,side] of [[f.leftFore,-1],[f.rightFore,1]]){
    add(fore,new THREE.CapsuleGeometry(.057,.105,7,12),skin,[0,-.585,.020],[.90,.90,.78],[0,0,side*.035]);
    add(fore,new THREE.SphereGeometry(.028,10,8),skin,[side*.046,-.565,.047],[.68,.95,.72]);
  }
  for(const shin of [f.leftShin,f.rightShin]) add(shin,new THREE.CapsuleGeometry(.058,.16,7,12),shoe,[0,-.705,.135],[1.00,.55,1.55]);
  f.rigPolishAdded=true;
}
