import { THREE } from '../vendor/three.js';

export class CombatLighting{
  constructor(match,mobile=false){
    this.match=match;this.mobile=mobile;this.group=new THREE.Group();match.scene.add(this.group);this.target=new THREE.Object3D();this.group.add(this.target);
    this.key=new THREE.SpotLight(0xffd9bc,mobile?9:13,mobile?12:16,.58,.72,1.25);this.key.castShadow=!mobile;this.key.shadow.mapSize.set(mobile?256:768,mobile?256:768);this.key.shadow.bias=-.0008;this.key.target=this.target;this.group.add(this.key);
    this.fill=new THREE.PointLight(0x90a8d6,mobile?3.2:5.2,10,2);this.group.add(this.fill);
    this.rim=new THREE.PointLight(0xff2834,mobile?4.6:7.4,9,2);this.group.add(this.rim);
    this.top=new THREE.PointLight(0xffc78f,mobile?2.1:3.4,8,2);this.group.add(this.top);this.time=0;
  }
  update(dt,camera){
    const fs=this.match?.fighters?.filter(f=>!f.ko)??[];if(!fs.length)return;this.time+=dt;let x=0,z=0;for(const f of fs){x+=f.group.position.x;z+=f.group.position.z}x/=fs.length;z/=fs.length;const cinematic=this.match.cinematicTime>0,spread=fs.length>1?Math.hypot(fs[0].group.position.x-fs[1].group.position.x,fs[0].group.position.z-fs[1].group.position.z):2;
    this.target.position.lerp(new THREE.Vector3(x,1.25,z),1-Math.exp(-dt*7));
    const cam=camera.position,dx=cam.x-x,dz=cam.z-z,len=Math.hypot(dx,dz)||1,nx=dx/len,nz=dz/len,rx=nz,rz=-nx;
    this.key.position.lerp(new THREE.Vector3(x+nx*2.8+rx*1.7,5.8,z+nz*2.8+rz*1.7),1-Math.exp(-dt*5));
    this.fill.position.lerp(new THREE.Vector3(x-nx*2.1-rx*2.2,2.1,z-nz*2.1-rz*2.2),1-Math.exp(-dt*4));
    this.rim.position.lerp(new THREE.Vector3(x-nx*2.7+rx*2.1,2.7,z-nz*2.7+rz*2.1),1-Math.exp(-dt*4));
    this.top.position.lerp(new THREE.Vector3(x,4.2+Math.min(1,spread*.08),z),1-Math.exp(-dt*4));
    this.key.intensity=(this.mobile?8.5:12.5)+(cinematic?4.5:0);this.fill.intensity=(this.mobile?2.8:4.6)+(cinematic?1.2:0);this.rim.intensity=(this.mobile?4.2:6.8)+(cinematic?3.4:0)+Math.sin(this.time*1.7)*.35;this.top.intensity=(this.mobile?1.8:3)+(this.match.cameraShake||0)*1.2;
  }
  dispose(){this.match?.scene?.remove(this.group);this.group.clear();this.match=null;}
}
