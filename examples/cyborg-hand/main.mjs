import {createTransport,smootherstep} from '../../kit/motion.mjs';
import {DURATION,PARTS,STAGES,sampleGrip,sampleSequence,clamp01} from './src/model.mjs';

const $=selector=>document.querySelector(selector),media=matchMedia('(prefers-reduced-motion: reduce)');
const clock=createTransport({duration:DURATION});
let scene=null,reduced=media.matches,pose={grip:0,separation:0},selected='fingers',mode='manual',transition=null,afterTransition=null,stageID='',guidedCamera=false,last=performance.now(),hidden=document.hidden;
const format=seconds=>`00:${String(Math.floor(seconds)).padStart(2,'0')}`;
const announce=text=>{$('#announcer').textContent=text;};
const normalize=id=>['index','middle','ring','little'].includes(id)?'fingers':id==='palm'?'actuators':id==='cuff'?'wrist':id;
const part=id=>PARTS.find(p=>p.id===id);
const clampPose=p=>({grip:clamp01(p.grip),separation:clamp01(p.separation)});

PARTS.forEach((p,i)=>{const button=document.createElement('button');button.dataset.part=p.id;button.setAttribute('aria-pressed',String(p.id===selected));button.innerHTML=`<span>${String(i+1).padStart(2,'0')}</span><span>${p.name}</span>`;button.addEventListener('click',()=>selectPart(p.id));$('#parts-list').append(button);});
STAGES.forEach((stage,i)=>{const button=document.createElement('button');button.dataset.stage=stage.id;button.innerHTML=`<span>${String(i+1).padStart(2,'0')}</span>${stage.name}`;button.addEventListener('click',()=>seek(stage.start));$('#chapter-nav').append(button);});

