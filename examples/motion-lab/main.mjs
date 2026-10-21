import { EFFECTS, makePrompt, resolveEffect, validateSettings } from './src/model.mjs';
import { createScene, makeThumbnail } from './src/scene.mjs';

const $ = selector => document.querySelector(selector);
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const state = { effect: '002', time: 1.25, playing: false, duration: 2.4, intensity: 1 };
let renderScene, lastFrame = null;
const settings = () => ({ duration: state.duration, intensity: state.intensity });

for (const effect of EFFECTS) {
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'effect'; button.dataset.effect = effect.id;
  button.setAttribute('aria-pressed', 'false');
  button.setAttribute('aria-label', `${effect.name}, Motion Prompt number ${effect.id}`);
  button.append(makeThumbnail(effect));
  const caption = document.createElement('span'); caption.className = 'effect-caption';
  const number = document.createElement('span'); number.textContent = `#${effect.id} / ${effect.pack}`;
  const name = document.createElement('strong'); name.textContent = effect.name;
  caption.append(number, name); button.append(caption);
  button.addEventListener('click', () => select(effect.id));
  button.addEventListener('keydown', event => {
    const direction = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : ['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 0;
    if (!direction) return;
    event.preventDefault();
    const index = EFFECTS.indexOf(effect);
    const next = EFFECTS[(index + direction + EFFECTS.length) % EFFECTS.length];
    select(next.id); $(`[data-effect="${next.id}"]`).focus();
  });
  $('#effects').append(button);
}

function updateBrief() {
  $('#prompt').value = makePrompt(state.effect, settings());
  $('#copy-status').textContent = 'Ready to copy. You can also select the text.';
}

function render() {
  renderScene(state.time, settings());
  $('#seek').max = state.duration; $('#seek').value = state.time;
  $('#seek').setAttribute('aria-valuetext', `${state.time.toFixed(2)} of ${state.duration.toFixed(2)} seconds`);
  $('#time').textContent = `${state.time.toFixed(2)} / ${state.duration.toFixed(2)} s`;
  $('#mode').textContent = state.playing ? 'PLAYING' : state.time === state.duration ? 'AT REST' : 'PAUSED';
  $('#play').innerHTML = `${state.playing ? 'Ⅱ' : '▶'} <span>${state.playing ? 'Pause' : 'Play'}</span>`;
  $('#play').setAttribute('aria-label', state.playing ? 'Pause motion' : 'Play motion');
  $('#duration-output').textContent = `${state.duration.toFixed(1)} s`;
  $('#intensity-output').textContent = `${state.intensity.toFixed(2)}×`;
}

function select(query) {
  const effect = resolveEffect(query);
  state.effect = effect.id; state.playing = false; state.time = state.duration * 0.52; lastFrame = null;
  for (const button of $('#effects').children) button.setAttribute('aria-pressed', String(button.dataset.effect === effect.id));
  $('#effect-title').textContent = effect.name; $('#effect-id').textContent = `${effect.pack.toUpperCase()} / #${effect.id}`;
  $('#scene-title').textContent = `${effect.name} motion preview`;
  $('#tagline').textContent = effect.tagline; $('#description').textContent = effect.description;
  $('#intensity-label').textContent = effect.parameterLabel;
  $('#source-link').href = effect.source;
  renderScene = createScene($('#motion'), effect);
  render(); updateBrief();
}

function seek(time) {
  if (!Number.isFinite(time)) throw new TypeError('Time must be finite');
  state.playing = false; state.time = Math.max(0, Math.min(state.duration, time)); lastFrame = null; render();
}
function toggle() {
  if (state.time === state.duration) state.time = 0;
  state.playing = !state.playing; lastFrame = null; render();
}
function replay() { state.time = 0; state.playing = true; lastFrame = null; render(); }

$('#play').addEventListener('click', toggle);
$('#replay').addEventListener('click', replay);
$('#seek').addEventListener('input', event => seek(Number(event.target.value)));
for (const key of ['duration', 'intensity']) {
  $(`#${key}`).addEventListener('input', event => {
    const progress = state.time / state.duration;
    const next = validateSettings({ ...settings(), [key]: Number(event.target.value) });
    Object.assign(state, next); state.time = progress * state.duration; state.playing = false; lastFrame = null;
    render(); updateBrief();
  });
}
$('#stage').addEventListener('keydown', event => {
  if (![' ', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  if (event.key === ' ') toggle();
  else if (event.key === 'Home') seek(0);
  else if (event.key === 'End') seek(state.duration);
  else seek(state.time + (event.key === 'ArrowRight' ? 0.1 : -0.1));
});
$('#copy').addEventListener('click', async () => {
  const value = $('#prompt').value;
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(value);
    $('#copy-status').textContent = 'Prompt copied. Paste it into your project or conversation.';
  } catch {
    $('#prompt').focus(); $('#prompt').select();
    $('#copy-status').textContent = 'Text selected. Press Ctrl+C or ⌘C to copy, or use your device’s Copy command.';
  }
});

function reducedChanged() {
  if (reduced.matches) { state.playing = false; lastFrame = null; }
  $('#motion-note').textContent = reduced.matches ? 'Reduced motion is on. Playback starts only when you ask.' : '';
  render();
}
reduced.addEventListener('change', reducedChanged);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { state.playing = false; lastFrame = null; render(); }
});
function tick(now) {
  if (state.playing && !document.hidden) {
    if (lastFrame !== null) state.time = Math.min(state.duration, state.time + Math.min((now - lastFrame) / 1000, 0.1));
    if (state.time === state.duration) state.playing = false;
    render();
  }
  lastFrame = state.playing ? now : null;
  requestAnimationFrame(tick);
}
select(state.effect); reducedChanged(); requestAnimationFrame(tick);
window.__cue = Object.freeze({ getState: () => ({ ...state, reducedMotion: reduced.matches, ready: true }), select, seek });
