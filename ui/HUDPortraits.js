import { ROSTER } from '../data/roster.js';

const byName=new Map(ROSTER.flatMap(f=>[[f.shortName.toUpperCase(),f.id],[f.name.toUpperCase(),f.id]]));
export class HUDPortraits{
  constructor(root){this.root=root;this.raf=0;this.observer=new MutationObserver(()=>this.schedule());this.observer.observe(root,{subtree:true,childList:true,characterData:true});this.sync();}
  schedule(){if(this.raf)return;this.raf=requestAnimationFrame(()=>{this.raf=0;this.sync()})}
  sync(){
    this.root.querySelectorAll('.hud-fighter').forEach(el=>{const name=el.querySelector('.hud-name')?.textContent?.trim().toUpperCase();if(!name)return;const id=byName.get(name);if(id)el.dataset.portrait=id;});
  }
  destroy(){this.observer?.disconnect();if(this.raf)cancelAnimationFrame(this.raf)}
}
