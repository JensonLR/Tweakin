const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export class UXEnhancements{
  constructor(root,game){
    this.root=root;this.game=game;this.pending=0;this.observer=new MutationObserver(()=>this.schedule());this.observer.observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
    root.addEventListener('click',e=>{if(e.target.closest?.('[data-fighter],#arena-select,#type-select,#diff-select'))setTimeout(()=>this.enhanceBattle(),0)});
    root.addEventListener('change',e=>{if(e.target.matches?.('#arena-select,#type-select,#diff-select'))this.enhanceBattle()});this.schedule();
  }
  schedule(){if(this.pending)return;this.pending=requestAnimationFrame(()=>{this.pending=0;this.enhance()})}
  enhance(){this.enhanceMenu();this.enhanceBattle();this.enhanceResult();this.enhancePause()}
  enhanceMenu(){
    const screen=this.root.querySelector('.menu-screen'),stack=this.root.querySelector('.menu-stack');if(!screen||!stack)return;
    if(!screen.querySelector('.menu-keyart')){const art=document.createElement('div');art.className='menu-keyart';art.setAttribute('aria-hidden','true');screen.prepend(art)}
    if(!stack.querySelector('.menu-statusline')){const el=document.createElement('div');el.className='menu-statusline';el.innerHTML='<span>3D COMBAT</span><span>12 VENUES</span><span>CAREER</span><span>ONLINE P2P</span>';stack.insertBefore(el,stack.querySelector('.menu-btn'))}
  }
  selectedCard(grid){const a=this.root.querySelector(`${grid} .roster-card.active`);return a?.querySelector('h3')?.textContent?.trim()||'SELECT'}
  enhanceBattle(){
    const panel=this.root.querySelector('.setup-panel'),p1=this.root.querySelector('#p1-grid'),p2=this.root.querySelector('#p2-grid');if(!panel||!p1||!p2)return;let strip=this.root.querySelector('.matchup-strip');if(!strip){strip=document.createElement('div');strip.className='matchup-strip';panel.parentElement?.insertBefore(strip,panel)}
    const left=this.selectedCard('#p1-grid'),right=this.selectedCard('#p2-grid'),venue=this.root.querySelector('#arena-select')?.selectedOptions?.[0]?.textContent?.split(' — ')[0]||'VENUE',rule=this.root.querySelector('#type-select')?.value||'ONE ON ONE';strip.innerHTML=`<div class="matchup-side"><small>PLAYER</small><strong>${esc(left)}</strong></div><div class="matchup-mid"><b>VS</b><span>${esc(venue)} // ${esc(rule)}</span></div><div class="matchup-side right"><small>OPPONENT</small><strong>${esc(right)}</strong></div>`;
  }
  enhanceResult(){
    const card=this.root.querySelector('.result-card');if(!card||card.querySelector('.result-metrics'))return;const m=this.game?.match;if(!m?.fighters?.length)return;const rows=m.fighters.slice(0,2).map(f=>{const x=f.metrics||{};return `<div class="result-fighter"><span>${esc(f.def.shortName)}</span><b>${Math.round(x.damage||0)}</b><small>DAMAGE</small><em>${x.hits||0} hits // ${x.bestCombo||0} best combo // ${x.blocks||0} blocks</em></div>`}).join('');const box=document.createElement('div');box.className='result-metrics';box.innerHTML=rows;const actions=card.querySelector('.action-row');card.insertBefore(box,actions||null);
  }
  enhancePause(){const card=this.root.querySelector('.pause-card');if(!card||card.querySelector('.pause-context'))return;const m=this.game?.match;if(!m)return;const ctx=document.createElement('div');ctx.className='pause-context';ctx.textContent=`${m.fighters?.[0]?.def?.shortName||''} VS ${m.fighters?.[1]?.def?.shortName||''} // ${m.arena?.def?.name||''}`;card.insertBefore(ctx,card.querySelector('button'))}
  destroy(){this.observer.disconnect();if(this.pending)cancelAnimationFrame(this.pending)}
}
