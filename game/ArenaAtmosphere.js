import { THREE } from '../vendor/three.js';

export class ArenaAtmosphere{
  constructor(match,mobile=false){
    this.match=match;this.scene=match.scene;this.mobile=mobile;this.group=new THREE.Group();this.scene.add(this.group);this.beams=[];this.time=0;this.build();
  }
  build(){
    const d=this.match.arena.def,s=d.size*.5;
    const beamMat=(color,opacity)=>new THREE.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
    const colors=[d.lightA??0xffd8c0,d.lightB??0xc71920];
    const beamCount=this.mobile?2:4;
    for(let i=0;i<beamCount;i++){
      const geo=new THREE.ConeGeometry(.82,6.2,18,1,true),mat=beamMat(colors[i%2],this.mobile?.025:.04),m=new THREE.Mesh(geo,mat);
      const a=(i/beamCount)*Math.PI*2+.35;m.position.set(Math.cos(a)*s*.72,3.35,Math.sin(a)*s*.72);m.rotation.z=Math.PI+(Math.cos(a)*.18);m.rotation.x=Math.sin(a)*.18;m.userData.base=a;m.userData.opacity=mat.opacity;this.group.add(m);this.beams.push(m);
    }
    const count=this.mobile?70:160,geo=new THREE.BufferGeometry(),pos=new Float32Array(count*3),alpha=new Float32Array(count);
    for(let i=0;i<count;i++){pos[i*3]=(Math.random()-.5)*d.size*1.18;pos[i*3+1]=.08+Math.random()*4.8;pos[i*3+2]=(Math.random()-.5)*d.size*1.18;alpha[i]=Math.random()}
    geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('seed',new THREE.BufferAttribute(alpha,1));
    this.dust=new THREE.Points(geo,new THREE.PointsMaterial({color:0xe7ddd1,size:this.mobile?.018:.025,transparent:true,opacity:.16,depthWrite:false,blending:THREE.AdditiveBlending}));this.group.add(this.dust);
    const glowMat=new THREE.MeshBasicMaterial({color:colors[0],transparent:true,opacity:this.mobile?.025:.04,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
    this.floorGlow=new THREE.Mesh(new THREE.RingGeometry(s*.18,s*.72,64),glowMat);this.floorGlow.rotation.x=-Math.PI/2;this.floorGlow.position.y=.025;this.group.add(this.floorGlow);
  }
  update(dt){
    this.time+=dt;const intensity=Math.min(1,(this.match.cameraShake||0)*.7+(this.match.cinematicTime||0)*.45);
    this.beams.forEach((b,i)=>{b.rotation.y+=dt*(i%2?.045:-.035);b.material.opacity=b.userData.opacity*(1+intensity*1.6)+Math.sin(this.time*.8+i)*.006;});
    if(this.dust){this.dust.rotation.y+=dt*.007;const p=this.dust.geometry.attributes.position.array;for(let i=0;i<p.length/3;i++){p[i*3+1]+=dt*(.018+(i%9)*.0018);if(p[i*3+1]>5)p[i*3+1]=.05;}this.dust.geometry.attributes.position.needsUpdate=true;this.dust.material.opacity=.14+intensity*.08;}
    if(this.floorGlow){this.floorGlow.material.opacity=(this.mobile?.022:.035)+intensity*.045;this.floorGlow.rotation.z+=dt*.012;}
  }
  dispose(){
    this.scene?.remove(this.group);this.group.traverse(o=>{o.geometry?.dispose?.();if(o.material){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.dispose?.())}});this.group.clear();this.match=null;this.scene=null;
  }
}
