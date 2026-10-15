import * as THREE from 'three';
import {createCameraRig} from '../../../kit/camera-rig.mjs';

const TAU=Math.PI*2;
const PALETTE={cyan:'#93f0db',blue:'#6dafff',coral:'#f3aa81',violet:'#afa8fa',white:'#f2f6ff'};
const SYMBOLS={up:'u',down:'d',charm:'c',strange:'s',top:'t',bottom:'b',electron:'e⁻',muon:'μ⁻',tau:'τ⁻','electron-neutrino':'νₑ','muon-neutrino':'νμ','tau-neutrino':'ντ',photon:'γ',gluon:'g',w:'W±',z:'Z',higgs:'H'};
const QUARKS=new Set(['up','down','charm','strange','top','bottom']);
const BOSONS=new Set(['photon','gluon','w','z','higgs']);
const SPECS={
  atom:{radius:3.75,direction:[.18,.13,1.5]},
  nucleus:{radius:2.55,direction:[.3,.25,1.5]},
  nucleon:{radius:3.0,direction:[.18,.18,1.5]},
  quarks:{radius:3.55,direction:[.06,.13,1.5]},
  atlas:{radius:2.65,direction:[.2,.1,1.5]},
  frontier:{radius:3.5,direction:[.25,.2,1.5]},
};

