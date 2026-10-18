# Ideas, made explorable

A 28-second Taster identity film with a [playable browser preview](https://josoroma.github.io/taster/examples/taster-film/) and a [rendered MP4](https://josoroma.github.io/taster/examples/taster-film/taster-film.mp4). The original Taster mark, paper-and-ink palette, DM Sans, and Italiana carry through the entire film. It is intentionally silent; captions contain the complete story.

The browser preview has play/pause, scrub, restart, and chapter buttons. Space toggles playback when the page itself has focus; left/right arrows step one frame; Shift+left/right steps one second. Chapter buttons open 1.1 seconds into a chapter so its entrance has settled. Playback pauses when the page is hidden and never starts automatically. A readable caption also appears below the film on narrow screens.

## Run the source

From the repository root, run `npm install` and `npm start`, then open the address printed by the server and choose **Taster, in motion** from the example catalog.

## Deliverables

- `taster-film.mp4` — H.264, 1280 × 720, 30 fps, 28 seconds, 840 frames, no audio track.
- `index.html`, `style.css`, `main.mjs` — responsive source preview and accessible playback controls.
- `composition/index.html` — standalone HyperFrames composition with explicit frame size, duration, frame rate, timed clips, and `data-no-timeline` for its procedural seek adapter.
- `composition/film.mjs`, `film.css`, `model.mjs` — editable vector artwork, motion, typography, and pure timeline model. `src/model.mjs` re-exports the same model for tests.
- `composition/assets/` — local fonts, font licenses, and the Taster logo. The dark logo only changes colors; the mark's geometry is preserved.
- `render.mjs` — pinned HyperFrames command wrapper; no additions to the root package dependencies.

## Reproduce the render

Requirements: Node.js 22+, FFmpeg on `PATH`, and compatible Chrome/Chromium. The first command downloads `hyperframes@0.8.171` through npm if it is not already cached. Assets are bundled locally, and no account or cloud renderer is used.

```sh
# Run these from the Taster repository root.
node examples/taster-film/render.mjs check
node examples/taster-film/render.mjs snapshot
node examples/taster-film/render.mjs render

# Inspect the encoded file.
ffprobe -v error -select_streams v:0 \
  -show_entries stream=codec_name,width,height,r_frame_rate,nb_frames,duration \
  -of json examples/taster-film/taster-film.mp4

# Pure model / timeline / cut-boundary checks.
node --test tests/taster-film.test.mjs

# Browser transport and reverse-seek regression; run the local server first.
node scripts/drive.mjs http://127.0.0.1:5173/taster/examples/taster-film/ \
  --actions tests/browser/taster-film.actions.json --width 390 --height 844 --reduced
```

The render wrapper executes this command in `examples/taster-film/composition/` (the output argument is resolved to an absolute local path by the wrapper):

```sh
npx --yes --package hyperframes@0.8.171 -- hyperframes render \
  --fps 30 --quality looks --workers 2 --output ../taster-film.mp4
```

`node examples/taster-film/render.mjs preview` opens the official HyperFrames Studio preview. Extra arguments after the mode pass through to the CLI. The wrapper sets `DO_NOT_TRACK=1`. HyperFrames writes temporary checks and snapshots to `composition/.hyperframes/`; these are generated diagnostics and are not source assets.

## Storyboard

| Time | Idea | Motion |
| --- | --- | --- |
| 0–6 s | Make ideas explorable. | The Taster mark becomes the center of an orbiting network. |
| 6–13 s | A model makes the difference. | An assembly separates into three layers, reveals its moving center, and returns. |
| 13–21 s | From the tiny to the complex. | A rotating molecular motif, a signal following a diagram, and a moving video playhead show three forms. |
| 21–28 s | An experience. And the source. | Editable source appears line by line; the Taster mark accompanies the handoff. |

The helix, assembly, and code are explanatory brand motifs. The helix is not a chemical dataset, the assembly is not a physical simulation, and the code panel is an illustration of the handoff rather than executable application code.

## Determinism and verification

The film receives absolute seconds through HyperFrames' `hf-seek` event. Every visible state is reconstructed from that time. The preview's animation loop only advances this seek value; it is not shipped into the render composition. There is no render-time network request, random placement, wall-clock motion, or history-dependent integration. Fonts and images finish loading before the preview becomes ready.

The model tests cover all 840 frame indices, every cut, the endpoint, invalid seeks, reverse-seek equivalence, illustrative topology, and agreement between HTML metadata and the tested clock. HyperFrames `check` samples runtime/layout and contrast; decoded MP4 frames should be reviewed as well because a clean structural audit does not certify composition quality. The CLI gives advisory `nested_structure_needs_subcomposition` warnings for the four deliberately compact monolithic scenes; the film has no missing-timeline, runtime, layout, or contrast errors.

Verified delivery: all five Node tests pass; official HyperFrames check passes nine runtime/layout samples and all 73 contrast checks, with four scene-organization warnings. The browser fixture passes at 390 × 844 with reduced motion, including no autoplay, exact reverse-seek DOM equality, play/pause, a stable paused frame, settled chapter jumps, the readable caption, and replay from the endpoint; the console is clean. Desktop controls and layout were also inspected. `ffprobe` confirms H.264, 1280 × 720, 30/1 fps, 840 frames, and 28.000 seconds. Decoded frames were inspected at the opening, closing, every cut boundary, and all scene midpoints. The 1.8 MB file was rendered with screenshot capture on the hardware GPU.

Browser font rasterization and video encoder versions can change compressed bytes across platforms even with the same deterministic authored state.

## Provenance

- Video framework and rendering contract: [HyperFrames](https://github.com/heygen-com/hyperframes), Apache-2.0. The CLI is fetched as a pinned tool, not vendored into this repository.
- Seek adapter: [official runtime source](https://github.com/heygen-com/hyperframes/blob/main/packages/core/src/runtime/adapters/three.ts).
- Taster logo and palette: existing `assets/showcase/logo.svg` and showcase styles in this repository.
- DM Sans and Italiana: existing repository fonts; SIL Open Font License texts are included in `composition/assets/`.
- All scene artwork and procedural motion are editable local SVG/HTML/JavaScript; no external footage, narration, music, or generated bitmap media is required.