function updatePart(){const p=part(selected);$('#part-number').textContent=String(PARTS.indexOf(p)+1).padStart(2,'0');$('#part-kicker').textContent=p.kicker;$('#part-name').textContent=p.name;$('#part-description').textContent=p.description;$('#part-detail').textContent=p.detail;for(const b of document.querySelectorAll('#parts-list [data-part]'))b.setAttribute('aria-pressed',String(b.dataset.part===selected));}
function selectPart(id){id=normalize(id);if(!part(id))return;pause();selected=id;scene?.select(id);updatePart();updateUI();renderLabels();announce(`${part(id).name}. ${part(id).description}`);}
function applyPose(value){pose=clampPose(value);scene?.setPose(pose);updateUI();}
function updateUI(){
  const state=clock.getState(),sample=sampleSequence(state.time),closing=pose.grip>.005,apart=pose.separation>.005;
  $('#grip').value=pose.grip;$('#grip-value').innerHTML=`${Math.round(pose.grip*100)}<span>%</span>`;$('#grip').setAttribute('aria-valuetext',`${Math.round(pose.grip*100)} percent closed`);
  $('#separation').value=pose.separation;$('#separation').setAttribute('aria-valuetext',apart?`${Math.round(pose.separation*100)} percent separated`:'Assembled');
  $('#gesture-toggle').textContent=pose.grip>.5?'Extend hand ↗':'Close fist ↘';$('#pose-badge').textContent=pose.grip>.995?'FIST':closing?'ARTICULATING':'EXTENDED';$('#assembly-badge').textContent=apart?`${Math.round(pose.separation*100)}% SEPARATED`:'ASSEMBLED';$('#separate-label').textContent=apart?'Reassemble layers':'Separate layers';
  const angles=sampleGrip(pose.grip).fingers[0].angles;for(const [i,id] of ['base','middle','tip'].entries())$('#angle-'+id).textContent=`${Math.round(angles[i]*180/Math.PI)}°`;
  $('#scene-state').textContent=`${apart?'EXPLODED VIEW':pose.grip>.995?'CLOSED CONFIGURATION':closing?'ARTICULATING':'OPEN CONFIGURATION'} / ${part(selected).name.toUpperCase()}`;
  if(mode==='sequence'){
    if(stageID!==sample.stage.id){stageID=sample.stage.id;$('#motion-title').textContent=sample.stage.title;$('#motion-copy').textContent=sample.stage.caption;selected=sample.stage.part;scene?.select(selected);updatePart();if(guidedCamera&&sample.stage.id==='separate'){scene?.setView('back',{expanded:true});updateViewButtons('back');}announce(`${sample.stage.name}. ${sample.stage.caption}`);}
  }else{stageID='';$('#motion-title').innerHTML=apart?'A closer look.<br>Layer by layer.':pose.grip>.995?'Power in<br>the geometry.':closing?'Every joint.<br>One gesture.':'Precision,<br>in motion.';$('#motion-copy').textContent=apart?'The shell lifts. The drive channels emerge. Follow how the layers connect, then put them back together.':pose.grip>.995?'The thumb follows the folded fingers. Inspect the joint chain, or extend the hand to reverse the gesture.':'From an open palm to a closed fist. Follow the joints, then look beneath the shell.';}
  for(const b of document.querySelectorAll('[data-stage]')){if(mode==='sequence'&&b.dataset.stage===sample.stage.id)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');}
  const playing=state.playing||!!afterTransition;$('#play-icon').textContent=playing?'Ⅱ':'▶';$('#play-label').textContent=playing?'Pause motion':mode==='manual'?'Play motion study':sample.finished?'Replay motion study':'Continue study';$('#play').setAttribute('aria-label',playing?'Pause motion study':'Play motion study');
  $('#time-readout').textContent=`${format(state.time)} / ${format(DURATION)}`;$('#timeline').value=state.time;$('#timeline').setAttribute('aria-valuetext',`${format(state.time)}. ${sample.stage.name}.`);$('#sequence-status').textContent=mode==='manual'?'MANUAL INSPECTION / YOU CONTROL THE MOTION':`${String(sample.index+1).padStart(2,'0')} / ${sample.stage.name.toUpperCase()}`;
}
function pause(){clock.pause();transition=null;afterTransition=null;guidedCamera=false;scene?.cancelCameraShot();updateUI();}
function animatePose(goal,{onComplete=null}={}){
  pause();mode='manual';goal=clampPose(goal);if(goal.separation>0)goal.grip=0;
  const steps=[];let cursor={...pose};
  function add(to,duration){if(Math.abs(to.grip-cursor.grip)+Math.abs(to.separation-cursor.separation)<1e-7)return;steps.push({from:{...cursor},to:{...to},duration,elapsed:0});cursor={...to};}
  if(goal.separation>0&&cursor.grip>0)add({grip:0,separation:0},1.15);
  if(goal.grip>0&&cursor.separation>0)add({grip:0,separation:0},1.2);
  add(goal,goal.separation!==cursor.separation?1.6:1.5);
  afterTransition=onComplete;
  if(reduced||!steps.length){applyPose(goal);const next=afterTransition;afterTransition=null;next?.();return;}
  transition={steps,index:0};updateUI();
}
function advanceManual(dt){if(!transition)return;const step=transition.steps[transition.index];step.elapsed=Math.min(step.duration,step.elapsed+dt);const u=smootherstep(step.elapsed/step.duration);applyPose({grip:step.from.grip+(step.to.grip-step.from.grip)*u,separation:step.from.separation+(step.to.separation-step.from.separation)*u});if(step.elapsed>=step.duration){applyPose(step.to);transition.index++;if(transition.index===transition.steps.length){transition=null;const next=afterTransition;afterTransition=null;next?.();updateUI();}}}
function seek(time){pause();mode='sequence';clock.seek(time);stageID='';const sample=sampleSequence(time);applyPose(sample);const view=sample.time>=18?'back':'three-quarter';scene?.setView(view,{expanded:sample.separation>.05,duration:0});updateViewButtons(view);scene?.render(0);renderLabels();}
function startSequence(){mode='sequence';stageID='';guidedCamera=true;clock.play();applyPose(sampleSequence(clock.getState().time));const view=clock.getState().time>=18?'back':'three-quarter';scene?.setView(view,{expanded:pose.separation>.05,duration:reduced?0:.8});updateViewButtons(view);updateUI();}
function togglePlay(){if(clock.getState().playing||afterTransition){pause();announce('Motion paused.');return;}if(mode==='manual'){clock.seek(clock.getState().rate<0?DURATION:0);animatePose({grip:0,separation:0},{onComplete:startSequence});}else startSequence();}
function manualSlider(channel,value){pause();mode='manual';applyPose(channel==='grip'?{grip:Number(value),separation:0}:{grip:0,separation:Number(value)});}

$('#close-hand').addEventListener('click',()=>{animatePose({grip:1,separation:0});announce('Closing the fingers, then bringing the thumb across.');});
$('#gesture-toggle').addEventListener('click',()=>{animatePose({grip:pose.grip>.5?0:1,separation:0});});
$('#open-hand').addEventListener('click',()=>{animatePose({grip:0,separation:0});announce('Extending the hand.');});
$('#grip').addEventListener('input',e=>manualSlider('grip',e.target.value));
$('#separation').addEventListener('input',e=>{const wasClosed=pose.grip>0;manualSlider('separation',e.target.value);if(wasClosed)announce('Hand extended for layer inspection.');});
$('#separate').addEventListener('click',()=>{const expand=pose.separation<.005;animatePose({grip:0,separation:expand?1:0});if(expand){scene?.setView('back',{expanded:true});updateViewButtons('back');}else scene?.overview(reduced?0:.8,false);selected=expand?'carapace':'fingers';scene?.select(selected);updatePart();announce(expand?'Extending the hand and separating its layers.':'Reassembling the layers.');});
$('#play').addEventListener('click',togglePlay);$('#speed').addEventListener('change',e=>clock.setRate(Number(e.target.value)));
$('#timeline').addEventListener('input',e=>seek(Number(e.target.value)));
$('#restart').addEventListener('click',()=>{pause();mode='manual';clock.seek(0);clock.setRate(1);$('#speed').value='1';selected='fingers';scene?.select(selected);updatePart();animatePose({grip:0,separation:0});scene?.setView('three-quarter');updateViewButtons('three-quarter');announce('Reset to the extended hand.');});
function updateViewButtons(view){for(const b of document.querySelectorAll('[data-view]'))b.setAttribute('aria-pressed',String(b.dataset.view===view));$('#view-name').textContent=view.toUpperCase();}
for(const b of document.querySelectorAll('[data-view]'))b.addEventListener('click',()=>{pause();scene?.setView(b.dataset.view);updateViewButtons(b.dataset.view);});
$('#orbit-left').addEventListener('click',()=>{pause();scene?.rotate(-.28);});$('#orbit-right').addEventListener('click',()=>{pause();scene?.rotate(.28);});
$('#zoom-in').addEventListener('click',()=>{pause();scene?.zoomBy(1.2);});$('#zoom-out').addEventListener('click',()=>{pause();scene?.zoomBy(1/1.2);});$('#frame-all').addEventListener('click',()=>{pause();scene?.overview(reduced?0:.7,pose.separation>.05);});
for(const [id,x,y] of [['pan-left',-35,0],['pan-right',35,0],['pan-up',0,-35],['pan-down',0,35]])$('#'+id).addEventListener('click',()=>{pause();scene?.panBy(x,y);});
$('#focus-part').addEventListener('click',()=>{pause();scene?.focus(selected);$('#scene-frame').scrollIntoView({block:'center',behavior:reduced?'auto':'smooth'});});
$('#show-labels').addEventListener('change',renderLabels);
$('#hand-scene').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','Home',' '].includes(e.key))return;e.preventDefault();if(e.key===' '){togglePlay();return;}pause();if(e.key==='Home')scene?.overview(reduced?0:.7,pose.separation>.05);else if(e.key==='+'||e.key==='=')scene?.zoomBy(1.15);else if(e.key==='-')scene?.zoomBy(1/1.15);else scene?.panBy(e.key==='ArrowLeft'?-25:e.key==='ArrowRight'?25:0,e.key==='ArrowUp'?-25:e.key==='ArrowDown'?25:0);});
const labelNodes=new Map(),svgNS='http://www.w3.org/2000/svg';
function renderLabels(){
  const frame=$('#scene-frame'),w=frame.clientWidth,h=frame.clientHeight,limit=w<500?2:3;
  const anchors=scene&&$('#show-labels').checked?scene.projectLabels()
    .filter(a=>a.visible&&a.x>15&&a.x<w-15&&a.y>25&&a.y<h-30)
    .sort((a,b)=>(b.id===selected)-(a.id===selected)).slice(0,limit):[];
  const active=new Set(anchors.map(a=>a.id));
  for(const [id,node]of labelNodes)if(!active.has(id)){node.label.remove();node.group.remove();labelNodes.delete(id);}
  // Keep surviving callouts in their slots; a newly visible part fills a gap
  // instead of making every label jump. Reuse DOM nodes throughout playback.
  const occupied=new Set();
  for(const node of labelNodes.values()){if(node.slot<limit)occupied.add(node.slot);else node.slot=-1;}
  for(const a of anchors){
    let node=labelNodes.get(a.id);
    if(!node){
      const label=document.createElement('span'),group=document.createElementNS(svgNS,'g'),path=document.createElementNS(svgNS,'path'),dot=document.createElementNS(svgNS,'circle');
      label.className='callout';label.dataset.part=a.id;label.textContent=part(a.id)?.name??a.label;
      group.dataset.part=a.id;dot.setAttribute('r','2');group.append(path,dot);
      $('#callouts').append(label);$('#leader-lines').append(group);
      node={label,group,path,dot,slot:-1};labelNodes.set(a.id,node);
    }
    if(node.slot<0){node.slot=Array.from({length:limit},(_,i)=>i).find(i=>!occupied.has(i));occupied.add(node.slot);}
    const right=node.slot%2===0,x=right?w-node.label.offsetWidth-18:18,y=76+node.slot*Math.min(120,(h-190)/3);
    node.label.style.left=`${x}px`;node.label.style.top=`${y}px`;
    const sx=right?x:x+node.label.offsetWidth,sy=y+node.label.offsetHeight/2;
    node.path.setAttribute('d',`M${sx} ${sy}L${sx+(right?-12:12)} ${sy}L${a.x.toFixed(1)} ${a.y.toFixed(1)}`);
    node.dot.setAttribute('cx',a.x.toFixed(1));node.dot.setAttribute('cy',a.y.toFixed(1));
  }
  $('#leader-lines').setAttribute('viewBox',`0 0 ${w} ${h}`);
}
const dialog=$('#about-dialog');$('#about-open').addEventListener('click',()=>{pause();dialog.showModal();});$('#about-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)dialog.close();}});
media.addEventListener('change',e=>{reduced=e.matches;pause();scene?.setReducedMotion(reduced);});document.addEventListener('visibilitychange',()=>{hidden=document.hidden;if(hidden)pause();last=performance.now();});
updatePart();updateUI();
try{const {createHandScene}=await import('./src/scene.mjs');scene=createHandScene($('#hand-scene'),{reducedMotion:reduced,onSelect:selectPart,onUserIntent:()=>{pause();updateViewButtons('manual');}});scene.setPose(pose);scene.select(selected);}catch(error){$('#fallback').hidden=false;$('#hand-scene').hidden=true;for(const b of document.querySelectorAll('.camera-controls button,.pan-buttons button,.view-buttons button,#focus-part'))b.disabled=true;$('#show-labels').disabled=true;}
function frame(now){const dt=Math.min(.08,Math.max(0,(now-last)/1000));last=now;if(!hidden){if(clock.getState().playing){clock.update(dt);applyPose(sampleSequence(clock.getState().time));}else advanceManual(dt);scene?.render(dt);renderLabels();}requestAnimationFrame(frame);}
window.__dextra={stats:()=>({...clock.getState(),...pose,mode,selected,reducedMotion:reduced,transitioning:!!transition,webgl:!!scene,scene:scene?.stats()??null}),seek,setPose(value){pause();mode='manual';applyPose(value);scene?.render(0);renderLabels();return this.stats();},pause,select:selectPart};
requestAnimationFrame(frame);
