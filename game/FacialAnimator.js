const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export class FacialAnimator{
  constructor(fighter){this.f=fighter;this.r=fighter.faceRig;this.t=Math.random()*8;this.nextBlink=.9+Math.random()*2.3;this.blink=0;this.hitReact=0;this.prevHit=0;this.prevPhysical=100;this.prevConscious=100;this.mouthBaseZ=this.r?.mouth?.rotation?.z??0;}
  update(dt,target){
    const f=this.f,r=this.r;if(!r)return;this.t+=dt;this.nextBlink-=dt;
    if(this.nextBlink<=0){this.blink=.13;this.nextBlink=1.4+Math.random()*3.1}this.blink=Math.max(0,this.blink-dt);
    if(f.hitFlash>this.prevHit+.2||f.physical<this.prevPhysical-.4||f.consciousness<this.prevConscious-.4)this.hitReact=.30;
    this.prevHit=f.hitFlash;this.prevPhysical=f.physical;this.prevConscious=f.consciousness;this.hitReact=Math.max(0,this.hitReact-dt);
    const fatigue=clamp((100-Math.min(f.physical,f.consciousness))/100),attack=f.state==='Attack',block=f.state==='Block',stun=f.state==='Stun'||this.hitReact>0,danger=f.danger?.()??false,victory=f.state==='Victory',special=attack&&f.attackType==='special';
    const blinkAmt=this.blink>0?Math.sin(Math.PI*clamp(this.blink/.13)):0,squint=clamp((attack?.18:0)+(block?.15:0)+(stun?.28:0)+(danger?.10:0)+(special?.14:0));
    r.lids?.forEach((l,i)=>{l.scale.y=.8+blinkAmt*3.9+squint*1.25;l.position.y=(f.def.id==='gigachad'?.125:.11)-blinkAmt*.034-squint*.008+(stun?Math.sin(this.t*25+i)*.004:0)});
    let brow=-fatigue*.05+(attack?.035:0)+(stun?.07:0)+(victory?-.02:0);if(danger)brow+=.035;if(special)brow+=.035;
    r.brows?.forEach((b,i)=>{const sx=i===0?-1:1;b.position.y=.137+brow+(stun?Math.sin(this.t*28+i)*.012:0);b.rotation.z=sx*(special?.18:attack?.12:danger?.075:victory?.02:.035)+(stun?sx*.08:0)});
    if(r.jaw&&r.jaw!==f.head){const open=special?.16:attack?.055:stun?.09:victory?.028:danger?.022:0;r.jaw.position.y=-.19-open;r.jaw.rotation.x=open*.72;}
    if(r.mouth){const grimace=stun?.12:danger?.055:0;r.mouth.scale.x=1+(attack?.12:0)-(danger?.06:0)+(victory?.09:0);r.mouth.scale.y=1+grimace+(special?.08:0);r.mouth.rotation.x=stun?.15:special?.06:0;r.mouth.rotation.z=this.mouthBaseZ+(victory?Math.sin(this.t*1.3)*.008:0);}
    if(target&&r.pupils?.length&&f.def.id!=='wojak'){const dx=target.group.position.x-f.group.position.x,dz=target.group.position.z-f.group.position.z,yaw=Math.atan2(dx,dz)-f.yaw,focus=special?.55:1,px=clamp(Math.sin(yaw)*.016*focus,-.016,.016),py=clamp((target.group.position.y-f.group.position.y)*.006,-.008,.008);r.pupils.forEach((p,i)=>{const base=(i===0?-1:1)*(f.def.id==='gigachad'?.115:.105);p.position.x=base+px;p.position.y=(f.def.id==='gigachad'?.08:.065)+py;p.scale.setScalar(special?.92:1);});}
    const breathe=Math.sin(this.t*1.7+f.slot)*.003;f.head.rotation.x+=breathe*(danger?2:1);if(stun)f.head.rotation.y+=Math.sin(this.t*26)*.025;if(block)f.head.rotation.x-=.02;if(victory)f.head.rotation.y+=Math.sin(this.t*.9)*.018;if(special)f.head.rotation.x-=.025;
  }
}
