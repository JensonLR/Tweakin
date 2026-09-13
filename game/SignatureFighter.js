import { EliteFighter } from './EliteFighter.js';
import { FacialAnimator } from './FacialAnimator.js';
import { HitReaction } from './HitReaction.js';

const bell=x=>Math.sin(Math.PI*Math.max(0,Math.min(1,x)));
const freshMetrics=()=>({hits:0,damage:0,bestCombo:0,blocks:0,parries:0,evades:0,specials:0,weapons:0});

export class SignatureFighter extends EliteFighter{
  constructor(def,slot){super(def,slot);this.specialIndex=-1;this.metrics=freshMetrics();this.facial=new FacialAnimator(this);this.hitReaction=new HitReaction(this);this.finisherReaction=0;this.finisherStyle=0;this.finisherSource='';}
  setState(s,move=''){
    const starting=s==='Attack'&&move==='special'&&this.state!=='Attack';
    if(starting){this.specialIndex=(this.specialIndex+1)%Math.max(1,this.def.finishers?.length||1);this.metrics.specials++;}
    super.setState(s,move);
  }
  update(dt,input,target,arena){const ev=super.update(dt,input,target,arena);this.finisherReaction=Math.max(0,this.finisherReaction-dt);this.hitReaction?.update(dt);this.facial?.update(dt,target);return ev}
  triggerFinisherReaction(style=0,source=''){this.finisherReaction=1.18;this.finisherStyle=style||0;this.finisherSource=source||'';}
  currentFinisher(){const fs=this.def.finishers||[];return fs[this.specialIndex<0?0:this.specialIndex%Math.max(1,fs.length)]||fs[0]||{name:'Signature',power:36}}
  attackDamage(kind){if(kind==='special'){const f=this.currentFinisher();return f.power*(.8+this.def.stats.upperBody/320)}return super.attackDamage(kind)}
  receiveHit(raw,kind,attacker,dirX,dirZ){
    const result=super.receiveHit(raw,kind,attacker,dirX,dirZ);
    if(result?.blocked)this.metrics.blocks++;
    else if(result?.damage>0){this.hitReaction?.trigger(kind,dirX,dirZ,result.damage);if(attacker&&attacker!==this){attacker.metrics??=freshMetrics();attacker.metrics.hits++;attacker.metrics.damage+=result.damage;attacker.metrics.bestCombo=Math.max(attacker.metrics.bestCombo,attacker.combo||0);if(kind==='weapon')attacker.metrics.weapons++;}}
    return result;
  }
  tryDefense(kind,attacker){const r=super.tryDefense(kind,attacker);if(r?.parried)this.metrics.parries++;if(r?.evaded)this.metrics.evades++;return r}
  finisherVictimPose(){
    if(this.finisherReaction<=0)return;const p=1-Math.min(1,this.finisherReaction/1.18),b=bell(p),style=this.finisherStyle%2;
    if(style===0){this.torso.rotation.y+=Math.sin(p*Math.PI*1.35)*.72;this.torso.rotation.x-=b*.24;this.head.rotation.z+=Math.sin(p*Math.PI*2)*.18;this.leftArm.rotation.z-=b*.34;this.rightArm.rotation.z+=b*.34;this.group.position.y+=Math.sin(p*Math.PI)*.055;}
    else{this.torso.rotation.z+=Math.sin(p*Math.PI)*.34;this.torso.rotation.y-=Math.sin(p*Math.PI*1.6)*.48;this.head.rotation.x+=b*.17;this.leftLeg.rotation.x+=b*.36;this.rightLeg.rotation.x-=b*.26;this.group.position.y+=Math.sin(p*Math.PI)*.035;}
    if(p>.62){const q=(p-.62)/.38;this.group.rotation.z-=q*q*.32;}
  }
  animate(dt,input){
    super.animate(dt,input);
    if(this.state==='Attack'&&this.attackType==='special'&&this.specialIndex===1){
      const p=Math.min(1,this.stateTime/2.35),b=bell(p),id=this.def.id;
      if(id==='trump'){this.torso.rotation.y-=b*.62;this.leftArm.rotation.x-=b*.82;this.leftFore.rotation.x-=b*.42;this.rightArm.rotation.z+=b*.3;}
      else if(id==='netanyahu'){this.torso.rotation.y+=b*.46;this.rightArm.rotation.x-=b*.76;this.leftArm.rotation.z-=b*.28;this.head.rotation.y-=b*.12;}
      else if(id==='kirk'){this.rightLeg.rotation.x-=b*1.45;this.rightShin.rotation.x+=b*.7;this.torso.rotation.y-=b*.44;this.leftArm.rotation.z-=b*.3;}
      else if(id==='floyd'){this.leftArm.rotation.z-=b*.52;this.rightArm.rotation.z+=b*.52;this.torso.rotation.x+=b*.24;this.rightLeg.rotation.x+=b*.18;}
      else if(id==='gigachad'){this.torso.rotation.x-=b*.24;this.rightArm.rotation.x-=b*1.02;this.leftArm.rotation.x-=b*.38;this.group.position.y-=b*.04;}
      else if(id==='agarthan'){this.leftLeg.rotation.x-=b*1.3;this.rightArm.rotation.z+=b*.76;this.torso.rotation.y+=Math.sin(p*Math.PI*2)*.42;}
      else if(id==='greek'){this.leftArm.rotation.x-=b*.92;this.rightArm.rotation.x-=b*.92;this.torso.rotation.x+=b*.18;this.head.rotation.y+=b*.18;}
      else if(id==='wojak'){this.torso.rotation.y+=Math.sin(p*Math.PI*4)*b*.44;this.leftArm.rotation.z-=Math.sin(p*Math.PI*3)*b*.48;this.head.rotation.z+=Math.sin(p*Math.PI*6)*b*.16;}
    }
    this.hitReaction?.apply();this.finisherVictimPose();
  }
  snapshot(){return{...super.snapshot(),specialIndex:this.specialIndex,metrics:{...this.metrics},finisherReaction:this.finisherReaction,finisherStyle:this.finisherStyle}}
  applySnapshot(s){super.applySnapshot(s);this.specialIndex=s.specialIndex??this.specialIndex;if(s.metrics)this.metrics={...this.metrics,...s.metrics};this.finisherReaction=s.finisherReaction??0;this.finisherStyle=s.finisherStyle??0}
}
