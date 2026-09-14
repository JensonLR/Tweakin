import { THREE } from '../vendor/three.js';

export class CombatLighting{
  constructor(match,mobile=false){
    this.match=match;this.mobile=mobile;this.group=new THREE.Group();match.scene.add(this.group);this.target=new THREE.Object3D();this.group.add(this.target);
    this.key=new THREE.SpotLight(0xffe5d2,mobile?7.4:10.6,mobile?15:19,.66,.72,1.25);this.key.castShadow=!mobile;this.key.shadow.mapSize.set(mobile?256:1024,mobile?256:1024);this.key.shadow.bias=-.00065;this.key.target=this.target;this.group.add(this.key);
    this.front=new THREE.DirectionalLight(0xfff2e6,mobile?2.1:3.2);this.front.target=this.target;this.group.add(this.front);
    this.fill=new THREE.PointLight(0xa8bcdf,mobile?3.2:4.6,13,2);this.group.add(this.fill);
    this.rim=new THREE.PointLight(0xe52b39,mobile?3.0:4.8,11,2);this.group.add(this.rim);
    this.top=new THREE.PointLight(0xffd3aa,mobile?2.0:3.1,11,2);this.group.add(this.top);
    this.bounce=new THREE.PointLight(0xc89973,mobile?1.4:2.1,9,2);this.group.add(this.bounce);
    this.hemi=new THREE.HemisphereLight(0xc8d5ee,0x2a1714,mobile?.82:1.02);this.group.add(this.hemi);
    this.time=0;
  }
  update(dt,camera){
    const fs=this.match?.fighters?.filter(f=>!f.ko)??[];if(!fs.length)return;this.time+=dt;let x=0,z=0;for(const f of fs){x+=f.group.position.x;z+=f.group.position.z}x/=fs.length;z/=fs.length;
    const cinematic=this.match.cinematicTime>0,spread=fs.length>1?Math.hypot(fs[0].group.position.x-fs[1].group.position.x,fs[0].group.position.z-fs[1].group.position.z):2;
    this.target.position.lerp(new THREE.Vector3(x,1.38,z),1-Math.exp(-dt*8));
    const cam=camera.position,dx=cam.x-x,dz=cam.z-z,len=Math.hypot(dx,dz)||1,nx=dx/len,nz=dz/len,rx=nz,rz=-nx;
    this.key.position.lerp(new THREE.Vector3(x+nx*3.4+rx*1.65,5.8,z+nz*3.4+rz*1.65),1-Math.exp(-dt*5));
    this.front.position.lerp(new THREE.Vector3(x+nx*4.6,3.35,z+nz*4.6),1-Math.exp(-dt*5));
    this.fill.position.lerp(new THREE.Vector3(x-nx*2.0-rx*2.3,2.45,z-nz*2.0-rz*2.3),1-Math.exp(-dt*4));
    this.rim.position.lerp(new THREE.Vector3(x-nx*3.0+rx*2.55,3.05,z-nz*3.0+rz*2.55),1-Math.exp(-dt*4));
    this.top.position.lerp(new THREE.Vector3(x,4.8+Math.min(1,spread*.09),z),1-Math.exp(-dt*4));
    this.bounce.position.lerp(new THREE.Vector3(x+rx*.8,.55,z+rz*.8),1-Math.exp(-dt*4));
    const impact=Math.min(1,this.match.cameraShake||0),pulse=Math.sin(this.time*1.7)*.14;
    this.key.intensity=(this.mobile?7.1:10.1)+(cinematic?1.9:0)+impact*.65;
    this.front.intensity=(this.mobile?2.0:3.0)+(cinematic?.55:0);
    this.fill.intensity=(this.mobile?3.0:4.35)+(cinematic?.65:0);
    this.rim.intensity=(this.mobile?2.85:4.55)+(cinematic?1.05:0)+pulse+impact*.35;
    this.top.intensity=(this.mobile?1.8:2.8)+impact*.7;
    this.bounce.intensity=(this.mobile?1.25:1.9)+(cinematic?.25:0);
    this.hemi.intensity=(this.mobile?.78:.96)+(cinematic?.08:0);
  }
  dispose(){this.match?.scene?.remove(this.group);this.group.clear();this.match=null;}
}
