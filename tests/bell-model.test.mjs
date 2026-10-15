import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createQuantumState, applyGate, resetQuantum, probabilities, blochVectors,
  fidelity, measure, getEntanglement, CHALLENGES,
} from '../examples/bell-lab/src/model.mjs';

const close = (actual, expected, tolerance = 1e-12) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} ≠ ${expected}`);
const norm = state => state.amplitudes.reduce((sum, a) => sum + a.re ** 2 + a.im ** 2, 0);
const prepare = (...gates) => {
  const state = createQuantumState();
  for (const gate of gates) applyGate(state, gate);
  return state;
};
const sameAmplitudes = (actual, expected) => {
  actual.amplitudes.forEach((a, i) => {
    close(a.re, expected.amplitudes[i].re);
    close(a.im, expected.amplitudes[i].im);
  });
};
const seededRandom = (seed = 8675309) => () => {
  seed = (1664525 * seed + 1013904223) >>> 0;
  return seed / 2 ** 32;
};

test('basis is |q0 q1>; controlled NOT flips q1 only when q0 is 1', () => {
  assert.deepEqual(probabilities(createQuantumState()), [1, 0, 0, 0]);
  assert.deepEqual(probabilities(prepare('X0')), [0, 0, 1, 0]);
  assert.deepEqual(probabilities(prepare('X1')), [0, 1, 0, 0]);
  assert.deepEqual(probabilities(prepare('X0', 'CNOT01')), [0, 0, 0, 1]);
  assert.deepEqual(probabilities(prepare('X1', 'CNOT01')), [0, 1, 0, 0]);
  assert.deepEqual(probabilities(prepare('X0', 'X1', 'CNOT01')), [0, 0, 1, 0]);
});

test('all offered gates are self-inverse on complex amplitudes', () => {
  const gates = ['H0', 'H1', 'X0', 'X1', 'Z0', 'Z1', 'CNOT01'];
  const initial = createQuantumState();
  initial.amplitudes = [[1, 2], [3, -1], [-2, 1], [0, 4]].map(([re, im]) => ({
    re: re / 6, im: im / 6,
  }));
  close(norm(initial), 1);
  for (const gate of gates) {
    const state = structuredClone(initial);
    applyGate(state, gate);
    close(norm(state), 1);
    applyGate(state, gate);
    sameAmplitudes(state, initial);
  }
  sameAmplitudes(prepare('H0', 'H0', 'H1', 'H1'), createQuantumState());
});

test('long seeded gate sequences preserve norm and reverse exactly', () => {
  const random = seededRandom();
  const gates = ['H0', 'H1', 'X0', 'X1', 'Z0', 'Z1', 'CNOT01'];
  const state = createQuantumState();
  const sequence = [];
  for (let i = 0; i < 1000; i++) {
    const gate = gates[Math.floor(random() * gates.length)];
    sequence.push(gate);
    applyGate(state, gate);
    close(norm(state), 1);
    close(probabilities(state).reduce((a, b) => a + b), 1);
  }
  for (const gate of sequence.reverse()) applyGate(state, gate);
  sameAmplitudes(state, createQuantumState());
});

test('Bell entanglement differs from an equally random product superposition', () => {
  const bell = prepare('H0', 'CNOT01');
  assert.deepEqual(probabilities(bell), [0.5, 0, 0, 0.5]);
  close(fidelity(bell, 'phi-plus'), 1);
  close(getEntanglement(bell), 1);
  for (const vector of blochVectors(bell)) {
    close(vector.x, 0);
    close(vector.y, 0);
    close(vector.z, 0);
    close(vector.length, 0);
    close(vector.purity, 0.5);
  }
  const product = prepare('H0', 'H1');
  assert.deepEqual(probabilities(product), [0.25, 0.25, 0.25, 0.25]);
  close(getEntanglement(product), 0);
  for (const vector of blochVectors(product)) {
    close(vector.x, 1);
    close(vector.y, 0);
    close(vector.z, 0);
    close(vector.purity, 1);
  }
});

test('complex reduced states give the correct Bloch y sign and partial entanglement', () => {
  const state = createQuantumState();
  // (|0> + i|1>)/sqrt(2) on q0, with q1 in |0>.
  state.amplitudes = [
    { re: Math.SQRT1_2, im: 0 }, { re: 0, im: 0 },
    { re: 0, im: Math.SQRT1_2 }, { re: 0, im: 0 },
  ];
  const [a, b] = blochVectors(state);
  close(a.x, 0); close(a.y, 1); close(a.z, 0);
  close(b.x, 0); close(b.y, 0); close(b.z, 1);
  close(getEntanglement(state), 0);

  // A complex, partially entangled state: sqrt(.8)|00> + i sqrt(.2)|11>.
  state.amplitudes = [
    { re: Math.sqrt(0.8), im: 0 }, { re: 0, im: 0 },
    { re: 0, im: 0 }, { re: 0, im: Math.sqrt(0.2) },
  ];
  close(getEntanglement(state), 0.8);
  for (const vector of blochVectors(state)) {
    close(vector.x, 0); close(vector.y, 0); close(vector.z, 0.6);
    close(vector.purity, 0.68);
    // Independent identity: pure bipartite concurrence = sqrt(2(1 - local purity)).
    close(getEntanglement(state), Math.sqrt(2 * (1 - vector.purity)));
  }
});

test('phase-sensitive fidelity distinguishes Bell states with identical probabilities', () => {
  const plus = prepare('H0', 'CNOT01');
  const minus = prepare('H0', 'CNOT01', 'Z0');
  assert.deepEqual(probabilities(plus), probabilities(minus));
  close(fidelity(plus, 'phi-plus'), 1);
  close(fidelity(plus, 'phi-minus'), 0);
  close(fidelity(minus, 'phi-minus'), 1);
  close(fidelity(minus, 'phi-plus'), 0);
  // A global complex phase cannot change physical fidelity.
  for (const a of minus.amplitudes) [a.re, a.im] = [-a.im, a.re];
  close(fidelity(minus, 'phi-minus'), 1);
  close(getEntanglement(minus), 1);
});

test('all three challenges are reachable at par from |00>', () => {
  const solutions = {
    'phi-plus': ['H0', 'CNOT01'],
    'phi-minus': ['H0', 'CNOT01', 'Z1'],
    'psi-plus': ['H0', 'CNOT01', 'X1'],
  };
  assert.equal(CHALLENGES.length, 3);
  for (const challenge of CHALLENGES) {
    const solution = solutions[challenge.id];
    const state = prepare(...solution);
    close(fidelity(state, challenge.target), 1);
    assert.equal(solution.length, challenge.par);
    assert.deepEqual(state.history, solution);
  }
});

test('local gates on a Bell state do not change the remote marginal distribution', () => {
  for (const gate of ['H0', 'X0', 'Z0']) {
    const state = prepare('H0', 'CNOT01', gate);
    const p = probabilities(state);
    close(p[0] + p[2], 0.5);
    close(p[1] + p[3], 0.5);
    const remote = blochVectors(state)[1];
    close(remote.x, 0); close(remote.y, 0); close(remote.z, 0);
  }
});

test('measurement uses Born probabilities with deterministic half-open boundaries', () => {
  for (const [draw, expected] of [[0, '00'], [0.499999999999, '00'], [0.5, '11'], [1 - Number.EPSILON, '11']]) {
    const state = prepare('H0', 'CNOT01');
    const result = measure(state, () => draw);
    assert.equal(result.outcome, expected);
    assert.equal(result.bitstring, expected);
    assert.equal(result.q0, Number(expected[0]));
    assert.equal(result.q1, Number(expected[1]));
    assert.deepEqual(result.probabilitiesBefore, [0.5, 0, 0, 0.5]);
    assert.equal(state.lastMeasurement, result);
    close(norm(state), 1);
    close(getEntanglement(state), 0);
    assert.equal(probabilities(state)[result.index], 1);
    assert.equal(measure(state, () => 1 - draw - Number.EPSILON / 2).outcome, expected);
  }
  const opposite = prepare('H0', 'CNOT01', 'X1');
  assert.equal(measure(opposite, () => 0).outcome, '01', 'zero-probability 00 must never be selected');
});

test('re-prepared shots reproduce the Bell distribution and seeded results', () => {
  const sample = () => {
    const random = seededRandom();
    const outcomes = [];
    for (let i = 0; i < 2000; i++) outcomes.push(measure(prepare('H0', 'CNOT01'), random).outcome);
    return outcomes;
  };
  const outcomes = sample();
  assert.deepEqual(outcomes, sample());
  assert.ok(outcomes.every(outcome => outcome === '00' || outcome === '11'));
  const zeros = outcomes.filter(outcome => outcome === '00').length;
  assert.ok(zeros > 900 && zeros < 1100, `2000 seeded samples yielded ${zeros} zeros`);
});

test('reset clears history and measurement; invalid operations leave state unchanged', () => {
  const state = prepare('H0', 'CNOT01');
  measure(state, () => 0.9);
  assert.equal(resetQuantum(state), state);
  assert.deepEqual(state, createQuantumState());
  const before = structuredClone(state);
  assert.throws(() => applyGate(state, 'CNOT10'), /Unknown gate/);
  assert.throws(() => fidelity(state, 'nonexistent'), /Unknown Bell target/);
  for (const draw of [-0.1, 1, NaN, Infinity]) assert.throws(() => measure(state, () => draw), /random source/);
  assert.deepEqual(state, before);
});
