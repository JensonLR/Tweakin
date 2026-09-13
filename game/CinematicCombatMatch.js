import { CombatMatch } from './CombatMatch.js';
import { EMPTY_INPUT } from '../core/types.js';

export class CinematicCombatMatch extends CombatMatch{
  constructor(config,audio,hooks={}){super(config,audio,hooks);this.postFinishElapsed=0;}
  update(dt,humanInputs=[]){
    if(!this.finished)return super.update(dt,humanInputs);
    this.postFinishElapsed+=dt;this.elapsed+=dt;this.arena.update(dt,this.elapsed);
    for(const f of this.fighters){const target=this.closestTarget(f);f.update(dt,{...EMPTY_INPUT},target,this.arena);}
  }
  finish(winner){
    if(this.finished)return;const loser=this.fighters.find(f=>f!==winner&&f.ko)||this.fighters.find(f=>f!==winner)||null;super.finish(winner);
    if(winner&&loser){this.cinematic=[winner,loser];this.cinematicTime=1.45;this.cameraShake=Math.max(this.cameraShake,.38);winner.momentum=100;}
  }
}
