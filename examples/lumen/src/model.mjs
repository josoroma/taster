/** Deterministic, renderer-independent rules for Lumen: The Sunken Garden. */
export const GAME_CONFIG = Object.freeze({
  bounds: Object.freeze({ minX: -9, maxX: 9, minZ: -7, maxZ: 7 }),
  walkSpeed: 3.2,
  dashSpeed: 10,
  dashDuration: 0.22,
  dashCooldown: 0.9,
  maxHealth: 3,
  damageInvulnerability: 1.4,
  hazardRadius: 0.7,
  beaconRadius: 0.7,
  beaconCharges: 3,
  tuneRange: 2,
  tunePeriod: 2.6,
  tuneWindowStart: 0.35,
  tuneWindowEnd: 0.65,
  tuneCooldown: 0.5,
  exitRange: 1.8,
});

const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const finite = (value) => Number.isFinite(value) ? value : 0;

export function createGame() {
  const state = {
    mode: 'ready',
    time: 0,
    completedTime: null,
    player: {
      x: 0, z: 4, heading: Math.PI, moving: false,
      hp: GAME_CONFIG.maxHealth,
      invulnerable: 0,
      dashRemaining: 0,
      dashCooldown: 0,
      dashX: 0, dashZ: -1,
      target: null,
    },
    beacons: [
      { id: 0, name: 'Moss', x: -6, z: -3, lit: false, charge: 0, lastCycle: -1, phaseOffset: 0 },
      { id: 1, name: 'Tide', x: 5, z: -4, lit: false, charge: 0, lastCycle: -1, phaseOffset: 0.23 },
      { id: 2, name: 'Ember', x: 5, z: 4, lit: false, charge: 0, lastCycle: -1, phaseOffset: 0.46 },
    ],
    hazards: [{ id: 0, x: 0, z: 0 }, { id: 1, x: 0, z: 0 }],
    exit: { x: -6, z: 4, ready: false },
    tune: {
      nearIndex: -1,
      phase: 0,
      cycle: 0,
      waiting: false,
      windowStart: GAME_CONFIG.tuneWindowStart,
      windowEnd: GAME_CONFIG.tuneWindowEnd,
      cooldown: 0,
      range: GAME_CONFIG.tuneRange,
    },
  };
  updateHazards(state);
  updateContext(state);
  return state;
}

export function startGame(state) {
  if (state.mode !== 'ready') return [];
  state.mode = 'playing';
  return [{ type: 'start' }];
}

function updateHazards(state) {
  // Both routes stay clear of the spawn and shrine centres.
  const t = state.time;
  state.hazards[0].x = -2 + Math.cos(t * 0.67) * 2.4;
  state.hazards[0].z = -1 + Math.sin(t * 0.67) * 1.8;
  state.hazards[1].x = 4 + Math.cos(t * -0.53 + Math.PI / 2) * 2;
  state.hazards[1].z = Math.sin(t * -0.53 + Math.PI / 2) * 2.1;
}

function updateContext(state) {
  let nearestDistance = GAME_CONFIG.tuneRange;
  state.tune.nearIndex = -1;
  state.beacons.forEach((beacon, index) => {
    const d = distance(state.player, beacon);
    if (!beacon.lit && d <= nearestDistance) {
      nearestDistance = d;
      state.tune.nearIndex = index;
    }
  });
  const beacon = state.beacons[state.tune.nearIndex];
  const beat = state.time / GAME_CONFIG.tunePeriod + (beacon?.phaseOffset ?? 0);
  state.tune.cycle = Math.floor(beat);
  state.tune.phase = beat - state.tune.cycle;
  state.tune.waiting = beacon?.lastCycle === state.tune.cycle;
  state.exit.ready = state.beacons.every(beacon => beacon.lit);
}

