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
    const d=this.def,id=d.id, skin=mat(d.palette.skin,.72), dark=mat(0x171418,.72), metal=mat(0x8c8f94,.28,.72), accent=mat(d.palette.accent,.42,.18), cloth=mat(d.palette.primary,.7,.03);
    this.add(this.head,new THREE.BoxGeometry(.27,.10,.10),skin,[0,-.12,.255],[.05,0,0],[1.22,1,.72]);
    this.add(this.head,new THREE.SphereGeometry(.055,10,7),skin,[-.305,0,.01]);this.add(this.head,new THREE.SphereGeometry(.055,10,7),skin,[.305,0,.01]);
    this.add(this.head,new THREE.BoxGeometry(.11,.026,.034),dark,[-.105,.095,.298],[0,0,-.08]);this.add(this.head,new THREE.BoxGeometry(.11,.026,.034),dark,[.105,.095,.298],[0,0,.08]);
    const mouth=this.add(this.head,new THREE.BoxGeometry(.14,.018,.022),dark,[0,-.155,.308]);mouth.rotation.z=id==='wojak'?-.12:0;
    [this.leftFore,this.rightFore].forEach(p=>{this.add(p,new THREE.SphereGeometry(.115,10,8),skin,[0,-.58,.02],[0,0,0],[1.08,.8,1]);for(let k=0;k<3;k++)this.add(p,new THREE.SphereGeometry(.028,7,5),skin,[(k-1)*.045,-.64,.115]);});
    this.add(this.torso,new THREE.BoxGeometry(.78,.07,.08),accent,[0,.56,.31],[0,0,0],[1,1,.7]);
    if(id==='trump'){
      this.add(this.torso,new THREE.BoxGeometry(.075,.55,.035),mat(0xb50d18,.42,.08),[0,.14,.43],[0,0,0],[1,.98,1]);
      const sweep=this.add(this.head,new THREE.BoxGeometry(.44,.095,.28),mat(0xd9b56b,.78),[.035,.285,-.01],[0,0,-.15],[1,.8,1]);sweep.geometry.translate(.04,0,0);
    }else if(id==='netanyahu'){
      this.add(this.head,new THREE.BoxGeometry(.47,.065,.31),mat(0xa9a39d,.8),[0,.26,-.025],[0,0,0],[1,.8,1]);
      this.add(this.head,new THREE.BoxGeometry(.13,.06,.035),metal,[-.1,.075,.32]);this.add(this.head,new THREE.BoxGeometry(.13,.06,.035),metal,[.1,.075,.32]);this.add(this.head,new THREE.BoxGeometry(.07,.018,.022),metal,[0,.075,.34]);
    }else if(id==='kirk'){
      this.add(this.torso,new THREE.CylinderGeometry(.07,.07,.34,8),mat(0x304f87,.5,.08),[0,.13,.425]);
    }else if(id==='floyd'){
      this.add(this.head,new THREE.BoxGeometry(.30,.10,.18),dark,[0,-.21,.13],[0,0,0],[1.2,.75,1]);this.add(this.torso,new THREE.TorusGeometry(.18,.025,7,18,Math.PI),metal,[0,.21,.38],[Math.PI/2,0,0]);
    }else if(id==='gigachad'){
      this.add(this.head,new THREE.BoxGeometry(.42,.18,.23),skin,[0,-.17,.02],[0,0,0],[1.13,.85,1]);this.add(this.torso,new THREE.TorusGeometry(.43,.055,8,24),dark,[0,.22,.15],[Math.PI/2,0,0],[1.18,.72,1]);
    }else if(id==='agarthan'){
      const glow=mat(0xd8ffff,.22,.22,0x55ffff,1.9);this.add(this.head,new THREE.SphereGeometry(.042,10,7),glow,[-.105,.06,.31]);this.add(this.head,new THREE.SphereGeometry(.042,10,7),glow,[.105,.06,.31]);this.add(this.torso,new THREE.TorusGeometry(.27,.028,8,28),metal,[0,.18,.38],[Math.PI/2,0,0]);for(let i=0;i<5;i++)this.add(this.torso,new THREE.CylinderGeometry(.012,.012,.42,6),metal,[(i-2)*.115,.15,.385],[0,0,0]);
    }else if(id==='greek'){
      const marble=mat(0xd8d2c6,.92,.02);this.group.traverse(o=>{if(o.isMesh&&o.material?.color&&!o.material.transparent){o.material.roughness=.88;o.material.metalness=.01;}});this.add(this.head,new THREE.TorusGeometry(.33,.035,8,30,Math.PI*1.45),marble,[0,.13,-.02],[Math.PI/2,0,.2]);this.add(this.torso,new THREE.BoxGeometry(.055,.62,.055),marble,[.32,.08,.35],[0,0,-.25]);
    }else if(id==='wojak'){
      this.add(this.head,new THREE.TorusGeometry(.11,.015,7,20,Math.PI),dark,[0,-.145,.302],[0,0,Math.PI]);
    }
    this.add(this.group,new THREE.BoxGeometry(.58,.10,.34),cloth,[0,1.09,.01]);
    [this.leftShin,this.rightShin].forEach(p=>this.add(p,new THREE.TorusGeometry(.17,.025,7,16),accent,[0,-.05,0],[Math.PI/2,0,0]));
  }
  addSurfaceLayer(){
    const c=this.def.palette.secondary, panel=mat(c,.83,.02);for(let i=0;i<3;i++)this.add(this.torso,new THREE.BoxGeometry(.16,.055,.025),panel,[0,.39-i*.11,.39]);
    const sole=mat(0x111113,.88,.01);[this.leftShin,this.rightShin].forEach(p=>this.add(p,new THREE.BoxGeometry(.30,.045,.48),sole,[0,-.73,.12]));
  }
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
      else{target.multiplyScalar(1-damage*.13);if(v.metal<.15&&damage>.18){const bruise=new THREE.Color(0x6c3940);target.lerp(bruise,damage*.11);}m.roughness=Math.min(1,v.rough+damage*.06);}
      if(flash>0)target.lerp(new THREE.Color(0xffffff),Math.min(.45,flash*.28));m.color.lerp(target,.22);
    }
  }
  animate(dt,input){
    super.animate(dt,input);const t=performance.now()/1000+this.animSeed;
    if(this.state==='Neutral'||this.state==='Block'){
      const breath=Math.sin(t*2.15)*.012;this.torso.scale.y=1+breath;this.torso.scale.x=1-breath*.45;this.head.rotation.z=Math.sin(t*1.1)*.018;this.head.rotation.x=Math.sin(t*.8+this.slot)*.012;if(this.state==='Neutral')this.stance(t);
    }else{this.torso.scale.lerp(this.restScale,Math.min(1,dt*10));}
    if(this.state==='Stun'){this.head.rotation.z=Math.sin(this.stateTime*34)*.11*(1-Math.min(1,this.stateTime/.28));}
    if(this.state==='Victory'){this.leftArm.rotation.z=-.42+Math.sin(t*3)*.08;this.rightArm.rotation.z=.42-Math.sin(t*3)*.08;this.torso.rotation.y=Math.sin(t*1.5)*.08;}
    const glow=this.specialTime>0?.65+.35*Math.sin(t*9):0;this.detailMeshes.forEach(m=>{if(m.material?.emissive&&this.def.id==='agarthan')m.material.emissiveIntensity=Math.max(m.material.emissiveIntensity||0,glow*1.4);});this.updateDamageLook();
  }
}
