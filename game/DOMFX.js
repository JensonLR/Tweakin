export class DOMFX{
  constructor(){this.el=document.querySelector('#fx-overlay');this.timer=0;if(this.el)this.el.classList.add('domfx');}
  intro(match){if(!this.el||!match?.fighters?.length)return;const a=match.fighters[0],b=match.fighters[1];this.el.innerHTML=`<div class="vs-intro"><div class="vs-kicker">${match.arena.def.name}</div><div class="vs-row"><span>${a.def.shortName}</span><b>VS</b><span>${b?.def.shortName??'?'}</span></div><div class="vs-rule">${match.config.matchType}</div></div>`;this.el.classList.add('show-intro');setTimeout(()=>{this.el?.classList.remove('show-intro');setTimeout(()=>{if(this.el)this.el.innerHTML=''},450)},1050)}
  hit(kind,blocked=false){if(!this.el)return;this.el.classList.remove('hit-light','hit-heavy','hit-special','hit-block');void this.el.offsetWidth;this.el.classList.add(blocked?'hit-block':kind==='special'?'hit-special':(['heavy','weapon','grapple','environment'].includes(kind)?'hit-heavy':'hit-light'));clearTimeout(this.timer);this.timer=setTimeout(()=>this.el?.classList.remove('hit-light','hit-heavy','hit-special','hit-block'),150)}
  clear(){if(this.el){this.el.innerHTML='';this.el.className='domfx'}}
}
