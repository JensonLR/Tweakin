import fs from 'node:fs';
import path from 'node:path';
import { CHARACTER_ASSETS, CHARACTER_ASSET_REQUIREMENTS } from '../data/characterAssets.js';
import { validateCombatAnimations } from '../game/AnimationContract.js';

function readGLB(file){
  const buf=fs.readFileSync(file);
  if(buf.length<20||buf.toString('utf8',0,4)!=='glTF')throw new Error('not a GLB 2.0 file');
  const version=buf.readUInt32LE(4);if(version!==2)throw new Error(`unsupported GLB version ${version}`);
  const total=buf.readUInt32LE(8);if(total!==buf.length)throw new Error(`GLB length mismatch header=${total} file=${buf.length}`);
  let offset=12,json=null;
  while(offset+8<=buf.length){const len=buf.readUInt32LE(offset),type=buf.readUInt32LE(offset+4);offset+=8;const chunk=buf.subarray(offset,offset+len);offset+=len;if(type===0x4e4f534a)json=JSON.parse(chunk.toString('utf8').replace(/\u0000+$/,''));}
  if(!json)throw new Error('GLB JSON chunk missing');
  return {json,bytes:buf.length};
}

function audit(id,asset){
  const file=path.resolve(asset.path.replace(/^\.\//,''));
  if(!fs.existsSync(file))throw new Error(`${id}: missing ${asset.path}`);
  const {json,bytes}=readGLB(file);
  const meshes=json.meshes?.length||0,skins=json.skins?.length||0,materials=json.materials?.length||0,nodes=json.nodes?.length||0;
  if(meshes<1)throw new Error(`${id}: no meshes`);
  if(skins<1)throw new Error(`${id}: no skin/skeleton`);
  const clips=(json.animations||[]).map((a,i)=>({name:a.name||`animation_${i}`}));
  const animationAudit=validateCombatAnimations(clips);
  if(!animationAudit.ok)throw new Error(`${id}: missing combat clips: ${animationAudit.missing.join(', ')}`);
  const imageCount=json.images?.length||0,textureCount=json.textures?.length||0;
  return {id,file:asset.path,mb:(bytes/1024/1024).toFixed(2),meshes,skins,materials,nodes,images:imageCount,textures:textureCount,animations:clips.length};
}

const ready=Object.entries(CHARACTER_ASSETS).filter(([,a])=>a.status==='ready');
const rows=[];let failed=false;
for(const [id,asset] of ready){
  try{rows.push(audit(id,asset));}
  catch(err){failed=true;console.error(`[character-audit] ${err.message}`);}
}
if(rows.length)console.table(rows);
console.log(`[character-audit] ${ready.length} production-ready fighter asset(s) registered.`);
console.log(`[character-audit] Required clips: ${CHARACTER_ASSET_REQUIREMENTS.animationClips.join(', ')}`);
if(failed)process.exit(1);
