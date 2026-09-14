export const ANIMATION_ALIASES={
  idle:[/idle/i,/stand/i,/breath/i],
  walk:[/walk/i],
  run:[/run/i,/jog/i],
  light:[/jab/i,/cross/i,/punch/i,/light/i,/attack.?1/i,/boxing/i],
  heavy:[/hook/i,/uppercut/i,/kick/i,/heavy/i,/attack.?2/i],
  grapple:[/grab/i,/grapple/i,/throw/i,/wrest/i,/clinch/i],
  block:[/block/i,/guard/i],
  hit:[/hit/i,/hurt/i,/damage/i,/impact/i,/recoil/i],
  knockdown:[/knock.?down/i,/fall/i,/down/i],
  getup:[/get.?up/i,/rise/i,/recover/i],
  special:[/special/i,/finisher/i,/signature/i,/spin/i,/attack.?3/i],
  victory:[/victory/i,/celebr/i,/cheer/i,/taunt/i],
  ko:[/\bko\b/i,/death/i,/defeat/i,/collapse/i]
};

export const REQUIRED_COMBAT_ANIMATIONS=['idle','walk','run','light','heavy','grapple','block','hit','knockdown','getup','special','victory','ko'];

export function mapCombatAnimations(clips=[]){
  const mapped={};
  for(const [key,patterns] of Object.entries(ANIMATION_ALIASES)){
    mapped[key]=clips.find(c=>patterns.some(re=>re.test(c?.name||'')))||null;
  }
  return mapped;
}

export function validateCombatAnimations(clips=[]){
  const mapped=mapCombatAnimations(clips);
  const missing=REQUIRED_COMBAT_ANIMATIONS.filter(k=>!mapped[k]);
  return {ok:missing.length===0,mapped,missing,names:clips.map(c=>c?.name||'').filter(Boolean)};
}
