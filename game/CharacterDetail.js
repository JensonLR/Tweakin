import { THREE } from '../vendor/three.js';

const std=(color,rough=.62,metal=.03)=>new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal});
const phys=(color,rough=.55,metal=.0)=>new THREE.MeshPhysicalMaterial({color,roughness:rough,metalness:metal,clearcoat:.08,clearcoatRoughness:.72});
const add=(p,g,m,pos=[0,0,0],rot=[0,0,0],scale=[1,1,1])=>{const x=new THREE.Mesh(g,m);x.position.set(...pos);x.rotation.set(...rot);x.scale.set(...scale);x.castShadow=true;x.receiveShadow=true;p.add(x);return x};

function shirtFront(f,base,accent){
  add(f.torso,new THREE.BoxGeometry(.30,.52,.036),base,[0,.16,.405]);
  add(f.torso,new THREE.BoxGeometry(.036,.45,.026),accent,[0,.15,.435]);
}
function lapels(f,mat){
  const l=add(f.torso,new THREE.BoxGeometry(.14,.42,.032),mat,[-.12,.20,.43],[0,0,-.23]);
  const r=add(f.torso,new THREE.BoxGeometry(.14,.42,.032),mat,[.12,.20,.43],[0,0,.23]);
  l.scale.y=r.scale.y=1.02;
}
function shoe(f,mat,pivot,side=1){add(pivot,new THREE.BoxGeometry(.31,.16,.52),mat,[0,-.75,.12],[0,side*.02,0],[1,.88,1]);}
function necklace(f,mat){const ring=add(f.torso,new THREE.TorusGeometry(.19,.014,8,30,Math.PI),mat,[0,.47,.38],[Math.PI/2,0,0]);ring.rotation.z=Math.PI;}

