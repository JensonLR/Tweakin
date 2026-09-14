import { EMPTY_INPUT } from '../core/types.js';

const waitIce = pc => new Promise(resolve => {
  if (pc.iceGatheringState === 'complete') return resolve();
  const done = () => { if (pc.iceGatheringState === 'complete') { pc.removeEventListener('icegatheringstatechange', done); resolve(); } };
  pc.addEventListener('icegatheringstatechange', done);
  setTimeout(resolve, 4000);
});
const lerp=(a,b,t)=>(a??0)+((b??a??0)-(a??0))*t;
const angleLerp=(a,b,t)=>{a??=0;b??=a;let d=(b-a+Math.PI)%(Math.PI*2)-Math.PI;if(d<-Math.PI)d+=Math.PI*2;return a+d*t};
const blendFighter=(a,b,t)=>{if(!a)return b;if(!b)return a;return{...b,x:lerp(a.x,b.x,t),y:lerp(a.y,b.y,t),z:lerp(a.z,b.z,t),yaw:angleLerp(a.yaw,b.yaw,t),vx:lerp(a.vx,b.vx,t),vz:lerp(a.vz,b.vz,t),stateTime:lerp(a.stateTime,b.stateTime,t),physical:lerp(a.physical,b.physical,t),consciousness:lerp(a.consciousness,b.consciousness,t),momentum:lerp(a.momentum,b.momentum,t),specialTime:lerp(a.specialTime,b.specialTime,t)}};

export class NetSession {
  constructor(){this.pc=null;this.dc=null;this.isHost=false;this.localSlot=0;this.connected=false;this.status='idle';this.remoteInput={...EMPTY_INPUT};this.latestSnapshot=null;this.previousSnapshot=null;this.snapshotAt=0;this.snapshotInterval=50;this.lastSnapshotAt=0;this.onMatchConfig=null;this.rtt=0;this.lastPing=0;this.sent=0;this.received=0;this.dropped=0}
  makePeer(){
    this.pc=new RTCPeerConnection({iceServers:[{urls:'stun:stun.l.google.com:19302'}]});
    this.pc.onconnectionstatechange=()=>{this.status=this.pc.connectionState;this.connected=this.pc.connectionState==='connected'};
    this.pc.ondatachannel=e=>this.bindChannel(e.channel);
  }
  bindChannel(dc){
    this.dc=dc;dc.binaryType='arraybuffer';dc.onopen=()=>{this.connected=true;this.status='connected';this.ping()};dc.onclose=()=>{this.connected=false;this.status='closed'};
    dc.onmessage=e=>{try{const m=JSON.parse(e.data);this.received++;if(m.t==='input')this.remoteInput=m.input;if(m.t==='snapshot')this.pushSnapshot(m.snapshot);if(m.t==='config')this.onMatchConfig?.(m.config);if(m.t==='hello'&&!this.isHost)this.localSlot=1;if(m.t==='ping')this.send({t:'pong',ts:m.ts});if(m.t==='pong'&&Number.isFinite(m.ts))this.rtt=this.rtt?this.rtt*.75+(performance.now()-m.ts)*.25:performance.now()-m.ts}catch{this.dropped++}};
  }
  pushSnapshot(s){const now=performance.now();if(this.lastSnapshotAt){const interval=Math.max(20,Math.min(160,now-this.lastSnapshotAt));this.snapshotInterval=this.snapshotInterval*.8+interval*.2}this.lastSnapshotAt=now;this.previousSnapshot=this.latestSnapshot;this.latestSnapshot=s;this.snapshotAt=now}
  async createOffer(){
    this.close();this.isHost=true;this.localSlot=0;this.makePeer();this.bindChannel(this.pc.createDataChannel('tweakin',{ordered:false,maxRetransmits:2}));
    const offer=await this.pc.createOffer();await this.pc.setLocalDescription(offer);await waitIce(this.pc);this.status='offer-ready';return btoa(unescape(encodeURIComponent(JSON.stringify(this.pc.localDescription))));
  }
  async acceptOffer(code){
    this.close();this.isHost=false;this.localSlot=1;this.makePeer();const offer=JSON.parse(decodeURIComponent(escape(atob(code.trim()))));await this.pc.setRemoteDescription(offer);const answer=await this.pc.createAnswer();await this.pc.setLocalDescription(answer);await waitIce(this.pc);this.status='answer-ready';return btoa(unescape(encodeURIComponent(JSON.stringify(this.pc.localDescription))));
  }
  async acceptAnswer(code){const answer=JSON.parse(decodeURIComponent(escape(atob(code.trim()))));await this.pc.setRemoteDescription(answer);this.status='connecting'}
  send(obj){if(this.dc?.readyState==='open'&&this.dc.bufferedAmount<256000){this.dc.send(JSON.stringify(obj));this.sent++;return true}if(this.dc?.readyState==='open')this.dropped++;return false}
  ping(){const now=performance.now();if(now-this.lastPing<1000)return;this.lastPing=now;this.send({t:'ping',ts:now})}
  sendLocalInput(input,frame){this.ping();this.send({t:'input',input,frame})}
  getRemoteInput(){return this.remoteInput??{...EMPTY_INPUT}}
  broadcastSnapshot(snapshot){if(this.isHost)this.send({t:'snapshot',snapshot})}
  consumeSnapshot(){
    if(!this.latestSnapshot)return null;if(!this.previousSnapshot)return this.latestSnapshot;
    const t=Math.max(0,Math.min(1,(performance.now()-this.snapshotAt)/Math.max(28,this.snapshotInterval))),a=this.previousSnapshot,b=this.latestSnapshot;
    return{...b,frame:Math.round(lerp(a.frame,b.frame,t)),remaining:lerp(a.remaining,b.remaining,t),fighters:(b.fighters||[]).map((f,i)=>blendFighter(a.fighters?.[i],f,t))};
  }
  broadcastMatchConfig(config){if(this.isHost)this.send({t:'config',config})}
  debug(){return{host:this.isHost,localSlot:this.localSlot,connected:this.connected,status:this.status,connection:this.pc?.connectionState??'none',channel:this.dc?.readyState??'none',rtt:Math.round(this.rtt||0),snapshotMs:Math.round(this.snapshotInterval||0),buffered:this.dc?.bufferedAmount??0,sent:this.sent,received:this.received,dropped:this.dropped}}
  close(){try{this.dc?.close()}catch{}try{this.pc?.close()}catch{}this.pc=null;this.dc=null;this.connected=false;this.status='idle';this.remoteInput={...EMPTY_INPUT};this.latestSnapshot=null;this.previousSnapshot=null;this.snapshotAt=0;this.lastSnapshotAt=0;this.rtt=0;this.sent=this.received=this.dropped=0}
}
