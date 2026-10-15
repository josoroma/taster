/**
 * Ideal, pure two-qubit simulator. Basis order is |q0 q1>: 00, 01, 10, 11.
 * Thus q0 is the most significant bit here (unlike Qiskit's display order).
 * These are quantum-state coordinates, not physical particle positions.
 */
const SQRT_HALF = Math.SQRT1_2;
const GATES = new Set(['H0', 'H1', 'X0', 'X1', 'Z0', 'Z1', 'CNOT01']);
const TARGETS = {
  'phi-plus': [SQRT_HALF, 0, 0, SQRT_HALF],
  'phi-minus': [SQRT_HALF, 0, 0, -SQRT_HALF],
  'psi-plus': [0, SQRT_HALF, SQRT_HALF, 0],
};

export const CHALLENGES = Object.freeze([
  Object.freeze({
    id: 'phi-plus', target: 'phi-plus', name: 'Make a Bell pair', symbol: 'Φ⁺', par: 2,
    description: 'Prepare (|00⟩ + |11⟩)/√2. Both outcomes are equally likely; each qubit alone is random.',
    hint: 'Start with H on qubit 0, then use CNOT with qubit 0 as the control.',
  }),
  Object.freeze({
    id: 'phi-minus', target: 'phi-minus', name: 'Change the hidden phase', symbol: 'Φ⁻', par: 3,
    description: 'Prepare (|00⟩ − |11⟩)/√2. The probabilities match Φ⁺, but the relative phase differs.',
    hint: 'Create Φ⁺, then apply Z to either qubit. Probabilities alone cannot reveal the phase.',
  }),
  Object.freeze({
    id: 'psi-plus', target: 'psi-plus', name: 'Make opposite outcomes', symbol: 'Ψ⁺', par: 3,
    description: 'Prepare (|01⟩ + |10⟩)/√2. Computational-basis outcomes are always opposite.',
    hint: 'Create Φ⁺, then apply X to either qubit to swap matching outcomes for opposite ones.',
  }),
]);

const magnitudeSquared = amplitude => amplitude.re * amplitude.re + amplitude.im * amplitude.im;
const clampUnit = value => Math.max(0, Math.min(1, value));

function normSquared(state) {
  if (!Array.isArray(state?.amplitudes) || state.amplitudes.length !== 4 ||
      state.amplitudes.some(a => !a || !Number.isFinite(a.re) || !Number.isFinite(a.im))) {
    throw new TypeError('Expected four finite complex amplitudes in |q0 q1> order.');
  }
  const norm = state.amplitudes.reduce((sum, amplitude) => sum + magnitudeSquared(amplitude), 0);
  if (!(norm > 0) || !Number.isFinite(norm)) throw new RangeError('Quantum state must have a finite, nonzero norm.');
  return norm;
}

function normalize(state) {
  const scale = 1 / Math.sqrt(normSquared(state));
  for (const amplitude of state.amplitudes) {
    amplitude.re *= scale;
    amplitude.im *= scale;
  }
}

export function createQuantumState() {
  return {
    amplitudes: [1, 0, 0, 0].map(re => ({ re, im: 0 })),
    history: [],
    lastMeasurement: null,
  };
}

export function resetQuantum(state) {
  Object.assign(state, createQuantumState());
  return state;
}

/** Unitary gates mutate the state, including its gate history. */
export function applyGate(state, gate) {
  if (!GATES.has(gate)) throw new RangeError(`Unknown gate: ${gate}`);
  normSquared(state);
  const a = state.amplitudes;
  if (gate === 'CNOT01') {
    [a[2], a[3]] = [a[3], a[2]];
  } else {
    const bit = gate[1] === '0' ? 2 : 1;
    for (let zero = 0; zero < 4; zero++) {
      if (zero & bit) continue;
      const one = zero | bit;
      const p = a[zero];
      const q = a[one];
      if (gate[0] === 'X') {
        [a[zero], a[one]] = [q, p];
      } else if (gate[0] === 'Z') {
        a[one] = { re: -q.re, im: -q.im };
      } else {
        a[zero] = { re: (p.re + q.re) * SQRT_HALF, im: (p.im + q.im) * SQRT_HALF };
        a[one] = { re: (p.re - q.re) * SQRT_HALF, im: (p.im - q.im) * SQRT_HALF };
      }
    }
  }
  normalize(state);
  state.history.push(gate);
  state.lastMeasurement = null;
  return state;
}

