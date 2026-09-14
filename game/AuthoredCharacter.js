import { THREE } from '../vendor/three.js';
import { authoredAssetFor,hasAuthoredAsset } from '../data/characterAssets.js';

const GLTF_LOADER_URL='https://cdn.jsdelivr.net/npm/three@0.186.0/examples/jsm/loaders/GLTFLoader.js';
const cache=new Map();

async function loader(){
  const {GLTFLoader}=await import(GLTF_LOADER_URL);
  return new GLTFLoader();
}

function prepare(root,mobile=false){
  root.traverse(o=>{
    if(o.isMesh){
      o.castShadow=!mobile;
      o.receiveShadow=true;
      const mats=Array.isArray(o.material)?o.material:[o.material];
      for(const m of mats){
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

export async function loadAuthoredCharacter(id,{mobile=false}={}){
  const asset=authoredAssetFor(id);
  if(!hasAuthoredAsset(id))return null;
  if(cache.has(id))return cloneCharacter(await cache.get(id),asset,mobile);
  const promise=(async()=>{
    const l=await loader();
    const gltf=await l.loadAsync(asset.path);
    return {scene:gltf.scene,animations:gltf.animations||[]};
  })();
  cache.set(id,promise);
  try{return cloneCharacter(await promise,asset,mobile)}catch(err){cache.delete(id);console.warn(`[TWEAKIN] authored character failed: ${id}`,err);return null}
}

function cloneCharacter(source,asset,mobile){
  // SkeletonUtils will replace this shallow clone once all final roster GLBs use the common rig.
  // For showcase/static inspection, cloned scene graphs are sufficient and avoid blocking asset adoption.
  const root=source.scene.clone(true);
  normalise(root,asset);
  prepare(root,mobile);
  return {root,animations:source.animations,asset};
}

export function authoredCharacterStatus(id){
  const a=authoredAssetFor(id);
  return {id,status:a?.status||'missing',ready:hasAuthoredAsset(id),path:a?.path||null};
}

export function clearAuthoredCharacterCache(){cache.clear()}
