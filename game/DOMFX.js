export class DOMFX{
  constructor(){this.el=document.querySelector('#fx-overlay');this.timer=0;this.finishTimer=0;if(this.el)this.el.classList.add('domfx');}
  intro(match){
    if(!this.el||!match?.fighters?.length)return;const a=match.fighters[0],b=match.fighters[1];
    this.el.innerHTML=`<div class="vs-intro cinematic-vs"><div class="vs-brand"><i></i><span>FIGHT WORLD</span></div><div class="vs-kicker">${match.arena.def.name}</div><div class="vs-portraits"><div class="vs-fighter vs-left" data-fid="${a.def.id}"><div class="vs-portrait"></div><div class="vs-name"><small>${a.def.archetype}</small><strong>${a.def.shortName}</strong></div></div><div class="vs-mark"><b>VS</b><em>${match.config.matchType}</em></div><div class="vs-fighter vs-right" data-fid="${b?.def.id??''}"><div class="vs-portrait"></div><div class="vs-name"><small>${b?.def.archetype??''}</small><strong>${b?.def.shortName??'?'}</strong></div></div></div><div class="vs-rule">NO EXCUSES // ${match.config.matchType}</div></div>`;
    this.el.classList.add('show-intro');navigator.vibrate?.([14,30,22]);setTimeout(()=>{this.el?.classList.remove('show-intro');setTimeout(()=>{if(this.el&&!this.el.querySelector('.ko-sting'))this.el.innerHTML=''},420)},1280);
  }
  hit(kind,blocked=false){if(!this.el)return;this.el.classList.remove('hit-light','hit-heavy','hit-special','hit-block');void this.el.offsetWidth;const heavy=['heavy','weapon','grapple','environment'].includes(kind);this.el.classList.add(blocked?'hit-block':kind==='special'?'hit-special':heavy?'hit-heavy':'hit-light');if(blocked)navigator.vibrate?.(7);else if(kind==='special')navigator.vibrate?.([28,18,40]);else if(heavy)navigator.vibrate?.(24);else navigator.vibrate?.(10);clearTimeout(this.timer);this.timer=setTimeout(()=>this.el?.classList.remove('hit-light','hit-heavy','hit-special','hit-block'),kind==='special'?210:150)}
  finish(winner,loser,match){
    if(!this.el)return;clearTimeout(this.finishTimer);const w=winner?.def,l=loser?.def;if(!w)return;
    this.el.classList.remove('show-intro','show-ko');void this.el.offsetWidth;
    this.el.innerHTML=`<div class="ko-sting" data-winner="${w.id}"><div class="ko-slice ko-slice-a"></div><div class="ko-slice ko-slice-b"></div><div class="ko-copy"><small>${match?.config?.matchType??'FIGHT'} // ${match?.arena?.def?.name??''}</small><b>KNOCKOUT</b><strong>${w.shortName}</strong><em>${l?`DEFEATS ${l.shortName}`:'STANDS ALONE'}</em></div></div>`;
    this.el.classList.add('show-ko');navigator.vibrate?.([42,36,62]);
    this.finishTimer=setTimeout(()=>{this.el?.classList.remove('show-ko');setTimeout(()=>{if(this.el?.querySelector('.ko-sting'))this.el.innerHTML=''},260)},1120);
  }
  clear(){clearTimeout(this.timer);clearTimeout(this.finishTimer);if(this.el){this.el.innerHTML='';this.el.className='domfx'}}
}
