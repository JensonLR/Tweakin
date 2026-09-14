import { ROSTER, getFighterDef } from '../data/roster.js';
import { ARENAS, getArenaDef } from '../data/arenas.js';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pct=v=>`${Math.max(0,Math.min(100,v))}%`;
const fmtTime=s=>`${Math.floor((s||0)/60)}:${String((s||0)%60).padStart(2,'0')}`;

export class ExtraModes{
  constructor(ui){this.ui=ui;this.root=ui.root;this.installHudHook();this.observer=new MutationObserver(()=>this.sync());this.observer.observe(this.root,{attributes:true,attributeFilter:['class'],childList:true,subtree:true});this.sync();}
  installHudHook(){const original=this.ui.game.hooks.onHud;this.ui.game.hooks.onHud=m=>{original?.(m);this.onHud(m)}}
  onHud(match){if(match?.config?.mode!=='chaos'||match.fighters.length<3)return;let shell=this.root.querySelector('#chaos-hud');if(!shell){shell=document.createElement('div');shell.id='chaos-hud';shell.className='chaos-hud';this.root.querySelector('#hud')?.appendChild(shell)}if(!shell)return;const extras=match.fighters.slice(2);shell.innerHTML=extras.map((f,i)=>`<div class="chaos-chip ${f.ko?'ko':''}"><div class="chaos-name">P${i+3} • ${esc(f.def.shortName)}</div><div class="chaos-bar"><i style="width:${pct(f.physical)}"></i><b style="width:${pct(f.consciousness)}"></b></div><span>${f.ko?'KO':f.state}</span></div>`).join('')}
  sync(){if(this.root.classList.contains('menu'))this.injectMenu();this.polishResult()}
  polishResult(){
    const card=this.root.querySelector('.result-card');if(!card||card.dataset.metrics==='1')return;const match=this.ui.game.match;if(!match?.fighters?.length)return;card.dataset.metrics='1';
    if(!match._historySaved){match._historySaved=true;this.ui.store.recordMatch?.(match).catch(()=>{})}
    const winner=match.winner??match.fighters[0],ordered=[winner,...match.fighters.filter(f=>f!==winner)],stats=document.createElement('div');stats.className='result-metrics';
    stats.innerHTML=ordered.slice(0,4).map((f,i)=>{const m=f.metrics??{},condition=Math.round((f.physical+f.consciousness)/2);return `<div class="result-metric-fighter ${f===winner?'winner':''}"><div class="result-metric-head"><span>${f===winner?'WINNER':`P${f.slot+1}`}</span><b>${esc(f.def.shortName)}</b></div><div class="result-metric-grid"><em>HITS<strong>${Math.round(m.hits||0)}</strong></em><em>DAMAGE<strong>${Math.round(m.damage||0)}</strong></em><em>BEST COMBO<strong>${Math.round(m.bestCombo||0)}</strong></em><em>DEFENCE<strong>${Math.round((m.blocks||0)+(m.parries||0)+(m.evades||0))}</strong></em><em>SPECIALS<strong>${Math.round(m.specials||0)}</strong></em><em>CONDITION<strong>${condition}%</strong></em></div></div>`}).join('');
    const actions=card.querySelector('.action-row');actions?card.insertBefore(stats,actions):card.appendChild(stats);
  }
  injectMenu(){const stack=this.root.querySelector('.menu-stack');if(!stack||stack.querySelector('[data-extra-mode]'))return;
    const credits=stack.querySelector('[data-nav="credits"]');const wrap=document.createDocumentFragment();
    [['local','Local Versus'],['chaos','4-Way Chaos'],['history','Fight History'],['guide','Fight Guide']].forEach(([id,label])=>{const b=document.createElement('button');b.className='menu-btn interactive extra-mode-btn';b.dataset.extraMode=id;b.textContent=label;b.onclick=()=>{this.ui.game.audio.ui(true);id==='local'?this.renderLocal():id==='chaos'?this.renderChaos():id==='history'?this.renderHistory():this.renderGuide()};wrap.appendChild(b)});
    if(credits)stack.insertBefore(wrap,credits);else stack.appendChild(wrap);
  }
  fighterPickMarkup(selected,group){return `<div class="grid fighter-grid extra-fighter-grid" id="${group}">${this.ui.fighterCards(selected)}</div>`}
  bindPicker(sel,onPick){this.root.querySelector(sel)?.querySelectorAll('[data-fighter]').forEach(b=>b.onclick=()=>{this.root.querySelector(sel).querySelectorAll('[data-fighter]').forEach(x=>x.classList.toggle('active',x===b));onPick(b.dataset.fighter);this.ui.game.audio.ui(true)})}
  arenaOptions(selected='underpass'){return ARENAS.map(a=>`<option value="${a.id}" ${a.id===selected?'selected':''}>${esc(a.name)} — ${esc(a.archetype)}</option>`).join('')}
  renderLocal(){
    let p1='trump',p2='gigachad',touchNote=this.ui.isTouch?'<div class="detail-panel local-device-note"><div class="section-label">PLAYER TWO INPUT</div><p>On a touch-only phone, Player 2 needs a connected gamepad or keyboard. One touchscreen cannot provide two independent virtual control sets without compromising the fight controls.</p></div>':'';
    this.ui.set(`<div class="panel-screen extra-mode-screen">${this.ui.pageHead('Local Versus','Two players on one device. P1 uses WASD + J/K/L/I/U/O. P2 uses arrows + numpad or a second gamepad.')}<div class="content-scroll">${touchNote}<div class="battle-grid"><div><div class="section-label">PLAYER ONE</div>${this.fighterPickMarkup(p1,'local-p1')}</div><div><div class="section-label">PLAYER TWO</div>${this.fighterPickMarkup(p2,'local-p2')}</div></div><div class="detail-panel setup-panel"><div class="setup-row"><label>Venue<select id="local-arena">${this.arenaOptions()}</select></label><label>Rules<select id="local-rule"><option>One on One</option><option>Ring Out</option><option>Demolition</option><option>Subway</option><option>Window</option><option>Cage</option><option>Inferno</option></select></label><div></div></div><div class="action-row"><button id="local-start" class="primary-action interactive">START LOCAL FIGHT</button></div></div></div></div>`,'local-versus');
    this.ui.bindBack();this.bindPicker('#local-p1',id=>p1=id);this.bindPicker('#local-p2',id=>p2=id);
    this.root.querySelector('#local-start').onclick=()=>{if(p1===p2)p2=ROSTER.find(f=>f.id!==p1)?.id||'gigachad';this.ui.startFight({mode:'local',matchType:this.root.querySelector('#local-rule').value,arenaId:this.root.querySelector('#local-arena').value,fighters:[p1,p2],humanSlots:[0,1],aiDifficulty:.1,roundSeconds:180})};
  }
  renderChaos(){
    let player='gigachad';
    this.ui.set(`<div class="panel-screen extra-mode-screen">${this.ui.pageHead('4-Way Chaos','One player, three AI opponents, one room. Last fighter conscious wins.')}<div class="content-scroll"><div class="section-label">CHOOSE YOUR FIGHTER</div>${this.fighterPickMarkup(player,'chaos-player')}<div class="detail-panel setup-panel"><div class="setup-row"><label>Venue<select id="chaos-arena">${this.arenaOptions('scrapline')}</select></label><label>AI<select id="chaos-ai"><option value=".46">Normal</option><option value=".67" selected>Hard</option><option value=".86">Brutal</option></select></label><div></div></div><div class="action-row"><button id="chaos-start" class="primary-action interactive">START 4-WAY FIGHT</button></div></div></div></div>`,'chaos');
    this.ui.bindBack();this.bindPicker('#chaos-player',id=>player=id);
    this.root.querySelector('#chaos-start').onclick=()=>{const pool=ROSTER.filter(f=>f.id!==player).sort(()=>Math.random()-.5).slice(0,3);this.ui.startFight({mode:'chaos',matchType:'4-Way Chaos',arenaId:this.root.querySelector('#chaos-arena').value,fighters:[player,...pool.map(f=>f.id)],humanSlots:[0],aiDifficulty:Number(this.root.querySelector('#chaos-ai').value),roundSeconds:240})};
  }
  async renderHistory(){
    const [history,profile]=await Promise.all([this.ui.store.history?.()??[],this.ui.store.profile?.()??{}]);
    const favourite=Object.entries(profile.byFighter||{}).sort((a,b)=>(b[1].matches||0)-(a[1].matches||0))[0],fav=favourite?getFighterDef(favourite[0]):null,winRate=profile.matches?Math.round(profile.wins/profile.matches*100):0;
    const rows=history.map(h=>{const player=h.fighters?.find(f=>f.slot===h.playerSlot)||h.fighters?.[0],opps=(h.fighters||[]).filter(f=>f.slot!==h.playerSlot).map(f=>f.name).join(' / '),arena=getArenaDef(h.arenaId);return `<article class="card history-card ${h.won?'history-win':'history-loss'}"><div class="history-top"><span>${h.won?'WIN':'LOSS'}</span><b>${esc(player?.name||'Fighter')} vs ${esc(opps||'Opponent')}</b><time>${new Date(h.at).toLocaleDateString()}</time></div><div class="history-meta"><span>${esc(arena?.name||h.arenaId)}</span><span>${esc(h.rule)}</span><span>${fmtTime(h.duration)}</span><span>${Math.round(player?.metrics?.damage||0)} DMG</span><span>${Math.round(player?.metrics?.bestCombo||0)} COMBO</span></div></article>`}).join('');
    this.ui.set(`<div class="panel-screen history-screen">${this.ui.pageHead('Fight History','Your last 50 completed fights and persistent profile records.')}<div class="content-scroll"><div class="grid profile-stat-grid"><article class="card profile-stat"><span>RECORD</span><strong>${profile.wins||0}-${profile.losses||0}</strong><small>${winRate}% win rate</small></article><article class="card profile-stat"><span>KNOCKOUT WINS</span><strong>${profile.kos||0}</strong><small>${profile.matches||0} fights</small></article><article class="card profile-stat"><span>CAREER DAMAGE</span><strong>${Math.round(profile.totalDamage||0)}</strong><small>${Math.round(profile.totalHits||0)} hits</small></article><article class="card profile-stat"><span>BEST COMBO</span><strong>${profile.bestCombo||0}</strong><small>${profile.specials||0} specials</small></article><article class="card profile-stat"><span>MOST USED</span><strong>${esc(fav?.shortName||'—')}</strong><small>${favourite?.[1]?.matches||0} fights</small></article></div><div class="history-list">${rows||'<div class="detail-panel"><h3>NO FIGHTS RECORDED</h3><p>Finish a Battle, Quick Fight, Career, Local Versus or 4-Way Chaos match and it will appear here.</p></div>'}</div>${history.length?'<div class="action-row"><button id="clear-history" class="secondary-action interactive">CLEAR FIGHT HISTORY</button></div>':''}</div></div>`,'history');
    this.ui.bindBack();this.root.querySelector('#clear-history')?.addEventListener('click',async()=>{if(confirm('Clear all TWEAKIN fight history and profile records?')){await this.ui.store.clearHistory();this.renderHistory()}});
  }
  renderGuide(){
    const cards=[
      ['MOVE & PRESSURE','Move with WASD, stick or gamepad. Hold Run to close distance. Lock-on is automatic to the nearest live opponent.'],
      ['LIGHT / HEAVY','Light attacks are fast combo starters. Heavy attacks trade speed for damage, knockdown chance and environmental pressure.'],
      ['GRAPPLE','Grab at close range to beat passive blocking. Grapples scale from upper-body strength and wrestling-oriented styles.'],
      ['BLOCK / PARRY','Hold Block to reduce strike damage. Tap Block just before impact for a short parry window that stuns the attacker and builds momentum.'],
      ['EVADE','Hold Block + Run while moving sideways to perform an evasive step. It has a brief invulnerability window and a cooldown.'],
      ['MOMENTUM','Land attacks, chain combos and defend well to fill Momentum. At 100, trigger Special for alternating fighter-specific finisher sequences.'],
      ['WEAPONS','Use Weapon near bottles, pipes, bats or brooms. Weapons add reach and impact but can break.'],
      ['ENVIRONMENT','Heavy attacks, grapples and specials can drive opponents into walls and breakables. Some venues have ring-out, glass, subway or inferno hazards.']
    ];
    this.ui.set(`<div class="panel-screen">${this.ui.pageHead('Fight Guide','The systems that turn button presses into a real fight.')}<div class="content-scroll"><div class="grid guide-grid">${cards.map(([h,p],i)=>`<article class="card guide-card"><div class="section-label">0${i+1}</div><h3>${h}</h3><p>${p}</p></article>`).join('')}</div><div class="detail-panel" style="margin-top:16px"><div class="section-label">KEYBOARD</div><p>P1: WASD move • J light • K heavy • L grapple • I block • Left Shift run • U special • O weapon. P2: arrows move • numpad controls. Gamepads and mobile touch controls are also supported.</p></div></div></div>`,'guide');this.ui.bindBack();
  }
  destroy(){this.observer.disconnect()}
}
