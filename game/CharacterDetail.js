import { THREE } from '../vendor/three.js';

const std=(color,rough=.62,metal=.03)=>new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal});
const phys=(color,rough=.55,metal=.0)=>new THREE.MeshPhysicalMaterial({color,roughness:rough,metalness:metal,clearcoat:.08,clearcoatRoughness:.72});
const add=(p,g,m,pos=[0,0,0],rot=[0,0,0],scale=[1,1,1])=>{const x=new THREE.Mesh(g,m);x.position.set(...pos);x.rotation.set(...rot);x.scale.set(...scale);x.castShadow=true;x.receiveShadow=true;p.add(x);return x};
const shirtFront=(f,base,accent)=>{add(f.torso,new THREE.BoxGeometry(.30,.52,.036),base,[0,.16,.405]);add(f.torso,new THREE.BoxGeometry(.036,.45,.026),accent,[0,.15,.435])};
const lapels=(f,m)=>{add(f.torso,new THREE.BoxGeometry(.13,.40,.026),m,[-.12,.20,.43],[0,0,-.23]);add(f.torso,new THREE.BoxGeometry(.13,.40,.026),m,[.12,.20,.43],[0,0,.23])};
const necklace=(f,m)=>{const ring=add(f.torso,new THREE.TorusGeometry(.19,.012,8,30,Math.PI),m,[0,.47,.38],[Math.PI/2,0,0]);ring.rotation.z=Math.PI};

export function addCharacterDetail(f){
  if(!f?.torso||f.characterDetailAdded)return;const d=f.def,id=d.id,cloth=std(d.palette.primary,.74,.02),cloth2=std(d.palette.secondary,.68,.025),accent=std(d.palette.accent,.48,.15),metal=std(0x8e9498,.31,.72);
  if(['trump','netanyahu','kirk'].includes(id)){const shirt=std(0xe7e3dc,.78,.01);shirtFront(f,shirt,accent);lapels(f,cloth);add(f.torso,new THREE.BoxGeometry(.80,.045,.045),cloth,[0,.57,.34])}
  if(id==='trump'){
    add(f.torso,new THREE.BoxGeometry(.11,.11,.045),std(0xa9151d,.42,.05),[0,.42,.45],[0,0,Math.PI/4]);
  }else if(id==='netanyahu'){
    const frame=std(0x696e72,.27,.75),lens=phys(0xa9c0ca,.12,0);lens.transparent=true;lens.opacity=.18;for(const sx of[-1,1]){add(f.head,new THREE.BoxGeometry(.138,.058,.012),frame,[sx*.10,.075,.335]);add(f.head,new THREE.BoxGeometry(.108,.040,.009),lens,[sx*.10,.075,.344])}add(f.head,new THREE.BoxGeometry(.058,.011,.012),frame,[0,.075,.337]);
  }else if(id==='kirk'){
    add(f.torso,new THREE.BoxGeometry(.66,.022,.022),accent,[0,.05,.438]);
  }else if(id==='floyd'){
    add(f.torso,new THREE.BoxGeometry(.80,.075,.05),cloth2,[0,.38,.34]);necklace(f,metal);
  }else if(id==='gigachad'){
    const contour=std(0x242529,.72,.04);add(f.torso,new THREE.TorusGeometry(.31,.018,8,22,Math.PI),contour,[0,.31,.18],[Math.PI/2,0,0],[1.12,.64,1]);
  }else if(id==='agarthan'){
    const pale=std(0xc9d5d7,.35,.42),glow=std(0x8ff6ef,.25,.1);glow.emissive=new THREE.Color(0x43d9d2);glow.emissiveIntensity=.9;add(f.torso,new THREE.BoxGeometry(.54,.46,.045),pale,[0,.15,.40],[0,0,0],[1,.94,1]);for(let i=-2;i<=2;i++)add(f.torso,new THREE.CylinderGeometry(.007,.007,.40,6),glow,[i*.098,.15,.432]);for(const sx of[-1,1])add(f.torso,new THREE.TorusGeometry(.145,.015,7,20,Math.PI*.7),pale,[sx*.27,.39,.35],[Math.PI/2,0,sx*.32]);
  }else if(id==='greek'){
    const marble=phys(0xd7d2c8,.92,.01),shadow=std(0xaea99f,.96,0);add(f.torso,new THREE.BoxGeometry(.57,.052,.038),shadow,[0,.42,.40]);for(let i=0;i<4;i++)add(f.torso,new THREE.CapsuleGeometry(.011,.39,4,7),marble,[.14+i*.055,.13,.405],[0,0,-.16+i*.035]);
  }else if(id==='wojak'){
    add(f.torso,new THREE.BoxGeometry(.66,.05,.035),cloth2,[0,.47,.35]);
  }
  f.characterDetailAdded=true;
}
