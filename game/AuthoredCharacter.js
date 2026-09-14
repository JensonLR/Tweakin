import { THREE } from '../vendor/three.js';
import { authoredAssetFor,hasAuthoredAsset } from '../data/characterAssets.js';
import { validateCombatAnimations } from './AnimationContract.js';

const GLTF_LOADER_URL='https://cdn.jsdelivr.net/npm/three@0.186.0/examples/jsm/loaders/GLTFLoader.js';
const SKELETON_UTILS_URL='https://cdn.jsdelivr.net/npm/three@0.186.0/examples/jsm/utils/SkeletonUtils.js';
const cache=new Map();

async function runtime(){
  const [{GLTFLoader},SkeletonUtils]=await Promise.all([import(GLTF_LOADER_URL),import(SKELETON_UTILS_URL)]);
  return {loader:new GLTFLoader(),SkeletonUtils};
}

function prepare(root,mobile=false){
  root.traverse(o=>{
    if(o.isMesh){
      o.castShadow=!mobile;
      o.receiveShadow=true;
      const mats=Array.isArray(o.material)?o.material:[o.material];
      const clones=mats.map(m=>m?.clone?.()??m);
      o.material=Array.isArray(o.material)?clones:clones[0];
      for(const m of clones){
        if(!m)continue;
        if('envMapIntensity' in m)m.envMapIntensity=Math.max(.65,m.envMapIntensity||0);
        if('roughness' in m)m.roughness=Math.min(.92,Math.max(.18,m.roughness??.58));
        m.needsUpdate=true;
      }
    }
  });
  return root;
}

function normalise(root,asset){
  const box=new THREE.Box3().setFromObject(root);
  const size=box.getSize(new THREE.Vector3());
  const centre=box.getCenter(new THREE.Vector3());
  const targetHeight=asset?.displayHeight||3.05;
  const scale=targetHeight/Math.max(.001,size.y);
  root.scale.multiplyScalar(scale);
  root.position.x-=centre.x*scale;
  root.position.z-=centre.z*scale;
  root.position.y-=box.min.y*scale;
  if(asset?.rotationY)root.rotation.y=asset.rotationY;
  return root;
}

export async function loadAuthoredCharacter(id,{mobile=false,requireCombatReady=false}={}){
  const asset=authoredAssetFor(id);
  if(!hasAuthoredAsset(id))return null;
  if(!cache.has(id)){
    cache.set(id,(async()=>{
      const {loader,SkeletonUtils}=await runtime();
      const gltf=await loader.loadAsync(asset.path);
      return {scene:gltf.scene,animations:gltf.animations||[],SkeletonUtils};
    })());
  }
  try{
    const source=await cache.get(id);
    const validation=validateCombatAnimations(source.animations);
    if(requireCombatReady&&!validation.ok){
      console.warn(`[TWEAKIN] authored fighter ${id} rejected for combat. Missing clips: ${validation.missing.join(', ')}`);
      return null;
    }
    return cloneCharacter(source,asset,mobile,validation);
  }catch(err){
    cache.delete(id);
    console.warn(`[TWEAKIN] authored character failed: ${id}`,err);
    return null;
  }
}

function cloneCharacter(source,asset,mobile,validation){
  const root=source.SkeletonUtils.clone(source.scene);
  normalise(root,asset);
  prepare(root,mobile);
  return {root,animations:source.animations,asset,validation};
}

export function authoredCharacterStatus(id){
  const a=authoredAssetFor(id);
  return {id,status:a?.status||'missing',ready:hasAuthoredAsset(id),path:a?.path||null};
}

export function clearAuthoredCharacterCache(){cache.clear()}
