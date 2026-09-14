import { THREE } from '../vendor/three.js';
let noiseTex=null,fineTex=null,marbleTex=null,fabricTex=null,concreteTex=null;
function canvasTexture(kind='noise'){
  const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),img=x.createImageData(c.width,c.height);
  for(let y=0;y<c.height;y++)for(let xx=0;xx<c.width;xx++){const i=(y*c.width+xx)*4;let v=128;
    if(kind==='fabric'){const weave=((xx%7)<2?16:0)+((y%7)<2?13:0);v=112+weave+Math.floor(Math.random()*13)}
    else if(kind==='marble'){const vein=Math.sin(xx*.10+y*.055+Math.sin(y*.09)*2.8)+Math.sin(xx*.025-y*.12)*.42;v=170+Math.floor(vein*20)+Math.floor(Math.random()*6)}
    else if(kind==='fine')v=122+Math.floor(Math.random()*18)+(Math.sin(xx*.55+y*.31)*3|0);
    else if(kind==='concrete'){v=108+Math.floor(Math.random()*34)+(((xx*13+y*7)%29)<2?18:0)}
    else v=118+Math.floor(Math.random()*32);img.data[i]=img.data[i+1]=img.data[i+2]=Math.max(0,Math.min(255,v));img.data[i+3]=255}
  x.putImageData(img,0,0);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;const rep=kind==='fine'?8:kind==='fabric'?6:kind==='marble'?2.2:kind==='concrete'?4:4;t.repeat.set(rep,rep);t.colorSpace=THREE.NoColorSpace;t.anisotropy=2;return t;
}
const getNoise=()=>noiseTex??=canvasTexture('noise'),getFine=()=>fineTex??=canvasTexture('fine'),getFabric=()=>fabricTex??=canvasTexture('fabric'),getMarble=()=>marbleTex??=canvasTexture('marble'),getConcrete=()=>concreteTex??=canvasTexture('concrete');
const closeHex=(m,hex,eps=.055)=>{if(!m?.color)return false;const c=new THREE.Color(hex),dr=m.color.r-c.r,dg=m.color.g-c.g,db=m.color.b-c.b;return Math.sqrt(dr*dr+dg*dg+db*db)<eps};
export function applyFighterSurface(root,def){
  root.traverse(o=>{if(!o.isMesh||!o.material)return;const mats=Array.isArray(o.material)?o.material:[o.material];for(const m of mats){if(!m.isMeshStandardMaterial)continue;
    const isSkin=closeHex(m,def.palette.skin,.11),isHair=closeHex(m,def.palette.hair,.08),isMetal=(m.metalness??0)>.28;
    if(def.id==='greek'){
      m.roughnessMap=getMarble();m.bumpMap=getMarble();m.bumpScale=.010;m.roughness=Math.max(.78,m.roughness??.8);m.envMapIntensity=.32;
    }else if(isSkin){
      m.roughnessMap=getFine();m.bumpMap=getFine();m.bumpScale=.0028;m.roughness=Math.min(.69,Math.max(.50,m.roughness??.62));m.envMapIntensity=.58;
      if('emissive' in m){const base=new THREE.Color(def.palette.skin);m.emissive=base.clone().multiplyScalar(.018);m.emissiveIntensity=.34;}
    }else if(isHair){
      m.roughnessMap=getNoise();m.bumpMap=getNoise();m.bumpScale=.010;m.roughness=.76;m.envMapIntensity=.25;
    }else if(isMetal){
      m.roughnessMap=getNoise();m.bumpMap=getFine();m.bumpScale=.0035;m.roughness=Math.min(.48,m.roughness??.45);m.envMapIntensity=1.05;
    }else{
      m.roughnessMap=getFabric();m.bumpMap=getFabric();m.bumpScale=.0058;m.roughness=Math.max(.58,m.roughness??.66);m.envMapIntensity=.34;
    }
    m.needsUpdate=true;
  }});
}
export function applyArenaSurface(root){
  root.traverse(o=>{if(!o.isMesh||!o.material)return;const mats=Array.isArray(o.material)?o.material:[o.material];for(const m of mats){if(!m.isMeshStandardMaterial)continue;const metal=(m.metalness??0)>.25;m.roughnessMap=metal?getNoise():getConcrete();m.bumpMap=metal?getFine():getConcrete();m.bumpScale=metal?.0045:.010;if(metal){m.roughness=Math.min(.55,m.roughness??.5);m.envMapIntensity=.9}else{m.roughness=Math.max(.72,m.roughness??.75);m.envMapIntensity=.18}m.needsUpdate=true;}}
  );
}
