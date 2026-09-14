const BODY={
  trump:{chest:[1.10,.98,1.02],pelvis:[1.03,.98,1.01],shoulder:1.04,arm:1.04,leg:1.00,neck:1.07},
  netanyahu:{chest:[.98,.97,.98],pelvis:[.98,.98,.98],shoulder:.98,arm:.98,leg:.98,neck:1.00},
  kirk:{chest:[.99,1.02,.95],pelvis:[.96,1,.95],shoulder:.98,arm:.97,leg:1.04,neck:.98},
  floyd:{chest:[1.10,1.02,1.08],pelvis:[1.06,1.02,1.06],shoulder:1.08,arm:1.07,leg:1.05,neck:1.10},
  wojak:{chest:[.94,1,.92],pelvis:[.95,1,.93],shoulder:.94,arm:.94,leg:.98,neck:.94},
  gigachad:{chest:[1.19,1.04,1.11],pelvis:[1.02,1,.98],shoulder:1.15,arm:1.12,leg:1.08,neck:1.18},
  agarthan:{chest:[.91,1.06,.88],pelvis:[.89,1.05,.87],shoulder:.92,arm:.93,leg:1.09,neck:.92},
  greek:{chest:[1.13,1.04,1.10],pelvis:[1.07,1.02,1.05],shoulder:1.10,arm:1.08,leg:1.04,neck:1.10}
};
const mul=(obj,x=1,y=1,z=1)=>{if(obj?.scale){obj.scale.x*=x;obj.scale.y*=y;obj.scale.z*=z}};
export function applyBodyLikeness(f){
  if(!f||f.bodyLikenessApplied)return;const s=BODY[f.def.id];if(!s)return;
  mul(f.chestMesh,...s.chest);mul(f.pelvis,...s.pelvis);
  for(const a of[f.leftArm,f.rightArm])mul(a,s.shoulder,1,s.shoulder);
  for(const a of[f.leftFore,f.rightFore])mul(a,s.arm,1,s.arm);
  for(const l of[f.leftLeg,f.rightLeg,f.leftShin,f.rightShin])mul(l,s.leg,1,s.leg);
  if(f.torso){f.torso.scale.x*=s.chest[0]>.999?1.01:.99;f.torso.scale.z*=s.chest[2];}
  f.bodyLikenessApplied=true;
}
