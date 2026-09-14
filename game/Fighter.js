import { THREE } from '../vendor/three.js';
import { clamp, damp, angleDelta } from '../core/math.js';
import { moveSpeed, damageAfterToughness, consciousnessLoss, physicalLoss, canKO, strikeDamage, grappleDamage } from '../core/combatRules.js';

const ATTACKS={
  light:{duration:.34,active:[.12,.22],range:1.18,kind:'light'},
  heavy:{duration:.62,active:[.28,.42],range:1.36,kind:'heavy'},
  grapple:{duration:.72,active:[.28,.48],range:1.05,kind:'grapple'},
  special:{duration:2.35,active:[1.15,1.55],range:1.55,kind:'special'}
};

export class Fighter{
  constructor(def,slot){
    this.def=def;this.slot=slot;this.id=`${def.id}-${slot}`;this.group=new THREE.Group();this.group.name=this.id;
    this.state='Neutral';this.stateTime=0;this.attackType='';this.attackConnected=false;this.attackSerial=0;
    this.physical=100;this.consciousness=100;this.momentum=0;this.specialTime=0;this.ko=false;this.vx=0;this.vz=0;this.yaw=slot===0?0:Math.PI;this.targetYaw=this.yaw;this.radius=.54*def.mass;
    this.combo=0;this.comboClock=0;this.lastDamager=-1;this.heldWeapon=null;this.hitFlash=0;this.stun=0;this.parts=[];this.mats=[];this.weaponVisual=null;this.buildModel();
  }
  material(color,rough=.62,metal=.05){const m=new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal});this.mats.push(m);return m}
  mesh(g,m,p,pos=[0,0,0]){const x=new THREE.Mesh(g,m);x.position.set(...pos);x.castShadow=true;x.receiveShadow=true;p.add(x);this.parts.push(x);return x}
  limb(topRad,bottomRad,len,mat,parent,pos){const pivot=new THREE.Group();pivot.position.set(...pos);parent.add(pivot);const geo=new THREE.CapsuleGeometry(topRad,Math.max(.02,len-topRad*2),5,8),body=this.mesh(geo,mat,pivot,[0,-len*.5,0]);body.scale.set(1,.98,bottomRad/topRad);return{pivot,mesh:body}}
  buildModel(){
    const d=this.def,skin=this.material(d.palette.skin,d.id==='greek'?.94:.68),cloth=this.material(d.palette.primary,.62,.05),cloth2=this.material(d.palette.secondary,.74),accent=this.material(d.palette.accent,.48,.14);
    this.group.scale.set(...d.scale);
    this.root=new THREE.Group();this.root.position.y=1.05;this.group.add(this.root);
    const broad=d.id==='gigachad'?1.20:(d.id==='floyd'||d.id==='greek')?1.10:d.id==='trump'?1.08:d.id==='agarthan'?.90:1;
    this.pelvis=new THREE.Group();this.pelvis.position.y=.02;this.root.add(this.pelvis);const pelvis=this.mesh(new THREE.CapsuleGeometry(.255*broad,.16,5,8),cloth,this.pelvis,[0,0,0]);pelvis.scale.set(1,.76,.70);
    this.torso=new THREE.Group();this.torso.position.y=.46;this.root.add(this.torso);
    const chest=this.mesh(new THREE.CapsuleGeometry(.39*broad,.48,6,9),cloth,this.torso,[0,.14,0]);chest.scale.set(1,.96,.76);this.chestMesh=chest;
    const waist=this.mesh(new THREE.CylinderGeometry(.245*broad,.29*broad,.26,10),cloth,this.torso,[0,-.32,0]);waist.scale.z=.76;
    this.mesh(new THREE.CylinderGeometry(.13,.17,.18,10),skin,this.torso,[0,.72,0]);
    this.head=new THREE.Group();this.head.position.set(0,.94,0);this.torso.add(this.head);const skull=this.mesh(new THREE.SphereGeometry(.285,14,10),skin,this.head);const headW=d.id==='gigachad'?1.06:d.id==='wojak'?1.02:.94;skull.scale.set(headW,1.08,.92);this.skullMesh=skull;
    const formal=['trump','netanyahu','kirk'].includes(d.id),armR=.115*(d.id==='gigachad'?1.12:1),upper=.55,lower=.50,armMat=formal?cloth:skin,shoulderX=.43*broad;
    let p=this.limb(armR,armR*.88,upper,armMat,this.torso,[-shoulderX,.52,0]);this.leftArm=p.pivot;p=this.limb(armR*.9,armR*.76,lower,skin,this.leftArm,[0,-upper,0]);this.leftFore=p.pivot;
    p=this.limb(armR,armR*.88,upper,armMat,this.torso,[shoulderX,.52,0]);this.rightArm=p.pivot;p=this.limb(armR*.9,armR*.76,lower,skin,this.rightArm,[0,-upper,0]);this.rightFore=p.pivot;
    const legR=.155*(d.id==='greek'?1.05:1),thigh=.62,shin=.60,hip=.185*broad;
    p=this.limb(legR,legR*.86,thigh,cloth,this.group,[-hip,1.02,0]);this.leftLeg=p.pivot;p=this.limb(legR*.88,legR*.72,shin,cloth,this.leftLeg,[0,-thigh,0]);this.leftShin=p.pivot;
    p=this.limb(legR,legR*.86,thigh,cloth,this.group,[hip,1.02,0]);this.rightLeg=p.pivot;p=this.limb(legR*.88,legR*.72,shin,cloth,this.rightLeg,[0,-thigh,0]);this.rightShin=p.pivot;
    this.aura=this.mesh(new THREE.TorusGeometry(.70,.022,5,28),new THREE.MeshBasicMaterial({color:d.palette.accent,transparent:true,opacity:0,depthWrite:false}),this.group,[0,.045,0]);this.aura.rotation.x=Math.PI/2;
    this.baseAccent=accent;this.baseSecondary=cloth2;
  }
  faceTarget(target){if(!target)return;this.targetYaw=Math.atan2(target.group.position.x-this.group.position.x,target.group.position.z-this.group.position.z);this.yaw+=angleDelta(this.yaw,this.targetYaw)*.2;this.group.rotation.y=this.yaw}
  setState(s,move=''){if(this.ko&&s!=='KO')return;this.state=s;this.stateTime=0;if(move)this.attackType=move;if(['light','heavy','grapple','special'].includes(move)){this.attackConnected=false;this.attackSerial++}}
  danger(){return this.physical<28||this.consciousness<28}
  canAct(){return !this.ko&&!['Stun','Knockdown','Ground','GetUp'].includes(this.state)}
  update(dt,input,target,arena){
    this.stateTime+=dt;this.hitFlash=Math.max(0,this.hitFlash-dt*5);this.specialTime=Math.max(0,this.specialTime-dt);this.comboClock=Math.max(0,this.comboClock-dt);if(!this.comboClock)this.combo=0;this.faceTarget(target);
    if(this.ko){this.animate(dt,input);return null}
    if(this.state==='Stun'&&this.stateTime>.28)this.setState('Neutral');if(this.state==='Knockdown'&&this.stateTime>.62)this.setState('Ground');if(this.state==='Ground'&&this.stateTime>1.05)this.setState('GetUp');if(this.state==='GetUp'&&this.stateTime>.55)this.setState('Neutral');
    if(['light','heavy','grapple','special'].includes(this.attackType)&&this.state==='Attack'){const a=ATTACKS[this.attackType];if(this.stateTime>a.duration){this.attackType='';this.setState('Neutral')}}
    if(this.canAct()&&this.state!=='Attack'){
      if(input.block){this.state='Block';this.stateTime=0}
      else if(input.taunt&&this.momentum>=100){this.momentum=0;this.specialTime=8;this.setState('Attack','special')}
      else if(input.grapple)this.setState('Attack','grapple');else if(input.heavy)this.setState('Attack','heavy');else if(input.light)this.setState('Attack','light');
      else{const len=Math.hypot(input.x,input.y);if(len>.08){const speed=moveSpeed(this.def.stats,this.def.styles)*(input.run?1.55:1),forward=new THREE.Vector3(Math.sin(this.yaw),0,Math.cos(this.yaw)),right=new THREE.Vector3(forward.z,0,-forward.x),dx=right.x*input.x+forward.x*(-input.y),dz=right.z*input.x+forward.z*(-input.y),m=Math.hypot(dx,dz)||1;this.vx=dx/m*speed;this.vz=dz/m*speed;this.state=input.run?'Run':'Move'}else if(this.state==='Move'||this.state==='Run'||this.state==='Block')this.state='Neutral'}
    }
    if(!['Knockdown','Ground','KO'].includes(this.state)){this.group.position.x+=this.vx*dt;this.group.position.z+=this.vz*dt;this.vx=damp(this.vx,0,10,dt);this.vz=damp(this.vz,0,10,dt);const lim=arena?.def?.size?arena.def.size*.48:4.5;this.group.position.x=clamp(this.group.position.x,-lim,lim);this.group.position.z=clamp(this.group.position.z,-lim,lim)}
    let attack=null;if(this.state==='Attack'&&this.attackType){const a=ATTACKS[this.attackType];if(!this.attackConnected&&this.stateTime>=a.active[0]&&this.stateTime<=a.active[1])attack={fighter:this,type:this.attackType,range:a.range}}this.animate(dt,input);return attack;
  }
  markConnected(){this.attackConnected=true}
  receiveHit(raw,kind,attacker,dirX,dirZ){
    if(this.ko)return{damage:0,ko:true};if(this.state==='Block'&&kind!=='grapple'&&kind!=='special'){const dmg=raw*.2;this.consciousness=clamp(this.consciousness-dmg*.45,0,100);this.momentum=clamp(this.momentum+4,0,100);return{damage:dmg,ko:false,blocked:true}}
    const dmg=damageAfterToughness(raw,this.def.stats.toughness);this.physical=clamp(this.physical-physicalLoss(dmg,kind),0,100);this.consciousness=clamp(this.consciousness-consciousnessLoss(dmg,kind),0,100);this.lastDamager=attacker.slot;this.hitFlash=1;this.vx+=dirX*(kind==='special'?5.5:kind==='heavy'||kind==='weapon'?3.4:2);this.vz+=dirZ*(kind==='special'?5.5:kind==='heavy'||kind==='weapon'?3.4:2);
    const ko=canKO(this.consciousness,this.physical,kind);if(ko){this.ko=true;this.setState('KO')}else if(kind!=='light'&&dmg>13)this.setState('Knockdown');else this.setState('Stun');attacker.combo++;attacker.comboClock=1.4;attacker.momentum=clamp(attacker.momentum+(kind==='light'?7:kind==='heavy'?13:kind==='grapple'?16:kind==='special'?0:10)*(.65+attacker.def.stats.charisma/160),0,100);return{damage:dmg,ko,blocked:false};
  }
  attackDamage(kind){if(kind==='grapple')return grappleDamage(this.def.stats,this.def.styles,true);if(kind==='special'){const f=this.def.finishers[0];return f.power*(.8+this.def.stats.upperBody/320)}return strikeDamage(this.def.stats,this.def.styles,kind==='heavy')}
  setWeaponVisual(kind){if(this.weaponVisual){this.rightFore.remove(this.weaponVisual);this.weaponVisual.geometry?.dispose?.();this.weaponVisual.material?.dispose?.();this.weaponVisual=null}this.heldWeapon=kind;if(!kind)return;const geo=kind==='bottle'?new THREE.CylinderGeometry(.06,.08,.46,7):new THREE.CylinderGeometry(kind==='broom'?.025:.045,kind==='bat'?.07:.05,kind==='broom'?1.18:kind==='bat'?1:.82,7),mat=new THREE.MeshStandardMaterial({color:kind==='bottle'?0x557a61:kind==='pipe'?0x777c80:0x654329,roughness:.5,metalness:kind==='pipe'?.7:.03}),m=new THREE.Mesh(geo,mat);m.position.set(0,-.58,.1);m.rotation.z=.3;m.castShadow=true;this.rightFore.add(m);this.weaponVisual=m}
  animate(dt,input){
    const t=performance.now()/1000+this.slot;let la=-.25,ra=-.28,ll=0,rl=0,bodyZ=0,lean=0;if(this.state==='Move'||this.state==='Run'){const w=Math.sin(t*(this.state==='Run'?11:7));ll=w*.46;rl=-w*.46;la=-.25-w*.24;ra=-.28+w*.24;lean=this.state==='Run'?.11:.035}if(this.state==='Block'){la=-1.12;ra=-1.12;bodyZ=.02}
    if(this.state==='Attack'){const p=ATTACKS[this.attackType]?clamp(this.stateTime/ATTACKS[this.attackType].duration,0,1):0;if(this.attackType==='light'){ra=-.2-Math.sin(p*Math.PI)*1.12;bodyZ=-Math.sin(p*Math.PI)*.10}if(this.attackType==='heavy'){ra=.35-Math.sin(p*Math.PI)*1.75;bodyZ=-Math.sin(p*Math.PI)*.24;lean=.14}if(this.attackType==='grapple'){la=ra=-.34-Math.sin(p*Math.PI)*.92;lean=.16}if(this.attackType==='special'){la=-.4-Math.sin(p*Math.PI*3)*.65;ra=-.5-Math.sin(p*Math.PI*4)*.95;bodyZ=Math.sin(p*Math.PI*4)*.22;lean=.18}}
    if(this.state==='Stun'){bodyZ=Math.sin(t*20)*.09;lean=-.12}if(this.state==='Knockdown'||this.state==='Ground'||this.state==='KO'){this.group.rotation.z=damp(this.group.rotation.z,-1.42,8,dt);this.group.position.y=damp(this.group.position.y,.13,8,dt)}else{this.group.rotation.z=damp(this.group.rotation.z,0,10,dt);this.group.position.y=damp(this.group.position.y,0,10,dt)}
    this.leftArm.rotation.x=damp(this.leftArm.rotation.x,la,15,dt);this.rightArm.rotation.x=damp(this.rightArm.rotation.x,ra,15,dt);this.leftLeg.rotation.x=damp(this.leftLeg.rotation.x,ll,12,dt);this.rightLeg.rotation.x=damp(this.rightLeg.rotation.x,rl,12,dt);this.torso.rotation.z=damp(this.torso.rotation.z,bodyZ,14,dt);this.torso.rotation.y=damp(this.torso.rotation.y,lean,12,dt);
    for(const m of this.mats){if(m.emissive){m.emissive.setRGB(this.hitFlash*.42,this.hitFlash*.025,this.hitFlash*.025);m.emissiveIntensity=this.hitFlash*.5}}if(this.aura){this.aura.material.opacity=this.specialTime>0?.19+Math.sin(t*8)*.07:0;this.aura.rotation.z+=dt*.8}
  }
  snapshot(){return{id:this.id,defId:this.def.id,x:this.group.position.x,y:this.group.position.y,z:this.group.position.z,yaw:this.yaw,vx:this.vx,vz:this.vz,state:this.state,stateTime:this.stateTime,physical:this.physical,consciousness:this.consciousness,momentum:this.momentum,specialTime:this.specialTime,activeMove:this.attackType,attackSerial:this.attackSerial,ko:this.ko}}
  applySnapshot(s){this.group.position.set(s.x,s.y,s.z);this.yaw=s.yaw;this.group.rotation.y=s.yaw;this.vx=s.vx;this.vz=s.vz;this.state=s.state;this.stateTime=s.stateTime;this.physical=s.physical;this.consciousness=s.consciousness;this.momentum=s.momentum;this.specialTime=s.specialTime;this.attackType=s.activeMove;this.attackSerial=s.attackSerial??this.attackSerial;this.ko=s.ko}
  reset(){this.state='Neutral';this.stateTime=0;this.attackType='';this.physical=100;this.consciousness=100;this.momentum=0;this.specialTime=0;this.ko=false;this.vx=this.vz=0;this.setWeaponVisual(null);this.group.rotation.z=0;this.group.position.y=0}
}
