import { FILM, CHAPTERS, filmState } from './src/model.mjs';
const iframe=document.querySelector('#composition'),screen=document.querySelector('#screen');
const play=document.querySelector('#play'),seek=document.querySelector('#seek'),time=document.querySelector('#time'),status=document.querySelector('#status');
let current=0,playing=false,last=null,raf=null,ready=false;
const format=t=>`00:${String(Math.floor(t)).padStart(2,'0')}`;
function setTime(value){
  current=Math.max(0,Math.min(FILM.duration,value));
  iframe.contentWindow.tasterFilm?.renderAt(current);
  seek.value=current;seek.setAttribute('aria-valuetext',`${current.toFixed(1)} seconds of 28`);
  time.value=`${format(current)} / 00:28`;
  const state=filmState(current);
  document.querySelector('#chapter-caption').textContent=state.chapter.caption;
  document.querySelectorAll('.chapters button').forEach((button,index)=>{if(index===state.chapterIndex)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});
}
function setPlaying(value){
  playing=value&&ready;last=null;
  play.innerHTML=playing?'Pause <span>Ⅱ</span>':'Play <span>▶</span>';play.setAttribute('aria-label',playing?'Pause film':'Play film');
  status.textContent=playing?'Film playing.':current===FILM.duration?'Film complete. Replay or choose a chapter.':'Film paused.';
  if(raf!==null){cancelAnimationFrame(raf);raf=null;}
  if(playing)raf=requestAnimationFrame(tick);
}
function tick(now){
  if(!playing)return;
  if(last!==null)setTime(current+Math.min((now-last)/1000,.1));
  last=now;
  if(current>=FILM.duration){setPlaying(false);return;}
  raf=requestAnimationFrame(tick);
}
function toggle(){if(current>=FILM.duration)setTime(0);setPlaying(!playing);}
play.addEventListener('click',toggle);
document.querySelector('#restart').addEventListener('click',()=>{setPlaying(false);setTime(0);});
seek.addEventListener('input',()=>{setPlaying(false);setTime(Number(seek.value));});
document.querySelectorAll('.chapters button').forEach(button=>button.addEventListener('click',()=>{setPlaying(false);setTime(Number(button.dataset.time)+1.1);status.textContent=CHAPTERS[filmState(current).chapterIndex].title;}));
document.addEventListener('keydown',event=>{
  if(event.altKey||event.ctrlKey||event.metaKey||event.target.matches('input,button,a'))return;
  if(event.code==='Space'){event.preventDefault();toggle();}
  if(event.code==='ArrowLeft'||event.code==='ArrowRight'){event.preventDefault();setPlaying(false);setTime(current+(event.code==='ArrowRight'?1:-1)*(event.shiftKey?1:1/FILM.fps));}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)setPlaying(false);});
new ResizeObserver(()=>{iframe.style.transform=`scale(${screen.clientWidth/FILM.width})`;}).observe(screen);
async function initialize(){
  if(!iframe.contentWindow.tasterFilm)return;
  await iframe.contentWindow.tasterFilm.ready;ready=true;setTime(0);
}
iframe.addEventListener('load',initialize);initialize();
// No autoplay, including when reduced motion is requested. Explicit play,
// chapter selection and single-frame inspection remain available to everyone.
window.tasterPlayer={seek:setTime,pause:()=>setPlaying(false),getState:()=>({time:current,playing,ready})};
