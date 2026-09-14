import { THREE } from '../vendor/three.js';
import { loadAuthoredCharacter, authoredCharacterStatus } from '../game/AuthoredCharacter.js';

export class AuthoredViewer{
  constructor(root){this.root=root;this.host=null;this.renderer=null;this.scene=null;this.camera=null;this.model=null;this.mixer=null;this.raf=0;this.clock=new THREE.Clock();this.token=0;this.resizeObserver=null;}
  async focus(id){
    const token=++this.token;this.disposeStage();
    const host=this.root.querySelector('.fighter-hero');if(!host)return;
    this.host=host;const status=authoredCharacterStatus(id);host.dataset.assetState=status.ready?'loading':'art';host.dataset.assetId=id;
    if(!status.ready)return;
    const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});this.renderer=renderer;renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.domElement.className='authored-viewer-canvas';host.appendChild(renderer.domElement);
    const scene=new THREE.Scene();this.scene=scene;const camera=new THREE.PerspectiveCamera(31,1,.05,60);this.camera=camera;camera.position.set(0,1.55,5.3);
    scene.add(new THREE.HemisphereLight(0xe7efff,0x24171b,2.0));const key=new THREE.SpotLight(0xffead8,44,22,.55,.7,1);key.position.set(-3.5,6.8,4.6);key.target.position.set(0,1.45,0);key.castShadow=true;key.shadow.mapSize.set(1024,1024);scene.add(key,key.target);const fill=new THREE.DirectionalLight(0xc9ddff,3.4);fill.position.set(4,3,4);scene.add(fill);const rim=new THREE.PointLight(0xff2735,15,10,1.8);rim.position.set(2.7,2.4,-1.8);scene.add(rim);const floor=new THREE.Mesh(new THREE.CircleGeometry(2.2,64),new THREE.MeshStandardMaterial({color:0x08080a,roughness:.48,metalness:.16,transparent:true,opacity:.86}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(host);this.resize();
    const loaded=await loadAuthoredCharacter(id,{mobile:matchMedia('(max-width:760px)').matches});if(token!==this.token||!this.renderer)return;if(!loaded){host.dataset.assetState='art';this.disposeStage(false);return}this.model=loaded.root;scene.add(this.model);host.dataset.assetState='ready';
    const box=new THREE.Box3().setFromObject(this.model),size=box.getSize(new THREE.Vector3()),centre=box.getCenter(new THREE.Vector3());const h=Math.max(.1,size.y);camera.position.set(centre.x,h*.53,Math.max(3.8,h*1.75));camera.lookAt(centre.x,h*.49,centre.z);camera.near=.02;camera.far=Math.max(40,h*10);camera.updateProjectionMatrix();
    if(loaded.animations?.length){this.mixer=new THREE.AnimationMixer(this.model);const idle=loaded.animations.find(a=>/idle/i.test(a.name))||loaded.animations[0];this.mixer.clipAction(idle).play();}
    this.clock.start();this.loop();
  }
  resize(){if(!this.host||!this.renderer||!this.camera)return;const w=Math.max(1,this.host.clientWidth),h=Math.max(1,this.host.clientHeight);this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();}
  loop(){cancelAnimationFrame(this.raf);const tick=()=>{if(!this.renderer||!this.scene||!this.camera)return;const dt=Math.min(.05,this.clock.getDelta());this.mixer?.update(dt);if(this.model)this.model.rotation.y=-.10+Math.sin(performance.now()*.00028)*.065;this.renderer.render(this.scene,this.camera);this.raf=requestAnimationFrame(tick)};tick();}
  disposeStage(clearHost=true){cancelAnimationFrame(this.raf);this.raf=0;this.resizeObserver?.disconnect();this.resizeObserver=null;this.mixer?.stopAllAction();this.mixer=null;if(this.scene)this.scene.traverse(o=>{o.geometry?.dispose?.();const mats=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];for(const m of mats)m?.dispose?.()});this.renderer?.dispose?.();this.renderer?.domElement?.remove();if(clearHost&&this.host){delete this.host.dataset.assetState;delete this.host.dataset.assetId}this.renderer=null;this.scene=null;this.camera=null;this.model=null;this.host=null;}
  clear(){this.token++;this.disposeStage();}
  destroy(){this.clear();}
}
