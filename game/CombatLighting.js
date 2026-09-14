import { THREE } from '../vendor/three.js';

export class CombatLighting{
  constructor(match,mobile=false){
    this.match=match;this.mobile=mobile;this.group=new THREE.Group();match.scene.add(this.group);this.target=new THREE.Object3D();this.group.add(this.target);
    this.key=new THREE.SpotLight(0xffe2cc,mobile?5.6:8.2,mobile?13:17,.62,.76,1.35);this.key.castShadow=!mobile;this.key.shadow.mapSize.set(mobile?256:768,mobile?256:768);this.key.shadow.bias=-.0008;this.key.target=this.target;this.group.add(this.key);
    this.fill=new THREE.PointLight(0x90a8d6,mobile?2.2:3.5,11,2);this.group.add(this.fill);
    this.rim=new THREE.PointLight(0xd92934,mobile?2.3:3.9,9,2);this.group.add(this.rim);
    this.top=new THREE.PointLight(0xffd4aa,mobile?1.5:2.3,9,2);this.group.add(this.top);this.time=0;
  }
  update(dt,camera){
    const fs=this.match?.fighters?.filter(f=>!f.ko)??[];if(!fs.length)return;this.time+=dt;let x=0,z=0;for(const f of fs){x+=f.group.position.x;z+=f.group.position.z}x/=fs.length;z/=fs.length;const cinematic=this.match.cinematicTime>0,spread=fs.length>1?Math.hypot(fs[0].group.position.x-fs[1].group.position.x,fs[0].group.position.z-fs[1].group.position.z):2;
    this.target.position.lerp(new THREE.Vector3(x,1.25,z),1-Math.exp(-dt*7));
    const cam=camera.position,dx=cam.x-x,dz=cam.z-z,len=Math.hypot(dx,dz)||1,nx=dx/len,nz=dz/len,rx=nz,rz=-nx;
    this.key.position.lerp(new THREE.Vector3(x+nx*3.2+rx*1.5,5.4,z+nz*3.2+rz*1.5),1-Math.exp(-dt*5));
    this.fill.position.lerp(new THREE.Vector3(x-nx*2.2-rx*2.0,2.35,z-nz*2.2-rz*2.0),1-Math.exp(-dt*4));
    this.rim.position.lerp(new THREE.Vector3(x-nx*2.8+rx*2.25,2.9,z-nz*2.8+rz*2.25),1-Math.exp(-dt*4));
    this.top.position.lerp(new THREE.Vector3(x,4.4+Math.min(1,spread*.08),z),1-Math.exp(-dt*4));
    this.key.intensity=(this.mobile?5.2:7.8)+(cinematic?1.8:0);this.fill.intensity=(this.mobile?2:3.2)+(cinematic?.7:0);this.rim.intensity=(this.mobile?2.1:3.5)+(cinematic?1.25:0)+Math.sin(this.time*1.7)*.16;this.top.intensity=(this.mobile?1.35:2.1)+(this.match.cameraShake||0)*.55;
  }
  dispose(){this.match?.scene?.remove(this.group);this.group.clear();this.match=null;}
}
