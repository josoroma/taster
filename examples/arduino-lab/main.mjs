import { DEFAULTS, PROJECTS, normalizeConfig, evaluate, createSketch, sketchFilename } from './src/model.mjs';

const $ = selector => document.querySelector(selector);
const media = matchMedia('(prefers-reduced-motion: reduce)');
let config = normalizeConfig(), elapsedMs = 0, knob = DEFAULTS.knob, pressed = false, playing = false, selectedPart = 'board', ready = false;
const names = { lighthouse: 'Moonbeam lighthouse', signal: 'Fort-to-fort signal', firefly: 'Midnight firefly' };
const parts = {
  board: { number: '00', title: 'The board makes the decisions.', copy: 'An Arduino Uno R3 reads the knob and button, follows your code, and tells the LED what to do. The same circuit can become three very different inventions.', code: 'read → decide → write' },
  led: { number: '01', title: 'A light with a right way round.', copy: 'The LED has an anode (+) and cathode (−). D9 sends PWM through a 330 Ω resistor to the anode; the cathode goes to GND. The resistor limits current. PWM changes average brightness by switching quickly.', code: 'D9 → 330 Ω → LED → GND' },
  button: { number: '02', title: 'Pressed means LOW. Here’s why.', copy: 'The code enables the Uno’s internal pull-up resistor. With the switch open, D2 reads HIGH. Holding the switch connects D2 to ground, so it reads LOW. The signal sketch uses LOW as “light on.”', code: 'pinMode(2, INPUT_PULLUP)' },
  knob: { number: '03', title: 'A turn becomes a number.', copy: 'The 10k Ω potentiometer divides the voltage between 5V and GND. Its centre wiper goes to A0. The Uno turns that input into 0–1023, and our code scales it to 0–255 for D9 PWM.', code: 'PWM = (A0 × 255) ÷ 1023' },
};
function announce(message) { $('#announcer').textContent = message; }
function syncSketch() { $('#sketch').textContent = createSketch(config); }
function syncPlayback() {
  $('#play').textContent = playing ? 'Ⅱ Pause' : '▶ Try it';
  $('#play').setAttribute('aria-pressed', String(playing));
  $('#play-state').textContent = playing ? 'TRYING YOUR IDEA' : elapsedMs ? 'PAUSED · LOOK CLOSER' : 'READY TO TRY';
}
function pause() { playing = false; syncPlayback(); }
function render() {
  const state = evaluate(config, { elapsedMs, knob, pressed });
  $('#cycle-value').textContent = `${(config.cycleMs / 1000).toFixed(1)} sec`;
  $('#knob-value').textContent = `${Math.round(knob / 1023 * 100)}%`;
  $('#knob').setAttribute('aria-valuetext', `${Math.round(knob / 1023 * 100)} percent brightness, analog reading ${knob}`);
  $('#cycle').setAttribute('aria-valuetext', `${(config.cycleMs / 1000).toFixed(1)} seconds per cycle`);
  $('#adc-readout').innerHTML = `${knob}<span> / 1023</span>`;
  $('#button-readout').innerHTML = `${state.buttonRead}<span> ${pressed ? 'pressed' : 'released'}</span>`;
  $('#pwm-readout').innerHTML = `${state.pwm}<span> / 255 PWM</span>`;
  $('#pwm-fill').style.width = `${state.duty * 100}%`;
  $('#led-glow').setAttribute('opacity', state.duty);
  $('#led-core').setAttribute('opacity', state.duty);
  $('#led-bulb').style.filter = `saturate(${.45 + state.duty * .75}) brightness(${.75 + state.duty * .35})`;
  $('#knob-needle').setAttribute('transform', `rotate(${-180 + knob / 1023 * 270} 0 -4)`);
  $('#hold-button').setAttribute('aria-pressed', String(pressed));
  $('#button-plunger').setAttribute('transform', pressed ? 'translate(0 5)' : '');
  $('#elapsed').textContent = `${(elapsedMs / 1000).toFixed(2)} sec`;
  $('#time-fill').style.width = config.project === 'signal' ? '0%' : `${state.phase / config.cycleMs * 100}%`;
  return state;
}
function setPressed(value) { pressed = Boolean(value); render(); }
function selectProject(project) {
  const previous = config.project;
  const name = config.name === names[previous] || config.name === DEFAULTS.name ? names[project] : config.name;
  config = normalizeConfig({ ...config, project, name });
  elapsedMs = 0; pressed = false; pause();
  for (const button of document.querySelectorAll('[data-project]')) button.setAttribute('aria-pressed', String(button.dataset.project === project));
  $('#invention-name').value = name;
  $('#idea').textContent = PROJECTS[project].idea; $('#rule').textContent = PROJECTS[project].rule;
  $('#imagination').textContent = PROJECTS[project].prompt;
  $('#cycle').disabled = project === 'signal'; $('#cycle-note').hidden = project !== 'signal';
  $('#button-note').textContent = project === 'signal' ? 'Hold to send light. Release to go quiet.' : 'The button joins in when you choose Secret signal.';
  $('#prediction-question').textContent = PROJECTS[project].prediction;
  $('#prediction-choices').replaceChildren();
  for (const [value, label] of PROJECTS[project].choices) {
    const wrapper = document.createElement('label'), radio = document.createElement('input');
    radio.type = 'radio'; radio.name = 'prediction'; radio.value = value;
    wrapper.append(radio, document.createTextNode(label)); $('#prediction-choices').append(wrapper);
  }
  $('#prediction-feedback').textContent = 'Choose what you think will happen. Every guess is useful.';
  $('#download-status').textContent = 'Your chosen project, name, and cycle time go into the file. The real knob sets brightness.';
  syncSketch(); render(); announce(`${PROJECTS[project].title} selected. ${PROJECTS[project].rule}`);
}
for (const button of document.querySelectorAll('[data-project]')) button.addEventListener('click', () => selectProject(button.dataset.project));
$('#invention-name').addEventListener('input', event => { config = normalizeConfig({ ...config, name: event.target.value }); syncSketch(); });
$('#cycle').addEventListener('input', event => { config = normalizeConfig({ ...config, cycleMs: Number(event.target.value) }); pause(); elapsedMs = 0; syncSketch(); render(); });
$('#knob').addEventListener('input', event => { knob = Number(event.target.value); render(); });
$('#play').addEventListener('click', () => { playing = !playing; syncPlayback(); announce(playing ? 'Trying your invention' : 'Invention paused'); });
$('#step').addEventListener('click', () => { pause(); elapsedMs += 250; syncPlayback(); render(); announce(`Moved to ${(elapsedMs / 1000).toFixed(2)} seconds`); });
$('#reset').addEventListener('click', () => {
  elapsedMs = 0; knob = DEFAULTS.knob; pressed = false; config = normalizeConfig({ ...config, cycleMs: DEFAULTS.cycleMs });
  $('#knob').value = knob; $('#cycle').value = config.cycleMs; pause(); syncSketch(); render(); announce('Reset to the beginning, with the original brightness and cycle time');
});
const heldButton = $('#hold-button');
heldButton.addEventListener('pointerdown', event => { if (event.button !== 0) return; event.preventDefault(); heldButton.focus(); heldButton.setPointerCapture(event.pointerId); setPressed(true); });
heldButton.addEventListener('pointerup', () => setPressed(false));
heldButton.addEventListener('pointercancel', () => setPressed(false));
heldButton.addEventListener('lostpointercapture', () => setPressed(false));
heldButton.addEventListener('keydown', event => { if ([' ', 'Enter'].includes(event.key)) { event.preventDefault(); setPressed(true); } });
heldButton.addEventListener('keyup', event => { if ([' ', 'Enter'].includes(event.key)) { event.preventDefault(); setPressed(false); } });
heldButton.addEventListener('blur', () => setPressed(false));
window.addEventListener('blur', () => { setPressed(false); pause(); });
function selectPart(part) {
  selectedPart = part;
  for (const button of document.querySelectorAll('[data-part]')) button.setAttribute('aria-pressed', String(button.dataset.part === part));
  for (const group of document.querySelectorAll('.circuit-part')) group.classList.toggle('is-selected', group.id === `${part}-part`);
  $('#part-number').textContent = parts[part].number; $('#part-title').textContent = parts[part].title;
  $('#part-copy').textContent = parts[part].copy; $('#part-code').textContent = parts[part].code;
  announce(parts[part].title);
}
for (const button of document.querySelectorAll('[data-part]')) button.addEventListener('click', () => selectPart(button.dataset.part));
$('#prediction').addEventListener('submit', event => {
  event.preventDefault();
  const answer = $('input[name=prediction]:checked');
  if (!answer) { $('#prediction-feedback').textContent = 'Pick a guess first, then let’s see what happens.'; return; }
  pause();
  if (config.project !== 'signal') elapsedMs = config.cycleMs / 2;
  const correct = answer.value === PROJECTS[config.project].answer;
  const followup = config.project === 'signal' ? ' Hold the circuit button above and watch D2 change.' : ' The preview is paused at half a cycle so you can inspect the result.';
  $('#prediction-feedback').textContent = `${correct ? 'You got it.' : 'A useful discovery!'} ${PROJECTS[config.project].explain}${followup}${knob === 0 && config.project !== 'signal' ? ' Your knob is at zero: turn it up to see the difference.' : ''}`;
  syncPlayback(); render();
});
for (const box of document.querySelectorAll('[data-wire]')) box.addEventListener('change', () => {
  const count = document.querySelectorAll('[data-wire]:checked').length;
  $('#wiring-count').textContent = `${count} / 3 CHECKED`;
  announce(`${count} of 3 wiring-plan steps checked. These do not test real connections.`);
});
$('#download').addEventListener('click', () => {
  const sketch = createSketch(config), blob = new Blob([sketch], { type: 'text/plain;charset=utf-8' }), url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = sketchFilename(config); document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  $('#download-status').textContent = `Downloaded ${sketchFilename(config)}. Open it in Arduino IDE with a grown-up, select Uno R3, and verify before uploading.`;
});
media.addEventListener('change', event => { if (event.matches) { pause(); announce('Motion preference changed. The invention is paused; step through at your own pace.'); } });
document.addEventListener('visibilitychange', () => { if (document.hidden) { pause(); setPressed(false); } last = performance.now(); });
selectProject(DEFAULTS.project); selectPart('board'); ready = true;
window.__arduinoLab = {
  get ready() { return ready; },
  seek(ms) { evaluate(config, { elapsedMs: ms, knob, pressed }); pause(); elapsedMs = ms; syncPlayback(); render(); },
  stats: () => ({ ready, config: { ...config }, elapsedMs, knob, pressed, playing, selectedPart, reducedMotion: media.matches, wiring: document.querySelectorAll('[data-wire]:checked').length, model: evaluate(config, { elapsedMs, knob, pressed }), sketch: createSketch(config), filename: sketchFilename(config) }),
};
let last = performance.now();
function frame(now) {
  const delta = Math.min(100, Math.max(0, now - last)); last = now;
  if (playing && !document.hidden) { elapsedMs += delta; render(); }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
