export class PerformanceGovernor{
  constructor({mobile=false,quality='medium',onChange=()=>{}}={}){
    this.mobile=mobile;this.requested=quality;this.level=quality;this.onChange=onChange;this.samples=[];this.cooldown=0;this.stableHigh=0;this.stableLow=0;this.lastReason='initial';
  }
  rank(q){return q==='high'?2:q==='medium'?1:0}
  label(r){return r>=2?'high':r===1?'medium':'low'}
  ceiling(){return this.mobile?Math.min(1,this.rank(this.requested)):this.rank(this.requested)}
  sample(fps,dt){
    if(!Number.isFinite(fps)||fps<=0)return;this.cooldown=Math.max(0,this.cooldown-dt);this.samples.push(fps);if(this.samples.length>120)this.samples.shift();
    if(this.samples.length<35)return;
    const sorted=[...this.samples].sort((a,b)=>a-b);const avg=this.samples.reduce((a,b)=>a+b,0)/this.samples.length;const p20=sorted[Math.floor(sorted.length*.2)]||avg;
    if(avg<43||p20<35){this.stableLow+=dt;this.stableHigh=0}else if(avg>57&&p20>51){this.stableHigh+=dt;this.stableLow=0}else{this.stableLow=Math.max(0,this.stableLow-dt*.5);this.stableHigh=Math.max(0,this.stableHigh-dt*.5)}
    if(this.cooldown>0)return;
    let rank=this.rank(this.level),next=rank,reason='';
    if(this.stableLow>2.3&&rank>0){next=rank-1;reason=`performance ${avg.toFixed(0)}fps`;this.stableLow=0}
    else if(this.stableHigh>7&&rank<this.ceiling()){next=rank+1;reason=`headroom ${avg.toFixed(0)}fps`;this.stableHigh=0}
    if(next!==rank){this.level=this.label(next);this.lastReason=reason;this.cooldown=6;this.samples.length=0;this.onChange(this.level,{avg,p20,reason})}
  }
  debug(){const avg=this.samples.length?this.samples.reduce((a,b)=>a+b,0)/this.samples.length:0;return{level:this.level,requested:this.requested,avg:Math.round(avg),reason:this.lastReason}}
}
