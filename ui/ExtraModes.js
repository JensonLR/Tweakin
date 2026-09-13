import { ROSTER } from '../data/roster.js';
import { ARENAS } from '../data/arenas.js';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pct=v=>`${Math.max(0,Math.min(100,v))}%`;

export class ExtraModes{
  constructor(ui){this.ui=ui;this.root=ui.root;this.installHudHook();this.observer=new MutationObserver(()=>this.sync());this.observer.observe(this.root,{attributes:true,attributeFilter:['class'],childList:true,subtree:true});this.sync();}
  installHudHook(){const original=this.ui.game.hooks.onHud;this.ui.game.hooks.onHud=m=>{original?.(m);this.onHud(m)}}
  onHud(match){if(match?.config?.mode!=='chaos'||match.fighters.length<3)return;let shell=this.root.querySelector('#chaos-hud');if(!shell){shell=document.createElement('div');shell.id='chaos-hud';shell.className='chaos-hud';this.root.querySelector('#hud')?.appendChild(shell)}if(!shell)return;const extras=match.fighters.slice(2);shell.innerHTML=extras.map((f,i)=>`<div class="chaos-chip ${f.ko?'ko':''}"><div class="chaos-name">P${i+3} • ${esc(f.def.shortName)}</div><div class="chaos-bar"><i style="width:${pct(f.physical)}"></i><b style="width:${pct(f.consciousness)}"></b></div><span>${f.ko?'KO':f.state}</span></div>`).join('')}
  sync(){if(this.root.classList.contains('menu'))this.injectMenu()}
  injectMenu(){const stack=this.root.querySelector('.menu-stack');if(!stack||stack.querySelector('[data-extra-mode]'))return;
    const credits=stack.querySelector('[data-nav="credits"]');const wrap=document.createDocumentFragment();
    [['local','Local Versus'],['chaos','4-Way Chaos'],['guide','Fight Guide']].forEach(([id,label])=>{const b=document.createElement('button');b.className='menu-btn interactive extra-mode-btn';b.dataset.extraMode=id;b.textContent=label;b.onclick=()=>{this.ui.game.audio.ui(true);id==='local'?this.renderLocal():id==='chaos'?this.renderChaos():this.renderGuide()};wrap.appendChild(b)});
    if(credits)stack.insertBefore(wrap,credits);else stack.appendChild(wrap);
  }
  fighterPickMarkup(selected,group){return `<div class="grid fighter-grid extra-fighter-grid" id="${group}">${this.ui.fighterCards(selected)}</div>`}
  bindPicker(sel,onPick){this.root.querySelector(sel)?.querySelectorAll('[data-fighter]').forEach(b=>b.onclick=()=>{this.root.querySelector(sel).querySelectorAll('[data-fighter]').forEach(x=>x.classList.toggle('active',x===b));onPick(b.dataset.fighter);this.ui.game.audio.ui(true)})}
  arenaOptions(selected='underpass'){return ARENAS.map(a=>`<option value="${a.id}" ${a.id===selected?'selected':''}>${esc(a.name)} — ${esc(a.archetype)}</option>`).join('')}
  renderLocal(){
    let p1='trump',p2='gigachad';
    this.ui.set(`<div class="panel-screen extra-mode-screen">${this.ui.pageHead('Local Versus','Two players on one device. P1 uses WASD + J/K/L/I/U/O. P2 uses arrows + numpad.')}<div class="content-scroll"><div class="battle-grid"><div><div class="section-label">PLAYER ONE</div>${this.fighterPickMarkup(p1,'local-p1')}</div><div><div class="section-label">PLAYER TWO</div>${this.fighterPickMarkup(p2,'local-p2')}</div></div><div class="detail-panel setup-panel"><div class="setup-row"><label>Venue<select id="local-arena">${this.arenaOptions()}</select></label><label>Rules<select id="local-rule"><option>One on One</option><option>Ring Out</option><option>Demolition</option><option>Subway</option><option>Window</option><option>Cage</option><option>Inferno</option></select></label><div></div></div><div class="action-row"><button id="local-start" class="primary-action interactive">START LOCAL FIGHT</button></div></div></div></div>`,'local-versus');
    this.ui.bindBack();this.bindPicker('#local-p1',id=>p1=id);this.bindPicker('#local-p2',id=>p2=id);
    this.root.querySelector('#local-start').onclick=()=>{if(p1===p2)p2=ROSTER.find(f=>f.id!==p1)?.id||'gigachad';this.ui.startFight({mode:'local',matchType:this.root.querySelector('#local-rule').value,arenaId:this.root.querySelector('#local-arena').value,fighters:[p1,p2],humanSlots:[0,1],aiDifficulty:.1,roundSeconds:180})};
  }
  renderChaos(){
    let player='gigachad';
    this.ui.set(`<div class="panel-screen extra-mode-screen">${this.ui.pageHead('4-Way Chaos','One player, three AI opponents, one room. Last fighter conscious wins.')}<div class="content-scroll"><div class="section-label">CHOOSE YOUR FIGHTER</div>${this.fighterPickMarkup(player,'chaos-player')}<div class="detail-panel setup-panel"><div class="setup-row"><label>Venue<select id="chaos-arena">${this.arenaOptions('scrapline')}</select></label><label>AI<select id="chaos-ai"><option value=".46">Normal</option><option value=".67" selected>Hard</option><option value=".86">Brutal</option></select></label><div></div></div><div class="action-row"><button id="chaos-start" class="primary-action interactive">START 4-WAY FIGHT</button></div></div></div></div>`,'chaos');
    this.ui.bindBack();this.bindPicker('#chaos-player',id=>player=id);
    this.root.querySelector('#chaos-start').onclick=()=>{const pool=ROSTER.filter(f=>f.id!==player).sort(()=>Math.random()-.5).slice(0,3);this.ui.startFight({mode:'chaos',matchType:'4-Way Chaos',arenaId:this.root.querySelector('#chaos-arena').value,fighters:[player,...pool.map(f=>f.id)],humanSlots:[0],aiDifficulty:Number(this.root.querySelector('#chaos-ai').value),roundSeconds:240})};
  }
  renderGuide(){
    const cards=[
      ['MOVE & PRESSURE','Move with WASD, stick or gamepad. Hold Run to close distance. Lock-on is automatic to the nearest live opponent.'],
      ['LIGHT / HEAVY','Light attacks are fast combo starters. Heavy attacks trade speed for damage, knockdown chance and environmental pressure.'],
      ['GRAPPLE','Grab at close range to beat passive blocking. Grapples scale from upper-body strength and wrestling-oriented styles.'],
      ['BLOCK / PARRY','Hold Block to reduce strike damage. Tap Block just before impact for a short parry window that stuns the attacker and builds momentum.'],
      ['EVADE','Hold Block + Run while moving sideways to perform an evasive step. It has a brief invulnerability window and a cooldown.'],
      ['MOMENTUM','Land attacks, chain combos and defend well to fill Momentum. At 100, trigger Special for your fighter’s signature finisher sequence.'],
      ['WEAPONS','Use Weapon near bottles, pipes, bats or brooms. Weapons add reach and impact but can break.'],
      ['ENVIRONMENT','Heavy attacks, grapples and specials can drive opponents into walls and breakables. Some venues have ring-out, glass, subway or inferno hazards.']
    ];
    this.ui.set(`<div class="panel-screen">${this.ui.pageHead('Fight Guide','The systems that turn button presses into a real fight.')}<div class="content-scroll"><div class="grid guide-grid">${cards.map(([h,p],i)=>`<article class="card guide-card"><div class="section-label">0${i+1}</div><h3>${h}</h3><p>${p}</p></article>`).join('')}</div><div class="detail-panel" style="margin-top:16px"><div class="section-label">KEYBOARD</div><p>P1: WASD move • J light • K heavy • L grapple • I block • Left Shift run • U special • O weapon. P2: arrows move • numpad controls. Gamepads and mobile touch controls are also supported.</p></div></div></div>`,'guide');this.ui.bindBack();
  }
  destroy(){this.observer.disconnect()}
}
