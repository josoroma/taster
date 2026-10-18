# Cerebra

A quiet interactive field guide to the brain. Inspect a procedural folded brain, select eight region families, separate the model to reveal deeper structures, and put it together again. Descriptions, thought experiments and relationship notes remain available even without WebGL.

[Explore Cerebra](https://josoroma.github.io/taster/examples/brain-atlas/).

## Run the source

From the Taster root:

```sh
npm install
npm start
```

Open the address printed by the server and choose **Cerebra** from the example catalog. Build with `npm run build`; the static entry is `dist/examples/brain-atlas/index.html`.

## Explore

- Select a colored region in the model, its leader label, or the field-guide buttons. The four cortical lobe identities each include both hemispheres.
- Use **Separate regions**, **Reassemble**, or the exact separation slider. The eight region families include paired thalami and hippocampi; these internal structures receive labels once separated.
- **Focus region** frames the selected area. Focusing an internal structure reveals it by separating the model; the surrounding cortex becomes translucent while that deep structure is selected.
- Open **Try a thought experiment** for an everyday example. **Next** moves through the guide; **Start again** reassembles and resets exploration progress.
- Drag to orbit, Shift/right drag to pan, scroll to zoom. Touch supports one-finger orbit and two-finger pan/pinch. The visible **Camera controls & keyboard** disclosure contains pan buttons and keyboard instructions.
- With the canvas focused: left/right arrows orbit, up/down arrows pan, `+`/`−` zoom, and `Home` frames the whole brain. Buttons offer orbit, zoom and fit alternatives.

## Scope

This is an educational schematic, not a clinical atlas, scan, diagnostic tool or accurate surface segmentation. The cortical shell, folds, region boundaries and internal structures are generated in code. Shapes, sizes, positions and visibility are simplified; colors identify regions. Important structures not shown include the corpus callosum, basal ganglia, hypothalamus, amygdala and insula.

The lobes are regions of continuous tissue. Separation is solely an inspection device. The anatomical brain does not disassemble, and cognitive functions are not owned by isolated regions. Regional descriptions give introductory examples of contributions to distributed networks. No left-brain/right-brain personality claim is made.

Source reading is linked in the in-app **Sources & scope** panel:

- [NIMH: Get to Know Your Brain](https://www.nimh.nih.gov/news/media/2023/get-to-know-your-brain) — introductory regional roles.
- [Society for Neuroscience: Identifying Major Brain Landmarks](https://www.brainfacts.org/brain-anatomy-and-function/anatomy/2022/major-brain-landmarks-110822) — cortical lobes, deeper structures, folds and networks.
- [National Academies: Major Structures and Functions of the Brain](https://www.ncbi.nlm.nih.gov/books/NBK234157/) — regional organization, hosted by NCBI.

## Editable source

| File | Purpose |
| --- | --- |
| [src/model.mjs](src/model.mjs) | Region metadata, roles, inspection hints, schematic classification and reversible pose definitions. |
| [src/scene.mjs](src/scene.mjs) | Folded bilateral surface geometry, cut-shell interiors, deep structures, lights, ray selection and camera rig. |
| [main.mjs](main.mjs) | Semantic UI, exact slider, projected labels, hints, accessibility, fallback and reduced motion. |
| [style.css](style.css) | Plum, tissue and cream visual language and narrow-screen layout. |
| [index.html](index.html) | HTML structure, sources and scope. |
| [../../tests/brain-atlas.test.mjs](../../tests/brain-atlas.test.mjs) | Identity, mirrored movement, exact repeated reassembly, hidden structure context and schematic orientation. |

The runtime uses the shared [camera rig](../../kit/camera-rig.mjs) and [assembly helpers](../../kit/motion.mjs), local fonts and pinned Three.js. It requires no remote media. No video export is included.

## Verification hooks

`window.__brainAtlas` exposes `stats()`, `setSeparation(progress)`, `select(regionId)` and `reset()`. `setSeparation` samples the exact requested value unless explicitly called with `{animate:true}`. Stats expose selected region, explored identities, separation, reduced-motion/fallback state, camera pose and each of the fifteen part transforms.

The model tests exercise mirrored hemisphere offsets, exact return to rest through repeated cycles, and internal visibility/context without changing scientific roles. Browser checks include desktop and 390px layouts, region selection, thought hints, separation, internal focus, reset after translucency, pointer orbit, camera buttons, focused keyboard controls, reduced motion and a no-WebGL fallback. Default rendering uses about 182,000 triangles and a pixel ratio cap of 1.6; no measured frame-rate guarantee is made.
