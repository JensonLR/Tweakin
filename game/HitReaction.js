const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const bell=p=>Math.sin(Math.PI*clamp(p));
const easeOut=p=>1-Math.pow(1-clamp(p),3);

export class HitReaction{
  constructor(fighter){this.f=fighter;this.time=0;this.duration=.01;this.kind='light';this.dirX=0;this.dirZ=1;this.power=0;this.side=1;this.travel=0;this.seed=Math.random()*Math.PI*2;}
  trigger(kind='light',dirX=0,dirZ=1,damage=8){
    this.kind=kind;this.dirX=dirX;this.dirZ=dirZ;this.power=clamp(damage/32,.2,1.25);this.side=dirX>=0?1:-1;this.travel=0;this.seed+=1.71;
    this.duration=kind==='special'?.68:kind==='environment'?.60:kind==='heavy'||kind==='weapon'||kind==='grapple'?.44:.25;this.time=this.duration;
  }
  update(dt){
    if(this.time<=0)return;const f=this.f,p=1-this.time/this.duration,strong=this.kind==='special'||this.kind==='environment'||this.kind==='heavy'||this.kind==='weapon'||this.kind==='grapple';
    if(strong&&(f.ko||f.state==='Knockdown'||f.state==='Ground')){const decay=Math.pow(1-p,1.65),speed=(this.kind==='special'||this.kind==='environment'?3.35:2.15)*this.power*decay;f.group.position.x+=this.dirX*speed*dt;f.group.position.z+=this.dirZ*speed*dt;this.travel+=speed*dt;}
    this.time=Math.max(0,this.time-dt);
  }
  apply(){
    if(this.time<=0)return;const f=this.f,p=1-this.time/this.duration,b=bell(p),pow=this.power,side=this.side,strong=this.kind==='special'||this.kind==='environment'||this.kind==='heavy'||this.kind==='weapon'||this.kind==='grapple';
    const snap=Math.sin(Math.min(1,p*2.5)*Math.PI),rebound=p>.34?Math.sin(((p-.34)/.66)*Math.PI):0,settle=1-easeOut(p);
    f.torso.rotation.y+=side*(snap*(strong?.39:.18)-rebound*(strong?.10:.04))*pow;
    f.torso.rotation.x+=snap*(strong?.20:.085)*pow-rebound*.045*pow;
    f.torso.rotation.z-=side*snap*(strong?.16:.07)*pow;
    f.head.rotation.y-=side*(snap*(strong?.34:.15)-rebound*.08)*pow;
    f.head.rotation.z+=side*(snap*(strong?.23:.095)+Math.sin(p*Math.PI*3+this.seed)*.018*settle)*pow;
    f.head.rotation.x+=snap*(this.kind==='grapple'?.04:strong?.08:.035)*pow;
    const arm=side>0?f.rightArm:f.leftArm,fore=side>0?f.rightFore:f.leftFore,other=side>0?f.leftArm:f.rightArm;
    if(arm)arm.rotation.z+=side*snap*(strong?.40:.18)*pow;if(fore)fore.rotation.x+=snap*(strong?.32:.14)*pow;if(other&&strong)other.rotation.x+=rebound*.10*pow;
    if(strong){const brace=Math.sin(Math.min(1,p*1.5)*Math.PI);f.leftLeg.rotation.x+=brace*.075*pow;f.rightLeg.rotation.x-=brace*.06*pow;f.root.rotation.z-=side*snap*.035*pow;}
    if(this.kind==='weapon'){f.head.rotation.x-=snap*.09*pow;f.torso.rotation.y+=side*Math.sin(p*Math.PI*1.6)*.08*pow;}
    if(this.kind==='special'||this.kind==='environment'){f.group.position.y+=b*.052;f.torso.rotation.y+=Math.sin(p*Math.PI*2)*.10;f.leftArm.rotation.z-=b*.08;f.rightArm.rotation.z+=b*.08;}
    if((f.ko||f.state==='Knockdown')&&strong){const fall=clamp((p-.18)/.82);f.group.rotation.z-=side*fall*fall*(this.kind==='special'||this.kind==='environment'?.38:.20)*pow;f.root.rotation.x+=fall*.08*pow;}
  }
}
