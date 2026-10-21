# LEAF / Paper Lab

An original interactive book about adding waves: three chapters, a deterministic SVG illustration, a seekable 48-second lesson, a phase experiment, a transcript, optional browser speech, and a knowledge check. It adapts the book-authoring workflow described by [DozenTwelve/Papermorph](https://github.com/DozenTwelve/Papermorph); it does not bundle or run that project's engine, schemas, TTS, or extraction scripts.

## Run

From the Taster repository or generated project root:

```sh
npm install
npm start
npm test
npm run build
```

Open `/taster/examples/paper-lab/` on the printed local server. The static build is `dist/examples/paper-lab/index.html`; serve `dist/` over HTTP. The runtime uses local SVG, `kit/motion.mjs`, and bundled fonts. No network request is needed to read or animate the lesson. Optional browser speech may use a local or remote voice depending on the browser; it is never needed for the content or exercises.

Create an editable standalone copy:

```sh
node /absolute/path/to/taster/scripts/create-project.mjs /absolute/path/to/my-book --template paper-lab
```

## Read and explore

- Select **One wave**, **Add the waves**, or **Change the phase** to jump to a chapter.
- **Play lesson**, **Pause lesson**, **Replay lesson**, restart, timeline, and 0.5×/1×/2× speeds control the animation. Playback starts paused.
- Focus the book itself, then use Space to play/pause, ←/→ to seek four lesson seconds, or Home/End for the endpoints. Buttons and sliders retain their native keyboard behavior.
- Change **Phase of wave B**, or choose the **0° / 90° / 180°** presets. This opens chapter three and pauses with that exact phase. Playing then keeps that chosen phase while the waves travel. Seeking restores the authored phase progression; replay restores the whole lesson.
- Answer **Did it click?** and choose **Check my answer** for explanatory feedback. Wrong answers remain retryable.
- Open **Read, listen & look closer** for all three transcripts, equations, limitations, source links, and optional **Read current chapter aloud**. Reading pauses the visual timeline and does not claim word-by-word audio synchronization. Stop reading, seek, or change chapters to cancel speech. An unavailable voice leaves the transcript usable.

The animation starts paused under reduced motion and pauses when the page is hidden. Narration and controls use semantic HTML; the diagram includes an accessible name and description. At 390 px, the book pages stack vertically.

## Model and sources

The original lesson uses two same-direction sinusoidal waves in an ideal linear medium:

```text
y₁(x,t) = A sin(2πx/λ − 2πft)
y₂(x,t) = A sin(2πx/λ − 2πft + φ)
y = y₁ + y₂
amplitude of y = 2A |cos(φ/2)|
```

`A = 1 cm`, `λ = 4 m`, and `f = 0.25 Hz`. The plot spans `0–8 m`; all three traces use `24 SVG units/cm`. Model time is lesson time divided by four, slowing the wave's motion for inspection. Playback speed further scales lesson time. The input phase is bounded to `0–180°`. The 201 sample points are display samples, not a numerical propagation solver. There are no boundaries, reflections, dissipation, nonlinear terms, or energy calculation; cancellation of displacement does not establish energy destruction.

The scientific reference is [OpenStax, University Physics Volume 1, §16.5, Interference of Waves](https://openstax.org/books/university-physics-volume-1/pages/16-5-interference-of-waves). Text, examples, and SVG drawings here are original. No PDF, source-page image, extracted book text, generated voice track, or upstream code is included. Upstream workflow and source section checked October 2026.

For adapting supplied books or stories, read Taster's [interactive-book workflow guide](https://github.com/josoroma/taster/blob/main/references/interactive-books.md). Record actual source page/section references for the supplied edition; this example is an original lesson and does not invent source pagination.

## Editing and verification

- `src/model.mjs`: chapters, original narration, units, deterministic samples, and quiz rule.
- `index.html`: semantic reader, SVG, controls, and visible source notes.
- `main.mjs`: one animation loop, transport, speech fallback, keyboard handling, and quiz feedback.
- `style.css`: responsive editorial book layout using bundled fonts.

`window.__paperLab.stats()` exposes lesson time, playback, phase, amplitude, chapter, and reduced-motion state. `seek(seconds)` pauses and restores the authored phase. `setPhase(degrees)` opens the experiment; `pause()` preserves the current state. These hooks are optional inspection helpers.

The pure tests cover constructive/destructive interference, quarter-cycle phase, matching diagram samples, timeline boundaries, reverse-seek determinism, out-of-range inputs, periodicity, and quiz feedback. The browser action file is `tests/browser/paper-lab.actions.json`; run it with `scripts/drive.mjs` at desktop and mobile widths, including `--reduced`. It checks navigation, keyboard, playback/pause, phase presets, timeline dragging, reset, quiz retry/success, transcript, layout width, and captures the book. Browser speech voices need device-specific listening review; the transcript is the canonical narration.
