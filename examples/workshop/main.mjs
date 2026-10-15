import { createTransport } from '../../kit/motion.mjs';

const $=id=>document.getElementById(id);
const manifestUrl=new URL('./assets/cad-plate/manifest.json',import.meta.url);
const clock=createTransport({duration:12});
const canvas=$('workshop-canvas');
const motionQuery=matchMedia('(prefers-reduced-motion: reduce)');
const numberFormat=new Intl.NumberFormat('en-US',{minimumFractionDigits:1,maximumFractionDigits:1});
function makeLessons(parameters={}){
  const p={length:80,width:60,thickness:10,cornerRadius:8,holeRadius:4,holePitchX:60,holePitchY:40,pocketLength:30,pocketWidth:20,pocketDepth:4,...parameters};
  const f=value=>Number(value).toLocaleString('en-US',{maximumFractionDigits:3});
  const stock=`${f(p.length)} × ${f(p.width)} × ${f(p.thickness)}`,pitch=`${f(p.holePitchX)} × ${f(p.holePitchY)}`,pocket=`${f(p.pocketLength)} × ${f(p.pocketWidth)}`;
  return [
    {operation:'PRIMITIVE',title:'Start with a solid.',description:`A plate, ${stock} mm, centered on the origin. Its six faces define the starting material.`,dimension:`${stock} mm`,caption:'The starting solid'},
    {operation:'FILLET',title:'Soften the four corners.',description:`Select the edges parallel to Z, then apply a ${f(p.cornerRadius)} mm radius. The vertical corners round over; the top and bottom remain flat.`,dimension:`Corner radius · ${f(p.cornerRadius)} mm`,caption:'Four vertical edges, rounded'},
    {operation:'BOOLEAN DIFFERENCE',title:'Make room for fasteners.',description:`Subtract four cylinders on a ${pitch} mm grid. Each ${f(p.holeRadius*2)} mm diameter hole passes all the way through the plate.`,dimension:`4 × Ø${f(p.holeRadius*2)} mm · ${pitch} mm centers`,caption:'Four through-holes, cut from the solid'},
    {operation:'POCKET',title:'Cut below the surface.',description:`Sketch a ${pocket} mm rectangle on the top face and cut downward by ${f(p.pocketDepth)} mm. A ${f(p.thickness-p.pocketDepth)} mm floor remains beneath the pocket.`,dimension:`${pocket} mm · ${f(p.pocketDepth)} mm deep`,caption:'The finished plate, with a recessed pocket'},
  ];
}
let lessons=makeLessons();
let scene,manifest,stage=-1,lastFrame=0,lastUI=0,ready=false,reducedMotion=motionQuery.matches;
const initialCodes=[
  'plate = Box(80, 60, 10)',
  'plate = plate.fillet(plate.edges().parallel_to(Z), 8)',
  'plate -= GridLocations(60, 40, 2, 2) * Cylinder(4, 10)',
  'plate -= Rectangle(30, 20).on(plate.faces().top()).extrude(-4)',
];

