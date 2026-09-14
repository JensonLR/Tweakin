import { THREE } from '../vendor/three.js';

const mat=(color,rough=.62,metal=.02)=>new THREE.MeshPhysicalMaterial({color,roughness:rough,metalness:metal,clearcoat:rough<.5?.08:.02,clearcoatRoughness:.72});
const add=(p,g,m,pos=[0,0,0],rot=[0,0,0],scale=[1,1,1])=>{const x=new THREE.Mesh(g,m);x.position.set(...pos);x.rotation.set(...rot);x.scale.set(...scale);x.castShadow=true;x.receiveShadow=true;p.add(x);return x};

export function addAnatomyDetail(f){
  if(!f?.torso||f.anatomyDetailAdded)return;const d=f.def,id=d.id,formal=['trump','netanyahu','kirk'].includes(id),stone=id==='greek';
  const skin=mat(stone?0xd7d2c8:d.palette.skin,stone?.92:.57),cloth=mat(d.palette.primary,.76,.025),cloth2=mat(d.palette.secondary,.72,.03);
  // This layer now owns transitions only. Base Fighter owns limbs; RigPolish owns hands, feet and joint continuity.
  add(f.torso,new THREE.SphereGeometry(.105,10,8),formal?cloth:skin,[-.39,.55,0],[0,0,0],[1.15,.88,.94]);
  add(f.torso,new THREE.SphereGeometry(.105,10,8),formal?cloth:skin,[.39,.55,0],[0,0,0],[1.15,.88,.94]);
  if(formal){
    for(const fore of[f.leftFore,f.rightFore])add(fore,new THREE.TorusGeometry(.10,.010,7,16),cloth2,[0,-.42,0],[Math.PI/2,0,0]);
  }
  // Small knee/ankle seams provide articulation cues without increasing body mass.
  const legMat=stone?skin:cloth;for(const leg of[f.leftLeg,f.rightLeg])add(leg,new THREE.TorusGeometry(.13,.010,7,16),legMat,[0,-.58,0],[Math.PI/2,0,0]);
  for(const shin of[f.leftShin,f.rightShin])add(shin,new THREE.TorusGeometry(.095,.009,7,16),legMat,[0,-.56,.01],[Math.PI/2,0,0]);
  f.anatomyDetailAdded=true;
}
