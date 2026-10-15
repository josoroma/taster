import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createGame, startGame, stepGame, interact, dash, togglePause, restartGame, getObjective, GAME_CONFIG,
} from '../examples/lumen/src/model.mjs';

const playing = () => {
  const state = createGame();
  startGame(state);
  return state;
};
const close = (a, b, tolerance = 1e-8) => assert.ok(Math.abs(a - b) < tolerance, `${a} ≠ ${b}`);
const atBeacon = (state, index, phase = 0.5, cycle = 1) => {
  const beacon = state.beacons[index];
  Object.assign(state.player, { x: beacon.x + GAME_CONFIG.beaconRadius + 0.001, z: beacon.z });
  state.time = (cycle + phase - beacon.phaseOffset) * GAME_CONFIG.tunePeriod;
  state.tune.cooldown = 0;
};
const advance = (state, seconds) => {
  while (seconds > 1e-9) {
    const dt = Math.min(seconds, 0.5);
    stepGame(state, {}, dt);
    seconds -= dt;
  }
};
const walkTo = (state, target) => {
  stepGame(state, { target }, 1 / 60);
  for (let ticks = 0; ticks < 600 && state.player.target; ticks++) stepGame(state, {}, 1 / 60);
  assert.equal(state.player.target, null, 'click destination should be reachable');
  assert.equal(state.mode, 'playing');
};

test('ready state does not advance, and starting is an explicit transition', () => {
  const state = createGame();
  assert.equal(state.mode, 'ready');
  stepGame(state, { x: 1 }, 1);
  assert.equal(state.time, 0);
  assert.equal(state.player.x, 0);
  assert.deepEqual(startGame(state), [{ type: 'start' }]);
  assert.deepEqual(startGame(state), []);
  assert.equal(state.mode, 'playing');
});

test('movement is frame-rate independent with no diagonal speed advantage', () => {
  const slow = playing();
  const fast = playing();
  for (let i = 0; i < 10; i++) stepGame(slow, { x: -1, z: 1 }, 0.1);
  for (let i = 0; i < 60; i++) stepGame(fast, { x: -1, z: 1 }, 1 / 60);
  close(slow.player.x, fast.player.x);
  close(slow.player.z, fast.player.z);
  close(Math.hypot(slow.player.x, slow.player.z - 4), GAME_CONFIG.walkSpeed);
  close(slow.time, 1);
});

test('bounds contain movement and click targets; targets persist and stop precisely', () => {
  const state = playing();
  stepGame(state, { target: { x: -1.2, z: 4 } }, 0.1);
  stepGame(state, {}, 0.5);
  close(state.player.x, -1.2);
  assert.equal(state.player.target, null);
  stepGame(state, { target: { x: -100, z: 100 } }, 0.1);
  assert.deepEqual(state.player.target, { x: -9, z: 7 });
  for (let i = 0; i < 5; i++) stepGame(state, { x: -1, z: 1 }, 1);
  assert.equal(state.player.x, -9);
  assert.equal(state.player.z, 7);
  assert.equal(state.player.target, null);
});

test('resonance needs three distinct cycles; misses and repeated presses cannot grant charges', () => {
  const state = playing();
  state.time = GAME_CONFIG.tunePeriod * 0.5;
  assert.deepEqual(interact(state), []);
  assert.ok(state.beacons.every(beacon => !beacon.lit));
  atBeacon(state, 0, 0.1);
  assert.deepEqual(interact(state), [{ type: 'miss', index: 0 }]);
  assert.equal(state.player.hp, 3);
  assert.equal(state.beacons[0].lit, false);
  assert.equal(state.tune.cooldown, GAME_CONFIG.tuneCooldown);
  assert.deepEqual(interact(state), []);
  advance(state, 0.8);
  assert.deepEqual(interact(state), [{ type: 'charge', index: 0, name: 'Moss', charge: 1 }]);
  assert.equal(state.beacons[0].lit, false);
  assert.equal(state.tune.waiting, true);
  advance(state, GAME_CONFIG.tuneCooldown);
  close(state.tune.cooldown, 0);
  assert.ok(state.tune.phase < state.tune.windowEnd);
  assert.deepEqual(interact(state), []);
  assert.equal(state.beacons[0].charge, 1);
  atBeacon(state, 0, 0.5, 2);
  assert.equal(interact(state)[0].type, 'charge');
  assert.equal(state.beacons[0].charge, 2);
  assert.equal(state.beacons[0].lit, false);
  atBeacon(state, 0, 0.5, 3);
  assert.equal(interact(state)[0].type, 'tuned');
  assert.equal(state.beacons[0].charge, 3);
  assert.equal(state.beacons[0].lit, true);
  assert.equal(state.tune.nearIndex, -1);
});

test('each shrine exposes the same offset phase used to judge its own timing', () => {
  const state = playing();
  for (let index = 0; index < state.beacons.length; index++) {
    atBeacon(state, index, 0.25);
    assert.equal(interact(state)[0].type, 'miss');
    close(state.tune.phase, 0.25);
    atBeacon(state, index, 0.5);
    assert.equal(interact(state)[0].type, 'charge');
    close(state.tune.phase, 0.5);
    assert.equal(state.tune.cycle, 1);
    assert.equal(state.beacons[index].lastCycle, 1);
  }
});

