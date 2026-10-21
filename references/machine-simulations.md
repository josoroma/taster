# Machine simulations

Use this route when a user names a machine or asks how a mechanism works: engines, pumps, clockwork, linkages, actuators, instruments, or other hardware. Start with the question and the observable consequence. A machine request may need a planar mechanism, spatial inspection, or an optional film; choose the representation that makes its model clear.

The workflow is informed by [AirsupHQ/machine-skill](https://github.com/AirsupHQ/machine-skill), an upstream skill combining machine research, procedural Three.js scenes, small solvers, inspection modes, and a recording workflow. Its [SKILL.md](https://github.com/AirsupHQ/machine-skill/blob/main/SKILL.md) and [solver recipes](https://github.com/AirsupHQ/machine-skill/blob/main/references/solvers.md) are useful references. Taster's original implementation does not install or bundle that runtime. Upstream is [MIT licensed](https://github.com/AirsupHQ/machine-skill/blob/main/LICENSE), © 2026 Air Supply Technologies Inc. (Airsup); preserve its notice if you later copy or adapt its code. Claims of photorealism, validated performance, and a rendered film must be earned by the actual deliverable.

## Research → model → geometry → inspection

1. **Research the mechanism.** Identify the real device or explicitly choose an original schematic. Record a short part list, dimensions with sources, one operating input, and the output the viewer should understand. For a real product, distinguish published dimensions from inferred geometry. Read primary technical material before adding consequential claims.
2. **Define the model.** State units, coordinates, valid parameter bounds, assumptions, and the equation or integration method. Put the model in a pure module when practical. A prescribed shaft speed is kinematics; it does not establish torque, efficiency, or loads. Mark approximations and unknowns instead of filling gaps with plausible readouts. Verify a known limiting case or operating point before polishing.
3. **Build connected geometry.** Share parameters and state across meshes, labels, plots, and outputs. Place shafts at their actual rotation axes and links at their joint origins. Solve closed loops rather than stretching a link visually. Keep schematic separation independent of operational motion. State any display scale or slow-motion factor near the controls.
4. **Render for the question.** SVG handles a readable planar linkage; Three.js handles orbiting, occlusion, and solid assemblies. Use the [engineering guide](engineering-explainers.md) for sober surfaces, orthographic views, dimension conventions, and the distinction between meshes and CAD. PBR settings alone do not establish measured material properties. Actual section cuts need solid caps; transparency is an inspection mode, not a cutaway.
5. **Let the viewer operate and inspect.** Give the primary input immediate visible consequences. Include pause, direct seeking or stepping, reset, units, and component selection. Use [camera-and-assembly.md](camera-and-assembly.md) for one camera owner and absolute reversible poses. Camera input interrupts a shot. Provide readable keyboard controls, reduced motion, and a useful fallback when WebGL fails.
6. **Verify the same state everywhere.** Test closure, invariants, unit conversion, bounds, derivatives, pause/seek/reset, and repeated assembly round trips as applicable. Inspect screenshots at overview, intermediate reveal, fully revealed, focused, and reset states; repeat on a narrow layout. Test actual production output. Do not report a frame-rate measurement or physical validation you did not perform.

A failure or “break” mode is useful only when the model computes its consequence. Do not append an arbitrary explosion to a kinematic study. The smallest complete demonstrator can explain a mechanism without a failure mode, a large parts count, or simulated dynamics.

## Starter: CRANK

```sh
node /absolute/path/to/taster/scripts/create-project.mjs /absolute/path/to/project --template machine-lab
```

[CRANK](../examples/machine-lab/) is an original slider-crank with SI kinematics, analytic displacement and velocity, a live cycle plot, Three.js inspection, and a reversible guard reveal. It starts paused and supplies an SVG fallback. Its [README](../examples/machine-lab/README.md) defines the model and explains controls; [model tests](../tests/machine-lab.test.mjs) verify link closure, derivatives, and periodicity. This is a schematic teaching mechanism, not a thermodynamic engine, engineering performance simulation, or CAD export.

Adapt the mechanism, geometry, readouts, and explanatory copy together. Do not leave crank equations behind in a pump or use a generic “power” number disconnected from its model. If a user supplies an upstream machine page or specifically requests the upstream runtime, inspect its source, current dependency versions, and license before deciding whether to adapt it; this route does not imply API compatibility.

## Optional machine film

Use [video.md](video.md) only when video is requested. Build a deterministic composition that evaluates the same model at absolute time: orient, operate, reveal, inspect, explain. Record playback timing and any time compression. Keep browser preview, reproducible render command, and encoded media distinct. Taster's video route uses its existing film workflow; the upstream Machine Skill recorder and film hooks are not installed by this starter.
