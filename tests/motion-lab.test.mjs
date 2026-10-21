import test from 'node:test';
import assert from 'node:assert/strict';
import { EFFECTS, resolveEffect, sampleEffect, pathPoint, makePrompt, validateSettings } from '../examples/motion-lab/src/model.mjs';

const near = (actual, expected, epsilon = 1e-9) => assert.ok(Math.abs(actual - expected) < epsilon, `${actual} != ${expected}`);

test('source identity distinguishes global numbers from pack-local numbers', () => {
  assert.equal(resolveEffect('#001').name, 'Pop-in');
  assert.equal(resolveEffect('motion2/01').id, '121');
  assert.equal(resolveEffect('motion/stagger').id, '002');
  assert.equal(resolveEffect('Motion path').id, '126');
  assert.throws(() => resolveEffect('01'), /Unknown or ambiguous/);
  assert.throws(() => resolveEffect('orbit'), /Unknown or ambiguous/);
});

test('invalid settings cannot leak nonfinite values into SVG geometry', () => {
  for (const duration of [0, -1, 6.1, NaN, Infinity, '2']) assert.throws(() => validateSettings({ duration }));
  for (const intensity of [0, 2, NaN, -Infinity]) assert.throws(() => sampleEffect('002', 0.5, { intensity }));
  for (const time of [NaN, Infinity, undefined]) assert.throws(() => sampleEffect('001', time));
});

test('every effect is independent of seek order and clamps external time', () => {
  for (const effect of EFFECTS) {
    const expected = sampleEffect(effect.id, 0.91);
    for (const time of [2.4, 0, 1.8, 0.2, 2.1]) sampleEffect(effect.id, time);
    assert.deepEqual(sampleEffect(effect.id, 0.91), expected);
    assert.deepEqual(sampleEffect(effect.id, -3), sampleEffect(effect.id, 0));
    assert.deepEqual(sampleEffect(effect.id, 999), sampleEffect(effect.id, 2.4));
    for (const intensity of [0.25, 1, 1.75]) {
      for (let index = 0; index <= 100; index++) {
        const sample = sampleEffect(effect.id, index * 0.024, { intensity });
        const values = Object.values(sample).flat().filter(value => typeof value === 'number');
        assert.ok(values.every(Number.isFinite), `${effect.name} remains finite`);
      }
    }
  }
});

test('duration rescales the same pose, including delayed members', () => {
  for (const effect of EFFECTS) {
    const short = sampleEffect(effect.id, 0.6, { duration: 1.2 });
    const long = sampleEffect(effect.id, 2.5, { duration: 5 });
    for (const key of ['time', 'duration']) { delete short[key]; delete long[key]; }
    assert.deepEqual(short, long);
  }
});

test('entrances begin hidden, stagger in order, and reach exact rest poses', () => {
  near(sampleEffect('001', 0).scale, 0);
  near(sampleEffect('001', 2.4).scale, 1);
  near(sampleEffect('001', 2.4).angle, 0);
  const early = sampleEffect('002', 0.12).bars;
  assert.ok(early[0] > 0);
  assert.ok(early.slice(1).every(value => Math.abs(value) < 1e-10));
  const cascade = sampleEffect('002', 0.6).bars;
  assert.ok(cascade[0] > cascade[1] && cascade[1] > cascade[2]);
  for (const value of sampleEffect('002', 2.4).bars) near(value, 1);
  for (const intensity of [.25, 1.75]) {
    const start = sampleEffect('005', 0, { intensity });
    assert.ok(start.topY >= 132 && start.bottomY <= -70, 'title starts outside clipping windows');
    near(sampleEffect('005', 2.4, { intensity }).topY, 0);
    near(sampleEffect('005', 2.4, { intensity }).bottomY, 0);
  }
});

test('overshoot passes the destination, intensity increases the peak, then settles', () => {
  const peak = intensity => Math.max(...Array.from({ length: 101 }, (_, index) => sampleEffect('010', 2.4 * index / 100, { intensity }).value));
  assert.ok(peak(0.25) > 1);
  assert.ok(peak(1.75) > peak(0.25));
  assert.ok(100 + 280 * peak(1.75) + 32 < 600, 'strongest marker remains inside reference stage');
  near(sampleEffect('010', 0).value, 0);
  near(sampleEffect('010', 2.4).value, 1);
});

test('anticipation moves backward before the forward launch and returns to rest shape', () => {
  const start = sampleEffect('121', 0), wind = sampleEffect('121', 0.5), launch = sampleEffect('121', 1.2), end = sampleEffect('121', 2.4);
  assert.ok(wind.x < start.x && launch.x > start.x);
  assert.equal(wind.phase, 'Wind up'); assert.equal(launch.phase, 'Launch'); assert.equal(end.phase, 'Settle');
  near(end.x, 475); near(end.scaleX, 1); near(end.scaleY, 1);
});

test('path endpoints stay anchored and heading follows the analytic tangent', () => {
  for (const intensity of [.25, 1.75]) {
    near(pathPoint(0, intensity).x, 90); near(pathPoint(1, intensity).x, 510);
    near(pathPoint(0, intensity).y, 170); near(pathPoint(1, intensity).y, 170);
    for (const progress of [.1, .3, .5, .8]) {
      const a = pathPoint(progress - 1e-5, intensity), b = pathPoint(progress + 1e-5, intensity);
      const numerical = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
      near(pathPoint(progress, intensity).angle, numerical, 1e-6);
    }
  }
});

test('prompt carries source identity, authored parameters, timing, and access constraints', () => {
  const prompt = makePrompt('motion/stagger', { duration: 4, intensity: 1.5 });
  assert.match(prompt, /Motion Prompt #002; pack motion, local no. 02, slug stagger/);
  assert.match(prompt, /4\.0 seconds/); assert.match(prompt, /0\.26 s/); assert.match(prompt, /s=2\.55/);
  assert.match(prompt, /absolute time/); assert.match(prompt, /reduced motion/);
  assert.match(prompt, /original local interpretation/);
  assert.match(prompt, /https:\/\/showheyohtaki.github.io\/motion-prompt\/api\/v1\/en\/e\/002.txt/);
});
