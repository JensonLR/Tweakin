import { THREE } from '../vendor/three.js';

const disc=(r,color,opacity=.0)=>{const m=new THREE.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false,side:THREE.DoubleSide});return new THREE.Mesh(new THREE.CircleGeometry(r,14),m)};

export class CombatWear{
  constructor(fighter){
    this.f=fighter;this.items=[];this.sweat=[];
    if(fighter.def.id==='greek')this.buildStone();else this.buildSkin();
  }
  add(parent,obj,pos,rot=[0,0,0]){obj.position.set(...pos);obj.rotation.set(...rot);parent.add(obj);this.items.push(obj);return obj}
  buildSkin(){
    const f=this.f,id=f.def.id;if(id==='wojak')return;
    const bruise=id==='agarthan'?0x61767a:0x6d2630;
    this.cheekL=this.add(f.head,disc(.055,bruise),[-.17,-.045,.318],[0,0,.13]);
    this.cheekR=this.add(f.head,disc(.045,bruise),[.17,-.07,.318],[0,0,-.15]);
    this.brow=this.add(f.head,disc(.035,0x64343a),[.09,.115,.331],[0,0,.08]);
    const sweatMat=new THREE.MeshPhysicalMaterial({color:0xdde9ec,transparent:true,opacity:0,roughness:.06,metalness:0,clearcoat:1,clearcoatRoughness:.05});
    for(let i=0;i<5;i++){const d=new THREE.Mesh(new THREE.SphereGeometry(.008+i*.0015,6,5),sweatMat.clone());d.position.set((i-2)*.065,.12-(i%3)*.10,.337+(i%2)*.004);f.head.add(d);this.sweat.push(d);this.items.push(d)}
    this.torsoMark=this.add(f.torso,disc(.07,bruise),[.29,.28,.405],[0,0,.12]);
  }
  buildStone(){
    const f=this.f,crackMat=new THREE.MeshBasicMaterial({color:0x77736d,transparent:true,opacity:0,depthWrite:false});
    const make=(parent,pos,scale=1)=>{const g=new THREE.Group();g.position.set(...pos);parent.add(g);for(let i=0;i<3;i++){const line=new THREE.Mesh(new THREE.BoxGeometry(.012,.12*(1-i*.18),.008),crackMat.clone());line.position.set((i-1)*.025,-i*.025,.334);line.rotation.z=(i-1)*.48;line.scale.setScalar(scale);g.add(line);this.items.push(line)}return g};
    this.stoneHead=make(f.head,[.09,-.02,0],.8);this.stoneChest=make(f.torso,[-.12,.22,.075],1.2);
  }
  update(){
    const f=this.f,damage=1-Math.min(f.physical,f.consciousness)/100,body=1-f.physical/100,focus=1-f.consciousness/100;
    if(f.def.id==='greek'){
      for(const o of this.items)if(o.material)o.material.opacity=Math.max(0,(damage-.22)*1.25);
      return;
    }
    if(this.cheekL)this.cheekL.material.opacity=Math.max(0,(damage-.18)*.34);
    if(this.cheekR)this.cheekR.material.opacity=Math.max(0,(damage-.38)*.40);
    if(this.brow)this.brow.material.opacity=Math.max(0,(focus-.42)*.38);
    if(this.torsoMark)this.torsoMark.material.opacity=Math.max(0,(body-.48)*.24);
    const sweat=Math.min(.32,Math.max(0,(damage-.08)*.34));for(let i=0;i<this.sweat.length;i++)this.sweat[i].material.opacity=sweat*(.55+(i%3)*.18);
  }
}
