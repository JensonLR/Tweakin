import { THREE } from '../vendor/three.js';
import { SignatureFighter } from './SignatureFighter.js';
import { getFighterDef } from '../data/roster.js';
import { EMPTY_INPUT } from '../core/types.js';
import { hasAuthoredAsset } from '../data/characterAssets.js';
import { loadAuthoredCharacter } from './AuthoredCharacter.js';

export class MenuBackdrop{
  constructor(mobile=false){
    this.mobile=mobile;this.scene=new THREE.Scene();this.scene.background=new THREE.Color(0x050506);this.scene.fog=new THREE.FogExp2(0x09070a,.057);this.group=new THREE.Group();this.scene.add(this.group);this.time=0;this.fighters=[];this.featured=null;this.featuredId='';this.mode='menu';this.focusToken=0;
    const floorMat=new THREE.MeshStandardMaterial({color:0x0a0a0c,roughness:.74,metalness:.14});const floor=new THREE.Mesh(new THREE.PlaneGeometry(26,20),floorMat);floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;this.scene.add(floor);
    const back=new THREE.Mesh(new THREE.PlaneGeometry(20,9),new THREE.MeshStandardMaterial({color:0x0b090b,roughness:.94}));back.position.set(0,4,-4.3);this.scene.add(back);
    const floorGlow=new THREE.Mesh(new THREE.CircleGeometry(4.7,64),new THREE.MeshBasicMaterial({color:0x5b1219,transparent:true,opacity:mobile?.045:.065,depthWrite:false,blending:THREE.AdditiveBlending}));floorGlow.rotation.x=-Math.PI/2;floorGlow.position.set(.8,.018,-1.25);this.scene.add(floorGlow);this.floorGlow=floorGlow;
    for(let i=0;i<3;i++){const ring=new THREE.Mesh(new THREE.RingGeometry(1.5+i*.9,1.53+i*.9,64),new THREE.MeshBasicMaterial({color:i===0?0xe3202b:0xa66a48,transparent:true,opacity:mobile?.025:.035,depthWrite:false,blending:THREE.AdditiveBlending}));ring.rotation.x=-Math.PI/2;ring.position.set(.8,.021+i*.001,-1.25);this.scene.add(ring)}
    this.hemi=new THREE.HemisphereLight(0xc8d6ec,0x24151a,mobile?1.25:1.55);this.scene.add(this.hemi);
    const key=new THREE.SpotLight(0xffead8,mobile?36:52,28,.56,.68,1.05);key.position.set(-4.4,8.4,4.2);key.target.position.set(0,1.15,-1.25);key.castShadow=!mobile;key.shadow.mapSize.set(mobile?512:1024,mobile?512:1024);this.scene.add(key,key.target);this.key=key;
    const front=new THREE.DirectionalLight(0xfff6ee,mobile?4.4:6.6);front.position.set(0,4,7);front.target.position.set(0,1.4,-1);this.scene.add(front,front.target);this.front=front;
    const red=new THREE.PointLight(0xff2633,mobile?14:22,13,2);red.position.set(3.5,2.4,-1.4);this.scene.add(red);this.red=red;
    const blue=new THREE.PointLight(0x698cff,mobile?13:20,12,1.8);blue.position.set(-3.4,2.3,-2.0);this.scene.add(blue);this.blue=blue;
    const warm=new THREE.SpotLight(0xffc18e,mobile?16:24,17,.42,.68,1.2);warm.position.set(1.2,6,-3);warm.target.position.set(1.4,1.2,-1.8);this.scene.add(warm,warm.target);this.warm=warm;
    const ids=mobile?['trump','gigachad','greek']:['agarthan','trump','gigachad','floyd','greek'];const xs=mobile?[-1.85,0,1.9]:[-3.15,-1.55,0,1.62,3.12],zs=mobile?[-1.75,-1.15,-1.8]:[-2.35,-1.72,-1.25,-1.72,-2.38],scales=mobile?[.9,1,.88]:[.86,.93,1,.94,.88];
    ids.forEach((id,i)=>{const f=new SignatureFighter(getFighterDef(id),i);f.group.position.set(xs[i],0,zs[i]);f.group.rotation.y=(i-(ids.length-1)/2)*-.11;f.yaw=f.group.rotation.y;f.group.scale.multiplyScalar(scales[i]);f.state='Neutral';if(id==='gigachad'){f.momentum=100;f.specialTime=99}this.group.add(f.group);this.fighters.push(f);});
    const steel=new THREE.MeshStandardMaterial({color:0x202226,roughness:.5,metalness:.62});for(const x of[-4.6,-2.3,0,2.3,4.6]){const beam=new THREE.Mesh(new THREE.BoxGeometry(.12,5.4,.12),steel);beam.position.set(x,2.7,-3.65);beam.castShadow=!mobile;this.scene.add(beam)}const truss=new THREE.Mesh(new THREE.BoxGeometry(10.4,.12,.16),steel);truss.position.set(0,4.65,-3.55);this.scene.add(truss);for(let i=-4;i<=4;i++){const bulb=new THREE.Mesh(new THREE.SphereGeometry(.035,6,4),new THREE.MeshBasicMaterial({color:i%2?0xff4850:0xffd9bb}));bulb.position.set(i*1.1,4.45,-3.4);this.scene.add(bulb)}
    this.dust=[];const dustCount=mobile?28:68;for(let i=0;i<dustCount;i++){const geo=new THREE.SphereGeometry(.007+Math.random()*.012,4,3),mat=new THREE.MeshBasicMaterial({color:0xb6aaa2,transparent:true,opacity:.10+Math.random()*.14,depthWrite:false,blending:THREE.AdditiveBlending});const p=new THREE.Mesh(geo,mat);p.position.set((Math.random()-.5)*11,Math.random()*5.4,(Math.random()-.5)*8-1);p.userData.speed=.025+Math.random()*.075;this.scene.add(p);this.dust.push(p)}
  }
  disposeFighter(f){if(!f)return;const root=f.authored?f.root:f.group;if(!root)return;root.parent?.remove(root);root.traverse(o=>{o.geometry?.dispose?.();if(o.material){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.dispose?.())}})}
  async focusFighter(id){
    if(!id){this.clearFocus();return}if(this.featuredId===id)return;
    const token=++this.focusToken;this.disposeFighter(this.featured);this.featured=null;this.featuredId=id;this.mode='roster-art';this.group.visible=false;
    const def=getFighterDef(id),accent=def.palette.accent,x=this.mobile?0:.15;this.red.color.setHex(accent);this.floorGlow.material.color.setHex(accent);this.floorGlow.position.x=x;this.key.target.position.set(x,1.48,-.3);this.warm.target.position.set(x,1.4,-.35);this.front.target.position.set(x,1.42,-.3);
    // Never expose the rejected procedural fighter in Fighter Viewer. If an authored
    // asset is not installed, CSS key art remains the public presentation layer.
    if(!hasAuthoredAsset(id))return;
    const loaded=await loadAuthoredCharacter(id,{mobile:this.mobile});if(token!==this.focusToken||!loaded)return;
    loaded.root.position.x+=x;loaded.root.position.z=-.35;loaded.root.rotation.y=-.10;this.scene.add(loaded.root);this.featured={authored:true,...loaded};this.mode='roster-3d';
    this.key.intensity=this.mobile?44:66;this.front.intensity=this.mobile?5.4:8.2;this.hemi.intensity=this.mobile?1.5:1.9;
  }
  clearFocus(){this.focusToken++;if(this.featured){this.disposeFighter(this.featured);this.featured=null}this.featuredId='';this.mode='menu';this.group.visible=true;this.key.target.position.set(0,1.15,-1.25);this.warm.target.position.set(1.4,1.2,-1.8);this.front.target.position.set(0,1.4,-1);this.red.color.setHex(0xff2633);this.floorGlow.material.color.setHex(0x5b1219);this.floorGlow.position.x=.8;this.key.intensity=this.mobile?36:52;this.front.intensity=this.mobile?4.4:6.6;this.hemi.intensity=this.mobile?1.25:1.55;}
  animateDisplayFighter(f,dt,target=null){f.animate(dt,EMPTY_INPUT);f.facial?.update(dt,target);f.combatWear?.update?.();}
  update(dt,camera){
    this.time+=dt;const roster3d=this.mode==='roster-3d'&&this.featured;const rosterArt=this.mode==='roster-art';
    if(!roster3d){this.red.intensity=(this.mobile?13:20)+Math.sin(this.time*1.18)*(this.mobile?1.2:2);this.blue.intensity=(this.mobile?12:18)+Math.sin(this.time*.88+1)*1.2;this.warm.intensity=(this.mobile?15:23)+Math.sin(this.time*.53)*1.0;this.front.intensity=(this.mobile?4.3:6.5)+Math.sin(this.time*.37)*.08}else{this.red.intensity=(this.mobile?17:26)+Math.sin(this.time*1.18)*1.4;this.blue.intensity=(this.mobile?15:23)+Math.sin(this.time*.88+1)*1.0;this.warm.intensity=(this.mobile?19:29)+Math.sin(this.time*.53)*1.1;this.front.intensity=(this.mobile?5.3:8.1)+Math.sin(this.time*.37)*.10}this.floorGlow.material.opacity=(this.mobile?.04:.058)+Math.sin(this.time*.65)*.006;
    if(roster3d){const root=this.featured.root;root.rotation.y=-.10+Math.sin(this.time*.34)*.055;if(this.mobile){camera.position.set(.02,2.28,6.0);camera.lookAt(.02,1.42,-.35)}else{camera.position.set(.12,2.34,5.72);camera.lookAt(.15,1.43,-.35)}}
    else if(rosterArt){if(this.mobile){camera.position.set(0,2.3,8.2);camera.lookAt(0,1.4,-.4)}else{camera.position.set(0,2.55,8.4);camera.lookAt(0,1.45,-.6)}}
    else{this.group.rotation.y=Math.sin(this.time*.14)*.035;this.fighters.forEach((f,i)=>{const target=this.fighters[(i+1)%this.fighters.length];this.animateDisplayFighter(f,dt,target);f.head.rotation.y+=Math.sin(this.time*.46+f.slot)*.006;f.torso.rotation.y+=Math.sin(this.time*.31+f.slot*.7)*.006;if(f.def.id==='gigachad')f.aura.material.opacity=.07+Math.sin(this.time*2.8)*.025;});camera.position.x=Math.sin(this.time*.105)*(this.mobile?.35:.72);camera.position.y=this.mobile?2.48:2.65+Math.sin(this.time*.18)*.09;camera.position.z=this.mobile?7.9:7.55+Math.sin(this.time*.13)*.15;camera.lookAt(Math.sin(this.time*.11)*.13,1.38,-1.42)}
    for(const o of this.dust){o.position.y+=o.userData.speed*dt;if(o.position.y>5.35)o.position.y=.03;}
  }
  dispose(){this.focusToken++;this.disposeFighter(this.featured);this.featured=null;this.scene.traverse(o=>{o.geometry?.dispose?.();if(o.material){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.dispose?.())}});this.scene.clear();this.fighters=[];this.dust=[];}
}
