---
name: taster
description: Create interactive science and engineering explainers, molecular and biomolecular structure animations, playable browser games, editorial or interactive diagrams, and HTML-to-video films. Use for inspectable models, reversible assemblies, source-backed molecular views, architecture and process diagrams, and deterministic video compositions; not ordinary websites or data dashboards.
metadata:
  short-description: "Build science, games, diagrams, and explanatory video"
---

# Taster

Turn an idea into an experience someone can explore, understand, and play. A beautiful scene should reveal a mechanism: the viewer changes something, sees a consequence, and discovers why it happened. Build detailed, inspectable 3D worlds, scientific instruments, and abstract mathematical spaces. Do not force every subject into a machine metaphor.

Present the skill and its agents under Taster’s own identity. For artifacts explaining Taster, use [its existing identity](references/identity.md); for other subjects, follow the requested visual direction. Preserve required third-party notices and identify external tools or source data accurately.

## Start from one prompt

Infer the audience, format, visual direction, and smallest complete interaction from the request and references. State the chosen concept briefly, then build. Ask only when a missing choice materially changes the deliverable; do not require the user to design the scene graph, renderer, camera, or storyboard.

- **Game:** establish a goal, meaningful player actions, visible consequences, a completion state, and replay. Finish a small compelling loop before expanding the world.
- **Explainer:** establish one question, reveal the mechanism, let the viewer change a variable or inspect a part, and show the resulting evidence. Add a puzzle only when requested or useful to that explanation.
- **Both:** let a short guided sequence teach the same rules the player then uses. The score must reward understanding or skill, not contradict the model.
- **Molecular structure:** choose a scientific question, identify the structure or schematic, and connect residue/atom selection, representations, and measured distances to the same coordinates. Read the molecular guide before choosing a renderer or animating conformations.
- **Diagram:** choose the relationship the reader should understand, then a topology that expresses it. Deliver static SVG/HTML or interactive inspection as requested; a diagram does not require a game or a 3D scene. Read the diagram guide for layout, exports, and architecture semantics.
- **Video:** define the audience, message, duration, and aspect ratio; author a deterministic composition and render the requested video file. Keep the browser preview and encoded deliverable distinct. Read the video guide for Hyperframes and export verification.

Choose the renderer automatically from the task: semantic HTML/SVG for crisp planar mechanisms; Canvas for dense 2D motion; Three.js/WebGL for spatial inspection, lighting, volumes, orbital cameras, or immersive games. Retain a suitable existing stack. Export stills or video only when requested; a still-image reference does not change an interactive request into an image task.

Choose the visual language separately from the renderer. For CAD, robotics, fabrication, or a request for a sober technical explanation, default to restrained engineering presentation: orthographic views, clear outlines, quiet surfaces, one operation accent, and readable pauses. Read the engineering reference below. Cinematic lighting and effects remain available for games and science scenes; do not impose them on a technical drawing or turn an explainer into a game unless requested.

## Reuse the working foundations

Resolve every path here relative to this `SKILL.md`. Create new work in the user's project, not inside the installed skill, unless they are updating Taster itself. Copy required runtime files and rewrite imports so delivered source works independently of the installed skill.

Read only the resources needed for the task:

| Resource | Use |
| --- | --- |
| [references/camera-and-assembly.md](references/camera-and-assembly.md) | Zoom, pan, orbit, focus, tours, exploded views, reassembly, and timeline design. |
| [references/scientific-storytelling.md](references/scientific-storytelling.md) | Scientific claims, honest visual metaphors, equations, sources, and domain-specific traps. |
| [references/engineering-explainers.md](references/engineering-explainers.md) | Sober CAD construction, robotics kinematics, 3D-printing sequences, technical lines, units, and real geometry exports. |
| [references/molecular-structures.md](references/molecular-structures.md) | Experimental or predicted structures, atom/residue identity, molecular representations, trajectories, and honest scientific motion. |
| [references/diagrams.md](references/diagrams.md) | Editorial and interactive diagrams informed by Diagram Design and Archify, labeled relationships, accessible inspection, and SVG exports. |
| [references/video.md](references/video.md) | HTML-to-video with Hyperframes, deterministic timelines, assets, rendering, and media verification. |
| [references/identity.md](references/identity.md) | Existing Taster colors, typography, logo, and editorial design for Taster-branded artifacts. |
| [references/kit.md](references/kit.md) | Actual runtime APIs, starter copying, and browser verification commands. |
| `kit/motion.mjs` | Deterministic transport, stage progress, immutable rest poses, and reversible assembly. |
| `kit/camera-rig.mjs` | One camera controller for user gestures and interruptible scripted shots. |
| `examples/bell-lab/` | Playable quantum explainer: inspect the instrument, reveal its parts, and prepare a target state. |
| `examples/workshop/` | Sober engineering explainer: construction stages, code and geometry, and precise inspection. |
| `examples/lumen/` | Lumen: movement, hazards, interaction, feedback, and a complete adventure loop. |
| `examples/ai-history/` | SHIFT: sourced, chapter-based motion storytelling with a deterministic timeline. |
| `examples/brain-atlas/` | Cerebra: labeled biological structures, contextual hints, and reversible separation. |
| `examples/particle-atlas/` | INNERSPACE: guided scale changes, particle inspection, and a sourced elementary-particle atlas. |
| `examples/cyborg-hand/` | DEXTRA: articulated joint chains, open/fist poses, reversible shell separation, and component inspection. |
| `examples/molecular-lab/` | Molecular inspection using bundled experimental coordinates, residue selection, and controllable explanatory animation. |
| `examples/taster-diagram/` | A branded, interactive map explaining Taster with an editable SVG export. |
| `examples/taster-film/` | A branded Taster film, deterministic HTML composition, browser preview, and rendered video. |

