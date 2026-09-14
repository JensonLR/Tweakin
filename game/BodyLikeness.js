const BODY={
  trump:{chest:[1.12,.99,1.04],pelvis:[1.05,.98,1.02],shoulder:1.06,arm:1.05,leg:1.00,shoulderX:1.04,hipX:1.03,headY:.99,torsoY:1.00,stanceW:1.01},
  netanyahu:{chest:[.97,.98,.97],pelvis:[.97,.98,.98],shoulder:.97,arm:.97,leg:.97,shoulderX:.97,hipX:.98,headY:.99,torsoY:.99,stanceW:.98},
  kirk:{chest:[.98,1.03,.94],pelvis:[.95,1.01,.94],shoulder:.96,arm:.95,leg:1.05,shoulderX:.98,hipX:.95,headY:1.00,torsoY:1.03,stanceW:.96},
  floyd:{chest:[1.12,1.03,1.09],pelvis:[1.08,1.02,1.07],shoulder:1.09,arm:1.08,leg:1.06,shoulderX:1.07,hipX:1.05,headY:1.00,torsoY:1.03,stanceW:1.06},
  wojak:{chest:[.93,1,.91],pelvis:[.94,1,.92],shoulder:.93,arm:.93,leg:.98,shoulderX:.94,hipX:.95,headY:1.00,torsoY:1.00,stanceW:.95},
  gigachad:{chest:[1.22,1.05,1.12],pelvis:[1.01,.99,.97],shoulder:1.17,arm:1.14,leg:1.09,shoulderX:1.13,hipX:1.01,headY:1.00,torsoY:1.02,stanceW:1.04},
  agarthan:{chest:[.90,1.07,.87],pelvis:[.88,1.06,.86],shoulder:.91,arm:.92,leg:1.10,shoulderX:.92,hipX:.90,headY:1.04,torsoY:1.06,stanceW:.92},
  greek:{chest:[1.15,1.05,1.11],pelvis:[1.08,1.03,1.06],shoulder:1.11,arm:1.09,leg:1.05,shoulderX:1.09,hipX:1.06,headY:1.00,torsoY:1.04,stanceW:1.06}
};
const mul=(obj,x=1,y=1,z=1)=>{if(obj?.scale){obj.scale.x*=x;obj.scale.y*=y;obj.scale.z*=z}};
const shiftX=(obj,factor=1)=>{if(obj?.position)obj.position.x*=factor};
export function applyBodyLikeness(f){
  if(!f||f.bodyLikenessApplied)return;const s=BODY[f.def.id];if(!s)return;
  mul(f.chestMesh,...s.chest);mul(f.pelvis,...s.pelvis);
  for(const a of[f.leftArm,f.rightArm])mul(a,s.shoulder,1,s.shoulder);
  for(const a of[f.leftFore,f.rightFore])mul(a,s.arm,1,s.arm);
  for(const l of[f.leftLeg,f.rightLeg,f.leftShin,f.rightShin])mul(l,s.leg,1,s.leg);
  shiftX(f.leftArm,s.shoulderX);shiftX(f.rightArm,s.shoulderX);
  shiftX(f.leftLeg,s.hipX);shiftX(f.rightLeg,s.hipX);
  if(f.head)f.head.position.y*=s.headY;
  if(f.torso){f.torso.scale.x*=s.chest[0]>.999?1.015:.985;f.torso.scale.z*=s.chest[2];f.torso.scale.y*=s.torsoY;}
  if(f.leftLeg?.position)f.leftLeg.position.x*=s.stanceW;
  if(f.rightLeg?.position)f.rightLeg.position.x*=s.stanceW;
  f.bodyLikenessApplied=true;
}
