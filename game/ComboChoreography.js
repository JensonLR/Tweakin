const clamp=v=>Math.max(0,Math.min(1,v));
const bell=p=>Math.sin(Math.PI*clamp(p));
const DUR={light:.34,heavy:.62,grapple:.72};

export class ComboChoreography{
  constructor(fighter){this.f=fighter;this.step=0;this.timer=0;this.lastMove='';this.sequence=0;}
  update(dt){this.timer=Math.max(0,this.timer-dt);if(!this.timer){this.step=0;this.lastMove='';}}
  start(move){
    if(!DUR[move])return;
    if(this.timer>0){this.step=(this.step+1)%3;this.sequence++;}else{this.step=0;this.sequence=0;}
    if(move!==this.lastMove&&this.timer>0)this.step=Math.min(2,this.step+1);
    this.lastMove=move;this.timer=.88;
  }
  multiplier(move){if(!DUR[move]||this.step<=0)return 1;return 1+Math.min(.12,this.step*.045)+(move==='grapple'&&this.step===2?.035:0)}
  apply(){
    const f=this.f,move=f.attackType;if(f.state!=='Attack'||!DUR[move])return;const p=clamp(f.stateTime/DUR[move]),b=bell(p),s=this.step,side=(this.sequence%2?1:-1);
    if(move==='light'){
      if(s===1){f.leftArm.rotation.x-=b*.95;f.leftFore.rotation.x-=b*.42;f.torso.rotation.y-=b*.26;f.head.rotation.y+=b*.06;}
      if(s===2){f.rightLeg.rotation.x-=b*1.05;f.rightShin.rotation.x+=b*.72;f.torso.rotation.x+=b*.12;f.leftArm.rotation.z-=b*.22;}
    }else if(move==='heavy'){
      if(s===1){f.leftArm.rotation.z-=b*.42;f.leftFore.rotation.x-=b*.88;f.torso.rotation.y-=b*.48;f.torso.rotation.x+=b*.10;}
      if(s===2){f.torso.rotation.y+=side*Math.sin(p*Math.PI*1.6)*.62;f.rightArm.rotation.z+=side*b*.54;f.leftArm.rotation.z-=side*b*.28;f.head.rotation.y-=side*b*.14;}
    }else if(move==='grapple'){
      if(s===1){f.torso.rotation.x+=b*.25;f.leftArm.rotation.z-=b*.46;f.rightArm.rotation.z+=b*.46;f.leftFore.rotation.x-=b*.58;f.rightFore.rotation.x-=b*.58;}
      if(s===2){f.group.position.y+=b*.035;f.torso.rotation.y+=side*b*.4;f.leftLeg.rotation.x+=b*.22;f.rightLeg.rotation.x-=b*.18;}
    }
  }
  snapshot(){return{step:this.step,timer:this.timer,lastMove:this.lastMove,sequence:this.sequence}}
  applySnapshot(s){if(!s)return;this.step=s.step??0;this.timer=s.timer??0;this.lastMove=s.lastMove??'';this.sequence=s.sequence??0}
}
