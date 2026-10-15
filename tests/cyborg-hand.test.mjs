import test from 'node:test';
import assert from 'node:assert/strict';
import {DURATION,FINGERS,THUMB,STAGES,PARTS,sampleGrip,sampleSequence} from '../examples/cyborg-hand/src/model.mjs';

test('hand opens exactly and closes within the authored joint limits', () => {
  const open=sampleGrip(0), closed=sampleGrip(1);
  for (let i=0; i<FINGERS.length; i++) {
    assert.deepEqual(open.fingers[i].angles,[0,0,0]);
    assert.deepEqual(closed.fingers[i].angles,FINGERS[i].maxAngles);
    assert.equal(closed.fingers[i].splay,0);
  }
  assert.equal(open.thumb.opposition,0);
  assert.equal(open.thumb.spread,THUMB.openSpread);
  assert.equal(closed.thumb.base,THUMB.maxBase);
  assert.equal(closed.thumb.tip,THUMB.maxTip);
  assert.ok(Math.abs(closed.thumb.spread-THUMB.closedSpread)<1e-14);
  for(let step=0; step<=100; step++) {
    const pose=sampleGrip(step/100);
    pose.fingers.forEach((finger,i) => finger.angles.forEach((angle,j) => assert.ok(angle>=0 && angle<=FINGERS[i].maxAngles[j])));
    assert.ok(pose.thumb.opposition>=0 && pose.thumb.opposition<=THUMB.maxOpposition);
  }
});

test('serial finger links preserve length and curl toward the palm at the closed endpoint', () => {
  const pose=sampleGrip(1);
  FINGERS.forEach((finger,i) => {
    let totalAngle=0, y=finger.baseY, z=0;
    finger.lengths.forEach((length,j) => {
      totalAngle+=pose.fingers[i].angles[j];
      const dy=length*Math.cos(totalAngle), dz=-length*Math.sin(totalAngle);
      assert.ok(Math.abs(Math.hypot(dy,dz)-length)<1e-12);
      y+=dy; z+=dz;
    });
    // In this conceptual hierarchy the tip lies below its knuckle and in front
    // of the palmar surface (z=-.31), rather than inside the palm block.
    assert.ok(y<finger.baseY);
    assert.ok(z<-.5);
  });
});

test('thumb opposition is delayed until fingers begin folding', () => {
  assert.ok(sampleGrip(.25).fingers[0].angles[0]>0);
  assert.equal(sampleGrip(.25).thumb.opposition,0);
  assert.ok(sampleGrip(.5).thumb.opposition>0);
  let prior=sampleGrip(0);
  for(let i=1;i<=100;i++) {
    const next=sampleGrip(i/100);
    assert.ok(next.thumb.opposition>=prior.thumb.opposition);
    assert.ok(next.thumb.spread<=prior.thumb.spread);
    next.fingers.forEach((finger,j) => finger.angles.forEach((angle,k) => assert.ok(angle>=prior.fingers[j].angles[k])));
    prior=next;
  }
  // Compose the scene's hierarchy: local flexion, spread about Z, opposition
  // about Y. The closed thumb should cross the palm-facing finger region,
  // rather than folding outward beyond its own base.
  const t=sampleGrip(1).thumb;
  const localY=THUMB.lengths[0]*Math.cos(t.base)+THUMB.lengths[1]*Math.cos(t.base+t.tip);
  const localZ=-THUMB.lengths[0]*Math.sin(t.base)-THUMB.lengths[1]*Math.sin(t.base+t.tip);
  const spreadX=-localY*Math.sin(t.spread);
  const x=THUMB.origin[0]+spreadX*Math.cos(t.opposition)+localZ*Math.sin(t.opposition);
  const y=THUMB.origin[1]+localY*Math.cos(t.spread);
  const z=THUMB.origin[2]-spreadX*Math.sin(t.opposition)+localZ*Math.cos(t.opposition);
  assert.ok(x>-.75 && x<.5, 'closed thumb sweeps inward across the fingers');
  assert.ok(y>0 && y<1, 'closed thumb stays below the knuckle line');
  assert.ok(z<-.5, 'closed thumb stays in front of the palm');
});

test('the sequence separates only an open hand and covers every timestamp continuously', () => {
  assert.equal(STAGES[0].start,0);
  assert.equal(STAGES.at(-1).end,DURATION);
  STAGES.forEach((stage,index) => {
    assert.equal(sampleSequence(stage.start).stage.id,stage.id);
    assert.equal(sampleSequence(stage.start).localProgress,0);
    if(index) {
      assert.equal(STAGES[index-1].end,stage.start);
      const before=sampleSequence(stage.start-1e-5), now=sampleSequence(stage.start);
      assert.ok(Math.abs(before.grip-now.grip)<1e-8);
      assert.ok(Math.abs(before.separation-now.separation)<1e-8);
    }
  });
  for(let i=0;i<=320;i++) {
    const state=sampleSequence(i/10);
    assert.ok(state.grip>=0 && state.grip<=1);
    assert.ok(state.separation>=0 && state.separation<=1);
    if(state.separation>0) assert.equal(state.grip,0);
  }
  assert.equal(sampleSequence(10).grip,1);
  assert.equal(sampleSequence(25).separation,1);
  assert.equal(sampleSequence(DURATION).separation,0);
  assert.equal(sampleSequence(DURATION).grip,0);
  assert.equal(sampleSequence(DURATION).finished,true);
});

test('scrubbing, reverse, repeated round trips, and malformed inputs cannot accumulate motion', () => {
  const times=[0,6.2,11,15.3,19,22.6,25,28.2,32];
  const poses=times.map(sampleSequence);
  for(let cycle=0;cycle<20;cycle++) {
    for(let i=times.length-1;i>=0;i--) assert.deepEqual(sampleSequence(times[i]),poses[i]);
    for(let i=0;i<times.length;i++) assert.deepEqual(sampleSequence(times[i]),poses[i]);
  }
  for(const bad of [NaN,Infinity,-Infinity,undefined,-8]) {
    assert.deepEqual(sampleGrip(bad),sampleGrip(0));
    assert.deepEqual(sampleSequence(bad),sampleSequence(0));
  }
  assert.deepEqual(sampleGrip(2),sampleGrip(1));
  assert.deepEqual(sampleSequence(100),sampleSequence(DURATION));
  const sample=sampleGrip(.8);
  sample.fingers[0].angles[0]=999;
  assert.ok(sampleGrip(.8).fingers[0].angles[0]<2);
  assert.throws(()=>{FINGERS[0].lengths[0]=999;},TypeError);
  assert.equal(new Set(PARTS.map(part=>part.id)).size,5);
});
