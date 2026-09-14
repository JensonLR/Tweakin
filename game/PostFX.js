import { THREE } from '../vendor/three.js';

export class PostFX{
  constructor(renderer,mobile=false,quality='medium'){
    this.renderer=renderer;this.mobile=mobile;this.quality=quality;this.time=0;this.scale=this.scaleFor(quality);
    this.target=new THREE.WebGLRenderTarget(Math.max(2,Math.floor(innerWidth*this.scale)),Math.max(2,Math.floor(innerHeight*this.scale)),{depthBuffer:true,stencilBuffer:false});
    this.scene=new THREE.Scene();this.camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
    this.material=new THREE.ShaderMaterial({depthWrite:false,depthTest:false,uniforms:{tDiffuse:{value:this.target.texture},resolution:{value:new THREE.Vector2(innerWidth*this.scale,innerHeight*this.scale)},time:{value:0},impact:{value:0},cinematic:{value:0},quality:{value:this.qualityValue(quality)}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,fragmentShader:`
      precision highp float;varying vec2 vUv;uniform sampler2D tDiffuse;uniform vec2 resolution;uniform float time;uniform float impact;uniform float cinematic;uniform float quality;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
      vec3 grade(vec3 c){c=max(c,0.0);c=(c-.5)*1.025+.5;c+=vec3(.018,.020,.022);c*=vec3(1.012,1.008,1.0);float l=dot(c,vec3(.2126,.7152,.0722));c=mix(vec3(l),c,1.045);c=pow(max(c,0.0),vec3(.985));float hi=smoothstep(.68,1.0,max(max(c.r,c.g),c.b));c+=vec3(.028,.018,.010)*hi;return c;}
      void main(){vec2 uv=vUv,center=vec2(.5),from=uv-center;float dist=length(from);vec2 texel=1.0/resolution;float punch=impact*impact,ca=(.16+impact*1.1+cinematic*.14)*quality;vec2 radial=normalize(from+vec2(.00001))*texel*(1.0+dist*5.0)*punch*2.5;float r=texture2D(tDiffuse,uv+vec2(texel.x*ca,0.)+radial).r;float g=texture2D(tDiffuse,uv).g;float b=texture2D(tDiffuse,uv-vec2(texel.x*ca,0.)-radial).b;vec3 base=vec3(r,g,b),col=base;if(quality>.3){vec3 n=texture2D(tDiffuse,uv+vec2(0.,texel.y)).rgb,s=texture2D(tDiffuse,uv-vec2(0.,texel.y)).rgb,e=texture2D(tDiffuse,uv+vec2(texel.x,0.)).rgb,w=texture2D(tDiffuse,uv-vec2(texel.x,0.)).rgb,blur=(n+s+e+w)*.25,bright=max(blur-vec3(.72),0.0);col+=bright*(.16+.18*cinematic)*quality;col+=(base-blur)*(.06+.02*cinematic)*quality;}col=grade(col);float vign=1.0-smoothstep(.46,.88,dist)*(.13+.06*cinematic);col*=vign;float grain=(hash(uv*resolution+time*81.37)-.5)*(.009+.004*cinematic)*quality;col+=grain;float flash=(1.0-smoothstep(0.0,.56,dist))*punch;col+=vec3(.10,.032,.020)*flash;float gate=smoothstep(.0,.07,vUv.y)*smoothstep(.0,.07,1.0-vUv.y);col*=mix(.94,1.0,gate+(.08*(1.0-cinematic)));gl_FragColor=vec4(col,1.0);}`});
    this.quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),this.material);this.scene.add(this.quad);
  }
  qualityValue(q){return q==='high'?1:q==='medium'?.65:0}
  scaleFor(q){return this.mobile?(q==='high'?1:q==='medium'?.82:.64):(q==='high'?1.05:q==='medium'?.9:.72)}
  setQuality(q){this.quality=q;this.scale=this.scaleFor(q);this.material.uniforms.quality.value=this.qualityValue(q);this.resize(innerWidth,innerHeight)}
  resize(w,h){const rw=Math.max(2,Math.floor(w*this.scale)),rh=Math.max(2,Math.floor(h*this.scale));this.target.setSize(rw,rh);this.material.uniforms.resolution.value.set(rw,rh)}
  render(scene,camera,dt=0,impact=0,cinematic=0){
    this.time+=dt;
    if(this.quality==='low'){
      this.renderer.setRenderTarget(null);this.renderer.render(scene,camera);return;
    }
    this.material.uniforms.time.value=this.time;this.material.uniforms.impact.value=Math.min(1,impact);this.material.uniforms.cinematic.value=Math.min(1,cinematic);this.renderer.setRenderTarget(this.target);this.renderer.render(scene,camera);this.renderer.setRenderTarget(null);this.renderer.render(this.scene,this.camera);
  }
  dispose(){this.target.dispose();this.material.dispose();this.quad.geometry.dispose()}
}
