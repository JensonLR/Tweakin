import { THREE } from '../vendor/three.js';

export class PresentationDirector{
  constructor(renderer,camera,mobile=false){this.renderer=renderer;this.camera=camera;this.mobile=mobile;this.scene=null;this.match=null;this.flash=0;this.particles=null;this.clock=0;this.prevLimbs=new Map();this.trails=[];this.dust=[];this.speedStreaks=[];this.stepClock=new Map();}
  attach(match){this.match=match;this.scene=match.scene;this.clock=0;this.prevLimbs.clear();this.trails.length=0;this.dust.length=0;this.speedStreaks.length=0;this.buildAtmosphere();}
  buildAtmosphere(){
    if(!this.scene)return;const count=this.mobile?80:170,geo=new THREE.BufferGeometry(),arr=new Float32Array(count*3);for(let i=0;i<count;i++){arr[i*3]=(Math.random()-.5)*16;arr[i*3+1]=Math.random()*6;arr[i*3+2]=(Math.random()-.5)*16}geo.setAttribute('position',new THREE.BufferAttribute(arr,3));const mat=new THREE.PointsMaterial({color:0xc6b4a8,size:this.mobile?.018:.026,transparent:true,opacity:.18,depthWrite:false,blending:THREE.AdditiveBlending});this.particles=new THREE.Points(geo,mat);this.scene.add(this.particles)
  }
  impact(pos,kind='light',blocked=false){
    if(!this.scene||!pos)return;const strong=['heavy','grapple','weapon','special','environment'].includes(kind),major=kind==='special'||kind==='environment';this.flash=Math.max(this.flash,major?.30:strong?.22:.10);this.match?.arena?.react?.(blocked?.22:kind==='special'?1.2:kind==='environment'?1.05:strong?.72:.36);
    const color=blocked?0xb9c8d8:kind==='special'?0xffd56b:kind==='weapon'?0xff8a58:kind==='environment'?0xffb06a:0xfff0d7,burst=new THREE.Group();burst.position.copy(pos);this.scene.add(burst);const n=this.mobile?(strong?8:4):(strong?20:9);
    for(let i=0;i<n;i++){
      const m=new THREE.Mesh(new THREE.SphereGeometry(strong?.032:.022,5,4),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.9,depthWrite:false,blending:THREE.AdditiveBlending})),a=Math.random()*Math.PI*2,s=Math.random()*(strong?3.6:1.8)+.8;m.userData.v=new THREE.Vector3(Math.cos(a)*s,(Math.random()*.85+.25)*s,Math.sin(a)*s);m.userData.life=.22+Math.random()*.3;m.userData.spark=true;burst.add(m)
    }
    if(strong){
      const ring=new THREE.Mesh(new THREE.TorusGeometry(.16,.016,6,34),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.72,depthWrite:false,blending:THREE.AdditiveBlending}));ring.rotation.x=Math.PI/2;ring.userData.ring=true;burst.add(ring);
      const disc=new THREE.Mesh(new THREE.CircleGeometry(.13,22),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.34,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));disc.lookAt(this.camera.position);disc.userData.disc=true;burst.add(disc);
      const light=new THREE.PointLight(color,this.mobile?2.8:5.2,4,2);light.userData.impactLight=true;burst.add(light)
    }
    if(major&&!this.mobile){for(let i=0;i<6;i++){const streak=new THREE.Mesh(new THREE.BoxGeometry(.014,.014,.9+Math.random()*.8),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.28,depthWrite:false,blending:THREE.AdditiveBlending}));streak.position.copy(pos);streak.rotation.set(Math.random()*Math.PI,Math.random()*Math.PI,Math.random()*Math.PI);streak.userData.age=0;streak.userData.life=.18+Math.random()*.08;this.scene.add(streak);this.speedStreaks.push(streak)}}
    burst.userData.burst=true;burst.userData.age=0;burst.userData.life=strong?.62:.42;
  }
  spawnTrail(a,b,color=0xffd8b2,strong=false){
    const d=a.distanceTo(b);if(d<.025||!this.scene)return;const geo=new THREE.CylinderGeometry(strong?.024:.014,strong?.007:.0035,d,5,1,true),mat=new THREE.MeshBasicMaterial({color,transparent:true,opacity:strong?.30:.18,depthWrite:false,blending:THREE.AdditiveBlending}),m=new THREE.Mesh(geo,mat),mid=a.clone().add(b).multiplyScalar(.5);m.position.copy(mid);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());m.userData.life=strong?.17:.10;m.userData.age=0;this.scene.add(m);this.trails.push(m)
  }
  spawnDust(f,strong=false){
    if(!this.scene)return;const ring=new THREE.Mesh(new THREE.RingGeometry(.07,strong?.22:.15,18),new THREE.MeshBasicMaterial({color:0x9a8c80,transparent:true,opacity:strong?.18:.10,depthWrite:false,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.set(f.group.position.x+(Math.random()-.5)*.2,.035,f.group.position.z+(Math.random()-.5)*.2);ring.userData.age=0;ring.userData.life=strong?.5:.38;this.scene.add(ring);this.dust.push(ring)
  }
  updateFighterFX(dt){
    if(!this.match)return;for(const f of this.match.fighters){
      const limbs=[['rh',f.rightFore],['lh',f.leftFore],['rf',f.rightShin],['lf',f.leftShin]];for(const [name,node] of limbs){if(!node?.getWorldPosition)continue;const p=new THREE.Vector3();node.getWorldPosition(p);const key=`${f.id}:${name}`,prev=this.prevLimbs.get(key),isHand=name==='rh'||name==='lh',attacking=f.state==='Attack',kicking=attacking&&(f.attackType==='heavy'||f.attackType==='special')&&!isHand;if(prev&&(attacking&&(isHand||kicking)||f.heldWeapon&&isHand)){const strong=f.attackType==='heavy'||f.attackType==='special'||!!f.heldWeapon,color=f.attackType==='special'?f.def.palette.accent:(f.heldWeapon?0xffb271:0xffe4c4);this.spawnTrail(prev,p,color,strong)}this.prevLimbs.set(key,p.clone())}
      const k=f.id,clock=(this.stepClock.get(k)||0)-dt;this.stepClock.set(k,clock);if((f.state==='Run'||f.state==='Move')&&clock<=0){this.spawnDust(f,f.state==='Run');this.stepClock.set(k,f.state==='Run'?.13:.23)}
    }
  }
  update(dt){
    if(!this.scene)return;this.clock+=dt;this.flash=Math.max(0,this.flash-dt*2.8);this.renderer.toneMappingExposure=1.08+this.flash*.65;if(this.particles){this.particles.rotation.y+=dt*.005;const p=this.particles.geometry.attributes.position.array;for(let i=0;i<p.length/3;i++){p[i*3+1]+=dt*(.022+((i%7)*.003));if(p[i*3+1]>6)p[i*3+1]=0}this.particles.geometry.attributes.position.needsUpdate=true}this.updateFighterFX(dt);
    const dead=[];for(const o of this.scene.children){if(!o.userData?.burst)continue;o.userData.age+=dt;const q=Math.min(1,o.userData.age/o.userData.life);for(const m of o.children){if(m.userData.spark){m.position.addScaledVector(m.userData.v,dt);m.userData.v.y-=5.5*dt;m.material.opacity=Math.max(0,1-o.userData.age/m.userData.life)}else if(m.userData.ring){m.scale.setScalar(1+q*4.8);m.material.opacity=(1-q)*.58;m.rotation.z+=dt*1.8}else if(m.userData.disc){m.scale.setScalar(1+q*2.8);m.material.opacity=(1-q)*.28;m.lookAt(this.camera.position)}else if(m.userData.impactLight){m.intensity=(1-q)*(this.mobile?2.8:5.2)}}if(q>=1)dead.push(o)}dead.forEach(o=>{this.scene.remove(o);o.traverse(x=>{x.geometry?.dispose?.();x.material?.dispose?.()})});
    this.trails=this.trails.filter(m=>{m.userData.age+=dt;m.material.opacity=Math.max(0,(1-m.userData.age/m.userData.life)*.28);if(m.userData.age>=m.userData.life){this.scene.remove(m);m.geometry.dispose();m.material.dispose();return false}return true});
    this.dust=this.dust.filter(m=>{m.userData.age+=dt;const q=m.userData.age/m.userData.life;m.material.opacity=.14*(1-q);m.scale.setScalar(1+q*3.2);if(q>=1){this.scene.remove(m);m.geometry.dispose();m.material.dispose();return false}return true});
    this.speedStreaks=this.speedStreaks.filter(m=>{m.userData.age+=dt;const q=m.userData.age/m.userData.life;m.material.opacity=.28*(1-q);m.scale.z=1+q*2.4;if(q>=1){this.scene.remove(m);m.geometry.dispose();m.material.dispose();return false}return true});
  }
  dispose(){if(this.particles&&this.scene){this.scene.remove(this.particles);this.particles.geometry.dispose();this.particles.material.dispose()}for(const m of [...this.trails,...this.dust,...this.speedStreaks]){this.scene?.remove(m);m.geometry?.dispose?.();m.material?.dispose?.()}this.trails.length=0;this.dust.length=0;this.speedStreaks.length=0;this.prevLimbs.clear();this.particles=null;this.scene=null;this.match=null;}
}
