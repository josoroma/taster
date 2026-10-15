import { createQuantumState, applyGate, resetQuantum, probabilities, blochVectors, fidelity, measure, getEntanglement, CHALLENGES } from './src/model.mjs';
import { createTransport, segmentProgress, damp } from '../../kit/motion.mjs';

const $=id=>document.getElementById(id);
const quantum=createQuantumState(),clock=createTransport({duration:24});
const prefs={reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches,quality:innerWidth<680?'low':'high'};
const lessons=[
  ['Begin with certainty.','Both qubits start in state 0. The only possible joint outcome is 00. The arrows show each qubit’s local state.'],
  ['Open up a possibility.','A Hadamard gate turns qubit 0 into a superposition. The pair can yield 00 or 10, equally likely. Qubit 1 is still 0. The qubits are not entangled yet.'],
  ['One shared state.','A controlled-X gate entangles the pair. Only 00 and 11 remain possible. Both local arrows shrink: each qubit alone is mixed, while their joint state is pure.'],
  ['Random alone. Correlated together.','Measurement yields 00 or 11, each with 50% probability. The tour samples one example at 21 seconds. The result is random; it cannot be chosen to send a message.'],
];
let scene,mode='learn',chapter=-1,storyPose=-1,challengeIndex=0,accepted=false,solved=new Set(),pulse=0,lastGate='',lastFrame=0,uiAt=0;
let explode=0,explodeTarget=0,manualAssembly=false,cameraOwned=true,tourDirty=false,noticeDeadline=0;
let measurementText='No measurement yet';
function pauseTour(){clock.pause();scene?.cancelCameraShot();}
const canvas=$('bell-canvas');
const formatTime=seconds=>`00:${Math.floor(seconds).toString().padStart(2,'0')}`;
const basis=['00','01','10','11'];
$('probabilities').innerHTML=basis.map((s,i)=>`<div class="prob-row"><div class="prob-label"><span>|${s}⟩</span><span id="prob-${i}">0%</span></div><div class="prob-track"><span id="bar-${i}"></span></div></div>`).join('');

function notice(message){$('notice').textContent=message;$('notice').classList.add('visible');noticeDeadline=performance.now()+3200;}
function equation(){
  const terms=quantum.amplitudes.map((a,i)=>({a,i})).filter(({a})=>Math.hypot(a.re,a.im)>1e-7);
  if(terms.length===1)return `|${basis[terms[0].i]}⟩`;
  if(terms.length===2&&terms.every(({a})=>Math.abs(Math.hypot(a.re,a.im)-Math.SQRT1_2)<1e-6)){
    const [a,b]=terms;const sign=(a.a.re*b.a.re+a.a.im*b.a.im)>=0?'+':'−';return `(|${basis[a.i]}⟩ ${sign} |${basis[b.i]}⟩) / √2`;
  }
  return terms.map(({a,i},n)=>`${n&&a.re>=0?'+ ':''}${Math.abs(a.im)<1e-8?a.re.toFixed(2):`(${a.re.toFixed(2)}+${a.im.toFixed(2)}i)`}|${basis[i]}⟩`).join(' ');
}
function refresh(){
  const p=probabilities(quantum),b=blochVectors(quantum),e=getEntanglement(quantum);
  $('state-equation').textContent=equation();
  for(let i=0;i<4;i++){$(`prob-${i}`).textContent=`${Math.round(p[i]*100)}%`;$(`bar-${i}`).style.width=`${p[i]*100}%`;}
  $('entanglement').textContent=e.toFixed(2);$('entanglement-fill').style.width=`${e*100}%`;
  $('purity0').textContent=b[0].purity.toFixed(2);$('purity1').textContent=b[1].purity.toFixed(2);
  $('local-note').textContent=e>.99?'Both local states are maximally mixed. Their arrows meet the center.':'A full arrow represents a pure local state.';
  $('measurement').textContent=measurementText;
  const timing=clock.getState();$('play').textContent=timing.playing?'Ⅱ':'▶';$('play').setAttribute('aria-label',timing.playing?'Pause explanation':'Play explanation');
  $('timeline').value=timing.time;$('timestamp').textContent=`${formatTime(timing.time)} / 00:24`;
  $('assembly-label').textContent=explode<.015?'Together':explode>.98?'Separated':`${Math.round(explode*100)}% apart`;
  $('explode').value=explode;$('assembly-toggle').textContent=explodeTarget>.5?'Reassemble ↙':'Separate ↗';
  if(mode==='play'){
    const c=CHALLENGES[challengeIndex],f=fidelity(quantum,c.target);
    $('challenge-index').textContent=`0${challengeIndex+1} / 03`;$('challenge-name').textContent=c.name;$('challenge-description').textContent=c.description;
    $('target-state').textContent=c.symbol;$('challenge-hint').textContent=c.hint;
    $('fidelity').textContent=`${Math.round(f*100)}%`;$('fidelity-fill').style.width=`${f*100}%`;
    $('gate-count').textContent=`${quantum.history.filter(h=>typeof h==='string'?!h.startsWith('M'):h.type!=='measure').length} gates applied`;
    $('challenge-progress').textContent=CHALLENGES.map(c=>solved.has(c.id)?'●':'○').join(' ');
    $('challenge-progress').setAttribute('aria-label',`${solved.size} of 3 challenges completed`);
    $('check').hidden=accepted;$('next-challenge').hidden=!accepted;
    $('next-challenge').firstChild.textContent=challengeIndex===CHALLENGES.length-1?'Finish the experiment ':'Next challenge ';
  }
}

