# DEXTRA

A future robotic hand, rendered as an inspectable mechanism. Open the fingers, close a fist, then lift the shell and separate the assembly to discover its structure. A restrained green signal color, dark metal, pale armor, and precise joints give the scene a quiet cybernetic character.

The complete 32-second sequence moves from extension to closure, holds the fist, releases it, separates the open mechanism, and reassembles it. All visual geometry is generated in code. This is an interactive browser example; no rendered video or audio track is included.

[Explore DEXTRA](https://josoroma.github.io/taster/examples/cyborg-hand/).

## Run the source

From the Taster root:

```sh
npm install
npm start
```

Open the address printed by the server and choose **DEXTRA** from the example catalog. `npm run build` creates the static entry at `dist/examples/cyborg-hand/index.html`.

## Explore

- Use **Extend hand** and **Close the fist**, or set the finger-closure slider to any intermediate pose. Watch the index finger's joint angles change with the geometry.
- Choose **Separate layers** to inspect the open mechanism and **Reassemble** to restore it. Separation and operating motion are coordinated so the disconnected mechanism is not shown closing.
- Play the complete sequence, pause, scrub, or select a stage directly. Reversing the timeline restores the same pose at the same timestamp.
- Select a named subassembly to read its role and inspect its shape.
- Drag to orbit, Shift/right-drag to pan, and scroll to zoom. One-finger orbit and two-finger pinch/pan work on touch screens. Camera buttons provide visible alternatives.
- Focus the scene for keyboard inspection: arrow keys pan, `+`/`−` zoom, `Home` frames the mechanism, and `Space` plays or pauses the study. User camera input interrupts guided camera travel.

Reduced-motion preferences suppress unsolicited travel and decorative animation; the mechanism remains available through direct controls and explicit playback.

## Mechanism and scope

DEXTRA is an authored robotic concept. The hand has four fingers with three serial hinge coordinates each, plus a thumb with a compound base pose and two flexing links. Each child link moves in its parent's frame. The thumb begins its opposing motion after the fingers have started to curl. This is a prescribed kinematic trajectory, not a dynamics or grasp simulation. Parent/child links, joint origins, axes, and limits are the same underlying concepts demonstrated in the [ROS movable robot description](https://raw.githubusercontent.com/ros/urdf_tutorial/ros2/urdf/06-flexible.urdf).

Angles are radians internally and may be displayed in degrees. Lengths are arbitrary display units, with no manufacturing scale. The local frame is right-handed: `+Y` points from wrist to fingertips, `+X` across the palm toward the little finger, and `+Z` outward from the back of the hand. Positive flexion values are applied as negative local X rotations, taking the fingers toward the palm (`−Z`). These documented display axes are not the default ROS body axes; [ROS REP 103](https://raw.githubusercontent.com/ros-infrastructure/rep/master/rep-0103.rst) provides the robotics reference for coordinate conventions and angle units.

Visible actuators, rods, armor, and separation paths explain arrangement. They do not establish motor torque, grip strength, electrical behavior, cable tension, contact forces, or collision avoidance. The exploded view is schematic, not a validated disassembly procedure. The geometry is neither a tested prosthesis nor a dimensioned CAD solid, and there is no print-ready or robot-control export.

The model samples grip and separation from bounded absolute values. Operational motion and exploded assembly use separate channels. The sequence reaches a fully open hand before separation and returns to exactly zero separation at its endpoint. Seeking backward, replaying, and repeated round trips do not accumulate offsets.

## Editable source

| File | Purpose |
| --- | --- |
| [src/model.mjs](src/model.mjs) | Part descriptions, finger dimensions and limits, pure grip poses, and the six-stage sequence. |
| [src/scene.mjs](src/scene.mjs) | Procedural hand geometry, serial joint hierarchy, materials, lighting, and camera inspection. |
| [main.mjs](main.mjs) | Pose controls, playback, selection, readouts, and accessibility. |
| [index.html](index.html) | Semantic structure and visible controls. |
| [style.css](style.css) | Responsive presentation. |
| [../../tests/cyborg-hand.test.mjs](../../tests/cyborg-hand.test.mjs) | Joint bounds, forward-link behavior, delayed opposition, sequence continuity, and deterministic round trips. |
| [../../tests/browser/cyborg-hand-labels.actions.json](../../tests/browser/cyborg-hand-labels.actions.json) | Browser regression for moving anchors, continuous playback, stable callout positions, and occluded components. |

`sampleGrip(value)` returns a clamped grip, four finger-angle triples, and thumb opposition, base, tip, and spread coordinates. `sampleSequence(seconds)` returns the clamped timestamp, stage, progress, grip, and separation. Both are pure functions. Geometry consumes those values rather than inventing its own timing.

The runtime uses pinned Three.js, local fonts, and Taster's shared camera and transport foundations. It needs no remote model, image assets, or rendering service.

Label connectors follow exposed surfaces on each moving component. Alternate anchors keep a visible component annotated when its original anchor passes behind another link; covered components remain unlabelled. Callouts retain their screen positions while their endpoints update with each rendered frame.

With the development server running, verify the label behavior in Chrome from the Taster root:

```sh
node scripts/drive.mjs http://localhost:5173/taster/examples/cyborg-hand/ --actions tests/browser/cyborg-hand-labels.actions.json --width 1440 --height 1100
```