function appendHighlighted(parent,source){
  const parts=source.split(/("[^"]*"|'[^']*'|\b(?:from|import)\b|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*(?=\())/g);
  for(const part of parts){
    if(!part)continue;
    const token=document.createElement('span');
    token.textContent=part;
    if(/^['"]/.test(part))token.className='string';
    else if(/^(from|import)$/.test(part))token.className='keyword';
    else if(/^\d/.test(part))token.className='number';
    else if(/^[A-Za-z_]\w*$/.test(part))token.className='function';
    parent.append(token);
  }
}
function buildCode(){
  $('code').replaceChildren();
  const codes=manifest?.stages?.map(s=>s.code)||initialCodes;
  const lines=['from smlibpy import *','',...codes,'','plate.export("final.step")'];
  lines.forEach((line,index)=>{
    const actionable=index>=2&&index<=5;
    const row=document.createElement(actionable?'button':'div');row.className='code-row';
    if(actionable){row.dataset.stage=index-2;row.setAttribute('aria-label',`Step ${index-1}: ${lessons[index-2].title}`);row.addEventListener('click',()=>seekStage(index-2));}
    const lineNumber=document.createElement('span');lineNumber.className='line-number';lineNumber.textContent=index+1;lineNumber.setAttribute('aria-hidden','true');
    const lineText=document.createElement('span');lineText.className='line-text';appendHighlighted(lineText,line);
    row.append(lineNumber,lineText);$('code').append(row);
  });
}
function pause(){clock.pause();scene?.cancelCameraShot?.();refreshTransport();}
function seekStage(index){pause();clock.seek(Math.max(0,Math.min(3,index))*3);sync();}
function refreshTransport(){
  const state=clock.getState();
  $('play').innerHTML=state.playing?'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6 5h3v10H6zm5 0h3v10h-3z"/></svg>':'<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 4.5 15 10l-8 5.5Z"/></svg>';
  $('play').setAttribute('aria-label',state.playing?'Pause construction sequence':state.time===12?'Replay construction sequence':'Play construction sequence');
  $('timeline').value=state.time;$('timeline').style.setProperty('--progress',`${state.progress*100}%`);
  $('timestamp').textContent=`00:${String(Math.floor(state.time)).padStart(2,'0')} / 00:12`;
  $('playback-status').textContent=state.playing?'CONSTRUCTION SEQUENCE':state.time===12?'BUILD COMPLETE':'STEP THROUGH THE BUILD';
  $('previous').disabled=stage===0;$('next').disabled=stage===3;
}
function sync({updateTransport=true}={}){
  const next=Math.min(3,Math.floor(clock.getState().time/3));
  if(next!==stage){
    stage=next;if(ready)scene?.setStage(stage);
    const lesson=lessons[stage],data=manifest?.stages?.[stage];
    $('operation').textContent=`0${stage+1} / ${lesson.operation}`;
    $('stage-count').textContent=`${stage+1} OF 4`;
    $('step-title').textContent=lesson.title;$('step-description').textContent=lesson.description;$('dimension').textContent=lesson.dimension;
    $('geometry-caption').textContent=lesson.caption;$('code-line').textContent=`LINE ${stage+3}`;
    $('volume').textContent=data?numberFormat.format(data.volume):'—';$('faces').textContent=data?.faces??'—';
    $('validity').textContent=data?data.valid?'Valid':'Check geometry':'Loading';
    for(const button of document.querySelectorAll('[data-step],[data-stage]')){
      if(Number(button.dataset.step??button.dataset.stage)===stage)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');
    }
  }
  if(updateTransport)refreshTransport();
}
function selectView(view){
  pause();scene?.setView(view);
  document.querySelectorAll('[data-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.view===view)));
}
function userIntent(){pause();document.querySelectorAll('[data-view]').forEach(button=>button.setAttribute('aria-pressed','false'));}
function applyReducedMotion(value){reducedMotion=value;$('gentle').checked=value;scene?.setReducedMotion?.(value);if(value)pause();}
function configureDownloads(){
  const downloadRoot=new URL('./',manifestUrl);
  const links={source:manifest?.downloads?.source||'source.py',step:manifest?.downloads?.step||'final.step',stl:manifest?.downloads?.stl||'final.stl'};
  for(const [type,file] of Object.entries(links))$(`download-${type}`).href=new URL(file,downloadRoot).href;
  $('dialog-source').href=$('download-source').href;
}

document.querySelectorAll('[data-step]').forEach(button=>button.addEventListener('click',()=>seekStage(Number(button.dataset.step))));
document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>selectView(button.dataset.view)));
$('play').addEventListener('click',()=>{if(clock.getState().playing)pause();else clock.play();sync();});
$('previous').addEventListener('click',()=>seekStage(stage-1));$('next').addEventListener('click',()=>seekStage(stage+1));
$('timeline').addEventListener('input',()=>{const requestedTime=Number($('timeline').value);pause();clock.seek(requestedTime);sync();});
$('speed').addEventListener('change',()=>clock.setRate(Number($('speed').value)));
$('zoom-in').addEventListener('click',()=>scene?.zoomBy(1.2));$('zoom-out').addEventListener('click',()=>scene?.zoomBy(1/1.2));
for(const [name,x,y] of [['left',-50,0],['right',50,0],['up',0,-50],['down',0,50]])$(`pan-${name}`).addEventListener('click',()=>scene?.panBy(x,y));
$('reset-camera').addEventListener('click',()=>{pause();scene?.resetCamera();document.querySelectorAll('[data-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.view==='iso')));});
$('hidden-edges').addEventListener('change',()=>scene?.setHiddenEdges?.($('hidden-edges').checked));
$('gentle').checked=reducedMotion;$('gentle').addEventListener('change',()=>applyReducedMotion($('gentle').checked));
motionQuery.addEventListener('change',event=>applyReducedMotion(event.matches));
$('about').addEventListener('click',()=>{pause();$('model-dialog').showModal();});
$('close-dialog').addEventListener('click',()=>$('model-dialog').close());
$('reload').addEventListener('click',()=>location.reload());
canvas.addEventListener('keydown',event=>{
  const pans={ArrowLeft:[-40,0],ArrowRight:[40,0],ArrowUp:[0,-40],ArrowDown:[0,40]};
  if(pans[event.key]){event.preventDefault();scene?.panBy(...pans[event.key]);}
  else if(['+','=','-','_'].includes(event.key)){event.preventDefault();scene?.zoomBy(['+','='].includes(event.key)?1.15:1/1.15);}
  else if(event.key==='Home'){event.preventDefault();$('reset-camera').click();}
});
document.addEventListener('visibilitychange',()=>{lastFrame=0;if(document.hidden)pause();});
window.addEventListener('resize',()=>scene?.resize());
canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();pause();ready=false;$('graphics-error').hidden=false;});

function frame(now){
  requestAnimationFrame(frame);
  if(document.hidden||!ready)return;
  const dt=lastFrame?Math.min(.1,(now-lastFrame)/1000):0;lastFrame=now;
  const previous=clock.getState();if(previous.playing){clock.update(dt);sync({updateTransport:false});}
  scene.render(dt);
  if(now-lastUI>100){refreshTransport();lastUI=now;}
}

buildCode();sync();
window.__workshop=Object.freeze({getState:()=>({stage,ready,reducedMotion,clock:clock.getState(),volume:manifest?.stages?.[stage]?.volume,faces:manifest?.stages?.[stage]?.faces,camera:scene?.stats?.().camera}),stats:()=>scene?.stats?.()});
try{
  const {createWorkshopScene}=await import('./src/scene.mjs');
  scene=createWorkshopScene(canvas,{onUserIntent:userIntent,reducedMotion});
  manifest=await scene.load(manifestUrl.href);
  if(!manifest?.stages?.length){const response=await fetch(manifestUrl);if(!response.ok)throw new Error(`CAD data: ${response.status}`);manifest=await response.json();}
  lessons=makeLessons(manifest.parameters);buildCode();configureDownloads();ready=true;stage=-1;sync();scene.setHiddenEdges?.($('hidden-edges').checked);scene.resize();
  $('loading').hidden=true;$('play').disabled=false;requestAnimationFrame(frame);
}catch(error){
  console.error('Workshop could not start:',error);$('loading').hidden=true;$('graphics-error').hidden=false;
  try{const response=await fetch(manifestUrl);if(response.ok){manifest=await response.json();lessons=makeLessons(manifest.parameters);buildCode();configureDownloads();stage=-1;sync();}}catch{}
}
