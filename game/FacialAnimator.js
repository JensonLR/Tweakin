const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));

export class FacialAnimator{
  constructor(fighter){this.f=fighter;this.r=fighter.faceRig;this.t=Math.random()*8;this.nextBlink=.9+Math.random()*2.3;this.blink=0;this.hitReact=0;this.prevHit=0;this.prevPhysical=100;this.prevConscious=100;}
  update(dt,target){
    const f=this.f,r=this.r;if(!r)return;this.t+=dt;this.nextBlink-=dt;
    if(this.nextBlink<=0){this.blink=.13;this.nextBlink=1.4+Math.random()*3.1}this.blink=Math.max(0,this.blink-dt);
    if(f.hitFlash>this.prevHit+.2||f.physical<this.prevPhysical-.4||f.consciousness<this.prevConscious-.4)this.hitReact=.26;
    this.prevHit=f.hitFlash;this.prevPhysical=f.physical;this.prevConscious=f.consciousness;this.hitReact=Math.max(0,this.hitReact-dt);
    const blinkAmt=this.blink>0?Math.sin(Math.PI*clamp(this.blink/.13)):0;
    r.lids?.forEach((l,i)=>{l.scale.y=.8+blinkAmt*3.9;l.position.y=(f.def.id==='gigachad'?.125:.11)-blinkAmt*.034});
    const fatigue=clamp((100-Math.min(f.physical,f.consciousness))/100);
    const attack=f.state==='Attack',block=f.state==='Block',stun=f.state==='Stun'||this.hitReact>0,danger=f.danger?.()??false;
    let brow=-fatigue*.05+(attack?.035:0)+(stun?.07:0);if(danger)brow+=.035;
    r.brows?.forEach((b,i)=>{const sx=i===0?-1:1;b.position.y=.137+brow+(stun?Math.sin(this.t*28+i)*.012:0);b.rotation.z=sx*(attack?.12:danger?.075:.035)+(stun?sx*.08:0)});
    if(r.jaw&&r.jaw!==f.head){const open=attack?(f.attackType==='special'?.13:.045):stun?.08:danger?.022:0;r.jaw.position.y=-.19-open;r.jaw.rotation.x=open*.72;}
    if(r.mouth){r.mouth.scale.x=1+(attack?.12:0)-(danger?.06:0);r.mouth.rotation.x=stun?.15:0;}
    if(target&&r.pupils?.length&&f.def.id!=='wojak'){
      const dx=target.group.position.x-f.group.position.x,dz=target.group.position.z-f.group.position.z;
      const yaw=Math.atan2(dx,dz)-f.yaw,px=clamp(Math.sin(yaw)*.016,-.016,.016),py=clamp((target.group.position.y-f.group.position.y)*.006,-.008,.008);
      r.pupils.forEach((p,i)=>{const base=(i===0?-1:1)*(f.def.id==='gigachad'?.115:.105);p.position.x=base+px;p.position.y=(f.def.id==='gigachad'?.08:.065)+py;});
    }
    const breathe=Math.sin(this.t*1.7+f.slot)*.003;f.head.rotation.x+=breathe*(danger?2:1);
    if(stun)f.head.rotation.y+=Math.sin(this.t*26)*.025;
    if(block)f.head.rotation.x-=.02;
  }
}
