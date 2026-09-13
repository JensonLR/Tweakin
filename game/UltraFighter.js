import { DetailedFighter } from './DetailedFighter.js';
import { applyFighterSurface } from './SurfaceDetail.js';
export class UltraFighter extends DetailedFighter{
  constructor(def,slot){super(def,slot);applyFighterSurface(this.group,def.id);}
}