function resolveBeacons(point, beacons, fallback, approachFromOutside = false) {
  for (const beacon of beacons) {
    let dx = point.x - beacon.x;
    let dz = point.z - beacon.z;
    const length = Math.hypot(dx, dz);
    if (length < GAME_CONFIG.beaconRadius) {
      if (length < 1e-9 || approachFromOutside) {
        dx = fallback.x - beacon.x;
        dz = fallback.z - beacon.z;
      }
      if (Math.hypot(dx, dz) < 1e-9) dz = 1;
      const directionLength = Math.hypot(dx, dz);
      // A small clearance keeps click destinations outside collision precision.
      const radius = GAME_CONFIG.beaconRadius + 0.001;
      point.x = beacon.x + dx / directionLength * radius;
      point.z = beacon.z + dz / directionLength * radius;
    }
  }
  return point;
}

function movePlayer(state, input, dt) {
  const player = state.player;
  let dx = finite(input.x);
  let dz = finite(input.z);
  let length = Math.hypot(dx, dz);
  let remainingDistance = Infinity;

  if (length > 0) {
    player.target = null;
  } else if (player.target) {
    dx = player.target.x - player.x;
    dz = player.target.z - player.z;
    length = Math.hypot(dx, dz);
    remainingDistance = length;
    if (length < 0.001) {
      player.target = null;
      length = 0;
    }
  }

  if (length > 0) {
    dx /= length;
    dz /= length;
  }
  if (player.dashRemaining > 0) {
    dx = player.dashX;
    dz = player.dashZ;
    remainingDistance = Infinity;
    length = 1;
  }

  const speed = player.dashRemaining > 0 ? GAME_CONFIG.dashSpeed : GAME_CONFIG.walkSpeed;
  const travel = Math.min(speed * dt, remainingDistance);
  const beforeX = player.x;
  const beforeZ = player.z;
  if (length > 0) {
    player.x = clamp(player.x + dx * travel, GAME_CONFIG.bounds.minX, GAME_CONFIG.bounds.maxX);
    player.z = clamp(player.z + dz * travel, GAME_CONFIG.bounds.minZ, GAME_CONFIG.bounds.maxZ);
    resolveBeacons(player, state.beacons, { x: beforeX, z: beforeZ });
    player.heading = Math.atan2(dx, dz);
  }
  player.moving = Math.hypot(player.x - beforeX, player.z - beforeZ) > 0.00001;
  if (player.target && distance(player, player.target) < 0.001) player.target = null;
}

/**
 * Advance active play. Inputs are world-space directions or a click target.
 * A target persists until reached; manual direction or target:null cancels it.
 * Time is subdivided for collision safety; callers may use a fixed 1/60 tick.
 */
export function stepGame(state, input = {}, dt = 1 / 60) {
  if (state.mode !== 'playing' || !Number.isFinite(dt) || dt <= 0) return [];
  if (Object.hasOwn(input, 'target')) {
    const target = input.target;
    state.player.target = target && Number.isFinite(target.x) && Number.isFinite(target.z)
      ? resolveBeacons({
        x: clamp(target.x, GAME_CONFIG.bounds.minX, GAME_CONFIG.bounds.maxX),
        z: clamp(target.z, GAME_CONFIG.bounds.minZ, GAME_CONFIG.bounds.maxZ),
      }, state.beacons, state.player, true)
      : null;
  }

  const events = [];
  // Ignore pathological background-tab deltas rather than simulating minutes.
  let remaining = Math.min(dt, 1);
  while (remaining > 1e-9 && state.mode === 'playing') {
    let tick = Math.min(remaining, 1 / 60);
    // End dashes precisely even when dt does not divide the dash duration.
    if (state.player.dashRemaining > 1e-9) tick = Math.min(tick, state.player.dashRemaining);
    state.time += tick;
    movePlayer(state, input, tick);
    state.player.invulnerable = Math.max(0, state.player.invulnerable - tick);
    state.player.dashRemaining = Math.max(0, state.player.dashRemaining - tick);
    state.player.dashCooldown = Math.max(0, state.player.dashCooldown - tick);
    state.tune.cooldown = Math.max(0, state.tune.cooldown - tick);
    updateHazards(state);

    if (state.player.invulnerable <= 1e-9) {
      const hazard = state.hazards.find(item => distance(item, state.player) < GAME_CONFIG.hazardRadius);
      if (hazard) {
        state.player.hp = Math.max(0, state.player.hp - 1);
        state.player.invulnerable = GAME_CONFIG.damageInvulnerability;
        events.push({ type: 'hurt', health: state.player.hp, hazard: hazard.id });
        if (state.player.hp === 0) {
          state.mode = 'lost';
          state.player.moving = false;
          state.player.target = null;
          events.push({ type: 'lost' });
        }
      }
    }
    remaining -= tick;
  }
  updateContext(state);
  return events;
}

