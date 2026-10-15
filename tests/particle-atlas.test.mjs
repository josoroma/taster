import test from 'node:test';
import assert from 'node:assert/strict';
import {DURATION, STAGES, PARTICLES, getParticle, nucleonContents, sampleJourney} from '../examples/particle-atlas/src/model.mjs';

test('valence charges reproduce the proton, neutron, and neutral helium-4 atom', () => {
  assert.deepEqual(nucleonContents('proton').valenceIDs, ['up','up','down']);
  assert.deepEqual(nucleonContents('neutron').valenceIDs, ['up','down','down']);
  assert.equal(nucleonContents('proton').totalCharge, 1);
  assert.equal(nucleonContents('neutron').totalCharge, 0);
  assert.equal(2*nucleonContents('proton').totalCharge + 2*nucleonContents('neutron').totalCharge + 2*getParticle('electron').charge, 0);
  assert.throws(() => nucleonContents('electron'), RangeError);
});

test('atlas covers the observed Standard Model groups without treating speculative particles as discoveries', () => {
  const identities = family => PARTICLES.filter(particle => particle.family===family).map(particle => particle.id).sort();
  assert.deepEqual(identities('quark'), ['bottom','charm','down','strange','top','up']);
  assert.deepEqual(identities('lepton'), ['electron','electron-neutrino','muon','muon-neutrino','tau','tau-neutrino']);
  assert.deepEqual(identities('boson'), ['gluon','higgs','photon','w','z']);
  assert.equal(PARTICLES.length, 17);
  assert.equal(new Set(PARTICLES.map(particle => particle.id)).size, 17);
  assert.equal(getParticle('graviton'), undefined);
  assert.equal(getParticle('preon'), undefined);
  for (const particle of PARTICLES.filter(p => p.family!=='boson')) assert.equal(particle.spin, 0.5);
  for (const id of ['photon','gluon','w','z']) assert.equal(getParticle(id).spin, 1);
  assert.equal(getParticle('higgs').spin, 0);
  assert.deepEqual(getParticle('w').chargeValues, [-1,1]);
});

test('the journey has continuous coverage and exact boundaries enter the next stage', () => {
  assert.equal(STAGES[0].start, 0);
  assert.equal(STAGES.at(-1).end, DURATION);
  STAGES.forEach((stage,index) => {
    assert.equal(sampleJourney(stage.start).stageIndex, index);
    assert.equal(sampleJourney(stage.start).localProgress, 0);
    assert.ok(stage.end>stage.start);
    if (index) assert.equal(STAGES[index-1].end, stage.start);
    assert.equal(sampleJourney(stage.end-0.0001).stage.id, stage.id);
  });
  assert.equal(sampleJourney(DURATION).stage.id, 'frontier');
  assert.equal(sampleJourney(DURATION).localProgress, 1);
  assert.equal(sampleJourney(DURATION).finished, true);
});

test('seek, reverse, restart, and malformed times produce deterministic bounded states', () => {
  const times = [0,0.5,12.999,13,25.4,26,39,51.99,52,64.99,65,77.9,78];
  const forward = times.map(sampleJourney);
  for (let i=times.length-1;i>=0;i--) assert.deepEqual(sampleJourney(times[i]), forward[i]);
  for (const snapshot of forward) {
    assert.ok(snapshot.localProgress>=0 && snapshot.localProgress<=1);
    assert.ok(snapshot.progress>=0 && snapshot.progress<=1);
    assert.ok(snapshot.time>=snapshot.stage.start && snapshot.time<=snapshot.stage.end);
  }
  assert.equal(sampleJourney(1000).time, DURATION);
  for (const time of [-100,NaN,undefined,Infinity]) assert.equal(sampleJourney(time).time, 0);
  assert.deepEqual(sampleJourney(0), forward[0]);
});

test('inspection cannot corrupt particle identities or subsequent nucleon samples', () => {
  assert.throws(() => { getParticle('up').charge=0; }, TypeError);
  assert.throws(() => { nucleonContents('proton').valenceIDs[0]='down'; }, TypeError);
  assert.throws(() => { getParticle('w').chargeValues[0]=0; }, TypeError);
  assert.equal(nucleonContents('proton').totalCharge, 1);
});
