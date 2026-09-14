import { THREE } from '../vendor/three.js';

const GLTF='https://cdn.jsdelivr.net/npm/three@0.186.0/examples/jsm/loaders/GLTFLoader.js';
const SKEL='https://cdn.jsdelivr.net/npm/three@0.186.0/examples/jsm/utils/SkeletonUtils.js';
const sourceCache=new Map();

const SOURCE={
  trump:'./assets/characters/reference/formal-rig-reference.glb',
  netanyahu:'./assets/characters/reference/formal-rig-reference.glb',
  kirk:'./assets/characters/reference/formal-rig-reference.glb',
  floyd:'./assets/characters/reference/quaternius-common-rig.glb',
  gigachad:'./assets/characters/reference/quaternius-common-rig.glb',
  agarthan:'./assets/characters/reference/quaternius-human.glb',
  greek:'./assets/characters/reference/quaternius-human.glb',
  wojak:'./assets/characters/reference/quaternius-human.glb'
};
const DUR={light:.34,heavy:.62,grapple:.72,special:2.35};
const bell=x=>Math.sin(Math.PI*Math.max(0,Math.min(1,x)));

async function loadSource(path){
  if(sourceCache.has(path))return sourceCache.get(path);
  const promise=(async()=>{const [{GLTFLoader},SkeletonUtils]=await Promise.all([import(GLTF),import(SKEL)]);const gltf=await new GLTFLoader().loadAsync(path);return{gltf,SkeletonUtils};})();
  sourceCache.set(path,promise);return promise;
}
const findBone=(root,tests)=>{let hit=null;root.traverse(o=>{if(hit||!o.isBone)return;const n=(o.name||'').toLowerCase();if(tests.some(t=>n.includes(t)))hit=o});return hit};
const pick=(clips,re)=>clips.find(c=>re.test(c.name||''));

