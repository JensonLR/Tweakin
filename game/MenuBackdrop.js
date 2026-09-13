import { THREE } from '../vendor/three.js';
import { EliteFighter } from './EliteFighter.js';
import { getFighterDef } from '../data/roster.js';
import { EMPTY_INPUT } from '../core/types.js';

export class MenuBackdrop{
  constructor(){
    this.scene=new THREE.Scene();this.scene.background=new THREE.Color(0x050506);this.scene.fog=new THREE.FogExp2(0x09070a,.062);this.group=new THREE.Group();this.scene.add(this.group);this.time=0;this.fighters=[];this.featured=null;this.featuredId='';this.mode='menu';
    const floorMat=new THREE.MeshStandardMaterial({color:0x0a0a0c,roughness:.82,metalness:.08});
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(26,20,1,1),floorMat);floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;this.scene.add(floor);
    const back=new THREE.Mesh(new THREE.PlaneGeometry(20,9),new THREE.MeshStandardMaterial({color:0x0b090b,roughness:.94}));back.position.set(0,4,-4.3);this.scene.add(back);
    const hemi=new THREE.HemisphereLight(0x67748b,0x090607,.52);this.scene.add(hemi);
    const key=new THREE.SpotLight(0xffdcc2,24,22,.46,.72,1.35);key.position.set(-4.4,8.4,4.2);key.target.position.set(0,1.15,-1.25);key.castShadow=true;key.shadow.mapSize.set(1024,1024);this.scene.add(key,key.target);this.key=key;
    const red=new THREE.PointLight(0xff2633,20,12,2);red.position.set(3.5,2.4,-1.4);this.scene.add(red);this.red=red;
    const blue=new THREE.PointLight(0x365fff,12,10,2);blue.position.set(-3.4,2.3,-2.0);this.scene.add(blue);this.blue=blue;
    const warm=new THREE.SpotLight(0xffaa67,13,15,.34,.75,1.4);warm.position.set(1.2,6,-3);warm.target.position.set(1.4,1.2,-1.8);this.scene.add(warm,warm.target);this.warm=warm;

    const ids=['agarthan','trump','gigachad','floyd','greek'];
    const xs=[-3.15,-1.55,0,1.62,3.12],zs=[-2.35,-1.72,-1.25,-1.72,-2.38],scales=[.86,.93,1,.94,.88];
    ids.forEach((id,i)=>{const f=new EliteFighter(getFighterDef(id),i);f.group.position.set(xs[i],0,zs[i]);f.group.rotation.y=(i-2)*-.11;f.yaw=f.group.rotation.y;f.group.scale.multiplyScalar(scales[i]);f.state='Neutral';f.momentum=i===2?100:0;f.specialTime=i===2?99:0;this.group.add(f.group);this.fighters.push(f);});

    const steel=new THREE.MeshStandardMaterial({color:0x202226,roughness:.5,metalness:.62});
    for(const x of[-4.6,-2.3,0,2.3,4.6]){const beam=new THREE.Mesh(new THREE.BoxGeometry(.12,5.4,.12),steel);beam.position.set(x,2.7,-3.65);beam.castShadow=true;this.scene.add(beam)}
    const truss=new THREE.Mesh(new THREE.BoxGeometry(10.4,.12,.16),steel);truss.position.set(0,4.65,-3.55);this.scene.add(truss);
    for(let i=-4;i<=4;i++){const bulb=new THREE.Mesh(new THREE.SphereGeometry(.035,7,5),new THREE.MeshBasicMaterial({color:i%2?0xff4850:0xffd9bb}));bulb.position.set(i*1.1,4.45,-3.4);this.scene.add(bulb)}

    this.dust=[];for(let i=0;i<72;i++){const geo=new THREE.SphereGeometry(.007+Math.random()*.012,4,3),mat=new THREE.MeshBasicMaterial({color:0xb6aaa2,transparent:true,opacity:.13+Math.random()*.16,depthWrite:false});const p=new THREE.Mesh(geo,mat);p.position.set((Math.random()-.5)*11,Math.random()*5.4,(Math.random()-.5)*8-1);p.userData.speed=.025+Math.random()*.075;this.scene.add(p);this.dust.push(p)}
  }
  disposeFighter(f){if(!f)return;f.group.parent?.remove(f.group);f.group.traverse(o=>{o.geometry?.dispose?.();if(o.material){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.dispose?.())}})}
  focusFighter(id){
    if(!id){this.clearFocus();return}if(this.featuredId===id&&this.featured)return;
    this.disposeFighter(this.featured);this.featured=new EliteFighter(getFighterDef(id),7);this.featuredId=id;this.mode='roster';
    this.featured.group.position.set(2.35,0,-.5);this.featured.group.scale.multiplyScalar(1.32);this.featured.group.rotation.y=-.16;this.featured.yaw=-.16;this.featured.state='Neutral';
    this.scene.add(this.featured.group);this.group.visible=false;this.key.target.position.set(2.15,1.45,-.45);this.warm.target.position.set(2.35,1.45,-.6);
  }
  clearFocus(){if(this.featured){this.disposeFighter(this.featured);this.featured=null}this.featuredId='';this.mode='menu';this.group.visible=true;this.key.target.position.set(0,1.15,-1.25);this.warm.target.position.set(1.4,1.2,-1.8)}
  update(dt,camera){
    this.time+=dt;this.red.intensity=16+Math.sin(this.time*1.18)*4;this.blue.intensity=9+Math.sin(this.time*.88+1)*2.2;this.warm.intensity=11+Math.sin(this.time*.53)*1.5;
    if(this.mode==='roster'&&this.featured){
      const f=this.featured;f.animate(dt,EMPTY_INPUT);f.group.rotation.y=-.16+Math.sin(this.time*.34)*.10;f.head.rotation.y+=Math.sin(this.time*.62)*.008;f.torso.rotation.y+=Math.sin(this.time*.37)*.008;
      camera.position.x=1.05+Math.sin(this.time*.12)*.18;camera.position.y=2.50+Math.sin(this.time*.18)*.05;camera.position.z=6.05;camera.lookAt(2.20,1.42,-.48);
    }else{
      this.group.rotation.y=Math.sin(this.time*.14)*.035;this.fighters.forEach((f,i)=>{f.animate(dt,EMPTY_INPUT);f.head.rotation.y+=Math.sin(this.time*.46+i)*.006;f.torso.rotation.y+=Math.sin(this.time*.31+i*.7)*.006;if(i===2)f.aura.material.opacity=.07+Math.sin(this.time*2.8)*.025;});
      camera.position.x=Math.sin(this.time*.105)*.72;camera.position.y=2.65+Math.sin(this.time*.18)*.09;camera.position.z=7.55+Math.sin(this.time*.13)*.15;camera.lookAt(Math.sin(this.time*.11)*.13,1.38,-1.42);
    }
    for(const o of this.dust){o.position.y+=o.userData.speed*dt;if(o.position.y>5.35)o.position.y=.03;}
  }
  dispose(){this.disposeFighter(this.featured);this.featured=null;this.scene.traverse(o=>{o.geometry?.dispose?.();if(o.material){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.dispose?.())}});this.scene.clear();this.fighters=[];this.dust=[];}
}
