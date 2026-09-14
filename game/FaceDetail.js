import { THREE } from '../vendor/three.js';

const std=(color,rough=.68,metal=.02)=>new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal});
const add=(p,g,m,pos=[0,0,0],rot=[0,0,0],scale=[1,1,1])=>{const x=new THREE.Mesh(g,m);x.position.set(...pos);x.rotation.set(...rot);x.scale.set(...scale);x.castShadow=true;p.add(x);return x};

export function addFaceDetail(fighter){
  const d=fighter.def,id=d.id,h=fighter.head;if(!h)return;
  const rig={eyes:[],pupils:[],lids:[],brows:[],mouth:null,jaw:null,cheeks:[]};fighter.faceRig=rig;
  if(id==='wojak'){
    const dark=std(0x202023,.82);for(const sx of[-1,1]){const e=add(h,new THREE.SphereGeometry(.029,10,7),dark,[sx*.1,.04,.304]);rig.eyes.push(e);rig.pupils.push(e)}
    rig.mouth=add(h,new THREE.TorusGeometry(.095,.012,6,18,Math.PI),dark,[0,-.13,.305],[0,0,Math.PI]);rig.jaw=h;fighter.faceDetailAdded=true;return;
  }
  const skin=std(d.palette.skin,id==='greek'?.92:.61),white=std(id==='greek'?0xd8d2c6:0xeee7df,.38),dark=std(id==='greek'?0x8c877e:0x171317,.76),iris=std(id==='agarthan'?0x8ffcff:id==='floyd'?0x35241d:0x56707d,.40,.05),catchlight=std(0xffffff,.18);
  const eyeY=id==='gigachad'?.08:id==='trump'?.06:.065,eyeX=id==='gigachad'?.118:id==='netanyahu'?.102:.105,front=.322;
  for(const sx of[-1,1]){
    const eye=add(h,new THREE.SphereGeometry(.054,14,9),white,[sx*eyeX,eyeY,front],[0,0,0],[1.18,.60,.48]);rig.eyes.push(eye);
    const pupil=add(h,new THREE.SphereGeometry(.025,12,8),iris,[sx*eyeX,eyeY,front+.041],[0,0,0],[.92,.78,.32]);rig.pupils.push(pupil);
    add(h,new THREE.SphereGeometry(.011,8,6),dark,[sx*eyeX,eyeY,front+.059],[0,0,0],[1,.95,.3]);
    add(h,new THREE.SphereGeometry(.006,7,5),catchlight,[sx*eyeX-.007,eyeY+.011,front+.066],[0,0,0],[1,.8,.28]);
    const lid=add(h,new THREE.BoxGeometry(.128,.017,.024),skin,[sx*eyeX,eyeY+.044,front+.018],[0,0,sx*.045]);lid.scale.y=.78;rig.lids.push(lid);
    add(h,new THREE.BoxGeometry(.12,.010,.018),skin,[sx*eyeX,eyeY-.043,front+.017],[0,0,-sx*.025]);
  }
  const jawW=id==='gigachad'?.29:id==='floyd'?.25:id==='trump'?.235:.22,jawY=id==='gigachad'?.105:.09;
  rig.jaw=add(h,new THREE.BoxGeometry(jawW,jawY,.12),skin,[0,-.19,.12],[0,0,0],[1,.74,.88]);
  add(h,new THREE.SphereGeometry(id==='gigachad'?.083:.068,12,8),skin,[0,-.235,.20],[0,0,0],[1.0,.65,.78]);
  add(h,new THREE.BoxGeometry(.07,.16,.065),skin,[0,.015,.285],[.06,0,0],[.72,1,.72]);
  add(h,new THREE.SphereGeometry(.055,11,8),skin,[0,-.075,.332],[0,0,0],[.82,.68,.72]);
  for(const sx of[-1,1]){
    rig.cheeks.push(add(h,new THREE.SphereGeometry(.095,10,8),skin,[sx*.145,-.035,.275],[0,0,0],[1,.62,.48]));
    add(h,new THREE.SphereGeometry(.05,9,7),skin,[sx*.285,-.015,.04],[0,0,0],[.42,.9,.52]);
  }
  const lip=std(id==='greek'?0xa9a49b:id==='floyd'?0x4c2f28:0x6f4440,.72);rig.mouth=add(h,new THREE.BoxGeometry(id==='gigachad'?.16:.135,.023,.022),lip,[0,-.158,.335],[0,0,0],[1,.70,1]);rig.mouth.rotation.z=id==='trump'?.025:id==='netanyahu'?-.012:0;
  add(h,new THREE.BoxGeometry(id==='gigachad'?.15:.125,.009,.018),dark,[0,-.166,.342]);
  if(['floyd','gigachad'].includes(id)){
    const beard=std(id==='floyd'?0x241813:0x171310,.88);add(h,new THREE.BoxGeometry(id==='gigachad'?.38:.30,.13,.19),beard,[0,-.205,.10],[0,0,0],[1,.75,1]);add(h,new THREE.BoxGeometry(.24,.045,.035),beard,[0,-.142,.318]);
  }
  const browColor=id==='trump'?0xc89d57:id==='netanyahu'?0x77736e:id==='kirk'?0x5b3a2a:id==='greek'?0xa9a398:0x2b211d;
  const brow=std(browColor,.84);for(const sx of[-1,1]){const tilt=id==='gigachad'?.07:id==='trump'?.08:.035;rig.brows.push(add(h,new THREE.BoxGeometry(.125,.024,.032),brow,[sx*.105,.137,.31],[0,0,sx*tilt]));}
  if(id==='trump')add(h,new THREE.BoxGeometry(.30,.028,.018),std(0xd3ab6b,.75),[.02,.31,.02],[0,0,-.12]);
  if(id==='agarthan'){
    const glow=std(0xbfffff,.25,.12);glow.emissive=new THREE.Color(0x55ffff);glow.emissiveIntensity=1.5;for(const sx of[-1,1])add(h,new THREE.TorusGeometry(.057,.009,7,16),glow,[sx*eyeX,eyeY,front+.058],[0,0,0]);
  }else if(id==='greek'){
    const curls=std(0xc9c3b7,.95);for(let i=0;i<6;i++)add(h,new THREE.TorusGeometry(.05,.022,6,12),curls,[(i-2.5)*.09,.27+(i%2)*.04,.04],[Math.PI/2,0,(i-2.5)*.15]);
  }
  fighter.faceDetailAdded=true;
}
