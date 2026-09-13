import { UltraFighter } from './UltraFighter.js';

export class EliteFighter extends UltraFighter{
  constructor(def,slot){super(def,slot);this.buffered='';this.bufferTime=0;this.prevBlock=false;this.parryWindow=0;this.evadeTime=0;this.evadeCooldown=0;this.invuln=0;this.justEvaded=false;}
  update(dt,input,target,arena){
    this.bufferTime=Math.max(0,this.bufferTime-dt);this.parryWindow=Math.max(0,this.parryWindow-dt);this.evadeTime=Math.max(0,this.evadeTime-dt);this.evadeCooldown=Math.max(0,this.evadeCooldown-dt);this.invuln=Math.max(0,this.invuln-dt);this.justEvaded=false;
    if(input.block&&!this.prevBlock&&this.canAct()){this.parryWindow=.14;this.momentum=Math.min(100,this.momentum+1)}this.prevBlock=!!input.block;
    if(this.state==='Attack'){
      const next=input.grapple?'grapple':input.heavy?'heavy':input.light?'light':'';if(next){this.buffered=next;this.bufferTime=.42;}
    }
    if(this.state!=='Attack'&&this.buffered&&this.bufferTime>0&&this.canAct()){
      input={...input,[this.buffered]:true};this.buffered='';this.bufferTime=0;
    }
    const axis=Math.hypot(input.x||0,input.y||0);
    if(input.block&&input.run&&axis>.45&&this.evadeCooldown<=0&&this.canAct()&&this.state!=='Attack'){
      const side=Math.abs(input.x)>.2?Math.sign(input.x):((this.slot%2)?-1:1);this.group.position.x+=Math.cos(this.yaw)*side*.62;this.group.position.z+=-Math.sin(this.yaw)*side*.62;this.evadeTime=.26;this.invuln=.16;this.evadeCooldown=.72;this.justEvaded=true;input={...input,block:false,run:false,x:0,y:0};
    }
    return super.update(dt,input,target,arena);
  }
  tryDefense(kind,attacker){
    if(this.invuln>0)return{evaded:true};
    if(this.parryWindow>0&&kind!=='grapple'&&kind!=='special'&&kind!=='environment'){
      this.parryWindow=0;this.momentum=Math.min(100,this.momentum+12);if(attacker&&!attacker.ko)attacker.setState('Stun');return{parried:true};
    }
    return null;
  }
  animate(dt,input){
    super.animate(dt,input);
    if(this.evadeTime>0){const p=this.evadeTime/.26;this.torso.rotation.z+=(this.slot?-.18:.18)*Math.sin(p*Math.PI);this.head.rotation.z-=this.torso.rotation.z*.35;}
    if(this.parryWindow>0){this.leftFore.rotation.z-=.22;this.rightFore.rotation.z+=.22;}
  }
}
