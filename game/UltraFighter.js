import { THREE } from '../vendor/three.js';
import { DetailedFighter } from './DetailedFighter.js';
import { applyFighterSurface } from './SurfaceDetail.js';

const DUR={light:.34,heavy:.62,grapple:.72,special:2.35};
const ease=x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;
const bell=x=>Math.sin(Math.PI*Math.max(0,Math.min(1,x)));

export class UltraFighter extends DetailedFighter{
  constructor(def,slot){super(def,slot);this.attackSerial=0;this.attackSide=1;this.poseClock=0;applyFighterSurface(this.group,def.id);}
  setState(s,move=''){
    const starting=s==='Attack'&&move&&this.state!=='Attack';super.setState(s,move);if(starting){this.attackSerial++;this.attackSide=this.attackSerial%2?1:-1;}
  }
  animate(dt,input){
    super.animate(dt,input);this.poseClock+=dt;
    if(this.state==='Attack'&&DUR[this.attackType])this.attackChoreography();
    if(this.state==='Move'||this.state==='Run')this.locomotionPolish();
    if(this.state==='Knockdown'||this.state==='Ground'||this.state==='GetUp'||this.state==='KO')this.groundPolish();
  }
  attackChoreography(){
    const type=this.attackType,p=Math.min(1,this.stateTime/DUR[type]),b=bell(p),e=ease(p),side=this.attackSide;
    if(type==='light'){
      this.torso.rotation.y+=side*b*.34;this.torso.rotation.x-=b*.045;
      const arm=side>0?this.rightArm:this.leftArm,fore=side>0?this.rightFore:this.leftFore;
      arm.rotation.z+=side*b*.22;fore.rotation.x-=b*.5;this.head.rotation.y-=side*b*.08;
      this.group.position.y+=b*.015;
    }else if(type==='heavy'){
      const wind=p<.42?Math.sin((p/.42)*Math.PI)*.32:0,release=p>.32?bell((p-.32)/.68):0;
      this.torso.rotation.y+=side*(wind-release*.62);this.torso.rotation.x+=wind*.18-release*.08;this.head.rotation.y-=side*release*.12;
      this.rightArm.rotation.z+=side*(wind*.55-release*.32);this.leftArm.rotation.x-=release*.18;this.group.position.y-=wind*.035;
    }else if(type==='grapple'){
      const reach=bell(Math.min(1,p*1.35));this.leftArm.rotation.z-=reach*.34;this.rightArm.rotation.z+=reach*.34;this.leftFore.rotation.x-=reach*.62;this.rightFore.rotation.x-=reach*.62;this.torso.rotation.x+=reach*.16;this.group.position.y-=reach*.025;
    }else if(type==='special')this.specialPose(p,e,b);
  }
  specialPose(p,e,b){
    const id=this.def.id;
    if(id==='gigachad'){this.torso.rotation.y+=b*.82;this.torso.rotation.x-=Math.sin(p*Math.PI*2)*.18;this.rightArm.rotation.z+=b*.72;this.leftArm.rotation.z-=b*.46;}
    else if(id==='greek'){this.torso.rotation.y-=b*.48;this.leftArm.rotation.z-=Math.sin(p*Math.PI*1.5)*.74;this.rightArm.rotation.z+=Math.sin(p*Math.PI*2)*.58;this.head.rotation.y+=Math.sin(p*Math.PI)*.2;}
    else if(id==='agarthan'){this.torso.rotation.y+=Math.sin(p*Math.PI*3)*.3;this.leftArm.rotation.z-=b*.62;this.rightArm.rotation.z+=b*.62;this.group.position.y+=Math.sin(p*Math.PI)*.08;}
    else if(id==='floyd'){this.torso.rotation.x+=b*.2;this.torso.rotation.y+=this.attackSide*b*.46;this.leftArm.rotation.x-=b*.55;this.rightArm.rotation.x-=b*.9;}
    else if(id==='wojak'){this.head.rotation.z+=Math.sin(p*Math.PI*5)*.12*b;this.torso.rotation.y+=Math.sin(p*Math.PI*2)*.52;this.rightArm.rotation.z+=Math.sin(p*Math.PI*3)*.55;}
    else{this.torso.rotation.y+=this.attackSide*b*.5;this.rightArm.rotation.z+=b*.55;this.leftArm.rotation.z-=b*.28;this.head.rotation.y-=this.attackSide*b*.14;}
    const pulse=Math.sin(Math.min(1,p*1.15)*Math.PI);this.aura.scale.setScalar(1+pulse*.26);this.aura.position.y=.06+pulse*.08;
  }
  locomotionPolish(){
    const t=performance.now()/1000+this.animSeed,run=this.state==='Run',w=Math.sin(t*(run?10.8:6.6)),plant=Math.abs(Math.cos(t*(run?10.8:6.6)));
    this.torso.position.y=.48+(1-plant)*(run?.055:.028);this.head.position.y=1.01+(1-plant)*(run?.025:.012);this.leftFore.rotation.x=-.12-w*(run?.24:.10);this.rightFore.rotation.x=-.12+w*(run?.24:.10);
  }
  groundPolish(){
    const p=this.state==='GetUp'?Math.min(1,this.stateTime/.55):0;if(this.state==='GetUp'){this.leftArm.rotation.z=-.42*(1-p);this.rightArm.rotation.z=.32*(1-p);this.torso.rotation.x=.35*(1-p);}
    if(this.state==='KO'){const settle=Math.min(1,this.stateTime/1.4);this.head.rotation.z=.18*Math.sin(this.stateTime*4)*(1-settle);}
  }
}
