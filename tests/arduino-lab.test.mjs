import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULTS, PINS, PROJECTS, normalizeConfig, analogToPWM, evaluate, createSketch, sketchFilename } from '../examples/arduino-lab/src/model.mjs';

test('Uno ADC to PWM has the documented endpoints and integer truncation', () => {
  assert.equal(analogToPWM(0), 0); assert.equal(analogToPWM(1023), 255); assert.equal(analogToPWM(512), 127);
  for (let raw = 0; raw <= 1023; raw++) {
    const value = analogToPWM(raw); assert.ok(value >= 0 && value <= 255); assert.ok(Number.isInteger(value));
    if (raw) assert.ok(value >= analogToPWM(raw - 1));
  }
  for (const raw of [-1, 1024, .5, NaN, Infinity]) assert.throws(() => analogToPWM(raw));
});

test('lighthouse changes precisely at its half-cycle and restarts after a full cycle', () => {
  for (const cycleMs of [600, 1600, 3000]) {
    const config = { project: 'lighthouse', cycleMs }, run = elapsedMs => evaluate(config, { elapsedMs, knob: 1023 }).pwm;
    assert.equal(run(0), 255); assert.equal(run(cycleMs / 2 - 1), 255);
    assert.equal(run(cycleMs / 2), 0); assert.equal(run(cycleMs - 1), 0); assert.equal(run(cycleMs), 255);
  }
});

test('pull-up button reads active LOW and the signal follows the held state', () => {
  for (const knob of [0, 512, 1023]) for (const elapsedMs of [0, 800, 900, 5000]) {
    const on = evaluate({ project: 'signal' }, { pressed: true, knob, elapsedMs });
    const off = evaluate({ project: 'signal' }, { pressed: false, knob, elapsedMs });
    assert.equal(on.buttonRead, 'LOW'); assert.equal(on.pwm, analogToPWM(knob));
    assert.equal(off.buttonRead, 'HIGH'); assert.equal(off.pwm, 0);
  }
});

test('firefly triangle meets zero, quarter, peak, and zero using sketch integer arithmetic', () => {
  for (const cycleMs of [600, 1600, 3000]) for (const knob of [0, 512, 1023]) {
    const config = { project: 'firefly', cycleMs }, run = elapsedMs => evaluate(config, { elapsedMs, knob }).pwm, max = analogToPWM(knob);
    assert.equal(run(0), 0); assert.equal(run(cycleMs / 4), Math.floor(max / 2));
    assert.equal(run(cycleMs / 2), max); assert.equal(run(3 * cycleMs / 4), Math.floor(max / 2)); assert.equal(run(cycleMs), 0);
    for (let t = 1; t < cycleMs / 2; t += 19) assert.equal(run(t), run(cycleMs - t));
  }
});

test('all modes are dark at knob zero and model millis matches Uno rollover', () => {
  for (const project of Object.keys(PROJECTS)) for (const elapsedMs of [0, 399, 800, 2 ** 32 + 800]) {
    assert.equal(evaluate({ project }, { knob: 0, pressed: true, elapsedMs }).pwm, 0);
    assert.deepEqual(evaluate({ project }, { elapsedMs: 2 ** 32 + 800 }), evaluate({ project }, { elapsedMs: 800 }));
  }
  assert.throws(() => evaluate({}, { elapsedMs: -1 })); assert.throws(() => evaluate({}, { elapsedMs: NaN }));
});

test('generated sketches share pins, project constants, safe name and integer arithmetic', () => {
  assert.deepEqual(PINS, { led: 9, button: 2, knob: 'A0' });
  for (const project of Object.keys(PROJECTS)) {
    const sketch = createSketch({ project, cycleMs: 2200, name: 'My light\nvoid bad() {}' });
    assert.match(sketch, /const byte LED_PIN = 9;/); assert.match(sketch, /const byte BUTTON_PIN = 2;/); assert.match(sketch, /const byte KNOB_PIN = A0;/);
    assert.match(sketch, /CYCLE_MS = 2200UL/); assert.match(sketch, /pinMode\(BUTTON_PIN, INPUT_PULLUP\)/);
    assert.match(sketch, /digitalRead\(BUTTON_PIN\) == LOW/); assert.match(sketch, /\(knob \* 255UL\) \/ 1023UL/);
    assert.match(sketch, /analogWrite\(LED_PIN, brightness\)/); assert.doesNotMatch(sketch, /\nvoid bad/);
    if (project === 'signal') assert.match(sketch, /brightness = buttonPressed \? maximum : 0/);
    if (project === 'lighthouse') assert.match(sketch, /brightness = phase < halfCycle \? maximum : 0/);
    if (project === 'firefly') assert.match(sketch, /\(\(CYCLE_MS - phase\) \* maximum\) \/ halfCycle/);
  }
  assert.equal(sketchFilename({ name: 'Moon light! / ☆' }), 'moon_light.ino'); assert.equal(sketchFilename({ name: '☆' }), 'my_invention.ino');
});

test('invalid configurations cannot produce a misleading model or sketch', () => {
  assert.equal(normalizeConfig().cycleMs, DEFAULTS.cycleMs);
  for (const config of [{ project: 'unknown' }, { cycleMs: 601 }, { cycleMs: 0 }, { cycleMs: 5000 }, { cycleMs: NaN }]) {
    assert.throws(() => evaluate(config)); assert.throws(() => createSketch(config));
  }
});