export class ImportedCombatVisual{
  constructor(fighter){this.f=fighter;this.root=null;this.mixer=null;this.actions={};this.active='';this.ready=false;this.rest=new Map();this.bones={};this.clips=[];this.init();}
  async init(){
    try{
      const path=SOURCE[this.f.def.id]||SOURCE.wojak,{gltf,SkeletonUtils}=await loadSource(path),root=SkeletonUtils.clone(gltf.scene);
      let meshes=0;root.traverse(o=>{if(o.isMesh){meshes++;o.castShadow=true;o.receiveShadow=true;if(o.material){const mats=Array.isArray(o.material)?o.material:[o.material];o.material=Array.isArray(o.material)?mats.map(m=>m.clone()):o.material.clone();const list=Array.isArray(o.material)?o.material:[o.material];for(const m of list){if('envMapIntensity'in m)m.envMapIntensity=Math.max(.7,m.envMapIntensity||0);if('roughness'in m)m.roughness=Math.max(.22,Math.min(.88,m.roughness??.55));}}}});
      if(!meshes)throw new Error('GLB contains no renderable meshes');
      const box=new THREE.Box3().setFromObject(root),size=box.getSize(new THREE.Vector3()),centre=box.getCenter(new THREE.Vector3()),h=Math.max(.001,size.y),scale=3.05/h;
      root.scale.multiplyScalar(scale);root.position.set(-centre.x*scale,-box.min.y*scale,-centre.z*scale);root.rotation.y=Math.PI;
      this.applyBodyIdentity(root);
      this.f.group.traverse(o=>{if(o.isMesh)o.visible=false});
      this.f.group.add(root);this.root=root;
      this.bones={spine:findBone(root,['spine','chest']),head:findBone(root,['head']),ru:findBone(root,['rightarm','upperarm_r','r_upperarm','mixamorigrightarm']),rl:findBone(root,['rightforearm','lowerarm_r','r_forearm','mixamorigrightforearm']),lu:findBone(root,['leftarm','upperarm_l','l_upperarm','mixamorigleftarm']),ll:findBone(root,['leftforearm','lowerarm_l','l_forearm','mixamorigleftforearm']),rt:findBone(root,['rightupleg','rightthigh','thigh_r','mixamorigrightupleg']),lt:findBone(root,['leftupleg','leftthigh','thigh_l','mixamorigleftupleg'])};
      Object.values(this.bones).filter(Boolean).forEach(b=>this.rest.set(b,b.quaternion.clone()));
      this.clips=gltf.animations||[];if(this.clips.length){this.mixer=new THREE.AnimationMixer(root);this.mapActions();this.play('idle',0)}
      this.ready=true;this.f.importedVisualReady=true;this.f.importedVisualPath=path;
    }catch(e){console.warn('[TWEAKIN] imported combat visual failed',this.f.def.id,e);this.f.importedVisualReady=false;}
  }
  applyBodyIdentity(root){
    const id=this.f.def.id,p=this.f.def.palette;
    const scale={trump:[1.08,1,.98],netanyahu:[.98,.98,.98],kirk:[.94,1.02,.94],floyd:[1.10,1.05,1.08],gigachad:[1.18,1.08,1.15],agarthan:[.90,1.08,.90],greek:[1.03,1.04,1.02],wojak:[.92,1.01,.92]}[id]||[1,1,1];root.scale.multiply(new THREE.Vector3(...scale));
    root.traverse(o=>{if(!o.isMesh||!o.material)return;const mats=Array.isArray(o.material)?o.material:[o.material];for(const m of mats){if(!m?.color)continue;const n=((o.name||'')+' '+(m.name||'')).toLowerCase();if(!m.map){if(/shirt|jacket|coat|top|body|torso/.test(n))m.color.lerp(new THREE.Color(p.primary),.72);else if(/pant|trouser|leg|bottom/.test(n))m.color.lerp(new THREE.Color(p.secondary),.68);else if(id==='greek')m.color.set(0xc8c1b4);else if(id==='agarthan'&&/skin|head|face|arm|hand/.test(n))m.color.set(0xcbd4d8);}}});
  }
  mapActions(){
    const c=this.clips,m={idle:/idle|stand|breath/i,walk:/walk/i,run:/run|jog/i,light:/jab|punch|attack.?1|boxing/i,heavy:/kick|heavy|attack.?2|hook|uppercut/i,grapple:/grab|grapple|throw|wrest/i,block:/block|guard/i,hit:/hit|hurt|damage|impact/i,knockdown:/knock|fall|down/i,getup:/get.?up|rise/i,special:/special|finisher|spin|kick|attack/i,victory:/victory|celebr|cheer|taunt/i,ko:/death|ko|fall/i};
    for(const[k,re]of Object.entries(m)){const clip=pick(c,re);if(clip)this.actions[k]=this.mixer.clipAction(clip)}
    if(!this.actions.idle&&c[0])this.actions.idle=this.mixer.clipAction(c[0]);
  }
  desired(){const f=this.f;if(f.state==='KO')return'ko';if(f.state==='Victory')return'victory';if(f.state==='Knockdown'||f.state==='Ground')return'knockdown';if(f.state==='GetUp')return'getup';if(f.state==='Stun')return'hit';if(f.state==='Block')return'block';if(f.state==='Attack')return f.attackType||'light';if(f.state==='Run')return'run';if(f.state==='Move')return'walk';return'idle';}
  play(key,fade=.1){const next=this.actions[key]||this.actions.idle;if(!next||this.active===key)return;const prev=this.actions[this.active];next.enabled=true;next.reset();next.setEffectiveTimeScale(key==='special'?.9:key==='heavy'?.95:1);next.setLoop((['light','heavy','grapple','special','hit','knockdown','getup'].includes(key)?THREE.LoopOnce:THREE.LoopRepeat),Infinity);next.clampWhenFinished=true;prev?.fadeOut(fade);next.fadeIn(fade).play();this.active=key;}
  manualPose(){
    const f=this.f,b=this.bones;for(const[bone,q]of this.rest)bone.quaternion.slerp(q,.35);
    if(f.state==='Block'){b.ru?.rotateX(-.8);b.lu?.rotateX(-.8);return}
    if(f.state==='Move'||f.state==='Run'){const w=Math.sin(performance.now()*.012)*(f.state==='Run'?.6:.38);b.rt?.rotateX(w);b.lt?.rotateX(-w);b.ru?.rotateX(-w*.45);b.lu?.rotateX(w*.45);return}
    if(f.state!=='Attack')return;const p=Math.min(1,f.stateTime/(DUR[f.attackType]||.5)),x=bell(p);
    if(f.attackType==='light'){b.ru?.rotateX(-1.15*x);b.spine?.rotateY(-.22*x)}
    else if(f.attackType==='heavy'){b.ru?.rotateX(-1.5*x);b.spine?.rotateY(-.48*x);b.spine?.rotateX(-.12*x)}
    else if(f.attackType==='grapple'){b.ru?.rotateX(-.95*x);b.lu?.rotateX(-.95*x);b.spine?.rotateX(.16*x)}
    else if(f.attackType==='special'){b.rt?.rotateX(-1.2*x);b.ru?.rotateX(-1.15*x);b.spine?.rotateY(Math.sin(p*Math.PI*2)*.42)}
  }
  update(dt){if(!this.ready)return;const key=this.desired();if(this.actions[key])this.play(key,key==='hit'?.04:.09);this.mixer?.update(dt);if(!this.actions[key])this.manualPose();}
  debug(){return{ready:this.ready,path:this.f.importedVisualPath||null,clips:this.clips.map(c=>c.name),active:this.active}}
}
