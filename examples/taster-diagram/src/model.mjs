/** Authored workflow, not a map of runtime services or inferred dependencies. */
export const STAGES = Object.freeze([
  { id:'prompt', number:'01', name:'Start with a question', short:'Prompt', hint:'Intent, audience, references', verb:'gives the brief' },
  { id:'model', number:'02', name:'Make the rules explicit', short:'Model', hint:'State, evidence, assumptions', verb:'drives the view' },
  { id:'representation', number:'03', name:'Choose a visual language', short:'Representation', hint:'Space, structure, sequence', verb:'makes room for action' },
  { id:'interaction', number:'04', name:'Give the viewer agency', short:'Interaction', hint:'Inspect, change, observe', verb:'exposes behavior' },
  { id:'verify', number:'05', name:'Check what it teaches', short:'Verify', hint:'Behavior, legibility, access', verb:'qualifies the result' },
  { id:'deliver', number:'06', name:'Leave something editable', short:'Deliver', hint:'Source, controls, context', verb:null },
]);

export const EDGES = Object.freeze([
  { id:'prompt-model', from:'prompt', to:'model', label:'defines the question', kind:'forward' },
  { id:'model-representation', from:'model', to:'representation', label:'drives the view', kind:'forward' },
  { id:'representation-interaction', from:'representation', to:'interaction', label:'enables inspection', kind:'forward' },
  { id:'interaction-verify', from:'interaction', to:'verify', label:'reveals behavior', kind:'forward' },
  { id:'verify-deliver', from:'verify', to:'deliver', label:'checks the result', kind:'forward' },
  { id:'verify-model', from:'verify', to:'model', label:'revise when needed', kind:'revision' },
]);