/** A code-drawn, schematic atlas. Decorative turntable motion is not quantum spin. */
export function createParticleScene(canvas,{reducedMotion=false,onSelect=()=>{},onUserIntent=()=>{}}={}){
  const context=canvas.getContext('webgl2',{antialias:true,alpha:true});
  if(!context)throw new Error('WebGL 2 is unavailable');
  const renderer=new THREE.WebGLRenderer({canvas,context,antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio||1,1.75));
  renderer.setClearColor('#070e19',0);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.08;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(35,1,.02,150);camera.position.set(1.6,1.25,13);
  let disposed=false,width=1,height=1,stage='atom',nucleon='proton',selected='up',autoRotate=true,playing=true,currentTime=0,lastTime=0,turntableTime=0;
  let inspect=false;
  const intent=()=>{inspect=true;onUserIntent();};
  const rig=createCameraRig(camera,canvas,{target:[0,0,0],radius:4,minDistance:1.5,maxDistance:34,reducedMotion,onUserIntent:intent});
  rig.controls.rotateSpeed=.6;rig.controls.enableDamping=!reducedMotion;
  scene.add(new THREE.HemisphereLight('#dfeaff','#151731',2.1));
  const key=new THREE.DirectionalLight('#fff0df',3.2);key.position.set(-4,5,7);scene.add(key);
  const rim=new THREE.DirectionalLight('#85b8ff',3.8);rim.position.set(4,2,-5);scene.add(rim);
  const fill=new THREE.DirectionalLight('#d5baff',1.2);fill.position.set(-5,-3,1);scene.add(fill);
  const resources=new Set(),pickables=[],pointMaterials=[],glyphs=new Set();
  const own=x=>(resources.add(x),x);
  const geometries={sphere:own(new THREE.SphereGeometry(1,56,40))};
  const groups=Object.fromEntries(Object.keys(SPECS).map(id=>{const g=new THREE.Group();g.visible=id===stage;scene.add(g);return[id,g];}));
  const labelAnchors=Object.fromEntries(Object.keys(SPECS).map(id=>[id,[]]));
  let seed=74219;
  const rand=()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return(seed+.5)/4294967296;};
  const v=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
  function anchor(group,id,label,position){const a=new THREE.Object3D();a.position.fromArray(position);group.add(a);labelAnchors[Object.keys(groups).find(k=>groups[k]===group)]?.push({id,label,object:a});return a;}
  function line(group,points,color=PALETTE.cyan,opacity=.2,{dashed=false,closed=false}={}){
    const geometry=own(new THREE.BufferGeometry().setFromPoints(points));
    const material=own(dashed?new THREE.LineDashedMaterial({color,transparent:true,opacity,dashSize:.045,gapSize:.065,depthWrite:false}):new THREE.LineBasicMaterial({color,transparent:true,opacity,depthWrite:false}));
    const object=new (closed?THREE.LineLoop:THREE.Line)(geometry,material);if(dashed)object.computeLineDistances();group.add(object);return object;
  }
  function circle(group,radius,color,opacity,orientation='xy',center=[0,0,0],dashed=false){
    const points=Array.from({length:181},(_,i)=>{const a=i/180*TAU;return orientation==='xz'?v(Math.cos(a)*radius,0,Math.sin(a)*radius):orientation==='yz'?v(0,Math.cos(a)*radius,Math.sin(a)*radius):v(Math.cos(a)*radius,Math.sin(a)*radius,0);});
    const o=line(group,points,color,opacity,{dashed});o.position.fromArray(center);return o;
  }
  function glowTexture(){const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d'),g=ctx.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.13,'rgba(255,255,255,.7)');g.addColorStop(.38,'rgba(255,255,255,.15)');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);return own(new THREE.CanvasTexture(c));}
  const glowMap=glowTexture();
  function glow(group,position,color,size,opacity=.5){const mat=own(new THREE.SpriteMaterial({map:glowMap,color,transparent:true,opacity,depthWrite:false,blending:THREE.AdditiveBlending})),sprite=new THREE.Sprite(mat);sprite.position.fromArray(position);sprite.scale.set(size,size,1);group.add(sprite);return sprite;}
  function glyph(group,text,position,size,color=PALETTE.white){
    const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d');ctx.clearRect(0,0,256,256);ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='500 146px Georgia, serif';const fontSize=146*Math.min(1,220/Math.max(1,ctx.measureText(text).width));ctx.font=`500 ${fontSize}px Georgia, serif`;ctx.fillStyle=color;ctx.fillText(text,128,134);
    const texture=own(new THREE.CanvasTexture(c));texture.colorSpace=THREE.SRGBColorSpace;
    const mat=own(new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:true,depthWrite:false})),sprite=new THREE.Sprite(mat);sprite.position.fromArray(position);sprite.userData.faceRadius=position[2]*1.09;sprite.scale.set(size,size,1);sprite.renderOrder=8;group.add(sprite);glyphs.add(sprite);return sprite;
  }
  function marker(group,position,radius,color,id,letter,{opacity=1,glowing=true}={}){
    const root=new THREE.Group();root.position.fromArray(position);group.add(root);
    const mat=own(new THREE.MeshStandardMaterial({color,metalness:.23,roughness:.28,emissive:color,emissiveIntensity:.09,transparent:opacity<1,opacity}));
    const mesh=new THREE.Mesh(geometries.sphere,mat);mesh.scale.setScalar(radius);root.add(mesh);
    if(id){mesh.userData.particle=id;pickables.push(mesh);}
    if(glowing)glow(root,[0,0,0],color,radius*4,.3);
    if(letter)glyph(root,letter,[0,0,radius*.95],radius*1.08);
    return{root,mesh,mat};
  }
  function points(group,positions,colors,sizes,opacity=.75){
    const geometry=own(new THREE.BufferGeometry());geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setAttribute('aSize',new THREE.Float32BufferAttribute(sizes,1));
    const material=own(new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,vertexColors:true,uniforms:{uHeight:{value:900},uOpacity:{value:opacity}},vertexShader:`attribute float aSize; uniform float uHeight; varying vec3 vColor; void main(){vColor=color; vec4 mv=modelViewMatrix*vec4(position,1.); gl_PointSize=clamp(aSize*uHeight/max(0.1,-mv.z),1.,9.); gl_Position=projectionMatrix*mv;}`,fragmentShader:`uniform float uOpacity; varying vec3 vColor; void main(){float r=length(gl_PointCoord-.5)*2.; if(r>1.)discard; float a=exp(-r*r*5.)*(1.-smoothstep(.5,1.,r)); gl_FragColor=vec4(vColor,a*uOpacity);}` }));
    pointMaterials.push(material);const object=new THREE.Points(geometry,material);group.add(object);return object;
  }
  function shellPoints(group,radius,count,color,opacity=.4,flatten=[1,1,1]){
    const positions=[],colors=[],sizes=[],c=new THREE.Color(color);
    for(let i=0;i<count;i++){const y=1-2*(i+.5)/count,a=i*Math.PI*(3-Math.sqrt(5)),r=Math.sqrt(1-y*y);positions.push(Math.cos(a)*r*radius*flatten[0],y*radius*flatten[1],Math.sin(a)*r*radius*flatten[2]);const b=.5+rand()*.5;colors.push(c.r*b,c.g*b,c.b*b);sizes.push(.018+rand()*.025);}
    return points(group,positions,colors,sizes,opacity);
  }
  function ticks(group,radius,color,opacity=.28,count=72){
    const positions=[];for(let i=0;i<count;i++){const a=i/count*TAU,r2=radius+(i%6===0?.12:.045);positions.push(Math.cos(a)*radius,Math.sin(a)*radius,0,Math.cos(a)*r2,Math.sin(a)*r2,0);}
    const geometry=own(new THREE.BufferGeometry());geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));const o=new THREE.LineSegments(geometry,own(new THREE.LineBasicMaterial({color,transparent:true,opacity,depthWrite:false})));group.add(o);return o;
  }
  function nucleons(group,scale=1){
    const coords=[[-.65,.49,.38],[.65,.46,-.24],[-.26,-.62,-.38],[.46,-.5,.62]];
    return coords.map((p,i)=>marker(group,p.map(x=>x*scale),.69*scale,i%2===0?PALETTE.coral:PALETTE.violet,i%2===0?'proton':'neutron',scale>.5?(i%2===0?'p':'n'):null));
  }
  // Helium's electron density is suggested by samples of a radial distribution.
  // These points are probability samples, never thousands of little electrons.
  const cloudPositions=[],cloudColors=[],cloudSizes=[];
  const cloudCyan=new THREE.Color(PALETTE.cyan),cloudBlue=new THREE.Color(PALETTE.blue);
  for(let i=0;i<11500;i++){
    let r;do{r=-Math.log(rand()*rand()*rand())*.53;}while(r>4.35);
    const z=rand()*2-1,a=rand()*TAU,k=Math.sqrt(1-z*z),c=cloudCyan.clone().lerp(cloudBlue,Math.min(1,r/3.5));
    cloudPositions.push(r*k*Math.cos(a),r*z,r*k*Math.sin(a));cloudColors.push(c.r*1.2,c.g*1.2,c.b*1.2);cloudSizes.push(.027+rand()*.05);
  }
  points(groups.atom,cloudPositions,cloudColors,cloudSizes,.92);
  glow(groups.atom,[0,0,0],PALETTE.blue,8.1,.32);
  nucleons(groups.atom,.23);
  const atomGuide=circle(groups.atom,3.7,PALETTE.cyan,.13,'xy');ticks(groups.atom,3.7,PALETTE.cyan,.24);
  anchor(groups.atom,'electron-cloud','Electron probability cloud',[2.15,1.2,.5]);
  anchor(groups.atom,'nucleus','Helium-4 nucleus',[.08,-.25,.35]);
  // A fixed two-proton/two-neutron tetrahedral drawing; the nucleus is not a solid cluster of marbles.
  const nuclearParts=nucleons(groups.nucleus,1.18);
  shellPoints(groups.nucleus,1.92,1400,PALETTE.violet,.4);
  glow(groups.nucleus,[0,0,0],PALETTE.violet,6.2,.12);
  circle(groups.nucleus,2.2,PALETTE.violet,.16,'xy');ticks(groups.nucleus,2.2,PALETTE.violet,.32,48);
  anchor(groups.nucleus,'proton','Protons · +1 e',[-.85,.87,.58]);
  anchor(groups.nucleus,'neutron','Neutrons · 0 e',[.73,-.8,.75]);
  const nuclearDots=[];for(let i=0;i<4;i++){const a=nuclearParts[i].root.position,b=nuclearParts[(i+1)%4].root.position;nuclearDots.push(line(groups.nucleus,[a,b],PALETTE.white,.09,{dashed:true}));}
  // The coiled lines below encode gluon interactions as a visual symbol, not trajectories.
  function coil(group,a,b,color,radius=.13,phase=0){
    const delta=b.clone().sub(a),axis=delta.clone().normalize(),side=new THREE.Vector3().crossVectors(axis,Math.abs(axis.y)<.8?v(0,1,0):v(1,0,0)).normalize(),up=new THREE.Vector3().crossVectors(axis,side),pts=[];
    for(let i=0;i<=160;i++){const t=i/160,e=Math.sin(Math.PI*t),angle=t*TAU*8+phase;pts.push(a.clone().addScaledVector(delta,t).addScaledVector(side,Math.cos(angle)*radius*e).addScaledVector(up,Math.sin(angle)*radius*e));}
    const tube=new THREE.Mesh(own(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),140,.012,5,false)),own(new THREE.MeshBasicMaterial({color,transparent:true,opacity:.7,depthWrite:false})));group.add(tube);return tube;
  }
  const quarkSets=[];
  function quarkDrawing(group,spread,radius){
    const coords=[v(-spread*.83,spread*.48,.18),v(spread*.83,spread*.48,-.08),v(0,-spread*.81,.24)];
    const nodes=coords.map((p,i)=>marker(group,p.toArray(),radius,[PALETTE.coral,PALETTE.cyan,PALETTE.violet][i],i===2?'down':'up',null));
    for(let i=0;i<3;i++){coil(group,coords[i],coords[(i+1)%3],[PALETTE.coral,PALETTE.cyan,PALETTE.violet][i],spread*.105,i*.8);line(group,[coords[i],coords[(i+1)%3]],PALETTE.white,.10,{dashed:true});}
    const labels=nodes.map((n,i)=>glyph(n.root,i===2?'d':'u',[0,0,radius*.96],radius*1.5));quarkSets.push({nodes,labels,group});
    return{nodes,coords};
  }
  const within=quarkDrawing(groups.nucleon,1.35,.34);
  shellPoints(groups.nucleon,2.06,3200,PALETTE.coral,.52);
  const skin=new THREE.Mesh(geometries.sphere,own(new THREE.MeshPhysicalMaterial({color:PALETTE.coral,transparent:true,opacity:.045,roughness:.4,metalness:.1,side:THREE.DoubleSide,depthWrite:false})));skin.scale.setScalar(2.06);groups.nucleon.add(skin);
  circle(groups.nucleon,2.06,PALETTE.coral,.2,'xy');circle(groups.nucleon,2.06,PALETTE.coral,.11,'xz');circle(groups.nucleon,2.06,PALETTE.coral,.08,'yz');
  glow(groups.nucleon,[0,0,0],PALETTE.coral,6.7,.11);
  const seaPos=[],seaColors=[],seaSize=[];const seaC=new THREE.Color(PALETTE.blue);
  for(let i=0;i<650;i++){const r=1.85*Math.cbrt(rand()),y=rand()*2-1,a=rand()*TAU,k=Math.sqrt(1-y*y);seaPos.push(Math.cos(a)*k*r,y*r,Math.sin(a)*k*r);seaColors.push(seaC.r,seaC.g,seaC.b);seaSize.push(.013+rand()*.018);}points(groups.nucleon,seaPos,seaColors,seaSize,.3);
  anchor(groups.nucleon,'valence','Three valence quarks',[-1.05,.92,.4]);
  anchor(groups.nucleon,'gluons','Gluons + sea',[.76,-1.17,.25]);
  const expanded=quarkDrawing(groups.quarks,2.45,.47);
  for(const p of expanded.coords){shellPoints(groups.quarks,.68,360,PALETTE.cyan,.18).position.copy(p);}
  circle(groups.quarks,3.08,PALETTE.blue,.11,'xy');ticks(groups.quarks,3.08,PALETTE.blue,.23,60);
  anchor(groups.quarks,'first-quark','Up quark',[-2.1,1.45,.45]);
  anchor(groups.quarks,'second-quark','Up quark',[2.1,1.45,.15]);
  anchor(groups.quarks,'third-quark','Down quark',[0,-2.25,.45]);
  // One selected elementary species, presented as an abstract diagram token.
  const specimen=marker(groups.atlas,[0,0,0],1.08,PALETTE.coral,'up',null);
  let specimenGlyph=glyph(groups.atlas,'u',[0,0,1.1],1.6);
  shellPoints(groups.atlas,1.58,1550,PALETTE.cyan,.45);
  circle(groups.atlas,2.1,PALETTE.cyan,.24,'xy');ticks(groups.atlas,2.1,PALETTE.cyan,.4,72);
  const atlasRing=circle(groups.atlas,1.86,PALETTE.violet,.21,'xz');atlasRing.rotation.z=.6;
  const atlasRing2=circle(groups.atlas,1.86,PALETTE.coral,.13,'yz');atlasRing2.rotation.z=-.5;
  glow(groups.atlas,[0,0,0],PALETTE.blue,6,.12);
  anchor(groups.atlas,'elementary','Elementary · no known smaller parts',[1.2,-1.25,0]);
  // The last scene is an instrument-like horizon: a point and an unresolved field.
  // It intentionally contains no proposed strings, preons, or invented interiors.
  const frontierCore=marker(groups.frontier,[0,0,.5],.15,PALETTE.white,'electron',null);glow(groups.frontier,[0,0,.5],PALETTE.cyan,2.3,.28);
  const frontierGrid=new THREE.Group();groups.frontier.add(frontierGrid);
  for(let axis=0;axis<2;axis++)for(let j=-12;j<=12;j++){
    const pts=[];for(let i=0;i<=48;i++){const a=-3.1+i/48*6.2,b=j/12*3.1,x=axis?b:a,y=axis?a:b,r=Math.hypot(x,y),z=-1.0-.28*Math.exp(-r*r/2);pts.push(v(x,y,z));}
    line(frontierGrid,pts,PALETTE.blue,j%4===0?.19:.065);
  }
  const frontierRings=[];
  for(let i=0;i<4;i++){const r=.65+i*.67;const ring=circle(groups.frontier,r,i%2?PALETTE.violet:PALETTE.cyan,.13+i*.018,'xy',[0,0,-.15-i*.24]);frontierRings.push(ring);}
  const frontierPositions=[],frontierColors=[],frontierSizes=[];const fc=new THREE.Color(PALETTE.cyan);
  for(let i=0;i<850;i++){const x=(rand()-.5)*6,y=(rand()-.5)*6,z=-1.3-rand()*.8;frontierPositions.push(x,y,z);frontierColors.push(fc.r,fc.g,fc.b);frontierSizes.push(.012+rand()*.018);}points(groups.frontier,frontierPositions,frontierColors,frontierSizes,.35);
  anchor(groups.frontier,'known','No confirmed substructure',[.1,.32,.6]);
  anchor(groups.frontier,'unknown','The frontier is still open',[1.9,-1.9,-1]);
  // Extremely quiet environmental depth. Fixed samples do not evolve physical states.
  const backdrop=new THREE.Group();scene.add(backdrop);
  const stars=[],starColors=[],starSizes=[];
  for(let i=0;i<330;i++){stars.push((rand()-.5)*28,(rand()-.5)*20,-8-rand()*8);starColors.push(.2,.35,.52);starSizes.push(.015+rand()*.028);}points(backdrop,stars,starColors,starSizes,.3);

  function overview(duration=.75){inspect=false;const spec=SPECS[stage];rig.fit({center:[0,0,0],radius:spec.radius,direction:spec.direction,duration});}
  function setStage(id,{immediate=false,frame=true}={}){
    if(!groups[id])return;
    if(id===stage){if(immediate&&frame)overview(0);return;}
    stage=id;for(const [key,g]of Object.entries(groups))g.visible=key===id;
    if(frame)overview(immediate?0:.8);
  }
  function replaceGlyph(old,parent,text,position,size,color=PALETTE.white){
    parent.remove(old);glyphs.delete(old);const texture=old.material.map;texture.dispose();resources.delete(texture);old.material.dispose();resources.delete(old.material);return glyph(parent,text,position,size,color);
  }
  function setNucleon(type){
    if((type!=='proton'&&type!=='neutron')||nucleon===type)return;nucleon=type;
    for(const set of quarkSets){const i=1,id=type==='proton'?'up':'down';set.nodes[i].mesh.userData.particle=id;set.labels[i]=replaceGlyph(set.labels[i],set.nodes[i].root,id==='up'?'u':'d',[0,0,set.group===groups.quarks?.47*.96:.34*.96],set.group===groups.quarks?.47*1.5:.34*1.5);}
    const second=labelAnchors.quarks.find(a=>a.id==='second-quark');second.label=type==='proton'?'Up quark':'Down quark';
  }
  function selectParticle(id){
    if(!SYMBOLS[id]||id===selected)return;selected=id;
    const color=QUARKS.has(id)?PALETTE.coral:BOSONS.has(id)?PALETTE.violet:PALETTE.cyan;
    specimen.mat.color.set(color);specimen.mat.emissive.set(color);specimen.mesh.userData.particle=id;
    specimenGlyph=replaceGlyph(specimenGlyph,groups.atlas,SYMBOLS[id],[0,0,1.1],1.6);
  }
  function focus(id){
    const item=labelAnchors[stage].find(a=>a.id===id);if(!item){overview(.7);return;}
    scene.updateMatrixWorld();const target=item.object.getWorldPosition(v()),direction=camera.position.clone().sub(rig.controls.target).normalize();
    rig.focus({position:target.clone().addScaledVector(direction,SPECS[stage].radius*2.1).toArray(),target:target.toArray(),duration:.65});
  }
  function resize(){
    const b=canvas.getBoundingClientRect(),w=Math.max(1,Math.round(b.width)),h=Math.max(1,Math.round(b.height));if(w===width&&h===height)return;
    width=w;height=h;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();for(const m of pointMaterials)m.uniforms.uHeight.value=h*renderer.getPixelRatio();if(!inspect)overview(0);
  }
  function render(dt=0,time=currentTime){
    if(disposed)return;currentTime=Number.isFinite(time)?time:currentTime;resize();
    // Decorative orientation is evaluated from narrative time, so seeks are exact.
    // Stopping the turntable retains its orientation until explicitly enabled again.
    if(autoRotate&&!reducedMotion)turntableTime=currentTime;
    const angle=turntableTime*.045;
    for(const [id,g] of Object.entries(groups)){g.rotation.y=id==='frontier'?Math.sin(angle*.6)*.12:(id==='quarks'||id==='nucleon')?Math.sin(angle*1.3)*.27:angle;g.rotation.z=id==='quarks'?-.06:0;}
    rig.update(Math.min(.08,Math.max(0,Number.isFinite(dt)?dt:0)));
    scene.updateMatrixWorld();
    for(const sprite of glyphs){const localCamera=sprite.parent.worldToLocal(camera.position.clone());sprite.position.copy(localCamera.normalize().multiplyScalar(sprite.userData.faceRadius));}
    renderer.render(scene,camera);lastTime=currentTime;
  }
  function projectLabels(){
    scene.updateMatrixWorld();return labelAnchors[stage].map(a=>{const projected=a.object.getWorldPosition(v()).project(camera);return{id:a.id,label:a.label,x:(projected.x*.5+.5)*width,y:(.5-projected.y*.5)*height,visible:projected.z>-1&&projected.z<1&&Math.abs(projected.x)<.92&&Math.abs(projected.y)<.9};});
  }
  function rotate(angle){rig.cancelShot();const offset=camera.position.clone().sub(rig.controls.target).applyAxisAngle(v(0,1,0),angle);camera.position.copy(rig.controls.target).add(offset);rig.controls.update();intent();}
  const raycaster=new THREE.Raycaster();let pointerDown=null;
  function down(e){pointerDown=[e.clientX,e.clientY];}
  function up(e){if(!pointerDown||Math.hypot(e.clientX-pointerDown[0],e.clientY-pointerDown[1])>6){pointerDown=null;return;}pointerDown=null;const b=canvas.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-b.left)/b.width*2-1,1-(e.clientY-b.top)/b.height*2),camera);const visible=pickables.filter(p=>{let o=p;while(o){if(!o.visible)return false;o=o.parent;}return true;});const hit=raycaster.intersectObjects(visible)[0];if(hit)onSelect(hit.object.userData.particle);}
  canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointerup',up);
  resize();overview(0);
  return{
    render,setStage,setNucleon,selectParticle,select:selectParticle,overview,focus,projectLabels,cancelCameraShot:()=>rig.cancelShot(),
    setAutoRotate(value){autoRotate=!!value;},setPlaying(value){playing=!!value;},
    zoomBy:factor=>rig.zoomBy(factor),panBy:(x,y)=>rig.panBy(x,y),rotate,
    setReducedMotion(value){reducedMotion=!!value;rig.setReducedMotion(value);},
    stats:()=>({stage,nucleon,selected,autoRotate,playing,time:currentTime,points:renderer.info.render.points,triangles:renderer.info.render.triangles,calls:renderer.info.render.calls,camera:rig.getState()}),
    dispose(){disposed=true;canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointerup',up);rig.dispose();for(const resource of resources)resource.dispose();renderer.dispose();},
  };
}
