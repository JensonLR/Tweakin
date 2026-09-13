import { EliteFighter } from './EliteFighter.js';

const bell=x=>Math.sin(Math.PI*Math.max(0,Math.min(1,x)));

export class SignatureFighter extends EliteFighter{
  constructor(def,slot){super(def,slot);this.specialIndex=-1;}
  setState(s,move=''){
    const starting=s==='Attack'&&move==='special'&&this.state!=='Attack';
    if(starting)this.specialIndex=(this.specialIndex+1)%Math.max(1,this.def.finishers?.length||1);
    super.setState(s,move);
  }
  currentFinisher(){const fs=this.def.finishers||[];return fs[this.specialIndex<0?0:this.specialIndex%Math.max(1,fs.length)]||fs[0]||{name:'Signature',power:36}}
  attackDamage(kind){if(kind==='special'){const f=this.currentFinisher();return f.power*(.8+this.def.stats.upperBody/320)}return super.attackDamage(kind)}
  animate(dt,input){
    super.animate(dt,input);if(this.state!=='Attack'||this.attackType!=='special'||this.specialIndex!==1)return;
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
  snapshot(){return{...super.snapshot(),specialIndex:this.specialIndex}}
  applySnapshot(s){super.applySnapshot(s);this.specialIndex=s.specialIndex??this.specialIndex}
}
