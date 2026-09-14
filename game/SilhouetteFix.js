import { THREE } from '../vendor/three.js';

export function applySilhouetteFix(f){
  if(!f?.head||f.silhouetteFixed)return;
  const headMeshes=f.head.children.filter(o=>o.isMesh),baseSkull=headMeshes[0];
  if(baseSkull&&f.def.id==='gigachad'){
    baseSkull.geometry?.dispose?.();baseSkull.geometry=new THREE.SphereGeometry(.31,20,14);baseSkull.scale.set(1.08,1.10,.96);baseSkull.position.set(0,0,0);
  }
  for(const shin of [f.leftShin,f.rightShin]){if(!shin)continue;for(const o of shin.children){if(!o.isMesh||o.position.y>-.6)continue;if(o.geometry?.type==='BoxGeometry')o.visible=false;}}
  for(const o of headMeshes.slice(1,4))o.visible=false;
  const legacyHairCount=f.def.id==='greek'?9:['trump','netanyahu','kirk','floyd'].includes(f.def.id)?1:0;
  if(legacyHairCount)for(const o of headMeshes.slice(4,4+legacyHairCount))o.visible=false;
  f.silhouetteFixed=true;
}