For a new project, copy the closest working example into an empty destination:

```sh
node /absolute/path/to/taster/scripts/create-project.mjs /absolute/path/to/project --template bell-lab
```

Use `--template lumen` for a movement-based game, `--template workshop` for sober engineering, `--template ai-history` for a chapter-based browser animation, `--template brain-atlas` for labeled biological inspection, `--template particle-atlas` for a journey into matter, or `--template cyborg-hand` for a conceptual articulated mechanism. Use `--template molecular-lab` for molecular structure inspection, `--template taster-diagram` for an interactive diagram, and `--template taster-film` for HTML-to-video. Adapt the subject, model, lesson, and geometry together. Do not retain unrelated example claims or UI. Existing projects can reuse individual helpers without being replaced by a starter. Installation, publishing, accounts, and external services are separate from creating a local artifact; do not add them implicitly.

## Build the experience

1. **Choose the reveal.** Write one sentence connecting the central action to the insight or challenge. Sketch a short sequence: orient, reveal, inspect, change, observe. Give each shot a subject and purpose; use close-ups to explain relationships, not merely to create movement.
2. **Define the model first.** Keep simulation or game rules separate from rendering. Record units, assumptions, bounds, and approximations. Use a pure module where practical. Readouts, geometry, captions, and outcomes must agree with that same state. For science, verify consequential claims against primary sources before encoding them.
3. **Build a readable scene.** Use coherent scale, purposeful components, and a visual language appropriate to the subject. Reserve strong contrast for the current idea. Engineering defaults to clean lines and muted surfaces without bloom; cinematic scenes may use atmosphere, particles, or trails when they clarify the experience. Batch repeated geometry and keep controls and captions legible.
4. **Make motion controllable.** One owner controls the camera. User intent interrupts a tour immediately. Provide frame/reset and keyboard equivalents for essential gestures. Derive assembly and narration from absolute timeline state so reverse, scrub, pause, and replay remain coherent. Read the camera/assembly reference for the invariants.
5. **Finish the interaction.** Make the first useful action obvious. Explain controls in context, show why an attempt succeeded or failed, and provide restart or reset. Expose fine inspection without drowning the scene in settings. Keep a playable example playable; do not substitute a cinematic that only looks like a game.
6. **Inspect actual output.** Build, run, interact, and look at screenshots. Review the overview, close-up, partially separated, fully separated, reassembled, and completion states that exist in this artifact. Fix unclear silhouettes, clipping, label collisions, inaccessible controls, or motion that teaches the wrong idea.

## Runtime and completion standards

- Use one animation loop per scene. Build static geometry once. Use elapsed time for animation and a fixed/substepped simulation where numerical stability matters. Pause when hidden and prevent a large elapsed-time jump on return.
- Under reduced motion, disable unsolicited camera travel and decorative pulses; preserve manual inspection and meaningful controls. Essential processes can use stepping or explicit playback. Keep screen-reader announcements event-based, not per-frame.
- Set a measured performance target appropriate to the output: normally responsive desktop play and usable mobile interaction. Bound pixel ratio, particles, postprocessing, and shadows; reduce decorative cost before altering scientific values. A WebGL failure should produce a useful message or meaningful fallback.
- Verify behavioral invariants: known model outcomes, normalization/conservation where applicable, pause/seek/replay, repeated assembly round-trips, camera interruption, and a complete playthrough. Use focused tests for meaningful rules, not assertions that merely repeat markup or helper implementation.
- Test desktop and a narrow touch layout, focused keyboard navigation, reset, and reduced motion. Inspect browser errors. Check the production build as well as the development page. Report exact checks performed and remaining limitations without inventing performance numbers.

Deliver editable source, a runnable link or command, brief controls, and the scientific scope where relevant. For diagrams, include the requested portable export; for video, include the encoded file and reproducible render command, stating any incomplete render explicitly. Preserve existing playable artifacts when adding another experience. A local preview is not a published site; do not claim deployment unless it occurred.
