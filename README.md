# Taster

Languages: **English** · [Español](README-ES.md)

<a href="https://josoroma.github.io/taster/"><img src="assets/showcase/logo.svg" alt="Taster" width="220"></a>

**Ideas you can play, inspect, and understand.** [Explore the live showcase](https://josoroma.github.io/taster/) · [View the repository](https://github.com/josoroma/taster)

[![A collage of Taster's seven interactive examples, from playable worlds to science and engineering explainers](assets/showcase/taster-collage.png)](https://josoroma.github.io/taster/)

## Contents

- [About Taster](#about-taster)
- [What it handles](#what-it-handles)
- [Use the skill](#use-the-skill)
- [Run the seven included projects](#run-the-seven-included-projects)
- [Repository structure](#repository-structure)
- [Start an independent project](#start-an-independent-project)
- [Build and verify](#build-and-verify)
- [Publish with GitHub Pages](#publish-with-github-pages)
- [Reading map](#reading-map)
- [Credits and limits](#credits-and-limits)
- [Examples](#examples)
  - [Included projects and their prompts](#included-projects-and-their-prompts)
    - [Lumen](#lumen--the-sunken-garden)
    - [Bell Lab](#bell-lab)
    - [Workshop](#workshop)
    - [SHIFT](#shift)
    - [Cerebra](#cerebra)
    - [INNERSPACE](#innerspace)
    - [DEXTRA](#dextra)
  - [More project ideas](#more-project-ideas)
    - [Quantum computing and atoms](#quantum-computing-and-atoms)
    - [LLMs and computing](#llms-and-computing)
    - [Space and time](#space-and-time)
    - [Mathematics and physics](#mathematics-and-physics)
    - [Robotics and mechanisms](#robotics-and-mechanisms)
    - [CAD and manufacturing](#cad-and-manufacturing)
    - [3D printing](#3d-printing)
    - [Optics and biology](#optics-and-biology)
    - [Games that teach](#games-that-teach)
    - [Presentation and adaptation](#presentation-and-adaptation)

## About Taster

**Taster is a reusable skill for explanatory animations, interactive engineering models, and playable worlds.** Its toolkit combines detailed scenes, camera inspection, reversible assembly, and animation driven by a model.

Give it a subject, an audience, and the insight you want someone to discover. Taster chooses a suitable representation, builds the model, choreographs the explanation, and checks the result in a browser. You can ask for a sober technical drawing, an inspectable 3D mechanism, a cinematic science scene, or a complete small game without choosing a rendering library first.

```text
$taster explain how a robot gripper converts motor rotation into finger motion.
Use a sober orthographic view, highlight the active joint, and let me scrub
the mechanism, inspect its parts, and reassemble it exactly.
```

## What it handles

| Capability | What the viewer can do |
| --- | --- |
| Camera inspection | Orbit, zoom, pan, focus on a part, reset the view, or interrupt a guided tour. |
| Reversible assembly | Separate components, inspect their relationships, and return to the assembled pose without accumulated drift. |
| Explanatory animation | Play, pause, step through chapters, scrub backward, and change playback speed. |
| Scientific models | Connect geometry, equations, readouts, and captions to the same state; identify assumptions and visual metaphors. |
| Sober engineering | Inspect orthographic linework, hidden edges, dimensions, construction stages, robot frames, or deposition paths. |
| Playable experiences | Learn rules, act on a model, receive feedback, reach a clear completion state, and restart. |
| Accessible inspection | Use keyboard and touch alternatives, reduced motion, readable captions, and responsive layouts. |

The skill adapts the presentation to the subject. Engineering explanations default to quiet surfaces and precise lines. Scientific scenes can use cinematic lighting when it clarifies the idea. A game is optional, and unfamiliar scientific claims need appropriate sources.

## Use the skill

Keep the whole repository when installing the skill; `SKILL.md` links to the guides, runtime helpers, and complete examples. From this repository’s root, link it into your skills directory:

```sh
mkdir -p "$HOME/.agents/skills"
ln -s "$PWD" "$HOME/.agents/skills/taster"
```

If that destination already exists, inspect it before changing anything. Invoke **`$taster`** in a prompt or select **Taster** from the skills picker. A new session may be needed after installation. The repository is named `taster`; its prompt identifier is `$taster`.

A useful prompt names the subject, audience, central question, desired interaction, and visual style. Add supplied files, units, scientific assumptions, or required exports when they matter. Leave implementation choices open unless you already have a stack or workflow to preserve. See the [included projects and additional prompts](#examples) for starting points.

## Run the seven included projects

All seven complete projects live in [`examples/`](examples/README.md). They share local fonts and runtime helpers from the repository root.

Requirements: **Node.js 22+** and a modern browser. The 3D examples need WebGL 2; SHIFT uses Canvas 2D. Playback needs no API keys or remote assets.

```sh
npm ci
npm start
```

Open the [local showcase](http://localhost:5173/taster/), or explore the [public showcase](https://josoroma.github.io/taster/) without installing anything. The final [Included projects and their prompts](#included-projects-and-their-prompts) section pairs every project with its source folder, live preview, and a reusable prompt.

Use `PORT=8080 npm start` to choose a different port.

## Repository structure

```text
taster/
├── SKILL.md                     Skill entry point and working principles
├── agents/openai.yaml           Skill discovery metadata
├── README.md                    Setup, project guide, and prompt collection
├── README-ES.md                 Spanish documentation and prompt collection
├── index.html                   Public showcase with live example links
├── kit/                         Camera, timeline, assembly, technical viewer
├── assets/fonts/                Shared local fonts and license notices
├── assets/showcase/             Taster logo, screenshots, and collage
├── examples/
│   ├── README.md                Example overview and adaptation notes
│   ├── index.html               Catalog linking to all seven examples
│   ├── lumen/                   Game page, styles, source, and guide
│   ├── bell-lab/                Quantum page, styles, and source
│   ├── workshop/                CAD page, styles, source, and CAD assets
│   ├── ai-history/              Animated film, chapter model, and source guide
│   ├── brain-atlas/             3D brain, regional information, and assembly
│   ├── particle-atlas/          Journey into matter and known-particle atlas
│   └── cyborg-hand/             Articulated hand, mechanism tour, and inspection
├── references/                  Motion, science, engineering, runtime guides
├── scripts/                     Generation, builds, CAD rebuild, browser checks
├── tests/                       Model, geometry, and motion checks
└── evals/evals.json              Skill evaluation prompts and criteria
```

Each example keeps its HTML, application code, styles, and scene/model modules together. Workshop’s generated geometry, Python source, and exports are in [`examples/workshop/assets/cad-plate/`](examples/workshop/assets/cad-plate/README.md). Shared helpers stay in `kit/`; the generator copies the dependencies needed by a new project.

## Start an independent project

Choose the closest example and generate into an empty directory:

```sh
node scripts/create-project.mjs /path/to/new-project --template bell-lab
cd /path/to/new-project
npm ci
npm start
```

| Template | Useful starting point |
| --- | --- |
| `bell-lab` | Guided science explanations, reversible assembly, live model readouts, and optional puzzles. |
| `lumen` | An explorable game world with movement, objectives, and completion. |
| `workshop` | Sober engineering explanations with construction stages and technical inspection. |
| `ai-history` | Short animated stories with chapters, a reversible timeline, and sourced context. |
| `brain-atlas` | Labeled biological structures, reversible separation, and contextual inspection. |
| `particle-atlas` | Guided journeys across scientific scales, particle inspection, and sourced taxonomy. |
| `cyborg-hand` | Articulated mechanisms, reversible outer-shell separation, and restrained futuristic inspection. |

The generator copies one example, its required toolkit, local assets, tests, and scripts. The generated project works independently of the installed skill. Adapt the model, labels, visual mappings, and learning objective together; a change of subject usually needs more than replacement text.

Existing projects can borrow individual helpers instead of starting over. Read the [runtime API](references/kit.md) before integrating them.

## Build and verify

```sh
npm test
npm run build
```

Tests cover model behavior and relevant geometry or motion invariants. The production build writes a static `dist/` directory with local dependencies. Serve it over HTTP; direct `file://` loading is not supported.

Use [`scripts/capture.mjs`](scripts/capture.mjs) and [`scripts/drive.mjs`](scripts/drive.mjs) for browser captures and interaction checks. The [runtime guide](references/kit.md) explains their use. Inspect desktop and narrow layouts, keyboard controls, reduced motion, pause/seek/reset, and the actual completion state. Test a generated project separately to catch accidental dependencies on the skill checkout.

Workshop ships precomputed CAD geometry. To regenerate its snapshots and real exports from the included Python source, install `uv` and run:

```sh
uv run scripts/build-cad-example.py
```

The builder pins SMLibPy and validates the geometry. Normal browser playback needs neither Python nor a CAD service. See the [CAD asset guide](examples/workshop/assets/cad-plate/README.md) for the source, units, meshing details, and exports.

## Publish with GitHub Pages

The public showcase lives at **[josoroma.github.io/taster](https://josoroma.github.io/taster/)**. It serves the same complete projects in `examples/`, so previews and source stay together without a separate `examples-io/` copy.

The [GitHub Actions workflow](.github/workflows/pages.yml) builds and deploys the site whenever changes reach `main`; it can also be started manually from the repository's Actions tab. It installs the locked dependencies, runs the tests, builds with `npm run build`, and publishes `dist/` to GitHub Pages. In the repository's **Settings → Pages**, choose **GitHub Actions** as the source.

To check the exact static output locally:

```sh
npm ci
npm test
npm run build
python3 -m http.server 8080 --directory dist
```

Open `http://localhost:8080/`. The output includes the showcase, examples, toolkit, fonts, and vendored rendering dependencies. Relative links work both here and beneath GitHub Pages' `/taster/` path.

## Reading map

| Guide | Read it for |
| --- | --- |
| [Skill entry point](SKILL.md) | Invocation, automatic choices, workflow, and completion standards. |
| [Camera and assembly](references/camera-and-assembly.md) | Camera ownership, tours, focus, separation paths, reassembly, and scrubbing. |
| [Scientific storytelling](references/scientific-storytelling.md) | Sources, honest visual encodings, model assumptions, and domain-specific pitfalls. |
| [Engineering explainers](references/engineering-explainers.md) | CAD construction, robotics, additive manufacturing, line conventions, and real exports. |
| [Runtime API](references/kit.md) | Helper signatures, integration examples, copying projects, and browser verification. |
| [Working examples](examples/README.md) | What each included project demonstrates and how to adapt it. |
| [Evaluation cases](evals/evals.json) | Realistic requests and the behaviors a good result should satisfy. |

## Credits and limits

Three.js is MIT licensed; builds include its notice. Local DM Sans and Italiana fonts use the SIL Open Font License, with notices in `assets/fonts/`. See [LICENSE](LICENSE) for Taster’s license and accompanying third-party notices. Workshop uses geometry generated with [SMLibPy](https://smlibpy.classcad.ch/) 0.3.1.

Taster is a skill and reusable toolkit, not a simulator for every subject named in the prompts below. Bell Lab models an ideal two-qubit system; its apparatus is a visual metaphor. Lumen is an artistic game world. Workshop provides one reproducible CAD construction, with STEP solid geometry and millimeter-scale STL tessellation. It does not run a printer or provide a slicer, and robotics guidance is not a bundled robot dynamics engine.

SHIFT illustrates selected AI developments from 2017 onward and treats AGI as an open research goal. Cerebra uses schematic brain shapes and regional boundaries; its separation is an inspection aid, and its descriptions emphasize connected networks.

INNERSPACE illustrates known particle structure and Standard Model classification. Its clouds, scale transitions, and display rotation are schematic; quantum spin is intrinsic and no deeper constituents of quarks or leptons are asserted.

DEXTRA is a conceptual kinematic demonstrator: joint poses and separation are driven by a deterministic model. Its procedural geometry is illustrative, with no validated force analysis, manufacturing tolerances, or production CAD exports.

New subjects require suitable models and sources. Video export is not bundled; current examples are browser experiences with editable source and support for still captures. A requested export or new simulation needs its own implementation and verification.

## Examples

Choose an included project to explore a working implementation, or use the additional ideas to start something new. Each prompt appears once. Adapt the audience, source files, dimensions, and learning goal to your project.

### Included projects and their prompts

These seven projects are available in `examples/`. Each entry includes its public preview and a reusable prompt describing that project.

#### Lumen — The Sunken Garden

Source: [`examples/lumen/`](examples/lumen/) · [Play live](https://josoroma.github.io/taster/examples/lumen/)

```text
$taster create a complete browser adventure in a sunken mechanical garden.
Let the player guide a mechanical keeper, dash past sentinels, and restore three
beacons through timing challenges to reopen the final gate. Use atmospheric 3D
rendering, optional sound, clear objectives, keyboard and pointer controls,
and a satisfying replayable ending.
```

#### Bell Lab

Source: [`examples/bell-lab/`](examples/bell-lab/) · [Open live](https://josoroma.github.io/taster/examples/bell-lab/)

```text
$taster create an interactive lesson for beginners on preparing a Bell state.
Let me apply H, X, Z, and controlled-X gates, inspect amplitudes and joint
probabilities, then solve three target-state puzzles that include relative phase.
Add camera inspection and reversible assembly, and identify the apparatus as a visual metaphor.
```

#### Workshop

Source: [`examples/workshop/`](examples/workshop/) · [Open live](https://josoroma.github.io/taster/examples/workshop/)

```text
$taster explain a mounting plate built from a box, rounded corners, four holes,
and a blind pocket. Use sober technical rendering and real CAD snapshots linked
to the executed source. Show matching dimensions and volume at each stage,
provide pan and zoom, and include validated STEP and STL exports.
```

#### SHIFT

Source: [`examples/ai-history/`](examples/ai-history/) · [Watch live](https://josoroma.github.io/taster/examples/ai-history/)

```text
$taster create a 90-second code-rendered browser animation about AI, from
Attention Is All You Need in 2017 to the open question of AGI. Explain selected
milestones with original visual metaphors, readable captions, chapter controls,
and a reversible timeline. Cite primary sources and keep future possibilities
clearly separate from established history; do not invent an AGI arrival date.
```

#### Cerebra

Source: [`examples/brain-atlas/`](examples/brain-atlas/) · [Explore live](https://josoroma.github.io/taster/examples/brain-atlas/)

```text
$taster build an interactive 3D brain explainer with named regions, hints, and
contextual information. Let me orbit, pan, zoom, select a region, separate the
parts to inspect deeper structures, and reassemble them exactly. Explain how
regions work through connected networks, and identify the shapes and separation
as educational schematics rather than a clinical atlas.
```

#### INNERSPACE

Source: [`examples/particle-atlas/`](examples/particle-atlas/) · [Explore live](https://josoroma.github.io/taster/examples/particle-atlas/)

```text
$taster create a 78-second journey from a helium atom through its nucleus,
protons and neutrons, and quarks, ending with an atlas of known elementary particles.
Use rotating 3D diagrams, zoom, pan, labels, and reversible playback. Let me compare
proton and neutron valence charges and inspect particle roles, charge, and spin.
Distinguish display rotation from quantum spin, and stop at confirmed structure
before introducing the open research questions.
```

#### DEXTRA

Source: [`examples/cyborg-hand/`](examples/cyborg-hand/) · [Inspect live](https://josoroma.github.io/taster/examples/cyborg-hand/)

```text
$taster create a futuristic cyborg hand that fully extends and closes into a
fist through articulated joints and an opposing thumb. Use graphite, silver armor,
and restrained green accents. Add pan, zoom, orbit, camera presets, component
labels, live joint angles, and a reversible 32-second motion study. Let the open
hand separate into inspectable layers and reassemble exactly. Treat it as a
conceptual kinematic mechanism, with no unsupported force or manufacturing claims.
```

### More project ideas

The following 47 prompts describe additional projects or adaptations. Their subjects are not bundled as complete examples; the agent needs to implement and verify the requested model and interactions.

#### Quantum computing and atoms

**Quantum interference**

```text
$taster explain a single-qubit interferometer with a phase control and measured
output probabilities. Connect each visual change to the state calculation, and
let me compare coherent evolution with a clearly identified dephasing model.
```

**A hydrogen orbital**

```text
$taster build a calm 3D explanation of hydrogen's 1s and 2p orbitals for high-school
students. Let me rotate and slice probability density, distinguish amplitude
sign from probability, and avoid showing an electron following a planet-like orbit.
```

**Quantum error correction**

```text
$taster explain the three-qubit bit-flip code with a small, inspectable circuit.
Let me inject one X error, read the syndrome, and recover the encoded state;
make the code's inability to correct arbitrary quantum errors explicit.
```

**Entanglement and measurement**

```text
$taster create a two-station entanglement explainer where I can choose local
measurement bases and compare statistics after collecting both records.
Show why correlations do not provide a controllable faster-than-light message.
```

#### LLMs and computing

**Attention you can calculate**

```text
$taster explain one attention head using a tiny sequence and visible numerical
query, key, and value vectors. Let me inspect dot products, scaling, softmax,
and the weighted output, with every readout coming from the same calculation.
```

**Inside a transformer block**

```text
$taster make a sober transformer-block explainer with separable layers and a
scrubbable token path. Use a stated architecture, show residual connections,
and keep learned representations distinct from literal human concepts.
```

**Autoregressive generation and the KV cache**

```text
$taster show how a small decoder generates one token at a time and reuses a KV
cache. Let me compare cached and uncached execution, including the causal mask
and actual counted operations for the toy model rather than invented timings.
```

**Backpropagation**

```text
$taster build an interactive explanation of backpropagation through a tiny
two-layer network. Let me change one weight, inspect the forward loss and
chain-rule gradient, and compare that gradient with a finite-difference check.
```

**Packets, queues, and retries**

```text
$taster create a compact network simulation showing packets moving through
bounded queues. Let me vary latency, capacity, and loss, then explain how a
declared retry policy affects delivery without presenting decorative motion as timing data.
```

#### Space and time

**Black-hole anatomy**

```text
$taster create a guided black-hole explanation with inspection views for the
horizon, photon region, shadow, and accretion disk. Identify which shapes are
schematic and which optical effects are calculated, and keep the scale readable.
```

**Gravitational time dilation**

```text
$taster compare stationary clocks at different radii outside a nonrotating black
hole. Let me adjust radius and inspect the rate ratio from a stated equation;
keep all stationary-clock examples outside the horizon and label the assumptions.
```

**Light cones and simultaneity**

```text
$taster explain special relativity with a 1+1-dimensional spacetime diagram.
Let me change inertial frames, track the same events, and compare simultaneity
slices while the light cones and invariant interval remain consistent.
```

**Transfer between orbits**

```text
$taster build a playable lesson on a Hohmann transfer between circular orbits.
Let me choose the destination radius, inspect both impulses and coast time,
and distinguish the ideal two-body calculation from a mission-ready trajectory.
```

**Expanding space**

```text
$taster explain cosmological expansion using a controllable scale factor and
comoving markers. Show the difference between comoving and proper distance,
and label the visualization's dimensional simplification and chosen expansion model.
```

#### Mathematics and physics

**Fourier synthesis**

```text
$taster let a student build a periodic signal from harmonics with amplitude and
phase controls. Synchronize rotating phasors, the component waves, and their sum,
then add a challenge to reproduce a target waveform within a visible error tolerance.
```

**A double pendulum**

```text
$taster create an inspectable double-pendulum simulation with two nearby initial
conditions and energy readouts. Use a suitable integrator, expose numerical drift,
and make pause, reset, and repeatable initial conditions part of the explanation.
```

**Eigenvectors as directions**

```text
$taster explain a real 2×2 linear transformation using a draggable basis and an
animated grid. Let me identify invariant directions and compare matrices with
distinct real eigenvectors, a repeated eigenvalue, or no real eigenvectors.
```

**Waves at a boundary**

```text
$taster show a pulse reflecting and transmitting at the boundary between two
one-dimensional media. Let me change the relevant material parameters and see
the boundary conditions, travel speeds, and energy accounting for the chosen model.
```

**Diffusion from random walks**

```text
$taster explain diffusion by comparing seeded random walks with a concentration
profile. Let me change the step rate and inspect mean squared displacement,
with a clear distinction between individual trajectories and ensemble statistics.
```

#### Robotics and mechanisms

**Robot wrist and coordinate frames**

```text
$taster make a sober 3D explanation of a three-axis robot wrist with visible joint
axes and selectable local frames. Let me move one joint at a time, inspect the
transform chain, and reset without mixing operational motion with exploded poses.
```

**Two-link inverse kinematics**

```text
$taster build a planar two-link arm whose end-effector target I can drag.
Show both inverse-kinematics branches, joint limits, and the reachable workspace;
mark unreachable targets instead of stretching the links to fit them.
```

**Parallel gripper**

```text
$taster explain how a rack-and-pinion gripper turns motor rotation into equal
opposed finger travel. Use restrained linework, a joint-position control, and a
reversible exploded view that reveals how the teeth and guides constrain motion.
```

**Four-bar linkage**

```text
$taster create a four-bar linkage explainer with editable link lengths and a
driven crank. Preserve loop closure, explain invalid configurations, and show
the coupler path without implying that the kinematic model includes forces.
```

**Inspect a supplied robot model**

```text
$taster use the URDF and meshes in this project to create a browser inspection
tool. Preserve declared origins, joint axes, limits, and units, and add a short
camera tour of the kinematic chain plus a home-pose reset.
```

#### CAD and manufacturing

**Revolve, loft, and sweep**

```text
$taster create three sober, side-by-side construction animations comparing
revolve, loft, and sweep. Highlight the profile, axis or path, then the resulting
surface or solid, with direct stage selection and consistent camera framing.
```

**A section through a bearing**

```text
$taster explain the supplied bearing assembly using a movable cutting plane.
Cap and hatch the section, keep an uncut outline for orientation, and let me
isolate the races, rolling elements, and cage before restoring the assembly.
```

**Tolerances and fits**

```text
$taster build an explainer for a shaft and hole with adjustable diameter limits.
Calculate clearance or interference from the stated dimensions, exaggerate the
gap only in a labeled detail view, and avoid inventing a standards compliance claim.
```

**Assembly order**

```text
$taster turn the supplied CAD parts into an assembly lesson with named components
and a reversible step sequence. Use plausible insertion directions, keep mating
references visible, and identify any unresolved interference rather than hiding it.
```

#### 3D printing

**From solid to layers**

```text
$taster explain how an FDM model becomes horizontal slices, perimeters, and infill.
Let me move the slicing plane and change an illustrative layer height, with
dimensions shown and schematic paths clearly distinguished from slicer output.
```

**Inspect real G-code**

```text
$taster visualize the supplied printer G-code as a read-only explanation.
Handle its coordinate and extrusion modes, distinguish deposition from travel,
and synchronize nozzle position, visible material, and layer selection while scrubbing.
```

**Supports and orientation**

```text
$taster compare three print orientations of the same bracket and explain why
overhangs may need support. Let me inspect cross-sections and candidate support
regions; state the process assumptions instead of claiming automatic printability.
```

**Resin printing sequence**

```text
$taster create a restrained explanation of bottom-up masked resin printing.
Show the selected exposure layer, build-platform motion, and separation stage
on one reversible timeline, with a clear note when process timing is compressed.
```

**Infill patterns**

```text
$taster compare grid, triangular, and gyroid-style infill inside a cutaway part.
Let me adjust nominal density and inspect material distribution, but separate
geometric observations from mechanical strength claims that need simulation or tests.
```

#### Optics and biology

**Exploded camera lens**

```text
$taster make a sober lens explainer with reversible separation of named optical
elements and aperture blades. Add a simple ray model with stated assumptions,
and show how focus and aperture affect the computed rays rather than only the camera view.
```

**Thin-film interference**

```text
$taster explain thin-film interference with controllable thickness, refractive
index, and wavelength. Trace the relevant paths, include reflection phase shifts,
and relate the displayed intensity to a declared optical model.
```

**DNA replication**

```text
$taster create a guided DNA-replication explanation for introductory biology.
Let me inspect strand direction and leading versus lagging synthesis, with
chapter controls and explicit scale or motion simplifications in the molecular scene.
```

**The cardiac cycle**

```text
$taster explain the cardiac cycle with a simplified chamber-and-valve model.
Synchronize pressure relationships, valve states, and flow direction on a
scrubbable timeline, and label it as an educational schematic rather than patient data.
```

**Enzyme kinetics**

```text
$taster connect an enzyme-binding animation to a small kinetic model with visible
assumptions and adjustable substrate concentration. Compare the calculated rate
with the chosen model's prediction and identify when steady-state assumptions are used.
```

#### Games that teach

**Orbital rendezvous puzzle**

```text
$taster create a small orbital-rendezvous game with a limited maneuver budget.
Use a consistent two-body model, teach the controls through the first challenge,
and define success using both distance and relative speed with a clear restart.
```

**Mirror laboratory**

```text
$taster make a puzzle game where I rotate mirrors to route a beam through targets.
Use calculated reflection directions and visible collision rules, add five
carefully designed levels, and let me inspect the incident and reflected angles.
```

**Gear train workshop**

```text
$taster create a game about assembling gear trains to reach a target output ratio.
Keep tooth counts, rotation directions, and meshing geometry consistent, and
explain a failed arrangement through the mechanism instead of only showing a red score.
```

**Robot pick-and-place challenge**

```text
$taster build a kinematic robot-arm game with joint limits and three placement
targets. Provide manual joint controls and a reachable-workspace overlay, and
state exactly which collision or grasp rules the simplified game implements.
```

#### Presentation and adaptation

**Make an existing scene sober**

```text
$taster adapt this existing explainer to the restrained engineering style in my
reference: charcoal background, orthographic views, clear contours, and one accent.
Preserve its model and controls while replacing decorative effects with purposeful emphasis.
```

**Camera tour with inspection**

```text
$taster add an interruptible camera tour to this model, moving from overview to
three named mechanisms and back. Let user input take control immediately, provide
focus and frame-all buttons, and keep every stop readable on narrow screens.
```

**Reliable separation and reassembly**

```text
$taster add a reversible exploded view to this assembly using its original rest
poses. Let me scrub any direction, isolate a part, and repeat separation and
reassembly without drift; choose paths that communicate the actual mating relationships.
```

**An accessible classroom version**

```text
$taster adapt this interactive explanation for keyboard use and a classroom tablet.
Provide labeled alternatives to gestures, readable captions, and an optional
step-based reduced-motion mode without removing the model's meaningful controls.
```

**A fixed technical illustration**

```text
$taster use this mechanism to produce a standalone, fixed-view SVG explanation
with an assembled view, one exploded detail, and concise part labels.
Keep it static and editorial: prioritize line hierarchy, accurate relationships,
and legibility at the intended article width.
```
