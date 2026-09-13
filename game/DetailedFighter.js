import { THREE } from '../vendor/three.js';
import { Fighter } from './Fighter.js';

function mat(color,rough=.58,metal=.04,emissive=0x000000,emissiveIntensity=0){return new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal,emissive,emissiveIntensity});}
function mesh(parent,geo,material,pos=[0,0,0],rot=[0,0,0],scale=[1,1,1]){const m=new THREE.Mesh(geo,material);m.position.set(...pos);m.rotation.set(...rot);m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}

export class DetailedFighter extends Fighter{
  constructor(def,slot){super(def,slot);this.detailMeshes=[];this.addIdentityLayer();this.addSurfaceLayer();}
  add(parent,geo,material,pos,rot,scale){const m=mesh(parent,geo,material,pos,rot,scale);this.detailMeshes.push(m);return m;}
  addIdentityLayer(){
    const d=this.def,id=d.id, skin=mat(d.palette.skin,.72), dark=mat(0x171418,.72), metal=mat(0x8c8f94,.28,.72), accent=mat(d.palette.accent,.42,.18), cloth=mat(d.palette.primary,.7,.03);
    // Jaw, ears, brow and facial planes make the silhouettes read much less like primitives.
    this.add(this.head,new THREE.BoxGeometry(.27,.10,.10),skin,[0,-.12,.255],[.05,0,0],[1.22,1,.72]);
    this.add(this.head,new THREE.SphereGeometry(.055,10,7),skin,[-.305,0,.01]);this.add(this.head,new THREE.SphereGeometry(.055,10,7),skin,[.305,0,.01]);
    this.add(this.head,new THREE.BoxGeometry(.11,.026,.034),dark,[-.105,.095,.298],[0,0,-.08]);this.add(this.head,new THREE.BoxGeometry(.11,.026,.034),dark,[.105,.095,.298],[0,0,.08]);
    const mouth=this.add(this.head,new THREE.BoxGeometry(.14,.018,.022),dark,[0,-.155,.308]);mouth.rotation.z=id==='wojak'?-.12:0;
    // Hands and knuckles.
    [this.leftFore,this.rightFore].forEach((p,i)=>{this.add(p,new THREE.SphereGeometry(.115,10,8),skin,[0,-.58,.02],[0,0,0],[1.08,.8,1]);for(let k=0;k<3;k++)this.add(p,new THREE.SphereGeometry(.028,7,5),skin,[(k-1)*.045,-.64,.115]);});
    // Shoulder seams / clavicle volume.
    this.add(this.torso,new THREE.BoxGeometry(.78,.07,.08),accent,[0,.56,.31],[0,0,0],[1,1,.7]);
    // Identity-specific readable props.
    if(id==='trump'){
      this.add(this.torso,new THREE.BoxGeometry(.075,.55,.035),mat(0xb50d18,.42,.08),[0,.14,.43],[0,0,0],[1,.98,1]);
      const sweep=this.add(this.head,new THREE.BoxGeometry(.44,.095,.28),mat(0xd9b56b,.78),[.035,.285,-.01],[0,0,-.15],[1,.8,1]);sweep.geometry.translate(.04,0,0);
    }else if(id==='netanyahu'){
      this.add(this.head,new THREE.BoxGeometry(.47,.065,.31),mat(0xa9a39d,.8),[0,.26,-.025],[0,0,0],[1,.8,1]);
      this.add(this.head,new THREE.BoxGeometry(.13,.06,.035),metal,[-.1,.075,.32]);this.add(this.head,new THREE.BoxGeometry(.13,.06,.035),metal,[.1,.075,.32]);
      this.add(this.head,new THREE.BoxGeometry(.07,.018,.022),metal,[0,.075,.34]);
    }else if(id==='kirk'){
      this.add(this.torso,new THREE.CylinderGeometry(.07,.07,.34,8),mat(0x304f87,.5,.08),[0,.13,.425]);
    }else if(id==='floyd'){
      this.add(this.head,new THREE.BoxGeometry(.30,.10,.18),dark,[0,-.21,.13],[0,0,0],[1.2,.75,1]);
      this.add(this.torso,new THREE.TorusGeometry(.18,.025,7,18,Math.PI),metal,[0,.21,.38],[Math.PI/2,0,0]);
    }else if(id==='gigachad'){
      this.add(this.head,new THREE.BoxGeometry(.42,.18,.23),skin,[0,-.17,.02],[0,0,0],[1.13,.85,1]);
      this.add(this.torso,new THREE.TorusGeometry(.43,.055,8,24),dark,[0,.22,.15],[Math.PI/2,0,0],[1.18,.72,1]);
    }else if(id==='agarthan'){
      const glow=mat(0xd8ffff,.22,.22,0x55ffff,1.9);this.add(this.head,new THREE.SphereGeometry(.042,10,7),glow,[-.105,.06,.31]);this.add(this.head,new THREE.SphereGeometry(.042,10,7),glow,[.105,.06,.31]);
      this.add(this.torso,new THREE.TorusGeometry(.27,.028,8,28),metal,[0,.18,.38],[Math.PI/2,0,0]);
      for(let i=0;i<5;i++)this.add(this.torso,new THREE.CylinderGeometry(.012,.012,.42,6),metal,[(i-2)*.115,.15,.385],[0,0,0]);
    }else if(id==='greek'){
      const marble=mat(0xd8d2c6,.92,.02);this.group.traverse(o=>{if(o.isMesh&&o.material?.color&&!o.material.transparent){o.material.roughness=.88;o.material.metalness=.01;}});
      this.add(this.head,new THREE.TorusGeometry(.33,.035,8,30,Math.PI*1.45),marble,[0,.13,-.02],[Math.PI/2,0,.2]);
      this.add(this.torso,new THREE.BoxGeometry(.055,.62,.055),marble,[.32,.08,.35],[0,0,-.25]);
    }else if(id==='wojak'){
      this.add(this.head,new THREE.TorusGeometry(.11,.015,7,20,Math.PI),dark,[0,-.145,.302],[0,0,Math.PI]);
    }
    // Belt, knees and footwear separation.
    this.add(this.group,new THREE.BoxGeometry(.58,.10,.34),cloth,[0,1.09,.01]);
    [this.leftShin,this.rightShin].forEach(p=>this.add(p,new THREE.TorusGeometry(.17,.025,7,16),accent,[0,-.05,0],[Math.PI/2,0,0]));
  }
  addSurfaceLayer(){
    // Cheap micro-detail that survives mobile: alternating fabric panels rather than textures.
    const c=this.def.palette.secondary, panel=mat(c,.83,.02);
    for(let i=0;i<3;i++)this.add(this.torso,new THREE.BoxGeometry(.16,.055,.025),panel,[0,.39-i*.11,.39]);
    const sole=mat(0x111113,.88,.01);
    [this.leftShin,this.rightShin].forEach(p=>this.add(p,new THREE.BoxGeometry(.30,.045,.48),sole,[0,-.73,.12]));
  }
}
