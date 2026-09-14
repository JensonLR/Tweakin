import { THREE } from '../vendor/three.js';
import { loadAuthoredCharacter, authoredCharacterStatus } from './AuthoredCharacter.js';
import { mapCombatAnimations } from './AnimationContract.js';

const ONE_SHOTS=new Set(['light','heavy','grapple','special','hit','knockdown','getup','ko','victory']);

export class ImportedCombatVisual{
  constructor(fighter){
    this.f=fighter;this.root=null;this.mixer=null;this.actions={};this.active='';this.ready=false;this.loading=false;this.status=authoredCharacterStatus(fighter.def.id);this.init();
  }
  async init(){
    if(!this.status.ready){
      this.f.importedVisualReady=false;
      this.f.importedVisualPath=null;
      this.f.importedVisualStatus=this.status.status;
      return;
    }
    this.loading=true;
    try{
      const loaded=await loadAuthoredCharacter(this.f.def.id,{mobile:matchMedia('(pointer:coarse)').matches||innerWidth<900,requireCombatReady:true});
      if(!loaded)throw new Error('authored asset failed combat-readiness validation');
      this.root=loaded.root;
      this.root.rotation.y+=Math.PI;
      this.f.group.add(this.root);
      this.mixer=new THREE.AnimationMixer(this.root);
      const mapped=mapCombatAnimations(loaded.animations);
      for(const [key,clip] of Object.entries(mapped))if(clip)this.actions[key]=this.mixer.clipAction(clip);
      if(!this.actions.idle)throw new Error('idle clip missing after validation');
      this.f.group.traverse(o=>{if(o.isMesh&&this.root!==o&&!this.root.getObjectById(o.id))o.visible=false});
      this.ready=true;
      this.f.importedVisualReady=true;
      this.f.importedVisualPath=loaded.asset.path;
      this.f.importedVisualStatus='ready';
      this.f.importedVisualMissingClips=[];
      this.play('idle',0);
    }catch(e){
      console.warn(`[TWEAKIN] authored combat visual rejected: ${this.f.def.id}`,e);
      this.disposeRoot();
      this.f.importedVisualReady=false;
      this.f.importedVisualStatus='fallback';
    }finally{this.loading=false;}
  }
  desired(){
    const f=this.f;
    if(f.state==='KO')return'ko';
    if(f.state==='Victory')return'victory';
    if(f.state==='Knockdown'||f.state==='Ground')return'knockdown';
    if(f.state==='GetUp')return'getup';
    if(f.state==='Stun')return'hit';
    if(f.state==='Block')return'block';
    if(f.state==='Attack')return f.attackType||'light';
    if(f.state==='Run')return'run';
    if(f.state==='Move')return'walk';
    return'idle';
  }
  play(key,fade=.08){
    const next=this.actions[key]||this.actions.idle;
    if(!next||this.active===key)return;
    const prev=this.actions[this.active];
    next.enabled=true;
    next.reset();
    next.setEffectiveWeight(1);
    next.setEffectiveTimeScale(key==='special'?.92:key==='heavy'?.96:key==='hit'?1.12:1);
    next.setLoop(ONE_SHOTS.has(key)?THREE.LoopOnce:THREE.LoopRepeat,Infinity);
    next.clampWhenFinished=ONE_SHOTS.has(key);
    prev?.fadeOut(fade);
    next.fadeIn(fade).play();
    this.active=key;
  }
  update(dt){
    if(!this.ready)return;
    const key=this.desired();
    this.play(key,key==='hit'?.035:key==='light'||key==='heavy'?.055:.09);
    this.mixer?.update(dt);
  }
  disposeRoot(){
    this.mixer?.stopAllAction();
    this.mixer=null;
    if(this.root){
      this.f.group.remove(this.root);
      this.root.traverse(o=>{o.geometry?.dispose?.();const mats=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];for(const m of mats)m?.dispose?.()});
      this.root=null;
    }
  }
  debug(){return{ready:this.ready,loading:this.loading,status:this.f.importedVisualStatus||this.status.status,path:this.f.importedVisualPath||null,active:this.active,actions:Object.keys(this.actions)}}
  dispose(){this.disposeRoot();this.ready=false;}
}