export const ROUTES = Object.freeze({
  all: {
    name:'The whole picture', kicker:'One practice. Many forms.',
    description:'Taster turns a question into an experience you can explore. Follow the work from the first prompt to the editable result.',
    outcome:'An idea made inspectable.',
    examples:['Science & engineering','Playable worlds','Molecules · diagrams · video'],
    stages:{
      prompt:['Begin with the thing you want to understand.','Taster reads the audience, purpose, and reference material, then chooses one useful action: a change the viewer can make and a consequence they can see.',['A question to answer','An audience to design for','A reference to learn from']],
      model:['One source of truth for the explanation.','Define the entities, relationships, state, and limits before decorating the scene. Geometry, captions, controls, and outcomes should all describe the same model.',['Explicit assumptions','Authored relationships','Meaningful state']],
      representation:['The subject chooses the medium.','A spatial mechanism may need 3D. A relationship may need a diagram. A timed explanation may need a film. Choose the simplest visual form that makes the idea clear.',['SVG for relationships','WebGL for spatial inspection','A timeline for video']],
      interaction:['Understanding needs a point of entry.','Let the viewer inspect a part, change a variable, or move through time. Every control should reveal something about the subject, and every action should have a clear way back.',['Inspect a meaningful part','Change and observe','Pause, reset, or return']],
      verify:['Does it work, and does it explain?','Check consequential claims, model behavior, visual clarity, keyboard use, narrow screens, and reduced motion. When a check reveals a problem, revise the model or presentation.',['Model checks','Browser inspection','Accessible controls']],
      deliver:['The artifact belongs to its next author.','Deliver runnable, editable source with controls and honest scope. The result can keep evolving after the first explanation is complete.',['Editable source','A runnable example','Sources and limitations']],
    },
  },
  molecular: {
    name:'Molecular structure', kicker:'From coordinates to context.',
    description:'Use a sourced structure to explain molecular shape and relationships. Keep measured coordinates distinct from illustrative motion.',
    outcome:'A structure you can inspect.', examples:['Coordinate provenance','Selectable structures','Honest motion'],
    stages:{
      prompt:['Ask a structural question.','Choose what the viewer should inspect: a fold, a binding interface, or the arrangement of a complex. A reference image can set visual intent; it is not coordinate data.',['Biological question','Relevant assembly','Intended scale']],
      model:['Keep the structure traceable.','Record the source accession, assembly, chain and residue identifiers, coordinate units, and missing data. An illustrative transition is not a molecular-dynamics trajectory.',['Sourced coordinates','Stable identifiers','Declared approximations']],
      representation:['Show structure at the right scale.','Use ribbons for a fold, sticks for a local contact, and surfaces for shape or accessibility. Preserve the scientific meaning of element and chain colors.',['Ribbons and surfaces','Atoms and bonds','Readable selections']],
      interaction:['Move from the whole to a contact.','Provide orbit, zoom, fit, and selection. If the view separates components, make that display transform reversible and measure distances in the original coordinates.',['Fit the assembly','Inspect a residue','Restore the structure']],
      verify:['Check the biological and visual story.','Confirm parsing, selected atom counts, units, and repeatable reset. Do not present a close distance as proof of a bond, affinity, or therapeutic effect.',['Coordinate checks','Representation checks','Scientific scope']],
      deliver:['Keep the evidence with the viewer.','Ship the coordinate source or its reproducible retrieval path, the editable viewer, and the limitations. Explain whether motion is measured, simulated, or illustrative.',['Structure provenance','Editable viewer','Motion disclosure']],
    },
  },
  diagram: {
    name:'Interactive diagram', kicker:'Relationships, made readable.',
    description:'Turn authored entities and connections into a diagram that rewards inspection. This page is one example of that practice.',
    outcome:'A system you can follow.', examples:['Authored topology','Focused inspection','Portable SVG'],
    stages:{
      prompt:['Decide what the diagram must say.','Choose a single question and a diagram type that answers it: workflow, architecture, sequence, hierarchy, or another explicit relationship.',['One central claim','A defined audience','A suitable diagram type']],
      model:['Author the graph before the layout.','Give nodes stable identifiers and connect them with directional, labeled relationships. Distinguish sequence, containment, dependencies, and feedback rather than making every line mean the same thing.',['Stable node IDs','Labeled edge types','Source-backed claims']],
      representation:['Use hierarchy, not decoration.','Choose a reading order, keep labels out of connectors, and reserve the accent for what matters. Carry the established identity through type, paper, ink, and spacing.',['An intentional reading order','Legible connector routes','The project’s identity']],
      interaction:['Reveal the graph already present.','Focus a node and follow its authored connections. Details and path highlights must come from the graph; they should never invent a dependency or imply measured runtime behavior.',['Node details','Related relationships','Forward-path tracing']],
      verify:['Inspect the whole and the detail.','Check endpoints, label collisions, ambiguous arrows, keyboard focus, small screens, and the exported image. Verify that a highlighted path contains only authored edges.',['Topology checks','Visual inspection','Export verification']],
      deliver:['Export the explanation, keep the source.','Provide the editable graph and layout. A standalone SVG should preserve its type, colors, labels, and accessible description independently of the current zoom or focus.',['Editable graph source','Self-contained SVG','Accessible description']],
    },
  },
  video: {
    name:'Explanatory video', kicker:'Time becomes a design material.',
    description:'Build a short explanation from an explicit timeline. The preview and rendered frames should tell the same story at the same time.',
    outcome:'A story you can replay.', examples:['Authored scenes','Deterministic time','Rendered frames'],
    stages:{
      prompt:['Write the reveal before the shots.','Choose the idea, audience, duration, aspect ratio, and final format. Plan a short sequence with a reason for every transition.',['A clear takeaway','A scene sequence','A delivery format']],
      model:['Give the film one clock.','Represent duration, scene boundaries, captions, and visual state explicitly. Sample the state at a time instead of accumulating changes through playback.',['One absolute timeline','Known scene boundaries','Repeatable state']],
      representation:['Compose each frame deliberately.','Use the identity’s typography, contrast, and rhythm. Stage a clear subject, preserve safe margins, and let transitions explain a change in the idea.',['Readable frame composition','Purposeful transitions','Consistent identity']],
      interaction:['Preview the exact moment.','Provide play, pause, seek, replay, and scene stepping. Scrubbing backward should produce the same frame as seeking directly to that time.',['Play and pause','Seek to a moment','Step through scenes']],
      verify:['Inspect the rendered result.','Check boundaries, first and last frames, text clipping, and timing. Verify the requested export in a media player; an interactive preview alone is not a rendered video.',['Repeatable frame samples','Boundary inspection','Media verification']],
      deliver:['Ship the film and its editable timeline.','Keep composition source, assets, timing, and the render command together. State the actual resolution, duration, and format of any rendered media.',['Editable composition','Render instructions','Verified media output']],
    },
  },
});

