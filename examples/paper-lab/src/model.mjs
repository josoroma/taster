/** Original LEAF lesson: equal-frequency, right-moving waves in a linear medium. */
export const DURATION = 48;
export const WAVE = Object.freeze({ amplitude: 1, wavelength: 4, frequency: .25, length: 8, slowFactor: 4 });
export const CHAPTERS = Object.freeze([
  { id: 'one', start: 0, end: 16, title: 'A shape in motion', short: 'One wave', kicker: '01 / Meet the wave',
    lead: 'The pattern travels.\nThe point oscillates.',
    body: 'Follow the dot at a fixed position. It moves up and down while the wave shape travels to the right.',
    takeaway: 'A wave carries a changing pattern through space.',
    transcript: 'A sinusoidal wave is a repeating pattern. Here its displacement rises one centimetre above equilibrium and falls one centimetre below. The distance from crest to crest is four metres. Follow the dot at position four metres: the point oscillates vertically while the pattern travels right. The motion is shown four times slower than model time.' },
  { id: 'add', start: 16, end: 32, title: 'Two become a sum', short: 'Add the waves', kicker: '02 / Read the sum',
    lead: 'At every point,\nadd the heights.',
    body: 'Two matching waves line up crest for crest. Add their signed displacements to find the combined wave.',
    takeaway: 'In phase: 1 cm + 1 cm makes a 2 cm crest.',
    transcript: 'Now add a second wave with the same amplitude, wavelength, frequency, and direction. The two waves are in phase: their crests and troughs line up. In this linear model, add their signed displacements at every position. The bottom trace is that sum. Two one-centimetre crests give a two-centimetre crest; two troughs give a deeper trough.' },
  { id: 'phase', start: 32, end: 48, title: 'The space between', short: 'Change the phase', kicker: '03 / Explore interference',
    lead: 'Same waves.\nA different meeting.',
    body: 'Shift the phase of wave B. Watch the combined amplitude fall as crests meet troughs. Try the phase control below.',
    takeaway: 'At 180°, equal opposite displacements cancel.',
    transcript: 'A phase shift changes where the second wave sits in its cycle. As the shift grows from zero to one hundred and eighty degrees, the amplitude of the sum falls from two centimetres to zero. At one hundred and eighty degrees, each crest meets an equal trough, so the signed displacements cancel everywhere in this ideal model. This is cancellation of displacement, not a claim that energy has been destroyed. Try a phase of ninety degrees: the sum has an amplitude of about one point four one centimetres.' },
]);
export function clamp(value, min, max) { return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min)); }
export function displacement(x, seconds, phaseDegrees = 0) {
  return WAVE.amplitude * Math.sin(2 * Math.PI * (x / WAVE.wavelength - WAVE.frequency * seconds) + phaseDegrees * Math.PI / 180);
}
export function resultantAmplitude(phaseDegrees) { return 2 * WAVE.amplitude * Math.abs(Math.cos(clamp(phaseDegrees, 0, 180) * Math.PI / 360)); }
export function sampleLesson(seconds, phaseOverride = null) {
  const time = clamp(seconds, 0, DURATION);
  const chapterIndex = time < 16 ? 0 : time < 32 ? 1 : 2;
  const chapter = CHAPTERS[chapterIndex];
  const phase = chapterIndex === 2 ? (phaseOverride === null ? (time - 32) / 16 * 180 : clamp(phaseOverride, 0, 180)) : 0;
  const physicalTime = time / WAVE.slowFactor;
  const points = Array.from({length: 201}, (_, index) => {
    const x = index / 200 * WAVE.length;
    const a = displacement(x, physicalTime);
    const b = displacement(x, physicalTime, phase);
    return { x, a, b, sum: a + b };
  });
  return { time, physicalTime, chapterIndex, chapter, phase, amplitude: resultantAmplitude(phase), points, finished: time === DURATION };
}
export const QUIZ = Object.freeze({
  question: 'Two equal waves differ in phase by 180°. What is their combined displacement?',
  answers: ['Twice the original displacement', 'Zero at every position', 'The same as either wave'],
  correctIndex: 1,
});
export function checkAnswer(index) {
  if (!Number.isInteger(index) || index < 0 || index >= QUIZ.answers.length) return { valid: false, correct: false, message: 'Choose an answer first.' };
  return index === QUIZ.correctIndex
    ? { valid: true, correct: true, message: 'Exactly. Equal and opposite displacements add to zero at every position.' }
    : { valid: true, correct: false, message: 'Look at the signs. At 180°, every positive displacement meets an equal negative one. Try again, or set the phase to 180°.' };
}
