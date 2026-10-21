// Original Taster samplers. Upstream names identify vocabulary, not copied animation code.
export const SOURCE = Object.freeze({
  name: 'Motion Prompt', author: 'Shohei Ohtaki',
  repository: 'https://github.com/showheyohtaki/motion-prompt',
  commit: '36f5bdacb1e012eb00caf30741d2e2223ee514b4',
  catalogVersion: '1.45af2a203e', api: 'v1', reviewed: '2026-10-20',
  scope: 'Six original local interpretations; not the complete upstream catalog or runtime.',
});

const entries = [
  ['001', 'motion', '01', 'pop-in', 'Pop-in', 'Give an arrival a little personality.', 'Scale a badge into view, pass its resting size, then settle.', 'spring', 'Arrival strength'],
  ['002', 'motion', '02', 'stagger', 'Stagger', 'One movement. Different start times.', 'Grow seven bars in order, keeping the same motion and a short delay between neighbors.', 'overshoot', 'Bar overshoot'],
  ['005', 'motion', '05', 'mask-reveal', 'Mask reveal', 'Let the edge do the revealing.', 'Move two lines through fixed clipping windows; keep their opacity unchanged.', 'distance', 'Travel distance'],
  ['010', 'motion', '10', 'overshoot', 'Overshoot', 'Pass the destination. Find the balance.', 'Move a marker beyond its destination once, then bring it back to rest.', 'overshoot', 'Overshoot amount'],
  ['121', 'motion2', '01', 'anticipation', 'Anticipation', 'A small move before the big one.', 'Pull a block back before sending it forward; let its shape stretch during the launch.', 'wind-up', 'Wind-up distance'],
  ['126', 'motion2', '06', 'motion-path', 'Motion path', 'Give movement a route to follow.', 'Carry an arrow along a curved route, turning it to follow the path tangent.', 'curvature', 'Path curvature'],
];
export const EFFECTS = Object.freeze(entries.map(([id, pack, no, slug, name, tagline, description, parameter, parameterLabel]) => Object.freeze({
  id, pack, no, slug, name, tagline, description, parameter, parameterLabel,
  source: `https://showheyohtaki.github.io/motion-prompt/#${id}`,
  spec: `https://showheyohtaki.github.io/motion-prompt/api/v1/en/e/${id}.txt`,
})));

export function resolveEffect(query) {
  const value = String(query).trim().toLowerCase().replace(/^#/, '');
  const found = EFFECTS.filter(effect => [effect.id, effect.slug, effect.name.toLowerCase(), `${effect.pack}/${effect.slug}`, `${effect.pack}/${effect.no}`].includes(value));
  if (found.length !== 1) throw new RangeError(`Unknown or ambiguous local effect: ${query}`);
  return found[0];
}

export const LIMITS = Object.freeze({ duration: Object.freeze([0.6, 6]), intensity: Object.freeze([0.25, 1.75]) });
const finite = (value, label) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new TypeError(`${label} must be a finite number`);
  return value;
};
const clamp = value => Math.max(0, Math.min(1, value));
const ease = value => { const p = clamp(value); return 1 - (1 - p) ** 3; };
const smooth = value => { const p = clamp(value); return p * p * (3 - 2 * p); };
const back = (value, strength) => { const p = clamp(value) - 1; return 1 + (strength + 1) * p ** 3 + strength * p ** 2; };

export function validateSettings(settings = {}) {
  const duration = settings.duration ?? 2.4;
  const intensity = settings.intensity ?? 1;
  for (const [key, value] of Object.entries({ duration, intensity })) {
    finite(value, key);
    if (value < LIMITS[key][0] || value > LIMITS[key][1]) throw new RangeError(`${key} must be between ${LIMITS[key].join(' and ')}`);
  }
  return { duration, intensity };
}

export function pathPoint(progress, intensity = 1) {
  finite(progress, 'progress'); finite(intensity, 'intensity');
  const p = clamp(progress), q = 1 - p;
  const x = 90 * q ** 3 + 3 * 220 * q ** 2 * p + 3 * 380 * q * p ** 2 + 510 * p ** 3;
  const y = 170 + intensity * (-420 * q ** 2 * p + 420 * q * p ** 2);
  const dx = 3 * 130 * q ** 2 + 6 * 160 * q * p + 3 * 130 * p ** 2;
  const dy = intensity * (-420 * q ** 2 + 1680 * q * p - 420 * p ** 2);
  return { x, y, angle: Math.atan2(dy, dx) * 180 / Math.PI };
}

