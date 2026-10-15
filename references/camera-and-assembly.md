# Camera, assembly, and time

Read this for spatial inspection, guided shots, or parts that separate and reconnect. [kit.md](kit.md) documents the implemented helpers; the rules here explain how to use them coherently.

## Camera ownership

Represent camera ownership explicitly: **manual**, **scripted shot**, or **guided timeline**. Never let OrbitControls, an idle loop, and a tween all write the pose in the same frame.

A pointer gesture, wheel, camera key, or camera button immediately cancels the active shot and releases narration's camera ownership. Preserve the current pose, including a halfway transition. Resume camera guidance only through an explicit action such as “Resume tour”; an idle timer must not wrestle the view away while the reader studies a detail. Pausing a tour pauses its camera, captions, and model progression together.

Frame the subject once before the first useful interaction. Offer **Frame selection**, **Overview**, and **Reset** when they serve different purposes: frame uses current bounds, overview uses the whole composition, and reset restores the initial camera. Fit on deliberate commands and major layout changes, not every animation frame.

## Gestures and bounds

For a full 3D canvas, use drag to orbit, right/Shift-drag to pan, wheel to zoom, one finger to orbit, and two fingers to pinch/pan. Provide visible equivalents and a focusable canvas with +/- zoom, arrows pan, and Home overview. Scope shortcuts to the scene; leave text inputs, sliders, dialogs, and page scrolling alone. Indicate focus. Handle pointer cancel and release captured pointers on completion.

For an embedded figure, decide deliberately when gestures capture the page. Apply `touch-action: none` only to the interaction surface that truly needs unrestricted gestures, not the whole document; retain a reliable way to scroll the surrounding page. Avoid trapping wheel scrolling outside an active scene.

Perspective zoom usually changes camera distance; orthographic zoom changes magnification. Bound distance/zoom, pan target, and polar angle to keep the subject discoverable and avoid singular orientations. Zoom toward the pointer's scene intersection or target plane; use a stable target when the pointer hits empty space. The helper's `zoomBy` buttons zoom about the current target, while wheel input uses OrbitControls' cursor zoom.

Compute fit from current world-space bounds, aspect ratio, and the narrower horizontal/vertical field of view. Include safe margin for captions and touch controls. Set near/far clipping from the intended viewing range; tiny near planes combined with vast far planes waste depth precision. Recompute bounds for separation and selected subassemblies. For a world that spans atoms to galaxies, use explicit scale transitions and local coordinate systems rather than one enormous float coordinate range.

Tour shots specify target, position or orientation/distance, duration, and what the viewer should notice. Keep a stable up direction, avoid flying through geometry, and interpolate quaternions on the shortest arc. A dolly changes spatial perspective; a focal-length or orthographic zoom changes framing differently. Choose based on the explanation. Use simple cuts or immediate poses in reduced motion.

## Reversible exploded views

Treat separation as a reversible pose, not a sequence of accumulated nudges.

1. Assign stable part and assembly IDs. Give each assembly a clear pivot and parent. Capture position, quaternion, and scale **once** in its parent's coordinate system before animating.
2. Author a route or offset from that rest pose. Parent-local translations follow the parent's axes. Convert a requested world-space direction into that frame explicitly. Group attached fasteners, ports, and labels with the part they belong to.
3. Use one bounded progress value `u ∈ [0,1]`, with 0 assembled and 1 separated. Compute every pose absolutely from rest and `u`. The helper's delayed spans are deterministic portions of that same progress; keep each intended full-travel interval inside 0..1.
4. Reverse by reducing the same progress. Scrub directly to a pose. Repeated open/close must end at the exact rest transform with no drift. Do not recapture rest while moving, repeatedly add offsets, or replay side effects when seeking.

Conceptual relation:

```text
position(u) = restPosition + offset × ease(localProgress(u))
rotation(u) = slerp(restRotation, destinationRotation, ease(localProgress(u)))
```

The supplied helper supports straight translation, quaternion rotation, and scale. A curved path, hinge constraint, cable solver, or collision-free route requires an authored extension; do not imply the helper supplies those automatically. Keep that extension a function of the same progress.

Order routes so outer enclosures clear inner components first; closing follows the reverse path. Inspect intermediate positions and reversals near stagger boundaries. If two parts are threaded through one another, move them as one assembly or depict the real disconnecting operation. Do not rely on drawing order to hide interpenetration. Purposeful conceptual separation may be physically impossible, but label it as a schematic rather than depicting literal manufacture or disassembly.

Connectors attach to transformed anchor points. A rigid connector stays with its owning part and visibly disconnects at a port; a flexible connector needs a route that follows both endpoints. Labels are projected from anchors after world transforms update, hidden or dimmed when occluded, and kept readable in screen space. Use a parts list as an accessible alternative to small 3D hit targets. Selection, highlighting, labels, and camera framing share the same part ID.

## One timeline, several channels

Keep a single authoritative transport time in seconds. Evaluate the model snapshot, assembly pose, emphasis, labels, captions, and optional guided-camera pose from that time. A timestamp must produce the same state whether reached by play, reverse, scrub, or a chapter jump.

Prefer pure `stateAt(time)`/`poseAt(time)` evaluation. If the model is sequential, derive a snapshot by replaying from a known initial state or use checkpoints; do not apply a gate or emit a measurement simply because the render loop crossed a threshold. Seed randomness for reproducible demonstrations. Keep live game state separate from tour state so inspection cannot accidentally advance a challenge.

Expose play/pause, replay, a labeled scrubber, and useful chapter steps for explanatory sequences. Scrubbing pauses playback until resumed and displays the exact requested state. Set time and all dependent channels before rendering. A measurement can be a discrete event: do not turn an easing blend between probabilities into a claim about physical evolution.

Under reduced motion, start guided movement paused, use immediate camera/assembly poses for user actions, and retain stepping and explicit playback where needed. When hidden, stop advancing both narrative and simulation clocks unless background progression is an intentional game rule. Reset the frame timestamp on return.

## Verify the paths people can take

Check manual interruption halfway through a shot, rapid alternating separate/reassemble clicks, backward scrubbing across stage boundaries, replay after completion, resize while separated, extreme zoom, pan recovery, and switching reduced motion during travel. Repeat several round-trips and compare rest transforms numerically. Test the actual hit targets and keyboard buttons, not only debug setters.

Capture and inspect overview, close-up, 0/25/50/75/100% separation, and reassembly at desktop and phone sizes. Look for clipped parts, camera penetration, floating connectors, unintentional intersections, unreadable labels, and abrupt changes. Measure representative frames including the most expensive separated pose. Keep quality reduction independent of timeline speed and numerical model values.
