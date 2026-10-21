import { sampleEffect } from './model.mjs';

const NS = 'http://www.w3.org/2000/svg';
const heights = [68, 104, 88, 150, 126, 174, 202];
const colors = ['#e56042', '#263b4b', '#e6b35b', '#7f9c8d', '#e56042', '#263b4b', '#e6b35b'];
let serial = 0;
const frame = '<path d="M44 270H556" stroke="#c9c8c0"/><path d="M300 35V283" stroke="#d9d8d0" stroke-dasharray="3 6"/><text x="44" y="300" class="scene-note">START</text><text x="556" y="300" text-anchor="end" class="scene-note">REST</text>';
const star = '<path d="M0-43 12-13 43 0 12 13 0 43-12 13-43 0-12-13Z" fill="#f6efe1"/>';

export function createScene(svg, effect, { mini = false } = {}) {
  const clip = `cue-clip-${serial++}`;
  const title = svg.querySelector('title')?.outerHTML ?? '';
  let art = '';
  if (effect.slug === 'pop-in') art = `<circle cx="300" cy="158" r="84" fill="none" stroke="#c9c8c0" stroke-dasharray="4 7"/><g data-body><rect x="-64" y="-64" width="128" height="128" rx="30" fill="#e56042"/>${star}</g>`;
  if (effect.slug === 'stagger') art = heights.map((height, i) => `<g data-bar="${i}"><rect x="${88 + 63 * i}" y="${252 - height}" width="43" height="${height}" rx="7" fill="${colors[i]}"/></g>`).join('');
  if (effect.slug === 'mask-reveal') art = `<defs><clipPath id="${clip}-top"><rect x="50" y="58" width="500" height="112"/></clipPath><clipPath id="${clip}-bottom"><rect x="50" y="178" width="500" height="74"/></clipPath></defs><g clip-path="url(#${clip}-top)"><text data-top x="300" y="155" text-anchor="middle" class="scene-headline">MAKE</text></g><path d="M90 174H510" stroke="#e56042" stroke-width="4"/><g clip-path="url(#${clip}-bottom)"><text data-bottom x="300" y="220" text-anchor="middle" class="scene-subline">a little movement.</text></g>`;
  if (effect.slug === 'overshoot') art = `<rect x="78" y="155" width="470" height="10" rx="5" fill="#e0ded5"/><path d="M380 82V235" stroke="#263b4b" stroke-dasharray="4 7"/><text x="380" y="67" class="scene-note" text-anchor="middle">TARGET</text><path data-travel d="M100 160H100" stroke="#e56042" stroke-width="10" stroke-linecap="round"/><g data-body><circle r="32" fill="#263b4b"/><circle r="8" fill="#f6efe1"/></g>`;
  if (effect.slug === 'anticipation') art = `<path d="M75 217H525" stroke="#c9c8c0"/><path d="M125 232V247M475 232V247" stroke="#263b4b"/><g data-body><rect x="-36" y="-36" width="72" height="72" rx="19" fill="#e56042"/><path d="M-15 0H15M4-11 15 0 4 11" fill="none" stroke="#f6efe1" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></g><text data-phase x="300" y="100" class="scene-note" text-anchor="middle"></text>`;
  if (effect.slug === 'motion-path') art = '<path data-path fill="none" stroke="#b9c3bb" stroke-width="2" stroke-dasharray="4 6"/><circle cx="90" cy="170" r="5" fill="#263b4b"/><circle cx="510" cy="170" r="5" fill="#263b4b"/><g data-body><path d="M28 0-24-19-13 0-24 19Z" fill="#e56042"/><path d="M-13 0H10" stroke="#f6efe1" stroke-width="2"/></g>';
  svg.innerHTML = `${title}<g ${mini ? 'transform="translate(0 -6)"' : ''}>${mini ? '' : frame}${art}</g>`;
  svg.setAttribute('viewBox', '0 0 600 330');
  const body = svg.querySelector('[data-body]');
  const bars = [...svg.querySelectorAll('[data-bar]')];
  const top = svg.querySelector('[data-top]'), bottom = svg.querySelector('[data-bottom]');
  const path = svg.querySelector('[data-path]'), phase = svg.querySelector('[data-phase]');
  const travel = svg.querySelector('[data-travel]');
  return (seconds, settings) => {
    const state = sampleEffect(effect.id, seconds, settings);
    if (effect.slug === 'pop-in') body.setAttribute('transform', `translate(300 158) rotate(${state.angle}) scale(${state.scale})`);
    if (effect.slug === 'stagger') bars.forEach((bar, i) => bar.setAttribute('transform', `translate(0 252) scale(1 ${state.bars[i]}) translate(0 -252)`));
    if (effect.slug === 'mask-reveal') { top.setAttribute('transform', `translate(0 ${state.topY})`); bottom.setAttribute('transform', `translate(0 ${state.bottomY})`); }
    if (effect.slug === 'overshoot') { const x = 100 + 280 * state.value; body.setAttribute('transform', `translate(${x} 160)`); travel.setAttribute('d', `M100 160H${x}`); }
    if (effect.slug === 'anticipation') { body.setAttribute('transform', `translate(${state.x} 181) scale(${state.scaleX} ${state.scaleY})`); phase.textContent = state.phase.toUpperCase(); }
    if (effect.slug === 'motion-path') { path.setAttribute('d', `M90 170C220 ${170 - 140 * state.intensity} 380 ${170 + 140 * state.intensity} 510 170`); body.setAttribute('transform', `translate(${state.x} ${state.y}) rotate(${state.angle})`); }
    return state;
  };
}

export function makeThumbnail(effect) {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  createScene(svg, effect, { mini: true })(effect.slug === 'anticipation' ? 1.15 : effect.slug === 'motion-path' ? 1.7 : 1.25, { duration: 2.4, intensity: 1 });
  return svg;
}
