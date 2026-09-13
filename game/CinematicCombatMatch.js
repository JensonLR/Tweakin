import { CombatMatch } from './CombatMatch.js';
import { EMPTY_INPUT } from '../core/types.js';

export class CinematicCombatMatch extends CombatMatch{
  constructor(config,audio,hooks={}){super(config,audio,hooks);this.postFinishElapsed=0;this.introTime=1.05;this.resultDelay=1.65;this.resultSent=false;}
  update(dt,humanInputs=[]){
    if(this.introTime>0){this.introTime=Math.max(0,this.introTime-dt);this.elapsed+=dt;this.arena.update(dt,this.elapsed);for(const f of this.fighters){const target=this.closestTarget(f);f.update(dt,{...EMPTY_INPUT},target,this.arena);}return;}
    if(!this.finished)return super.update(dt,humanInputs);
    this.postFinishElapsed+=dt;this.elapsed+=dt;this.arena.update(dt,this.elapsed);for(const f of this.fighters){const target=this.closestTarget(f);f.update(dt,{...EMPTY_INPUT},target,this.arena);}if(!this.resultSent&&this.postFinishElapsed>=this.resultDelay){this.resultSent=true;this.hooks.onEnd?.();}
  }
  finish(winner){
    if(this.finished)return;this.finished=true;this.winner=winner;const loser=this.fighters.find(f=>f!==winner&&f.ko)||this.fighters.find(f=>f!==winner)||null;if(winner){winner.state='Victory';winner.stateTime=0;winner.momentum=100;}this.audio.win?.();this.postFinishElapsed=0;this.resultSent=false;
    if(winner&&loser){this.cinematic=[winner,loser];this.cinematicTime=1.6;this.cameraShake=Math.max(this.cameraShake,.42);}
  }
}
