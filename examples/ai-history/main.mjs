import {createTransport} from '../../kit/motion.mjs';
import {CHAPTERS,SOURCES,DURATION,sampleFilm} from './src/model.mjs';
import {createFilmScene} from './src/scene.mjs';
const $=s=>document.querySelector(s);
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const clock=createTransport({duration:DURATION});
const scene=createFilmScene($('#film-canvas'));
let lastIndex=-1,lastTime=performance.now(),lastPlaying=false;
const format=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(Math.floor(s%60)).padStart(2,'0')}`;
const rail=$('#chapter-rail');
CHAPTERS.forEach((ch,i)=>{const b=document.createElement('button');b.className='chapter-button';b.dataset.chapter=i;b.title=`${ch.year} — ${ch.label}, ${format(ch.start)}`;b.innerHTML=`<span>${String(i+1).padStart(2,'0')} / ${ch.year}</span><strong>${ch.label}</strong>`;b.addEventListener('click',()=>{clock.pause();clock.seek(ch.start+1.8);render();$('#status').textContent=`Chapter ${i+1}. ${ch.lead}. Paused.`});rail.append(b)});
$('#sources-list').innerHTML=SOURCES.map(s=>`<li><a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.title} ↗</a><p>${s.author} · ${s.date}<br>${s.detail}</p></li>`).join('');
$('#transcript-content').innerHTML=CHAPTERS.map(c=>`<article><h3>${c.year}<br>${c.label}</h3><div><p><strong>${c.lead}.</strong> ${c.caption}</p><p>${c.note}</p><a href="${SOURCES[c.source].url}" target="_blank" rel="noopener noreferrer">Read the primary source ↗</a></div></article>`).join('');
function render(){const state=clock.getState(),sample=sampleFilm(state.time);scene.render(sample);if(sample.index!==lastIndex){const ch=sample.chapter;$('#chapter-count').textContent=`${String(sample.index+1).padStart(2,'0')} / 07`;$('#year').textContent=ch.year;$('#lead').textContent=ch.lead;$('#chapter-title').textContent=ch.title;$('#caption').textContent=ch.caption;$('#note').textContent=ch.note;$('#insight').textContent=ch.insight;$('#film-canvas').setAttribute('aria-label',`${ch.label}: ${ch.insight} ${ch.caption}`);rail.querySelectorAll('button').forEach((b,i)=>{b.classList.toggle('active',i===sample.index);if(i===sample.index)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current')});const activeButton=rail.children[sample.index];if(rail.scrollWidth>rail.clientWidth)rail.scrollLeft=Math.max(0,activeButton.offsetLeft-rail.offsetLeft-rail.clientWidth/2+activeButton.offsetWidth/2);lastIndex=sample.index;if(state.playing)$('#status').textContent=`Chapter ${sample.index+1}: ${ch.label}. ${ch.year}.`;}
 $('#time').innerHTML=`${format(state.time)} <span>/ 01:30</span>`;$('#scrubber').value=state.time;$('#scrubber').style.setProperty('--progress',`${state.time/DURATION*100}%`);$('#scrubber').setAttribute('aria-valuetext',`${format(state.time)}. ${sample.chapter.label}.`);$('#play-icon').textContent=state.playing?'Ⅱ':sample.finished?'↶':'▶';$('#play-label').textContent=state.playing?'Pause':sample.finished?'Replay':'Play film';$('#play').setAttribute('aria-label',state.playing?'Pause film':sample.finished?'Replay film':'Play film');if(lastPlaying&&!state.playing&&sample.finished)$('#status').textContent='Film complete. AGI remains an open research question. Replay or explore a chapter.';lastPlaying=state.playing;
}
function toggle(){const state=clock.getState();if(!state.playing&&state.rate>0&&state.time>=DURATION)clock.seek(0);if(!state.playing&&state.rate<0&&state.time<=0)clock.seek(DURATION);clock.toggle();render()}
$('#play').addEventListener('click',toggle);$('#restart').addEventListener('click',()=>{clock.pause();clock.seek(0);render();$('#status').textContent='Film restarted and paused.'});
$('#scrubber').addEventListener('input',e=>{clock.pause();clock.seek(Number(e.target.value));render()});
$('#speed').addEventListener('change',e=>{clock.setRate(Number(e.target.value));render()});
$('#film').addEventListener('keydown',e=>{if([' ','ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();if(e.key===' ')toggle();else{clock.pause();clock.seek(e.key==='Home'?0:e.key==='End'?DURATION:clock.getState().time+(e.key==='ArrowRight'?5:-5));render()}}});
$('#sources-open').addEventListener('click',()=>{clock.pause();render();$('#sources-dialog').showModal()});$('#sources-close').addEventListener('click',()=>$('#sources-dialog').close());
$('#sources-dialog').addEventListener('click',e=>{if(e.target===$('#sources-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close()}});
$('#fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('#ai-history').requestFullscreen()}catch{$('#status').textContent='Fullscreen is unavailable in this browser.'}});
if(!document.fullscreenEnabled)$('#fullscreen').hidden=true;
document.addEventListener('visibilitychange',()=>{if(document.hidden){clock.pause();render()}lastTime=performance.now()});
reduced.addEventListener('change',()=>{clock.pause();render()});
function frame(now){const dt=Math.min((now-lastTime)/1000,.1);lastTime=now;if(clock.getState().playing){clock.update(dt);render()}requestAnimationFrame(frame)}
window.__aiHistory={stats:()=>({...clock.getState(),...scene.stats(),chapterId:sampleFilm(clock.getState().time).chapter.id,finished:sampleFilm(clock.getState().time).finished,reducedMotion:reduced.matches}),seek:seconds=>{clock.pause();clock.seek(seconds);render();return window.__aiHistory.stats()},pause:()=>{clock.pause();render()},render};
render();document.fonts.ready.then(render);requestAnimationFrame(frame);