test('shrine bases block walking and dashing while shrine click targets remain reachable', () => {
  const state = playing();
  const shrine = state.beacons[2];
  stepGame(state, { target: { x: shrine.x + 0.2, z: shrine.z } }, 0.1);
  assert.ok(state.player.target.x < shrine.x);
  advance(state, 2);
  close(state.player.x, shrine.x - GAME_CONFIG.beaconRadius - 0.001);
  assert.equal(state.player.target, null);
  assert.equal(state.tune.nearIndex, 2);
  stepGame(state, { x: 1 }, 0.5);
  assert.ok(state.player.x <= shrine.x - GAME_CONFIG.beaconRadius);
  dash(state);
  stepGame(state, {}, 0.3);
  assert.ok(state.player.x <= shrine.x - GAME_CONFIG.beaconRadius);
  assert.ok(Math.hypot(state.player.x - shrine.x, state.player.z - shrine.z) >= GAME_CONFIG.beaconRadius);
});

test('a real click-to-move route restores all three shrines and opens the gated exit', () => {
  const state = playing();
  walkTo(state, state.exit);
  assert.equal(interact(state)[0].type, 'exit-locked');
  assert.equal(state.mode, 'playing');
  for (const index of [2, 1, 0]) {
    const beacon = state.beacons[index];
    walkTo(state, beacon);
    assert.equal(state.exit.ready, false);
    const pulses = [];
    for (let ticks = 0; ticks < 800 && !beacon.lit; ticks++) {
      stepGame(state, {}, 1 / 60);
      if (state.tune.phase >= 0.4 && state.tune.phase <= 0.6 && !state.tune.waiting) {
        pulses.push(...interact(state).map(event => event.type));
      }
    }
    assert.equal(beacon.lit, true);
    assert.deepEqual(pulses, ['charge', 'charge', 'tuned']);
  }
  assert.equal(state.exit.ready, true);
  assert.match(getObjective(state), /gate/);
  walkTo(state, state.exit);
  assert.equal(state.mode, 'playing');
  assert.equal(state.player.hp, GAME_CONFIG.maxHealth);
  assert.deepEqual(interact(state), [{ type: 'won', time: state.time }]);
  assert.equal(state.mode, 'won');
  const completion = state.completedTime;
  stepGame(state, { x: 1 }, 1);
  assert.equal(state.time, completion);
});

test('hazard damage gives invulnerability and three separate hits end the run', () => {
  const state = playing();
  const collide = () => {
    Object.assign(state.player, { x: state.hazards[0].x, z: state.hazards[0].z });
    return stepGame(state, {}, 1 / 60);
  };
  assert.equal(collide()[0].type, 'hurt');
  assert.equal(state.player.hp, 2);
  assert.deepEqual(collide(), []);
  assert.equal(state.player.hp, 2);
  // Wait safely until the protection expires, then re-enter the drone route.
  Object.assign(state.player, { x: -8, z: 6 });
  stepGame(state, {}, 1);
  stepGame(state, {}, 0.5);
  assert.equal(collide()[0].type, 'hurt');
  assert.equal(state.player.hp, 1);
  Object.assign(state.player, { x: -8, z: 6 });
  stepGame(state, {}, 1);
  stepGame(state, {}, 0.5);
  assert.deepEqual(collide().map(event => event.type), ['hurt', 'lost']);
  assert.equal(state.player.hp, 0);
  assert.equal(state.mode, 'lost');
});

test('dash protects, travels precisely, and cannot bypass its cooldown', () => {
  const state = playing();
  state.player.heading = -Math.PI / 2;
  assert.deepEqual(dash(state), [{ type: 'dash' }]);
  assert.deepEqual(dash(state), []);
  assert.ok(state.player.invulnerable > 0);
  stepGame(state, {}, 0.3);
  close(state.player.x, -GAME_CONFIG.dashSpeed * GAME_CONFIG.dashDuration);
  close(state.player.z, 4);
  close(state.player.dashRemaining, 0);
  assert.deepEqual(dash(state), []);
  stepGame(state, {}, 0.6);
  assert.equal(dash(state)[0].type, 'dash');

  const danger = playing();
  Object.assign(danger.player, { x: danger.hazards[0].x, z: danger.hazards[0].z });
  dash(danger);
  assert.deepEqual(stepGame(danger, {}, 1 / 60), []);
  assert.equal(danger.player.hp, 3);
});

test('pause freezes timers and actions; restart resets the same outer state', () => {
  const state = playing();
  const sameState = state;
  dash(state);
  stepGame(state, { x: 1 }, 0.1);
  assert.equal(togglePause(state)[0].type, 'pause');
  const snapshot = structuredClone(state);
  assert.deepEqual(stepGame(state, { x: 1 }, 1), []);
  assert.deepEqual(dash(state), []);
  assert.deepEqual(interact(state), []);
  assert.deepEqual(state, snapshot);
  assert.equal(togglePause(state)[0].type, 'resume');
  state.beacons[0].lit = true;
  state.player.hp = 1;
  assert.equal(restartGame(state)[0].type, 'restart');
  assert.equal(state, sameState);
  assert.equal(state.mode, 'playing');
  assert.equal(state.time, 0);
  assert.equal(state.player.hp, 3);
  assert.equal(state.player.dashCooldown, 0);
  assert.ok(state.beacons.every(beacon => !beacon.lit));
  assert.ok(state.beacons.every(beacon => beacon.charge === 0 && beacon.lastCycle === -1));
});

test('identical inputs reproduce hazards and player state; spawn stays safe', () => {
  const a = playing();
  const b = playing();
  for (let i = 0; i < 600; i++) {
    stepGame(a, {}, 1 / 60);
    stepGame(b, {}, 1 / 60);
  }
  assert.deepEqual(a, b);
  assert.equal(a.player.hp, GAME_CONFIG.maxHealth);
});
