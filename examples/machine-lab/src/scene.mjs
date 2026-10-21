import * as THREE from 'three';
import { createCameraRig } from '../../../kit/camera-rig.mjs';
import { DEFAULTS, revealOffset } from './model.mjs';

/** Original schematic solids, drawn in millimetres from the SI model. */
export function createMachineScene(canvas, { reducedMotion = false, onInspect = () => {}, onUserIntent = () => {} } = {}) {
  const context=canvas.getContext('webgl2',{antialias:true,powerPreference:'low-power'});
  if(!context)throw new Error('WebGL 2 is unavailable');
  const renderer = new THREE.WebGLRenderer({ canvas, context, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x182126);
  const camera = new THREE.OrthographicCamera(-170,170,120,-120,.1,3000);
  camera.up.set(0,0,1); camera.position.set(240,-310,340);
  const rig = createCameraRig(camera,canvas,{target:[77,0,0],radius:150,minDistance:50,maxDistance:1400,reducedMotion,onUserIntent});
  scene.add(new THREE.HemisphereLight(0xd6e6ee,0x34404a,2.7));
  const key = new THREE.DirectionalLight(0xffedd2,3.2);key.position.set(-100,-180,400);scene.add(key);
  const rim = new THREE.DirectionalLight(0xb2d5e6,1.2);rim.position.set(180,140,160);scene.add(rim);
  const root = new THREE.Group();scene.add(root);
  const resources = new Set(), objects = {}, hitObjects = [];
  let snapshot, reveal = 0, selected = 'crank', width=0,height=0,view='iso';
  const own = o => (resources.add(o),o);
  const material = (color,metalness=.35,roughness=.5) => own(new THREE.MeshStandardMaterial({color,metalness,roughness}));
  const mats={base:material(0x2a3943),dark:material(0x364b59),steel:material(0xb1c0c8,.65,.33),edge:material(0x7c939f),accent:material(0xe8a17d,.3,.4),bronze:material(0xc5a77d,.65,.38)};
  const contour=own(new THREE.LineBasicMaterial({color:0x0d151a,transparent:true,opacity:.45}));
  function group(id){const g=new THREE.Group();g.userData.part=id;root.add(g);objects[id]=g;return g;}
  function mesh(geometry,mat,parent,position=[0,0,0],edge=true){
    own(geometry);const m=new THREE.Mesh(geometry,mat);m.position.fromArray(position);parent.add(m);
    if(edge){const line=new THREE.LineSegments(own(new THREE.EdgesGeometry(geometry,35)),contour);m.add(line);}
    let g=parent;while(g&&!g.userData.part)g=g.parent;
    if(g){m.userData.part=g.userData.part;hitObjects.push(m);}return m;
  }
  const box=(w,h,d,mat,parent,pos)=>mesh(new THREE.BoxGeometry(w,h,d),mat,parent,pos);
  const cylinder=(r,depth,mat,parent,pos)=>{const m=mesh(new THREE.CylinderGeometry(r,r,depth,48),mat,parent,pos);m.rotation.x=Math.PI/2;return m;};
  const ring=(outer,inner,depth,mat,parent,pos)=>{const shape=new THREE.Shape();shape.absarc(0,0,outer,0,Math.PI*2,false);const hole=new THREE.Path();hole.absarc(0,0,inner,0,Math.PI*2,true);shape.holes.push(hole);const g=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSize:.8,bevelThickness:.6,bevelSegments:1,curveSegments:48});g.translate(0,0,-depth/2);return mesh(g,mat,parent,pos);};
  const base=new THREE.Group();root.add(base);
  box(278,130,12,mats.base,base,[76,0,-20]);
  for(const x of [-47,199])for(const y of [-51,51]){cylinder(4,2,mats.bronze,base,[x,y,-13]);box(21,19,8,mats.dark,base,[x,y,-30]);}
  box(23,54,14,mats.dark,base,[0,0,-7]);cylinder(13,20,mats.edge,base,[0,0,3]);
  for(const y of [-24,24]){
    const rail=cylinder(4,123,mats.steel,base,[143,y,5]);rail.rotation.z=Math.PI/2;
    for(const x of [84,202]){box(12,17,20,mats.dark,base,[x,y,-4]);cylinder(2,2,mats.bronze,base,[x,y,7]);}
  }
  const crank=group('crank'),radius=DEFAULTS.radius*1000,rodLength=DEFAULTS.rodLength*1000;
  ring(radius+8,radius,9,mats.edge,crank,[0,0,0]);
  for(let i=0;i<6;i++){const spoke=box(32,6,7,mats.dark,crank,[Math.cos(i*Math.PI/3)*24,Math.sin(i*Math.PI/3)*24,0]);spoke.rotation.z=i*Math.PI/3;}
  cylinder(12,12,mats.steel,crank,[0,0,0]);
  box(radius,12,7,mats.accent,crank,[radius/2,0,8]);cylinder(9,7,mats.accent,crank,[0,0,8]);cylinder(9,7,mats.accent,crank,[radius,0,8]);
  cylinder(5,26,mats.bronze,crank,[radius,0,15]);cylinder(5,17,mats.bronze,crank,[0,0,8]);
  const rod=group('rod');
  box(rodLength,9,6,mats.steel,rod,[rodLength/2,0,19]);
  ring(10,5,6,mats.steel,rod,[0,0,19]);ring(10,5,6,mats.steel,rod,[rodLength,0,19]);
  box(rodLength-30,3,1,mats.dark,rod,[rodLength/2,0,22.7]);
  const slider=group('slider');
  box(30,45,15,mats.edge,slider,[0,0,7]);box(18,32,3,mats.dark,slider,[0,0,16]);cylinder(5,17,mats.bronze,slider,[0,0,17]);
  for(const x of [-10,10])for(const y of [-16,16])cylinder(2,1.5,mats.bronze,slider,[x,y,15]);
  const guard=group('guard');
  // Narrow solid ribs leave the closed loop legible even when assembled.
  for(const y of [-59,59]){box(260,3,29,mats.dark,guard,[76,y,0]);box(260,5,3,mats.edge,guard,[76,y,16]);}
  for(const x of [-54,206]){box(3,118,29,mats.dark,guard,[x,0,0]);box(5,118,3,mats.edge,guard,[x,0,16]);}
  for(const x of [-54,206])for(const y of [-59,59])cylinder(2.4,3,mats.bronze,guard,[x,y,19]);
  const glass=own(new THREE.MeshStandardMaterial({color:0xa9c4ce,metalness:0,roughness:.8,transparent:true,opacity:.075,depthWrite:false,side:THREE.DoubleSide}));
  box(257,115,2,glass,guard,[76,0,15],false);
  const grid=new THREE.GridHelper(360,18,0x3d505b,0x273943);grid.rotation.x=Math.PI/2;grid.position.set(75,0,-26.2);scene.add(grid);resources.add(grid.geometry);for(const m of [].concat(grid.material))resources.add(m);
  const axisGeo=own(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-60,0,-10),new THREE.Vector3(215,0,-10)]));
  const axisMat=own(new THREE.LineDashedMaterial({color:0xb8c4c8,transparent:true,opacity:.45,dashSize:4,gapSize:3}));const axis=new THREE.Line(axisGeo,axisMat);axis.computeLineDistances();root.add(axis);
  const orbitGeo=own(new THREE.BufferGeometry().setFromPoints(Array.from({length:97},(_,i)=>new THREE.Vector3(radius*Math.cos(i/96*Math.PI*2),radius*Math.sin(i/96*Math.PI*2),24))));
  const orbit=new THREE.Line(orbitGeo,axisMat);orbit.computeLineDistances();root.add(orbit);
  const selection = new THREE.Box3Helper(new THREE.Box3(),0xf1ad88);selection.visible=false;scene.add(selection);own(selection.geometry);own(selection.material);
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let pointerStart=null;
  canvas.addEventListener('pointerdown',e=>{pointerStart=[e.clientX,e.clientY];});
  canvas.addEventListener('pointerup',e=>{if(!pointerStart||Math.hypot(e.clientX-pointerStart[0],e.clientY-pointerStart[1])>5)return;const rect=canvas.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,1-(e.clientY-rect.top)/rect.height*2);raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(hitObjects,false)[0];if(hit)onInspect(hit.object.userData.part);pointerStart=null;});
  canvas.addEventListener('pointercancel',()=>pointerStart=null);
  function resize(){const rect=canvas.getBoundingClientRect(),w=Math.max(1,Math.round(rect.width)),h=Math.max(1,Math.round(rect.height));if(w===width&&h===height)return;width=w;height=h;renderer.setSize(w,h,false);camera.left=-120*w/h;camera.right=120*w/h;camera.top=120;camera.bottom=-120;camera.updateProjectionMatrix();setView(view,0);}
  function setView(name='iso',duration=.45){
    view=name;
    // Fit every corner of the maximum guard reveal, so lifting never clips it.
    const normal=new THREE.Vector3(...(name==='top'?[0,-.00001,1]:[.45,-1,1.1])).normalize();
    const right=new THREE.Vector3().crossVectors(camera.up,normal).normalize();
    const up=new THREE.Vector3().crossVectors(normal,right).normalize();
    const points=[];for(const x of [-65,220])for(const y of [-70,70])for(const z of [-35,115])points.push(new THREE.Vector3(x,y,z));
    const sx=points.map(p=>p.dot(right)),sy=points.map(p=>p.dot(up));
    const zoom=Math.min((camera.right-camera.left)*.82/(Math.max(...sx)-Math.min(...sx)),240*.82/(Math.max(...sy)-Math.min(...sy)));
    const aim=new THREE.Vector3(77.5,0,40);
    rig.focus({target:aim.toArray(),position:aim.clone().addScaledVector(normal,600).toArray(),zoom,duration});
  }
  function update(state,progress){snapshot=state;reveal=progress;crank.rotation.z=state.angle;rod.position.set(state.pinX*1000,state.pinY*1000,0);rod.rotation.z=state.rodAngle;slider.position.x=state.x*1000;guard.position.z=16+revealOffset(progress)*1000;scene.updateMatrixWorld(true);}
  function select(id){selected=id;selection.visible=true;}
  function focus(id){const bounds=new THREE.Box3().setFromObject(objects[id]),center=new THREE.Vector3(),size=new THREE.Vector3();bounds.getCenter(center);bounds.getSize(size);rig.fit({center:center.toArray(),radius:Math.max(38,size.length()/2),direction:[.7,-1,1.3],duration:.5});}
  function render(dt){resize();rig.update(dt);if(selection.visible)selection.box.setFromObject(objects[selected]);renderer.render(scene,camera);}
  function stats(){return{view,camera:rig.getState(),drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,guardZ:guard.position.z,sliderX:slider.position.x,rodPinDistance:snapshot?.rodLength*1000};}
  return {update,render,select,focus,setView,frame:()=>setView('iso'),zoomBy:factor=>rig.zoomBy(factor),panBy:(x,y)=>rig.panBy(x,y),stats,setReducedMotion:v=>rig.setReducedMotion(v),dispose(){rig.dispose();resources.forEach(r=>r.dispose());renderer.dispose();}};
}
