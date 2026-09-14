import { THREE } from '../vendor/three.js';
import { Fighter } from './Fighter.js';

function mat(color,rough=.58,metal=.04,emissive=0x000000,emissiveIntensity=0){return new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal,emissive,emissiveIntensity});}
function mesh(parent,geo,material,pos=[0,0,0],rot=[0,0,0],scale=[1,1,1]){const m=new THREE.Mesh(geo,material);m.position.set(...pos);m.rotation.set(...rot);m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}

export class DetailedFighter extends Fighter{
  constructor(def,slot){
    super(def,slot);this.detailMeshes=[];this.addIdentityLayer();this.addSurfaceLayer();this.animSeed=Math.random()*10;this.restScale=new THREE.Vector3(1,1,1);
    this.visualMaterials=[];const seen=new Set();this.group.traverse(o=>{if(!o.isMesh||!o.material)return;const list=Array.isArray(o.material)?o.material:[o.material];for(const m of list){if(!m?.color||seen.has(m))continue;seen.add(m);this.visualMaterials.push({m,base:m.color.clone(),rough:m.roughness??.6,metal:m.metalness??0});}});
  }
  add(parent,geo,material,pos,rot,scale){const m=mesh(parent,geo,material,pos,rot,scale);this.detailMeshes.push(m);return m;}
  addIdentityLayer(){
    const d=this.def,id=d.id,cloth=mat(d.palette.primary,.78,.02),secondary=mat(d.palette.secondary,.82,.01);
    if(id==='floyd'){
      this.add(this.torso,new THREE.TorusGeometry(.135,.009,7,24,Math.PI),mat(0x8c8f94,.30,.68),[0,.22,.30],[Math.PI/2,0,0]);
    }else if(id==='gigachad'){
      this.add(this.torso,new THREE.TorusGeometry(.25,.012,8,26,Math.PI),cloth,[0,.27,.13],[Math.PI/2,0,0],[1.08,.52,1]);
    }else if(id==='agarthan'){
      const glow=mat(0x8ff6ef,.25,.10,0x43d9d2,1.1);for(let i=-1;i<=1;i++)this.add(this.torso,new THREE.CylinderGeometry(.0035,.0035,.25,6),glow,[i*.075,.14,.315]);
    }else if(id==='greek'){
      this.group.traverse(o=>{if(o.isMesh&&o.material?.color&&!o.material.transparent){o.material.roughness=Math.max(.84,o.material.roughness??.84);o.material.metalness=.01;}});this.add(this.torso,new THREE.CapsuleGeometry(.008,.28,4,8),secondary,[.19,.08,.29],[0,0,-.20]);
    }
  }
  addSurfaceLayer(){const panel=mat(this.def.palette.secondary,.88,.012);for(let i=0;i<2;i++)this.add(this.torso,new THREE.CapsuleGeometry(.006,.075,4,8),panel,[0,.34-i*.095,.315],[0,0,Math.PI/2],[1,.75,.65]);}
  stance(t){
    const styles=this.def.styles||[],bounce=Math.sin(t*6.2);
    if(styles.includes('Kickboxing')){this.leftArm.rotation.x=-1.02;this.rightArm.rotation.x=-1.15;this.leftFore.rotation.x=-.72;this.rightFore.rotation.x=-.62;this.leftLeg.rotation.x=bounce*.035;this.rightLeg.rotation.x=-bounce*.035;this.torso.rotation.x=.035;}
    else if(styles.includes('Martial Arts')){this.leftArm.rotation.x=-.78;this.rightArm.rotation.x=-.52;this.leftFore.rotation.z=-.30;this.rightFore.rotation.z=.26;this.torso.rotation.z=Math.sin(t*1.5)*.018;}
    else if(styles.includes('Wrestling')){this.leftArm.rotation.x=-.46;this.rightArm.rotation.x=-.46;this.leftFore.rotation.z=-.18;this.rightFore.rotation.z=.18;this.leftLeg.rotation.z=.08;this.rightLeg.rotation.z=-.08;this.torso.rotation.x=.10;}
    else{this.leftArm.rotation.x=-.31+Math.sin(t*1.9)*.035;this.rightArm.rotation.x=-.38-Math.sin(t*1.7)*.035;this.leftFore.rotation.z=-.10;this.rightFore.rotation.z=.10;this.torso.rotation.z=Math.sin(t*.9)*.012;}
  }
  updateDamageLook(){
    const damage=THREE.MathUtils.clamp(1-(this.physical+this.consciousness)/200,0,1),flash=this.hitFlash;
    for(const v of this.visualMaterials){const m=v.m;if(!m?.color)continue;const target=v.base.clone();
      if(this.def.id==='greek'){target.multiplyScalar(1-damage*.18);m.roughness=Math.min(1,v.rough+damage*.1);}
      else{target.multiplyScalar(1-damage*.10);if(v.metal<.15&&damage>.18)target.lerp(new THREE.Color(0x6c3940),damage*.08);m.roughness=Math.min(1,v.rough+damage*.05);}
      if(flash>0)target.lerp(new THREE.Color(0xffffff),Math.min(.42,flash*.26));m.color.lerp(target,.22);
    }
  }
  animate(dt,input){
    super.animate(dt,input);const t=performance.now()/1000+this.animSeed;
    if(this.state==='Neutral'||this.state==='Block'){
      const breath=Math.sin(t*2.15)*.010;this.torso.scale.y=1+breath;this.torso.scale.x=1-breath*.38;this.head.rotation.z=Math.sin(t*1.1)*.015;this.head.rotation.x=Math.sin(t*.8+this.slot)*.010;
      if(this.state==='Neutral'&&!this.fallbackMotion)this.stance(t);
    }else this.torso.scale.lerp(this.restScale,Math.min(1,dt*10));
    if(this.state==='Stun')this.head.rotation.z=Math.sin(this.stateTime*34)*.09*(1-Math.min(1,this.stateTime/.28));
    if(this.state==='Victory'&&!this.fallbackMotion){this.leftArm.rotation.z=-.42+Math.sin(t*3)*.08;this.rightArm.rotation.z=.42-Math.sin(t*3)*.08;this.torso.rotation.y=Math.sin(t*1.5)*.08;}
    const glow=this.specialTime>0?.65+.35*Math.sin(t*9):0;this.detailMeshes.forEach(m=>{if(m.material?.emissive&&this.def.id==='agarthan')m.material.emissiveIntensity=Math.max(m.material.emissiveIntensity||0,glow*1.25);});this.updateDamageLook();
  }
}
