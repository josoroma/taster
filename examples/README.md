# Complete examples

Run `npm install` and `npm start` from the repository root. Open `/taster/` for the example catalog. All seven examples live in their own folders under `examples/` and use local assets; shared runtime helpers and fonts remain at the repository root.

| Example | What to borrow | Source and route |
| --- | --- | --- |
| **Bell Lab** | Camera inspection, reversible assembly, a deterministic chapter timeline, model-driven readouts, and a three-part puzzle | [examples/bell-lab/](bell-lab/), `kit/`; `/taster/examples/bell-lab/` |
| **Lumen: The Sunken Garden** | Procedural world construction, movement, hazards, timed objectives, touch controls, sound, completion and restart | [examples/lumen/](lumen/); `/taster/examples/lumen/` |
| **Workshop** | Restrained orthographic linework, genuine topology edges, code-linked CAD snapshots, measured readouts, and STEP/STL downloads | [examples/workshop/](workshop/), `kit/technical-viewer.mjs`, `examples/workshop/assets/cad-plate/`; `/taster/examples/workshop/` |
| **SHIFT** | Deterministic chapter animation, kinetic diagrams, captions, and source context | [examples/ai-history/](ai-history/); `/taster/examples/ai-history/` |
| **Cerebra** | Folded biological forms, selectable labels, contextual hints, and reversible separation | [examples/brain-atlas/](brain-atlas/); `/taster/examples/brain-atlas/` |
| **INNERSPACE** | Probability-cloud illustration, staged scale changes, nucleon inspection, and known-particle metadata | [examples/particle-atlas/](particle-atlas/); `/taster/examples/particle-atlas/` |
| **DEXTRA** | Parent-child joint articulation, open/fist poses, reversible shell separation, and component labels | [examples/cyborg-hand/](cyborg-hand/); `/taster/examples/cyborg-hand/` |

## DEXTRA

[DEXTRA](cyborg-hand/README.md) is a 32-second interactive study of a futuristic robotic hand. Follow the fingers from full extension into a closed fist, reveal the mechanism beneath its outer shell, and inspect the components with labels, pan, zoom, and orbit. Graphite surfaces and restrained mint accents keep the moving joints readable. Pause, scrub backward, and replay to inspect the same pose from another angle.

The mechanism is a conceptual kinematic demonstrator. Its geometry and coordinated joint motion explain articulation; they do not establish actuator performance, load capacity, manufacturing clearances, or production-ready CAD. Start with `--template cyborg-hand` for an inspectable mechanical assembly, replacing its geometry and motion model together.

## INNERSPACE

[INNERSPACE](particle-atlas/README.md) is a 78-second interactive journey from a helium atom into its nucleus and nucleons, through the quark picture, and into the Standard Model atlas. Inspect 17 familiar elementary-particle entries, compare proton and neutron valence charges, and use pan, zoom, orbit, timeline scrubbing, and reversible playback. Display rotation moves the diagram; it does not portray quantum spin as literal turning.

The probability cloud and geometric models are schematic. The final stop distinguishes the boundary of confirmed substructure from open research questions. Start with `--template particle-atlas` to adapt a guided scientific journey with a browsable taxonomy.

## SHIFT

[SHIFT](ai-history/README.md) is a 90-second browser film about selected AI developments from 2017 onward. Seven chapters connect attention, scale, instruction following, multimodality, tool use, and the open question of AGI. All visuals are drawn in code with a distinct paper, cobalt, and vermilion palette. Use play/pause, the scrubber, chapter selection, and playback speed to inspect the explanation. Sources and the limits of the visual metaphors are included.

The animation samples absolute time, so seeking backward reproduces the same visual state. AGI is an unresolved research goal in this story, with no predicted arrival date. Start with `--template ai-history` to adapt the film; replace both the narrative and diagrams for a new subject.

## Cerebra

[Cerebra](brain-atlas/README.md) explores the brain through a folded, color-coded 3D model. Select a region for its location, roles, and network context. Separate the model to inspect deeper structures and reveal additional labels, then reassemble it exactly. Camera controls support orbit, zoom, pan, focus, and overview.

The geometry and region boundaries are educational schematics, not patient data. Separation is a viewing aid; brain regions operate through connected networks. Start with `--template brain-atlas` for a biological inspection lesson, preserving the distinction between spatial parts and distributed functions.

## Workshop

Four actual SMLibPy operations turn stock into a mounting plate: a box, rounded vertical edges, four through holes, and a blind pocket. The browser displays precomputed kernel-derived meshes and topology edges; the highlighted Python and measured volume refer to the same snapshot. Construction changes are discrete modeling operations, not a simulation of machining time.

Use the step buttons or scrubber, orbit/pan/zoom, switch isometric/top/front views, and optionally show dashed hidden edges. STEP preserves the exported solid; STL is a tessellated surface in millimeter-scale coordinates. The editable source and reproducible builder are included. `uv run scripts/build-cad-example.py` regenerates snapshots and checks the geometry. No printer control, G-code, or automatic CAD constraint solver is implied.

Start with `--template workshop` for a standalone project. Replace the source model and regenerate its assets before changing dimensions in the displayed explanation. See [the engineering guide](../references/engineering-explainers.md) for robotics and layer/toolpath adaptations.

## Bell Lab

The tour prepares |00⟩, applies H to qubit 0, applies controlled-X from qubit 0 to qubit 1, and shows one example of joint measurement. Its probabilities, local Bloch vectors and entanglement readout come from the same complex state vector. The stacked machine and coherence ribbon are explicitly visual metaphors.

The three challenges ask the player to prepare different Bell states. The second differs in relative phase, so matching probability bars alone cannot solve it. Fidelity compares the full pure state. The measure control collapses the displayed state; it does not repeatedly sample a fresh preparation without saying so.

Drag to orbit, right/Shift-drag to pan, and scroll to zoom. Touch uses one-finger orbit and two-finger pan/zoom. Visible buttons offer the same camera actions; the focused canvas accepts arrows, +/- and Home. Move the assembly slider in either direction or press Separate/Reassemble. Camera gestures interrupt guided camera moves; pressing Play explicitly resumes the tour’s camera control.

To adapt this example, replace `examples/bell-lab/src/model.mjs` with the new subject’s model, change the lesson and labels in `examples/bell-lab/`, and redesign the scene’s visual encodings. Keep the reusable `kit` separate. Do not relabel the quantum apparatus as an atom, black hole or transformer without changing its model and explanation.

## Lumen

See [the game guide](lumen/README.md). This example keeps fixed-step game rules separate from rendering. It is an artistic world, not a water-physics simulation.

## Verification

`npm test` exercises numerical models and reversible motion. Browser captures and input checks use `scripts/capture.mjs` or `scripts/drive.mjs`; see [the runtime guide](../references/kit.md). Test the copied project as well as the skill checkout so dependencies on the installed skill do not pass unnoticed.
