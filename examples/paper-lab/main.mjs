import { createTransport } from '../../kit/motion.mjs';
import { CHAPTERS, DURATION, WAVE, QUIZ, sampleLesson, checkAnswer } from './src/model.mjs';
const $ = selector => document.querySelector(selector);
const clock = createTransport({ duration: DURATION });
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const speechAvailable = Boolean(window.speechSynthesis && typeof window.SpeechSynthesisUtterance === 'function');
let phaseOverride = null, chapterIndex = -1, previousTime = performance.now(), speaking = false, activeUtterance = null;
const timeLabel = value => `00:${String(Math.floor(value)).padStart(2, '0')}`;
CHAPTERS.forEach((chapter, index) => {
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'chapter-button'; button.dataset.chapter = index;
  button.innerHTML = `<span>0${index + 1}</span><strong>${chapter.short}</strong>`;
  button.addEventListener('click', () => seek(chapter.start)); $('#chapters').append(button);
  const article = document.createElement('article'); article.className = 'transcript-chapter';
  const title = document.createElement('h3'), link = document.createElement('button'), text = document.createElement('p');
  link.type = 'button'; link.textContent = `0${index + 1}. ${chapter.title}`; link.addEventListener('click', () => { seek(chapter.start); $('#reader').focus(); });
  text.textContent = chapter.transcript; title.append(link); article.append(title, text); $('#transcript-content').append(article);
});
$('#quiz-question').textContent = QUIZ.question;
QUIZ.answers.forEach((answer, index) => { const label = document.createElement('label'); label.className = 'answer'; const radio = document.createElement('input'); radio.type = 'radio'; radio.name = 'answer'; radio.value = index; radio.id = `answer-${index}`; label.append(radio, document.createTextNode(answer)); $('#answers').append(label); });
function stopReading(message = '') {
  const wasSpeaking = speaking; speaking = false; activeUtterance = null;
  if (speechAvailable && wasSpeaking) speechSynthesis.cancel();
  $('#stop-reading').disabled = true; $('#read-aloud').disabled = !speechAvailable;
  if (message) $('#speech-status').textContent = message;
}
function render() {
  const state = clock.getState(), sample = sampleLesson(state.time, phaseOverride);
  if (sample.chapterIndex !== chapterIndex) {
    chapterIndex = sample.chapterIndex; stopReading();
    $('#chapter-title').textContent = sample.chapter.lead; $('#chapter-kicker').textContent = sample.chapter.kicker;
    $('#chapter-body').textContent = sample.chapter.body; $('#takeaway').textContent = sample.chapter.takeaway;
    $('#page-number').textContent = `0${chapterIndex + 1} / 03`; $('#figure-number').textContent = `0${chapterIndex + 1}`;
    $('#svg-title').textContent = sample.chapter.title;
    if (state.playing) $('#status').textContent = `Chapter ${chapterIndex + 1}: ${sample.chapter.title}.`;
    $('#figure-caption').textContent = chapterIndex === 0 ? 'Follow the dot. It stays at x = 4 m.' : 'Same position. Same scale. Add the heights.';
    document.querySelectorAll('.chapter-button').forEach((button, index) => { button.classList.toggle('active', index === chapterIndex); if (index === chapterIndex) button.setAttribute('aria-current', 'step'); else button.removeAttribute('aria-current'); });
  }
  $('#svg-description').textContent = chapterIndex === 0 ? 'A one-centimetre sinusoidal wave travels right. The dot stays at position four metres and oscillates vertically. The next chapters reveal a second wave and the sum.' : `Three aligned wave traces at phase ${Math.round(sample.phase)} degrees. The sum has amplitude ${sample.amplitude.toFixed(2)} centimetres. Position runs from zero to eight metres; all three traces share the same displacement scale.`;
  const paths = [['a', 95], ['b', 215], ['sum', 335]];
  for (const [key, y] of paths) {
    $(`#wave-${key}`).setAttribute('d', sample.points.map((p, index) => `${index ? 'L' : 'M'}${(58 + p.x / WAVE.length * 560).toFixed(2)},${(y - p[key] * 24).toFixed(2)}`).join(' '));
    $(`#probe-${key}`).setAttribute('cy', (y - sample.points[100][key] * 24).toFixed(2));
    const visible = chapterIndex > 0 || key === 'a';
    $(`#wave-${key}`).style.opacity = visible ? 1 : 0; $(`#probe-${key}`).style.opacity = visible ? 1 : 0;
  }
  $('#label-b').textContent = chapterIndex ? 'WAVE B' : 'WAVE B · NEXT CHAPTER';
  $('#label-sum').textContent = chapterIndex ? 'A + B' : 'THE SUM · COMING NEXT';
  $('#scrubber').value = state.time; $('#scrubber').setAttribute('aria-valuetext', `${timeLabel(state.time)}. ${sample.chapter.short}.`);
  $('#time').textContent = `${timeLabel(state.time)} / 00:48`;
  $('#play').innerHTML = state.playing ? 'Ⅱ <span>Pause lesson</span>' : sample.finished ? '↶ <span>Replay lesson</span>' : '▶ <span>Play lesson</span>';
  $('#phase').value = sample.phase; $('#phase-value').textContent = `${Math.round(sample.phase)}°`;
  $('#amplitude').innerHTML = `${sample.amplitude.toFixed(2)} <small>cm</small>`;
  document.querySelectorAll('[data-phase]').forEach(button => button.setAttribute('aria-pressed', String(Math.abs(Number(button.dataset.phase) - sample.phase) < .01)));
  $('#motion-note').textContent = reduced.matches ? 'Reduced motion · play or seek when ready.' : 'Space: play / pause · arrows: seek';
}
function seek(seconds, resetPhase = true) {
  clock.pause(); clock.seek(seconds); if (resetPhase) phaseOverride = null; stopReading('Reading stopped. The transcript remains available.'); render();
  $('#status').textContent = `Chapter ${chapterIndex + 1}: ${CHAPTERS[chapterIndex].title}. Paused.`;
}
function toggle() {
  stopReading(); if (!clock.getState().playing && clock.getState().time >= DURATION) { clock.seek(0); phaseOverride = null; }
  clock.toggle(); render(); $('#status').textContent = clock.getState().playing ? 'Lesson playing.' : 'Lesson paused.';
}
function setPhase(degrees) {
  clock.pause(); if (clock.getState().time < 32) clock.seek(32); phaseOverride = Math.max(0, Math.min(180, Number(degrees))); stopReading(); render();
  $('#status').textContent = `Phase ${phaseOverride} degrees. Combined amplitude ${sampleLesson(clock.getState().time, phaseOverride).amplitude.toFixed(2)} centimetres.`;
}
$('#play').addEventListener('click', toggle); $('#restart').addEventListener('click', () => seek(0));
$('#scrubber').addEventListener('input', event => seek(Number(event.target.value)));
$('#speed').addEventListener('change', event => clock.setRate(Number(event.target.value)));
$('#phase').addEventListener('input', event => setPhase(event.target.value));
document.querySelectorAll('[data-phase]').forEach(button => button.addEventListener('click', () => setPhase(button.dataset.phase)));
$('#reader').addEventListener('keydown', event => {
  if (event.target !== $('#reader') || ![' ', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault(); if (event.key === ' ') toggle(); else seek(event.key === 'Home' ? 0 : event.key === 'End' ? DURATION : clock.getState().time + (event.key === 'ArrowRight' ? 4 : -4));
});
$('#quiz').addEventListener('submit', event => {
  event.preventDefault(); const chosen = $('#quiz input:checked'); const result = checkAnswer(chosen ? Number(chosen.value) : null);
  $('#quiz-feedback').textContent = result.message; $('#quiz-feedback').dataset.correct = result.correct;
  if (!result.valid) $('#answer-0').focus();
});
$('#read-aloud').disabled = !speechAvailable;
if (!speechAvailable) $('#speech-status').textContent = 'This browser has no speech voice. Read the complete transcript below.';
$('#read-aloud').addEventListener('click', () => {
  if (!speechAvailable) return; clock.pause(); stopReading(); render();
  const utterance = new SpeechSynthesisUtterance(CHAPTERS[chapterIndex].transcript); utterance.lang = 'en-US'; utterance.rate = .95;
  speaking = true; activeUtterance = utterance; $('#read-aloud').disabled = true; $('#stop-reading').disabled = false;
  $('#speech-status').textContent = 'Reading the current chapter. Playback is paused; voice availability depends on your browser.';
  utterance.onend = () => { if (activeUtterance === utterance) stopReading('Chapter reading complete.'); };
  utterance.onerror = () => { if (activeUtterance === utterance) stopReading('The browser voice is unavailable. The complete transcript is below.'); };
  try { speechSynthesis.speak(utterance); } catch { stopReading('The browser voice is unavailable. The complete transcript is below.'); }
});
$('#stop-reading').addEventListener('click', () => stopReading('Reading stopped.'));
document.addEventListener('visibilitychange', () => { if (document.hidden) { clock.pause(); stopReading(); render(); } previousTime = performance.now(); });
reduced.addEventListener('change', () => { clock.pause(); render(); });
function frame(now) { const dt = Math.min(.1, Math.max(0, (now - previousTime) / 1000)); previousTime = now; if (clock.getState().playing) { clock.update(dt); render(); } requestAnimationFrame(frame); }
window.__paperLab = { ready: true, stats: () => ({ ...clock.getState(), chapterIndex, phase: sampleLesson(clock.getState().time, phaseOverride).phase, amplitude: sampleLesson(clock.getState().time, phaseOverride).amplitude, reducedMotion: reduced.matches, speechAvailable, speaking }), seek, setPhase, pause: () => { clock.pause(); render(); } };
render(); requestAnimationFrame(frame);
