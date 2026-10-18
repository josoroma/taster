# Reusable runtime

Read this when implementing camera motion, assembly, or playback. Helpers resolve relative to this skill folder. Copy the required files into the output project; keep both camera and motion files together so the delivered project runs independently.

## Start from a working example

```sh
node /absolute/path/to/taster/scripts/create-project.mjs /absolute/path/to/new-project --template bell-lab
```

The destination must be empty. This copies the selected example into `examples/<template>/` in an independent, editable project, with local fonts, tests, a local server, and a static build. Its root page opens that example. Run `npm install`, `npm start`, `npm test`, and `npm run build` there. Use `--template lumen` for a movement-based adventure, `--template workshop` for a sober CAD construction explanation, `--template ai-history` for chapter-based animation, `--template brain-atlas` for labeled biological inspection, `--template particle-atlas` for staged particle inspection, `--template cyborg-hand` for articulated mechanisms with reversible inspection, `--template molecular-lab` for sourced molecular structures, `--template taster-diagram` for interactive SVG diagrams, or `--template taster-film` for Hyperframes video. The film README includes its separate render command; normal preview uses the common server.

Bell Lab is a reference implementation of a scientific explainer with a puzzle. Replace its model, lesson, and visual mappings together; a new subject must not retain quantum-specific labels or claims. Keep the existing dependency version until a change is justified. Never generate work inside the installed skill by default.

## Technical CAD viewer

`kit/technical-viewer.mjs` exports `createTechnicalViewer(canvas,{onUserIntent,reducedMotion})`. The canvas needs a parent with `position:relative` and a definite height. The viewer inserts non-interactive projected dimension labels into that parent.

```js
const viewer = createTechnicalViewer(canvas, { reducedMotion, onUserIntent: pause });
// Asset URL relative to examples/workshop/index.html:
const manifest = await viewer.load('./assets/cad-plate/manifest.json');
viewer.setStage(2); // Completed CAD snapshot; no repeated Boolean operations.
viewer.setView('iso'); // Also 'top' and 'front'.
viewer.setHiddenEdges(false);
// In the caller's animation loop:
viewer.render(dt);
```

The manifest contract is documented in [the CAD asset guide](../examples/workshop/assets/cad-plate/README.md): source units, Z-up bounds, indexed triangles, sampled topology edges, and measured properties per stage. Load once per viewer. Its material palette is sober by default, with solid visible boundaries and optional subdued dashed occluded boundaries. An accent marks boundary curves introduced or changed since the previous stage, based on their sampled geometry. Triangle tessellation edges are never drawn. This does not compute new view-dependent silhouettes of arbitrary curved surfaces; use a kernel technical drawing or extend the silhouette pass when that matters.

The viewer also exposes `zoomBy`, `panBy`, `resetCamera`, `cancelCameraShot`, `setReducedMotion`, `resize`, `stats`, and `dispose`. Named views fit projected part/dimension bounds and use orthographic projection. A user gesture cancels the shot; the callback should pause the explanatory transport. Stage changes preserve inspection. All existing sample stages have equal outer bounds; a new model with changing dimensions should fit the union of relevant bounds and derive dimensions for its selected stage.

Workshop displays precomputed CAD assets. Rebuild those with `uv run scripts/build-cad-example.py`; the script's metadata pins the Python dependency. The script checks valid solids, closed meshes, cut depths, and STEP/STL round trips. Copy the assets, model source, builder, viewer, and its camera/motion dependencies into a new project, as `--template workshop` does. The browser does not need a Python environment. Read [engineering-explainers.md](engineering-explainers.md) for robotics and printing choices; this viewer alone is neither a robot solver nor a slicer.

## One camera owner

`kit/camera-rig.mjs` imports the project's `three` and `three/addons/controls/OrbitControls.js`. It works with perspective and orthographic cameras. Use an import map or the project's bundler for those module specifiers.

```js
const rig = createCameraRig(camera, canvas, {
  target: [0, 0, 0], radius: 6,
  minDistance: 3, maxDistance: 50,
  reducedMotion,
  onUserIntent: () => { tourOwnsCamera = false; },
});
rig.fit({ center: [0, 0, 0], radius: 6, duration: 0 });
// Every frame:
rig.update(dt);
```

The rig supports pointer orbit, right/Shift-drag pan, wheel zoom to the cursor, one-finger orbit, and two-finger dolly/pan. A gesture interrupts an active scripted move. Only an explicit tour-resume action should let narration take the camera again.

