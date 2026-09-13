import { THREE } from '../vendor/three.js';

const mat=(color,rough=.62,metal=.02)=>new THREE.MeshPhysicalMaterial({color,roughness:rough,metalness:metal,clearcoat:rough<.5?.08:.02,clearcoatRoughness:.72});
const add=(p,g,m,pos=[0,0,0],rot=[0,0,0],scale=[1,1,1])=>{const x=new THREE.Mesh(g,m);x.position.set(...pos);x.rotation.set(...rot);x.scale.set(...scale);x.castShadow=true;x.receiveShadow=true;p.add(x);return x};

function hand(f,pivot,skin,mirror=1){
  add(pivot,new THREE.BoxGeometry(.17,.16,.105,2,2,2),skin,[0,-.60,.035],[0,0,mirror*.02],[1,.9,1]);
  const knuckle=add(pivot,new THREE.CapsuleGeometry(.026,.105,5,8),skin,[mirror*.055,-.665,.09],[Math.PI/2,0,mirror*.08],[1,.9,1]);knuckle.scale.z=.85;
  for(let i=0;i<4;i++){const x=(i-1.5)*.034;add(pivot,new THREE.CapsuleGeometry(.018,.09-i*.006,4,7),skin,[x,-.69,.10],[Math.PI/2,0,(i-1.5)*.018]);}
  add(pivot,new THREE.CapsuleGeometry(.021,.09,4,7),skin,[mirror*.105,-.625,.055],[.35,0,mirror*.72],[1,.9,1]);
}

export function addAnatomyDetail(f){
  if(!f?.torso||f.anatomyDetailAdded)return;const d=f.def,id=d.id,formal=['trump','netanyahu','kirk'].includes(id),stone=id==='greek';
  const skin=mat(stone?0xd7d2c8:d.palette.skin,stone?.92:.57),cloth=mat(d.palette.primary,.76,.025),cloth2=mat(d.palette.secondary,.72,.03),dark=mat(0x111114,.86,.01);
  // Trap/neck planes and shoulder caps hide the base capsule intersections.
  add(f.torso,new THREE.CapsuleGeometry(.105,.30,7,12),formal?cloth:skin,[-.37,.58,.005],[0,0,-1.18],[1.12,.9,1]);
  add(f.torso,new THREE.CapsuleGeometry(.105,.30,7,12),formal?cloth:skin,[.37,.58,.005],[0,0,1.18],[1.12,.9,1]);
  add(f.torso,new THREE.CapsuleGeometry(.13,.22,7,12),formal?cloth:skin,[-.47,.50,0],[0,0,-.18],[1,.88,1]);
  add(f.torso,new THREE.CapsuleGeometry(.13,.22,7,12),formal?cloth:skin,[.47,.50,0],[0,0,.18],[1,.88,1]);
  // Sleeves for the jacket characters. Base rig intentionally leaves the wrist/hand exposed only.
  if(formal){for(const fore of[f.leftFore,f.rightFore]){add(fore,new THREE.CapsuleGeometry(.128,.39,7,12),cloth,[0,-.255,0],[0,0,0],[1.04,1,1]);add(fore,new THREE.TorusGeometry(.126,.016,8,18),cloth2,[0,-.49,0],[Math.PI/2,0,0]);}}
  else{
    // Subtle bicep/forearm volume for exposed arms without ballooning the silhouette.
    for(const arm of[f.leftArm,f.rightArm])add(arm,new THREE.SphereGeometry(.155,12,9),skin,[0,-.32,.015],[0,0,0],[1.03,1.18,.94]);
    for(const fore of[f.leftFore,f.rightFore])add(fore,new THREE.CapsuleGeometry(.104,.30,6,10),skin,[0,-.28,.005],[0,0,0],[1.02,1,.94]);
  }
  hand(f,f.leftFore,skin,-1);hand(f,f.rightFore,skin,1);
  // Hip, thigh and calf volume. All clothing follows the fighter palette except the marble fighter.
  const legMat=stone?skin:cloth;
  add(f.group,new THREE.CapsuleGeometry(.22,.34,7,12),legMat,[-.22,.82,.01],[0,0,0],[1.03,1,.92]);
  add(f.group,new THREE.CapsuleGeometry(.22,.34,7,12),legMat,[.22,.82,.01],[0,0,0],[1.03,1,.92]);
  for(const leg of[f.leftLeg,f.rightLeg])add(leg,new THREE.CapsuleGeometry(.185,.34,7,11),legMat,[0,-.38,.02],[0,0,0],[1.04,1.12,.92]);
  for(const shin of[f.leftShin,f.rightShin])add(shin,new THREE.CapsuleGeometry(.145,.31,7,11),legMat,[0,-.36,-.015],[0,0,0],[1.05,1.14,.92]);
  // Ankle and shoe transitions prevent floating box-feet.
  for(const shin of[f.leftShin,f.rightShin]){add(shin,new THREE.CylinderGeometry(.115,.105,.12,12),legMat,[0,-.63,.015]);add(shin,new THREE.BoxGeometry(.29,.10,.43,2,2,2),stone?skin:dark,[0,-.73,.13],[0,0,0],[1,.9,1]);}
  f.anatomyDetailAdded=true;
}
