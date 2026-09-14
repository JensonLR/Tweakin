import { THREE } from '../vendor/three.js';
import { DetailedFighter } from './DetailedFighter.js';
import { applyFighterSurface } from './SurfaceDetail.js';

const DUR={light:.34,heavy:.62,grapple:.72,special:2.35};
const ease=x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;
const bell=x=>Math.sin(Math.PI*Math.max(0,Math.min(1,x)));

export class UltraFighter extends DetailedFighter{
  constructor(def,slot){super(def,slot);this.attackSerial=0;this.attackSide=1;this.poseClock=0;this.idlePhase=(slot+1)*1.73;applyFighterSurface(this.group,def);}
  setState(s,move=''){const starting=s==='Attack'&&move&&this.state!=='Attack';super.setState(s,move);if(starting){this.attackSerial++;this.attackSide=this.attackSerial%2?1:-1}}
  animate(dt,input){
    super.animate(dt,input);this.poseClock+=dt;const ownsMotion=!!this.fallbackMotion;
    if(!ownsMotion&&(this.state==='Neutral'||this.state==='Block'))this.idlePolish();
    if(!ownsMotion&&this.state==='Attack'&&DUR[this.attackType])this.attackChoreography();
    if(!ownsMotion&&(this.state==='Move'||this.state==='Run'))this.locomotionPolish();
    if(this.state==='Knockdown'||this.state==='Ground'||this.state==='GetUp'||this.state==='KO')this.groundPolish();
  }
  idlePolish(){
    const t=this.poseClock+this.idlePhase,id=this.def.id,breath=Math.sin(t*1.8),shift=Math.sin(t*.72),guard=this.state==='Block'?1:0;
    this.torso.position.y=.48+breath*.009;this.head.position.y=1.01+breath*.005;this.root.rotation.z+=shift*.008;this.torso.rotation.x-=breath*.008;
    const boxer=['floyd','gigachad','kirk'].includes(id),formal=['trump','netanyahu'].includes(id);
    if(boxer){this.leftArm.rotation.z-=.10+guard*.16;this.rightArm.rotation.z+=.10+guard*.16;this.leftFore.rotation.x-=.20+guard*.22;this.rightFore.rotation.x-=.22+guard*.22;this.torso.rotation.y+=shift*.018;}
    else if(formal){this.leftFore.rotation.x-=.09+guard*.20;this.rightFore.rotation.x-=.11+guard*.20;this.torso.rotation.y+=shift*.012;}
    else if(id==='greek'){this.leftArm.rotation.z-=.08;this.rightArm.rotation.z+=.06;this.head.rotation.y+=shift*.018;}
    else if(id==='agarthan'){this.leftArm.rotation.z-=.12;this.rightArm.rotation.z+=.12;this.group.position.y+=Math.max(0,breath)*.004;}
    else if(id==='wojak'){this.head.rotation.z+=Math.sin(t*2.3)*.018;this.rightFore.rotation.z+=Math.sin(t*1.4)*.024;}
  }
  attackChoreography(){
    const type=this.attackType,p=Math.min(1,this.stateTime/DUR[type]),b=bell(p),e=ease(p),side=this.attackSide;
    if(type==='light'){
      const snap=Math.sin(Math.min(1,p*1.8)*Math.PI);this.torso.rotation.y+=side*b*.38;this.torso.rotation.x-=b*.05;
      const arm=side>0?this.rightArm:this.leftArm,fore=side>0?this.rightFore:this.leftFore;arm.rotation.z+=side*b*.24;arm.rotation.x-=snap*.36;fore.rotation.x-=b*.58;this.head.rotation.y-=side*b*.09;this.group.position.y+=b*.012;
    }else if(type==='heavy'){
      const wind=p<.42?Math.sin((p/.42)*Math.PI)*.34:0,release=p>.32?bell((p-.32)/.68):0;this.torso.rotation.y+=side*(wind-release*.68);this.torso.rotation.x+=wind*.2-release*.10;this.head.rotation.y-=side*release*.14;this.rightArm.rotation.z+=side*(wind*.58-release*.34);this.leftArm.rotation.x-=release*.2;this.group.position.y-=wind*.04;this.root.rotation.z+=side*(wind*.035-release*.02);
    }else if(type==='grapple'){
      const reach=bell(Math.min(1,p*1.35));this.leftArm.rotation.z-=reach*.38;this.rightArm.rotation.z+=reach*.38;this.leftFore.rotation.x-=reach*.68;this.rightFore.rotation.x-=reach*.68;this.torso.rotation.x+=reach*.18;this.group.position.y-=reach*.03;this.root.rotation.z+=this.attackSide*reach*.02;
    }else if(type==='special')this.specialPose(p,e,b)
  }
  specialPose(p,e,b){
    const id=this.def.id;if(id==='gigachad'){this.torso.rotation.y+=b*.82;this.torso.rotation.x-=Math.sin(p*Math.PI*2)*.18;this.rightArm.rotation.z+=b*.72;this.leftArm.rotation.z-=b*.46}
    else if(id==='greek'){this.torso.rotation.y-=b*.48;this.leftArm.rotation.z-=Math.sin(p*Math.PI*1.5)*.74;this.rightArm.rotation.z+=Math.sin(p*Math.PI*2)*.58;this.head.rotation.y+=Math.sin(p*Math.PI)*.2}
    else if(id==='agarthan'){this.torso.rotation.y+=Math.sin(p*Math.PI*3)*.3;this.leftArm.rotation.z-=b*.62;this.rightArm.rotation.z+=b*.62;this.group.position.y+=Math.sin(p*Math.PI)*.08}
    else if(id==='floyd'){this.torso.rotation.x+=b*.2;this.torso.rotation.y+=this.attackSide*b*.46;this.leftArm.rotation.x-=b*.55;this.rightArm.rotation.x-=b*.9}
    else if(id==='wojak'){this.head.rotation.z+=Math.sin(p*Math.PI*5)*.12*b;this.torso.rotation.y+=Math.sin(p*Math.PI*2)*.52;this.rightArm.rotation.z+=Math.sin(p*Math.PI*3)*.55}
    else{this.torso.rotation.y+=this.attackSide*b*.5;this.rightArm.rotation.z+=b*.55;this.leftArm.rotation.z-=b*.28;this.head.rotation.y-=this.attackSide*b*.14}
    const pulse=Math.sin(Math.min(1,p*1.15)*Math.PI);this.aura.scale.setScalar(1+pulse*.26);this.aura.position.y=.06+pulse*.08
  }
  locomotionPolish(){
    const t=performance.now()/1000+this.animSeed,run=this.state==='Run',freq=run?10.8:6.6,w=Math.sin(t*freq),plant=Math.abs(Math.cos(t*freq)),stride=run?.075:.04;
    this.torso.position.y=.48+(1-plant)*(run?.052:.026);this.head.position.y=1.01+(1-plant)*(run?.023:.011);this.leftFore.rotation.x=-.12-w*(run?.24:.10);this.rightFore.rotation.x=-.12+w*(run?.24:.10);this.root.rotation.z+=w*(run?.025:.012);this.torso.rotation.y+=w*stride;
  }
  groundPolish(){
    const p=this.state==='GetUp'?Math.min(1,this.stateTime/.55):0;
    if(this.state==='Knockdown'){const q=Math.min(1,this.stateTime/.62),fall=ease(q);this.torso.rotation.x+=fall*.22;this.head.rotation.z+=this.attackSide*fall*.12;this.leftArm.rotation.z-=fall*.22;this.rightArm.rotation.z+=fall*.24;}
    if(this.state==='Ground'){const settle=Math.min(1,this.stateTime/.7);this.head.rotation.z+=Math.sin(this.stateTime*5)*.035*(1-settle);this.leftFore.rotation.x-=.18;}
    if(this.state==='GetUp'){this.leftArm.rotation.z=-.46*(1-p);this.rightArm.rotation.z=.36*(1-p);this.leftFore.rotation.x=-.34*(1-p);this.torso.rotation.x=.42*(1-p);this.head.rotation.x=-.10*(1-p)}
    if(this.state==='KO'){const settle=Math.min(1,this.stateTime/1.4);this.head.rotation.z=.18*Math.sin(this.stateTime*4)*(1-settle);this.leftFore.rotation.z+=.12*(1-settle);this.rightFore.rotation.z-=.10*(1-settle)}
  }
}
