import test from 'node:test';
import assert from 'node:assert/strict';
import {CHAPTERS, DURATION, WAVE, sampleLesson, displacement, resultantAmplitude, checkAnswer} from '../examples/paper-lab/src/model.mjs';
const close = (actual, expected, tolerance = 1e-12) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} differs from ${expected}`);

test('linear superposition doubles in-phase waves and cancels opposite waves', () => {
  for (const time of [0, .7, 2, 5.37, 12]) {
    for (let x = 0; x <= 8; x += .11) {
      const a = displacement(x, time), same = displacement(x, time, 0), opposite = displacement(x, time, 180);
      close(a + same, 2 * a); close(a + opposite, 0);
    }
  }
  close(resultantAmplitude(0), 2); close(resultantAmplitude(180), 0); close(resultantAmplitude(90), Math.SQRT2);
});

test('sampled curves are the exact signed sum and obey the phase envelope', () => {
  for (const phase of [0, 12, 45, 90, 135, 180]) {
    const sample = sampleLesson(37.125, phase);
    assert.equal(sample.points.length, 201);
    close(sample.points[0].x, 0); close(sample.points.at(-1).x, WAVE.length);
    for (const point of sample.points) {
      close(point.sum, point.a + point.b);
      close(point.a, displacement(point.x, sample.physicalTime));
      close(point.b, displacement(point.x, sample.physicalTime, phase));
      assert.ok(Math.abs(point.sum) <= sample.amplitude + 1e-12);
    }
  }
});

test('wavelength, frequency and time scale agree with the declared physical units', () => {
  for (const t of [0, 1.23, 6.28]) for (const x of [0, .41, 2.71]) {
    close(displacement(x, t), displacement(x + WAVE.wavelength, t));
    close(displacement(x, t), displacement(x, t + 1 / WAVE.frequency));
  }
  close(sampleLesson(24).physicalTime, 6);
  close(displacement(WAVE.wavelength / 4, 0), WAVE.amplitude);
});

test('every cut has one chapter and the authored phase reaches cancellation at the end', () => {
  CHAPTERS.forEach((chapter, index) => assert.equal(sampleLesson(chapter.start).chapterIndex, index));
  assert.equal(sampleLesson(15.999).chapterIndex, 0); assert.equal(sampleLesson(31.999).chapterIndex, 1);
  assert.equal(sampleLesson(DURATION).chapterIndex, 2); assert.equal(sampleLesson(DURATION).finished, true);
  close(sampleLesson(32).phase, 0); close(sampleLesson(40).phase, 90); close(sampleLesson(48).phase, 180);
});

test('seeking in any order reproduces all state without accumulated animation', () => {
  const times = [0, 2.713, 15.99, 16, 21, 31.99, 32, 39.3, 48];
  const expected = times.map(time => sampleLesson(time));
  for (let i = times.length - 1; i >= 0; i--) assert.deepEqual(sampleLesson(times[i]), expected[i]);
  sampleLesson(42, 180); assert.deepEqual(sampleLesson(0), expected[0]);
});

test('untrusted seeks and phase overrides remain finite and bounded', () => {
  for (const time of [-100, 1e8, NaN, Infinity, -Infinity]) {
    const sample = sampleLesson(time, 180); assert.ok(sample.time >= 0 && sample.time <= DURATION);
    assert.ok(sample.points.every(p => Object.values(p).every(Number.isFinite)));
  }
  close(sampleLesson(40, -90).phase, 0); close(sampleLesson(40, 500).phase, 180); close(sampleLesson(40, NaN).phase, 0);
  assert.equal(sampleLesson(0, 180).phase, 0);
});

test('knowledge check validates a choice, teaches mistakes and accepts cancellation', () => {
  for (const invalid of [null, undefined, NaN, -1, 3, .5, '1']) assert.equal(checkAnswer(invalid).valid, false);
  assert.equal(checkAnswer(0).correct, false); assert.equal(checkAnswer(2).correct, false);
  assert.match(checkAnswer(0).message, /negative/);
  assert.equal(checkAnswer(1).correct, true); assert.match(checkAnswer(1).message, /every position/);
});
