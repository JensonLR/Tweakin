import { EMPTY_INPUT } from '../core/types.js';
import { clamp, seeded, hash } from '../core/math.js';
export class FighterAI {
  difficulty;nextThink=0;action={...EMPTY_INPUT};rng;strafe=1;pressure=0;
  constructor(difficulty=.6,seed='ai'){this.difficulty=clamp(difficulty,.05,1);this.rng=seeded(hash(seed));}
  update(dt,self,targets,arena){
    this.nextThink-=dt;const live=targets.filter(t=>!t.ko&&t!==self);if(!live.length)return{...EMPTY_INPUT};const target=live.sort((a,b)=>dist(self,a)-dist(self,b))[0],d=dist(self,target);
    this.pressure=clamp(this.pressure+dt*(d<1.6?.16:-.08),0,1);
    if(this.nextThink<=0){
      this.nextThink=.055+(1-this.difficulty)*.18+this.rng()*.07;this.action={...EMPTY_INPUT};const danger=self.danger(),oppDanger=target.danger(),nearWall=!!arena.environmentAnchor(target.group.position.x,target.group.position.z),styles=self.def.styles||[];
      if(self.momentum>=100&&this.rng()<.58+.30*this.difficulty){this.action.taunt=true;return this.action}
      if(target.state==='Attack'&&target.attackType&&d<1.75){
        const read=.22+this.difficulty*.66,roll=this.rng();if(roll<read*.48){this.action.block=true;return this.action}if(roll<read*.74&&d<1.4){this.action.block=true;return this.action}if(roll<read){this.action.block=true;this.action.run=true;this.action.x=this.strafe;this.strafe*=-1;return this.action}
      }
      if(d>2.2){this.action.y=-1;this.action.x=(this.rng()-.5)*.42;this.action.run=d>4||this.pressure<.25}
      else if(d<.68){
        const r=this.rng();if(r<.18){this.action.y=.8;this.action.x=this.strafe}else if(styles.includes('Wrestling')&&r<.58)this.action.grapple=true;else if(r<.45+.28*this.difficulty)this.action.light=true;else this.action.block=true;
      }else{
        const r=this.rng(),aggression=.34+this.difficulty*.36;if(oppDanger&&r<aggression*.58)this.action.heavy=true;else if(nearWall&&r<aggression*.67)this.action.grapple=true;else if(styles.includes('Kickboxing')&&r<.35)this.action.heavy=true;else if(styles.includes('Martial Arts')&&r<.42)this.action.light=true;else if(styles.includes('Wrestling')&&r<.4)this.action.grapple=true;else if(r<.32)this.action.light=true;else if(r<.54)this.action.heavy=true;else if(r<.72)this.action.grapple=true;else{this.strafe*=-1;this.action.x=this.strafe;this.action.y=-.15}
      }
      if(danger&&this.rng()<.22+.22*this.difficulty){this.action.block=true;this.action.y=.48}
      const weapon=arena.nearestWeapon(self.group.position.x,self.group.position.z);if(!self.heldWeapon&&weapon&&this.rng()<.18+.25*this.difficulty)this.action.pickup=true;if(self.heldWeapon&&d<1.55&&this.rng()<.52)this.action.heavy=true;
    }
    return{...this.action};
  }
}
const dist=(a,b)=>Math.hypot(a.group.position.x-b.group.position.x,a.group.position.z-b.group.position.z);