export function addCharacterDetail(f){
  if(!f?.torso||!f?.head||f.characterDetailAdded)return;
  const d=f.def,id=d.id;
  const skin=phys(d.palette.skin,id==='greek'?.9:.58),cloth=std(d.palette.primary,.74,.02),cloth2=std(d.palette.secondary,.68,.025),accent=std(d.palette.accent,.48,.15),dark=std(0x111114,.86,.01),metal=std(0x8e9498,.31,.72);

  // Anatomy pass: collarbones, deltoid caps, knee volume and feet stop the base rig reading like connected primitives.
  add(f.torso,new THREE.CapsuleGeometry(.085,.44,5,10),skin,[-.42,.54,.02],[0,0,-1.18],[1,.92,1]);
  add(f.torso,new THREE.CapsuleGeometry(.085,.44,5,10),skin,[.42,.54,.02],[0,0,1.18],[1,.92,1]);
  for(const leg of [f.leftShin,f.rightShin]) add(leg,new THREE.SphereGeometry(.18,12,9),cloth,[0,.02,.005],[0,0,0],[1,.76,.9]);
  shoe(f,dark,f.leftShin,-1);shoe(f,dark,f.rightShin,1);

  if(['trump','netanyahu','kirk'].includes(id)){
    const shirt=std(0xe7e3dc,.78,.01);shirtFront(f,shirt,accent);lapels(f,cloth);
    add(f.torso,new THREE.BoxGeometry(.84,.055,.055),cloth,[0,.57,.34]);
  }

  if(id==='trump'){
    // Broad suit, recognisable swept-front hair volume and tie knot.
    add(f.torso,new THREE.BoxGeometry(.12,.12,.05),std(0xa9151d,.42,.05),[0,.42,.45],[0,0,Math.PI/4]);
    add(f.head,new THREE.CapsuleGeometry(.085,.34,6,12),std(0xd9b167,.82),[.03,.30,.025],[0,0,1.35],[1.55,.74,1.22]);
    add(f.head,new THREE.CapsuleGeometry(.055,.26,5,10),std(0xd9b167,.82),[-.10,.29,-.03],[0,0,.92],[1.3,.7,1.1]);
  }else if(id==='netanyahu'){
    // Silver temple structure and glasses with actual lenses.
    const hair=std(0xb6b2ad,.84);add(f.head,new THREE.BoxGeometry(.50,.075,.28),hair,[0,.255,-.035],[0,0,0],[1,.82,1]);
    const frame=std(0x696e72,.27,.75),lens=phys(0xa9c0ca,.12,0);lens.transparent=true;lens.opacity=.24;
    for(const sx of[-1,1]){add(f.head,new THREE.BoxGeometry(.145,.067,.014),frame,[sx*.10,.075,.335]);add(f.head,new THREE.BoxGeometry(.116,.048,.010),lens,[sx*.10,.075,.344]);}
    add(f.head,new THREE.BoxGeometry(.062,.013,.014),frame,[0,.075,.337]);
  }else if(id==='kirk'){
    // Casual jacket seams and higher-volume youthful hair.
    add(f.torso,new THREE.BoxGeometry(.70,.025,.025),accent,[0,.05,.438]);
    const hair=std(0x35261e,.78);add(f.head,new THREE.SphereGeometry(.34,16,10,0,Math.PI*2,0,Math.PI*.5),hair,[0,.13,-.02],[0,0,0],[1.04,.76,1.08]);
    add(f.head,new THREE.CapsuleGeometry(.045,.24,5,8),hair,[.14,.26,.05],[0,0,-.9],[1.1,.8,1]);
  }else if(id==='floyd'){
    // Athletic silhouette, close hairline, beard volume and simple chain.
    add(f.torso,new THREE.BoxGeometry(.86,.10,.06),cloth2,[0,.38,.34]);
    const hair=std(0x171411,.92);add(f.head,new THREE.SphereGeometry(.315,14,10,0,Math.PI*2,0,Math.PI*.31),hair,[0,.14,-.015]);
    add(f.head,new THREE.BoxGeometry(.31,.11,.19),hair,[0,-.20,.12],[0,0,0],[1.08,.78,1]);necklace(f,metal);
  }else if(id==='gigachad'){
    // Strong V taper and jaw/neck mass.
    add(f.torso,new THREE.CapsuleGeometry(.49,.47,7,12),std(0x151619,.78),[0,.12,-.015],[0,0,0],[1.16,.92,.72]);
    add(f.head,new THREE.BoxGeometry(.46,.18,.30),skin,[0,-.16,.015],[0,0,0],[1.06,.84,1]);
    add(f.torso,new THREE.CylinderGeometry(.20,.24,.30,12),skin,[0,.78,0]);
  }else if(id==='agarthan'){
    // Ceremonial metallic layers and pale luminous filigree, deliberately avoiding real-world symbology.
    const pale=std(0xc9d5d7,.35,.42),glow=std(0x8ff6ef,.25,.1);glow.emissive=new THREE.Color(0x43d9d2);glow.emissiveIntensity=.9;
    add(f.torso,new THREE.BoxGeometry(.58,.50,.052),pale,[0,.15,.40],[0,0,0],[1,.96,1]);
    for(let i=-2;i<=2;i++) add(f.torso,new THREE.CylinderGeometry(.009,.009,.43,6),glow,[i*.105,.15,.432]);
    for(const sx of[-1,1]) add(f.torso,new THREE.TorusGeometry(.16,.018,7,20,Math.PI*.7),pale,[sx*.28,.40,.35],[Math.PI/2,0,sx*.32]);
  }else if(id==='greek'){
    // Marble anatomy, drape folds and subtle chipped stone fragments.
    const marble=phys(0xd7d2c8,.92,.01),shadow=std(0xaea99f,.96,.0);
    add(f.torso,new THREE.BoxGeometry(.62,.065,.045),shadow,[0,.42,.40]);
    for(let i=0;i<5;i++) add(f.torso,new THREE.CapsuleGeometry(.014,.45,4,7),marble,[.14+i*.055,.13,.405],[0,0,-.18+i*.035]);
    for(let i=0;i<5;i++){const chip=add(f.head,new THREE.TetrahedronGeometry(.025+(i%2)*.01),shadow,[(i-2)*.09,.18+(i%3)*.04,-.26]);chip.rotation.set(i*.7,i*.45,i*.2);}
  }else if(id==='wojak'){
    // Preserve the deliberately simple meme identity while improving silhouette and posture.
    add(f.torso,new THREE.BoxGeometry(.72,.06,.04),cloth2,[0,.47,.35]);
    add(f.head,new THREE.TorusGeometry(.115,.012,8,24,Math.PI),dark,[0,-.14,.304],[0,0,Math.PI]);
  }
  f.characterDetailAdded=true;
}
