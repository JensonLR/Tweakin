const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const bell=p=>Math.sin(Math.PI*clamp(p));

export class HitReaction{
  constructor(fighter){this.f=fighter;this.time=0;this.duration=.01;this.kind='light';this.dirX=0;this.dirZ=1;this.power=0;this.side=1;}
  trigger(kind='light',dirX=0,dirZ=1,damage=8){
    this.kind=kind;this.dirX=dirX;this.dirZ=dirZ;this.power=clamp(damage/32,.2,1.25);this.side=dirX>=0?1:-1;
    this.duration=kind==='special'?.62:kind==='environment'?.56:kind==='heavy'||kind==='weapon'||kind==='grapple'?.40:.24;this.time=this.duration;
  }
  update(dt){this.time=Math.max(0,this.time-dt)}
  apply(){
    if(this.time<=0)return;const f=this.f,p=1-this.time/this.duration,b=bell(p),pow=this.power,side=this.side;
    const strong=this.kind==='special'||this.kind==='environment'||this.kind==='heavy'||this.kind==='weapon'||this.kind==='grapple';
    f.torso.rotation.y+=side*b*(strong?.34:.16)*pow;
    f.torso.rotation.x+=b*(strong?.18:.08)*pow;
    f.torso.rotation.z-=side*b*(strong?.14:.065)*pow;
    f.head.rotation.y-=side*b*(strong?.26:.12)*pow;
    f.head.rotation.z+=side*b*(strong?.18:.08)*pow;
    const arm=(side>0?f.rightArm:f.leftArm),fore=(side>0?f.rightFore:f.leftFore);
    if(arm)arm.rotation.z+=side*b*(strong?.34:.16)*pow;if(fore)fore.rotation.x+=b*(strong?.26:.12)*pow;
    if(strong&&p>.45){const settle=1-clamp((p-.45)/.55);f.leftLeg.rotation.x+=b*.10*settle;f.rightLeg.rotation.x-=b*.08*settle;}
    if(this.kind==='special'){f.group.position.y+=b*.045;f.torso.rotation.y+=Math.sin(p*Math.PI*2)*.08;}
  }
}
