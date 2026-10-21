# CRANK — Machine Lab

An original slider-crank study: rotate a 40 mm crank, follow its 140 mm connecting rod, and inspect the resulting 80 mm slider stroke. Procedural Three.js geometry, the travel plot, and readouts use the same exact kinematic state. The restrained schematic is not a photoreal product model or production CAD.

## Run and inspect

From the project root:

```sh
npm ci
npm start
```

Open `http://localhost:5173/examples/machine-lab/`. The page starts paused. Run/pause the mechanism, set 0–60 rpm, scrub the crank angle, choose a quarter-turn stop, lift the inspection guard, or select a component. Drag the scene to orbit, Shift/right-drag to pan, and scroll to zoom; focus the canvas for arrow-key pan, +/− zoom, and Home to frame. Plan and 3/4 buttons provide fixed views. Camera gestures and guard inspection pause operation. Reset restores the initial 45° pose, 24 rpm, assembled guard, and camera.

Reduced motion starts still, disables camera transitions, and preserves explicit playback. A WebGL failure shows an interactive SVG plan with the same controls and model readouts; spatial camera and guard controls are then disabled. No remote runtime, fonts, or geometry are required after dependencies are installed.

## Model and scope

The pure module `src/model.mjs` uses metres, seconds, radians, and rpm. The scene converts metres to millimetres for drawing. The x axis points right along the slider guide; θ is measured counterclockwise from +x. The open, right-hand assembly branch is:

```text
q = sqrt(l² − r² sin²θ)
x = r cos θ + q
s = r + l − x
ω = 2π rpm / 60
ds/dt = ω(r sin θ + r² sin θ cos θ / q)
```

`s` is travel inward from outer dead centre, not distance travelled cumulatively. The velocity readout is `ds/dt` at the set speed even while the angle is paused. Link closure is exact; all complete rotations require `l > r > 0`. At θ = 0° and 180°, velocity is zero; stroke is `2r = 80 mm`. The crank and rod geometry read the model's default dimensions. Edit the enclosure, rails, and labels alongside the model when changing the mechanism's size.

This ideal rigid-link kinematic model prescribes crank speed. It does not predict torque, forces, friction, collision, wear, stress, fuel use, efficiency, or safe operating speeds. The guard is a schematic inspection layer whose lift does not change the linkage; it is not an assembly or maintenance instruction. No manufacturing clearances or material properties are claimed.

## Edit and verify

- `index.html`, `style.css`: editorial interface and responsive controls.
- `main.mjs`: user state, SVG fallback, plot, and animation loop.
- `src/model.mjs`: closure equation, analytic velocity, units, bounds, and part explanations.
- `src/scene.mjs`: original solids, component selection, camera, and reversible guard pose.

```sh
node --test tests/machine-lab.test.mjs
node scripts/drive.mjs http://localhost:5173/examples/machine-lab/ --actions tests/browser/machine-lab.actions.json
node scripts/drive.mjs http://localhost:5173/examples/machine-lab/ --actions tests/browser/machine-lab.actions.json --width 390 --height 844 --reduced
npm run build
```

Browser checks cover playback, keyboard seeking, a dead centre, partial/full guard reveal, component focus, camera gestures, and reset. Screenshots go to ignored `shots/`. Model tests check closure across a full revolution, numerical differentiation of velocity, periodicity, valid geometry, and reversible guard offsets. The `window.__machineLab` hook exposes `ready`, `stats()`, and `seek(degrees)` for inspection.

## References and attribution

The workflow is informed by [AirsupHQ/machine-skill](https://github.com/AirsupHQ/machine-skill): research a mechanism, state a small model, connect the model to visible geometry and readouts, and make the result inspectable. Upstream's [solver recipe](https://github.com/AirsupHQ/machine-skill/blob/main/references/solvers.md#piston-engines) includes the slider position equation; this example derives its displayed travel and analytic derivative directly from that closure equation.

Upstream is [MIT licensed](https://github.com/AirsupHQ/machine-skill/blob/main/LICENSE), copyright © 2026 Air Supply Technologies Inc. (Airsup). No upstream runtime, scene, assets, template, or recorder is copied here. CRANK is Taster's original implementation, using Taster's camera helper and its installed Three.js dependency. Upstream's film and advanced rendering features are separate from this example; there is no encoded film in this directory.
