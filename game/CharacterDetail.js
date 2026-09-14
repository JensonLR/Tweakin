import { THREE } from '../vendor/three.js';

const std=(color,rough=.62,metal=.03)=>new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal});
const phys=(color,rough=.55,metal=.0)=>new THREE.MeshPhysicalMaterial({color,roughness:rough,metalness:metal,clearcoat:.08,clearcoatRoughness:.72});
const add=(p,g,m,pos=[0,0,0],rot=[0,0,0],scale=[1,1,1])=>{const x=new THREE.Mesh(g,m);x.position.set(...pos);x.rotation.set(...rot);x.scale.set(...scale);x.castShadow=true;x.receiveShadow=true;p.add(x);return x};
const shirtFront=(f,base,accent)=>{add(f.torso,new THREE.BoxGeometry(.17,.39,.022),base,[0,.18,.323]);add(f.torso,new THREE.CapsuleGeometry(.010,.29,5,10),accent,[0,.15,.341],[0,0,0],[1,.92,.70])};
const lapels=(f,m)=>{add(f.torso,new THREE.CapsuleGeometry(.018,.29,5,10),m,[-.072,.23,.338],[0,0,-.30],[1,.92,.72]);add(f.torso,new THREE.CapsuleGeometry(.018,.29,5,10),m,[.072,.23,.338],[0,0,.30],[1,.92,.72])};
const necklace=(f,m)=>{const ring=add(f.torso,new THREE.TorusGeometry(.15,.008,8,30,Math.PI),m,[0,.46,.30],[Math.PI/2,0,0]);ring.rotation.z=Math.PI};

export function addCharacterDetail(f){
  if(!f?.torso||f.characterDetailAdded)return;const d=f.def,id=d.id,cloth=std(d.palette.primary,.78,.02),cloth2=std(d.palette.secondary,.72,.025),accent=std(d.palette.accent,.48,.15),metal=std(0x8e9498,.31,.72);
  if(['trump','netanyahu','kirk'].includes(id)){const shirt=std(0xe7e3dc,.80,.01);shirtFront(f,shirt,accent);lapels(f,cloth)}
  if(id==='trump'){
    add(f.torso,new THREE.CapsuleGeometry(.019,.075,5,10),std(0xa9151d,.42,.05),[0,.385,.345],[0,0,Math.PI/2],[1,.95,.74]);
  }else if(id==='netanyahu'){
    const frame=std(0x696e72,.27,.75),lens=phys(0xa9c0ca,.12,0);lens.transparent=true;lens.opacity=.15;for(const sx of[-1,1]){add(f.head,new THREE.TorusGeometry(.055,.006,6,18),frame,[sx*.083,.052,.292],[Math.PI/2,0,0],[1,.66,1]);add(f.head,new THREE.CircleGeometry(.046,18),lens,[sx*.083,.052,.296])}add(f.head,new THREE.BoxGeometry(.048,.006,.008),frame,[0,.052,.294]);
  }else if(id==='kirk'){
    add(f.torso,new THREE.CapsuleGeometry(.009,.42,4,9),accent,[0,.02,.333],[0,0,Math.PI/2],[1,.8,.65]);
  }else if(id==='floyd'){
    add(f.torso,new THREE.CapsuleGeometry(.012,.48,5,10),cloth2,[0,.37,.29],[0,0,Math.PI/2],[1,.85,.70]);necklace(f,metal);
  }else if(id==='gigachad'){
    const contour=std(0x242529,.76,.04);add(f.torso,new THREE.TorusGeometry(.25,.012,8,24,Math.PI),contour,[0,.29,.14],[Math.PI/2,0,0],[1.10,.56,1]);
  }else if(id==='agarthan'){
    const pale=std(0xc9d5d7,.38,.34),glow=std(0x8ff6ef,.25,.1);glow.emissive=new THREE.Color(0x43d9d2);glow.emissiveIntensity=.9;for(let i=-2;i<=2;i++)add(f.torso,new THREE.CylinderGeometry(.004,.004,.30,6),glow,[i*.068,.16,.325]);for(const sx of[-1,1])add(f.torso,new THREE.TorusGeometry(.105,.010,7,20,Math.PI*.7),pale,[sx*.20,.39,.27],[Math.PI/2,0,sx*.32]);
  }else if(id==='greek'){
    const marble=phys(0xd7d2c8,.92,.01),shadow=std(0xaea99f,.96,0);add(f.torso,new THREE.CapsuleGeometry(.010,.40,5,10),shadow,[0,.41,.31],[0,0,Math.PI/2],[1,.8,.7]);for(let i=0;i<3;i++)add(f.torso,new THREE.CapsuleGeometry(.008,.30,4,7),marble,[.09+i*.043,.13,.315],[0,0,-.14+i*.04]);
  }else if(id==='wojak'){
    add(f.torso,new THREE.CapsuleGeometry(.010,.44,5,10),cloth2,[0,.43,.29],[0,0,Math.PI/2],[1,.8,.7]);
  }
  f.characterDetailAdded=true;
}
