import { THREE } from '../vendor/three.js';

const makeMat=(color,rough=.62,metal=.02)=>new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal});
const add=(parent,geo,mat,pos=[0,0,0],scale=[1,1,1])=>{const m=new THREE.Mesh(geo,mat);m.position.set(...pos);m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m};

export function addRigPolish(f){
  if(!f?.group||f.rigPolishAdded)return;
  const d=f.def,formal=['trump','netanyahu','kirk'].includes(d.id),stone=d.id==='greek';
  const skin=makeMat(stone?0xd7d2c8:d.palette.skin,stone?.92:.58),cloth=makeMat(d.palette.primary,.72,.025),shoe=makeMat(stone?0xc8c2b8:0x151518,.82,.04);
  const upperMat=formal?cloth:skin,legMat=stone?skin:cloth;
  // Small transition masses fill joint seams without reading as visible balls.
  for(const arm of [f.leftArm,f.rightArm]) add(arm,new THREE.SphereGeometry(.108,12,9),upperMat,[0,-.025,0],[1.03,.86,.96]);
  for(const fore of [f.leftFore,f.rightFore]) add(fore,new THREE.SphereGeometry(.092,11,8),skin,[0,-.012,0],[1,.82,.94]);
  for(const leg of [f.leftLeg,f.rightLeg]) add(leg,new THREE.SphereGeometry(.145,12,9),legMat,[0,-.025,0],[1.02,.82,.94]);
  for(const shin of [f.leftShin,f.rightShin]) add(shin,new THREE.SphereGeometry(.118,11,8),legMat,[0,-.012,0],[1,.82,.92]);
  // Compact pelvis and waist bridge torso/legs while staying behind the main silhouette.
  add(f.group,new THREE.CapsuleGeometry(.285,.20,8,14),legMat,[0,1.11,0],[1.02,.70,.76]);
  add(f.root,new THREE.CylinderGeometry(.275,.31,.20,14),formal?cloth:legMat,[0,.07,0],[1,.88,.78]);
  add(f.torso,new THREE.CylinderGeometry(.145,.185,.18,14),skin,[0,.80,0],[1,.90,.95]);
  if(formal)add(f.torso,new THREE.BoxGeometry(.52,.085,.25,2,1,2),cloth,[0,.60,0],[1,.86,1]);
  // One compact toe cap extends the existing shoe instead of layering a second full foot.
  for(const shin of [f.leftShin,f.rightShin]) add(shin,new THREE.CapsuleGeometry(.085,.14,6,10),shoe,[0,-.715,.17],[1.05,.62,1.35]);
  f.rigPolishAdded=true;
}