| Method | Contract |
| --- | --- |
| `focus({position, target, duration?, zoom?})` | Arrays are world-space coordinates. Capture current pose and ease to the destination. |
| `fit({center, radius, direction?, duration?})` | Frame a bounding sphere using the tighter horizontal/vertical field of view; set appropriate clipping. |
| `zoomBy(factor)` | Factor greater than 1 zooms in; respects bounds. |
| `panBy(dx,dy)` | Screen-pixel offsets; positive x is right, positive y is down. |
| `reset({duration?})` | Return to constructor pose. For a responsive overview, use `fit` with current bounds instead. |
| `setReducedMotion(boolean)` | Finish camera moves immediately and disable inertial damping. |
| `getState()` / `isTransitioning()` | Read-only camera snapshots for verification. |
| `cancelShot()` | Stop a scripted move at its current pose without claiming user camera ownership; pair with tour pause. |
| `dispose()` | Remove the rig's controls and event listeners. |

The rig does not capture global keyboard input. Add focused-canvas keys and visible buttons: +/- for zoom, arrows for pan, Home for overview. Let buttons and inputs keep normal browser keyboard behavior. Resize the renderer and camera aspect before refitting. Fit the maximum exploded bounds when appropriate; do not refit on every frame or pointer movement.

## Reversible assembly

`kit/motion.mjs` has no DOM or renderer dependency. Capture rest transforms once, in each part's parent's coordinate system:

```js
const parts = [
  {object: lid, rest: capturePose(lid), translation: [0, 3, 0]},
  {object: tray, rest: capturePose(tray), translation: [0, -2, 0], delay: .1, span: .8},
];
applyAssembly(parts, progress); // progress is always in [0,1]
```

`assemblyPose(rest, offset, progress)` returns position, quaternion, and scale arrays without changing its inputs. `applyAssembly` writes those arrays to Three.js-like objects. Translation is parent-local; `rotation` is an optional absolute destination quaternion; `scale` is a relative multiplier. `delay` and `span` stagger a part within overall progress. Keep `delay + span <= 1` when the full travel must finish at progress 1.

Positions are derived from the immutable rest pose on every sample. Quaternion interpolation takes the shortest arc. Repeated separation, seeking backward, and reassembly cannot accumulate displacement. This does **not** automatically prove collision clearance or route flexible cables; those are scene-specific responsibilities described in [camera-and-assembly.md](camera-and-assembly.md).

Use `damp(current,target,rate,dt)` for a button-triggered transition that follows a target. For scrubbing, sample the exact requested progress directly so one timestamp always produces one pose.

## Playback and narration

```js
const clock = createTransport({duration:24});
clock.play();
const {time, progress, playing} = clock.update(dt);
const separation = segmentProgress(time, 2, 6);
```

`createTransport` exposes `play`, `pause`, `toggle`, `seek(seconds)`, `step(seconds)`, `setRate(nonzeroRate)`, `update(dt)`, and `getState`. Playback stops at either endpoint; `loop:true` is optional. Negative rates play backward. The caller pauses when hidden and chooses whether reduced motion starts paused. The helper does not run timers or request frames.

`segmentProgress(time,start,end,ease?)` clamps a stage to 0..1 and defaults to quintic easing. Derive transforms, captions, and model states from the same timeline; do not execute a gate twice because a scrubber crosses a point twice. For branching games, keep simulation state separate from the explanatory tour and reset explicitly when changing mode.

## Verification tools

`scripts/capture.mjs` and `scripts/drive.mjs` provide browser capture and interaction checks. Always pass the actual scene selector (`#lab`, `#game`, `#workshop`, `#ai-history`, `#brain-atlas`, `#particle-atlas`, `#cyborg-hand`, or your own); their default may select a small SVG logo.

```sh
node scripts/capture.mjs http://localhost:5173/taster/examples/bell-lab/ --select '#lab' --out shots/bell.png --width 1440 --height 960 --scale 1
node scripts/drive.mjs http://localhost:5173/taster/examples/bell-lab/ --actions steps.json --width 390 --height 844
```

Drive actions include `["click","#assembly-toggle"]`, `["wait",700]`, `["shot","shots/apart.png","#lab"]`, `["eval","window.__bellLab.stats()"]`, and `["until","condition",5000]`. Use an actions file for JavaScript strings. `--no-webgl` tests the graphics fallback; `--reduced` emulates reduced motion. Inspect images, verify console output, and check real pointer/keyboard/touch behavior. The driver’s generic key helper does not send every native virtual-key code; use an appropriate browser test for native dialog Escape behavior before diagnosing an app bug.
