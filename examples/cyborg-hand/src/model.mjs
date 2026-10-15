/**
 * DEXTRA — a conceptual right-hand mechanism, not a manufactured robot.
 * Lengths use arbitrary display units. Angles use radians. Local +Y runs from
 * wrist to fingertips, +X across the palm toward the little finger, +Z dorsal.
 * Flexion values are positive magnitudes; the scene applies -angle about local X
 * so finger links curl toward the palm (-Z). Every pose is sampled absolutely.
 */
export const DURATION = 32;

export function clamp01(value) {
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
}

const smooth = value => {
  const u = clamp01(value);
  return u * u * (3 - 2 * u);
};

export const PARTS = Object.freeze([
  {
    id:'carapace', name:'Dorsal carapace', kicker:'01 / PROTECT',
    description:'A floating shell reveals the mechanism beneath.',
    detail:'The silver outer plates lift away from the back of the hand during inspection. Their separation is an explanatory view, not a manufacturing or service procedure.',
  },
  {
    id:'actuators', name:'Actuator bank', kicker:'02 / DRIVE',
    description:'Four compact drive channels coordinate the finger curl.',
    detail:'The visible rods and guides illustrate a drive layout. Joint motion follows a prescribed kinematic pose; motor torque, gearing, cable tension, and energy use are not simulated.',
  },
  {
    id:'fingers', name:'Articulated fingers', kicker:'03 / ARTICULATE',
    description:'Three hinge coordinates per finger turn reach into a fist.',
    detail:'Each link inherits the pose of its parent. The base, middle, and terminal joints curl together along a controlled trajectory; their displayed angles come from the same state that moves the geometry.',
  },
  {
    id:'thumb', name:'Opposing thumb', kicker:'04 / OPPOSE',
    description:'The thumb sweeps across after the fingers begin to fold.',
    detail:'A compound base pose and two flexing links create a recognizable closing gesture. The path is an authored mechanical concept, not a model of human tendons or a validated grasp controller.',
  },
  {
    id:'wrist', name:'Wrist interface', kicker:'05 / CONNECT',
    description:'A rigid collar anchors the assembly and its reference frame.',
    detail:'The wrist stays fixed during the closing cycle so the changing finger geometry is easy to compare. All components return to their exact rest positions after reassembly.',
  },
].map(Object.freeze));

export const FINGERS = Object.freeze([
  {id:'index', name:'Index', x:-.85, baseY:1.28, lengths:[1.04,.73,.51], width:.46, splay:.045, maxAngles:[1.36,1.70,1.12]},
  {id:'middle', name:'Middle', x:-.27, baseY:1.28, lengths:[1.17,.82,.57], width:.50, splay:0, maxAngles:[1.36,1.70,1.12]},
  {id:'ring', name:'Ring', x:.32, baseY:1.28, lengths:[1.10,.76,.53], width:.46, splay:-.025, maxAngles:[1.36,1.70,1.12]},
  {id:'little', name:'Little', x:.83, baseY:1.28, lengths:[.86,.58,.43], width:.38, splay:-.065, maxAngles:[1.36,1.70,1.12]},
].map(finger => Object.freeze({...finger, lengths:Object.freeze(finger.lengths), maxAngles:Object.freeze(finger.maxAngles)})));

export const THUMB = Object.freeze({
  origin:Object.freeze([-1.00,-.10,-.08]),
  lengths:Object.freeze([.85,.67]),
  maxOpposition:.80, maxBase:.15, maxTip:.35,
  openSpread:.75, closedSpread:-1.15,
});

export const STAGES = Object.freeze([
  {id:'open', start:0, end:4, name:'Open hand', title:'Five digits. One coordinated gesture.', caption:'Begin with an extended hand. The fixed wrist gives every moving link a clear reference.', part:'fingers'},
  {id:'close', start:4, end:10, name:'Close fist', title:'The joints fold. The gesture emerges.', caption:'The three finger hinges curl together. The thumb follows later, sweeping across the folded fingers.', part:'fingers'},
  {id:'hold', start:10, end:13, name:'Hold', title:'A fist, held in geometry.', caption:'The closed pose is held for inspection. The angle readouts describe joint positions, not force or grip strength.', part:'thumb'},
  {id:'release', start:13, end:18, name:'Release', title:'Unfold along the same path.', caption:'Reverse the joint coordinates and the fingers return to the same open pose. There is no accumulated drift.', part:'fingers'},
  {id:'separate', start:18, end:25, name:'Separate', title:'Lift the shell. Read the mechanism.', caption:'With the hand open, the shell and subassemblies separate into an explanatory view. This reveals their relationships.', part:'carapace'},
  {id:'reassemble', start:25, end:32, name:'Reassemble', title:'Every part finds its place.', caption:'The same separation coordinate runs in reverse. The mechanism arrives precisely at its original assembled pose.', part:'actuators'},
].map(Object.freeze));

/** Independent joint state for a requested grip; no state survives this call. */
export function sampleGrip(value) {
  const grip = clamp01(value);
  // Smooth the joint coupling, leaving exact fully extended/closed endpoints.
  const base = smooth(grip);
  const middle = smooth(grip);
  const terminal = smooth(Math.max(0, (grip - .08) / .92));
  const opposition = smooth(Math.max(0, (grip - .28) / .72));
  return {
    grip,
    fingers:FINGERS.map(finger => ({
      id:finger.id,
      angles:[finger.maxAngles[0]*base, finger.maxAngles[1]*middle, finger.maxAngles[2]*terminal],
      splay:base===1 ? 0 : finger.splay*(1-base),
    })),
    thumb:{
      opposition:THUMB.maxOpposition*opposition,
      base:THUMB.maxBase*opposition,
      tip:THUMB.maxTip*opposition,
      spread:opposition===1 ? THUMB.closedSpread : THUMB.openSpread+(THUMB.closedSpread-THUMB.openSpread)*opposition,
    },
  };
}

/** A 32-second reversible sequence; operational and separated poses never mix. */
export function sampleSequence(value) {
  const time = Number.isFinite(value) ? Math.max(0, Math.min(DURATION,value)) : 0;
  const stageIndex = Math.max(0, STAGES.findIndex(stage => time < stage.end));
  // A completed sequence belongs to its last stage, rather than wrapping open.
  const index = time===DURATION ? STAGES.length-1 : stageIndex;
  const stage = STAGES[index];
  const localProgress = clamp01((time-stage.start)/(stage.end-stage.start));
  const u = smooth(localProgress);
  const grip = stage.id==='close' ? u : stage.id==='hold' ? 1 : stage.id==='release' ? 1-u : 0;
  const separation = stage.id==='separate' ? u : stage.id==='reassemble' ? 1-u : 0;
  return {time, progress:time/DURATION, stage, stageIndex:index, index, localProgress, grip, separation, finished:time===DURATION};
}

export const SOURCES = Object.freeze([
  Object.freeze({title:'Movable robot description', author:'ROS URDF tutorial', url:'https://raw.githubusercontent.com/ros/urdf_tutorial/ros2/urdf/06-flexible.urdf', detail:'Primary example of parent/child links, joint origins, axes, types, and coordinate limits.'}),
  Object.freeze({title:'Standard Units of Measure and Coordinate Conventions', author:'ROS REP 103', url:'https://raw.githubusercontent.com/ros-infrastructure/rep/master/rep-0103.rst', detail:'Reference for right-handed coordinate frames and radian angle units. DEXTRA uses its own documented display axes and arbitrary length units, not ROS SI geometry.'}),
]);
