import * as THREE from 'three';
import { createCameraRig } from './camera-rig.mjs';

/** Orthographic inspection of precomputed CAD meshes and their true topology edges.
 * This is a viewer, not a solid-modeling kernel. Geometry stays in source units.
 */
export function createTechnicalViewer(canvas,{onUserIntent=()=>{},reducedMotion=false}={}){
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x191c21);
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio||1,2));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  const camera=new THREE.OrthographicCamera(-100,100,80,-80,.1,2000);
  camera.up.set(0,0,1);camera.position.set(130,-160,130);
  const rig=createCameraRig(camera,canvas,{target:[0,0,0],radius:80,minDistance:10,maxDistance:1000,reducedMotion,onUserIntent:()=>{view='custom';onUserIntent();}});
  rig.controls.rotateSpeed=.65;
  rig.controls.minPolarAngle=0;rig.controls.maxPolarAngle=Math.PI;
  const resources=new Set(),groups=[],dimensionGroup=new THREE.Group();scene.add(dimensionGroup);
  const own=value=>(resources.add(value),value);
  const faceMaterial=own(new THREE.MeshBasicMaterial({color:0x20242a,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1}));
  const lineMaterial=own(new THREE.LineBasicMaterial({color:0xc4c8cd,transparent:true,opacity:.9,depthWrite:false}));
  const featureMaterial=own(new THREE.LineBasicMaterial({color:0xe47e70,depthWrite:false}));
  const hiddenMaterial=own(new THREE.LineDashedMaterial({color:0x89909a,transparent:true,opacity:.3,dashSize:1.5,gapSize:1,depthFunc:THREE.GreaterDepth,depthWrite:false}));
  const dimMaterial=own(new THREE.LineBasicMaterial({color:0x67707b,transparent:true,opacity:.6,depthWrite:false}));
  const labels=document.createElement('div');labels.className='technical-labels';
  Object.assign(labels.style,{position:'absolute',inset:'0',pointerEvents:'none',overflow:'hidden'});canvas.parentElement.append(labels);
  let manifest=null,index=0,view='iso',width=0,height=0,hidden=false,disposed=false,center=[0,0,0],drawingBounds=null,labelItems=[];
  function lines(values,material,parent){
    if(!values.length)return null;
    const geometry=own(new THREE.BufferGeometry());geometry.setAttribute('position',new THREE.Float32BufferAttribute(values,3));
    const object=new THREE.LineSegments(geometry,material);object.computeLineDistances();object.renderOrder=material===hiddenMaterial?3:2;parent.add(object);return object;
  }
  function edgeKey(edge){
    const point=i=>edge.slice(i,i+3).map(v=>Math.round(v*10000)).join(',');
    const keys=[];for(let i=0;i<edge.length;i+=3)keys.push(point(i));
    const forward=keys.join(';'),backward=[...keys].reverse().join(';');return forward<backward?forward:backward;
  }
  function appendSegments(target,edge){for(let i=3;i<edge.length;i+=3)target.push(...edge.slice(i-3,i+3));}
  function dimensions(bounds){
    dimensionGroup.clear();labels.replaceChildren();labelItems=[];
    const [xmin,ymin,zmin]=bounds.min,[xmax,ymax,zmax]=bounds.max;
    const y=ymin-10,x=xmax+10,z=zmax;
    lines([xmin,ymin-2,z,xmin,y-3,z,xmax,ymin-2,z,xmax,y-3,z,xmin,y,z,xmax,y,z,
      xmax+2,ymin,z,x+3,ymin,z,xmax+2,ymax,z,x+3,ymax,z,x,ymin,z,x,ymax,z],dimMaterial,dimensionGroup);
    // Endpoint ticks have a fixed model-space length, never an invented tolerance.
    for(const [a,b,c] of [[xmin,y,z],[xmax,y,z],[x,ymin,z],[x,ymax,z]])lines([a-1,b-1,c,a+1,b+1,c],dimMaterial,dimensionGroup);
    const lengthText=value=>`${Number(value.toFixed(3))} ${manifest.units}`;
    for(const [text,position] of [[lengthText(xmax-xmin),[(xmin+xmax)/2,y-3,z]],
      [lengthText(ymax-ymin),[x+4,(ymin+ymax)/2,z]]]){
      const el=document.createElement('span');el.textContent=text;
      Object.assign(el.style,{position:'absolute',font:'10px ui-monospace,monospace',letterSpacing:'.04em',color:'#8d96a2',whiteSpace:'nowrap',background:'#191c21d9',padding:'3px 5px',borderRadius:'3px'});
      labels.append(el);labelItems.push({el,position:new THREE.Vector3(...position)});
    }
    center=bounds.min.map((v,i)=>(v+bounds.max[i])/2);
    drawingBounds={min:[xmin,ymin-13,zmin],max:[xmax+15,ymax,zmax]};
  }
  function resize(){
    const rect=canvas.getBoundingClientRect(),w=Math.max(1,Math.round(rect.width)),h=Math.max(1,Math.round(rect.height));
    if(w===width&&h===height)return;
    width=w;height=h;renderer.setSize(w,h,false);
    camera.left=-80*w/h;camera.right=80*w/h;camera.top=80;camera.bottom=-80;camera.updateProjectionMatrix();
    if(manifest&&view!=='custom')setView(view,{duration:0});
  }
  function setView(name,{duration=.55}={}){
    // A sub-pixel tilt avoids lookAt's undefined roll exactly at the Z-up pole.
    const directions={iso:[1,-1.4,1.15],top:[0,-.00001,1],front:[0,-1,0]};
    if(!directions[name])throw new RangeError('View must be iso, top, or front');
    view=name;
    if(drawingBounds){
      // Fit projected bounds rather than a sphere: thin engineering parts waste
      // most of a landscape viewport when framed by their bounding sphere.
      const normal=new THREE.Vector3(...directions[name]).normalize();
      const right=name==='top'?new THREE.Vector3(1,0,0):new THREE.Vector3().crossVectors(camera.up,normal).normalize();
      const up=new THREE.Vector3().crossVectors(normal,right).normalize();
      const bounds=name==='front'?manifest.stages.at(-1).bounds:drawingBounds;
      const points=[];
      for(const x of [bounds.min[0],bounds.max[0]])for(const y of [bounds.min[1],bounds.max[1]])for(const z of [bounds.min[2],bounds.max[2]])points.push(new THREE.Vector3(x,y,z));
      const sx=points.map(v=>v.dot(right)),sy=points.map(v=>v.dot(up));
      const spanX=Math.max(...sx)-Math.min(...sx),spanY=Math.max(...sy)-Math.min(...sy);
      const zoom=Math.min((camera.right-camera.left)*(width<500?.73:.84)/spanX,160*.68/Math.max(spanY,28));
      const aim=new THREE.Vector3(...center);
      aim.addScaledVector(right,(Math.max(...sx)+Math.min(...sx))/2-aim.dot(right));
      aim.addScaledVector(up,(Math.max(...sy)+Math.min(...sy))/2-aim.dot(up));
      // Reserve the narrow viewport's right toolbar and the text beyond anchors.
      if(width<500)aim.addScaledVector(right,24*(camera.right-camera.left)/(width*zoom));
      rig.focus({target:aim.toArray(),position:aim.clone().addScaledVector(normal,300).toArray(),zoom,duration});
    }
    // Plan dimensions become edge-on in the front elevation.
    dimensionGroup.visible=name!=='front';labels.hidden=name==='front';
  }
  async function load(url){
    if(manifest)throw new Error('Load a CAD manifest once per viewer');
    const response=await fetch(url);if(!response.ok)throw new Error(`CAD geometry could not load (${response.status})`);
    const data=await response.json();
    if(!Array.isArray(data.stages)||!data.stages.length||data.upAxis!=='Z')throw new Error('Expected a nonempty Z-up CAD manifest');
    manifest=data;let previous=new Set();
    for(const [i,stage] of data.stages.entries()){
      if(!stage.positions?.length||!stage.indices?.length||!Array.isArray(stage.edges))throw new Error('Incomplete CAD mesh');
      const group=new THREE.Group();scene.add(group);group.visible=false;
      const geometry=own(new THREE.BufferGeometry());geometry.setAttribute('position',new THREE.Float32BufferAttribute(stage.positions,3));geometry.setIndex(stage.indices);geometry.computeVertexNormals();
      group.add(new THREE.Mesh(geometry,faceMaterial));
      const all=[],retained=[],changed=[];
      for(const edge of stage.edges){appendSegments(all,edge);appendSegments(i>0&&!previous.has(edgeKey(edge))?changed:retained,edge);}
      lines(retained,lineMaterial,group);lines(changed,featureMaterial,group);
      const occluded=lines(all,hiddenMaterial,group);if(occluded)occluded.visible=hidden;
      groups.push({group,occluded});previous=new Set(stage.edges.map(edgeKey));
    }
    dimensions(data.stages.at(-1).bounds);resize();setStage(0);setView('iso',{duration:0});return data;
  }
  function setStage(next){
    if(!Number.isInteger(next)||next<0||next>=groups.length)throw new RangeError('Unknown CAD stage');
    index=next;groups.forEach((entry,i)=>entry.group.visible=i===index);
  }
  function render(dt=0){
    if(disposed)return;resize();rig.update(dt);renderer.render(scene,camera);
    for(const item of labelItems){const p=item.position.clone().project(camera);item.el.style.left=`${(p.x+1)*width/2}px`;item.el.style.top=`${(1-p.y)*height/2}px`;item.el.style.transform='translate(-50%,-50%)';item.el.style.visibility=p.z>=-1&&p.z<=1?'visible':'hidden';}
  }
  return {load,setStage,setView,resize,render,
    resetCamera:()=>setView('iso'),zoomBy:factor=>rig.zoomBy(factor),panBy:(x,y)=>rig.panBy(x,y),
    cancelCameraShot:()=>rig.cancelShot(),setReducedMotion:value=>rig.setReducedMotion(value),
    setHiddenEdges(value){hidden=!!value;groups.forEach(entry=>{if(entry.occluded)entry.occluded.visible=hidden;});},
    stats:()=>({stage:index,view,units:manifest?.units,camera:rig.getState(),calls:renderer.info.render.calls,triangles:renderer.info.render.triangles}),
    dispose(){disposed=true;rig.dispose();resources.forEach(r=>r.dispose());labels.remove();renderer.dispose();}
  };
}
