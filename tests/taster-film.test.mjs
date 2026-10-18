import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {FILM,CHAPTERS,filmState,frameAtTime,timeAtFrame,helixPoints,packetPoint} from '../examples/taster-film/src/model.mjs';

test('film has one active chapter at every frame, including exact cuts and the end',()=>{
  for(let frame=0;frame<FILM.frames;frame++){
    const state=filmState(timeAtFrame(frame));
    assert.equal(state.frame,frame);
    assert.equal(state.scenes.reduce((sum,s)=>sum+s.alpha,0),1);
    assert.ok(state.time>=state.chapter.start&&state.time<state.chapter.end);
  }
  for(const chapter of CHAPTERS)assert.equal(filmState(chapter.start).chapter.title,chapter.title);
  assert.equal(filmState(FILM.duration).chapterIndex,3);
  assert.equal(filmState(FILM.duration).frame,FILM.frames-1);
});

test('seeking backward reproduces full state without accumulated animation history',()=>{
  const times=[0,1.23,5.9666666667,6,12.9666666667,13,20.9666666667,21,27.9666666667,28];
  const expected=times.map(t=>({film:filmState(t),helix:helixPoints(t),packet:packetPoint(t)}));
  for(let i=times.length-1;i>=0;i--)assert.deepEqual({film:filmState(times[i]),helix:helixPoints(times[i]),packet:packetPoint(times[i])},expected[i]);
});

test('invalid and out-of-range seeks stay finite and within the finite export window',()=>{
  for(const value of [NaN,Infinity,-Infinity,-90,800]){
    const state=filmState(value);
    assert.ok(state.time>=0&&state.time<=FILM.duration);
    assert.ok(state.frame>=0&&state.frame<FILM.frames);
    assert.ok(state.scenes.every(s=>Number.isFinite(s.local)&&Number.isFinite(s.enter)));
  }
  assert.equal(timeAtFrame(-1),0);
  assert.equal(timeAtFrame(840),839/30);
  assert.equal(frameAtTime(28),839);
});

test('molecular motif keeps its topology and animation is time-derived',()=>{
  for(const t of [0,4,12,28]){
    const points=helixPoints(t);
    assert.equal(points.length,19);
    for(let i=1;i<points.length;i++)assert.equal(points[i].y-points[i-1].y,12);
    for(const p of points)assert.ok(Math.abs((p.x/59)**2+p.z**2-1)<1e-12);
  }
  assert.deepEqual(packetPoint(2),packetPoint(5));
});

test('HyperFrames metadata and authored scene windows agree with the tested film clock',async()=>{
  const html=await readFile(new URL('../examples/taster-film/composition/index.html',import.meta.url),'utf8');
  const root=html.match(/<div id="film"[^>]+>/)?.[0];
  for(const [key,value] of Object.entries({width:FILM.width,height:FILM.height,duration:FILM.duration,fps:FILM.fps}))assert.match(root,new RegExp(`data-${key}="${value}"`));
  const sections=[...html.matchAll(/<section[^>]+data-start="([\d.]+)" data-duration="([\d.]+)"[^>]*>/g)];
  assert.equal(sections.length,CHAPTERS.length);
  sections.forEach((match,index)=>{assert.equal(Number(match[1]),CHAPTERS[index].start);assert.equal(Number(match[1])+Number(match[2]),CHAPTERS[index].end);});
  assert.equal(FILM.frames,FILM.duration*FILM.fps);
});
