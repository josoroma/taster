import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { createCameraRig } from '../../../kit/camera-rig.mjs';
import { capturePose, applyAssembly, clamp01 } from '../../../kit/motion.mjs';

const CYAN=0x70f6ff, VIOLET=0xb697ff, WHITE=0xd9f9ff;
const TAU=Math.PI*2;

/** A conceptual circuit sculpture. Geometry is explanatory, not a hardware diagram. */
export function createBellScene(canvas,{reducedMotion=false,quality='high',onCameraChange=()=>{}}={}) {
  const scene=new THREE.Scene();
  scene.background=new THREE.Color(0x040a14);
  scene.fog=new THREE.FogExp2(0x040a14,.014);
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio||1,quality==='high'?1.75:1));
  renderer.info.autoReset=false;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.24;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  const camera=new THREE.PerspectiveCamera(38,1,.01,250);
  camera.position.set(5,6,15);
  const rig=createCameraRig(camera,canvas,{target:[0,-.8,0],radius:6,minDistance:3.4,maxDistance:45,reducedMotion,onUserIntent:()=>{focusName='custom';onCameraChange();}});
  rig.controls.rotateSpeed=.6;
  rig.controls.minPolarAngle=.18;
  rig.controls.maxPolarAngle=Math.PI*.83;
  const composer=new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene,camera));
  const bloom=new UnrealBloomPass(new THREE.Vector2(1,1),.8,.58,.7);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const resources=new Set();
  const own=resource=>(resources.add(resource),resource);
  const group=parent=>{const g=new THREE.Group();parent.add(g);return g;};
  const basic=(color,opacity=1)=>own(new THREE.MeshBasicMaterial({color,transparent:opacity<1,opacity,depthWrite:opacity===1}));
  const glow=(color,intensity=1,opacity=1)=>own(new THREE.MeshBasicMaterial({color:new THREE.Color(color).multiplyScalar(intensity),transparent:true,opacity,blending:THREE.AdditiveBlending,depthWrite:false}));
  const metal=(color=0x193b50)=>own(new THREE.MeshStandardMaterial({color,metalness:.55,roughness:.34}));
  const darkMetal=metal(0x132735),edgeMetal=metal(0x376477),silver=metal(0x71888e);
  const paleGlow=glow(CYAN,1.4),purpleGlow=glow(VIOLET,1.25),dimGlow=glow(0x26738b,.8,.5);
  const mesh=(parent,geometry,material,x=0,y=0,z=0)=>{const o=new THREE.Mesh(own(geometry),material);o.position.set(x,y,z);parent.add(o);return o;};
  function cylinder(parent,radius,height,material,y=0,x=0,z=0,segments=96){return mesh(parent,new THREE.CylinderGeometry(radius,radius,height,segments),material,x,y,z);}
  function ring(parent,radius,tube,material,y=0,x=0,z=0){const m=mesh(parent,new THREE.TorusGeometry(radius,tube,8,128),material,x,y,z);m.rotation.x=Math.PI/2;return m;}
  function path(parent,points,color,opacity=.4,closed=false){
    const g=own(new THREE.BufferGeometry().setFromPoints(points));
    const mat=own(new THREE.LineBasicMaterial({color,transparent:true,opacity,blending:THREE.AdditiveBlending,depthWrite:false}));
    const l=closed?new THREE.LineLoop(g,mat):new THREE.Line(g,mat);parent.add(l);return l;
  }
  function seeded(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
  const random=seeded(314159);
  function points(parent,positions,color,{size=.05,opacity=.6,attenuation=true}={}) {
    const geometry=own(new THREE.BufferGeometry());geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
    const mat=own(new THREE.ShaderMaterial({uniforms:{tint:{value:new THREE.Color(color)},size:{value:size},opacity:{value:opacity},pixelRatio:{value:renderer.getPixelRatio()}},vertexShader:`uniform float size; uniform float pixelRatio; void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=${attenuation?'clamp(size*420.0/max(1.,-mv.z),1.,30.)':'size'}*pixelRatio;}`,fragmentShader:'uniform vec3 tint; uniform float opacity; void main(){float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;float a=pow(1.-r*r,2.);gl_FragColor=vec4(tint,opacity*a);}',transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
    const p=new THREE.Points(geometry,mat);parent.add(p);return p;
  }
  const starPositions=[];
  for(let i=0;i<1000;i++){const r=28+random()*35,a=random()*TAU,u=random()*2-1,s=Math.sqrt(1-u*u);starPositions.push(Math.cos(a)*s*r,u*r,Math.sin(a)*s*r);}
  points(scene,starPositions,0x789eac,{size:1.5,opacity:.28,attenuation:false});
  const nebulaPositions=[];
  for(let i=0;i<280;i++){const a=random()*TAU,r=5.5+random()*9;nebulaPositions.push(Math.cos(a)*r,(random()-.5)*7-2,Math.sin(a)*r-4);}
  points(scene,nebulaPositions,0x408ba0,{size:.045,opacity:.2});

  scene.add(new THREE.HemisphereLight(0xb1d8ef,0x101626,2.25));
  const key=new THREE.DirectionalLight(0x85e6ff,4.6);key.position.set(-4,8,6);scene.add(key);
  const fill=new THREE.DirectionalLight(0xb4a2ff,3);fill.position.set(6,4,-5);scene.add(fill);
  const front=new THREE.DirectionalLight(0xffffff,1.1);front.position.set(0,2,7);scene.add(front);
  const floor=mesh(scene,new THREE.CircleGeometry(20,128),own(new THREE.MeshBasicMaterial({color:0x06101c,transparent:true,opacity:.45})),0,-3.55,0);floor.rotation.x=-Math.PI/2;
  const floorGrid=new THREE.PolarGridHelper(8,32,9,128,0x19374c,0x152c40);floorGrid.position.y=-3.52;floorGrid.material.transparent=true;floorGrid.material.opacity=.22;scene.add(floorGrid);resources.add(floorGrid.geometry);resources.add(floorGrid.material);

  const preparation=group(scene),gates=group(scene),readout=group(scene);
  preparation.position.y=-1.15;gates.position.y=-.57;readout.position.y=.1;
  const assembly=[{object:preparation,rest:capturePose(preparation),translation:[0,-1.65,0]},{object:gates,rest:capturePose(gates),translation:[0,0,0]},{object:readout,rest:capturePose(readout),translation:[0,1.85,0]}];
  cylinder(preparation,3.65,.18,darkMetal);
  cylinder(preparation,3.52,.1,edgeMetal,.12);
  cylinder(preparation,3.47,.035,metal(0x0b2230),.195);
  ring(preparation,3.6,.024,dimGlow,.04);
  ring(preparation,3.5,.013,paleGlow,.205);
  ring(preparation,3.15,.009,dimGlow,.218);
  ring(preparation,2.86,.007,dimGlow,.219);
  const boltGeometry=own(new THREE.CylinderGeometry(.045,.045,.035,6));
  const bolts=new THREE.InstancedMesh(boltGeometry,silver,32);const dummy=new THREE.Object3D();
  for(let i=0;i<32;i++){const a=i/32*TAU;dummy.position.set(Math.cos(a)*3.35,.225,Math.sin(a)*3.35);dummy.updateMatrix();bolts.setMatrixAt(i,dummy.matrix);}preparation.add(bolts);
  const ticksPositions=[];
  for(let i=0;i<100;i++){const a=i/100*TAU,r0=i%5===0?3.02:3.1;for(const r of [r0,3.19])ticksPositions.push(Math.cos(a)*r,.225,Math.sin(a)*r);}
  const ticksG=own(new THREE.BufferGeometry());ticksG.setAttribute('position',new THREE.Float32BufferAttribute(ticksPositions,3));const ticksMat=own(new THREE.LineBasicMaterial({color:0x7cb6c0,transparent:true,opacity:.4}));preparation.add(new THREE.LineSegments(ticksG,ticksMat));
  // Fine circuit traces remain attached to their own immutable assembly layer.
  for(let s of [-1,1])for(let i=0;i<6;i++){
    const z=(i-2.5)*.37;
    path(preparation,[new THREE.Vector3(s*3.1,.23,z),new THREE.Vector3(s*2.6,.23,z),new THREE.Vector3(s*2.2,.23,z*.6),new THREE.Vector3(s*.65,.23,z*.6)],s<0?0x4ae4e9:0xa78bef,.28);
    cylinder(preparation,.035,.012,s<0?paleGlow:purpleGlow,.235,s*3.1,z,10);
  }

  cylinder(gates,2.8,.12,metal(0x1e3448));
  cylinder(gates,2.68,.035,darkMetal,.078);
  ring(gates,2.75,.012,purpleGlow,.07);
  ring(gates,2.45,.008,dimGlow,.1);
  const chip=mesh(gates,new THREE.BoxGeometry(1.4,.16,1.4),edgeMetal,0,.2,0);chip.rotation.y=Math.PI/4;
  const chipTop=mesh(gates,new THREE.BoxGeometry(1.12,.035,1.12),metal(0x152739),0,.3,0);chipTop.rotation.y=Math.PI/4;
  const chipOutline=own(new THREE.BoxGeometry(.96,.025,.96));
  const chipLines=new THREE.LineSegments(own(new THREE.EdgesGeometry(chipOutline)),own(new THREE.LineBasicMaterial({color:CYAN,transparent:true,opacity:.5})));chipLines.position.y=.325;chipLines.rotation.y=Math.PI/4;gates.add(chipLines);
  for(let i=-3;i<=3;i++){
    const trace=mesh(gates,new THREE.BoxGeometry(.018,.008,.55),dimGlow,i*.12,.33,0);trace.rotation.y=Math.PI/4;
  }
  for(const s of [-1,1]){
    cylinder(gates,.76,.075,edgeMetal,.13,s*1.92,0);
    cylinder(gates,.67,.04,darkMetal,.18,s*1.92,0);
    ring(gates,.61,.018,s<0?paleGlow:purpleGlow,.207,s*1.92,0);
    ring(gates,.48,.008,dimGlow,.213,s*1.92,0);
    const inset=mesh(gates,new THREE.BoxGeometry(.5,.06,.5),metal(s<0?0x2a6d7b:0x5c4c84),s*1.92,.23,0);inset.rotation.y=Math.PI/4;
  }

  const globeParts=[];
  const globeRadius=1.24;
  const fresnelVertex='varying vec3 normalWorld; varying vec3 viewDirection;void main(){vec4 world=modelMatrix*vec4(position,1.);normalWorld=normalize(mat3(modelMatrix)*normal);viewDirection=normalize(cameraPosition-world.xyz);gl_Position=projectionMatrix*viewMatrix*world;}';
  const fresnelFragment='uniform vec3 tint;varying vec3 normalWorld;varying vec3 viewDirection;void main(){float f=pow(1.-abs(dot(normalize(normalWorld),normalize(viewDirection))),3.);gl_FragColor=vec4(tint,.018+f*.22);}';
  for(let q=0;q<2;q++){
    const color=q===0?CYAN:VIOLET,c=new THREE.Color(color),g=group(readout);g.position.set(q===0?-1.92:1.92,1.42,0);
    const shellMaterial=own(new THREE.ShaderMaterial({uniforms:{tint:{value:c}},vertexShader:fresnelVertex,fragmentShader:fresnelFragment,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.FrontSide}));
    mesh(g,new THREE.SphereGeometry(globeRadius,48,32),shellMaterial);
    // Latitude and meridian lines are coordinate guides, not electron orbits.
    const gridGroup=group(g);
    for(let latitude=-2;latitude<=2;latitude++){
      const y=latitude*globeRadius/3,r=Math.sqrt(globeRadius*globeRadius-y*y),pts=[];
      for(let i=0;i<=100;i++){const a=i/100*TAU;pts.push(new THREE.Vector3(Math.cos(a)*r,y,Math.sin(a)*r));}
      path(gridGroup,pts,color,latitude===0?.3:.105);
    }
    for(let longitude=0;longitude<6;longitude++){
      const a=longitude/6*Math.PI,pts=[];
      for(let i=0;i<=100;i++){const t=i/100*TAU;pts.push(new THREE.Vector3(Math.cos(t)*Math.cos(a)*globeRadius,Math.sin(t)*globeRadius,Math.cos(t)*Math.sin(a)*globeRadius));}
      path(gridGroup,pts,color,.12);
    }
    // Nearly invisible axes give the state vector a stable spatial reference.
    const axes=[];for(let axis=0;axis<3;axis++){const p=new THREE.Vector3();p.setComponent(axis,-globeRadius*1.16);const p2=p.clone().negate();axes.push(p,p2);}
    for(let i=0;i<axes.length;i+=2)path(g,[axes[i],axes[i+1]],color,.15);
    for(let sign of [-1,1]){
      const pole=mesh(g,new THREE.TorusGeometry(.062,.009,6,24),glow(color,1.1),0,sign*globeRadius,0);pole.rotation.x=Math.PI/2;
    }
    const cloudPositions=[];
    for(let i=0;i<950;i++){const a=random()*TAU,u=random()*2-1,r=globeRadius*(.95+.04*random()),s=Math.sqrt(1-u*u);cloudPositions.push(Math.cos(a)*s*r,u*r,Math.sin(a)*s*r);}
    const cloud=points(g,cloudPositions,color,{size:.036,opacity:.4});
    const core=mesh(g,new THREE.SphereGeometry(.047,20,16),glow(color,3));
    const arrow=group(g),shaft=mesh(arrow,new THREE.CylinderGeometry(.022,.022,1,12),glow(color,1.7),0,.5,0);
    const tip=mesh(arrow,new THREE.ConeGeometry(.085,.18,20),glow(color,2),0,1,0);
    const endpoint=mesh(g,new THREE.SphereGeometry(.065,20,16),glow(color,4));
    const halo=points(g,[0,0,0],color,{size:.7,opacity:.8});
    const stem=path(readout,[new THREE.Vector3(g.position.x,.18,0),new THREE.Vector3(g.position.x,.49,0)],color,.2);
    globeParts.push({group:g,gridGroup,cloud,core,arrow,shaft,tip,endpoint,halo,stem,color});
  }

  // Correlation ribbons are a visual metaphor; opacity follows the model’s concurrence.
  const ribbonGroup=group(readout);ribbonGroup.position.y=1.42;
  const ribbonMaterials=[];
  for(let strand=0;strand<7;strand++){
    const pts=[];
    for(let i=0;i<=90;i++){
      const t=i/90,x=-1.9+t*3.8,envelope=Math.sin(t*Math.PI),a=t*TAU*1.4+strand/7*TAU;
      pts.push(new THREE.Vector3(x,Math.sin(a)*envelope*.34,Math.cos(a)*envelope*.34));
    }
    const mat=glow(strand%2?VIOLET:CYAN,1.1,.025);ribbonMaterials.push(mat);
    mesh(ribbonGroup,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),90,strand===0?.014:.006,5,false),mat);
  }
  const ribbonPoints=[];
  for(let i=0;i<150;i++){const t=random(),a=random()*TAU,r=Math.sin(t*Math.PI)*.35;ribbonPoints.push((t-.5)*3.8,Math.sin(a)*r,Math.cos(a)*r);}
  const correlationMotes=points(ribbonGroup,ribbonPoints,WHITE,{size:.035,opacity:0});

  // Four joint-outcome probability bars, rooted in a separate front readout shelf.
  const barRoot=group(readout);barRoot.position.set(0,-.75,2.28);
  const barShelf=mesh(barRoot,new THREE.BoxGeometry(3.9,.12,.83),metal(0x173447),0,0,0);
  const shelfEdges=new THREE.LineSegments(own(new THREE.EdgesGeometry(barShelf.geometry)),own(new THREE.LineBasicMaterial({color:0x4a8fa2,transparent:true,opacity:.3})));barRoot.add(shelfEdges);
  const bars=[];
  for(let i=0;i<4;i++){
    const x=(i-1.5)*.91,col=i<2?CYAN:VIOLET;
    mesh(barRoot,new THREE.BoxGeometry(.55,.02,.48),metal(0x314655),x,.075,0);
    const mat=own(new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:.35,metalness:.3,roughness:.18,transparent:true,opacity:.72}));
    const bar=mesh(barRoot,new THREE.BoxGeometry(.43,1,.35),mat,x,.1,0);
    const cap=mesh(barRoot,new THREE.BoxGeometry(.46,.016,.38),glow(col,1.5),x,.11,0);
    bars.push({bar,cap});
    for(let j=0;j<2;j++){
      const stateDigit=(i>>(1-j))&1;
      const dot=mesh(barRoot,new THREE.TorusGeometry(.035,.008,5,12),glow(col,.7,.6),x+(j-.5)*.12,.085,.3);dot.rotation.x=Math.PI/2;
      if(stateDigit)mesh(barRoot,new THREE.BoxGeometry(.012,.01,.055),glow(col,1.3),x+(j-.5)*.12,.085,.3);
    }
  }
  // Assembly alignment guides extend from the actual transformed layer origins.
  const guidePositions=new Float32Array(4*2*3),guideGeometry=own(new THREE.BufferGeometry());guideGeometry.setAttribute('position',new THREE.BufferAttribute(guidePositions,3));
  const guideMaterial=own(new THREE.LineDashedMaterial({color:0x6d9bac,transparent:true,opacity:0,dashSize:.09,gapSize:.13,depthWrite:false}));
  const guides=new THREE.LineSegments(guideGeometry,guideMaterial);scene.add(guides);

  let elapsed=0,explode=0,focusName='overview',disposed=false,width=0,height=0,lastEntanglement=0;
  const vector=new THREE.Vector3(),up=new THREE.Vector3(0,1,0);
  function overview(duration=.8){
    focusName='overview';
    // The aim is below the object so that camera controls can occupy the bottom edge.
    const portrait=width/height<.85;
    rig.fit({center:[0,(portrait?-.9:-.65)+explode*.35,0],radius:(portrait?4.45:4.65)+explode*1.5,direction:[.22,.35,1],duration});
  }
  function resize(){
    const rect=canvas.getBoundingClientRect();const w=Math.max(1,Math.round(rect.width)),h=Math.max(1,Math.round(rect.height));
    if(w===width&&h===height)return;
    width=w;height=h;renderer.setSize(w,h,false);composer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();
    if(focusName==='overview')overview(0);
  }
  function setExplode(value){
    const next=clamp01(Number.isFinite(value)?value:0);
    if(next===explode)return;
    explode=next;applyAssembly(assembly,explode);
    guideMaterial.opacity=explode*.24;
    for(let i=0;i<4;i++){
      const a=Math.PI/4+i*Math.PI/2,x=Math.cos(a)*2.55,z=Math.sin(a)*2.55;
      guidePositions.set([x,preparation.position.y+.2,z,x,readout.position.y+.05,z],i*6);
    }
    guideGeometry.attributes.position.needsUpdate=true;guides.computeLineDistances();
    if(focusName==='overview'&&width)overview(0);
  }
  function setFocus(name){
    focusName=name;
    if(name==='overview'){overview();return;}
    if(name==='qubit0'||name==='qubit1'){
      const q=name==='qubit0'?0:1,p=globeParts[q].group.getWorldPosition(new THREE.Vector3());
      rig.focus({position:[p.x+.55,p.y+1.4,p.z+6.1],target:[p.x,p.y-.32,p.z],duration:.9});
    }else if(name==='readout'){
      const p=barRoot.getWorldPosition(new THREE.Vector3());
      rig.focus({position:[p.x+.5,p.y+3,p.z+6.8],target:[p.x,p.y+.25,p.z],duration:.9});
    }
  }
  function render(view={},dt=0){
    if(disposed)return;
    resize();if(!reducedMotion)elapsed+=Math.min(.1,Math.max(0,dt));
    if(Number.isFinite(view.explode)&&view.explode!==explode)setExplode(view.explode);
    const entanglement=clamp01(view.entanglement||0);lastEntanglement=entanglement;
    globeParts.forEach((g,q)=>{
      const b=view.bloch?.[q]||{x:0,y:0,z:1};
      // Physics convention z is north; Three.js scene convention y is vertical.
      vector.set(b.x,b.z,-b.y);const length=Math.min(1,vector.length()),L=length*globeRadius*.94;
      g.arrow.visible=L>.015;g.endpoint.visible=L>.015;
      if(L>.015){
        vector.normalize();g.arrow.quaternion.setFromUnitVectors(up,vector);
        const tipHeight=Math.min(.17,L*.3);g.shaft.scale.y=Math.max(.001,L-tipHeight);g.shaft.position.y=(L-tipHeight)/2;
        g.tip.scale.setScalar(Math.min(1,L/.4));g.tip.position.y=L-tipHeight/2;
        g.endpoint.position.copy(vector).multiplyScalar(L);g.halo.position.copy(g.endpoint.position);
      }else g.halo.position.set(0,0,0);
      g.halo.material.uniforms.opacity.value=.45+length*.3;
      g.core.scale.setScalar(1+entanglement*.6);
      g.cloud.material.uniforms.opacity.value=.24+entanglement*.38;
      // Coordinate guides stay fixed; only a sparse decorative surface cloud drifts.
      g.cloud.rotation.y=reducedMotion?0:elapsed*(q===0?.018:-.014);
    });
    ribbonMaterials.forEach((m,i)=>m.opacity=.014+entanglement*(i===0?.65:.3));
    correlationMotes.material.uniforms.opacity.value=entanglement*.6;
    ribbonGroup.rotation.x=reducedMotion?0:Math.sin(elapsed*.35)*.12;
    for(let i=0;i<4;i++){
      const p=clamp01(view.probabilities?.[i]??(i===0?1:0)),h=Math.max(.012,p*1.2);
      bars[i].bar.scale.y=h;bars[i].bar.position.y=.09+h/2;bars[i].cap.position.y=.09+h;
    }
    bloom.strength=quality==='high'?.78:.4;
    rig.update(dt);
    renderer.info.reset();
    if(quality==='high')composer.render();else renderer.render(scene,camera);
  }
  function setQuality(value){quality=value;renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio||1,value==='high'?1.75:1));composer.setPixelRatio(renderer.getPixelRatio());resources.forEach(r=>{if(r.uniforms?.pixelRatio)r.uniforms.pixelRatio.value=renderer.getPixelRatio();});width=0;resize();}
  function dispose(){
    if(disposed)return;disposed=true;rig.dispose();composer.dispose();bloom.dispose();
    resources.forEach(r=>r.dispose?.());renderer.dispose();
  }
  resize();setExplode(0);
  return {
    render,resize,setExplode,setFocus,cancelCameraShot:()=>rig.cancelShot(),resetCamera:()=>overview(),zoomBy:factor=>rig.zoomBy(factor),panBy:(x,y)=>rig.panBy(x,y),setReducedMotion(value){reducedMotion=!!value;rig.setReducedMotion(value);},setQuality,dispose,
    stats:()=>({calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,points:renderer.info.render.points,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,quality,explode,entanglement:lastEntanglement,focus:focusName,camera:rig.getState()}),
    getAssemblyState:()=>assembly.map(p=>({position:p.object.position.toArray(),quaternion:p.object.quaternion.toArray(),scale:p.object.scale.toArray(),rest:p.rest})),
  };
}
