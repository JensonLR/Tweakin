import { THREE } from '../vendor/three.js';
import { Arena } from './Arena.js';

const mat=(color,rough=.72,metal=.04,emissive=0x000000,emissiveIntensity=0)=>new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal,emissive,emissiveIntensity});
const add=(p,g,m,pos=[0,0,0],rot=[0,0,0],scale=[1,1,1])=>{const x=new THREE.Mesh(g,m);x.position.set(...pos);x.rotation.set(...rot);x.scale.set(...scale);x.castShadow=true;x.receiveShadow=true;p.add(x);return x};

export class DetailedArena extends Arena{
  constructor(def){super(def);this.detail=new THREE.Group();this.group.add(this.detail);this.addArchitecture();this.addLightingRig();this.addCrowdReadability();}
  addArchitecture(){
    const d=this.def,s=d.size*.5, steel=mat(0x24262a,.55,.45), concrete=mat(0x292625,.93,.01), accent=mat(d.accent??0x8a2024,.58,.08);
    // Perimeter beams, upper catwalk and layered wall planes create depth without external assets.
    for(let i=0;i<4;i++){
      const horizontal=i<2;const y=3.3+i*.38;
      if(horizontal){add(this.detail,new THREE.BoxGeometry(s*1.9,.12,.12),steel,[0,y,i%2?s:-s]);}
      else{add(this.detail,new THREE.BoxGeometry(.12,.12,s*1.9),steel,[i%2?s:-s,y,0]);}
    }
    for(let i=-2;i<=2;i++){
      add(this.detail,new THREE.BoxGeometry(.15,3.2,.15),steel,[i*s*.42,1.6,-s*.98]);
      add(this.detail,new THREE.BoxGeometry(.15,3.2,.15),steel,[i*s*.42,1.6,s*.98]);
    }
    const back=this.detail;
    if(d.archetype?.toLowerCase().includes('subway')||d.hazard==='subway'){
      for(let i=-4;i<=4;i++){add(back,new THREE.BoxGeometry(.42,.06,1.7),concrete,[i*.85,.04,0]);}
      for(let i=-4;i<=4;i+=2){add(back,new THREE.BoxGeometry(.08,.08,7.5),steel,[i*.85,.1,0]);}
    }
    if(d.hazard==='glass'){
      const glass=mat(0x8caeb6,.2,.1,0x183239,.2);glass.transparent=true;glass.opacity=.26;
      for(let i=-3;i<=3;i++){add(back,new THREE.BoxGeometry(.8,2.1,.035),glass,[i*.88,1.3,-s*.94]);}
    }
    if(d.hazard==='fire'){
      for(let i=-3;i<=3;i++){const e=mat(0xff4d16,.32,.02,0xff2b00,2.2);add(back,new THREE.ConeGeometry(.09,.52,8),e,[i*1.05,.28,s*.9],[0,0,0],[1,.9,1]);}
    }
    // Graffiti/signage blocks.
    for(let i=0;i<6;i++){
      const sign=add(back,new THREE.BoxGeometry(1.05,.34,.035),i%2?accent:steel,[(i-2.5)*1.1,2.3,-s*.95]);
      sign.rotation.z=(i%3-1)*.04;
    }
  }
  addLightingRig(){
    const d=this.def,s=d.size*.5;
    const hemi=new THREE.HemisphereLight(0x8ea1bd,0x130d0c,.62);this.detail.add(hemi);
    const key=new THREE.DirectionalLight(0xffe0bd,2.25);key.position.set(-3.5,8,4);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-8;key.shadow.camera.right=8;key.shadow.camera.top=8;key.shadow.camera.bottom=-8;this.detail.add(key);
    const rimA=new THREE.PointLight(0x8aa6ff,13,11,2);rimA.position.set(-s*.72,3.5,-s*.45);this.detail.add(rimA);
    const rimB=new THREE.PointLight(0xff4338,11,10,2);rimB.position.set(s*.72,2.8,s*.45);this.detail.add(rimB);
    this.pulseLights=[rimA,rimB];
  }
  addCrowdReadability(){
    const d=this.def,s=d.size*.5, dark=mat(0x0d0d10,.96),skin=mat(0x6c4a3d,.78);
    for(let side of [-1,1])for(let i=-5;i<=5;i++){
      const g=new THREE.Group();g.position.set(i*.78,0,side*s*.93);g.rotation.y=side<0?0:Math.PI;
      add(g,new THREE.CylinderGeometry(.13,.18,.72,7),dark,[0,.52,0]);add(g,new THREE.SphereGeometry(.12,8,6),skin,[0,1.02,0]);this.detail.add(g);
    }
  }
  update(dt,t){super.update(dt,t);if(this.pulseLights){this.pulseLights[0].intensity=10.5+Math.sin(t*1.5)*2.5;this.pulseLights[1].intensity=9.5+Math.sin(t*1.8+1.1)*2;}}
}
