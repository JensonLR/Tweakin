export class UIShowcase{
  constructor(root,game){this.root=root;this.game=game;this.lastClass='';this.lastId='';this.onClick=e=>{const row=e.target.closest?.('[data-rid]');if(row?.dataset?.rid)this.focus(row.dataset.rid);};root.addEventListener('click',this.onClick,true);this.observer=new MutationObserver(()=>this.sync());this.observer.observe(root,{attributes:true,attributeFilter:['class'],childList:true,subtree:true});this.sync();}
  focus(id){if(!id||!this.root.classList.contains('roster'))return;this.lastId=id;this.game.menuBackdrop?.focusFighter?.(id);document.documentElement.style.setProperty('--showcase-accent',this.accentFor(id));}
  accentFor(id){const row=this.root.querySelector(`[data-rid="${CSS.escape(id)}"]`);if(!row)return '#e3202b';return getComputedStyle(row).getPropertyValue('--accent')||'#e3202b';}
  sync(){const cls=this.root.className;if(cls!==this.lastClass){this.lastClass=cls;if(!this.root.classList.contains('roster')){this.lastId='';this.game.menuBackdrop?.clearFocus?.();document.documentElement.style.removeProperty('--showcase-accent');return;}}
    if(this.root.classList.contains('roster')){const row=this.root.querySelector('[data-rid].active')||this.root.querySelector('[data-rid]');const id=row?.dataset?.rid;if(id&&id!==this.lastId)this.focus(id);}
  }
  destroy(){this.observer?.disconnect();this.root.removeEventListener('click',this.onClick,true);this.game.menuBackdrop?.clearFocus?.();}
}
