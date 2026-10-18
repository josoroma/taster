import * as THREE from 'three';
import {createCameraRig} from '../../../kit/camera-rig.mjs';
import {COLORS,inspectResidue} from './model.mjs';

export function createMolecularScene(canvas,structure,{reducedMotion=false,onSelect=()=>{},onUserIntent=()=>{}}={}){
  const context=canvas.getContext('webgl2',{antialias:true,alpha:false});
  if(!context)throw new Error('WebGL 2 is unavailable.');
  const renderer=new THREE.WebGLRenderer({canvas,context,antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;
  const scene=new THREE.Scene();scene.background=new THREE.Color('#10211f');
  const camera=new THREE.PerspectiveCamera(34,1,.01,400);camera.position.set(20,10,70);
  const rig=createCameraRig(camera,canvas,{target:[0,0,0],radius:structure.radius,minDistance:8,maxDistance:160,reducedMotion,onUserIntent});
  rig.controls.rotateSpeed=.6;
  scene.add(new THREE.HemisphereLight('#eff3e2','#15332e',2.3));
  for(const [color,intensity,position] of [['#fff4d8',3.5,[-25,40,45]],['#9cd7cb',2,[30,4,-30]],['#e6bfbc',1.1,[-30,-10,10]]]){const light=new THREE.DirectionalLight(color,intensity);light.position.fromArray(position);scene.add(light);}
  const owned=new Set(),own=value=>(owned.add(value),value),world=p=>new THREE.Vector3(...p.map((x,i)=>x-structure.center[i]));
  const positions=structure.atoms.map(a=>world(a.position)),caPoints=structure.residues.map(r=>world(r.ca.position));
  const curve=new THREE.CatmullRomCurve3(caPoints,false,'centripetal');
  const materials={},ribbons=[],dummy=new THREE.Object3D(),yAxis=new THREE.Vector3(0,1,0);
  const standard=(color,extra={})=>own(new THREE.MeshStandardMaterial({color,roughness:.47,metalness:.08,...extra}));
  for(const kind of ['helix','sheet','loop'])materials[kind]=standard(COLORS[kind],{side:THREE.DoubleSide});
  const sphere=own(new THREE.SphereGeometry(1,16,12)),cylinder=own(new THREE.CylinderGeometry(1,1,1,8,1));
  function stickMatrix(a,b,radius){dummy.position.copy(a).add(b).multiplyScalar(.5);dummy.quaternion.setFromUnitVectors(yAxis,new THREE.Vector3().subVectors(b,a).normalize());dummy.scale.set(radius,a.distanceTo(b),radius);dummy.updateMatrix();return dummy.matrix;}
  function atomMatrix(atomIndex,radius){dummy.position.copy(positions[atomIndex]);dummy.quaternion.identity();dummy.scale.setScalar(radius);dummy.updateMatrix();return dummy.matrix;}
  // A ribbon is an interpolated Cα guide, not a literal protein surface. The width
  // is schematic. Flat cross-sections use carbonyl directions, with sign continuity.
  const ribbonSegments=structure.residues.length-1,normals=[];
  for(let i=0;i<structure.residues.length;i++){
    const residue=structure.residues[i],t=i/ribbonSegments,tangent=curve.getTangent(t);
    let n=residue.oxygen?world(residue.oxygen.position).sub(caPoints[i]):new THREE.Vector3(0,1,0);
    n.addScaledVector(tangent,-n.dot(tangent));if(n.lengthSq()<.01)n.set(1,0,0).cross(tangent);n.normalize();
    if(i&&n.dot(normals[i-1])<0)n.negate();normals.push(n);
  }
  for(let i=0;i<ribbonSegments;i++){
    const residue=structure.residues[i],kind=residue.secondary,vertices=[],indices=[],steps=8;
    for(let k=0;k<=steps;k++){
      const local=k/steps,t=(i+local)/ribbonSegments,p=curve.getPoint(t),tangent=curve.getTangent(t),n=normals[i].clone().lerp(normals[i+1],local).normalize();
      n.addScaledVector(tangent,-n.dot(tangent)).normalize();const b=new THREE.Vector3().crossVectors(tangent,n).normalize();
      const width=kind==='loop'?.24:kind==='sheet'?1.10:1.25,thickness=kind==='loop'?.24:.19;
      for(const [x,y] of [[-1,-1],[1,-1],[1,1],[-1,1]])vertices.push(...p.clone().addScaledVector(n,x*width).addScaledVector(b,y*thickness).toArray());
      if(k<steps)for(let side=0;side<4;side++){const a=k*4+side,c=k*4+(side+1)%4;indices.push(a,c,a+4,c,c+4,a+4);}
    }
    indices.push(0,2,1,0,3,2,steps*4,steps*4+1,steps*4+2,steps*4,steps*4+2,steps*4+3);
    const geometry=own(new THREE.BufferGeometry());geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();
    const mesh=new THREE.Mesh(geometry,materials[kind]);mesh.userData.residueId=residue.id;scene.add(mesh);ribbons.push(mesh);
  }
  const atomMaterial=standard('#ffffff'),atoms=new THREE.InstancedMesh(sphere,atomMaterial,structure.atoms.length);
  for(const atom of structure.atoms){atoms.setMatrixAt(atom.index,atomMatrix(atom.index,atom.element==='S'?.47:.35));atoms.setColorAt(atom.index,new THREE.Color(COLORS[atom.element]));}
  atoms.instanceMatrix.needsUpdate=true;scene.add(atoms);
  const ordinaryBonds=structure.bonds.filter(b=>b.kind!=='disulfide'),bondMesh=new THREE.InstancedMesh(cylinder,standard('#ffffff'),ordinaryBonds.length*2);
  for(let i=0;i<ordinaryBonds.length;i++){const bond=ordinaryBonds[i],a=positions[bond.a],b=positions[bond.b],middle=a.clone().add(b).multiplyScalar(.5);for(const [offset,start,end,atom] of [[0,a,middle,bond.a],[1,middle,b,bond.b]]){bondMesh.setMatrixAt(i*2+offset,stickMatrix(start,end,.115));bondMesh.setColorAt(i*2+offset,new THREE.Color(COLORS[structure.atoms[atom].element]));}}
  bondMesh.instanceMatrix.needsUpdate=true;scene.add(bondMesh);
  const detailAtoms=new THREE.InstancedMesh(sphere,standard('#ffffff'),40),detailBonds=new THREE.InstancedMesh(cylinder,standard('#ffffff'),80);scene.add(detailAtoms,detailBonds);
  const bridges=[];
  for(const link of structure.disulfides){const group=new THREE.Group(),a=positions[link.atomA],b=positions[link.atomB],material=standard(COLORS.S,{emissive:COLORS.S,emissiveIntensity:.13});const bond=new THREE.Mesh(cylinder,material);bond.applyMatrix4(stickMatrix(a,b,.19));group.add(bond);for(const atom of [link.atomA,link.atomB]){const mesh=new THREE.Mesh(sphere,material);mesh.position.copy(positions[atom]);mesh.scale.setScalar(.5);group.add(mesh);}scene.add(group);bridges.push({group,material,link});}
  const trace=new THREE.Mesh(own(new THREE.SphereGeometry(.5,18,12)),standard('#efffc5',{emissive:'#d9ed92',emissiveIntensity:.8}));scene.add(trace);
  const traceHalo=new THREE.Mesh(own(new THREE.SphereGeometry(.85,18,12)),own(new THREE.MeshBasicMaterial({color:'#d9ed92',transparent:true,opacity:.13,depthWrite:false})));trace.add(traceHalo);
  // Ten-ångström reference line in the same world coordinates as the atoms.
  const scalePoints=[new THREE.Vector3(-5,-15,0),new THREE.Vector3(5,-15,0),new THREE.Vector3(-5,-14.65,0),new THREE.Vector3(-5,-15.35,0),new THREE.Vector3(5,-14.65,0),new THREE.Vector3(5,-15.35,0)];
  const scaleLine=new THREE.LineSegments(own(new THREE.BufferGeometry().setFromPoints(scalePoints)),own(new THREE.LineBasicMaterial({color:'#607d6e',transparent:true,opacity:.7})));scene.add(scaleLine);
  let selected='A:3',representation='ribbon',activeBridge=0,width=1,height=1,view='overview',traceProgress=0,disposed=false;
  function select(id){
    const residue=inspectResidue(structure,id);selected=id;activeBridge=residue.link?structure.disulfides.findIndex(d=>d.id===residue.link.id):-1;
    const ids=new Set([id,...(residue.partner?[residue.partner.id]:[])]),selectedAtoms=structure.atoms.filter(a=>ids.has(a.residueId));
    detailAtoms.count=selectedAtoms.length;
    selectedAtoms.forEach((a,i)=>{detailAtoms.setMatrixAt(i,atomMatrix(a.index,a.element==='S'?.5:.34));detailAtoms.setColorAt(i,new THREE.Color(COLORS[a.element]));});
    detailAtoms.instanceMatrix.needsUpdate=true;if(detailAtoms.instanceColor)detailAtoms.instanceColor.needsUpdate=true;detailAtoms.computeBoundingSphere();
    const bonds=ordinaryBonds.filter(b=>ids.has(structure.atoms[b.a].residueId)&&ids.has(structure.atoms[b.b].residueId));detailBonds.count=bonds.length*2;
    bonds.forEach((bond,i)=>{const a=positions[bond.a],b=positions[bond.b],middle=a.clone().add(b).multiplyScalar(.5);for(const [offset,start,end,atom] of [[0,a,middle,bond.a],[1,middle,b,bond.b]]){detailBonds.setMatrixAt(i*2+offset,stickMatrix(start,end,.13));detailBonds.setColorAt(i*2+offset,new THREE.Color(COLORS[structure.atoms[atom].element]));}});
    detailBonds.instanceMatrix.needsUpdate=true;if(detailBonds.instanceColor)detailBonds.instanceColor.needsUpdate=true;detailBonds.computeBoundingSphere();
    bridges.forEach((b,i)=>{b.material.emissiveIntensity=i===activeBridge?.45:.05;});
  }
  function setRepresentation(value){representation=value==='atoms'?'atoms':'ribbon';for(const mesh of ribbons)mesh.visible=representation==='ribbon';atoms.visible=bondMesh.visible=representation==='atoms';detailAtoms.visible=detailBonds.visible=representation==='ribbon';}
  function setTrace(progress,visible=true){traceProgress=Math.min(1,Math.max(0,progress));trace.position.copy(curve.getPoint(traceProgress));trace.visible=visible&&representation==='ribbon';}
  function contextOpacity(focused){for(const material of Object.values(materials)){material.transparent=focused;material.opacity=focused?.12:1;material.depthWrite=!focused;material.needsUpdate=true;}}
  function overview(duration=.65){view='overview';contextOpacity(false);rig.fit({center:[0,-.7,0],radius:structure.radius*1.02,direction:[.3,.25,1.5],duration});}
  function focus(){view='residue';contextOpacity(true);const detail=inspectResidue(structure,selected),points=detail.atomIndices.map(i=>positions[i]);if(detail.partner)points.push(...detail.partner.atomIndices.map(i=>positions[i]));const center=points.reduce((v,p)=>v.add(p),new THREE.Vector3()).multiplyScalar(1/points.length);rig.fit({center:center.toArray(),radius:Math.max(4.5,...points.map(p=>p.distanceTo(center)))*1.3,duration:.7});}
  function rotate(angle){rig.cancelShot();const delta=camera.position.clone().sub(rig.controls.target).applyAxisAngle(new THREE.Vector3(0,1,0),angle);camera.position.copy(rig.controls.target).add(delta);rig.controls.update();onUserIntent();}
  const project=v=>{const p=v.clone().project(camera);return {x:(p.x*.5+.5)*width,y:(.5-p.y*.5)*height,visible:p.z>-1&&p.z<1&&Math.abs(p.x)<.98&&Math.abs(p.y)<.98};};
  function annotations(){const labels=[];if(activeBridge>=0){const link=structure.disulfides[activeBridge],a=positions[link.atomA],b=positions[link.atomB];labels.push({id:'measurement',...project(a.clone().add(b).multiplyScalar(.5)),text:`S—S ${link.distance.toFixed(2)} Å`});}labels.push({id:'scale',...project(new THREE.Vector3(0,-15.6,0)),text:'10 Å'});return labels;}
  const raycaster=new THREE.Raycaster();let downAt=null;
  function down(e){downAt=[e.clientX,e.clientY];}
  function up(e){if(!downAt||Math.hypot(e.clientX-downAt[0],e.clientY-downAt[1])>5){downAt=null;return;}downAt=null;const rect=canvas.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,1-(e.clientY-rect.top)/rect.height*2),camera);const hits=raycaster.intersectObjects(representation==='atoms'?[atoms]:ribbons,false);if(hits[0])onSelect(hits[0].object===atoms?structure.atoms[hits[0].instanceId].residueId:hits[0].object.userData.residueId);}
  canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointerup',up);
  function resize(){const box=canvas.getBoundingClientRect();if(box.width===width&&box.height===height)return;width=Math.max(1,box.width);height=Math.max(1,box.height);renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();if(view==='overview')overview(0);}
  select(selected);setRepresentation('ribbon');setTrace(0,false);resize();
  return {select,setRepresentation,setTrace,overview,focus,annotations,rotate,getView:()=>view,zoomBy:n=>rig.zoomBy(n),panBy:(x,y)=>rig.panBy(x,y),cancelCameraShot:()=>rig.cancelShot(),setReducedMotion:value=>rig.setReducedMotion(value),render(dt){if(disposed)return;resize();rig.update(dt);renderer.render(scene,camera);},stats:()=>({selected,representation,activeBridge,traceProgress,view,atomCount:atoms.count,bondCount:structure.bonds.length,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,camera:rig.getState(),coordinateCenter:structure.center}),dispose(){disposed=true;canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointerup',up);rig.dispose();for(const object of owned)object.dispose();renderer.dispose();}};
}
