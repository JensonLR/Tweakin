import { clamp } from '../core/math.js';
export class AudioEngine {
  ctx=null;master=null;sfx=null;music=null;musicOn=false;nextBeat=0;volumes={master:.8,music:.35,sfx:.8};
  init(){if(this.ctx)return;const C=window.AudioContext||window.webkitAudioContext;if(!C)return;this.ctx=new C();this.master=this.ctx.createGain();this.sfx=this.ctx.createGain();this.music=this.ctx.createGain();this.sfx.connect(this.master);this.music.connect(this.master);this.master.connect(this.ctx.destination);this.applyVolumes()}
  resume(){this.init();this.ctx?.resume?.()}
  setVolumes(master,music,sfx){this.volumes={master:clamp(master,0,1),music:clamp(music,0,1),sfx:clamp(sfx,0,1)};this.applyVolumes()}
  applyVolumes(){if(!this.master||!this.sfx||!this.music)return;this.master.gain.value=this.volumes.master;this.sfx.gain.value=this.volumes.sfx;this.music.gain.value=this.volumes.music}
  tone(freq=100,duration=.08,amount=.2,type='sine',dest=null){if(!this.ctx)return;const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,this.ctx.currentTime);o.frequency.exponentialRampToValueAtTime(Math.max(24,freq*.55),this.ctx.currentTime+duration);g.gain.setValueAtTime(amount,this.ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,this.ctx.currentTime+duration);o.connect(g);g.connect(dest??this.sfx);o.start();o.stop(this.ctx.currentTime+duration)}
  noise(duration=.08,amount=.25,filterFreq=500){if(!this.ctx||!this.sfx)return;const n=Math.max(1,Math.floor(this.ctx.sampleRate*duration)),buf=this.ctx.createBuffer(1,n,this.ctx.sampleRate),d=buf.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);const src=this.ctx.createBufferSource(),f=this.ctx.createBiquadFilter(),g=this.ctx.createGain();src.buffer=buf;f.type='lowpass';f.frequency.value=filterFreq;g.gain.value=amount;src.connect(f);f.connect(g);g.connect(this.sfx);src.start()}
  ui(select=false){this.resume();this.tone(select?115:180,.045,.08,'square')}
  hit(kind='light'){this.resume();const k={light:[.06,.15,760,120],heavy:[.11,.32,420,74],grapple:[.14,.28,280,58],special:[.18,.45,600,42],environment:[.16,.4,240,50],weapon:[.12,.36,1300,88]}[kind]??[.08,.2,600,90];this.noise(k[0],k[1],k[2]);this.tone(k[3],k[0]*1.5,k[1]*.7,'triangle')}
  impact(kind='light',blocked=false){this.hit(blocked?'light':kind);if(blocked)this.tone(210,.04,.06,'square')}
  pickup(){this.resume();this.tone(330,.05,.08,'square');setTimeout(()=>this.tone(440,.05,.07,'square'),45)}
  environment(){this.hit('environment')}
  ko(){this.resume();this.tone(70,.6,.5,'sawtooth');setTimeout(()=>this.tone(44,.8,.35,'triangle'),90)}
  win(){this.ko();setTimeout(()=>this.tone(132,.5,.2,'triangle'),260)}
  special(){this.resume();this.tone(55,.7,.28,'sawtooth');this.tone(110,.45,.18,'square')}
  crowd(intensity=.4){this.resume();this.noise(.2,.08+intensity*.11,900)}
  startMusic(){this.resume();this.musicOn=true;this.nextBeat=this.ctx?.currentTime??0}
  stopMusic(){this.musicOn=false}
  update(){if(!this.ctx||!this.musicOn||!this.music)return;const now=this.ctx.currentTime;while(this.nextBeat<now+.12){const beat=Math.floor(this.nextBeat/.5)%4;this.kickAt(this.nextBeat,beat===0?.2:.12);if(beat===1||beat===3)this.hatAt(this.nextBeat+.24);if(beat===2)this.snareAt(this.nextBeat);this.nextBeat+=.5}}
  kickAt(t,a){if(!this.ctx||!this.music)return;const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type='sine';o.frequency.setValueAtTime(110,t);o.frequency.exponentialRampToValueAtTime(42,t+.13);g.gain.setValueAtTime(a,t);g.gain.exponentialRampToValueAtTime(.001,t+.14);o.connect(g);g.connect(this.music);o.start(t);o.stop(t+.15)}
  hatAt(t){if(!this.ctx||!this.music)return;const n=512,b=this.ctx.createBuffer(1,n,this.ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;const s=this.ctx.createBufferSource(),f=this.ctx.createBiquadFilter(),g=this.ctx.createGain();s.buffer=b;f.type='highpass';f.frequency.value=5000;g.gain.setValueAtTime(.035,t);g.gain.exponentialRampToValueAtTime(.001,t+.04);s.connect(f);f.connect(g);g.connect(this.music);s.start(t)}
  snareAt(t){if(!this.ctx||!this.music)return;const n=Math.floor(this.ctx.sampleRate*.09),b=this.ctx.createBuffer(1,n,this.ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);const s=this.ctx.createBufferSource(),f=this.ctx.createBiquadFilter(),g=this.ctx.createGain();s.buffer=b;f.type='bandpass';f.frequency.value=1600;g.gain.value=.07;s.connect(f);f.connect(g);g.connect(this.music);s.start(t)}
}
