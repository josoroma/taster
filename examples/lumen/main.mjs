import { createGame, startGame, stepGame, interact, dash, togglePause, restartGame, getObjective, GAME_CONFIG } from './src/model.mjs';

const $ = id => document.getElementById(id);
const state = createGame();
const canvas = $('world');
const keys = new Set();
const touchKeys = new Map();
const coarse = matchMedia('(pointer: coarse)').matches;
const settings = { quality: innerWidth < 650 ? 'low' : 'high', reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches };
let world, accumulator = 0, previousTime = 0, uiTime = 0, lastMode = '', toastUntil = 0, cameraMode = 0, pendingTarget, pulseId = 0;
let soundEnabled = false, audioContext, ambience, audioGain;
const cameras = ['isometric', 'close', 'wide'];
const formatTime = value => `${Math.floor(value / 60).toString().padStart(2,'0')}:${Math.floor(value % 60).toString().padStart(2,'0')}`;
const mappoint = p => ({ x:90+p.x*8, y:70+p.z*8 });

function toast(message, duration=3000) {
  $('toast').textContent = message;
  $('toast').classList.add('visible');
  toastUntil = performance.now() + duration;
}

function initAudio() {
  if (audioContext) { audioContext.resume().catch(()=>{}); return; }
  const Context = window.AudioContext || window.webkitAudioContext;
  if (!Context) return;
  audioContext = new Context();
  audioGain = audioContext.createGain();
  audioGain.gain.value = soundEnabled ? 0.6 : 0;
  audioGain.connect(audioContext.destination);
  const buffer = audioContext.createBuffer(1, audioContext.sampleRate*4, audioContext.sampleRate);
  const samples = buffer.getChannelData(0);
  let value=0;
  for(let i=0;i<samples.length;i++){value=(value+(Math.random()*2-1)*.02)/1.02;samples[i]=value;}
  ambience=audioContext.createBufferSource();ambience.buffer=buffer;ambience.loop=true;
  const filter=audioContext.createBiquadFilter();filter.type='lowpass';filter.frequency.value=450;
  const gain=audioContext.createGain();gain.gain.value=.16;
  ambience.connect(filter).connect(gain).connect(audioGain);ambience.start();
}

function note(frequency, duration=.8, delay=0, volume=.16) {
  if (!audioContext || !soundEnabled) return;
  const now=audioContext.currentTime+delay;
  const oscillator=audioContext.createOscillator();const gain=audioContext.createGain();
  oscillator.type='sine';oscillator.frequency.value=frequency;
  gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(volume,now+.015);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
  oscillator.connect(gain).connect(audioGain);oscillator.start(now);oscillator.stop(now+duration+.05);
  oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
}

function processEvents(events) {
  for (const event of events) {
    if (event.type==='start'||event.type==='restart') { toast('Follow the light. Stand beside a beacon to tune it.',4500);note(293.66);note(440,1,.15); }
    if (event.type==='charge') { toast(`${event.name} beacon · ${event.charge} of 3 notes in harmony`,1800);note(293.66*(1+event.charge*.25));state.pulse=++pulseId; }
    if (event.type==='tuned') { const count=state.beacons.filter(b=>b.lit).length;toast(count===3?'The garden is awake. Return to the circular gate.':`${event.name} is awake. ${3-count} light${count===2?'':'s'} still sleeping.`,4000);[293.66,369.99,440,587.33].forEach((f,i)=>note(f,1.5,i*.12));state.pulse=++pulseId; }
    if (event.type==='miss') { toast('Listen for the rhythm. Try the next gold band.',1800);note(146.83,.25,0,.08); }
    if (event.type==='hurt') { toast('A sentinel caught your light. Dash to slip past.',2500);note(110,.35); }
    if (event.type==='dash') { note(660,.14,0,.06); }
    if (event.type==='exit-locked') toast('The gate is waiting for all three beacons.');
    if (event.type==='won') {
      $('ending-eyebrow').textContent='THE GARDEN REMEMBERS';
      $('ending-title').innerHTML='A little light.<br>A world awakened.';
      let best='';
      try { const old=Number(localStorage.getItem('lumen-best'));const value=old>0?Math.min(old,event.time):event.time;localStorage.setItem('lumen-best',value);best=` Your best journey: ${formatTime(value)}.`;} catch {}
      $('ending-copy').textContent=`Three beacons sing again. You brought the garden back in ${formatTime(event.time)}, with ${state.player.hp} light${state.player.hp===1?'':'s'} to spare.${best}`;
      $('ending').showModal();[293.66,369.99,440,587.33,739.99].forEach((f,i)=>note(f,2,i*.2));
    }
    if (event.type==='lost') {
      $('ending-eyebrow').textContent='EVEN LITTLE LIGHTS NEED REST';
      $('ending-title').innerHTML='The light will<br>find its way.';
      $('ending-copy').textContent='The sentinels caught your glow. Try another path, and use your dash to move safely through them.';
      $('ending').showModal();note(146.83,1.4);
    }
  }
  updateUI();
}

