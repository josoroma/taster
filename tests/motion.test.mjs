import test from 'node:test';
import assert from 'node:assert/strict';
import {createTransport,assemblyPose,segmentProgress,damp,slerp} from '../kit/motion.mjs';

test('transport pauses, seeks deterministically, reverses and stops at endpoints',()=>{
  const clock=createTransport({duration:10});clock.play();clock.update(3);clock.pause();clock.update(5);assert.equal(clock.getState().time,3);
  clock.seek(8);clock.setRate(-2);clock.play();clock.update(2);assert.equal(clock.getState().time,4);
  clock.update(10);assert.deepEqual([clock.getState().time,clock.getState().playing],[0,false]);
  clock.seek(100);assert.equal(clock.getState().time,10);clock.step(-.25);assert.equal(clock.getState().time,9.75);
});
test('transport loop wraps negative playback and exposes stable chapter sampling',()=>{
  const clock=createTransport({duration:4,time:1,rate:-1,loop:true});clock.play();clock.update(2);assert.equal(clock.getState().time,3);
  assert.equal(segmentProgress(1,2,4),0);assert.equal(segmentProgress(3,2,4),.5);assert.equal(segmentProgress(6,2,4),1);
});
test('explosion and reassembly are absolute, reversible, and cannot accumulate drift',()=>{
  const rest={position:[3,2,1],quaternion:[0,0,0,1],scale:[1,2,3]};
  const offset={translation:[-2,7,.2],rotation:[0,1,0,0],scale:[2,1,.5]};
  const middle=assemblyPose(rest,offset,.5);
  for(let cycle=0;cycle<1000;cycle++){
    assemblyPose(rest,offset,1);assemblyPose(rest,offset,.87);assemblyPose(rest,offset,0);
  }
  assert.deepEqual(assemblyPose(rest,offset,.5),middle);
  assert.deepEqual(assemblyPose(rest,offset,0),rest);
  assert.deepEqual(assemblyPose(rest,offset,1).position,[1,9,1.2]);
  assert.ok(Math.abs(Math.hypot(...middle.quaternion)-1)<1e-12);
});
test('staggered parts remain assembled before their interval and finish exactly',()=>{
  const rest={position:[0,0,0]};const offset={translation:[0,5,0],delay:.25,span:.5};
  assert.equal(assemblyPose(rest,offset,.1).position[1],0);assert.equal(assemblyPose(rest,offset,.5).position[1],2.5);assert.equal(assemblyPose(rest,offset,1).position[1],5);
});
test('exponential following is time-partition invariant; quaternion follows shortest path',()=>{
  const once=damp(0,10,4,1);let many=0;for(let i=0;i<60;i++)many=damp(many,10,4,1/60);
  assert.ok(Math.abs(once-many)<1e-12);assert.deepEqual(slerp([0,0,0,1],[0,0,0,-1],.5),[0,0,0,1]);
});