export function inspectStage(route, stage) {
  if (!Object.hasOwn(ROUTES, route) || !STAGES.some(item => item.id === stage)) throw new RangeError('Unknown route or stage');
  const [title, text, evidence] = ROUTES[route].stages[stage];
  return { ...STAGES.find(item => item.id === stage), title, text, evidence };
}

/** Forward tracing deliberately excludes the separate editorial revision loop. */
export function traceGraph(start, mode = 'related') {
  if (!STAGES.some(item => item.id === start)) throw new RangeError('Unknown starting stage');
  if (!['none','related','forward'].includes(mode)) throw new RangeError('Unknown trace mode');
  if (mode === 'none') return { nodes:STAGES.map(item => item.id), edges:EDGES.map(item => item.id) };
  const nodes = new Set([start]);
  const edges = new Set();
  if (mode === 'related') {
    for (const edge of EDGES) if (edge.from === start || edge.to === start) { nodes.add(edge.from);nodes.add(edge.to);edges.add(edge.id); }
  } else {
    const queue = [start];
    while (queue.length) {
      const current = queue.shift();
      for (const edge of EDGES) if (edge.from === current && edge.kind === 'forward') {
        edges.add(edge.id);
        if (!nodes.has(edge.to)) { nodes.add(edge.to);queue.push(edge.to); }
      }
    }
  }
  return { nodes:[...nodes], edges:[...edges] };
}

export function nextStage(current, direction) {
  const index = STAGES.findIndex(stage => stage.id === current);
  if (index === -1) throw new RangeError('Unknown stage');
  return STAGES[Math.max(0, Math.min(STAGES.length - 1, index + Math.sign(direction)))].id;
}

export function layoutGraph(compact = false) {
  const width = compact ? 640 : 1200;
  const height = compact ? 1112 : 680;
  const positions = compact
    ? [[48,88],[352,88],[352,428],[48,428],[48,768],[352,768]]
    : [[48,100],[464,100],[880,100],[880,424],[464,424],[48,424]];
  const nodes = STAGES.map((stage,index) => ({ ...stage, x:positions[index][0], y:positions[index][1], width:compact ? 240 : 272, height:172 }));
  const byId = Object.fromEntries(nodes.map(node => [node.id,node]));
  const edges = EDGES.map(edge => {
    const a = byId[edge.from], b = byId[edge.to];
    let path, labelX, labelY, vertical = false;
    if (edge.kind === 'revision') {
      if (compact) { path='M48 854 H24 V348 H328 V230 H352';labelX=174;labelY=333; }
      else { path='M600 424 V272';labelX=620;labelY=352;vertical=true; }
    } else if (a.y === b.y) {
      const right = b.x > a.x;
      const x1 = right ? a.x+a.width : a.x, x2 = right ? b.x : b.x+b.width;
      path=`M${x1} ${a.y+86} H${x2}`;labelX=(x1+x2)/2;labelY=a.y+65;
    } else {
      const x = a.x+a.width/2;
      path=`M${x} ${a.y+a.height} V${b.y}`;labelX=x+18;labelY=(a.y+a.height+b.y)/2;vertical=true;
    }
    return { ...edge,path,labelX,labelY,vertical };
  });
  return { width,height,nodes,edges };
}