/** Tune the nearest unlit shrine on the visible resonance beat, or use the exit. */
export function interact(state) {
  if (state.mode !== 'playing') return [];
  updateContext(state);
  if (distance(state.player, state.exit) <= GAME_CONFIG.exitRange) {
    if (!state.exit.ready) return [{ type: 'exit-locked' }];
    state.mode = 'won';
    state.completedTime = state.time;
    state.player.moving = false;
    state.player.target = null;
    return [{ type: 'won', time: state.completedTime }];
  }
  const index = state.tune.nearIndex;
  if (index < 0 || state.tune.cooldown > 1e-9 || state.tune.waiting) return [];
  state.tune.cooldown = GAME_CONFIG.tuneCooldown;
  if (state.tune.phase >= state.tune.windowStart && state.tune.phase <= state.tune.windowEnd) {
    const beacon = state.beacons[index];
    beacon.charge++;
    beacon.lastCycle = state.tune.cycle;
    beacon.lit = beacon.charge === GAME_CONFIG.beaconCharges;
    updateContext(state);
    return [{ type: beacon.lit ? 'tuned' : 'charge', index, name: beacon.name, charge: beacon.charge }];
  }
  return [{ type: 'miss', index }];
}

/** Dash along the most recent movement heading; cooldown is in seconds. */
export function dash(state) {
  if (state.mode !== 'playing' || state.player.dashCooldown > 1e-9) return [];
  state.player.dashX = Math.sin(state.player.heading);
  state.player.dashZ = Math.cos(state.player.heading);
  state.player.dashRemaining = GAME_CONFIG.dashDuration;
  state.player.dashCooldown = GAME_CONFIG.dashCooldown;
  state.player.invulnerable = Math.max(state.player.invulnerable, GAME_CONFIG.dashDuration);
  return [{ type: 'dash' }];
}

export function togglePause(state) {
  if (state.mode === 'playing') {
    state.mode = 'paused';
    state.player.moving = false;
    return [{ type: 'pause' }];
  }
  if (state.mode === 'paused') {
    state.mode = 'playing';
    return [{ type: 'resume' }];
  }
  return [];
}

/** Keep the outer state identity so renderers can retain their state reference. */
export function restartGame(state) {
  Object.assign(state, createGame());
  state.mode = 'playing';
  return [{ type: 'restart' }];
}

export function getObjective(state) {
  if (state.mode === 'ready') return 'Wake the garden. Restore its three sleeping lights.';
  if (state.mode === 'paused') return 'The garden is waiting for you.';
  if (state.mode === 'won') return 'The garden is awake. Carry its light with you.';
  if (state.mode === 'lost') return 'Your light faded. Begin again.';
  if (state.exit.ready) return 'Return to the western gate and press E to open it.';
  if (state.tune.nearIndex >= 0) return state.tune.waiting
    ? 'Pulse received. Wait for the next cycle.'
    : 'Press E when the pulse enters the gold band.';
  return `Restore the sleeping lights · ${state.beacons.filter(beacon => beacon.lit).length} / 3`;
}
