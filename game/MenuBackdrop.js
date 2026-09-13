import { THREE } from '../vendor/three.js';

export class MenuBackdrop{
  constructor(){
    this.scene=new THREE.Scene();this.scene.background=new THREE.Color(0x050506);this.scene.fog=new THREE.FogExp2(0x09070a,.075);this.group=new THREE.Group();this.scene.add(this.group);this.time=0;
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(24,18,1,1),new THREE.MeshStandardMaterial({color:0x0b0b0d,roughness:.9,metalness:.05}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;this.scene.add(floor);
    const hemi=new THREE.HemisphereLight(0x5c6578,0x090607,.45);this.scene.add(hemi);
    const key=new THREE.SpotLight(0xffd5b5,18,20,.52,.8,1.4);key.position.set(-3.5,8,4);key.target.position.set(0,1,0);key.castShadow=true;this.scene.add(key,key.target);
    const red=new THREE.PointLight(0xff2430,16,11,2);red.position.set(3,2,-2);this.scene.add(red);this.red=red;
    const blue=new THREE.PointLight(0x3159ff,10,9,2);blue.position.set(-3,2,-2);this.scene.add(blue);this.blue=blue;
    for(let i=0;i<5;i++){const g=new THREE.Group();g.position.set((i-2)*1.25,0,-1.5-Math.abs(i-2)*.35);const dark=new THREE.MeshStandardMaterial({color:i===2?0x272024:0x151519,roughness:.8});const skin=new THREE.MeshStandardMaterial({color:0x4a3430,roughness:.76});const body=new THREE.Mesh(new THREE.CapsuleGeometry(.34,.75,5,8),dark);body.position.y=1.05;body.castShadow=true;g.add(body);const head=new THREE.Mesh(new THREE.SphereGeometry(.24,10,8),skin);head.position.y=1.95;head.castShadow=true;g.add(head);const l=new THREE.Mesh(new THREE.CapsuleGeometry(.10,.58,4,7),dark);l.position.set(-.19,.42,0);const r=l.clone();r.position.x=.19;g.add(l,r);g.rotation.y=(i-2)*-.12;this.group.add(g)}
    for(let i=0;i<40;i++){const geo=new THREE.SphereGeometry(.01+Math.random()*.008,4,3),mat=new THREE.MeshBasicMaterial({color:0x9c8d85,transparent:true,opacity:.24});const p=new THREE.Mesh(geo,mat);p.position.set((Math.random()-.5)*10,Math.random()*5,(Math.random()-.5)*7);p.userData.speed=.02+Math.random()*.05;this.scene.add(p)}
  }
  update(dt,camera){this.time+=dt;this.group.rotation.y=Math.sin(this.time*.16)*.05;this.red.intensity=13+Math.sin(this.time*1.2)*3;this.blue.intensity=8+Math.sin(this.time*.9+1)*2;camera.position.x=Math.sin(this.time*.12)*.55;camera.position.y=2.55+Math.sin(this.time*.2)*.08;camera.position.z=7.1;camera.lookAt(0,1.25,-1.2);for(const o of this.scene.children){if(o.userData?.speed){o.position.y+=o.userData.speed*dt;if(o.position.y>5)o.position.y=.05;}}}
  dispose(){this.scene.traverse(o=>{o.geometry?.dispose?.();if(o.material){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.dispose?.())}});this.scene.clear();}
}
