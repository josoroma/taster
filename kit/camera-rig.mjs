import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { smootherstep } from './motion.mjs';

/** A single camera owner: user gestures interrupt scripted moves immediately. */
export function createCameraRig(camera,element,{target=[0,0,0],radius=5,minDistance=2,maxDistance=50,reducedMotion=false,onUserIntent=()=>{}}={}) {
  const controls=new OrbitControls(camera,element);
  controls.target.fromArray(target);controls.cursor.fromArray(target);
  controls.minDistance=minDistance;controls.maxDistance=maxDistance;
  controls.minZoom=.25;controls.maxZoom=8;
  controls.maxTargetRadius=radius*2.5;
  controls.minPolarAngle=.08;controls.maxPolarAngle=Math.PI-.08;
  controls.zoomToCursor=true;controls.screenSpacePanning=true;
  controls.enableDamping=!reducedMotion;controls.dampingFactor=.085;
  controls.touches.ONE=THREE.TOUCH.ROTATE;controls.touches.TWO=THREE.TOUCH.DOLLY_PAN;
  controls.update();
  const home={position:camera.position.clone(),target:controls.target.clone(),zoom:camera.zoom};
  let shot=null,disposed=false;
  const right=new THREE.Vector3(),up=new THREE.Vector3(),delta=new THREE.Vector3();
  function cancelShot(){shot=null;controls.enableDamping=!reducedMotion;controls.update();}
  function interrupt(){cancelShot();onUserIntent();}
  controls.addEventListener('start',interrupt);

  function focus({position,target:nextTarget,duration=.9,zoom=camera.zoom}={}) {
    if(!position||!nextTarget)throw new TypeError('focus requires position and target arrays');
    controls.enableDamping=false;controls.update();
    shot={fromPosition:camera.position.clone(),fromTarget:controls.target.clone(),fromZoom:camera.zoom,toPosition:new THREE.Vector3().fromArray(position),toTarget:new THREE.Vector3().fromArray(nextTarget),toZoom:zoom,elapsed:0,duration:reducedMotion?0:Math.max(0,duration)};
    if(shot.duration===0)update(0);
  }
  function update(dt=0) {
    if(disposed)return;
    if(shot){
      shot.elapsed+=Math.max(0,Number.isFinite(dt)?dt:0);
      const t=shot.duration===0?1:smootherstep(shot.elapsed/shot.duration);
      camera.position.lerpVectors(shot.fromPosition,shot.toPosition,t);
      controls.target.lerpVectors(shot.fromTarget,shot.toTarget,t);
      camera.zoom=THREE.MathUtils.lerp(shot.fromZoom,shot.toZoom,t);
      camera.updateProjectionMatrix();camera.lookAt(controls.target);camera.updateMatrixWorld();
      if(t===1){shot=null;controls.enableDamping=!reducedMotion;controls.update();}
    }else controls.update(Math.max(0,dt));
  }
  function reset({duration=.8}={}){focus({position:home.position.toArray(),target:home.target.toArray(),zoom:home.zoom,duration});}
  function zoomBy(factor) {
    if(!Number.isFinite(factor)||factor<=0)throw new RangeError('zoom factor must be positive');
    interrupt();
    if(camera.isOrthographicCamera){camera.zoom=THREE.MathUtils.clamp(camera.zoom*factor,controls.minZoom,controls.maxZoom);camera.updateProjectionMatrix();}
    else {delta.subVectors(camera.position,controls.target);const length=THREE.MathUtils.clamp(delta.length()/factor,controls.minDistance,controls.maxDistance);camera.position.copy(controls.target).add(delta.setLength(length));}
    controls.update();
  }
  function panBy(dx,dy) {
    if(!Number.isFinite(dx)||!Number.isFinite(dy))return;
    interrupt();camera.updateMatrixWorld();
    const height=Math.max(1,element.clientHeight);
    const span=camera.isOrthographicCamera?(camera.top-camera.bottom)/camera.zoom:2*camera.position.distanceTo(controls.target)*Math.tan(THREE.MathUtils.degToRad(camera.fov)/2)/camera.zoom;
    right.setFromMatrixColumn(camera.matrixWorld,0);up.setFromMatrixColumn(camera.matrixWorld,1);
    delta.copy(right).multiplyScalar(dx*span/height).addScaledVector(up,-dy*span/height);
    camera.position.add(delta);controls.target.add(delta);controls.update();
  }
  function fit({center=target,radius:fitRadius=radius,direction,duration=.8}={}) {
    if(!(fitRadius>0))throw new RangeError('fit radius must be positive');
    const aim=new THREE.Vector3().fromArray(center);
    const view=direction?new THREE.Vector3().fromArray(direction):new THREE.Vector3().subVectors(camera.position,controls.target);
    if(view.lengthSq()<1e-8)view.set(1,.65,1.5);view.normalize();
    controls.cursor.copy(aim);controls.maxTargetRadius=Math.max(radius,fitRadius)*2.5;
    let distance,zoom=1;
    if(camera.isOrthographicCamera){distance=Math.max(camera.position.distanceTo(controls.target),fitRadius*2);zoom=Math.min(camera.right-camera.left,camera.top-camera.bottom)/(fitRadius*2.3);controls.minZoom=Math.min(.25,zoom*.3);}
    else {const halfFov=Math.min(THREE.MathUtils.degToRad(camera.fov)*.5,Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov)*.5)*camera.aspect));distance=fitRadius*1.12/Math.sin(halfFov);}
    controls.maxDistance=Math.max(maxDistance,distance*2.5);
    camera.near=Math.max(.005,fitRadius/1000);camera.far=Math.max(200,distance+fitRadius*40);
    focus({position:aim.clone().addScaledVector(view,distance).toArray(),target:center,zoom,duration});
  }
  return {
    controls,update,focus,reset,zoomBy,panBy,fit,cancelShot,
    isTransitioning:()=>shot!==null,
    getState:()=>({position:camera.position.toArray(),target:controls.target.toArray(),zoom:camera.zoom,transitioning:shot!==null}),
    setReducedMotion(value){reducedMotion=!!value;controls.enableDamping=!reducedMotion;if(reducedMotion&&shot){shot.duration=0;update(0);}},
    dispose(){disposed=true;shot=null;controls.removeEventListener('start',interrupt);controls.dispose();},
  };
}
