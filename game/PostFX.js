import { THREE } from '../vendor/three.js';

export class PostFX{
  constructor(renderer,mobile=false,quality='medium'){
    this.renderer=renderer;this.mobile=mobile;this.quality=quality;this.time=0;this.scale=this.scaleFor(quality);
    this.target=new THREE.WebGLRenderTarget(Math.max(2,Math.floor(innerWidth*this.scale)),Math.max(2,Math.floor(innerHeight*this.scale)),{depthBuffer:true,stencilBuffer:false});
    this.scene=new THREE.Scene();this.camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
    this.material=new THREE.ShaderMaterial({
      depthWrite:false,depthTest:false,
      uniforms:{tDiffuse:{value:this.target.texture},resolution:{value:new THREE.Vector2(innerWidth*this.scale,innerHeight*this.scale)},time:{value:0},impact:{value:0},cinematic:{value:0},quality:{value:this.qualityValue(quality)}},
      vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,
      fragmentShader:`
        precision highp float;varying vec2 vUv;
        uniform sampler2D tDiffuse;uniform vec2 resolution;uniform float time;uniform float impact;uniform float cinematic;uniform float quality;
        float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
        vec3 grade(vec3 c){c=max(c,0.0);c=(c-.5)*1.065+.5;c*=vec3(1.03,.995,.965);float l=dot(c,vec3(.2126,.7152,.0722));c=mix(vec3(l),c,1.08);c=pow(max(c,0.0),vec3(.985));return c;}
        void main(){
          vec2 uv=vUv;vec2 texel=1.0/resolution;float ca=(.25+impact*.9+cinematic*.25)*quality;
          float r=texture2D(tDiffuse,uv+vec2(texel.x*ca,0.)).r;float g=texture2D(tDiffuse,uv).g;float b=texture2D(tDiffuse,uv-vec2(texel.x*ca,0.)).b;vec3 col=vec3(r,g,b);
          if(quality>.3){vec3 blur=(texture2D(tDiffuse,uv+vec2(texel.x*2.,0.)).rgb+texture2D(tDiffuse,uv-vec2(texel.x*2.,0.)).rgb+texture2D(tDiffuse,uv+vec2(0.,texel.y*2.)).rgb+texture2D(tDiffuse,uv-vec2(0.,texel.y*2.)).rgb)*.25;vec3 bright=max(blur-vec3(.72),0.0);col+=bright*(.18+.22*cinematic)*quality;}
          col=grade(col);float vign=1.0-smoothstep(.34,.78,distance(uv,vec2(.5)))*(.34+.14*cinematic);col*=vign;float grain=(hash(uv*resolution+time*83.17)-.5)*(.018+.01*cinematic)*quality;col+=grain;col+=vec3(.08,.012,.006)*impact*.22*(1.0-distance(uv,vec2(.5)));gl_FragColor=vec4(col,1.0);
        }`
    });
    this.quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),this.material);this.scene.add(this.quad);
  }
  qualityValue(q){return q==='high'?1:q==='medium'?.65:.25}
  scaleFor(q){return this.mobile?(q==='high'?1:q==='medium'?.88:.72):(q==='high'?1.15:q==='medium'?1:.85)}
  setQuality(q){this.quality=q;this.scale=this.scaleFor(q);this.material.uniforms.quality.value=this.qualityValue(q);this.resize(innerWidth,innerHeight)}
  resize(w,h){const rw=Math.max(2,Math.floor(w*this.scale)),rh=Math.max(2,Math.floor(h*this.scale));this.target.setSize(rw,rh);this.material.uniforms.resolution.value.set(rw,rh)}
  render(scene,camera,dt=0,impact=0,cinematic=0){this.time+=dt;this.material.uniforms.time.value=this.time;this.material.uniforms.impact.value=impact;this.material.uniforms.cinematic.value=cinematic;this.renderer.setRenderTarget(this.target);this.renderer.render(scene,camera);this.renderer.setRenderTarget(null);this.renderer.render(this.scene,this.camera)}
  dispose(){this.target.dispose();this.material.dispose();this.quad.geometry.dispose();}
}
