import { THREE } from '../vendor/three.js';

let noiseTex=null, marbleTex=null, fabricTex=null;
function canvasTexture(kind='noise'){
  const c=document.createElement('canvas');c.width=c.height=96;const x=c.getContext('2d');const img=x.createImageData(c.width,c.height);
  for(let y=0;y<c.height;y++)for(let xx=0;xx<c.width;xx++){
    const i=(y*c.width+xx)*4;let v=128;
    if(kind==='fabric'){const weave=((xx%6)<2?18:0)+((y%6)<2?14:0);v=116+weave+Math.floor(Math.random()*14);}
    else if(kind==='marble'){const vein=Math.sin(xx*.13+y*.07+Math.sin(y*.11)*2.2);v=168+Math.floor(vein*22)+Math.floor(Math.random()*8);}
    else v=120+Math.floor(Math.random()*30);
    img.data[i]=img.data[i+1]=img.data[i+2]=v;img.data[i+3]=255;
  }
  x.putImageData(img,0,0);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(kind==='fabric'?5:kind==='marble'?2.5:4,kind==='fabric'?5:kind==='marble'?2.5:4);t.colorSpace=THREE.NoColorSpace;return t;
}
function getNoise(){return noiseTex??=(canvasTexture('noise'))}function getFabric(){return fabricTex??=(canvasTexture('fabric'))}function getMarble(){return marbleTex??=(canvasTexture('marble'))}

export function applyFighterSurface(root,id){
  root.traverse(o=>{if(!o.isMesh||!o.material)return;const mats=Array.isArray(o.material)?o.material:[o.material];for(const m of mats){if(!m.isMeshStandardMaterial)continue;
    if(id==='greek'){m.roughnessMap=getMarble();m.bumpMap=getMarble();m.bumpScale=.012;m.roughness=Math.max(.72,m.roughness??.8);}
    else if((m.metalness??0)>.28){m.roughnessMap=getNoise();m.bumpMap=getNoise();m.bumpScale=.006;}
    else if((m.roughness??.5)>.58){m.roughnessMap=getFabric();m.bumpMap=getFabric();m.bumpScale=.008;}
    else{m.roughnessMap=getNoise();m.bumpMap=getNoise();m.bumpScale=.004;}
    m.needsUpdate=true;
  }});
}
export function applyArenaSurface(root){root.traverse(o=>{if(!o.isMesh||!o.material)return;const mats=Array.isArray(o.material)?o.material:[o.material];for(const m of mats){if(!m.isMeshStandardMaterial)continue;m.roughnessMap=(m.metalness??0)>.25?getNoise():getFabric();m.bumpMap=m.roughnessMap;m.bumpScale=(m.metalness??0)>.25?.006:.014;m.needsUpdate=true;}})}
