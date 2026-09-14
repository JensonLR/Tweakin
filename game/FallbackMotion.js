const clamp=v=>Math.max(0,Math.min(1,v));
const smooth=t=>{t=clamp(t);return t*t*(3-2*t)};
const easeOut=t=>1-Math.pow(1-clamp(t),3);
const pulse=(p,a,b)=>{if(p<=a||p>=b)return 0;const x=(p-a)/(b-a);return Math.sin(Math.PI*x)};
const phase=(p,a,b)=>smooth((p-a)/(b-a));
const DUR={light:.34,heavy:.62,grapple:.72,special:2.35};

export class FallbackMotion{
  constructor(f){this.f=f;this.clock=0;this.breath=0;}
  update(dt){this.clock+=dt;}
  apply(){
    const f=this.f;
    if(f.importedVisual?.ready)return;
    this.idleAndLocomotion();
    this.defence();
    this.attack();
  }
  idleAndLocomotion(){
    const f=this.f,t=this.clock,move=f.state==='Move'||f.state==='Run';
    if(!['Attack','Stun','Knockdown','Ground','GetUp','KO','Victory'].includes(f.state)){
      const breath=Math.sin(t*2.05+f.slot*.7),weight=Math.sin(t*.92+f.slot)*.5+.5;
      f.torso.rotation.x+=breath*.018;
      f.torso.rotation.z+=(weight-.5)*.022;
      f.head.rotation.y+=Math.sin(t*.58+f.slot)*.028;
      if(f.pelvis){f.pelvis.rotation.y+=(weight-.5)*.035;f.pelvis.position.y+=breath*.006;}
    }
    if(move){
      const run=f.state==='Run',freq=run?10.8:6.6,swing=Math.sin(t*freq),plant=Math.abs(Math.cos(t*freq));
      f.leftLeg.rotation.x+=swing*(run?.23:.13);f.rightLeg.rotation.x-=swing*(run?.23:.13);
      f.leftShin.rotation.x+=Math.max(0,-swing)*(run?.24:.13);f.rightShin.rotation.x+=Math.max(0,swing)*(run?.24:.13);
      f.leftArm.rotation.x-=swing*(run?.18:.10);f.rightArm.rotation.x+=swing*(run?.18:.10);
      f.torso.rotation.y+=swing*(run?.035:.022);f.torso.rotation.x+=run?.055:.018;
      if(f.pelvis){f.pelvis.rotation.y-=swing*(run?.06:.038);f.pelvis.position.y-=plant*(run?.013:.008);}
      f.head.rotation.y-=swing*.018;
    }
  }
  defence(){
    const f=this.f;
    if(f.state==='Block'){
      f.torso.rotation.x+=.075;f.head.rotation.x+=.045;
      f.leftArm.rotation.z-=.14;f.rightArm.rotation.z+=.14;
      f.leftFore.rotation.x-=.26;f.rightFore.rotation.x-=.26;
      if(f.pelvis)f.pelvis.rotation.x-=.035;
    }
    if(f.parryWindow>0){
      const q=clamp(f.parryWindow/.14);
      f.torso.rotation.y+=(f.slot%2?-.13:.13)*(1-q);
      f.leftFore.rotation.z-=.16*q;f.rightFore.rotation.z+=.16*q;
      f.head.rotation.y-=f.torso.rotation.y*.22;
    }
    if(f.evadeTime>0){
      const q=1-clamp(f.evadeTime/.26),b=Math.sin(Math.PI*q),side=f.slot%2?-1:1;
      f.torso.rotation.z+=side*b*.18;f.torso.rotation.y-=side*b*.12;
      if(f.pelvis)f.pelvis.rotation.z-=side*b*.09;
      f.head.rotation.z-=side*b*.08;
    }
  }
  attack(){
    const f=this.f,kind=f.attackType;
    if(f.state!=='Attack'||!DUR[kind])return;
    const p=clamp(f.stateTime/DUR[kind]),side=(f.signatureStep%2?1:-1);
    if(kind==='light')this.light(p,side);
    else if(kind==='heavy')this.heavy(p,side);
    else if(kind==='grapple')this.grapple(p,side);
    else this.special(p,side);
  }
  light(p,side){
    const f=this.f,load=phase(p,0,.22)*(1-phase(p,.22,.42)),strike=phase(p,.20,.46)*(1-phase(p,.46,.72)),recover=phase(p,.66,1),snap=pulse(p,.18,.56);
    f.torso.rotation.y-=side*load*.22;f.torso.rotation.y+=side*strike*.31;f.torso.rotation.x-=snap*.035;
    f.head.rotation.y+=side*load*.08;f.head.rotation.y-=side*strike*.07;
    const arm=side>0?f.rightArm:f.leftArm,fore=side>0?f.rightFore:f.leftFore,guard=side>0?f.leftArm:f.rightArm,guardFore=side>0?f.leftFore:f.rightFore;
    arm.rotation.x+=load*.22;arm.rotation.x-=strike*.72;arm.rotation.z+=side*(load*.16-strike*.10);fore.rotation.x-=strike*.38;
    guard.rotation.x-=.18*(1-recover);guardFore.rotation.x-=.24*(1-recover);
    if(f.pelvis)f.pelvis.rotation.y+=side*(strike*.18-load*.10);
    const rear=side>0?f.leftLeg:f.rightLeg;rear.rotation.x+=snap*.045;
  }
  heavy(p,side){
    const f=this.f,load=phase(p,0,.32)*(1-phase(p,.32,.5)),drive=phase(p,.27,.58)*(1-phase(p,.58,.78)),follow=pulse(p,.45,.9),recover=phase(p,.78,1);
    f.torso.rotation.y-=side*load*.48;f.torso.rotation.y+=side*drive*.67;f.torso.rotation.x+=load*.10-drive*.15+follow*.05;
    f.head.rotation.y+=side*load*.16;f.head.rotation.y-=side*drive*.12;f.head.rotation.x+=drive*.035;
    const arm=side>0?f.rightArm:f.leftArm,fore=side>0?f.rightFore:f.leftFore,guard=side>0?f.leftArm:f.rightArm;
    arm.rotation.x+=load*.38;arm.rotation.x-=drive*1.02;arm.rotation.z+=side*(load*.31-drive*.24);fore.rotation.x-=drive*.58;
    guard.rotation.x-=.30*(1-recover);guard.rotation.z-=side*.12*(1-recover);
    if(f.pelvis){f.pelvis.rotation.y+=side*(drive*.38-load*.25);f.pelvis.rotation.x-=drive*.07;}
    const front=side>0?f.rightLeg:f.leftLeg,rear=side>0?f.leftLeg:f.rightLeg;front.rotation.x-=drive*.06;rear.rotation.x+=load*.08;
  }
  grapple(p,side){
    const f=this.f,level=phase(p,0,.24)*(1-phase(p,.24,.45)),reach=phase(p,.18,.55)*(1-phase(p,.55,.82)),recover=phase(p,.76,1);
    f.torso.rotation.x+=level*.13+reach*.12;f.torso.rotation.y+=side*reach*.10;
    f.leftArm.rotation.x-=reach*.68;f.rightArm.rotation.x-=reach*.68;f.leftArm.rotation.z-=reach*.25;f.rightArm.rotation.z+=reach*.25;
    f.leftFore.rotation.x-=reach*.42;f.rightFore.rotation.x-=reach*.42;
    if(f.pelvis){f.pelvis.rotation.x-=level*.09;f.pelvis.position.y-=level*.025;}
    f.leftLeg.rotation.x+=level*.08;f.rightLeg.rotation.x+=level*.08;
    f.head.rotation.x+=reach*.03*(1-recover);
  }
  special(p,side){
    const f=this.f,anticipate=phase(p,0,.18)*(1-phase(p,.18,.28)),surge=pulse(p,.20,.63),finish=pulse(p,.56,.92);
    f.torso.rotation.y-=side*anticipate*.42;f.torso.rotation.y+=side*surge*.52;f.torso.rotation.x-=surge*.10+finish*.06;
    f.head.rotation.y+=side*anticipate*.13;f.head.rotation.x-=finish*.045;
    if(f.pelvis){f.pelvis.rotation.y+=side*(surge*.28-anticipate*.20);f.pelvis.position.y-=anticipate*.018;}
    f.leftArm.rotation.x-=surge*.24;f.rightArm.rotation.x-=surge*.48;f.leftArm.rotation.z-=finish*.18;f.rightArm.rotation.z+=finish*.18;
    f.leftLeg.rotation.x+=anticipate*.08;f.rightLeg.rotation.x-=surge*.10;
  }
}