function syncStory({camera=true,updateUI=true}={}){
  const t=clock.getState().time;
  const nextChapter=Math.min(3,Math.floor(t/6)),nextPose=t>=21?4:nextChapter;
  if(nextPose!==storyPose){
    resetQuantum(quantum);measurementText='No measurement yet';
    if(nextPose>=1)applyGate(quantum,'H0');if(nextPose>=2)applyGate(quantum,'CNOT01');
    if(nextPose===4){const sample=measure(quantum,()=>.73);measurementText=`Example outcome: ${sample.bitstring}`;}
    lastGate=nextPose===1?'H0':nextPose===2?'CNOT01':nextPose===4?'MEASURE':'';pulse++;storyPose=nextPose;
  }
  if(!manualAssembly){
    explodeTarget=t<6?segmentProgress(t,1,5)*.85:t<12?.85:t<18?.85*(1-segmentProgress(t,12,16)):0;
    explode=explodeTarget;
    scene?.setExplode(explode);
  }
  if(nextChapter!==chapter){
    chapter=nextChapter;$('chapter-number').textContent=`0${chapter+1} / 04`;
    $('chapter-title').textContent=lessons[chapter][0];$('chapter-copy').textContent=lessons[chapter][1];
    document.querySelectorAll('[data-chapter]').forEach(el=>{if(Number(el.dataset.chapter)===chapter)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
    if(camera&&cameraOwned)scene?.setFocus(['overview','qubit0','overview','readout'][chapter]);
  }
  if(updateUI)refresh();
}

function setMode(next){
  pauseTour();mode=next;accepted=false;
  $('mode-learn').setAttribute('aria-pressed',String(mode==='learn'));$('mode-play').setAttribute('aria-pressed',String(mode==='play'));
  $('lesson').hidden=mode!=='learn';$('challenge').hidden=mode!=='play';$('transport').hidden=mode!=='learn';$('gate-deck').hidden=mode!=='play';
  $('challenge-hint').hidden=true;measurementText='No measurement yet';lastGate='';
  if(mode==='play'){
    resetQuantum(quantum);manualAssembly=true;explodeTarget=.5;scene?.setFocus('overview');
    notice('Build the target state using the gates below. Then check it.');
  }else{manualAssembly=false;tourDirty=false;storyPose=-1;chapter=-1;clock.seek(0);cameraOwned=true;syncStory();}
  refresh();
}
$('mode-learn').addEventListener('click',()=>setMode('learn'));$('mode-play').addEventListener('click',()=>setMode('play'));
$('play').addEventListener('click',()=>{
  if(clock.getState().playing)pauseTour();
  else{cameraOwned=true;manualAssembly=false;if(tourDirty){clock.seek(0);storyPose=-1;chapter=-1;tourDirty=false;}clock.play();syncStory();scene?.setFocus(['overview','qubit0','overview','readout'][chapter]);}
  refresh();
});
$('timeline').addEventListener('input',()=>{pauseTour();clock.seek(Number($('timeline').value));tourDirty=false;manualAssembly=false;syncStory({camera:false});});
$('speed').addEventListener('change',()=>clock.setRate(Number($('speed').value)));
document.querySelectorAll('[data-chapter]').forEach(button=>button.addEventListener('click',()=>{pauseTour();clock.seek(Number(button.dataset.chapter)*6);tourDirty=false;manualAssembly=false;cameraOwned=true;chapter=-1;syncStory();}));
$('explode').addEventListener('input',()=>{manualAssembly=true;pauseTour();explode=explodeTarget=Number($('explode').value);refresh();});
$('assembly-toggle').addEventListener('click',()=>{manualAssembly=true;pauseTour();explodeTarget=explodeTarget>.5?0:1;refresh();});
$('focus').addEventListener('change',()=>{cameraOwned=false;scene?.setFocus($('focus').value);});
$('home').addEventListener('click',()=>{cameraOwned=false;scene?.resetCamera();$('focus').value='overview';});
$('zoom-in').addEventListener('click',()=>scene?.zoomBy(1.2));$('zoom-out').addEventListener('click',()=>scene?.zoomBy(1/1.2));
for(const [name,x,y] of [['left',-60,0],['right',60,0],['up',0,-60],['down',0,60]])$(`pan-${name}`).addEventListener('click',()=>scene?.panBy(x,y));
canvas.addEventListener('keydown',event=>{
  const pans={ArrowLeft:[-40,0],ArrowRight:[40,0],ArrowUp:[0,-40],ArrowDown:[0,40]};
  if(pans[event.key]){event.preventDefault();scene?.panBy(...pans[event.key]);}
  if(['+','=','-','_','Home'].includes(event.key)){event.preventDefault();if(event.key==='Home')scene?.resetCamera();else scene?.zoomBy(['+','='].includes(event.key)?1.15:1/1.15);}
});
document.querySelectorAll('[data-gate]').forEach(button=>button.addEventListener('click',()=>{
  if(accepted)return;applyGate(quantum,button.dataset.gate);lastGate=button.dataset.gate;pulse++;measurementText='No measurement yet';refresh();
}));
$('reset-state').addEventListener('click',()=>{resetQuantum(quantum);accepted=false;measurementText='No measurement yet';lastGate='';refresh();});
$('hint').addEventListener('click',()=>{$('challenge-hint').hidden=!$('challenge-hint').hidden;});
$('check').addEventListener('click',()=>{
  const c=CHALLENGES[challengeIndex],f=fidelity(quantum,c.target);
  if(f>.999){accepted=true;solved.add(c.id);pulse++;notice('State matched. The amplitudes and relative phase agree.');}
  else notice(f<.01?'The probabilities may match, but the relative phase is different.':`Your target fidelity is ${Math.round(f*100)}%. Try another gate or reset the circuit.`);
  refresh();
});
$('next-challenge').addEventListener('click',()=>{
  if(challengeIndex===CHALLENGES.length-1){$('win-dialog').showModal();return;}
  challengeIndex++;resetQuantum(quantum);accepted=false;$('challenge-hint').hidden=true;measurementText='No measurement yet';refresh();
});
$('play-again').addEventListener('click',()=>{$('win-dialog').close();challengeIndex=0;solved.clear();setMode('play');});
$('return-explore').addEventListener('click',()=>{$('win-dialog').close();setMode('learn');});
$('measure').addEventListener('click',()=>{
  pauseTour();if(mode==='learn'){tourDirty=true;storyPose=-1;chapter=-1;}
  const sample=measure(quantum);measurementText=`Measured ${sample.bitstring}`;lastGate='MEASURE';pulse++;
  if(mode==='learn'){$('chapter-title').textContent='One outcome, now certain.';$('chapter-copy').textContent=`This run produced ${sample.bitstring}. Measuring again repeats that result. Choose a chapter or press Play to prepare a fresh state and explore its probabilities again.`;}
  notice(`Outcome ${sample.bitstring}. This run’s state has collapsed.`);if(mode==='play')accepted=false;refresh();
});
const showModel=()=>{pauseTour();refresh();$('model-dialog').showModal();};
$('about').addEventListener('click',showModel);$('sources').addEventListener('click',showModel);
document.querySelector('.close-dialog').addEventListener('click',()=>$('model-dialog').close());
$('gentle').checked=prefs.reducedMotion;$('quality').value=prefs.quality;
$('gentle').addEventListener('change',()=>{prefs.reducedMotion=$('gentle').checked;scene?.setReducedMotion(prefs.reducedMotion);if(prefs.reducedMotion)pauseTour();refresh();});
$('quality').addEventListener('change',()=>{prefs.quality=$('quality').value;scene?.setQuality(prefs.quality);});
$('reload').addEventListener('click',()=>location.reload());
document.addEventListener('visibilitychange',()=>{lastFrame=0;if(document.hidden){pauseTour();refresh();}});
window.addEventListener('resize',()=>scene?.resize());
canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();pauseTour();$('graphics-error').hidden=false;});

