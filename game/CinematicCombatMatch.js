import { THREE } from '../vendor/three.js';
import { CombatMatch } from './CombatMatch.js';
import { EMPTY_INPUT } from '../core/types.js';

export class CinematicCombatMatch extends CombatMatch{
  constructor(config,audio,hooks={}){super(config,audio,hooks);this.postFinishElapsed=0;this.introDuration=1.22;this.introTime=this.introDuration;this.resultDelay=1.75;this.resultSent=false;this.resultTimer=null;}
  sendResult(){if(this.resultSent)return;this.resultSent=true;clearTimeout(this.resultTimer);this.resultTimer=null;this.hooks.onEnd?.();}
  update(dt,humanInputs=[]){
    if(this.introTime>0){this.introTime=Math.max(0,this.introTime-dt);const p=1-this.introTime/this.introDuration;this.elapsed+=dt;this.arena.update(dt,this.elapsed);for(const f of this.fighters){f.setIntroPose?.(p);const target=this.closestTarget(f);f.update(dt,{...EMPTY_INPUT},target,this.arena);}if(this.introTime<=0)this.fighters.forEach(f=>f.setIntroPose?.(-1));return;}
    if(!this.finished)return super.update(dt,humanInputs);
    this.postFinishElapsed+=dt;this.elapsed+=dt;this.arena.update(dt,this.elapsed);for(const f of this.fighters){const target=this.closestTarget(f);f.update(dt,{...EMPTY_INPUT},target,this.arena);}if(this.postFinishElapsed>=this.resultDelay)this.sendResult();
  }
  resolveAttack(ev){
    const attacker=ev?.fighter,target=attacker?this.closestTarget(attacker):null,wasConnected=!!attacker?.attackConnected;super.resolveAttack(ev);
    if(ev?.type==='special'&&attacker&&target&&!wasConnected&&attacker.attackConnected){const style=Math.max(0,attacker.specialIndex??0);target.triggerFinisherReaction?.(style,attacker.def.id);this.cinematic=[attacker,target];this.cinematicTime=Math.max(this.cinematicTime,1.55);this.cameraShake=Math.max(this.cameraShake,1.02);}
  }
  resolveHazards(){
    if(this.config.mode==='training')return;const hazard=this.ruleHazard();
    if(hazard==='subway'&&this.arena.trainHazardAt){for(const f of this.fighters){if(f.ko||((f._trainSafeUntil??0)>this.elapsed))continue;if(!this.arena.trainHazardAt(f.group.position.x,f.group.position.z))continue;const attacker=this.fighters.find(x=>x!==f&&!x.ko)??f;const side=Math.sign(f.group.position.z)||1;const result=f.receiveHit(46,'environment',attacker,0,-side);f._trainSafeUntil=this.elapsed+.9;this.emit(result.ko?'TRACK KNOCKOUT':'TRAIN IMPACT');this.cameraShake=Math.max(this.cameraShake,1.15);this.hitStop=Math.max(this.hitStop,.08);this.audio.environment?.();this.arena.react?.(1.35);this.hooks.onImpact?.(new THREE.Vector3(f.group.position.x,1.25,f.group.position.z),'environment',false,attacker,f);}return;}
    super.resolveHazards();
  }
  finish(winner){
    if(this.finished)return;this.finished=true;this.winner=winner;const loser=this.fighters.find(f=>f!==winner&&f.ko)||this.fighters.find(f=>f!==winner)||null;if(winner){winner.state='Victory';winner.stateTime=0;winner.momentum=100;}this.audio.win?.();this.postFinishElapsed=0;this.resultSent=false;clearTimeout(this.resultTimer);this.resultTimer=setTimeout(()=>this.sendResult(),Math.ceil((this.resultDelay+.35)*1000));
    this.hooks.onKO?.(winner,loser,this);
    if(winner&&loser){this.cinematic=[winner,loser];this.cinematicTime=1.72;this.cameraShake=Math.max(this.cameraShake,.42);}
  }
  dispose(){clearTimeout(this.resultTimer);this.resultTimer=null;super.dispose();}
}
