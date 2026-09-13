import { THREE } from '../vendor/three.js';
import { UltraFighter } from './UltraFighter.js';
import { addFaceDetail } from './FaceDetail.js';
import { addCharacterDetail } from './CharacterDetail.js';
import { addAnatomyDetail } from './AnatomyDetail.js';
import { CombatWear } from './CombatWear.js';
import { applyFighterSurface } from './SurfaceDetail.js';

const DUR={light:.34,heavy:.62,grapple:.72,special:2.35};
const bell=x=>Math.sin(Math.PI*Math.max(0,Math.min(1,x)));

export class EliteFighter extends UltraFighter{
  constructor(def,slot){
    super(def,slot);
    this.buffered='';this.bufferTime=0;this.prevBlock=false;this.parryWindow=0;this.evadeTime=0;this.evadeCooldown=0;this.invuln=0;this.justEvaded=false;this.signatureStep=0;
    addFaceDetail(this);addCharacterDetail(this);addAnatomyDetail(this);applyFighterSurface(this.group,this.def);this.combatWear=new CombatWear(this);
  }
  setState(s,move=''){const starting=s==='Attack'&&move&&this.state!=='Attack';super.setState(s,move);if(starting)this.signatureStep=(this.signatureStep+1)%4}
  update(dt,input,target,arena){
    this.bufferTime=Math.max(0,this.bufferTime-dt);this.parryWindow=Math.max(0,this.parryWindow-dt);this.evadeTime=Math.max(0,this.evadeTime-dt);this.evadeCooldown=Math.max(0,this.evadeCooldown-dt);this.invuln=Math.max(0,this.invuln-dt);this.justEvaded=false;
    if(input.block&&!this.prevBlock&&this.canAct()){this.parryWindow=.14;this.momentum=Math.min(100,this.momentum+1)}this.prevBlock=!!input.block;
    if(this.state==='Attack'){const next=input.grapple?'grapple':input.heavy?'heavy':input.light?'light':'';if(next){this.buffered=next;this.bufferTime=.42}}
    if(this.state!=='Attack'&&this.buffered&&this.bufferTime>0&&this.canAct()){input={...input,[this.buffered]:true};this.buffered='';this.bufferTime=0}
    const axis=Math.hypot(input.x||0,input.y||0);if(input.block&&input.run&&axis>.45&&this.evadeCooldown<=0&&this.canAct()&&this.state!=='Attack'){const side=Math.abs(input.x)>.2?Math.sign(input.x):((this.slot%2)?-1:1);this.group.position.x+=Math.cos(this.yaw)*side*.62;this.group.position.z+=-Math.sin(this.yaw)*side*.62;this.evadeTime=.26;this.invuln=.16;this.evadeCooldown=.72;this.justEvaded=true;input={...input,block:false,run:false,x:0,y:0}}
    const ev=super.update(dt,input,target,arena);this.combatWear?.update();return ev;
  }
  tryDefense(kind,attacker){if(this.invuln>0)return{evaded:true};if(this.parryWindow>0&&kind!=='grapple'&&kind!=='special'&&kind!=='environment'){this.parryWindow=0;this.momentum=Math.min(100,this.momentum+12);if(attacker&&!attacker.ko)attacker.setState('Stun');return{parried:true}}return null}
  disposeWeapon(){if(!this.weaponVisual)return;this.rightFore.remove(this.weaponVisual);this.weaponVisual.traverse?.(o=>{o.geometry?.dispose?.();if(o.material){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.dispose?.())}});this.weaponVisual=null}
  setWeaponVisual(kind){
    this.disposeWeapon();this.heldWeapon=kind;if(!kind)return;const g=new THREE.Group();g.position.set(0,-.55,.11);g.rotation.z=.24;const add=(geo,mat,pos=[0,0,0],rot=[0,0,0])=>{const m=new THREE.Mesh(geo,mat);m.position.set(...pos);m.rotation.set(...rot);m.castShadow=true;g.add(m);return m};const wood=new THREE.MeshStandardMaterial({color:0x59371f,roughness:.68,metalness:.02}),steel=new THREE.MeshStandardMaterial({color:0x777d82,roughness:.32,metalness:.76}),grip=new THREE.MeshStandardMaterial({color:0x171719,roughness:.82});
    if(kind==='pipe'){add(new THREE.CylinderGeometry(.045,.052,.92,12),steel,[0,-.05,0]);const elbow=add(new THREE.TorusGeometry(.13,.045,8,14,Math.PI*.55),steel,[.085,-.5,0],[Math.PI/2,0,Math.PI*.22]);elbow.scale.z=.8;for(let i=-3;i<=3;i++)add(new THREE.TorusGeometry(.055,.009,6,10),grip,[0,.24+i*.045,0],[Math.PI/2,0,0])}
    else if(kind==='bat'){add(new THREE.CylinderGeometry(.038,.078,1.05,12),wood,[0,-.05,0]);add(new THREE.CylinderGeometry(.052,.052,.28,10),grip,[0,.49,0]);add(new THREE.TorusGeometry(.06,.012,6,12),grip,[0,.62,0],[Math.PI/2,0,0])}
    else if(kind==='bottle'){const glass=new THREE.MeshPhysicalMaterial({color:0x5d8369,roughness:.18,metalness:0,transmission:.28,transparent:true,opacity:.82,thickness:.08});add(new THREE.CylinderGeometry(.085,.105,.42,12),glass,[0,-.16,0]);add(new THREE.CylinderGeometry(.045,.065,.18,12),glass,[0,.14,0]);add(new THREE.CylinderGeometry(.052,.052,.045,10),new THREE.MeshStandardMaterial({color:0xb6a076,roughness:.42,metalness:.25}),[0,.25,0])}
    else if(kind==='broom'){add(new THREE.CylinderGeometry(.025,.03,1.15,10),wood,[0,.05,0]);add(new THREE.BoxGeometry(.46,.15,.18),new THREE.MeshStandardMaterial({color:0x8b7046,roughness:.9}),[0,-.55,0]);for(let i=-4;i<=4;i++)add(new THREE.CylinderGeometry(.006,.01,.26,5),new THREE.MeshStandardMaterial({color:0xa89569,roughness:1}),[i*.045,-.73,0],[0,0,i*.025])}
    this.rightFore.add(g);this.weaponVisual=g;
  }
  signatureAttack(){
    if(this.state!=='Attack'||!DUR[this.attackType]||this.attackType==='special')return;
    const p=Math.min(1,this.stateTime/DUR[this.attackType]),b=bell(p),id=this.def.id,side=this.attackSide||1;
    if(id==='kirk'||id==='agarthan'){
      if(this.attackType==='heavy'||(this.attackType==='light'&&this.signatureStep%2===0)){const leg=side>0?this.rightLeg:this.leftLeg,shin=side>0?this.rightShin:this.leftShin;leg.rotation.x-=b*(id==='agarthan'?1.55:1.35);leg.rotation.z+=side*b*(id==='agarthan'?.38:.24);shin.rotation.x+=b*.62;this.torso.rotation.y-=side*b*.34;this.torso.rotation.x+=b*.09;}else{this.torso.rotation.y+=side*b*.22;this.leftArm.rotation.z-=side*b*.14;}
    }else if(id==='trump'){
      if(this.attackType==='heavy'){this.torso.rotation.y+=side*b*.74;this.rightArm.rotation.z+=side*b*.55;this.rightFore.rotation.x-=b*.65;this.head.rotation.y-=side*b*.16;}if(this.attackType==='grapple'){this.leftArm.rotation.z-=b*.48;this.rightArm.rotation.z+=b*.48;this.torso.rotation.x+=b*.16;}
    }else if(id==='netanyahu'){
      if(this.attackType==='light'){this.torso.rotation.y+=side*b*.28;this.rightFore.rotation.z+=side*b*.32;this.rightArm.rotation.x-=b*.30;}if(this.attackType==='heavy'){this.torso.rotation.y-=side*b*.48;this.leftArm.rotation.x-=b*.42;this.rightArm.rotation.x-=b*.82;this.group.position.y-=b*.018;}
    }else if(id==='floyd'){
      if(this.attackType==='grapple'){this.torso.rotation.x+=b*.24;this.leftArm.rotation.x-=b*.84;this.rightArm.rotation.x-=b*.84;this.leftLeg.rotation.x+=b*.18;this.rightLeg.rotation.x+=b*.18;}if(this.attackType==='heavy'){this.torso.rotation.y+=side*b*.50;this.rightFore.rotation.x-=b*.56;this.group.position.y-=b*.025;}
    }else if(id==='gigachad'){
      if(this.attackType==='heavy'){this.torso.rotation.x-=b*.18;this.torso.rotation.y+=side*b*.42;this.rightArm.rotation.x-=b*.74;this.rightFore.rotation.x-=b*.42;this.leftArm.rotation.x-=b*.22;}if(this.attackType==='grapple'){this.leftArm.rotation.z-=b*.58;this.rightArm.rotation.z+=b*.58;this.torso.rotation.x+=b*.20;}
    }else if(id==='greek'){
      if(this.attackType==='heavy'){this.torso.rotation.x-=b*.14;this.rightArm.rotation.x-=b*.95;this.leftArm.rotation.x-=b*.45;this.rightFore.rotation.x-=b*.48;this.group.position.y-=b*.035;}if(this.attackType==='grapple'){this.torso.rotation.y+=side*b*.28;this.leftArm.rotation.z-=b*.52;this.rightArm.rotation.z+=b*.52;}
    }else if(id==='wojak'){
      this.head.rotation.z+=Math.sin(p*Math.PI*4)*b*.09;this.torso.rotation.y+=Math.sin(p*Math.PI*2)*b*.31;this.leftArm.rotation.z+=Math.sin(p*Math.PI*3)*b*.26;
    }
  }
  animate(dt,input){
    super.animate(dt,input);this.signatureAttack();
    if(this.evadeTime>0){const p=this.evadeTime/.26;this.torso.rotation.z+=(this.slot?-.18:.18)*Math.sin(p*Math.PI);this.head.rotation.z-=this.torso.rotation.z*.35}
    if(this.parryWindow>0){this.leftFore.rotation.z-=.22;this.rightFore.rotation.z+=.22}
    if(this.weaponVisual&&this.state==='Attack'){const p=Math.min(1,this.stateTime/(this.attackType==='heavy'?.62:.34));this.weaponVisual.rotation.x=-Math.sin(p*Math.PI)*.24}
  }
  snapshot(){return{...super.snapshot(),heldWeapon:this.heldWeapon,combo:this.combo,comboClock:this.comboClock,parryWindow:this.parryWindow,evadeTime:this.evadeTime,signatureStep:this.signatureStep}}
  applySnapshot(s){super.applySnapshot(s);this.combo=s.combo??this.combo;this.comboClock=s.comboClock??this.comboClock;this.parryWindow=s.parryWindow??0;this.evadeTime=s.evadeTime??0;this.signatureStep=s.signatureStep??this.signatureStep;if((s.heldWeapon??null)!==this.heldWeapon)this.setWeaponVisual(s.heldWeapon??null);this.combatWear?.update()}
}
