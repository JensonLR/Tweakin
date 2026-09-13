import { DetailedArena } from './DetailedArena.js';
import { applyArenaSurface } from './SurfaceDetail.js';
export class UltraArena extends DetailedArena{
  constructor(def){super(def);applyArenaSurface(this.group);}
}
