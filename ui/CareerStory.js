import { CIRCUIT } from '../data/career.js';
import { getFighterDef } from '../data/roster.js';
import { getArenaDef } from '../data/arenas.js';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const beats=[
  ['PROVE YOU BELONG','No reputation yet. Win clean enough that the room remembers you.'],
  ['SET THE PACE','Your next opponent brings speed. Make the fight happen on your terms.'],
  ['HANDLE PRESSURE','The crowd is closer and every mistake is louder. Stay composed.'],
  ['USE THE ROOM','This is where the circuit stops pretending the environment is decoration.'],
  ['SURVIVE THE PLATFORM','Control the centre and do not let the edge decide the fight for you.'],
  ['BREAK THE FRAME','The walls are now part of the rules. Pressure matters more than comfort.'],
  ['NO WAY OUT','The cage strips the fight down to timing, defence and damage.'],
  ['TAKE THE CIRCUIT','One final room. One final opponent. Leave as the name above everyone else.']
];
export class CareerStory{
  constructor(ui){this.ui=ui;this.root=ui.root;this.observer=new MutationObserver(()=>this.sync());this.observer.observe(this.root,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});this.sync()}
  sync(){if(!this.root.classList.contains('career'))return;const btn=this.root.querySelector('#career-fight');if(!btn||btn.dataset.storyBound==='1'||!this.ui.career)return;btn.dataset.storyBound='1';const replacement=btn.cloneNode(true);replacement.dataset.storyBound='1';replacement.textContent='FIGHT NIGHT';btn.replaceWith(replacement);replacement.addEventListener('click',()=>this.open())}
  open(){
    const c=this.ui.career,b=CIRCUIT[c?.circuitIndex];if(!c||!b)return;const player=getFighterDef(c.fighterId),opponent=getFighterDef(b.opponent),arena=getArenaDef(b.arenaId),beat=beats[c.circuitIndex]||['NEXT FIGHT',b.message];
    const overlay=document.createElement('div');overlay.className='career-story-overlay';overlay.innerHTML=`<div class="career-story-backdrop"></div><section class="career-story-card" role="dialog" aria-modal="true" aria-label="Fight night preview"><button class="career-story-close" aria-label="Close">×</button><div class="career-story-kicker">TWEAKIN CIRCUIT // BOUT ${String(c.circuitIndex+1).padStart(2,'0')}</div><div class="career-story-title">${esc(b.title)}</div><div class="career-story-vs"><article style="--fighter:#${player.palette.accent.toString(16).padStart(6,'0')}"><small>YOUR FIGHTER</small><strong>${esc(player.shortName)}</strong><span>${esc(player.archetype)}</span></article><i>VS</i><article style="--fighter:#${opponent.palette.accent.toString(16).padStart(6,'0')}"><small>OPPONENT</small><strong>${esc(opponent.shortName)}</strong><span>${esc(opponent.archetype)}</span></article></div><div class="career-story-objective"><small>${esc(beat[0])}</small><p>${esc(beat[1])}</p></div><div class="career-story-meta"><span>${esc(arena.name)}</span><span>${esc(b.matchType)}</span><span>£${b.reward}</span><span>+${b.dev} DP</span></div><div class="career-story-actions"><button class="secondary-action story-cancel">NOT YET</button><button class="primary-action story-start">ENTER THE FIGHT</button></div></section>`;
    document.body.appendChild(overlay);requestAnimationFrame(()=>overlay.classList.add('show'));const close=()=>{overlay.classList.remove('show');setTimeout(()=>overlay.remove(),180)};overlay.querySelector('.career-story-close').onclick=close;overlay.querySelector('.story-cancel').onclick=close;overlay.querySelector('.career-story-backdrop').onclick=close;overlay.querySelector('.story-start').onclick=()=>{close();this.ui.game.audio.ui(true);setTimeout(()=>this.ui.startCareerFight(),80)};
  }
  destroy(){this.observer.disconnect()}
}
