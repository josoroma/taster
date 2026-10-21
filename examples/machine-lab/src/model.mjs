/** Inline slider-crank, right-hand assembly branch. SI units; no force model.
 * x right, y up in the mechanism plane, theta counterclockwise from +x.
 * Exact closure: (x - r cos(theta))² + (r sin(theta))² = l².
 */
export const DEFAULTS = Object.freeze({ radius: .04, rodLength: .14, angle: Math.PI / 4, rpm: 24 });
export const TAU = 2 * Math.PI;

export function wrapAngle(angle) {
  if (!Number.isFinite(angle)) throw new TypeError('Crank angle must be finite');
  return ((angle % TAU) + TAU) % TAU;
}

export function solveCrank({ radius = DEFAULTS.radius, rodLength = DEFAULTS.rodLength, angle = DEFAULTS.angle, rpm = DEFAULTS.rpm } = {}) {
  if (![radius, rodLength, angle, rpm].every(Number.isFinite)) throw new TypeError('Model inputs must be finite');
  if (radius <= 0 || rodLength <= radius) throw new RangeError('Require rod length > crank radius > 0 for a complete revolution');
  const theta = wrapAngle(angle), omega = rpm * TAU / 60;
  const pinX = radius * Math.cos(theta), pinY = radius * Math.sin(theta);
  const span = Math.sqrt(rodLength ** 2 - pinY ** 2);
  const x = pinX + span;
  const velocity = -omega * (radius * Math.sin(theta) + radius ** 2 * Math.sin(theta) * Math.cos(theta) / span);
  return { radius, rodLength, angle: theta, rpm, omega, pinX, pinY, x, velocity,
    travel: radius + rodLength - x, travelVelocity: -velocity,
    stroke: 2 * radius, rodAngle: Math.atan2(-pinY, span) };
}

export function advanceAngle(angle, rpm, seconds) {
  if (!Number.isFinite(rpm) || !Number.isFinite(seconds) || seconds < 0) throw new RangeError('Use a finite speed and nonnegative elapsed seconds');
  return wrapAngle(angle + rpm * TAU / 60 * seconds);
}

/** Authored guard inspection offset, independent of mechanism geometry. */
export function revealOffset(progress) {
  if (!Number.isFinite(progress)) throw new TypeError('Reveal progress must be finite');
  return .075 * Math.min(1, Math.max(0, progress));
}

export const PARTS = Object.freeze({
  crank: { number: '01', name: 'Crank & shaft', kind: 'ROTARY INPUT', description: 'A 40 mm radius turns around the fixed shaft. One complete turn makes one out-and-back stroke.' },
  rod: { number: '02', name: 'Connecting rod', kind: 'CLOSED LINK', description: 'The 140 mm pin-to-pin link keeps its length as its angle changes. Its tilt makes the slider motion depart from a simple cosine.' },
  slider: { number: '03', name: 'Slider & guides', kind: 'LINEAR OUTPUT', description: 'The guide keeps the slider pin on the horizontal axis. An 80 mm stroke follows directly from twice the crank radius.' },
  guard: { number: '04', name: 'Inspection guard', kind: 'SCHEMATIC ENCLOSURE', description: 'Lift the guard to see the connection. This authored reveal explains the layers; it is not a servicing procedure.' },
});
