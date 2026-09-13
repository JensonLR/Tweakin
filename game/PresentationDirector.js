import { THREE } from '../vendor/three.js';

export class PresentationDirector{
  constructor(renderer,camera,mobile=false){this.renderer=renderer;this.camera=camera;this.mobile=mobile;this.scene=null;this.match=null;this.flash=0;this.particles=null;this.clock=0;this.prevHands=new Map();this.trails=[];this.dust=[];this.stepClock=new Map();}
  attach(match){this.match=match;this.scene=match.scene;this.clock=0;this.prevHands.clear();this.trails.length=0;this.dust.length=0;this.buildAtmosphere();}
  buildAtmosphere(){
    if(!this.scene)return;const count=this.mobile?90:180,geo=new THREE.BufferGeometry(),arr=new Float32Array(count*3);for(let i=0;i<count;i++){arr[i*3]=(Math.random()-.5)*16;arr[i*3+1]=Math.random()*6;arr[i*3+2]=(Math.random()-.5)*16}geo.setAttribute('position',new THREE.BufferAttribute(arr,3));const mat=new THREE.PointsMaterial({color:0xb9a99f,size:this.mobile?.018:.026,transparent:true,opacity:.22,depthWrite:false});this.particles=new THREE.Points(geo,mat);this.scene.add(this.particles)
  }
  impact(pos,kind='light',blocked=false){
    if(!this.scene||!pos)return;const strong=['heavy','grapple','weapon','special','environment'].includes(kind);this.flash=Math.max(this.flash,strong?.22:.10);const color=blocked?0xb9c8d8:kind==='special'?0xffd56b:kind==='weapon'?0xff8a58:0xfff0d7,burst=new THREE.Group();burst.position.copy(pos);this.scene.add(burst);const n=this.mobile?(strong?7:4):(strong?16:8);
    for(let i=0;i<n;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(strong?.035:.024,5,4),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.9,depthWrite:false})),a=Math.random()*Math.PI*2,s=Math.random()*(strong?3.2:1.7)+.8;m.userData.v=new THREE.Vector3(Math.cos(a)*s,(Math.random()*.9+.2)*s,Math.sin(a)*s);m.userData.life=.22+Math.random()*.28;burst.add(m)}burst.userData.burst=true;burst.userData.age=0;
  }
  spawnTrail(a,b,color=0xffd8b2,strong=false){
    const d=a.distanceTo(b);if(d<.025||!this.scene)return;const geo=new THREE.CylinderGeometry(strong?.026:.016,strong?.008:.004,d,5,1,true),mat=new THREE.MeshBasicMaterial({color,transparent:true,opacity:strong?.32:.2,depthWrite:false,blending:THREE.AdditiveBlending}),m=new THREE.Mesh(geo,mat),mid=a.clone().add(b).multiplyScalar(.5);m.position.copy(mid);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());m.userData.life=strong?.16:.11;m.userData.age=0;this.scene.add(m);this.trails.push(m)
  }
  spawnDust(f){
    if(!this.scene)return;const m=new THREE.Mesh(new THREE.SphereGeometry(.05,5,4),new THREE.MeshBasicMaterial({color:0x8c8178,transparent:true,opacity:.12,depthWrite:false}));m.position.set(f.group.position.x+(Math.random()-.5)*.22,.045,f.group.position.z+(Math.random()-.5)*.22);m.scale.set(1.8,.45,1.8);m.userData.age=0;m.userData.life=.42;this.scene.add(m);this.dust.push(m)
  }
  updateFighterFX(dt){
    if(!this.match)return;for(const f of this.match.fighters){const hand=new THREE.Vector3();f.rightFore?.getWorldPosition?.(hand);const prev=this.prevHands.get(f.id);if(prev&&(f.state==='Attack'||f.heldWeapon)){const strong=f.attackType==='heavy'||f.attackType==='special'||!!f.heldWeapon,color=f.attackType==='special'?f.def.palette.accent:(f.heldWeapon?0xffb271:0xffe4c4);this.spawnTrail(prev,hand,color,strong)}this.prevHands.set(f.id,hand.clone());
      const k=f.id,clock=(this.stepClock.get(k)||0)-dt;this.stepClock.set(k,clock);if((f.state==='Run'||f.state==='Move')&&clock<=0){this.spawnDust(f);this.stepClock.set(k,f.state==='Run'?.11:.21)}
    }
  }
  update(dt){
    if(!this.scene)return;this.clock+=dt;this.flash=Math.max(0,this.flash-dt*2.5);this.renderer.toneMappingExposure=1.06+this.flash*.8;if(this.particles){this.particles.rotation.y+=dt*.005;const p=this.particles.geometry.attributes.position.array;for(let i=0;i<p.length/3;i++){p[i*3+1]+=dt*(.025+((i%7)*.003));if(p[i*3+1]>6)p[i*3+1]=0}this.particles.geometry.attributes.position.needsUpdate=true}this.updateFighterFX(dt);
    const dead=[];for(const o of this.scene.children){if(!o.userData?.burst)continue;o.userData.age+=dt;for(const m of o.children){m.position.addScaledVector(m.userData.v,dt);m.userData.v.y-=5.5*dt;m.material.opacity=Math.max(0,1-o.userData.age/m.userData.life)}if(o.userData.age>.55)dead.push(o)}dead.forEach(o=>{this.scene.remove(o);o.traverse(x=>{x.geometry?.dispose?.();x.material?.dispose?.()})});
    this.trails=this.trails.filter(m=>{m.userData.age+=dt;m.material.opacity=Math.max(0,(1-m.userData.age/m.userData.life)*.3);if(m.userData.age>=m.userData.life){this.scene.remove(m);m.geometry.dispose();m.material.dispose();return false}return true});
    this.dust=this.dust.filter(m=>{m.userData.age+=dt;const q=m.userData.age/m.userData.life;m.material.opacity=.12*(1-q);m.scale.x=m.scale.z=1.8+q*2.4;m.position.y+=dt*.08;if(q>=1){this.scene.remove(m);m.geometry.dispose();m.material.dispose();return false}return true});
  }
  dispose(){if(this.particles&&this.scene){this.scene.remove(this.particles);this.particles.geometry.dispose();this.particles.material.dispose()}for(const m of [...this.trails,...this.dust]){this.scene?.remove(m);m.geometry?.dispose?.();m.material?.dispose?.()}this.trails.length=0;this.dust.length=0;this.prevHands.clear();this.particles=null;this.scene=null;this.match=null;}
}
