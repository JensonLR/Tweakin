import { THREE } from '../vendor/three.js';
import { seeded, hash } from '../core/math.js';

export class Arena {
  constructor(def){this.def=def;this.group=new THREE.Group();this.group.name=`arena-${def.id}`;this.weapons=[];this.props=[];this.breakables=[];this.fx=[];this.rng=seeded(hash(def.id));this.build()}
  mat(color,rough=.75,metal=.04){return new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal})}
  mesh(g,m,pos,cast=false){const x=new THREE.Mesh(g,m);x.position.set(...pos);x.castShadow=cast;x.receiveShadow=true;this.group.add(x);this.props.push(x);return x}
  build(){
    const d=this.def,s=d.size;
    const floor=this.mesh(new THREE.PlaneGeometry(s,s,10,10),this.mat(d.floor,.93),[0,0,0]);floor.rotation.x=-Math.PI/2;
    const wallMat=this.mat(d.wall,.82,.07);
    const back=this.mesh(new THREE.BoxGeometry(s,.16,2.8),wallMat,[0,1.4,-s*.51]);
    const left=this.mesh(new THREE.BoxGeometry(.16,s,2.8),wallMat,[-s*.51,1.4,0]);left.rotation.x=Math.PI/2;
    const right=this.mesh(new THREE.BoxGeometry(.16,s,2.8),wallMat,[s*.51,1.4,0]);right.rotation.x=Math.PI/2;
    const hemi=new THREE.HemisphereLight(0xd8d7cf,0x151316,.72);this.group.add(hemi);
    const key=new THREE.SpotLight(d.lightA,95,28,Math.PI/5,.65,1.4);key.position.set(-s*.32,7,s*.22);key.castShadow=true;key.shadow.mapSize.set(512,512);this.group.add(key,key.target);key.target.position.set(0,0,0);
    const fill=new THREE.PointLight(d.lightB,38,18,2);fill.position.set(s*.36,3.4,-s*.25);this.group.add(fill);
    const rim=new THREE.PointLight(d.lightA,22,14,2);rim.position.set(-s*.35,2.2,-s*.32);this.group.add(rim);
    this.addCrowd();this.addVenueProps();this.addWeapons();this.addHazardGeometry();
  }
  addCrowd(){
    const d=this.def,s=d.size,n=Math.min(d.crowd,matchMedia('(pointer:coarse)').matches?20:40),geo=new THREE.CapsuleGeometry(.13,.55,3,5),mat=this.mat(0x161418,.9);
    for(let i=0;i<n;i++){
      const side=i%3, t=(i/n-.5)*s*.9;let x=0,z=0,rot=0;if(side===0){x=t;z=-s*.47;rot=0}else if(side===1){x=-s*.47;z=t;rot=Math.PI/2}else{x=s*.47;z=t;rot=-Math.PI/2}
      const p=new THREE.Mesh(geo,mat);p.position.set(x,.48,z);p.rotation.z=rot;p.scale.set(.8+this.rng()*.35,.85+this.rng()*.25,.8);p.castShadow=false;this.group.add(p);this.fx.push(p)
    }
  }
  addVenueProps(){
    const d=this.def,s=d.size;
    const box=(x,y,z,w,h,dep,c=0x343438,metal=.08)=>{const m=this.mesh(new THREE.BoxGeometry(w,h,dep),this.mat(c,.72,metal),[x,y,z],true);return m};
    const cyl=(x,y,z,r,h,c=0x303034)=>this.mesh(new THREE.CylinderGeometry(r,r,h,10),this.mat(c,.66,.15),[x,y,z],true);
    for(const kind of d.props){
      if(kind==='speakers'){for(const x of[-s*.36,s*.36]){const sp=box(x,.75,-s*.41,.7,1.5,.55,0x141416,.14);const cone=this.mesh(new THREE.CylinderGeometry(.18,.24,.08,18),this.mat(0x050506,.75),[x,.75,-s*.11]);cone.rotation.x=Math.PI/2}}
      if(kind==='barrier'||kind==='railings'){for(let i=-2;i<=2;i++)box(i*1.1,.48,s*.42,1,.08,.08,0x57595d,.65)}
      if(kind==='table'||kind==='bench'){const p=box(s*.23,.42,s*.2,1.25,.1,.55,0x493224,.02);box(s*.23,.2,s*.2,.08,.4,.08,0x333336,.5);box(s*.65,.2,s*.2,.08,.4,.08,0x333336,.5)}
      if(kind==='pillars'){for(const x of[-s*.36,s*.36])cyl(x,1.45,-s*.3,.22,2.9,0x34363a)}
      if(kind==='crates'){for(let i=0;i<3;i++)box(-s*.34+i*.65,.32,s*.3,.55,.64,.55,0x4a3824)}
      if(kind==='tires'){for(let i=0;i<4;i++){const tor=new THREE.Mesh(new THREE.TorusGeometry(.3,.1,8,16),this.mat(0x111113,.95));tor.position.set(s*.34,.22+i*.12,s*.22);tor.rotation.x=Math.PI/2;this.group.add(tor);this.props.push(tor)}}
      if(kind==='cars'){for(const x of[-s*.36,s*.35]){const car=box(x,.36,s*.32,1.45,.55,.8,0x3a3a3f,.22);car.rotation.y=(this.rng()-.5)*.3}}
      if(kind==='panels'){for(let i=-2;i<=2;i++){const p=box(i*1.15,.85,-s*.43,.95,1.7,.09,0x4a4744,.3);this.breakables.push({mesh:p,health:2})}}
      if(kind==='glass'){for(let i=-3;i<=3;i++){const m=new THREE.MeshStandardMaterial({color:0xa8d8e8,transparent:true,opacity:.16,roughness:.1,metalness:.05});const p=this.mesh(new THREE.BoxGeometry(1.05,2.5,.035),m,[i*1.08,1.3,-s*.48]);this.breakables.push({mesh:p,health:1})}}
      if(kind==='cage'){const fm=this.mat(0x4b5055,.45,.8);for(let i=-5;i<=5;i++){const x=i*s/10;cyl(x,1.25,-s*.48,.025,2.5,0x4b5055);cyl(x,1.25,s*.48,.025,2.5,0x4b5055)}for(let i=-5;i<=5;i++){const z=i*s/10;cyl(-s*.48,1.25,z,.025,2.5,0x4b5055);cyl(s*.48,1.25,z,.025,2.5,0x4b5055)}}
      if(kind==='track'){for(const x of[-.72,.72])box(x,.03,0,.08,.06,s*.92,0x6b6862,.85)}
      if(kind==='lockers'){for(let i=0;i<5;i++)box(-s*.38+i*.55,.9,-s*.4,.48,1.8,.45,0x384047,.45)}
      if(kind==='bags'){for(const x of[-1.7,1.7]){const b=this.mesh(new THREE.CapsuleGeometry(.24,.85,6,8),this.mat(0x4c171b,.85),[x,1.5,-s*.36],true);this.props.push(b)}}
      if(kind==='fence'){for(let i=-4;i<=4;i++)cyl(i*.95,1.1,-s*.45,.022,2.2,0x67696d)}
      if(kind==='desks'){for(const x of[-1.6,1.5])box(x,.55,s*.3,1.4,.12,.7,0x2e3134,.25)}
      if(kind==='toolbox')box(s*.34,.5,s*.26,.8,1,.45,0x8e151d,.25)
    }
  }
  addWeapons(){
    const s=this.def.size;
    this.def.weaponPool.forEach((kind,i)=>{const a=(i/Math.max(1,this.def.weaponPool.length))*Math.PI*2+.7;const x=Math.cos(a)*s*.28,z=Math.sin(a)*s*.28;const group=new THREE.Group();group.position.set(x,.08,z);let geo,mat;if(kind==='bottle'){geo=new THREE.CylinderGeometry(.05,.075,.4,7);mat=this.mat(0x456858,.3,.05)}else{geo=new THREE.CylinderGeometry(kind==='broom'?.025:.045,kind==='bat'?.07:.05,kind==='broom'?1.2:kind==='bat'?1:.8,8);mat=this.mat(kind==='pipe'?0x74787c:0x6a4728,.48,kind==='pipe'?.7:.03)}const mesh=new THREE.Mesh(geo,mat);mesh.rotation.z=Math.PI/2;mesh.castShadow=true;group.add(mesh);this.group.add(group);this.weapons.push({kind,group,available:true})})
  }
  addHazardGeometry(){
    const d=this.def,s=d.size;if(d.hazard==='fire'){for(let i=-4;i<=4;i++){const l=new THREE.PointLight(0xff5f19,3,2.8,2);l.position.set(i*1.1,.35,-s*.42);this.group.add(l);this.fx.push(l)}}
    if(d.hazard==='subway'){const tunnel=this.mesh(new THREE.BoxGeometry(s*.9,.05,1.8),this.mat(0x161617,.95),[0,-.03,s*.25]);tunnel.receiveShadow=true}
  }
  update(dt,time=0){for(const w of this.weapons)if(w.available){w.group.rotation.y+=dt*.7;w.group.position.y=.08+Math.sin(time*2+w.group.position.x)*.025}if(this.def.hazard==='fire'){for(const x of this.fx)if(x.isLight)x.intensity=2.2+Math.random()*2}}
  nearestWeapon(x,z,max=1.35){let best=null,bd=max;for(const w of this.weapons)if(w.available){const d=Math.hypot(w.group.position.x-x,w.group.position.z-z);if(d<bd){bd=d;best=w}}return best}
  takeWeapon(w){if(!w||!w.available)return null;w.available=false;w.group.visible=false;return w.kind}
  environmentAnchor(x,z){const s=this.def.size*.47;const edge=Math.max(Math.abs(x),Math.abs(z));if(edge<s*.86)return null;return{x:Math.abs(x)>Math.abs(z)?Math.sign(x)*s:x,z:Math.abs(z)>=Math.abs(x)?Math.sign(z)*s:z}}
  hitBreakable(x,z,power=1){let hit=null,bd=.9;for(const b of this.breakables){if(!b.mesh.visible)continue;const d=Math.hypot(b.mesh.position.x-x,b.mesh.position.z-z);if(d<bd){bd=d;hit=b}}if(hit){hit.health-=power;if(hit.health<=0){hit.mesh.visible=false;return true}}return false}
  dispose(){this.group.traverse(o=>{o.geometry?.dispose?.();if(o.material){const mats=Array.isArray(o.material)?o.material:[o.material];for(const m of mats)m.dispose?.()}})}
}
