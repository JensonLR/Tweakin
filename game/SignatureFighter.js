import { EliteFighter } from './EliteFighter.js';
import { FacialAnimator } from './FacialAnimator.js';
import { HitReaction } from './HitReaction.js';
import { addRigPolish } from './RigPolish.js';
import { applySilhouetteFix } from './SilhouetteFix.js';
import { applyHumanProportions } from './HumanProportionFix.js';
import { ImportedCombatVisual } from './ImportedCombatVisual.js';
import { FallbackMotion } from './FallbackMotion.js';
import { PoseBaseline } from './PoseBaseline.js';

const bell=x=>Math.sin(Math.PI*Math.max(0,Math.min(1,x)));
const clamp=x=>Math.max(0,Math.min(1,x));
const freshMetrics=()=>({damage:0,hits:0,heavyHits:0,specialHits:0,weaponHits:0,blocks:0,parries:0,evades:0,bestCombo:0,knockdowns:0,environmentHits:0,specials:0,weapons:0});

export class SignatureFighter extends EliteFighter{
  constructor(def,slot){
    super(def,slot);
    applySilhouetteFix(this);
    applyHumanProportions(this);
    addRigPolish(this);
    this.specialIndex=-1;
    this.metrics=freshMetrics();
    this.facial=new FacialAnimator(this);
    this.hitReaction=new HitReaction(this);
    this.finisherReaction=0;
    this.finisherStyle=0;
    this.finisherSource='';
    this.introPose=-1;
    this.importedVisual=new ImportedCombatVisual(this);
    this.fallbackMotion=new FallbackMotion(this);
    this.poseBaseline=new PoseBaseline(this);
  }
  setIntroPose(progress=-1){this.introPose=progress<0?-1:clamp(progress)}
  setState(s,move=''){
    const startingAttack=s==='Attack'&&move&&this.state!=='Attack';
    if(startingAttack&&move==='special'){
      this.specialIndex=(this.specialIndex+1)%Math.max(1,this.def.finishers?.length||1);
      this.metrics.specials=(this.metrics.specials??0)+1;
    }
    super.setState(s,move);
  }
  update(dt,input,target,arena){
    const ev=super.update(dt,input,target,arena);
    this.finisherReaction=Math.max(0,this.finisherReaction-dt);
    this.hitReaction?.update(dt);
    this.facial?.update(dt,target);
    this.importedVisual?.update(dt);
    this.fallbackMotion?.update(dt);
    return ev;
  }
  triggerFinisherReaction(style=0,source=''){this.finisherReaction=1.18;this.finisherStyle=style||0;this.finisherSource=source||'';}
  currentFinisher(){const fs=this.def.finishers||[];return fs[this.specialIndex<0?0:this.specialIndex%Math.max(1,fs.length)]||fs[0]||{name:'Signature',power:36}}
  attackDamage(kind){
    if(kind==='special'){const f=this.currentFinisher();return f.power*(.8+this.def.stats.upperBody/320)}
    return super.attackDamage(kind);
  }
  receiveHit(raw,kind,attacker,dirX,dirZ){
    const result=super.receiveHit(raw,kind,attacker,dirX,dirZ);
    if(result?.damage>0&&!result?.blocked)this.hitReaction?.trigger(kind,dirX,dirZ,result.damage);
    return result;
  }
  tryDefense(kind,attacker){return super.tryDefense(kind,attacker)}
  finisherVictimPose(){
    if(this.finisherReaction<=0||this.importedVisual?.ready)return;
    const p=1-Math.min(1,this.finisherReaction/1.18),b=bell(p),style=this.finisherStyle%2;
    if(style===0){this.torso.rotation.y+=Math.sin(p*Math.PI*1.35)*.56;this.torso.rotation.x-=b*.18;this.head.rotation.z+=Math.sin(p*Math.PI*2)*.13;this.leftArm.rotation.z-=b*.26;this.rightArm.rotation.z+=b*.26;}
    else{this.torso.rotation.z+=Math.sin(p*Math.PI)*.24;this.torso.rotation.y-=Math.sin(p*Math.PI*1.6)*.36;this.head.rotation.x+=b*.12;this.leftLeg.rotation.x+=b*.26;this.rightLeg.rotation.x-=b*.18;}
    if(p>.62){const q=(p-.62)/.38;this.group.rotation.z-=q*q*.24;}
  }
  entrancePose(){
    if(this.introPose<0||this.importedVisual?.ready)return;
    const p=this.introPose,b=bell(p),id=this.def.id,side=this.slot%2?1:-1;
    this.torso.rotation.y+=side*(1-p)*.22;this.head.rotation.y-=side*(1-p)*.10;
    if(id==='trump'){this.rightArm.rotation.z+=b*.30;this.rightFore.rotation.x-=b*.34;}
    else if(id==='netanyahu'){this.leftFore.rotation.x-=b*.22;this.rightFore.rotation.x-=b*.22;}
    else if(id==='kirk'){this.leftArm.rotation.z-=b*.22;this.rightArm.rotation.z+=b*.22;}
    else if(id==='floyd'){this.leftArm.rotation.x-=b*.34;this.rightArm.rotation.x-=b*.34;this.torso.rotation.x+=b*.05;}
    else if(id==='gigachad'){this.leftArm.rotation.z-=b*.40;this.rightArm.rotation.z+=b*.40;this.torso.rotation.x-=b*.05;}
    else if(id==='agarthan'){this.leftArm.rotation.z-=b*.34;this.rightArm.rotation.z+=b*.34;}
    else if(id==='greek'){this.leftArm.rotation.z-=b*.28;this.rightArm.rotation.x-=b*.30;}
    else if(id==='wojak'){this.head.rotation.z+=Math.sin(p*Math.PI*3)*.05;this.rightArm.rotation.z+=Math.sin(p*Math.PI*2)*.18;}
  }
  victoryPose(){
    if(this.state!=='Victory'||this.importedVisual?.ready)return;
    const t=this.stateTime,id=this.def.id,w=Math.sin(t*2.3);
    if(id==='trump'){this.rightArm.rotation.z=.58+w*.04;this.rightFore.rotation.x=-1.02;this.leftArm.rotation.z=-.14;this.torso.rotation.y=w*.045;}
    else if(id==='netanyahu'){this.leftArm.rotation.z=-.26;this.rightArm.rotation.z=.26;this.head.rotation.y=w*.05;}
    else if(id==='kirk'){this.rightArm.rotation.z=.70;this.rightFore.rotation.x=-.82;this.leftArm.rotation.z=-.18;}
    else if(id==='floyd'){this.leftArm.rotation.z=-.58;this.rightArm.rotation.z=.58;this.leftFore.rotation.x=-.42;this.rightFore.rotation.x=-.42;}
    else if(id==='gigachad'){this.leftArm.rotation.z=-.82;this.rightArm.rotation.z=.82;this.torso.rotation.x=-.09;}
    else if(id==='agarthan'){this.leftArm.rotation.z=-.54;this.rightArm.rotation.z=.54;}
    else if(id==='greek'){this.leftArm.rotation.z=-.62;this.rightArm.rotation.x=-.46;this.head.rotation.y=.10+w*.04;}
    else if(id==='wojak'){this.leftArm.rotation.z=-.30+w*.14;this.rightArm.rotation.z=.30-w*.14;this.head.rotation.z=w*.06;}
  }
  secondFinisherAccent(){
    if(this.importedVisual?.ready||this.state!=='Attack'||this.attackType!=='special'||this.specialIndex!==1)return;
    const p=Math.min(1,this.stateTime/2.35),b=bell(p),id=this.def.id;
    if(id==='trump'){this.torso.rotation.y-=b*.34;this.leftArm.rotation.x-=b*.45;this.leftFore.rotation.x-=b*.24;}
    else if(id==='netanyahu'){this.torso.rotation.y+=b*.28;this.rightArm.rotation.x-=b*.42;}
    else if(id==='kirk'){this.rightLeg.rotation.x-=b*.82;this.rightShin.rotation.x+=b*.42;this.torso.rotation.y-=b*.24;}
    else if(id==='floyd'){this.leftArm.rotation.z-=b*.30;this.rightArm.rotation.z+=b*.30;this.torso.rotation.x+=b*.13;}
    else if(id==='gigachad'){this.torso.rotation.x-=b*.14;this.rightArm.rotation.x-=b*.56;}
    else if(id==='agarthan'){this.leftLeg.rotation.x-=b*.72;this.rightArm.rotation.z+=b*.40;}
    else if(id==='greek'){this.leftArm.rotation.x-=b*.50;this.rightArm.rotation.x-=b*.50;this.torso.rotation.x+=b*.10;}
    else if(id==='wojak'){this.torso.rotation.y+=Math.sin(p*Math.PI*4)*b*.24;this.head.rotation.z+=Math.sin(p*Math.PI*6)*b*.09;}
  }
  animate(dt,input){
    super.animate(dt,input);
    this.poseBaseline?.apply();
    this.secondFinisherAccent();
    this.fallbackMotion?.apply();
    this.entrancePose();
    this.victoryPose();
    this.hitReaction?.apply();
    this.finisherVictimPose();
  }
  snapshot(){return{...super.snapshot(),specialIndex:this.specialIndex,metrics:{...this.metrics},finisherReaction:this.finisherReaction,finisherStyle:this.finisherStyle}}
  applySnapshot(s){super.applySnapshot(s);this.specialIndex=s.specialIndex??this.specialIndex;if(s.metrics)this.metrics={...this.metrics,...s.metrics};this.finisherReaction=s.finisherReaction??0;this.finisherStyle=s.finisherStyle??0;}
}
