import * as THREE from 'three';
import {createCameraRig} from '../../../kit/camera-rig.mjs';
import {capturePose,applyAssembly,clamp01} from '../../../kit/motion.mjs';
import {REGIONS,REGION_BY_ID,regionAt,regionOffset} from './model.mjs';

export function createBrainScene(canvas,{reducedMotion=false,onSelect=()=>{},onUserIntent=()=>{}}={}){
  const scene=new THREE.Scene();scene.background=new THREE.Color('#211c26');
  const context=canvas.getContext('webgl2',{antialias:true,alpha:false});if(!context)throw new Error('WebGL 2 is unavailable');
  const renderer=new THREE.WebGLRenderer({canvas,context,antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.22;
  const camera=new THREE.PerspectiveCamera(36,1,.05,100);camera.position.set(7,4.7,8);
  const rig=createCameraRig(camera,canvas,{target:[0,0,0],radius:4,minDistance:3,maxDistance:35,reducedMotion,onUserIntent});rig.controls.rotateSpeed=.65;rig.controls.maxPolarAngle=Math.PI*.9;
  scene.add(new THREE.HemisphereLight('#f3ded4','#413447',2.0));
  const key=new THREE.DirectionalLight('#ffe9d8',3);key.position.set(-4,7,6);scene.add(key);
  const rim=new THREE.DirectionalLight('#9caed5',2.6);rim.position.set(4,4,-6);scene.add(rim);
  const fill=new THREE.DirectionalLight('#e6b7b9',.8);fill.position.set(6,1,7);scene.add(fill);
  const parts=[],assembly=[],pickables=[],resources=new Set();let separation=0,selected='frontal',width=1,height=1,disposed=false,view='overview';
  const own=o=>(resources.add(o),o);
  function material(id,vertexColors=false){return own(new THREE.MeshStandardMaterial({color:REGION_BY_ID[id].color,roughness:.58,metalness:.03,vertexColors,side:THREE.DoubleSide}));}
  function part(id,side){const root=new THREE.Group();scene.add(root);const p={id,side,root,materials:[]};parts.push(p);assembly.push({object:root,rest:capturePose(root),translation:regionOffset(id,side)});return p;}
  function mesh(p,geometry,mat){const m=new THREE.Mesh(own(geometry),mat);m.userData.region=p.id;m.userData.side=p.side;p.root.add(m);p.materials.push(mat);pickables.push(m);return m;}
  // A single continuous ellipsoidal hemisphere is partitioned into surface patches.
  // The folds and borders are procedural illustrations, not patient data or an atlas segmentation.
  function cortexPoint(theta,phi,side){
    const sx=Math.sin(theta)*Math.cos(phi),sy=Math.cos(theta),sz=Math.sin(theta)*Math.sin(phi);
    const wave=theta*21+2.6*Math.sin(phi*5+theta*2)+.8*Math.sin(phi*11-theta*3);
    const cross=phi*21+2.4*Math.sin(theta*6+phi*2);
    const groove=Math.exp(-Math.pow(Math.sin(wave)/.31,2));
    const crossGroove=Math.exp(-Math.pow(Math.sin(cross)/.22,2));
    const fold=.055-.115*groove-.036*crossGroove+.015*Math.sin(theta*41+phi*19);
    const frontal=1+.045*sz,medial=THREE.MathUtils.smoothstep(sx,0,.18);
    const r=1+fold*medial;
    return {p:new THREE.Vector3(side*(.045+1.62*sx*r*frontal),.42+1.8*sy*r*(1-.06*sz),2.48*sz*r),shade:.76+.24*(1-groove*.8-crossGroove*.2)};
  }
  for(const side of [-1,1]){
    const vertices=[],colors=[],NT=110,NP=160;
    for(let i=0;i<=NT;i++)for(let j=0;j<=NP;j++){const {p,shade}=cortexPoint(.018+(Math.PI-.036)*i/NT,-Math.PI/2+Math.PI*j/NP,side);vertices.push(p);colors.push(shade);}
    const triangles=Object.fromEntries(['frontal','parietal','temporal','occipital'].map(id=>[id,[]]));
    for(let i=0;i<NT;i++)for(let j=0;j<NP;j++){
      const a=i*(NP+1)+j,b=a+NP+1;
      for(const tri of [[a,b,a+1],[b,b+1,a+1]]){const c=tri.reduce((acc,k)=>acc.add(vertices[k]),new THREE.Vector3()).multiplyScalar(1/3);triangles[regionAt(c.y,c.z)].push(side===1?tri:tri.slice().reverse());}
    }
    for(const [id,tris] of Object.entries(triangles)){
      const p=part(id,side),pos=[],col=[],edges=new Map();
      const append=(v,c=1)=>{pos.push(v.x,v.y,v.z);col.push(c,c,c);};
      for(const tri of tris){for(const k of tri)append(vertices[k],colors[k]);for(let i=0;i<3;i++){const a=tri[i],b=tri[(i+1)%3],key=[Math.min(a,b),Math.max(a,b)].join(':');if(edges.has(key))edges.delete(key);else edges.set(key,[a,b]);}}
      // Shallow inner shell and end faces give separated tissue an inspectable edge.
      const inner=v=>{const r=Math.hypot((Math.abs(v.x)-.045)/1.62,(v.y-.42)/1.8,v.z/2.48);return new THREE.Vector3(v.x*.78/r,.42+(v.y-.42)*.80/r,v.z*.80/r);};
      for(const tri of tris){for(const k of tri.slice().reverse())append(inner(vertices[k]),.61);}
      for(const [a,b] of edges.values()){const va=vertices[a],vb=vertices[b],ia=inner(va),ib=inner(vb);for(const v of [va,ia,vb,ia,ib,vb])append(v,.7);}
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.computeVertexNormals();
      // Merge matching vertex normals for smooth gyri without smoothing across cut surfaces.
      const normals=g.attributes.normal,normalsMap=new Map();
      for(let i=0;i<tris.length*6;i++){const key=pos.slice(i*3,i*3+3).map(n=>n.toFixed(5)).join(',');let item=normalsMap.get(key);if(!item){item={v:new THREE.Vector3(),ids:[]};normalsMap.set(key,item);}item.v.add(new THREE.Vector3().fromBufferAttribute(normals,i));item.ids.push(i);}
      for(const {v,ids} of normalsMap.values()){v.normalize();for(const i of ids)normals.setXYZ(i,v.x,v.y,v.z);}
      mesh(p,g,material(id,true));
    }
  }
  // Cerebellar hemispheres, tucked beneath the posterior cerebrum; narrow folia relief.
  for(const side of [-1,1]){
    const p=part('cerebellum',side),g=new THREE.SphereGeometry(1,96,64),pos=g.attributes.position;
    for(let i=0;i<pos.count;i++){const v=new THREE.Vector3().fromBufferAttribute(pos,i),a=Math.atan2(v.z,v.x),r=1-.047*Math.exp(-Math.pow(Math.sin(v.y*28+Math.sin(a*3)*.5)/.33,2));pos.setXYZ(i,side*.52+v.x*.67*r,-1.24+v.y*.64*r,-1.43+v.z*.93*r);}g.computeVertexNormals();mesh(p,g,material('cerebellum'));
  }
  const stem=part('brainstem',1),stemCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(0,-.3,-.35),new THREE.Vector3(0,-.9,-.43),new THREE.Vector3(0,-1.45,-.15),new THREE.Vector3(0,-2.08,.02),new THREE.Vector3(0,-2.62,-.14)]);
  const stemMesh=mesh(stem,new THREE.TubeGeometry(stemCurve,48,.24,28,false),material('brainstem'));
  for(let i=0;i<stemMesh.geometry.attributes.position.count;i++){const a=stemMesh.geometry.attributes.position;const y=a.getY(i),bulge=1+.7*Math.exp(-((y+1.2)**2)/.12);a.setX(i,a.getX(i)*bulge);}stemMesh.geometry.computeVertexNormals();
  for(const side of [-1,1]){
    const th=part('thalamus',side),tg=new THREE.SphereGeometry(1,40,28);tg.scale(.32,.38,.5);tg.translate(side*.34,-.05,-.16);mesh(th,tg,material('thalamus'));
    const h=part('hippocampus',side),pts=[];for(let i=0;i<=25;i++){const a=-.4+i/25*2.9;pts.push(new THREE.Vector3(side*(.58+.17*Math.sin(a)),-.56-.27*Math.sin(a),-.3+.72*Math.cos(a)));}mesh(h,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),52,.105,14,false),material('hippocampus'));
  }
  // A quiet reference ring anchors the specimen without presenting a physical support as biology.
  const ring=new THREE.LineLoop(own(new THREE.BufferGeometry().setFromPoints(Array.from({length:128},(_,i)=>new THREE.Vector3(Math.cos(i/128*Math.PI*2)*3.2,-3.05,Math.sin(i/128*Math.PI*2)*3.2)))),own(new THREE.LineBasicMaterial({color:'#846c81',transparent:true,opacity:.2})));scene.add(ring);
  const guides=new THREE.LineSegments(own(new THREE.BufferGeometry()),own(new THREE.LineDashedMaterial({color:'#b9a5b4',transparent:true,opacity:.14,dashSize:.06,gapSize:.09})));scene.add(guides);
  function updateGuides(){const positions=[];for(const r of REGIONS){if(r.internal)continue;const p=parts.find(p=>p.id===r.id&&p.side===1),a=new THREE.Vector3(...r.anchor);positions.push(...a.toArray(),...a.add(p.root.position).toArray());}guides.geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));guides.computeLineDistances();guides.visible=separation>.03;}
  function setSeparation(value){separation=clamp01(Number.isFinite(value)?value:0);applyAssembly(assembly,separation);updateGuides();select(selected);}
  function select(id){selected=id;for(const p of parts)for(const mat of p.materials){mat.emissive.set(p.id===id?REGION_BY_ID[id].color:'#000000');mat.emissiveIntensity=p.id===id?.11:0;const faded=REGION_BY_ID[id].internal&&separation>.35&&!REGION_BY_ID[p.id].internal&&p.id!=='brainstem';if(mat.transparent!==faded){mat.transparent=faded;mat.side=faded?THREE.FrontSide:THREE.DoubleSide;mat.needsUpdate=true;}mat.opacity=faded?.16:1;mat.depthWrite=!faded;}}
  function overview(duration=.7,expanded=separation>.2){view='overview';rig.fit({center:[0,-.25,0],radius:expanded?4.45:2.95,direction:expanded?[.45,.7,1.5]:[1.7,.8,1.15],duration});}
  function focus(id){view=id;const r=REGION_BY_ID[id],p=parts.find(p=>p.id===id&&p.side===1),anchor=new THREE.Vector3(...r.anchor).add(p.root.position),direction=new THREE.Vector3(id==='occipital'||id==='cerebellum'?1.3:1,.45,id==='occipital'||id==='cerebellum'?-1.5:1.1).normalize();rig.focus({position:anchor.clone().addScaledVector(direction,6.9).toArray(),target:anchor.toArray(),duration:.8});}
  function projectLabels(){scene.updateMatrixWorld();return REGIONS.map(r=>{const p=parts.find(p=>p.id===r.id&&p.side===1),world=new THREE.Vector3(...r.anchor).add(p.root.position),v=world.clone().project(camera);return {id:r.id,x:(v.x*.5+.5)*width,y:(-.5*v.y+.5)*height,visible:v.z<1&&v.z>-1&&(!r.internal||separation>.35)};});}
  const raycaster=new THREE.Raycaster();let pointerDown=null;
  function down(e){pointerDown=[e.clientX,e.clientY];}
  function up(e){if(!pointerDown||Math.hypot(e.clientX-pointerDown[0],e.clientY-pointerDown[1])>6){pointerDown=null;return;}pointerDown=null;const box=canvas.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-box.left)/box.width*2-1,1-(e.clientY-box.top)/box.height*2),camera);const hit=raycaster.intersectObjects(pickables)[0];if(hit)onSelect(hit.object.userData.region);}
  canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointerup',up);
  function resize(){const b=canvas.getBoundingClientRect(),w=Math.max(1,b.width),h=Math.max(1,b.height);if(w===width&&h===height)return;width=w;height=h;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();if(view==='overview')overview(0);}
  function render(dt){if(disposed)return;resize();rig.update(dt);renderer.render(scene,camera);}
  function rotate(angle){rig.cancelShot();const offset=camera.position.clone().sub(rig.controls.target);offset.applyAxisAngle(new THREE.Vector3(0,1,0),angle);camera.position.copy(rig.controls.target).add(offset);rig.controls.update();onUserIntent();}
  select(selected);setSeparation(0);resize();
  return {render,setSeparation,select,overview,focus,projectLabels,zoomBy:n=>{rig.zoomBy(n);onUserIntent();},panBy:(x,y)=>{rig.panBy(x,y);onUserIntent();},rotate,setReducedMotion:value=>rig.setReducedMotion(value),stats:()=>({separation,selected,parts:parts.length,triangles:renderer.info.render.triangles,camera:rig.getState(),transforms:parts.map(p=>({id:p.id,side:p.side,position:p.root.position.toArray()}))}),dispose(){disposed=true;canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointerup',up);rig.dispose();for(const r of resources)r.dispose();renderer.dispose();}};
}
