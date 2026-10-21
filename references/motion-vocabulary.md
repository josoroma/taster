# Motion vocabulary

Use this workflow when the user names a movement, points to a motion sample, asks for a motion library, or requests support for [Motion Prompt](https://github.com/showheyohtaki/motion-prompt). Translate the chosen term into a bounded, inspectable behavior in the project's renderer. A vocabulary reference does not require installing a new framework.

Motion Prompt, by Shohei Ohtaki, pairs named visual techniques with samples and machine-readable identity. It includes more than motion graphics: camera, UI, landing-page, and photography vocabulary also appear. Read the selected entry before deciding whether it changes an object, camera, layout, transition, or image treatment. Avoid treating every entry as an object transform.

## Resolve the reference

1. Prefer a global three-digit ID or the original demo link. `#001` identifies Pop-in; pack-local `01` alone is insufficient because multiple packs have an entry 01.
2. Otherwise resolve the pack plus slug or exact published name against `api/v1/catalog.json`, or read `packs/<pack>/meta.json`. Keep `{id, pack, no, slug, name}` together. A name can be ambiguous across fields: an object following a curve is distinct from an orbiting camera. Inspect the pack and spec; ask for the intended subject only if context does not resolve it.
3. Read the selected language's spec at `api/v1/en/e/<id>.txt` (Japanese uses `ja`) and inspect the linked sample as useful. The upstream copyable prompt is `api/v1/en/p/<id>.txt`. Resolve only the requested entries instead of treating the whole catalog as a design requirement.
4. For a request outside the bundled subset, inspect the upstream entry and implement it within the current project. Do not silently relabel a nearby local effect or imply that CUE contains the complete catalog. Record the source URL, inspected revision/version, and interpretation boundaries.

The [format inspected on October 20, 2026](https://github.com/showheyohtaki/motion-prompt/blob/36f5bdacb1e012eb00caf30741d2e2223ee514b4/FORMAT.md) defines API `v1`. Its catalog version is a generated value; the inspected snapshot is `1.45af2a203e` at commit `36f5bdacb1e012eb00caf30741d2e2223ee514b4`. `FORMAT.md` does not declare a separate semantic format version. Recheck the current catalog when resolving a new upstream selection rather than relying on a remembered count or list of packs.

## Convert the selection into a brief

Specify the subject, property, direction or path, duration, delay order, easing, amount, initial/final poses, and whether the move repeats. Carry the source identity and link with that brief. State whether this is a faithful reconstruction or an original interpretation; do not attribute locally invented timings to upstream. Preserve the project's visual style and any user limits on runtime, dependencies, duration, or transitions.

For example: “Use Stagger, Motion Prompt #002 (`motion`, local 02, `stagger`), on seven result bars. Give adjacent bars a 0.12 s start offset, rise over 0.65 s, and hold their final values. Derive each bar from the absolute timeline, with explicit play/pause and scrubbing. This is a local interpretation.” These are illustrative authored timings, not a transcription of the upstream sample.

Choose the mechanism that fits the existing renderer:

| Target | Typical implementation |
| --- | --- |
| HTML/SVG | Transform/opacity/clip-path from a pure sample; SVG path geometry and tangent for a route. |
| Canvas | Clear and draw the same absolute-time state; seed any randomness before sampling. |
| Three.js | Sample object transforms or the existing camera controller; avoid competing camera owners. |
| Film | Map local effect time to the composition's absolute clock and preserve the surrounding shot boundaries. |

An upstream entry may reference its shared pack kit. If actual upstream source is reused, include the required kit dependencies and retain the MIT copyright/license notices. Read and integrate only relevant code; do not execute an installer or embed a whole catalog merely to reproduce a named movement. Taster's included example contains original code and does not vendor that kit.

## Timing and accessibility constraints

- Sample from absolute time so pause, reverse seek, and replay reproduce the same pose. Define endpoint behavior explicitly; a single pass that holds its last pose differs from a seamless loop.
- Bound duration and strength, validate numeric input, and keep the strongest supported pose within the frame. Specify whether speed is constant along a path or whether only the curve parameter is linear.
- Define reduced-motion behavior before playback: begin paused, allow deliberate stepping or play, and avoid unsolicited repeated movement. Pause when hidden and prevent a return-time jump.
- Keep card selection, duration, scrub, play/pause, replay, and prompt copying accessible by keyboard. Do not announce time updates every frame. Provide manual copy fallback when the Clipboard API is unavailable or rejected.
- Verify the beginning, delayed starts, maximum displacement, settling, and endpoint. Test both directions of scrubbing, changed durations, explicit playback under reduced motion, and a narrow touch layout.

## Included example

[CUE](../examples/motion-lab/README.md) is a local six-entry vocabulary: Pop-in `#001`, Stagger `#002`, Mask reveal `#005`, Overshoot `#010`, Anticipation `#121`, and Motion path `#126`. Each card retains upstream pack/ID/slug identity, while original SVG samplers demonstrate the selected idea with editable duration and intensity. Its generated prompt includes the local recipe, source, and accessibility constraints. The included `manifest.json` records the snapshot and subset scope. It is an example of this workflow, not a drop-in implementation of Motion Prompt's complete gallery, selection bridge, or runtime.