function moveInput() {
  const held=new Set([...keys,...touchKeys.values()]);
  const right=Number(held.has('KeyD')||held.has('ArrowRight'))-Number(held.has('KeyA')||held.has('ArrowLeft'));
  const forward=Number(held.has('KeyW')||held.has('ArrowUp'))-Number(held.has('KeyS')||held.has('ArrowDown'));
  return {x:(right*28-forward*20)/34.4093,z:(-right*20-forward*28)/34.4093};
}

function updateUI() {
  const playing=state.mode==='playing'||state.mode==='paused';
  if(lastMode!==state.mode){
    $('welcome').hidden=state.mode!=='ready';$('mission').hidden=!playing;
    $('game').classList.toggle('playing',state.mode!=='ready');
    $('touch-controls').hidden=!(playing&&(coarse||innerWidth<650));
    $('pause').disabled=!playing;$('pause').textContent=state.mode==='paused'?'▷':'Ⅱ';
    lastMode=state.mode;
  }
  const lit=state.beacons.filter(b=>b.lit).length;
  $('beacon-count').innerHTML=`${lit} <span>/ 3</span>`;
  $('health').textContent='◆ '.repeat(state.player.hp)+'◇ '.repeat(3-state.player.hp);
  $('health').setAttribute('aria-label',`${state.player.hp} lives remaining`);
  let objective=getObjective(state);
  if(coarse||innerWidth<650) objective=objective.replace('press E','tap Tune').replace('Press E','Tap Tune');
  $('objective').textContent=objective;
  $('dash-fill').style.transform=`scaleX(${1-state.player.dashCooldown/GAME_CONFIG.dashCooldown})`;
  $('time').textContent=formatTime(state.time);
  const nearExit=state.exit.ready&&Math.hypot(state.player.x-state.exit.x,state.player.z-state.exit.z)<GAME_CONFIG.exitRange;
  $('tuning').hidden=state.mode!=='playing'||(state.tune.nearIndex<0&&!nearExit);
  if(nearExit){
    $('tune-heading').textContent='THE WAY HOME IS OPEN';
    $('tune-copy').textContent=coarse||innerWidth<650?'Tap Tune to open the gate':'Press E to open the gate';
    document.querySelector('.tune-track').hidden=true;
  }else if(state.tune.nearIndex>=0){
    const beacon=state.beacons[state.tune.nearIndex];
    $('tune-heading').textContent=`${beacon.name.toUpperCase()} · ${beacon.charge??0} / 3 NOTES`;
    $('tune-copy').innerHTML=state.tune.waiting?'A note is held. Catch the next pulse.':coarse||innerWidth<650?'Tap Tune when the light enters the gold band':'Press <kbd>E</kbd> when the light enters the gold band';
    document.querySelector('.tune-track').hidden=false;
  }
  $('map-status').textContent=lit===3?'THE GARDEN IS AWAKE':state.mode==='ready'?'THE GARDEN IS SLEEPING':`${lit} OF 3 LIGHTS AWAKENED`;
  const p=mappoint(state.player);$('map-player').setAttribute('cx',p.x);$('map-player').setAttribute('cy',p.y);
  $('map-beacons').innerHTML=state.beacons.map(b=>{const p=mappoint(b);return `<path d="M${p.x} ${p.y-4}l4 4-4 4-4-4Z" fill="${b.lit?'#a9e8c1':'#d5bb79'}" stroke="${b.lit?'#d5ffe5':'none'}"/>`;}).join('');
  $('map-hazards').innerHTML=state.hazards.map(b=>{const p=mappoint(b);return `<circle cx="${p.x}" cy="${p.y}" r="2" fill="#dd8057"/>`;}).join('');
  $('map-exit').setAttribute('stroke',state.exit.ready?'#bcf3c9':'#bcb28a');
}

