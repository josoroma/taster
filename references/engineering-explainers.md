# Sober engineering explainers

Read this for CAD construction, robotics, mechanisms, assembly instructions, or 3D-printing animations. The aim is a legible explanation with inspectable geometry. A small, accurate construction sequence is preferable to an ornamental industrial scene. Reuse [camera-and-assembly.md](camera-and-assembly.md) for camera ownership, reversible poses, and deterministic time; do not implement a second competing controller.

## Choose the representation

Infer the needed mode from the question. A close reference like [smlibpy](https://smlibpy.classcad.ch/) calls for restrained surfaces, linework, and operation-by-operation explanation. Its styling is inspiration, not a requirement to copy its site or install its MCP server.

| Question | Useful representation | Model that must remain authoritative |
| --- | --- | --- |
| How is this part constructed? | Sketch, tool/body, result; aligned code or feature list | Executed CAD operations or explicitly schematic geometry |
| How does this robot move? | Links, joint axes, reachable poses, optional end-effector trace | Kinematic hierarchy and joint coordinates |
| How does it come apart? | Identified parts and ordered assembly paths | Rest transforms and reversible separation progress |
| How does a printer build it? | Cross-sections, layers, deposition and travel paths | Slicer data, or a labeled conceptual process |

Use SVG for fixed-view diagrams with a small number of shapes. Use orthographic 3D when rotation, occlusion, sections, joint movement, or inspection of real CAD geometry matters. For a series of pre-rendered construction snapshots, retain identical framing so the change is the subject. Perspective can explain spatial relationships but should be deliberate, with an orthographic inspection view available when dimensions matter.

## Visual grammar

Default to a warm off-white or charcoal ground, muted gray solids, off-white/dark ink outlines, and one restrained accent such as coral. A typical dark starting palette is background `#17191e`, panel `#202329`, ink `#d6d9dd`, secondary `#9da3ad`, accent `#e87369`. Adapt for contrast and the user's reference. No bloom, lens flare, star field, perpetual idle spin, or decorative particles by default.

Use line meaning consistently, with a short legend when several meanings coexist:

- Solid contour: visible boundary. Keep the silhouette clearer than internal seams.
- Dashed, subdued line: a hidden edge when revealing it helps the explanation.
- Dotted ghost: a previous position or removed volume, explicitly identified as such.
- Dash-dot line: axis or reference centerline; arrow: motion or dimension direction.
- Accent: the selected feature, active tool, changed region, or current path segment. Do not color every component as if all were active.

These are an explanatory convention, not a claim of compliance with a drawing standard. If a manufacturing drawing is requested, follow its specified standard and projection convention. Depth-test visible edges against the solid. Hidden-edge rendering needs an actual visibility pass or a kernel-generated drawing; an edge overlay with depth testing disabled makes every edge visible and is not hidden-line removal. Avoid showing triangle edges as CAD feature edges. Cap and hatch section cuts, show the cutting plane, and keep the uncut outline available for orientation.

Arrange the current operation, the model, and its one-sentence result within the same view. On narrow screens, keep the active line and essential controls reachable without tiny type. Use code only when coding is part of what the viewer is learning; a feature list is usually better for a mechanical audience. Line selection, keyboard stepping, timeline position, caption, and geometry must share one stage ID. Hover may preview a stage, but cannot be the only way to choose it.

## CAD: execute, then explain

Distinguish three deliverables: an illustrative mesh, a true CAD solid, and an editable feature/constraint model. A browser mesh can explain an operation without being a CAD kernel. Do not imply that changing a mesh's appearance performs a fillet, Boolean, or shell operation, or that a renamed mesh file is STEP.

For actual CAD, use the requested available kernel and inspect its current primary documentation. SMLibPy produces parts from a script and rerunning it rebuilds them. ClassCAD retains a feature dependency/history model, constrained sketches, and assembly relationships. A stepped SMLibPy script is not automatically a ClassCAD feature tree. [SMLibPy and ClassCAD](https://smlibpy.classcad.ch/) describe the distinction.

Use a compact build pipeline:

1. Define parameters with units and coordinate conventions. Generate each logical stage from source, retaining the resulting body and a stable semantic stage ID.
2. Measure that body and store its display mesh/edges or fixed-view render with its operation description. Derive dimension, volume, and topology readouts from the matching stage; never reuse the final part's values for an earlier stage.
3. Display the selection/tool/profile briefly, perform or reveal the change, then hold the result long enough to inspect it. A Boolean result may change topology discretely; do not interpolate arbitrary vertex arrays as if they describe the operation.
4. Keep the source script and any real exports with the artifact. The browser can play cached results without rerunning the kernel. Rebuild the cache when parameters change, or clearly restrict controls to playback rather than suggesting live parametric editing.

In SMLibPy, primitive placement, sketch normals, and sign of extrusion matter; consult the [parts guide](https://smlibpy.classcad.ch/docs/parts/). Select features by geometry or meaningful IDs where possible; a face index may change after a Boolean. Validate selected counts, resulting bounds and volumes, and intended holes/pockets before accepting a stage. A plausible picture alone is insufficient evidence that the cut occurred.

STEP carries CAD geometry; STL and glTF are tessellated representations. Record meshing tolerance and unit conversions. SMLibPy models use millimeters, while its glTF export includes a conversion to meters; STL has no declared units. Its picture renderer supports orthographic views and technical drawings. Use current [files and pictures documentation](https://smlibpy.classcad.ch/docs/files/) for exact options. Test the delivered export by reading it back when claiming that it is valid, and compare relevant bounds, volume, and body count. Do not report a mesh as printable solely because it renders.

If live browser CAD is actually needed, [SMLib's JavaScript/WASM documentation](https://smlibpy.classcad.ch/docs/javascript/) describes `@classcad/smlibwasm`. Confirm the installed version's API and loading requirements; Python names/operators do not transfer literally to JavaScript. A cached explainer needs neither a kernel download nor a server at playback time. Do not add external account configuration or an MCP installation merely to emulate a reference's visual style.

The included [mounting-plate source](../examples/workshop/assets/cad-plate/source.py) and [CAD asset guide](../examples/workshop/assets/cad-plate/README.md) demonstrate this pipeline. Run `uv run scripts/build-cad-example.py` from the Taster root to regenerate four measured construction stages and the STEP/STL exports using its pinned SMLibPy dependency. The browser reads `examples/workshop/assets/cad-plate/manifest.json`; it does not execute Python. [kit/technical-viewer.mjs](../kit/technical-viewer.mjs) and [examples/workshop/src/scene.mjs](../examples/workshop/src/scene.mjs) are the corresponding rendering foundation. Read their current exports before reusing them; the sample is one plate, not a general constraint solver, slicer, or robot dynamics engine.

## Robotics: move joints, not pictures

Separate geometry from articulation: each link owns a mesh offset, each joint owns a parent-relative origin, an axis, a type, and a coordinate. Compose world poses through the parent chain. Revolute joints rotate around their joint origin; prismatic joints translate along their local axis. Changing a mesh's center to make a rotation look plausible loses the mechanism's reference frame.

Document handedness, axis directions, length units, and angle units once. Convert CAD millimeters to the robotics model deliberately. ROS conventions use SI units and right-handed frames; use an existing robot's declared frame conventions when supplied. A compact axis marker and selected joint label are more useful than permanently showing every frame. [ROS REP 103](https://raw.githubusercontent.com/ros-infrastructure/rep/master/rep-0103.rst).

Joint controls should respect the model's limits and show the selected angle or displacement. Fixed, continuous, revolute, and prismatic joints have different behavior; preserve it when reading a robot description. [The ROS movable robot example](https://raw.githubusercontent.com/ros/urdf_tutorial/ros2/urdf/06-flexible.urdf) illustrates origins, axes, limits, and link relations. For inverse kinematics, make unreachable targets and the selected solution branch visible rather than silently stretching a link. Label a prescribed trajectory as kinematic; do not imply simulated torque, contact, load capacity, or collision avoidance unless those models actually run.

Keep exploded assembly transforms separate from operational joint motion. Pause the motion before inspecting a disconnected mechanism, or provide a clearly labeled schematic view. Author withdrawal/rotation stages around real mating directions; show a screw loosening before extraction only if that operation is being explained. A threaded appearance is not a simulated screw constraint. Verify a home pose, a known intermediate pose, joint limits, and exact return from separation. For closed chains, solve or author the coupled motion so the loop remains closed.

## 3D printing: separate shape, slicing, and deposition

Choose the process explicitly. An FFF/FDM explanation may show model orientation, slice planes, perimeters, infill, supports, nozzle travel, and deposited material. A resin process has a different exposure and motion sequence. A stack of horizontal contours explains layers; it does not by itself constitute a slicer or a printer-ready job.

For schematic paths, say so near the process description. For imported slicer paths, preserve the file's units, absolute/relative modes, extrusion/travel distinctions, layer changes, and supported metadata. Display unknown classifications honestly. Slicer comments may be needed to identify path types, and preview timing is an estimate. [Prusa's viewer documentation](https://help.prusa3d.com/article/prusaslicer-g-code-viewer_193152) explains layer/time controls and these interpretation limits.

Reveal material only behind completed deposition moves, leave travel moves unfilled, and differentiate the active layer from completed layers. Tie the nozzle pose, visible path length, layer counter, and caption to the same deterministic timeline. If teaching a selected slice, preserve its height when orbiting. Show scale and units for layer height and nozzle diameter where relevant; never silently scale one to make the picture more dramatic.

An explainer request authorizes a visualization, not a machine run. Do not transmit robot commands or printer jobs, or imply that the illustrative sequence is tested G-code. Create a real manufacturing export only when requested and supported by the chosen toolchain; identify what validation was performed.

## Timing and inspection

Hold the camera still during the change that the audience needs to compare. Prefer one primary motion at a time: highlight, move/cut/deposit, then hold. Use brief eased camera transitions between inspection views, without overshoot on precise mating. Constant-rate movement is useful when teaching velocity; an eased presentation is not a physical motion profile. Label time compression where actual duration matters.

Support play/pause, direct stage selection, backward/forward stepping, and scrubbing. Preserve the same model at the same time regardless of travel direction. Reconstruct operations from snapshots rather than accumulating cuts during the render loop. Essential inspection includes zoom, pan, reset/frame, and a few purposeful views such as ISO, top, and front; avoid exposing every renderer setting.

Verify the explanation's own promises: line highlight matches its geometry; dimensions have units; selection survives stage changes; hidden lines and sections tell the truth; reverse seeking restores prior geometry; labels remain legible at close-up and overview; assembled and exploded states fit the viewport. Check desktop, narrow layout, keyboard use, reduced motion, and the actual exported artifact when present. Adapt the checks to the chosen mode rather than building a robot simulator for a simple plate animation.
