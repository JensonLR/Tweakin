const HEAD_SCALE={trump:.80,netanyahu:.79,kirk:.78,floyd:.81,wojak:.82,gigachad:.79,agarthan:.76,greek:.80};
const TORSO={
  trump:{chest:[.88,.91,.86],waist:[.90,.96,.86],neck:.92},
  netanyahu:{chest:[.84,.91,.84],waist:[.87,.95,.84],neck:.88},
  kirk:{chest:[.82,.94,.80],waist:[.84,.98,.80],neck:.86},
  floyd:{chest:[.91,.94,.89],waist:[.92,.98,.88],neck:.96},
  wojak:{chest:[.82,.93,.80],waist:[.84,.97,.80],neck:.86},
  gigachad:{chest:[.93,.92,.90],waist:[.82,.96,.82],neck:1.02},
  agarthan:{chest:[.78,.98,.76],waist:[.80,1,.76],neck:.82},
  greek:{chest:[.91,.95,.90],waist:[.90,.98,.88],neck:.98}
};
const LIMBS={
  trump:{arm:.92,fore:.94,leg:.94,shin:.95,shoulderY:1.00},netanyahu:{arm:.90,fore:.92,leg:.93,shin:.94,shoulderY:1.00},kirk:{arm:.88,fore:.90,leg:.91,shin:.92,shoulderY:1.01},floyd:{arm:.95,fore:.97,leg:.97,shin:.97,shoulderY:1.00},wojak:{arm:.88,fore:.90,leg:.92,shin:.93,shoulderY:1.00},gigachad:{arm:.96,fore:.98,leg:.96,shin:.96,shoulderY:1.00},agarthan:{arm:.86,fore:.88,leg:.89,shin:.90,shoulderY:1.02},greek:{arm:.95,fore:.96,leg:.96,shin:.96,shoulderY:1.00}
};
const scaleMesh=(m,v)=>{if(m?.scale){m.scale.x*=v[0];m.scale.y*=v[1];m.scale.z*=v[2]}};
export function applyHumanProportions(f){
  if(!f||f.humanProportionsApplied)return;const id=f.def.id,t=TORSO[id]||TORSO.netanyahu,l=LIMBS[id]||LIMBS.netanyahu,hs=HEAD_SCALE[id]||.8;
  if(f.head)f.head.scale.multiplyScalar(hs);
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
