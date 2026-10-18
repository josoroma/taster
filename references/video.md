# Video and deterministic motion

Use this workflow when the requested deliverable is a film, video, motion graphic, or animated diagram intended for export. Keep a playable browser experience interactive when the request is interactive; a movie alone is not an interaction.

## Choose the story and delivery

Define the audience, one takeaway, duration, aspect ratio, frame rate, audio plan, and delivery file. Make a concise sequence with an opening question, a reveal, evidence, and a closing thought. A scene should develop over time: reveal a relationship, assemble a mechanism, follow a signal, or move between explanatory scales. Avoid filling the timeline with unrelated static cards.

Carry the product's established identity into the frame. For Taster, use paper `#f3f2eb`, ink `#273026`, accent `#d9ed92`, dark `#1b231d`, the existing logo geometry, DM Sans, and Italiana. Set generous title scale, restrained labels, and readable captions. A silent film should communicate its entire story without assuming a soundtrack. If audio is needed, use licensed or user-provided assets and describe any synthetic narration honestly.

## Author a real renderable composition

[HyperFrames](https://github.com/heygen-com/hyperframes) renders HTML/CSS and seekable animation to video. Follow its [composition contract](https://github.com/heygen-com/hyperframes/blob/main/skills/hyperframes-core/references/determinism-rules.md), not an invented export API. The included example is verified with `hyperframes@0.8.171`; pin a tested version in reproduction commands and check the current official documentation before adapting a newer release.

- A standalone composition root sits directly in `<body>` and declares `data-composition-id`, `data-width`, `data-height`, `data-duration`, and `data-fps`. Set its CSS width/height to `100%`; the renderer applies the authored frame size.
- Declare timed scene elements with `class="clip"`, `data-start`, `data-duration`, and `data-track-index`. Track indices organize clips; they do not create animation. Keep scene windows and the tested model timeline consistent.
- Use a paused GSAP timeline keyed by the composition ID, a supported animation adapter, or the runtime's `hf-seek` event to redraw a procedural SVG/canvas/Three.js scene from `event.detail.time`. The example uses the latter, with no additional animation library; `data-no-timeline` on its root explicitly opts out of the GSAP registry requirement. Official adapter details: [seek dispatch](https://github.com/heygen-com/hyperframes/blob/main/packages/core/src/runtime/adapters/seek-dispatch.ts) and [Three.js adapter](https://github.com/heygen-com/hyperframes/blob/main/packages/core/src/runtime/adapters/three.ts).
- Derive all geometry, labels, camera poses, opacity, and simulation state from absolute time. A frame sought after the ending must equal the same frame sought from the beginning. Do not increment rotation or accumulate simulation history during export. For a simulation, precompute or reconstruct its state deterministically.
- Keep clocks and playback controls in a separate browser preview. The render composition must not depend on `requestAnimationFrame`, wall-clock time, unseeded randomness, hover, scroll, or pointer state. For history-dependent effects, cache deterministic source frames or use an explicit reconstruction method.
- Package all fonts, media, models, and textures locally. Await fonts and image decoding before declaring readiness. Fetch assets before authoring or rendering, never inside frame seeking. Keep licenses alongside bundled assets.
- Let HyperFrames own `<video>` and `<audio>` playback and clip visibility. Give audio an ID and timing; do not place timed video under another timed plain ancestor. Avoid decorative animation that continues past the declared endpoint.

## Preview, export, and inspect

Provide play/pause, scrub, restart, chapter navigation, and keyboard inspection in the browser preview. Pause playback when hidden; use no unsolicited playback under reduced motion. Keep all UI outside the exported composition.

For a video requested by the user, complete the requested local render. A separate decision is needed only for an unauthorized external action such as publishing or uploading. Local rendering does not require an account or hosted service.

Use the [official CLI](https://github.com/heygen-com/hyperframes/blob/main/skills/hyperframes-cli/SKILL.md) to lint and check the composition, inspect representative snapshots, render an actual MP4, and inspect decoded video frames. `check` includes lint; a successful encode alone does not prove the intended motion appeared. Test opening, closing, scene midpoints, and adjacent frames at every cut. Verify duration, resolution, frame rate, codec, and nonempty output with `ffprobe`. Verify browser console errors, narrow layout, keyboard controls, pause, reverse seek, and replay.

Deliver the MP4, editable composition and assets, exact pinned render commands, and any material limitations. Distinguish a local file from a published video. Do not claim sound, scientific simulation, or interaction that the delivered artifact lacks.

## Working example

[`examples/taster-film/`](../examples/taster-film/) contains a 28-second, 1280 × 720, 30 fps Taster identity film, a responsive playable source preview, a self-contained HyperFrames composition, pure timeline model, and local MP4. The molecule motif is explicitly illustrative, not a scientific dataset. Run from the repository:

```sh
node examples/taster-film/render.mjs check
node examples/taster-film/render.mjs render
```

The wrapper invokes the pinned CLI without changing the root dependency tree. Node.js 22+, FFmpeg, and a compatible Chrome/Chromium installation are required. First use downloads the CLI through npm. See the example's production notes for the storyboard, full command, verification results, and asset licenses.
