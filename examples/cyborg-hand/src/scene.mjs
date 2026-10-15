import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {createCameraRig} from '../../../kit/camera-rig.mjs';
import {sampleGrip,FINGERS,THUMB} from './model.mjs';

// A designed kinematic specimen. Coordinates and decorative mechanisms are not
// manufacturing geometry, a force simulation, or a validated robot design.
const DIGITS=FINGERS;
const VIEWS={'three-quarter':[-7,2.6,-12],palm:[0,.5,-15],back:[10,3,8],side:[15,.4,.5]};
const clamp=x=>Math.max(0,Math.min(1,Number.isFinite(x)?x:0));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};

export function createHandScene(canvas,{reducedMotion=false,onSelect=()=>{},onUserIntent=()=>{}}={}){
  const context=canvas.getContext('webgl2',{antialias:true,alpha:true});
  if(!context)throw new Error('WebGL 2 is unavailable');
  const renderer=new THREE.WebGLRenderer({canvas,context,antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio||1,1.7));
  renderer.setClearColor(0x0b1010,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.02;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
  const scene=new THREE.Scene();
  const camera=new THREE.OrthographicCamera(-4,4,4,-4,.05,100);camera.position.set(5.5,3.1,12);
  const rig=createCameraRig(camera,canvas,{target:[0,.55,0],radius:4,minDistance:2,maxDistance:32,reducedMotion,onUserIntent});
  rig.controls.rotateSpeed=.65;rig.controls.enablePan=true;
  const resources=new Set(),pickables=[],parts=new Map(),labels=[],joints=[],armor=[],fasteners=[];
  const own=x=>(resources.add(x),x);
  const pmrem=new THREE.PMREMGenerator(renderer),environment=new RoomEnvironment();
  const envTarget=pmrem.fromScene(environment,.035);scene.environment=envTarget.texture;scene.environmentIntensity=.85;environment.dispose();pmrem.dispose();
  scene.add(new THREE.HemisphereLight('#e1e7e5','#151a19',1.25));
  const key=new THREE.DirectionalLight('#f7faf7',3.8);key.position.set(-4,7,8);key.castShadow=true;
  key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-5;key.shadow.camera.right=5;key.shadow.camera.top=6;key.shadow.camera.bottom=-5;key.shadow.normalBias=.03;key.shadow.bias=-.00025;scene.add(key);
  const rim=new THREE.DirectionalLight('#b2d5c8',3.6);rim.position.set(4,3,-5);scene.add(rim);
  const soft=new THREE.DirectionalLight('#c3cbd2',1.3);soft.position.set(-5,-2,-4);scene.add(soft);
  const mat=(color,metalness=.7,roughness=.3,extra={})=>own(new THREE.MeshStandardMaterial({color,metalness,roughness,...extra}));
  const silver=mat('#b7c2c0',.88,.24),lightSilver=mat('#d5dcd7',.86,.23),titanium=mat('#73827e',.82,.3),dark=mat('#161f1d',.66,.36),black=mat('#080f0d',.15,.7),rubber=mat('#19201e',.05,.9),copper=mat('#a2aa88',.78,.29),mint=mat('#86bda3',.6,.28,{emissive:'#7ebf9d',emissiveIntensity:.32}),circuit=mat('#2d4839',.3,.4),glass=mat('#102a20',.6,.2);
  const sphere=own(new THREE.SphereGeometry(1,24,16));
  const cylinder=own(new THREE.CylinderGeometry(1,1,1,32));
  const screwGeometry=own(new THREE.CylinderGeometry(.052,.052,.025,12));
  const root=new THREE.Group();scene.add(root);
  let disposed=false,width=1,height=1,grip=0,separation=0,selected='fingers',view='three-quarter';
  function mesh(parent,geometry,material,position=[0,0,0],scale){const o=new THREE.Mesh(geometry,material);o.position.fromArray(position);if(scale)o.scale.fromArray(scale);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
  function box(parent,size,position,material=dark,r=.06){return mesh(parent,own(new RoundedBoxGeometry(...size,3,Math.min(r,...size.map(v=>v*.45)))),material,position);}
  function cyl(parent,r,length,position,material=silver,axis='y'){const o=mesh(parent,cylinder,material,position,[r,length,r]);if(axis==='x')o.rotation.z=Math.PI/2;if(axis==='z')o.rotation.x=Math.PI/2;return o;}
  function wire(parent,points,r=.018,material=dark){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));return mesh(parent,own(new THREE.TubeGeometry(curve,Math.max(8,points.length*8),r,6,false)),material);}
  function idGroup(id,parent=root){const g=new THREE.Group();g.userData.part=id;parent.add(g);parts.set(id,g);return g;}
  function mark(group,id,label,p){const a=new THREE.Object3D();a.position.fromArray(p);group.add(a);labels.push({id,label,object:a});}
  function screw(parent,x,y,z){const o=mesh(parent,screwGeometry,titanium,[x,y,z]);o.rotation.x=Math.PI/2;fasteners.push(o);const slit=box(parent,[.062,.013,.009],[x,y,z+.016],black,.002);return o;}
  function plate(parent,points,depth,position,material,bevel=.05){const shape=new THREE.Shape();points.forEach((p,i)=>i?shape.lineTo(...p):shape.moveTo(...p));shape.closePath();const geom=own(new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:bevel>0,bevelSegments:2,steps:1,bevelSize:bevel,bevelThickness:bevel,curveSegments:8}));return mesh(parent,geom,material,position);}
  const palm=idGroup('palm');
  const palmOutline=[[-.72,-1.20],[.69,-1.20],[1.04,-.68],[1.12,.65],[.99,1.22],[-1.02,1.22],[-1.15,.55],[-1.12,-.48]];
  plate(palm,palmOutline,.46,[0,0,-.25],dark,.09);
  // Skeleton ribs are visible through gaps rather than a transparent fake shell.
  for(let i=0;i<4;i++){const x=[-.82,-.27,.32,.83][i];box(palm,[.13,1.9,.13],[x,.12,.25],titanium,.035);}
  box(palm,[1.60,.22,.55],[0,-.9,.02],titanium,.05);
  for(let side of [-1,1]){box(palm,[.16,1.33,.39],[side*1.02,-.05,.03],silver,.05);for(let j=0;j<3;j++)box(palm,[.19,.032,.18],[side*1.11,-.36+j*.21,.10],black,.009);}
  // Contact pads on the palm remain attached to the functional chassis.
  box(palm,[1.32,.90,.15],[0,-.18,-.34],rubber,.12);
  for(let y=-.48;y<=.2;y+=.13)box(palm,[1.08,.028,.025],[0,y,-.426],dark,.009);
  for(let x of [-.76,.76]){box(palm,[.38,.88,.10],[x,.40,-.32],titanium,.09);box(palm,[.28,.70,.11],[x,.41,-.39],rubber,.065);}
  for(let side of [-1,1]){
    const p=plate(palm,[[-.35,-.31],[.30,-.31],[.39,.27],[.12,.38],[-.32,.12]],.08,[side*.54,-.78,-.33],silver,.035);p.rotation.y=Math.PI;
    for(let y of [-.71,.67]){const screw=cyl(palm,.05,.03,[side*.85,y,-.37],titanium,'z');}
    box(palm,[.10,.32,.025],[side*.90,-.16,-.38],mint,.018);
  }
  box(palm,[1.03,.25,.08],[0,.88,-.31],titanium,.05);
  for(let i=0;i<5;i++)box(palm,[.10,.05,.025],[-.32+i*.16,.87,-.37],dark,.01);
  for(let x of [-.72,.72])for(let y of [-.79,.83])screw(palm,x,y,.31);
  const cassette=idGroup('actuators');cassette.position.set(0,-.13,.27);const cassetteRest=cassette.position.clone();
  box(cassette,[1.72,1.5,.13],[0,0,0],black,.08);
  for(let i=0;i<4;i++){
    const x=-.63+i*.42;
    cyl(cassette,.135,.82,[x,-.13,.13],titanium);
    cyl(cassette,.147,.16,[x,-.54,.13],dark);
    cyl(cassette,.06,.39,[x,.44,.13],silver);
    for(let j=0;j<5;j++)cyl(cassette,.144,.025,[x,-.4+j*.12,.13],dark);
    box(cassette,[.055,.09,.04],[x,-.55,.28],mint,.008);
  }
  box(cassette,[1.43,.25,.08],[0,.70,.13],circuit,.02);
  for(let i=0;i<8;i++)box(cassette,[.07,.07,.045],[-.58+i*.165,.70,.2],copper,.004);
  mark(cassette,'actuators','Actuator cassette',[.67,-.05,.3]);
  // The dorsal cover has distinct layered paneling and restrained illuminated seams.
  const carapace=idGroup('carapace');carapace.position.set(0,0,.56);const carapaceRest=carapace.position.clone();
  const coverOutline=[[-.69,-.94],[.63,-.94],[.89,-.57],[.96,.50],[.77,.94],[-.81,.94],[-.96,.50],[-.91,-.49]];
  plate(carapace,coverOutline,.10,[0,0,0],silver,.055);
  plate(carapace,[[-.40,-.75],[.38,-.75],[.55,-.42],[.53,.60],[.34,.75],[-.37,.75],[-.55,.54],[-.55,-.44]],.055,[0,0,.115],dark,.027);
  box(carapace,[.15,1.02,.03],[-.18,.0,.20],mint,.025);
  box(carapace,[.15,.46,.035],[.10,.28,.20],titanium,.025);
  box(carapace,[.15,.29,.035],[.10,-.21,.20],glass,.025);
  for(let y of [-.59,.58])for(let x of [-.68,.68])screw(carapace,x,y,.175);
  for(let s of [-1,1])for(let j=0;j<4;j++)box(carapace,[.22,.025,.018],[s*.69,-.28+j*.16,.17],black,.006);
  mark(carapace,'carapace','Dorsal armor',[.65,.30,.18]);mark(palm,'palm','Palm chassis',[.98,-.5,.18]);
  const wrist=idGroup('wrist');wrist.position.y=-1.24;
  cyl(wrist,.47,1.36,[0,-.22,0],black,'x');cyl(wrist,.36,1.49,[0,-.22,0],silver,'x');
  for(let side of [-1,1]){cyl(wrist,.22,.055,[side*.77,-.22,0],dark,'x');cyl(wrist,.11,.065,[side*.81,-.22,0],copper,'x');}
  box(wrist,[1.25,.51,.71],[0,-.49,0],dark,.12);
  const cuff=idGroup('cuff');cuff.position.set(0,-2.30,0);
  box(cuff,[1.57,1.28,.83],[0,0,0],titanium,.13);
  box(cuff,[1.34,1.35,.88],[0,0,0],dark,.1);
  for(let x of [-.57,.57])box(cuff,[.20,1.20,.17],[x,0,.43],silver,.04);
  box(cuff,[.66,.95,.13],[0,.04,.47],silver,.065);
  box(cuff,[.38,.13,.025],[0,-.12,.55],glass,.02);
  for(let i=0;i<4;i++)box(cuff,[.032,.065,.028],[-.10+i*.065,-.12,.57],mint,.004);
  for(let side of [-1,1])for(let y of [-.44,.44])screw(cuff,side*.53,y,.535);
  for(let j=0;j<6;j++)box(cuff,[1.00,.036,.06],[0,-.49+j*.18,-.46],rubber,.01);
  cyl(cuff,.50,.16,[0,-.71,0],black);cyl(cuff,.40,.10,[0,-.82,0],silver);
  for(const p of [[.73,-.20,.12],[-.73,-.20,.12],[0,-.22,-.45],[0,-.22,.45]])mark(wrist,'wrist','Wrist coupling',p);
  mark(cuff,'cuff','Power + control',[.64,-.3,.45]);
  // Four true nested revolute chains. All visible details travel with their link.
  const chains=[];const fingerAssembly=idGroup('fingers');
  function hinge(parent,w,position=[0,0,0]){
    cyl(parent,.165,w+.08,position,black,'x');
    for(let side of [-1,1]){cyl(parent,.139,.045,[position[0]+side*(w/2+.035),position[1],position[2]],silver,'x');cyl(parent,.073,.055,[position[0]+side*(w/2+.06),position[1],position[2]],dark,'x');cyl(parent,.026,.06,[position[0]+side*(w/2+.071),position[1],position[2]],copper,'x');}
  }
  function segment(parent,length,w,last=false){
    box(parent,[w*.66,length-.06,.23],[0,length/2,0],dark,.055);
    const skin=new THREE.Group();parent.add(skin);armor.push({object:skin,rest:skin.position.clone()});
    const l=length-.22;
    box(skin,[w*.92,l,.13],[0,length/2,.175],silver,.07);
    box(skin,[w*.60,l*.67,.029],[0,length/2,.258],lightSilver,.035);
    if(!last){box(skin,[w*.53,.045,.027],[0,length*.36,.28],mint,.009);screw(skin,0,length*.68,.284);}
    else{box(skin,[w*.56,l*.54,.045],[0,length*.59,.285],dark,.04);}
    box(parent,[w*.83,length*.68,.08],[0,length*.5,-.15],titanium,.06);
    box(parent,[w*.65,length*.58,.12],[0,length*.5,-.205],rubber,.05);
    for(let k=0;k<3;k++)box(parent,[w*.60,.024,.026],[0,length*(.34+k*.16),-.26],black,.007);
    for(let side of [-1,1]){cyl(parent,.028,length*.63,[side*w*.30,length*.50,-.15],titanium);}
    return skin;
  }
  for(const spec of DIGITS){
    const base=idGroup(spec.id,fingerAssembly);base.position.set(spec.x,spec.baseY,0);base.rotation.z=spec.splay;
    let parent=base;const chain=[];
    spec.lengths.forEach((length,i)=>{const pivot=new THREE.Group();if(i)pivot.position.y=spec.lengths[i-1];parent.add(pivot);hinge(pivot,spec.width*(1-i*.06));segment(pivot,length,spec.width*(1-i*.06),i===2);chain.push(pivot);joints.push({id:`${spec.id}-${i}`,pivot});parent=pivot;});
    mark(chain[1],spec.id,`${spec.id[0].toUpperCase()+spec.id.slice(1)} linkage`,[spec.width/2,.25,.22]);
    mark(chain[1],spec.id,'Articulated fingers',[0,spec.lengths[1]/2,-.25]);
    chains.push({spec,base,chain});
    const x=spec.x;wire(palm,[[x*.66,-.68,.23],[x*.9,.35,.23],[x,1.03,.12]],.022,black);
    wire(palm,[[x*.66,-.68,.26],[x*.92,.35,.28],[x,1.04,.17]],.012,copper);
  }
  // Root opposition rotates the whole thumb before its local flexion joints.
  const thumb=idGroup('thumb');thumb.position.fromArray(THUMB.origin);
  const opposition=new THREE.Group(),spread=new THREE.Group(),thumbBase=new THREE.Group(),thumbTip=new THREE.Group();thumb.add(opposition);opposition.add(spread);spread.add(thumbBase);thumbBase.add(thumbTip);thumbTip.position.y=THUMB.lengths[0];
  hinge(thumbBase,.50);segment(thumbBase,THUMB.lengths[0],.50);hinge(thumbTip,.44);segment(thumbTip,THUMB.lengths[1],.44,true);
  const thumbBall=mesh(palm,sphere,titanium,[-1.01,-.17,-.05],[.28,.29,.29]);
  mark(thumbTip,'thumb','Opposing thumb',[0,.36,.18]);
  // A single dorsal anchor can fold behind a finger while the thumb's pad is
  // still exposed. Keep alternatives attached to both links, on both faces.
  for(const [link,length]of [[thumbTip,THUMB.lengths[1]],[thumbBase,THUMB.lengths[0]]]){
    for(const p of [[0,length/2,-.25],[0,length/2,.25],[-.20,length/2,0],[.20,length/2,0]])mark(link,'thumb','Opposing thumb',p);
  }
  joints.push({id:'thumb-base',pivot:thumbBase},{id:'thumb-tip',pivot:thumbTip});
  // Ghost guides show the withdrawal direction, not a fabricated connection.
  const guideMaterial=own(new THREE.LineDashedMaterial({color:'#6c9681',transparent:true,opacity:.38,dashSize:.035,gapSize:.07}));
  const guidePositions=new Float32Array(24),guideGeometry=own(new THREE.BufferGeometry());guideGeometry.setAttribute('position',new THREE.BufferAttribute(guidePositions,3));
  const guides=new THREE.LineSegments(guideGeometry,guideMaterial);root.add(guides);guides.visible=false;
  // Quiet datum field: sparse ticks and a fixed floor, with no decorative rain.
  const datum=new THREE.Group();scene.add(datum);
  const ground=mesh(datum,own(new THREE.PlaneGeometry(28,28)),own(new THREE.ShadowMaterial({color:'#000000',opacity:.24})),[0,-3.18,0]);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;ground.castShadow=false;
  const grid=new THREE.GridHelper(20,40,'#31503e','#263b30');grid.material.transparent=true;grid.material.opacity=.13;grid.position.y=-3.17;datum.add(grid);
  const circlePoints=[];for(let i=0;i<=120;i++){const a=i*Math.PI*2/120;circlePoints.push(new THREE.Vector3(Math.cos(a)*2.35,-3.15,Math.sin(a)*2.35));}
  datum.add(new THREE.Line(own(new THREE.BufferGeometry().setFromPoints(circlePoints)),own(new THREE.LineBasicMaterial({color:'#60806b',transparent:true,opacity:.35}))));
  // Combine static details within each articulated owner. Moving plates stay in
  // their own groups, so batching never breaks pivots or separation transforms.
  const mergeOwners=[];root.traverse(g=>{if(g.isGroup)mergeOwners.push(g);});
  for(const group of mergeOwners){
    const batches=new Map();for(const o of [...group.children])if(o.isMesh){if(!batches.has(o.material))batches.set(o.material,[]);batches.get(o.material).push(o);}
    for(const [material,objects]of batches){if(objects.length<2)continue;const geometries=objects.map(o=>{o.updateMatrix();const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();return g.applyMatrix4(o.matrix);});const geometry=mergeGeometries(geometries,false);for(const g of geometries)g.dispose();if(!geometry)continue;own(geometry);const combined=mesh(group,geometry,material);for(const o of objects)group.remove(o);}
  }
  const highlightMaterials=new Map();
  root.traverse(o=>{if(o.isMesh){pickables.push(o);let p=o;while(p&&!p.userData.part)p=p.parent;if(p){o.userData.part=p.userData.part;let id=p.userData.part;if(DIGITS.some(d=>d.id===id))id='fingers';if(id==='cuff')id='wrist';o.userData.selection=id;const key=id+':'+o.material.uuid;if(!highlightMaterials.has(key)){const m=own(o.material.clone());highlightMaterials.set(key,{id,material:m,emissive:m.emissive?.clone(),strength:m.emissiveIntensity});}o.material=highlightMaterials.get(key).material;}}});
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let down=null;
  const pointerDown=e=>{down={x:e.clientX,y:e.clientY};};
  const pointerUp=e=>{if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>6){down=null;return;}down=null;const rect=canvas.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(pickables,false).find(h=>h.object.userData.part);if(hit){let id=hit.object.userData.part;if(DIGITS.some(d=>d.id===id))id='fingers';if(id==='palm')id='actuators';if(id==='cuff')id='wrist';onSelect(id);};};
  const pointerCancel=()=>{down=null;};canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointerup',pointerUp);canvas.addEventListener('pointercancel',pointerCancel);
  function setPose(pose={}){
    grip=clamp(pose.grip??grip);separation=clamp(pose.separation??separation);
    const state=sampleGrip(grip);
    for(const {spec,base,chain}of chains){const d=state.fingers?.find?.(f=>f.id===spec.id)??state.fingers?.[spec.id];const angles=d?.angles??[1.36,1.70,1.12].map(a=>a*smooth(grip));chain.forEach((j,i)=>j.rotation.x=-angles[i]);base.rotation.z=d?.splay??spec.splay*(1-grip);}
    const t=state.thumb??{};opposition.rotation.y=t.opposition??(THUMB.maxOpposition*smooth(grip));spread.rotation.z=t.spread??(THUMB.openSpread+(THUMB.closedSpread-THUMB.openSpread)*smooth(grip));thumbBase.rotation.x=-(t.base??(THUMB.maxBase*smooth(grip)));thumbTip.rotation.x=-(t.tip??(THUMB.maxTip*smooth(grip)));
    const outer=smooth(separation/.67),inner=smooth((separation-.28)/.72),link=smooth((separation-.42)/.58);
    carapace.position.copy(carapaceRest).add(new THREE.Vector3(0,.12*outer,2.8*outer));
    cassette.position.copy(cassetteRest).add(new THREE.Vector3(0,0,1.25*inner));
    for(const a of armor)a.object.position.copy(a.rest).setZ(a.rest.z+.36*link);
    guides.visible=separation>.01;
    const anchors=[[-.68,-.59], [.68,-.59],[-.68,.58],[.68,.58]];
    anchors.forEach(([x,y],i)=>{guidePositions.set([x,y,.35,x,y+.12*outer,.71+2.8*outer],i*6);});guideGeometry.attributes.position.needsUpdate=true;guides.computeLineDistances();
    root.updateMatrixWorld(true);
  }
  function fitFrame(duration=.7,expanded=separation>.05,direction=VIEWS[view]){
    // Author a stable open-hand envelope: closing does not change magnification.
    const center=expanded?[0,.48,.60]:[0,.43,0];
    const aspect=Math.max(.25,width/height),heightSpan=8.25,widthSpan=expanded?7.7:5.4;
    const span=Math.max(heightSpan,widthSpan/aspect);
    rig.focus({position:new THREE.Vector3(...center).add(new THREE.Vector3(...direction).normalize().multiplyScalar(16)).toArray(),target:center,zoom:8/span,duration:reducedMotion?0:duration});
  }
  function resize(){const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight);if(w===width&&h===height)return;const first=width===1;width=w;height=h;renderer.setSize(w,h,false);camera.left=-4*w/h;camera.right=4*w/h;camera.top=4;camera.bottom=-4;camera.updateProjectionMatrix();if(first)fitFrame(0);}
  function select(id){if(!parts.has(id))return;selected=id;for(const item of highlightMaterials.values()){if(!item.material.emissive)continue;item.material.emissive.copy(item.emissive);item.material.emissiveIntensity=item.strength;if(item.id===id){item.material.emissive.set('#4d8a68');item.material.emissiveIntensity=.16;}}}
  function focus(id){const part=parts.get(id);if(!part)return;selected=id;root.updateMatrixWorld(true);const box3=new THREE.Box3().setFromObject(part),sphere3=box3.getBoundingSphere(new THREE.Sphere());rig.fit({center:sphere3.center.toArray(),radius:Math.max(.6,sphere3.radius),duration:reducedMotion?0:.7});}
  function setView(id,{expanded=separation>.05,duration=.75}={}){if(!VIEWS[id])return;view=id;fitFrame(duration,expanded,VIEWS[id]);}
  const world=new THREE.Vector3(),ndc=new THREE.Vector3(),labelPointer=new THREE.Vector2();
  const labelGroups=new Map(),activeAnchors=new Map();
  for(const item of labels){
    const id=DIGITS.some(d=>d.id===item.id)?'fingers':item.id;
    if(!['carapace','thumb','wrist','fingers','actuators'].includes(id))continue;
    if(!labelGroups.has(id))labelGroups.set(id,[]);
    labelGroups.get(id).push(item);
  }
  function projectLabels(){
    root.updateMatrixWorld(true);camera.updateMatrixWorld(true);
    function project(item,id){
      item.object.getWorldPosition(world);ndc.copy(world).project(camera);
      let visible=ndc.z>-1&&ndc.z<1&&Math.abs(ndc.x)<.91&&Math.abs(ndc.y)<.91;
      if(visible){
        raycaster.setFromCamera(labelPointer.set(ndc.x,ndc.y),camera);
        const hit=raycaster.intersectObjects(pickables,false)[0];
        // Connect to an exposed surface of this component, never through the
        // palm to covered mechanisms or to an empty point beyond its outline.
        visible=hit?.object.userData.selection===id;
      }
      return{id,label:item.label,x:(ndc.x*.5+.5)*width,y:(-.5*ndc.y+.5)*height,visible};
    }
    return [...labelGroups].map(([id,candidates])=>{
      const prior=activeAnchors.get(id);
      // Retain the current surface until it is obscured to avoid switching
      // between equally valid anchors as joints and camera move.
      const ordered=prior?[prior,...candidates.filter(item=>item!==prior)]:candidates;
      for(const item of ordered){
        const projected=project(item,id);
        if(projected.visible){activeAnchors.set(id,item);return projected;}
      }
      return{id,visible:false};
    });
  }
  function render(dt=0){if(disposed)return;resize();rig.update(Math.min(.05,Math.max(0,dt)));renderer.render(scene,camera);}
  function stats(){return{grip,separation,selected,view,camera:rig.getState(),joints:Object.fromEntries(joints.map(({id,pivot})=>[id,{rotation:pivot.rotation.toArray().slice(0,3),world: new THREE.Vector3().setFromMatrixPosition(pivot.matrixWorld).toArray()}])),thumb:{opposition:opposition.rotation.y,spread:spread.rotation.z},assembly:{carapace:carapace.position.toArray(),actuators:cassette.position.toArray(),fingerArmor:armor.map(a=>a.object.position.toArray())},drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,meshes:pickables.length,webgl:true};}
  function dispose(){if(disposed)return;disposed=true;resizeObserver.disconnect();canvas.removeEventListener('pointerdown',pointerDown);canvas.removeEventListener('pointerup',pointerUp);canvas.removeEventListener('pointercancel',pointerCancel);rig.dispose();envTarget.dispose();grid.geometry.dispose();grid.material.dispose();for(const resource of resources)resource.dispose?.();renderer.dispose();}
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(canvas);setPose({grip:0,separation:0});resize();
  return{setPose,render,select,projectLabels,overview:fitFrame,setView,focus,zoomBy:rig.zoomBy,panBy:rig.panBy,rotate(angle=.3){rig.cancelShot();onUserIntent();const offset=camera.position.clone().sub(rig.controls.target);offset.applyAxisAngle(new THREE.Vector3(0,1,0),angle);camera.position.copy(rig.controls.target).add(offset);rig.update(0);},cancelCameraShot:rig.cancelShot,setReducedMotion(value){reducedMotion=!!value;rig.setReducedMotion(reducedMotion);},stats,dispose};
}
