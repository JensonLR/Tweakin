import { EMPTY_INPUT } from '../core/types.js';
import { clamp, seeded, hash } from '../core/math.js';

export class FighterAI{
  difficulty;nextThink=0;action={...EMPTY_INPUT};rng;strafe=1;pressure=0;combo=[];comboDelay=0;feint=0;reads={light:0,heavy:0,grapple:0,special:0};lastAttackSerial=-1;lastTargetState='';whiffWindow=0;
  constructor(difficulty=.6,seed='ai'){this.difficulty=clamp(difficulty,.05,1);this.rng=seeded(hash(seed));}
  pulse(name){const a={...EMPTY_INPUT};a[name]=true;return a}
  observe(target,dt){
    this.whiffWindow=Math.max(0,this.whiffWindow-dt);const serial=target.attackSerial??-1;
    if(target.state==='Attack'&&serial!==this.lastAttackSerial){this.lastAttackSerial=serial;const k=target.attackType;if(k&&k in this.reads)this.reads[k]=this.reads[k]*.94+1;for(const n of Object.keys(this.reads))if(n!==k)this.reads[n]*=.985;}
    if(this.lastTargetState==='Attack'&&target.state!=='Attack'&&target.state!=='Stun'&&target.state!=='Knockdown')this.whiffWindow=.24+.22*this.difficulty;
    this.lastTargetState=target.state;
  }
  tendency(){let best='light',score=-1,total=0;for(const [k,v] of Object.entries(this.reads)){total+=v;if(v>score){score=v;best=k}}return{move:best,confidence:total>1?score/total:0}}
  plan(styles,oppDanger,nearWall){const r=this.rng();if(nearWall&&styles.includes('Wrestling')&&r<.5)return['grapple','heavy'];if(styles.includes('Kickboxing')&&r<.38)return['light','heavy'];if(styles.includes('Martial Arts')&&r<.42)return['light','light','heavy'];if(styles.includes('Wrestling')&&r<.46)return['light','grapple'];if(oppDanger&&r<.65)return['heavy','heavy'];return r<.52?['light','light']:['light','heavy'];}
  update(dt,self,targets,arena){
    this.nextThink-=dt;this.comboDelay=Math.max(0,this.comboDelay-dt);this.feint=Math.max(0,this.feint-dt);const live=targets.filter(t=>!t.ko&&t!==self);if(!live.length)return{...EMPTY_INPUT};const target=live.sort((a,b)=>dist(self,a)-dist(self,b))[0],d=dist(self,target);this.observe(target,dt);
    this.pressure=clamp(this.pressure+dt*(d<1.6?.14:-.07),0,1);
    if(this.combo.length&&this.comboDelay<=0&&self.canAct?.()&&self.state!=='Attack'&&d<1.5){const move=this.combo.shift();this.comboDelay=.16+(1-this.difficulty)*.08;return this.pulse(move)}
    if(this.nextThink<=0){
      this.nextThink=.06+(1-this.difficulty)*.15+this.rng()*.08;this.action={...EMPTY_INPUT};const danger=self.danger(),oppDanger=target.danger(),nearWall=!!arena.environmentAnchor(target.group.position.x,target.group.position.z),styles=self.def.styles||[],read=.20+this.difficulty*.68,tendency=this.tendency();
      if(self.momentum>=100&&this.rng()<.48+.34*this.difficulty){this.action.taunt=true;return this.action}
      if((target.state==='Stun'||target.state==='Knockdown')&&d<1.7&&this.rng()<.62+.26*this.difficulty){this.combo=this.plan(styles,true,nearWall);const first=this.combo.shift();this.action[first]=true;this.comboDelay=.13;return this.action}
      if(this.whiffWindow>0&&d<1.75&&this.rng()<.42+.45*this.difficulty){this.whiffWindow=0;if(styles.includes('Wrestling')&&d<1.1)this.action.grapple=true;else this.action.heavy=true;return this.action}
      if(target.state==='Attack'&&target.attackType&&d<1.8){
        const learned=tendency.confidence>.42&&this.rng()<this.difficulty*.72,expected=learned?tendency.move:target.attackType,roll=this.rng();
        if(expected==='grapple'&&roll<read*.78){this.action.y=.88;this.action.x=this.strafe*.55;this.action.run=true;this.strafe*=-1;return this.action}
        if(expected==='heavy'&&roll<read*.70){this.action.x=this.strafe*.92;this.action.y=.32;this.action.run=true;this.strafe*=-1;return this.action}
        if(roll<read*.38){this.action.block=true;return this.action}
        if(roll<read*.66){this.action.block=true;this.action.x=this.strafe;this.strafe*=-1;return this.action}
        if(roll<read){this.action.y=.65;this.action.x=this.strafe*.7;this.action.run=true;this.strafe*=-1;return this.action}
      }
      const weapon=arena.nearestWeapon(self.group.position.x,self.group.position.z,3.1);if(!self.heldWeapon&&weapon&&this.rng()<.10+.28*this.difficulty&&d>1.15){const dx=weapon.group.position.x-self.group.position.x,dz=weapon.group.position.z-self.group.position.z,ang=Math.atan2(dx,dz)-self.yaw;this.action.x=Math.sin(ang);this.action.y=-Math.cos(ang);this.action.run=true;if(Math.hypot(dx,dz)<1.28)this.action.pickup=true;return this.action}
      if(d>2.25){this.action.y=-1;this.action.x=(this.rng()-.5)*.5;this.action.run=d>3.8||this.pressure<.22}
      else if(d<.62){const r=this.rng();if(r<.24){this.action.y=.8;this.action.x=this.strafe*.75}else if(styles.includes('Wrestling')&&r<.62)this.action.grapple=true;else if(r<.52+.22*this.difficulty)this.action.light=true;else this.action.block=true}
      else{
        const r=this.rng(),aggression=(self.def.aggression??.7)*.48+.18+this.difficulty*.22;
        if(tendency.confidence>.48&&this.difficulty>.55&&r<.15){if(tendency.move==='grapple'){this.action.y=.55;this.action.x=this.strafe*.55}else if(tendency.move==='heavy'){this.action.x=this.strafe*.85;this.action.block=true}else{this.action.block=true;this.action.x=this.strafe*.35}this.strafe*=-1;return this.action}
        if(this.feint<=0&&r<.10+.08*this.difficulty){this.feint=.34;this.action.x=this.strafe*.65;this.action.y=.12;this.strafe*=-1;return this.action}
        if(self.heldWeapon&&r<.52){this.action.heavy=true}
        else if(oppDanger&&r<aggression*.52){this.action.heavy=true}
        else if(nearWall&&styles.includes('Wrestling')&&r<aggression*.65){this.action.grapple=true}
        else if(r<aggression){this.combo=this.plan(styles,oppDanger,nearWall);const first=this.combo.shift();this.action[first]=true;this.comboDelay=.18+(1-this.difficulty)*.08}
        else{this.strafe*=-1;this.action.x=this.strafe*(.55+this.rng()*.35);this.action.y=(this.rng()-.5)*.28}
      }
      if(danger&&this.rng()<.20+.28*this.difficulty){this.combo.length=0;this.action={...EMPTY_INPUT,block:true,y:.42,x:this.strafe*.3}}
      if(!self.heldWeapon&&weapon&&Math.hypot(weapon.group.position.x-self.group.position.x,weapon.group.position.z-self.group.position.z)<1.28&&this.rng()<.4)this.action.pickup=true;
    }
    return{...this.action};
  }
}
const dist=(a,b)=>Math.hypot(a.group.position.x-b.group.position.x,a.group.position.z-b.group.position.z);
