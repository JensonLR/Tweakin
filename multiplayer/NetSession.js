import { EMPTY_INPUT } from '../core/types.js';

const waitIce = pc => new Promise(resolve => {
  if (pc.iceGatheringState === 'complete') return resolve();
  const done = () => { if (pc.iceGatheringState === 'complete') { pc.removeEventListener('icegatheringstatechange', done); resolve(); } };
  pc.addEventListener('icegatheringstatechange', done);
  setTimeout(resolve, 4000);
});

export class NetSession {
  constructor(){this.pc=null;this.dc=null;this.isHost=false;this.localSlot=0;this.connected=false;this.status='idle';this.remoteInput={...EMPTY_INPUT};this.latestSnapshot=null;this.onMatchConfig=null}
  makePeer(){
    this.pc=new RTCPeerConnection({iceServers:[{urls:'stun:stun.l.google.com:19302'}]});
    this.pc.onconnectionstatechange=()=>{this.status=this.pc.connectionState;this.connected=this.pc.connectionState==='connected'};
    this.pc.ondatachannel=e=>this.bindChannel(e.channel);
  }
  bindChannel(dc){
    this.dc=dc;dc.binaryType='arraybuffer';dc.onopen=()=>{this.connected=true;this.status='connected'};dc.onclose=()=>{this.connected=false;this.status='closed'};
    dc.onmessage=e=>{try{const m=JSON.parse(e.data);if(m.t==='input')this.remoteInput=m.input;if(m.t==='snapshot')this.latestSnapshot=m.snapshot;if(m.t==='config')this.onMatchConfig?.(m.config);if(m.t==='hello'&&!this.isHost)this.localSlot=1}catch{}};
  }
  async createOffer(){
    this.close();this.isHost=true;this.localSlot=0;this.makePeer();this.bindChannel(this.pc.createDataChannel('tweakin',{ordered:false,maxRetransmits:2}));
    const offer=await this.pc.createOffer();await this.pc.setLocalDescription(offer);await waitIce(this.pc);this.status='offer-ready';return btoa(unescape(encodeURIComponent(JSON.stringify(this.pc.localDescription))));
  }
  async acceptOffer(code){
    this.close();this.isHost=false;this.localSlot=1;this.makePeer();const offer=JSON.parse(decodeURIComponent(escape(atob(code.trim()))));await this.pc.setRemoteDescription(offer);const answer=await this.pc.createAnswer();await this.pc.setLocalDescription(answer);await waitIce(this.pc);this.status='answer-ready';return btoa(unescape(encodeURIComponent(JSON.stringify(this.pc.localDescription))));
  }
  async acceptAnswer(code){const answer=JSON.parse(decodeURIComponent(escape(atob(code.trim()))));await this.pc.setRemoteDescription(answer);this.status='connecting'}
  send(obj){if(this.dc?.readyState==='open'&&this.dc.bufferedAmount<256000)this.dc.send(JSON.stringify(obj))}
  sendLocalInput(input,frame){this.send({t:'input',input,frame})}
  getRemoteInput(){return this.remoteInput??{...EMPTY_INPUT}}
  broadcastSnapshot(snapshot){if(this.isHost)this.send({t:'snapshot',snapshot})}
  consumeSnapshot(){const s=this.latestSnapshot;this.latestSnapshot=null;return s}
  broadcastMatchConfig(config){if(this.isHost)this.send({t:'config',config})}
  debug(){return{host:this.isHost,localSlot:this.localSlot,connected:this.connected,status:this.status,connection:this.pc?.connectionState??'none',channel:this.dc?.readyState??'none'}}
  close(){try{this.dc?.close()}catch{}try{this.pc?.close()}catch{}this.pc=null;this.dc=null;this.connected=false;this.status='idle';this.remoteInput={...EMPTY_INPUT};this.latestSnapshot=null}
}