function frame(now){
  requestAnimationFrame(frame);if(document.hidden||!scene)return;
  const dt=lastFrame?Math.min((now-lastFrame)/1000,.1):0;lastFrame=now;
  if(mode==='learn'&&clock.getState().playing){clock.update(dt);syncStory({updateUI:false});}
  if(manualAssembly)explode=prefs.reducedMotion?explodeTarget:damp(explode,explodeTarget,7,dt);
  if(Math.abs(explode-explodeTarget)<.0001)explode=explodeTarget;
  scene.render({amplitudes:quantum.amplitudes,probabilities:probabilities(quantum),bloch:blochVectors(quantum),entanglement:getEntanglement(quantum),explode,pulse,gate:lastGate},dt);
  if(now-uiAt>100){refresh();uiAt=now;}
  if(noticeDeadline&&now>noticeDeadline){$('notice').classList.remove('visible');noticeDeadline=0;}
}
window.__bellLab=Object.freeze({
  getState:()=>({mode,challengeIndex,accepted,solved:[...solved],quantum:structuredClone(quantum),probabilities:probabilities(quantum),entanglement:getEntanglement(quantum),clock:clock.getState(),explode,explodeTarget,cameraOwned}),
  stats:()=>scene?.stats(),assembly:()=>scene?.getAssemblyState?.(),
});
syncStory({camera:false});
try{
  const {createBellScene}=await import('./src/scene.mjs');
  scene=createBellScene(canvas,{...prefs,onCameraChange:()=>{cameraOwned=false;}});
  $('loading').hidden=true;$('play').disabled=false;
  requestAnimationFrame(frame);
}catch(error){console.error('Bell Lab could not start:',error);$('loading').hidden=true;$('graphics-error').hidden=false;}
