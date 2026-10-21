import { DEFAULTS, PARTS, solveCrank, advanceAngle, TAU } from './src/model.mjs';

const $=selector=>document.querySelector(selector), canvas=$('#machine');
const motionQuery=matchMedia('(prefers-reduced-motion: reduce)');
let angle=DEFAULTS.angle,rpm=DEFAULTS.rpm,playing=false,reveal=0,selected='crank',scene=null,ready=false,reducedMotion=motionQuery.matches;
const mm=value=>(value*1000).toFixed(1),deg=value=>(value*180/Math.PI).toFixed(1);
function announce(text){$('#announcer').textContent=text;}
function pause(){playing=false;syncPlayback();}
function syncPlayback(){$('#play').textContent=playing?'Ⅱ Pause mechanism':'▶ Run mechanism';$('#motion-state').textContent=playing?'RUNNING':'PAUSED';$('#play').setAttribute('aria-pressed',String(playing));}
function selectPart(id){if(!PARTS[id])return;pause();selected=id;const part=PARTS[id];for(const button of document.querySelectorAll('[data-part]'))button.setAttribute('aria-pressed',String(button.dataset.part===id));$('#part-number').textContent=part.number;$('#part-kind').textContent=part.kind;$('#part-name').textContent=part.name;$('#part-copy').textContent=part.description;scene?.select(id);announce(`Selected ${part.name}`);}
for(const [id,part] of Object.entries(PARTS)){const button=document.createElement('button');button.dataset.part=id;button.innerHTML=`<span>${part.number}</span>${part.name}`;button.addEventListener('click',()=>selectPart(id));$('#parts').append(button);}
const plotPoints=Array.from({length:181},(_,i)=>{const state=solveCrank({angle:i/180*TAU});return `${i?'L':'M'}${40+i/180*640},${135-state.travel/state.stroke*120}`;});$('#plot-line').setAttribute('d',plotPoints.join(' '));
function update(){
  const state=solveCrank({angle,rpm});angle=state.angle;
  $('#travel').textContent=mm(state.travel);$('#travel-fill').style.width=`${state.travel/state.stroke*100}%`;
  $('#velocity').textContent=mm(state.travelVelocity);$('#rod-angle').textContent=deg(state.rodAngle);
  $('#rpm-value').textContent=`${rpm} rpm`;$('#angle-value').textContent=`${deg(angle)}°`;$('#angle').value=angle*180/Math.PI;$('#angle').setAttribute('aria-valuetext',`${deg(angle)} degrees`);
  $('#reveal-value').textContent=`${Math.round(reveal*100)}%`;$('#view-status').textContent=`${scene?'ORTHOGRAPHIC':'PLAN SCHEMATIC'} / ${reveal?'GUARD REVEALED':'ASSEMBLED'}`;
  const x=40+angle/TAU*640,y=135-state.travel/state.stroke*120;
  $('#plot-cursor').setAttribute('x1',x);$('#plot-cursor').setAttribute('x2',x);$('#plot-dot').setAttribute('cx',x);$('#plot-dot').setAttribute('cy',y);
  if(scene)scene.update(state,reveal);
  else{const line=(id,x1,y1,x2,y2)=>{for(const [key,value] of Object.entries({x1,y1,x2,y2}))$(id).setAttribute(key,value);};line('#svg-crank',0,0,state.pinX*1000,-state.pinY*1000);line('#svg-rod',state.pinX*1000,-state.pinY*1000,state.x*1000,0);$('#svg-pin').setAttribute('cx',state.pinX*1000);$('#svg-pin').setAttribute('cy',-state.pinY*1000);$('#svg-slider').setAttribute('x',state.x*1000-15);}
  return state;
}
function seek(degrees){pause();angle=degrees*Math.PI/180;update();}
$('#play').addEventListener('click',()=>{playing=!playing;syncPlayback();announce(playing?'Mechanism running':'Mechanism paused');});
$('#rpm').addEventListener('input',event=>{rpm=Number(event.target.value);update();});
$('#angle').addEventListener('input',event=>seek(Number(event.target.value)));
for(const button of document.querySelectorAll('[data-angle]'))button.addEventListener('click',()=>seek(Number(button.dataset.angle)));
$('#reveal').addEventListener('input',event=>{pause();reveal=Number(event.target.value);update();});
$('#reset').addEventListener('click',()=>{pause();angle=DEFAULTS.angle;rpm=DEFAULTS.rpm;reveal=0;$('#rpm').value=rpm;$('#reveal').value=0;selectPart('crank');update();setView('iso');announce('Mechanism reset to 45 degrees and 24 rpm');});
function setView(view){pause();for(const button of document.querySelectorAll('[data-view]'))button.setAttribute('aria-pressed',String(button.dataset.view===view));scene?.setView(view);}
for(const button of document.querySelectorAll('[data-view]'))button.addEventListener('click',()=>setView(button.dataset.view));
$('#frame').addEventListener('click',()=>setView('iso'));$('#zoom-in').addEventListener('click',()=>scene?.zoomBy(1.2));$('#zoom-out').addEventListener('click',()=>scene?.zoomBy(1/1.2));$('#focus-part').addEventListener('click',()=>{pause();scene?.focus(selected);});
canvas.addEventListener('keydown',event=>{const pans={ArrowLeft:[-30,0],ArrowRight:[30,0],ArrowUp:[0,-30],ArrowDown:[0,30]};if(pans[event.key]){event.preventDefault();scene?.panBy(...pans[event.key]);}else if(['+','=','-','Home'].includes(event.key)){event.preventDefault();if(event.key==='Home')setView('iso');else scene?.zoomBy(event.key==='-'?1/1.2:1.2);}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();last=performance.now();});
motionQuery.addEventListener('change',event=>{reducedMotion=event.matches;scene?.setReducedMotion(reducedMotion);if(reducedMotion)pause();});
try{const {createMachineScene}=await import('./src/scene.mjs');scene=createMachineScene(canvas,{reducedMotion,onInspect:selectPart,onUserIntent:pause});}catch(error){canvas.hidden=true;canvas.tabIndex=-1;$('#fallback').hidden=false;$('.view-controls').hidden=true;$('#reveal').disabled=true;$('#reveal').closest('.reveal').hidden=true;for(const selector of ['#focus-part','#frame','#zoom-in','#zoom-out','[data-view]'])document.querySelectorAll(selector).forEach(el=>el.disabled=true);console.info('CRANK uses the interactive plan schematic because WebGL could not initialize.',error.message);}
selectPart('crank');syncPlayback();update();ready=true;
window.__machineLab={get ready(){return ready;},seek,stats:()=>({ready,webgl:!!scene,playing,angle,rpm,reveal,selected,reducedMotion,model:solveCrank({angle,rpm}),scene:scene?.stats()??null})};
let last=performance.now();
function frame(now){const dt=Math.min(.05,Math.max(0,(now-last)/1000));last=now;if(playing&&!document.hidden)angle=advanceAngle(angle,rpm,dt);update();scene?.render(dt);requestAnimationFrame(frame);}requestAnimationFrame(frame);
