import { THREE } from '../vendor/three.js';
import { getFighterDef } from '../data/roster.js';
import { getArenaDef } from '../data/arenas.js';
import { UltraArena } from './UltraArena.js';
import { EliteFighter } from './EliteFighter.js';
import { FighterAI } from './AI.js';
import { EMPTY_INPUT } from '../core/types.js';
import { clamp } from '../core/math.js';

export class CombatMatch {
  constructor(config,audio,hooks={}){
    this.config=config;this.audio=audio;this.hooks=hooks;this.scene=new THREE.Scene();this.scene.background=new THREE.Color(0x080809);this.scene.fog=new THREE.FogExp2(getArenaDef(config.arenaId).fog,.035);
    this.arena=new UltraArena(getArenaDef(config.arenaId));this.scene.add(this.arena.group);this.fighters=[];this.ais=[];this.elapsed=0;this.remaining=config.roundSeconds??180;this.frame=0;this.finished=false;this.winner=null;this.cameraShake=0;this.hitStop=0;this.cinematic=null;this.cinematicTime=0;this.messageCooldown=0;this.spawnFighters();
  }
  spawnFighters(){
    const ids=this.config.fighters?.length?this.config.fighters:['trump','gigachad'];const count=Math.min(ids.length,4),s=this.arena.def.size*.2;
    for(let i=0;i<count;i++){
      const f=new EliteFighter(getFighterDef(ids[i]),i),ang=count===2?(i===0?Math.PI:-Math.PI*.02):(i/count*Math.PI*2);f.group.position.set(Math.sin(ang)*s,0,Math.cos(ang)*s);f.yaw=i===0?0:Math.PI;f.group.rotation.y=f.yaw;
      const ov=this.config.fighterOverrides?.[i];if(ov?.stats)f.def={...f.def,stats:{...f.def.stats,...ov.stats}};if(ov?.styles)f.def={...f.def,styles:[...ov.styles]};this.fighters.push(f);this.scene.add(f.group);const human=this.config.humanSlots?.includes(i);this.ais[i]=human?null:new FighterAI(clamp(this.config.aiDifficulty??.62,.05,1),`${this.config.arenaId}-${f.def.id}-${i}`)
    }
  }
  closestTarget(f){let best=null,bd=1e9;for(const t of this.fighters){if(t===f||t.ko)continue;const d=Math.hypot(t.group.position.x-f.group.position.x,t.group.position.z-f.group.position.z);if(d<bd){bd=d;best=t}}return best}
  update(dt,humanInputs=[]){
    if(this.finished)return;if(this.hitStop>0){this.hitStop=Math.max(0,this.hitStop-dt);return}this.frame++;this.elapsed+=dt;this.remaining=Math.max(0,this.remaining-dt);this.cameraShake=Math.max(0,this.cameraShake-dt*2.8);this.messageCooldown=Math.max(0,this.messageCooldown-dt);this.arena.update(dt,this.elapsed);const attackEvents=[];
    for(let i=0;i<this.fighters.length;i++){const f=this.fighters[i],target=this.closestTarget(f),input=this.ais[i]?this.ais[i].update(dt,f,this.fighters,this.arena):(humanInputs[i]??{...EMPTY_INPUT});if(input.pickup&&!f.heldWeapon){const w=this.arena.nearestWeapon(f.group.position.x,f.group.position.z);if(w){f.setWeaponVisual(this.arena.takeWeapon(w));this.audio.pickup?.();this.emit(`${f.def.shortName} PICKS UP ${f.heldWeapon?.toUpperCase()}`)}}const ev=f.update(dt,input,target,this.arena);if(ev)attackEvents.push(ev)}
    this.resolveBodySeparation();for(const ev of attackEvents)this.resolveAttack(ev);this.resolveHazards();this.checkEnd();
  }
  resolveBodySeparation(){for(let i=0;i<this.fighters.length;i++)for(let j=i+1;j<this.fighters.length;j++){const a=this.fighters[i],b=this.fighters[j];if(a.ko||b.ko)continue;let dx=b.group.position.x-a.group.position.x,dz=b.group.position.z-a.group.position.z,d=Math.hypot(dx,dz)||.001;const min=(a.radius+b.radius)*.75;if(d<min){const p=(min-d)*.5;dx/=d;dz/=d;a.group.position.x-=dx*p;a.group.position.z-=dz*p;b.group.position.x+=dx*p;b.group.position.z+=dz*p}}}
  resolveAttack(ev){
    const a=ev.fighter,t=this.closestTarget(a);if(!t)return;const dx=t.group.position.x-a.group.position.x,dz=t.group.position.z-a.group.position.z,d=Math.hypot(dx,dz);if(d>ev.range)return;const facing=Math.cos(Math.atan2(dx,dz)-a.yaw);if(facing<-.15)return;
    const ux=dx/(d||1),uz=dz/(d||1);let kind=ev.type,raw=a.attackDamage(kind);if(a.heldWeapon&&kind!=='grapple'&&kind!=='special'){kind='weapon';raw*=1.32}
    const defense=t.tryDefense?.(kind,a);if(defense?.evaded){a.markConnected();this.emit('EVADE');this.cameraShake=Math.max(this.cameraShake,.08);return}if(defense?.parried){a.markConnected();this.emit('PARRY');this.hitStop=.035;this.cameraShake=Math.max(this.cameraShake,.16);this.audio.impact?.('light',true);this.hooks.onImpact?.(new THREE.Vector3(t.group.position.x,1.55,t.group.position.z),'light',true,a,t);return}
    a.markConnected();const result=t.receiveHit(raw,kind,a,ux,uz);this.cameraShake=Math.max(this.cameraShake,kind==='special'?.95:kind==='heavy'||kind==='weapon'?.55:.26);this.hitStop=kind==='special'?.085:kind==='heavy'||kind==='grapple'?.045:.022;this.hooks.onImpact?.(new THREE.Vector3(t.group.position.x,1.45,t.group.position.z),kind,result.blocked,a,t);
    this.audio.impact?.(kind,result.blocked);if(result.blocked)this.emit('BLOCKED');else if(result.ko)this.emit('KNOCKOUT');else if(kind==='special'){const fin=a.def.finishers[0];this.emit(fin.name.toUpperCase());this.cinematic=[a,t];this.cinematicTime=1.25;this.hooks.onSpecial?.(a,fin.name)}else if(a.combo>2)this.emit(`${a.combo} HIT COMBO`);
    const wall=this.arena.environmentAnchor(t.group.position.x,t.group.position.z);if(wall&&(kind==='heavy'||kind==='grapple'||kind==='special')){const extra=t.receiveHit(8+raw*.18,'environment',a,ux,uz);this.arena.hitBreakable(wall.x,wall.z,kind==='special'?2:1);this.cameraShake=Math.max(this.cameraShake,.75);this.audio.environment?.();this.hooks.onImpact?.(new THREE.Vector3(wall.x,1.2,wall.z),'environment',false,a,t);if(extra.ko)this.emit('ENVIRONMENT KNOCKOUT')}if(a.heldWeapon&&kind==='weapon'&&Math.random()<.22){a.setWeaponVisual(null);this.emit('WEAPON BROKEN')}
  }
  resolveHazards(){const hazard=this.arena.def.hazard;if(hazard==='none')return;const s=this.arena.def.size*.48;for(const f of this.fighters){if(f.ko)continue;const edge=Math.max(Math.abs(f.group.position.x),Math.abs(f.group.position.z));if(edge<s*.92)continue;if((hazard==='ringout'||hazard==='glass')&&edge>s*.975){f.physical=0;f.consciousness=0;f.ko=true;f.setState('KO');this.emit(hazard==='glass'?'WINDOW BREAK':'RING OUT')}if(hazard==='subway'&&Math.abs(f.group.position.z)>s*.94&&Math.abs(f.group.position.x)<s*.28){f.receiveHit(42,'environment',this.fighters.find(x=>x!==f)??f,0,-Math.sign(f.group.position.z));this.emit('TRACK IMPACT')}if(hazard==='fire'&&edge>s*.94){f.physical=Math.max(0,f.physical-.08);f.consciousness=Math.max(0,f.consciousness-.12)}}}
  checkEnd(){const alive=this.fighters.filter(f=>!f.ko);if(alive.length<=1&&this.fighters.length>1){this.finish(alive[0]??null);return}if(this.remaining<=0){const sorted=[...this.fighters].sort((a,b)=>(b.physical+b.consciousness)-(a.physical+a.consciousness));this.finish(sorted[0]??null)}}
  finish(winner){if(this.finished)return;this.finished=true;this.winner=winner;if(winner)winner.state='Victory';this.audio.win?.();setTimeout(()=>this.hooks.onEnd?.(),500)}
  emit(text){if(this.messageCooldown>0&&text==='BLOCKED')return;this.messageCooldown=.12;this.hooks.onMessage?.(text,1)}
  tickCinematic(dt){if(this.cinematicTime>0){this.cinematicTime=Math.max(0,this.cinematicTime-dt);if(!this.cinematicTime)this.cinematic=null}}
  getCameraTarget(){const live=this.fighters.filter(f=>!f.ko),list=live.length?live:this.fighters;let x=0,z=0,y=1.25;for(const f of list){x+=f.group.position.x;z+=f.group.position.z}x/=Math.max(1,list.length);z/=Math.max(1,list.length);let spread=2.2;for(const a of list)for(const b of list)spread=Math.max(spread,Math.hypot(a.group.position.x-b.group.position.x,a.group.position.z-b.group.position.z));return{x,z,y,distance:clamp(5.1+spread*.58,5.2,9.5),cinematic:this.cinematic}}
  snapshots(){return this.fighters.map(f=>f.snapshot())}applySnapshots(snaps){for(let i=0;i<Math.min(snaps.length,this.fighters.length);i++)this.fighters[i].applySnapshot(snaps[i])}
  debug(fps,errors=[],network={}){return{mode:this.config.mode,arena:this.arena.def.id,fps,errors,network,frame:this.frame,remaining:this.remaining,finished:this.finished,fighters:this.fighters.map(f=>({id:f.def.id,state:f.state,physical:f.physical,consciousness:f.consciousness,momentum:f.momentum,x:f.group.position.x,z:f.group.position.z,ko:f.ko}))}}
  dispose(){this.arena.dispose();for(const f of this.fighters){f.group.traverse(o=>{o.geometry?.dispose?.();if(o.material){const ms=Array.isArray(o.material)?o.material:[o.material];for(const m of ms)m.dispose?.()}})}this.scene.clear()}
}
