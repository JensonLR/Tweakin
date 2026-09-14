const HEAD_SCALE={trump:.66,netanyahu:.65,kirk:.64,floyd:.67,wojak:.69,gigachad:.65,agarthan:.62,greek:.66};
const TORSO={
  trump:{chest:[.73,.86,.72],waist:[.78,.92,.72],neck:.78},
  netanyahu:{chest:[.68,.86,.69],waist:[.73,.92,.70],neck:.75},
  kirk:{chest:[.66,.89,.66],waist:[.70,.94,.67],neck:.73},
  floyd:{chest:[.78,.89,.78],waist:[.81,.94,.77],neck:.82},
  wojak:{chest:[.67,.88,.66],waist:[.71,.93,.67],neck:.74},
  gigachad:{chest:[.82,.88,.80],waist:[.69,.92,.70],neck:.86},
  agarthan:{chest:[.62,.94,.62],waist:[.66,.97,.63],neck:.69},
  greek:{chest:[.79,.90,.79],waist:[.79,.94,.77],neck:.84}
};
const LIMBS={
  trump:{arm:.73,fore:.75,leg:.80,shin:.81,shoulderY:1.00},netanyahu:{arm:.70,fore:.73,leg:.78,shin:.79,shoulderY:1.00},kirk:{arm:.68,fore:.71,leg:.76,shin:.77,shoulderY:1.01},floyd:{arm:.78,fore:.80,leg:.83,shin:.83,shoulderY:1.00},wojak:{arm:.68,fore:.71,leg:.77,shin:.78,shoulderY:1.00},gigachad:{arm:.80,fore:.82,leg:.82,shin:.82,shoulderY:1.00},agarthan:{arm:.65,fore:.68,leg:.73,shin:.74,shoulderY:1.02},greek:{arm:.78,fore:.79,leg:.82,shin:.82,shoulderY:1.00}
};
const scaleMesh=(m,v)=>{if(m?.scale){m.scale.x*=v[0];m.scale.y*=v[1];m.scale.z*=v[2]}};
export function applyHumanProportions(f){
  if(!f||f.humanProportionsApplied)return;const id=f.def.id,t=TORSO[id]||TORSO.netanyahu,l=LIMBS[id]||LIMBS.netanyahu,hs=HEAD_SCALE[id]||.66;
  if(f.head){f.head.scale.multiplyScalar(hs);f.head.position.y+=.035;}
  if(f.chestMesh)scaleMesh(f.chestMesh,t.chest);
  const torsoMeshes=(f.torso?.children||[]).filter(o=>o.isMesh);
  for(const m of torsoMeshes){
    const type=m.geometry?.type||'';
    if(m===f.chestMesh)continue;
    if(type==='CylinderGeometry'&&m.position.y<0){scaleMesh(m,t.waist);continue;}
    if(type==='CylinderGeometry'&&m.position.y>.55){m.scale.x*=t.neck;m.scale.z*=t.neck;continue;}
  }
  for(const a of[f.leftArm,f.rightArm]){if(a?.children?.[0]?.isMesh){a.children[0].scale.x*=l.arm;a.children[0].scale.z*=l.arm;}if(a?.position)a.position.y*=l.shoulderY;}
  for(const a of[f.leftFore,f.rightFore])if(a?.children?.[0]?.isMesh){a.children[0].scale.x*=l.fore;a.children[0].scale.z*=l.fore;}
  for(const a of[f.leftLeg,f.rightLeg])if(a?.children?.[0]?.isMesh){a.children[0].scale.x*=l.leg;a.children[0].scale.z*=l.leg;}
  for(const a of[f.leftShin,f.rightShin])if(a?.children?.[0]?.isMesh){a.children[0].scale.x*=l.shin;a.children[0].scale.z*=l.shin;}
  f.humanProportionsApplied=true;
}
