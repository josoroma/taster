# CUE — A little motion vocabulary

Pick a movement, inspect its timing, and carry a precise direction into your next project. CUE is an original Taster SVG example informed by [Motion Prompt](https://github.com/showheyohtaki/motion-prompt), the motion vocabulary library by Shohei Ohtaki.

It implements six local interpretations, with stable upstream identities:

| Name | Global ID | Pack | Local number / slug |
| --- | --- | --- | --- |
| Pop-in | `001` | `motion` | `01` / `pop-in` |
| Stagger | `002` | `motion` | `02` / `stagger` |
| Mask reveal | `005` | `motion` | `05` / `mask-reveal` |
| Overshoot | `010` | `motion` | `10` / `overshoot` |
| Anticipation | `121` | `motion2` | `01` / `anticipation` |
| Motion path | `126` | `motion2` | `06` / `motion-path` |

This is a small local subset. It does not install Motion Prompt, import its runtime, reproduce its full catalog, or match its exact demo geometry and timing. The SVG code and descriptive copy are original; names and identifiers preserve attribution. Upstream is MIT licensed. If reusing upstream code later, retain its license and author notices with that code.

## Run and explore

From the Taster repository root, run `npm start` and open `http://localhost:5173/taster/examples/motion-lab/`. The example itself has no external runtime dependency or network requests. An independently generated project uses its generated `npm start` command.

- Select a card to inspect a paused representative pose. Arrow keys on a card choose adjacent cards.
- Play or pause the selected move. Replay starts a new pass; playback stops at the endpoint.
- Scrub the time slider in either direction. Duration changes preserve the current fractional position; parameter edits pause the preview.
- Focus the preview and use Space to play/pause, Left/Right to seek by 0.1 seconds, Home for the beginning, or End for the final pose.
- Copy the generated brief. If clipboard permission or capability is unavailable, the text is selected and manual copy instructions appear.

The preview always begins paused, including under reduced motion. Explicit playback remains available. Hidden tabs pause and do not catch up on return. The narrow layout uses the same six selections, controls, and model.

## Source and interpretation

`src/model.mjs` exports the local catalog, ID resolver, parameter validation, pure samplers, and prompt builder. `src/scene.mjs` constructs each SVG once and updates geometry from the model. `main.mjs` owns selection and one playback loop. `manifest.json` records provenance and the subset. Every pose depends only on the effect, absolute time, duration, and intensity; no previous frame is needed.

Duration ranges from 0.6 to 6 seconds; intensity ranges from 0.25× to 1.75×. Its meaning is specific to the selected move: arrival strength, bar overshoot, reveal travel, overshoot amount, wind-up distance, or path curvature. The generated brief includes the actual numeric recipe and the upstream source/spec link. Motion path uses a linear Bézier parameter, so its speed along the path varies.

Reviewed October 20, 2026 against [upstream commit `36f5bda`](https://github.com/showheyohtaki/motion-prompt/tree/36f5bdacb1e012eb00caf30741d2e2223ee514b4), API `v1`, catalog version `1.45af2a203e`. The [upstream format](https://github.com/showheyohtaki/motion-prompt/blob/36f5bdacb1e012eb00caf30741d2e2223ee514b4/FORMAT.md) distinguishes global ID, pack, local number, and slug. See [Taster's motion vocabulary guide](https://github.com/josoroma/taster/blob/main/references/motion-vocabulary.md) for applying names to another renderer or resolving entries outside this subset.

Local DM Sans and Italiana fonts are shared with the Taster showcase. Keep their OFL files when distributing generated projects with the fonts. No upstream fonts or art are copied.

## Verification

```sh
node --test tests/motion-lab.test.mjs
node scripts/drive.mjs http://localhost:5173/taster/examples/motion-lab/ --actions tests/browser/motion-lab.actions.json --width 1440 --height 1100
node scripts/drive.mjs http://localhost:5173/taster/examples/motion-lab/ --actions tests/browser/motion-lab.actions.json --width 390 --height 844 --reduced
```

Tests check source resolution, invalid settings, finite geometry, duration scaling, exact endpoints, delay order, real overshoot, wind-up direction, path heading, and generated prompt constraints. Browser actions check paused initialization, deterministic reverse seeking, playback, pause, keyboard selection/seeking, settings, endpoint replay, and the clipboard fallback. `window.__cue.getState()`, `.select(id)`, and `.seek(seconds)` expose the same model for reproducible browser checks.
