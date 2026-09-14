import { THREE } from '../vendor/three.js';

const std=(color,rough=.68,metal=.02)=>new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal});
const add=(p,g,m,pos=[0,0,0],rot=[0,0,0],scale=[1,1,1])=>{const x=new THREE.Mesh(g,m);x.position.set(...pos);x.rotation.set(...rot);x.scale.set(...scale);x.castShadow=true;p.add(x);return x};

export function addFaceDetail(f){
  const d=f.def,id=d.id,h=f.head;if(!h||f.faceDetailAdded)return;
  const rig={eyes:[],pupils:[],lids:[],brows:[],mouth:null,jaw:null,cheeks:[]};f.faceRig=rig;
  const skin=std(d.palette.skin,id==='greek'?.94:.63),dark=std(id==='greek'?0x8d887f:0x21191a,.78),white=std(id==='greek'?0xd6d0c5:0xe7e2dc,.46),iris=std(id==='agarthan'?0x8ffcff:id==='floyd'?0x35241d:0x536977,.42,.03);
  if(id==='wojak'){
    for(const sx of[-1,1]){const e=add(h,new THREE.SphereGeometry(.018,8,6),dark,[sx*.082,.035,.278],[0,0,0],[1,.78,.55]);rig.eyes.push(e);rig.pupils.push(e)}
    rig.mouth=add(h,new THREE.TorusGeometry(.072,.009,6,18,Math.PI),dark,[0,-.105,.282],[0,0,Math.PI]);rig.jaw=h;f.faceDetailAdded=true;return;
  }
  const eyeY=id==='gigachad'?.052:.045,eyeX=id==='gigachad'?.095:.088,front=.273;
  for(const sx of[-1,1]){
    const eye=add(h,new THREE.SphereGeometry(.034,12,8),white,[sx*eyeX,eyeY,front],[0,0,0],[1.28,.58,.42]);rig.eyes.push(eye);
    const pupil=add(h,new THREE.SphereGeometry(.012,9,7),iris,[sx*eyeX,eyeY,front+.027],[0,0,0],[1,.92,.42]);rig.pupils.push(pupil);
    const lid=add(h,new THREE.BoxGeometry(.082,.010,.012),skin,[sx*eyeX,eyeY+.029,front+.006],[0,0,sx*.035]);rig.lids.push(lid);
  }
  // Nose bridge + tip stay close to the skull to avoid the toy-face silhouette.
  add(h,new THREE.CapsuleGeometry(.025,.075,5,8),skin,[0,-.005,.266],[Math.PI/2,0,0],[.78,1,.72]);
  add(h,new THREE.SphereGeometry(.030,9,7),skin,[0,-.055,.292],[0,0,0],[.88,.70,.72]);
  for(const sx of[-1,1])add(h,new THREE.SphereGeometry(.038,9,7),skin,[sx*.235,-.01,.015],[0,0,0],[.55,1,.62]);
  const jawW=id==='gigachad'?.185:id==='floyd'?.165:.145;
  rig.jaw=add(h,new THREE.CapsuleGeometry(jawW,.055,6,10),skin,[0,-.145,.015],[0,0,Math.PI/2],[1,.70,.72]);
  const lip=std(id==='greek'?0xa39e95:id==='floyd'?0x4b312b:0x704842,.76);rig.mouth=add(h,new THREE.BoxGeometry(id==='gigachad'?.12:.10,.012,.010),lip,[0,-.112,.284]);
  for(const sx of[-1,1])rig.cheeks.push(add(h,new THREE.SphereGeometry(.052,9,7),skin,[sx*.115,-.045,.238],[0,0,0],[1,.54,.42]));
  const browColor=id==='trump'?0xbd965c:id==='netanyahu'?0x77736e:id==='kirk'?0x4f3328:id==='greek'?0xa9a398:0x2b211d,brow=std(browColor,.84);
  for(const sx of[-1,1]){const b=add(h,new THREE.BoxGeometry(.088,.014,.014),brow,[sx*.088,.105,.264],[0,0,sx*(id==='gigachad'?.09:.035)]);rig.brows.push(b)}
  if(['floyd','gigachad'].includes(id)){
    const beard=std(id==='floyd'?0x241813:0x171310,.90);add(h,new THREE.CapsuleGeometry(id==='gigachad'?.14:.115,.045,6,10),beard,[0,-.17,.008],[0,0,Math.PI/2],[1,.70,.76]);add(h,new THREE.BoxGeometry(.16,.022,.016),beard,[0,-.105,.278]);
  }
  if(id==='agarthan'){
    const glow=std(0xc7ffff,.24,.08);glow.emissive=new THREE.Color(0x55ffff);glow.emissiveIntensity=1.15;for(const sx of[-1,1])add(h,new THREE.TorusGeometry(.030,.005,6,14),glow,[sx*eyeX,eyeY,front+.033]);
  }else if(id==='greek'){
    const curls=std(0xc8c2b7,.96);for(let i=0;i<5;i++)add(h,new THREE.TorusGeometry(.034,.014,6,10),curls,[(i-2)*.07,.23+(i%2)*.035,-.03],[Math.PI/2,0,(i-2)*.12]);
  }
  f.faceDetailAdded=true;
}
