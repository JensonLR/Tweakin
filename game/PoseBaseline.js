export class PoseBaseline{
  constructor(f){this.f=f;}
  apply(){
    const f=this.f;
    if(f.importedVisual?.ready)return;
    if(['Knockdown','Ground','GetUp','KO'].includes(f.state))return;
    const zero=(o)=>{if(!o)return;o.rotation.x=0;o.rotation.y=0;o.rotation.z=0;};
    zero(f.leftArm);zero(f.rightArm);zero(f.leftFore);zero(f.rightFore);
    zero(f.leftLeg);zero(f.rightLeg);zero(f.leftShin);zero(f.rightShin);
    if(f.torso){f.torso.rotation.x=0;f.torso.rotation.y=0;f.torso.rotation.z=0;}
    if(f.pelvis){f.pelvis.rotation.x=0;f.pelvis.rotation.y=0;f.pelvis.rotation.z=0;f.pelvis.position.y=.02;}
    if(f.head){f.head.rotation.x=0;f.head.rotation.y=0;f.head.rotation.z=0;}
    if(f.root){f.root.rotation.x=0;f.root.rotation.y=0;f.root.rotation.z=0;}
  }
}
