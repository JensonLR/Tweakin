import { THREE } from '../vendor/three.js';

export class CombatLighting{
  constructor(match,mobile=false){
    this.match=match;this.mobile=mobile;this.group=new THREE.Group();match.scene.add(this.group);this.target=new THREE.Object3D();this.group.add(this.target);
    this.key=new THREE.SpotLight(0xffead8,mobile?24:34,mobile?18:22,.72,.76,1.15);this.key.castShadow=!mobile;this.key.shadow.mapSize.set(mobile?256:1024,mobile?256:1024);this.key.shadow.bias=-.00065;this.key.target=this.target;this.group.add(this.key);
    this.front=new THREE.DirectionalLight(0xfff6ed,mobile?3.8:5.0);this.front.target=this.target;this.group.add(this.front);
    this.fill=new THREE.PointLight(0xbed1f4,mobile?15:22,16,1.65);this.group.add(this.fill);
    this.rim=new THREE.PointLight(0xff3344,mobile?14:21,14,1.7);this.group.add(this.rim);
    this.top=new THREE.PointLight(0xffd9b5,mobile?10:15,13,1.6);this.group.add(this.top);
    this.bounce=new THREE.PointLight(0xd8a77f,mobile?8:11,11,1.8);this.group.add(this.bounce);
    this.hemi=new THREE.HemisphereLight(0xdce7ff,0x2b1717,mobile?1.45:1.7);this.group.add(this.hemi);
    this.time=0;
  }
  update(dt,camera){
    const fs=this.match?.fighters?.filter(f=>!f.ko)??[];if(!fs.length)return;this.time+=dt;let x=0,z=0;for(const f of fs){x+=f.group.position.x;z+=f.group.position.z}x/=fs.length;z/=fs.length;
    const cinematic=this.match.cinematicTime>0,spread=fs.length>1?Math.hypot(fs[0].group.position.x-fs[1].group.position.x,fs[0].group.position.z-fs[1].group.position.z):2;
    this.target.position.lerp(new THREE.Vector3(x,1.38,z),1-Math.exp(-dt*8));
    const cam=camera.position,dx=cam.x-x,dz=cam.z-z,len=Math.hypot(dx,dz)||1,nx=dx/len,nz=dz/len,rx=nz,rz=-nx;
    this.key.position.lerp(new THREE.Vector3(x+nx*3.2+rx*1.6,5.4,z+nz*3.2+rz*1.6),1-Math.exp(-dt*5));
    this.front.position.lerp(new THREE.Vector3(x+nx*4.4,3.25,z+nz*4.4),1-Math.exp(-dt*5));
    this.fill.position.lerp(new THREE.Vector3(x-nx*2.0-rx*2.1,2.35,z-nz*2.0-rz*2.1),1-Math.exp(-dt*4));
    this.rim.position.lerp(new THREE.Vector3(x-nx*2.8+rx*2.45,3.0,z-nz*2.8+rz*2.45),1-Math.exp(-dt*4));
    this.top.position.lerp(new THREE.Vector3(x,4.6+Math.min(1,spread*.09),z),1-Math.exp(-dt*4));
    this.bounce.position.lerp(new THREE.Vector3(x+rx*.8,.65,z+rz*.8),1-Math.exp(-dt*4));
    const impact=Math.min(1,this.match.cameraShake||0),pulse=Math.sin(this.time*1.7)*.5;
    this.key.intensity=(this.mobile?23:33)+(cinematic?8:0)+impact*3;
    this.front.intensity=(this.mobile?3.7:4.9)+(cinematic?.65:0);
    this.fill.intensity=(this.mobile?14:21)+(cinematic?3:0);
    this.rim.intensity=(this.mobile?13:20)+(cinematic?4:0)+pulse+impact*2;
    this.top.intensity=(this.mobile?9:14)+impact*3;
    this.bounce.intensity=(this.mobile?7:10)+(cinematic?1.5:0);
    this.hemi.intensity=(this.mobile?1.4:1.65)+(cinematic?.12:0);
  }
  dispose(){this.match?.scene?.remove(this.group);this.group.clear();this.match=null;}
}
