import { THREE } from '../vendor/three.js';

export class PresentationDirector{
  constructor(renderer,camera,mobile=false){this.renderer=renderer;this.camera=camera;this.mobile=mobile;this.scene=null;this.match=null;this.flash=0;this.particles=null;this.particleVel=[];this.clock=0;}
  attach(match){this.match=match;this.scene=match.scene;this.clock=0;this.buildAtmosphere();}
  buildAtmosphere(){
    if(!this.scene)return;
    const count=this.mobile?90:180;const geo=new THREE.BufferGeometry();const arr=new Float32Array(count*3);
    for(let i=0;i<count;i++){arr[i*3]=(Math.random()-.5)*16;arr[i*3+1]=Math.random()*6;arr[i*3+2]=(Math.random()-.5)*16;}
    geo.setAttribute('position',new THREE.BufferAttribute(arr,3));
    const mat=new THREE.PointsMaterial({color:0xb9a99f,size:this.mobile?.018:.026,transparent:true,opacity:.22,depthWrite:false});
    this.particles=new THREE.Points(geo,mat);this.scene.add(this.particles);
  }
  impact(pos,kind='light',blocked=false){
    if(!this.scene||!pos)return;const strong=['heavy','grapple','weapon','special','environment'].includes(kind);this.flash=Math.max(this.flash,strong?.22:.10);
    const color=blocked?0xb9c8d8:kind==='special'?0xffd56b:kind==='weapon'?0xff8a58:0xfff0d7;
    const burst=new THREE.Group();burst.position.copy(pos);this.scene.add(burst);const n=this.mobile?(strong?7:4):(strong?14:7);
    for(let i=0;i<n;i++){
      const m=new THREE.Mesh(new THREE.SphereGeometry(strong?.035:.024,5,4),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.9}));
      const a=Math.random()*Math.PI*2,s=Math.random()*(strong?3.2:1.7)+.8;m.userData.v=new THREE.Vector3(Math.cos(a)*s,(Math.random()*.9+.2)*s,Math.sin(a)*s);m.userData.life=.22+Math.random()*.28;burst.add(m);
    }
    burst.userData.burst=true;burst.userData.age=0;
  }
  update(dt){
    if(!this.scene)return;this.clock+=dt;this.flash=Math.max(0,this.flash-dt*2.5);this.renderer.toneMappingExposure=1.06+this.flash*.8;
    if(this.particles){this.particles.rotation.y+=dt*.005;const p=this.particles.geometry.attributes.position.array;for(let i=0;i<p.length/3;i++){p[i*3+1]+=dt*(.025+((i%7)*.003));if(p[i*3+1]>6)p[i*3+1]=0;}this.particles.geometry.attributes.position.needsUpdate=true;}
    const dead=[];for(const o of this.scene.children){if(!o.userData?.burst)continue;o.userData.age+=dt;for(const m of o.children){m.position.addScaledVector(m.userData.v,dt);m.userData.v.y-=5.5*dt;m.material.opacity=Math.max(0,1-o.userData.age/m.userData.life);}if(o.userData.age>.55)dead.push(o)}
    dead.forEach(o=>{this.scene.remove(o);o.traverse(x=>{x.geometry?.dispose?.();x.material?.dispose?.()})});
  }
  dispose(){if(this.particles&&this.scene){this.scene.remove(this.particles);this.particles.geometry.dispose();this.particles.material.dispose();}this.particles=null;this.scene=null;this.match=null;}
}