/** A single pass, sampled from absolute seconds. Seeking never needs previous frames. */
export function sampleEffect(query, seconds, settings = {}) {
  const effect = resolveEffect(query);
  const { duration, intensity } = validateSettings(settings);
  const time = Math.max(0, Math.min(duration, finite(seconds, 'time')));
  const progress = time / duration;
  const result = { id: effect.id, time, progress, duration, intensity };
  if (effect.slug === 'pop-in') return { ...result, scale: back(progress / 0.7, 2 * intensity), angle: -24 * intensity * (1 - ease(progress / 0.6)) };
  if (effect.slug === 'stagger') return { ...result, bars: Array.from({ length: 7 }, (_, i) => back((progress - i * 0.065) / 0.58, 1.7 * intensity)) };
  if (effect.slug === 'mask-reveal') return { ...result, topY: (125 + 30 * intensity) * (1 - ease(progress / 0.65)), bottomY: -(65 + 20 * intensity) * (1 - ease((progress - 0.13) / 0.65)) };
  if (effect.slug === 'overshoot') return { ...result, value: back(progress / 0.85, 2.8 * intensity) };
  if (effect.slug === 'anticipation') {
    const launch = clamp((progress - 0.26) / 0.54);
    const x = progress < 0.26 ? 125 - 42 * intensity * smooth(progress / 0.26) : 125 - 42 * intensity + (350 + 42 * intensity) * ease(launch);
    const stretch = Math.sin(Math.PI * launch) * 0.25 * intensity;
    return { ...result, x, scaleX: 1 + stretch, scaleY: 1 - stretch * 0.65, phase: progress < 0.26 ? 'Wind up' : progress < 0.8 ? 'Launch' : 'Settle' };
  }
  return { ...result, ...pathPoint(progress, intensity) };
}

export function makePrompt(query, settings = {}) {
  const effect = resolveEffect(query);
  const { duration, intensity } = validateSettings(settings);
  const n = value => Number(value.toFixed(3));
  const directions = {
    'pop-in': `Scale 0→1 over ${n(duration * .7)} s with cubic back-out easing (s=${n(2 * intensity)}). Rotate from ${n(-24 * intensity)}° to 0 over ${n(duration * .6)} s with cubic ease-out.`,
    'stagger': `Delay each neighboring bar by ${n(duration * .065)} s. Each rise lasts ${n(duration * .58)} s with cubic back-out easing (s=${n(1.7 * intensity)}). Anchor every bar at its baseline.`,
    'mask-reveal': `On a 600×330 reference stage, move the top line up ${n(125 + 30 * intensity)} units over ${n(duration * .65)} s. Move the lower line down ${n(65 + 20 * intensity)} units over ${n(duration * .65)} s, starting at ${n(duration * .13)} s. Use cubic ease-out and fixed clip windows.`,
    'overshoot': `Move from x=100 to x=380 on a 600-unit-wide reference stage over ${n(duration * .85)} s using cubic back-out easing (s=${n(2.8 * intensity)}), then hold.`,
    'anticipation': `Pull back ${n(42 * intensity)} units over ${n(duration * .26)} s with smoothstep, then travel ${n(350 + 42 * intensity)} units forward over ${n(duration * .54)} s with cubic ease-out. Reference stage width: 600 units.`,
    'motion-path': `On a 600×330 reference stage, follow cubic Bézier M90,170 C220,${n(170 - 140 * intensity)} 380,${n(170 + 140 * intensity)} 510,170 with a linear curve parameter; orient the arrow to the tangent. Speed along the curve will vary.`,
  };
  return `Use ${effect.name} (Motion Prompt #${effect.id}; pack ${effect.pack}, local no. ${effect.no}, slug ${effect.slug}).\n${effect.description}\nDuration: ${duration.toFixed(1)} seconds for one pass. ${effect.parameterLabel}: ${intensity.toFixed(2)}× the CUE baseline. ${directions[effect.slug]}\nUse the current project's renderer and visual style; scale reference coordinates to fit. Derive each frame from absolute time; preserve pause, seek, and replay. Begin paused and allow explicit playback under reduced motion.\nCUE is an original local interpretation; these parameters are not the upstream demo's exact timing or geometry. Reference: ${effect.source}\nUpstream spec: ${effect.spec}`;
}
