import { EliteFighter } from './EliteFighter.js';
import { FacialAnimator } from './FacialAnimator.js';
import { HitReaction } from './HitReaction.js';
import { ComboChoreography } from './ComboChoreography.js';
import { addRigPolish } from './RigPolish.js';

const bell=x=>Math.sin(Math.PI*Math.max(0,Math.min(1,x)));
const clamp=x=>Math.max(0,Math.min(1,x));
const freshMetrics=()=>({hits:0,damage:0,bestCombo:0,blocks:0,parries:0,evades:0,specials:0,weapons:0});

export class SignatureFighter extends EliteFighter{
  constructor(def,slot){super(def,slot);addRigPolish(this);this.specialIndex=-1;this.metrics=freshMetrics();this.facial=new FacialAnimator(this);this.hitReaction=new HitReaction(this);this.comboChoreo=new ComboChoreography(this);this.finisherReaction=0;this.finisherStyle=0;this.finisherSource='';this.introPose=-1;}
  setIntroPose(progress=-1){this.introPose=progress<0?-1:clamp(progress)}
  setState(s,move=''){
    const startingAttack=s==='Attack'&&move&&this.state!=='Attack';
    if(startingAttack&&move==='special'){this.specialIndex=(this.specialIndex+1)%Math.max(1,this.def.finishers?.length||1);this.metrics.specials++;}
    else if(startingAttack)this.comboChoreo?.start(move);
    super.setState(s,move);
  }
  update(dt,input,target,arena){const ev=super.update(dt,input,target,arena);this.finisherReaction=Math.max(0,this.finisherReaction-dt);this.hitReaction?.update(dt);this.comboChoreo?.update(dt);this.facial?.update(dt,target);return ev}
  triggerFinisherReaction(style=0,source=''){this.finisherReaction=1.18;this.finisherStyle=style||0;this.finisherSource=source||'';}
  currentFinisher(){const fs=this.def.finishers||[];return fs[this.specialIndex<0?0:this.specialIndex%Math.max(1,fs.length)]||fs[0]||{name:'Signature',power:36}}
  attackDamage(kind){if(kind==='special'){const f=this.currentFinisher();return f.power*(.8+this.def.stats.upperBody/320)}return super.attackDamage(kind)*this.comboChoreo.multiplier(kind)}
  receiveHit(raw,kind,attacker,dirX,dirZ){const result=super.receiveHit(raw,kind,attacker,dirX,dirZ);if(result?.blocked)this.metrics.blocks++;else if(result?.damage>0){this.hitReaction?.trigger(kind,dirX,dirZ,result.damage);if(attacker&&attacker!==this){attacker.metrics??=freshMetrics();attacker.metrics.hits++;attacker.metrics.damage+=result.damage;attacker.metrics.bestCombo=Math.max(attacker.metrics.bestCombo,attacker.combo||0);if(kind==='weapon')attacker.metrics.weapons++;}}return result;}
  tryDefense(kind,attacker){const r=super.tryDefense(kind,attacker);if(r?.parried)this.metrics.parries++;if(r?.evaded)this.metrics.evades++;return r}
  finisherVictimPose(){if(this.finisherReaction<=0)return;const p=1-Math.min(1,this.finisherReaction/1.18),b=bell(p),style=this.finisherStyle%2;if(style===0){this.torso.rotation.y+=Math.sin(p*Math.PI*1.35)*.72;this.torso.rotation.x-=b*.24;this.head.rotation.z+=Math.sin(p*Math.PI*2)*.18;this.leftArm.rotation.z-=b*.34;this.rightArm.rotation.z+=b*.34;this.group.position.y+=Math.sin(p*Math.PI)*.055;}else{this.torso.rotation.z+=Math.sin(p*Math.PI)*.34;this.torso.rotation.y-=Math.sin(p*Math.PI*1.6)*.48;this.head.rotation.x+=b*.17;this.leftLeg.rotation.x+=b*.36;this.rightLeg.rotation.x-=b*.26;this.group.position.y+=Math.sin(p*Math.PI)*.035;}if(p>.62){const q=(p-.62)/.38;this.group.rotation.z-=q*q*.32;}}
  entrancePose(){
    if(this.introPose<0)return;const p=this.introPose,b=bell(p),id=this.def.id,side=this.slot%2?1:-1;this.torso.rotation.y+=side*(1-p)*.28;this.head.rotation.y-=side*(1-p)*.14;
    if(id==='trump'){this.rightArm.rotation.z+=b*.38;this.rightFore.rotation.x-=b*.45;this.leftArm.rotation.x-=b*.2;}
    else if(id==='netanyahu'){this.leftFore.rotation.x-=b*.3;this.rightFore.rotation.x-=b*.3;this.head.rotation.x-=b*.035;}
    else if(id==='kirk'){this.leftArm.rotation.z-=b*.3;this.rightArm.rotation.z+=b*.3;this.torso.rotation.x-=b*.05;}
    else if(id==='floyd'){this.leftArm.rotation.x-=b*.48;this.rightArm.rotation.x-=b*.48;this.torso.rotation.x+=b*.08;}
    else if(id==='gigachad'){this.leftArm.rotation.z-=b*.55;this.rightArm.rotation.z+=b*.55;this.torso.rotation.x-=b*.08;this.head.rotation.x-=b*.04;}
    else if(id==='agarthan'){this.leftArm.rotation.z-=b*.46;this.rightArm.rotation.z+=b*.46;this.group.position.y+=b*.025;}
    else if(id==='greek'){this.leftArm.rotation.z-=b*.38;this.rightArm.rotation.x-=b*.4;this.head.rotation.y+=side*b*.1;}
    else if(id==='wojak'){this.head.rotation.z+=Math.sin(p*Math.PI*3)*.08;this.rightArm.rotation.z+=Math.sin(p*Math.PI*2)*.28;}
  }
  victoryPose(){
    if(this.state!=='Victory')return;const t=this.stateTime,id=this.def.id,w=Math.sin(t*2.3);
    if(id==='trump'){this.rightArm.rotation.z=.65+w*.05;this.rightFore.rotation.x=-1.15;this.leftArm.rotation.z=-.18;this.torso.rotation.y=w*.06;}
    else if(id==='netanyahu'){this.leftArm.rotation.z=-.32;this.rightArm.rotation.z=.32;this.head.rotation.y=w*.06;}
    else if(id==='kirk'){this.rightArm.rotation.z=.82;this.rightFore.rotation.x=-.92;this.leftArm.rotation.z=-.22;}
    else if(id==='floyd'){this.leftArm.rotation.z=-.72;this.rightArm.rotation.z=.72;this.leftFore.rotation.x=-.5;this.rightFore.rotation.x=-.5;}
    else if(id==='gigachad'){this.leftArm.rotation.z=-1.02;this.rightArm.rotation.z=1.02;this.torso.rotation.x=-.12;}
    else if(id==='agarthan'){this.leftArm.rotation.z=-.68;this.rightArm.rotation.z=.68;this.group.position.y=.025+Math.abs(w)*.018;}
    else if(id==='greek'){this.leftArm.rotation.z=-.76;this.rightArm.rotation.x=-.58;this.head.rotation.y=.12+w*.05;}
    else if(id==='wojak'){this.leftArm.rotation.z=-.4+w*.2;this.rightArm.rotation.z=.4-w*.2;this.head.rotation.z=w*.08;}
  }
  animate(dt,input){
    super.animate(dt,input);
    if(this.state==='Attack'&&this.attackType==='special'&&this.specialIndex===1){const p=Math.min(1,this.stateTime/2.35),b=bell(p),id=this.def.id;if(id==='trump'){this.torso.rotation.y-=b*.62;this.leftArm.rotation.x-=b*.82;this.leftFore.rotation.x-=b*.42;this.rightArm.rotation.z+=b*.3;}else if(id==='netanyahu'){this.torso.rotation.y+=b*.46;this.rightArm.rotation.x-=b*.76;this.leftArm.rotation.z-=b*.28;this.head.rotation.y-=b*.12;}else if(id==='kirk'){this.rightLeg.rotation.x-=b*1.45;this.rightShin.rotation.x+=b*.7;this.torso.rotation.y-=b*.44;this.leftArm.rotation.z-=b*.3;}else if(id==='floyd'){this.leftArm.rotation.z-=b*.52;this.rightArm.rotation.z+=b*.52;this.torso.rotation.x+=b*.24;this.rightLeg.rotation.x+=b*.18;}else if(id==='gigachad'){this.torso.rotation.x-=b*.24;this.rightArm.rotation.x-=b*1.02;this.leftArm.rotation.x-=b*.38;this.group.position.y-=b*.04;}else if(id==='agarthan'){this.leftLeg.rotation.x-=b*1.3;this.rightArm.rotation.z+=b*.76;this.torso.rotation.y+=Math.sin(p*Math.PI*2)*.42;}else if(id==='greek'){this.leftArm.rotation.x-=b*.92;this.rightArm.rotation.x-=b*.92;this.torso.rotation.x+=b*.18;this.head.rotation.y+=b*.18;}else if(id==='wojak'){this.torso.rotation.y+=Math.sin(p*Math.PI*4)*b*.44;this.leftArm.rotation.z-=Math.sin(p*Math.PI*3)*b*.48;this.head.rotation.z+=Math.sin(p*Math.PI*6)*b*.16;}}
    this.comboChoreo?.apply();this.entrancePose();this.victoryPose();this.hitReaction?.apply();this.finisherVictimPose();
  }
  snapshot(){return{...super.snapshot(),specialIndex:this.specialIndex,metrics:{...this.metrics},finisherReaction:this.finisherReaction,finisherStyle:this.finisherStyle,comboChoreo:this.comboChoreo?.snapshot()}}
  applySnapshot(s){super.applySnapshot(s);this.specialIndex=s.specialIndex??this.specialIndex;if(s.metrics)this.metrics={...this.metrics,...s.metrics};this.finisherReaction=s.finisherReaction??0;this.finisherStyle=s.finisherStyle??0;this.comboChoreo?.applySnapshot(s.comboChoreo)}
}