/** Born probabilities in the computational basis, ordered 00, 01, 10, 11. */
export function probabilities(state) {
  const norm = normSquared(state);
  return state.amplitudes.map(amplitude => magnitudeSquared(amplitude) / norm);
}

/** Reduced-state Bloch vectors, not two independent pure-state vectors. */
export function blochVectors(state) {
  const norm = normSquared(state);
  const a = state.amplitudes;
  return [2, 1].map(bit => {
    let x = 0;
    let y = 0;
    let z = 0;
    for (let zero = 0; zero < 4; zero++) {
      if (zero & bit) continue;
      const p = a[zero];
      const q = a[zero | bit];
      // 2 * conjugate(p) * q gives x + i*y after tracing the other qubit.
      x += 2 * (p.re * q.re + p.im * q.im);
      y += 2 * (p.re * q.im - p.im * q.re);
      z += magnitudeSquared(p) - magnitudeSquared(q);
    }
    x /= norm;
    y /= norm;
    z /= norm;
    const length = Math.min(1, Math.hypot(x, y, z));
    return { x, y, z, length, purity: (1 + length * length) / 2 };
  });
}

/** Squared overlap with a normalized Bell target; global phase is irrelevant. */
export function fidelity(state, target) {
  const amplitudes = TARGETS[target];
  if (!amplitudes) throw new RangeError(`Unknown Bell target: ${target}`);
  const norm = normSquared(state);
  let re = 0;
  let im = 0;
  amplitudes.forEach((coefficient, index) => {
    re += coefficient * state.amplitudes[index].re;
    im += coefficient * state.amplitudes[index].im;
  });
  return clampUnit((re * re + im * im) / norm);
}

/** Pure two-qubit concurrence C = 2|a00*a11 - a01*a10|. */
export function getEntanglement(state) {
  const norm = normSquared(state);
  const [a, b, c, d] = state.amplitudes;
  const re = a.re * d.re - a.im * d.im - b.re * c.re + b.im * c.im;
  const im = a.re * d.im + a.im * d.re - b.re * c.im - b.im * c.re;
  return clampUnit(2 * Math.hypot(re, im) / norm);
}

/**
 * Joint Z-basis measurement of both qubits. Each call samples then collapses.
 * Repeating it without preparing the state again repeats the same outcome.
 * random must return a finite number in [0, 1), matching Math.random.
 */
export function measure(state, random = Math.random) {
  const probabilitiesBefore = probabilities(state);
  const draw = random();
  if (!Number.isFinite(draw) || draw < 0 || draw >= 1) {
    throw new RangeError('Measurement random source must return a number in [0, 1).');
  }
  let cumulative = 0;
  let index = probabilitiesBefore.findLastIndex(probability => probability > 0);
  for (let candidate = 0; candidate < 4; candidate++) {
    cumulative += probabilitiesBefore[candidate];
    if (draw < cumulative) {
      index = candidate;
      break;
    }
  }
  const outcome = index.toString(2).padStart(2, '0');
  const result = { outcome, bitstring: outcome, index, q0: index >> 1, q1: index & 1, probabilitiesBefore };
  state.amplitudes = [0, 1, 2, 3].map(i => ({ re: Number(i === index), im: 0 }));
  state.lastMeasurement = result;
  // Gate history remains a replayable preparation circuit; measurement is separate.
  return result;
}
