import { THREE } from '../vendor/three.js';

const std=(color,rough=.68,metal=.02)=>new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal});
const add=(p,g,m,pos=[0,0,0],rot=[0,0,0],scale=[1,1,1])=>{const x=new THREE.Mesh(g,m);x.position.set(...pos);x.rotation.set(...rot);x.scale.set(...scale);x.castShadow=true;p.add(x);return x};
const PROFILE={
  trump:{jaw:1.03,crown:1.02,length:1.02,depth:.96,chin:.98,eyeX:.092,eyeY:.045},
  netanyahu:{jaw:.94,crown:1.00,length:1.05,depth:.96,chin:.92,eyeX:.086,eyeY:.050},
  kirk:{jaw:.97,crown:1.02,length:1.04,depth:.98,chin:.95,eyeX:.090,eyeY:.050},
  floyd:{jaw:1.04,crown:.98,length:1.07,depth:1.00,chin:1.03,eyeX:.092,eyeY:.043},
  gigachad:{jaw:1.15,crown:1.02,length:1.08,depth:1.02,chin:1.10,eyeX:.096,eyeY:.043},
  agarthan:{jaw:.88,crown:1.06,length:1.09,depth:.93,chin:.88,eyeX:.095,eyeY:.056},
  greek:{jaw:1.02,crown:1.00,length:1.07,depth:.99,chin:1.02,eyeX:.090,eyeY:.048},
  wojak:{jaw:.90,crown:1.02,length:1.08,depth:.92,chin:.88,eyeX:.082,eyeY:.035}
};
function sculptSkull(f,id){
  const mesh=f.skullMesh,geo=mesh?.geometry;if(!geo?.attributes?.position||geo.userData?.tweakinSculpted)return;
  const p=PROFILE[id]||PROFILE.netanyahu,a=geo.attributes.position;
  for(let i=0;i<a.count;i++){
    let x=a.getX(i),y=a.getY(i),z=a.getZ(i),ny=y/.285;
    const lower=Math.max(0,-ny),upper=Math.max(0,ny),jawScale=1-(1-p.jaw)*lower,crownScale=1+(p.crown-1)*upper;
    x*=jawScale*crownScale;
    y*=p.length;
    z*=p.depth*(1-lower*.035);
    if(ny<-.35){x*=p.chin;z+=.010*lower;}
    if(ny>.12&&z>.02)z-=upper*.010;
    a.setXYZ(i,x,y,z);
  }
  a.needsUpdate=true;geo.computeVertexNormals();geo.computeBoundingSphere();geo.userData.tweakinSculpted=true;
}
export function addFaceDetail(f){
  const d=f.def,id=d.id,h=f.head;if(!h||f.faceDetailAdded)return;sculptSkull(f,id);
  const rig={eyes:[],pupils:[],lids:[],brows:[],mouth:null,jaw:null,cheeks:[]};f.faceRig=rig;
  const skin=std(d.palette.skin,id==='greek'?.94:.63),dark=std(id==='greek'?0x8d887f:0x21191a,.78),white=std(id==='greek'?0xd6d0c5:0xe5dfd8,.48),iris=std(id==='agarthan'?0x8ffcff:id==='floyd'?0x35241d:0x526878,.42,.03),p=PROFILE[id]||PROFILE.netanyahu;
  if(id==='wojak'){
    for(const sx of[-1,1]){const e=add(h,new THREE.SphereGeometry(.015,8,6),dark,[sx*p.eyeX,p.eyeY,.278],[0,0,0],[1,.74,.50]);rig.eyes.push(e);rig.pupils.push(e)}
    rig.mouth=add(h,new THREE.TorusGeometry(.066,.008,6,18,Math.PI),dark,[0,-.112,.280],[0,0,Math.PI]);rig.jaw=h;f.faceDetailAdded=true;return;
  }
  const eyeX=p.eyeX,eyeY=p.eyeY,front=.274;
  for(const sx of[-1,1]){
    const eye=add(h,new THREE.SphereGeometry(.030,14,9),white,[sx*eyeX,eyeY,front],[0,0,0],[1.34,.52,.38]);rig.eyes.push(eye);
    const pupil=add(h,new THREE.SphereGeometry(.0105,10,7),iris,[sx*eyeX,eyeY,front+.024],[0,0,0],[1,.94,.38]);rig.pupils.push(pupil);
    add(h,new THREE.SphereGeometry(.004,6,5),std(0xffffff,.2),[sx*eyeX-.003,eyeY+.004,front+.032],[0,0,0],[1,.8,.35]);
    const lid=add(h,new THREE.BoxGeometry(.078,.009,.011),skin,[sx*eyeX,eyeY+.026,front+.005],[0,0,sx*.025]);rig.lids.push(lid);
  }
  add(h,new THREE.CapsuleGeometry(.021,.080,5,9),skin,[0,-.006,.267],[Math.PI/2,0,0],[.72,1,.68]);
  add(h,new THREE.SphereGeometry(.027,10,8),skin,[0,-.056,.293],[0,0,0],[.92,.72,.72]);
  for(const sx of[-1,1])add(h,new THREE.SphereGeometry(.036,10,8),skin,[sx*.229,-.012,.012],[0,0,0],[.50,1,.58]);
  const jawW=id==='gigachad'?.177:id==='floyd'?.160:id==='agarthan'?.135:.145;
  rig.jaw=add(h,new THREE.CapsuleGeometry(jawW,.050,7,12),skin,[0,-.151,.010],[0,0,Math.PI/2],[1,.64,.69]);
  add(h,new THREE.SphereGeometry(.070,10,8),skin,[0,-.203,.040],[0,0,0],[id==='gigachad'?1.13:.92,.48,.66]);
  const lip=std(id==='greek'?0xa39e95:id==='floyd'?0x4b312b:0x704842,.76);rig.mouth=add(h,new THREE.BoxGeometry(id==='gigachad'?.112:.096,.010,.009),lip,[0,-.116,.286]);
  for(const sx of[-1,1])rig.cheeks.push(add(h,new THREE.SphereGeometry(.048,10,8),skin,[sx*.112,-.046,.239],[0,0,0],[1,.50,.39]));
  const browColor=id==='trump'?0xbd965c:id==='netanyahu'?0x77736e:id==='kirk'?0x4f3328:id==='greek'?0xa9a398:0x2b211d,brow=std(browColor,.84);
  for(const sx of[-1,1]){const b=add(h,new THREE.BoxGeometry(.084,.013,.013),brow,[sx*eyeX,.105,.266],[0,0,sx*(id==='gigachad'?.085:.030)]);rig.brows.push(b)}
  if(['floyd','gigachad'].includes(id)){
    const beard=std(id==='floyd'?0x241813:0x171310,.90);add(h,new THREE.CapsuleGeometry(id==='gigachad'?.135:.110,.043,7,11),beard,[0,-.177,.006],[0,0,Math.PI/2],[1,.66,.73]);add(h,new THREE.BoxGeometry(.154,.020,.015),beard,[0,-.108,.280]);
  }
  if(id==='agarthan'){
    const glow=std(0xc7ffff,.24,.08);glow.emissive=new THREE.Color(0x55ffff);glow.emissiveIntensity=1.15;for(const sx of[-1,1])add(h,new THREE.TorusGeometry(.027,.0045,6,16),glow,[sx*eyeX,eyeY,front+.031]);
  }else if(id==='greek'){
    const curls=std(0xc8c2b7,.96);for(let i=0;i<7;i++)add(h,new THREE.TorusGeometry(.031,.013,6,10),curls,[(i-3)*.058,.224+(i%2)*.032,-.025],[Math.PI/2,0,(i-3)*.10]);
  }
  f.faceDetailAdded=true;
}
