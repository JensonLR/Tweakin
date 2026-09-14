import { THREE } from '../vendor/three.js';

const mat=(color,rough=.82,metal=.04)=>new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal});
const basic=(color,opacity=.1)=>new THREE.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
const add=(g,geo,m,pos=[0,0,0],rot=[0,0,0])=>{const x=new THREE.Mesh(geo,m);x.position.set(...pos);x.rotation.set(...rot);x.receiveShadow=true;x.castShadow=false;g.add(x);return x};

export function addArenaBeauty(arena){
  if(!arena?.venue||arena.beautyLayer)return;const d=arena.def,s=d.size*.5,g=new THREE.Group();g.name='arena-beauty';arena.venue.add(g);arena.beautyLayer=g;
  const accent=d.lightB??0xb21b25,warm=d.lightA??0xe7c4a1;
  // Ground grime / fight-ring wear breaks the mathematically clean floor without textures.
  for(let i=0;i<10;i++){const a=(i/10)*Math.PI*2+(i%3)*.31,r=.55+(i%5)*.58,x=Math.cos(a)*r,z=Math.sin(a)*r,ring=add(g,new THREE.RingGeometry(.18+(i%3)*.08,.22+(i%3)*.10,24),basic(i%2?0x5a4b43:0x4b1b1d,.025+(i%4)*.006),[x,.018,z],[-Math.PI/2,0,a]);ring.scale.set(1.5,.65,1);}
  for(let i=0;i<7;i++){const x=(i-3)*.72,z=((i*37)%5-2)*.48;add(g,new THREE.PlaneGeometry(.46+(i%2)*.25,.018),basic(0xc4b6a6,.022),[x,.021,z],[-Math.PI/2,0,(i-3)*.25]);}
  // Light pools make practical lamps feel like they belong to the architecture.
  for(const [x,z,c] of [[-s*.62,-s*.55,warm],[s*.62,-s*.55,accent],[-s*.55,s*.55,accent],[s*.55,s*.55,warm]]){
    const pool=add(g,new THREE.CircleGeometry(.82,30),basic(c,.035),[x,.025,z],[-Math.PI/2,0,0]);pool.scale.set(1,.62,1);
  }
  // Vertical practicals around the perimeter. These are emissive geometry plus cheap point lights, not floating invisible lights.
  const practicalMat=color=>{const m=mat(color,.35,.12);m.emissive=new THREE.Color(color);m.emissiveIntensity=.9;return m};
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2+.25,x=Math.cos(a)*s*.86,z=Math.sin(a)*s*.86,c=i%2?accent:warm;const stem=add(g,new THREE.CylinderGeometry(.018,.018,1.55,6),mat(0x27282b,.55,.55),[x,.80,z]);stem.rotation.z=(i%2?-.05:.05);add(g,new THREE.CapsuleGeometry(.035,.34,5,8),practicalMat(c),[x,1.50,z],[0,0,stem.rotation.z]);if(i%2===0){const l=new THREE.PointLight(c,2.4,3.6,2);l.position.set(x,1.45,z);g.add(l);}}
  // Foreground silhouettes give the camera parallax and make arenas feel larger than their playable box.
  const dark=mat(0x08080a,.92,.02);for(let i=0;i<5;i++){const a=-.9+i*.45,x=Math.sin(a)*s*1.10,z=Math.cos(a)*s*1.10;const h=.65+(i%3)*.24;const crate=add(g,new THREE.BoxGeometry(.42+(i%2)*.18,h,.48),dark,[x,h*.5,z],[0,a*.12,0]);crate.userData.foreground=true;}
  // Suspended dust catchers / cable silhouettes near the ceiling line.
  const cable=mat(0x151519,.76,.35);for(let i=-2;i<=2;i++){const bar=add(g,new THREE.CylinderGeometry(.012,.012,s*1.28,6),cable,[i*s*.18,3.45,-s*.28],[Math.PI/2,0,.08*i]);bar.castShadow=false;}
  arena.beautyUpdate=(dt,t)=>{const pulse=.5+.5*Math.sin(t*.72);g.traverse(o=>{if(o.isMesh&&o.material?.emissiveIntensity>0)o.material.emissiveIntensity=.72+pulse*.28;});};
}

export function updateArenaBeauty(arena,dt,t){arena?.beautyUpdate?.(dt,t)}