function openMenu() {
  keys.clear();touchKeys.clear();
  if(state.mode==='playing')processEvents(togglePause(state));
  if(!$('menu').open)$('menu').showModal();
}
function closeMenu() {
  $('menu').close();
  if(state.mode==='paused')processEvents(togglePause(state));
  canvas.focus({preventScroll:true});
}
function begin(restart=false) {
  keys.clear();touchKeys.clear();accumulator=0;pendingTarget=undefined;
  $('menu').close();$('ending').close();
  initAudio();processEvents(restart?restartGame(state):startGame(state));
  canvas.focus({preventScroll:true});
}
$('start').addEventListener('click',()=>begin());
$('restart').addEventListener('click',()=>begin(true));$('again').addEventListener('click',()=>begin(true));
$('pause').addEventListener('click',openMenu);$('settings').addEventListener('click',openMenu);$('resume').addEventListener('click',closeMenu);
$('menu').addEventListener('cancel',event=>{event.preventDefault();closeMenu();});
$('ending').addEventListener('cancel',event=>event.preventDefault());
$('sound').addEventListener('click',()=>{
  soundEnabled=!soundEnabled;initAudio();
  if(audioGain)audioGain.gain.setTargetAtTime(soundEnabled?.6:0,audioContext.currentTime,.25);
  $('sound').setAttribute('aria-pressed',String(soundEnabled));$('sound').querySelector('span').textContent=soundEnabled?'on':'off';
  if(soundEnabled)note(587.33,1);
});
$('quality').value=settings.quality;
$('quality').addEventListener('change',()=>{settings.quality=$('quality').value;world?.setQuality(settings.quality);});
$('motion').checked=settings.reducedMotion;
$('motion').addEventListener('change',()=>{settings.reducedMotion=$('motion').checked;world?.setReducedMotion?.(settings.reducedMotion);});
$('camera').addEventListener('click',()=>{cameraMode=(cameraMode+1)%cameras.length;world?.setCamera(cameras[cameraMode]);$('camera-label').textContent=['Camera','Closer','Wide'][cameraMode];});
$('touch-tune').addEventListener('click',()=>processEvents(interact(state)));
$('touch-dash').addEventListener('click',()=>processEvents(dash(state)));
const directionCodes={up:'KeyW',left:'KeyA',down:'KeyS',right:'KeyD'};
for(const button of document.querySelectorAll('[data-direction]')){
  button.addEventListener('pointerdown',event=>{event.preventDefault();button.setPointerCapture(event.pointerId);touchKeys.set(event.pointerId,directionCodes[button.dataset.direction]);});
  for(const kind of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(kind,event=>touchKeys.delete(event.pointerId));
}
window.addEventListener('keydown',event=>{
  if(event.code==='Escape'&&!$('menu').open&&!$('ending').open){event.preventDefault();openMenu();return;}
  if($('menu').open||$('ending').open||state.mode!=='playing')return;
  if(event.target instanceof Element&&event.target.closest('button,a,input,select,textarea,[contenteditable="true"]'))return;
  if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','KeyE'].includes(event.code))event.preventDefault();
  keys.add(event.code);
  if(!event.repeat&&event.code==='KeyE')processEvents(interact(state));
  if(!event.repeat&&event.code==='Space')processEvents(dash(state));
});
window.addEventListener('keyup',event=>keys.delete(event.code));
window.addEventListener('blur',()=>{keys.clear();touchKeys.clear();});
document.addEventListener('visibilitychange',()=>{
  keys.clear();touchKeys.clear();accumulator=0;previousTime=0;
  if(document.hidden){if(state.mode==='playing')openMenu();audioContext?.suspend();}
  else if(soundEnabled)audioContext?.resume().catch(()=>{});
});
canvas.addEventListener('pointerdown',event=>{
  if(state.mode!=='playing')return;
  const target=world?.pick(event.clientX,event.clientY);
  if(target){pendingTarget=target;canvas.focus({preventScroll:true});}
});
canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();showFallback('The graphics connection was interrupted. Reload to return to the garden.');});
window.addEventListener('resize',()=>{world?.resize();lastMode='';updateUI();});

function showFallback(message) {
  if(state.mode==='playing')togglePause(state);
  $('fallback').hidden=false;if(message)$('fallback-copy').textContent=message;
  $('start').disabled=true;
}

function frame(now) {
  requestAnimationFrame(frame);
  if(document.hidden||!world)return;
  const dt=previousTime?Math.min((now-previousTime)/1000,.1):0;previousTime=now;
  if(state.mode==='playing'){
    accumulator+=dt;
    const input=moveInput();
    while(accumulator>=1/60){
      if(pendingTarget){input.target=pendingTarget;pendingTarget=undefined;}
      processStep(stepGame(state,input,1/60));delete input.target;accumulator-=1/60;
    }
  }else accumulator=0;
  world.render(state,state.mode==='paused'?0:dt);
  $('tune-cursor').style.left=`${state.tune.phase*100}%`;
  if(now-uiTime>100){updateUI();uiTime=now;}
  if(toastUntil&&now>toastUntil){$('toast').classList.remove('visible');toastUntil=0;}
}
function processStep(events){if(events.length)processEvents(events);}

window.__lumen=Object.freeze({getState:()=>structuredClone(state),stats:()=>world?.stats?.(),version:'1.0.0'});
try {
  const { createScene }=await import('./src/scene.mjs');
  world=createScene(canvas,settings);
  const band=document.querySelector('.tune-window');band.style.left=`${GAME_CONFIG.tuneWindowStart*100}%`;band.style.width=`${(GAME_CONFIG.tuneWindowEnd-GAME_CONFIG.tuneWindowStart)*100}%`;
  world.render(state,0);
  $('start').disabled=false;$('start').firstElementChild.textContent='Enter the garden';
  updateUI();requestAnimationFrame(frame);
} catch(error) {
  console.error('Lumen could not start:',error);
  showFallback('This garden needs a browser with WebGL 2 and hardware acceleration. Enable graphics acceleration, then reload.');
}
