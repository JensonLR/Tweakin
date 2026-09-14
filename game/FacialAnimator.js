const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export class FacialAnimator{
  constructor(fighter){this.f=fighter;this.r=fighter.faceRig;this.t=Math.random()*8;this.nextBlink=.9+Math.random()*2.3;this.blink=0;this.hitReact=0;this.prevHit=0;this.prevPhysical=100;this.prevConscious=100;this.mouthBaseZ=this.r?.mouth?.rotation?.z??0;this.mouthBaseY=this.r?.mouth?.position?.y??this.r?.mouthY??-.112;this.jawBaseY=this.r?.jaw?.position?.y??-.145;this.eyeY=this.r?.eyeY??(fighter.def.id==='gigachad'?.052:.045);this.eyeX=this.r?.eyeX??(fighter.def.id==='gigachad'?.095:.088);this.browY=this.r?.browY??.105;}
  update(dt,target){
    const f=this.f,r=this.r;if(!r)return;this.t+=dt;this.nextBlink-=dt;if(this.nextBlink<=0){this.blink=.13;this.nextBlink=1.4+Math.random()*3.1}this.blink=Math.max(0,this.blink-dt);
    if(f.hitFlash>this.prevHit+.2||f.physical<this.prevPhysical-.4||f.consciousness<this.prevConscious-.4)this.hitReact=.30;this.prevHit=f.hitFlash;this.prevPhysical=f.physical;this.prevConscious=f.consciousness;this.hitReact=Math.max(0,this.hitReact-dt);
    const fatigue=clamp((100-Math.min(f.physical,f.consciousness))/100),attack=f.state==='Attack',block=f.state==='Block',stun=f.state==='Stun'||this.hitReact>0,danger=f.danger?.()??false,victory=f.state==='Victory',special=attack&&f.attackType==='special',eyeY=this.eyeY,eyeX=this.eyeX,browY=this.browY;
    const blinkAmt=this.blink>0?Math.sin(Math.PI*clamp(this.blink/.13)):0,squint=clamp((attack?.16:0)+(block?.12:0)+(stun?.24:0)+(danger?.08:0)+(special?.12:0));
    r.lids?.forEach((l,i)=>{l.scale.y=.82+blinkAmt*3.1+squint*.9;l.position.y=eyeY+.028-blinkAmt*.020-squint*.004+(stun?Math.sin(this.t*25+i)*.0025:0)});
    let browOffset=-fatigue*.018+(attack?.012:0)+(stun?.020:0)+(victory?-.006:0);if(danger)browOffset+=.010;if(special)browOffset+=.010;
    r.brows?.forEach((b,i)=>{const sx=i===0?-1:1;b.position.y=browY+browOffset+(stun?Math.sin(this.t*28+i)*.004:0);b.rotation.z=sx*(special?.14:attack?.09:danger?.055:victory?.02:.035)+(stun?sx*.05:0)});
    if(r.jaw&&r.jaw!==f.head){const open=special?.035:attack?.018:stun?.028:victory?.010:danger?.007:0;r.jaw.position.y=this.jawBaseY-open;r.jaw.rotation.x=open*1.1;}
    if(r.mouth){const grimace=stun?.07:danger?.025:0;r.mouth.position.y=this.mouthBaseY-(special?.012:attack?.004:0);r.mouth.scale.x=1+(attack?.06:0)-(danger?.025:0)+(victory?.04:0);r.mouth.scale.y=1+grimace+(special?.04:0);r.mouth.rotation.x=stun?.08:special?.04:0;r.mouth.rotation.z=this.mouthBaseZ+(victory?Math.sin(this.t*1.3)*.006:0);}
    if(target&&r.pupils?.length&&f.def.id!=='wojak'){const dx=target.group.position.x-f.group.position.x,dz=target.group.position.z-f.group.position.z,yaw=Math.atan2(dx,dz)-f.yaw,focus=special?.55:1,px=clamp(Math.sin(yaw)*.009*focus,-.009,.009),py=clamp((target.group.position.y-f.group.position.y)*.003,-.004,.004);r.pupils.forEach((p,i)=>{p.position.x=(i===0?-1:1)*eyeX+px;p.position.y=eyeY+py;p.scale.setScalar(special?.94:1);});}
    const breathe=Math.sin(this.t*1.7+f.slot)*.002;f.head.rotation.x+=breathe*(danger?1.5:1);if(stun)f.head.rotation.y+=Math.sin(this.t*26)*.014;if(block)f.head.rotation.x-=.012;if(victory)f.head.rotation.y+=Math.sin(this.t*.9)*.012;if(special)f.head.rotation.x-=.015;
  }
}
