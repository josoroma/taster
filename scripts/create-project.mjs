import { access, cp, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const args=process.argv.slice(2),index=args.indexOf('--template');
const template=index>=0?args[index+1]:'bell-lab';
const templates=['bell-lab','lumen','workshop','ai-history','brain-atlas','particle-atlas','cyborg-hand','molecular-lab','taster-diagram','taster-film','paper-lab','machine-lab','motion-lab','arduino-lab'];
const destinationArg=args.find((arg,i)=>!arg.startsWith('--')&&(index<0||i!==index+1));
if(args.includes('--help')||!destinationArg){
  console.log(`Usage: node scripts/create-project.mjs <empty-destination> [--template ${templates.join('|')}]\nCopies an editable, independent example. Then run npm install and npm start there.`);
  process.exit(args.includes('--help')?0:1);
}
if(!templates.includes(template))throw new Error(`Template must be one of: ${templates.join(', ')}`);
const source=fileURLToPath(new URL('..',import.meta.url)),destination=resolve(destinationArg);
if(destination===source)throw new Error('Choose a destination outside the skill folder');
let exists=true;try{await access(destination);}catch{exists=false;}
if(exists&&(await readdir(destination)).length)throw new Error('Destination is not empty; nothing was overwritten');
await mkdir(destination,{recursive:true});
const shared=['package.json','package-lock.json','LICENSE','favicon.svg','assets/fonts','assets/showcase/logo.svg','scripts/build.mjs','scripts/serve.mjs','scripts/capture.mjs','scripts/drive.mjs','scripts/chrome-port.mjs','scripts/line-ends.mjs','scripts/BROWSER-HELPERS-LICENSE'];
const additions={
  'arduino-lab':{title:'SPARK — Arduino Invention Lab',description:'A beginner Arduino invention lab with a labeled Uno R3 circuit, playful projects, controllable behavior, and downloadable sketches.',scope:'SPARK is an original browser model of selected LED, button, and potentiometer behaviors. It does not compile arbitrary C++, solve a circuit, or operate a real board. The example README identifies the Uno R3 pin map, parts, hardware assumptions, and actual verification.'},
  'paper-lab':{title:'LEAF — Paper Lab',description:'An interactive reading experience about wave superposition, with chapters, animation, transcript, optional speech, and a quiz.',scope:'Original lesson text and an ideal linear wave model demonstrate a Papermorph-inspired authoring workflow. Browser speech is optional and depends on installed voices. This starter does not extract PDFs or include the Papermorph engine. See the example README for sources and controls.'},
  'machine-lab':{title:'CRANK — Machine Lab',description:'An inspectable slider-crank mechanism with deterministic kinematics, adjustable controls, and model-derived readouts.',scope:'An ideal rigid slider-crank demonstrates a machine-skill-inspired workflow. Motion follows geometric constraints; it is not a combustion, force, stress, or manufacturing simulation. See the example README for equations, units, assumptions, and inspection controls.'},
  'motion-lab':{title:'CUE — Motion Lab',description:'A small named motion vocabulary with deterministic previews, timeline controls, and reusable prompts.',scope:'An original Taster implementation of selected Motion Prompt concepts, with pack IDs and source links. This starter is a local subset, not the complete upstream library or a general pack importer. See the example README for the supported effects and controls.'},
  'molecular-lab':{title:'FOLD — Molecular Lab',description:'An experimental protein structure with residue inspection, representations, and a guided molecular explanation.',scope:'Bundled 1CRN X-ray coordinates provide the scientific structure. Camera and representation animation are viewing aids, not molecular dynamics or a folding simulation. See the example README for provenance, units, and limitations.'},
  'taster-diagram':{title:'Taster — The idea made explorable',description:'An interactive editorial diagram explaining Taster, with selectable stages and a portable SVG export.',scope:'The diagram describes the Taster authoring workflow. Its layout is an explanatory model, not a live execution trace. See the example README for controls, export details, and design references.'},
  'taster-film':{title:'Taster — A film in code',description:'A branded deterministic HTML-to-video composition explaining Taster, with browser preview and a rendered film.',scope:'The included film is a fixed authored story. See examples/taster-film/README.md for the pinned Hyperframes render command, encoded media details, and editable composition. Viewing the preview or shipped video does not require a render service.'},
};
const selected={
  'arduino-lab':['examples/arduino-lab','kit','tests/arduino-lab.test.mjs','tests/browser/arduino-lab.actions.json'],
  'paper-lab':['examples/paper-lab','kit','tests/paper-lab.test.mjs','tests/motion.test.mjs','tests/browser/paper-lab.actions.json'],
  'machine-lab':['examples/machine-lab','kit','tests/machine-lab.test.mjs','tests/motion.test.mjs','tests/browser/machine-lab.actions.json'],
  'motion-lab':['examples/motion-lab','kit','tests/motion-lab.test.mjs','tests/motion.test.mjs','tests/browser/motion-lab.actions.json'],
  'molecular-lab':['examples/molecular-lab','kit','tests/molecular-lab.test.mjs','tests/motion.test.mjs','tests/browser/molecular-lab.actions.json','tests/browser/molecular-fallback.actions.json'],
  'taster-diagram':['examples/taster-diagram','tests/taster-diagram.test.mjs','tests/browser/taster-diagram.actions.json'],
  'taster-film':['examples/taster-film','kit','tests/taster-film.test.mjs','tests/motion.test.mjs','tests/browser/taster-film.actions.json'],
  'bell-lab':['examples/bell-lab','kit','tests/bell-model.test.mjs','tests/motion.test.mjs'],
  lumen:['examples/lumen','tests/model.test.mjs'],
  workshop:['examples/workshop','kit','scripts/build-cad-example.py','tests/cad-plate.test.mjs','tests/motion.test.mjs'],
  'ai-history':['examples/ai-history','kit','tests/ai-history.test.mjs','tests/motion.test.mjs'],
  'brain-atlas':['examples/brain-atlas','kit','tests/brain-atlas.test.mjs','tests/motion.test.mjs'],
  'particle-atlas':['examples/particle-atlas','kit','tests/particle-atlas.test.mjs','tests/motion.test.mjs'],
  'cyborg-hand':['examples/cyborg-hand','kit','tests/cyborg-hand.test.mjs','tests/motion.test.mjs','tests/browser/cyborg-hand-labels.actions.json'],
}[template];
for(const path of [...shared,...selected]){await mkdir(dirname(resolve(destination,path)),{recursive:true});await cp(resolve(source,path),resolve(destination,path),{recursive:true,filter:path=>!path.split(/[\\/]/).includes('.hyperframes')});}
await writeFile(resolve(destination,'index.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=./examples/${template}/"><title>Taster example</title><a href="./examples/${template}/">Open ${template}</a></html>`);
await writeFile(resolve(destination,'examples/index.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=./${template}/"><title>Taster example</title><a href="./${template}/">Open ${template}</a></html>`);
if(template==='bell-lab'){
  // The standalone template has no neighboring Lumen page.
  const file=resolve(destination,'examples/bell-lab/index.html');
  const html=(await readFile(file,'utf8')).replace('<a href="../lumen/">Play Lumen ↗</a>','<a href="./">Restart Bell Lab ↗</a>');
  await writeFile(file,html);
}
const title=additions[template]?.title??{'bell-lab':'Bell Lab',lumen:'Lumen',workshop:'Taster Workshop','ai-history':'SHIFT','brain-atlas':'Cerebra','particle-atlas':'INNERSPACE','cyborg-hand':'DEXTRA'}[template];
const description=additions[template]?.description??{'bell-lab':'A playable two-qubit explainer with camera tours and reversible assembly.',lumen:'An atmospheric garden adventure with resonance puzzles.',workshop:'A sober engineering explainer with real CAD snapshots, code-linked steps, and STEP/STL exports.','ai-history':'A short animated history from the Transformer to the open question of AGI.','brain-atlas':'An interactive brain atlas with labeled regions and reversible separation.','particle-atlas':'A guided journey into matter with a known-particle atlas and interactive 3D inspection.','cyborg-hand':'An articulated cyborg hand with open/fist poses, reversible shell separation, and interactive mechanism inspection.'}[template];
const manifestPath=resolve(destination,'package.json');
const manifest=JSON.parse(await readFile(manifestPath,'utf8'));
manifest.name=template;manifest.description=description;
await writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n');
const lockPath=resolve(destination,'package-lock.json');
const lock=JSON.parse(await readFile(lockPath,'utf8'));
lock.name=template;if(lock.packages?.[''])lock.packages[''].name=template;
await writeFile(lockPath,JSON.stringify(lock,null,2)+'\n');
const editMap=additions[template]
  ? `- \`examples/${template}/\`: editable interface, visuals, model, and local assets.\n- \`examples/${template}/README.md\`: controls, source information, scope, and export commands.\n- \`tests/${template}.test.mjs\`: meaningful model checks.\n`
  : ['ai-history','brain-atlas','particle-atlas','cyborg-hand'].includes(template)
  ? `- \`examples/${template}/\`: interface, styles, and application controls.\n- \`examples/${template}/src/model.mjs\`: ${template==='ai-history'?'chapter timing, sourced narrative, and deterministic state':template==='particle-atlas'?'particle metadata, charge arithmetic, and deterministic stages':template==='cyborg-hand'?'joint limits, coordinated articulation, and deterministic tour state':'region information and reversible part poses'}.\n- \`examples/${template}/src/scene.mjs\`: visual rendering.\n- \`kit/\`: reusable playback and inspection helpers.\n- \`examples/${template}/README.md\`: controls, sources, and scope.\n`
  : template==='workshop'
  ? '- `examples/workshop/`: interface, construction steps, and playback.\n- `examples/workshop/assets/cad-plate/source.py`: editable SMLibPy model.\n- `scripts/build-cad-example.py`: regenerate geometry and exports with `uv run scripts/build-cad-example.py`.\n- `kit/technical-viewer.mjs`: orthographic topology-edge viewer.\n'
  : template==='bell-lab'
  ? '- `examples/bell-lab/index.html`, `style.css`, `main.mjs`: interface, lesson, and challenge flow.\n- `examples/bell-lab/src/model.mjs`: exact two-qubit rules and targets.\n- `examples/bell-lab/src/scene.mjs`: 3D machine and visual mappings.\n- `kit/`: reusable camera, transport, and assembly helpers.\n'
  : '- `examples/lumen/index.html`, `style.css`, `main.mjs`: interface and game loop.\n- `examples/lumen/src/model.mjs`: movement, hazards, puzzle rules, and win state.\n- `examples/lumen/src/scene.mjs`: 3D world and animation.\n';
const scope=additions[template]?.scope??(template==='cyborg-hand'?'This is a conceptual kinematic demonstrator. Procedural geometry and coordinated joint poses illustrate articulation and assembly inspection; they do not establish force analysis, manufacturing clearances, or production-ready CAD.':template==='particle-atlas'?'This schematic journey connects atoms, nuclei, valence quarks, and the known elementary particles. Display rotation does not represent quantum spin. No smaller constituents of quarks or leptons are asserted. Sources and limits are included in the experience.':template==='ai-history'?'This browser film covers selected developments from 2017 onward. Its diagrams are explanatory illustrations; AGI is presented as an open research goal, without an arrival date. Sources are included in the film. No video encoder or narration service is required.':template==='brain-atlas'?'Brain shapes, region boundaries, and separation paths are educational schematics. Parts remain components of interacting networks; this is not a scan or a clinical atlas. Sources and context are included in the interface.':template==='workshop'?'The browser displays precomputed B-rep-derived meshes and edges; it does not run Python or a CAD kernel. Dimensions use millimeters. STEP is the solid exchange file; STL is a unitless tessellation whose intended scale is millimeters. No slicer or printer control is included. Regenerating the CAD assets requires uv/Python; viewing them does not.':template==='bell-lab'?'The simulator is ideal and noiseless. The machine is a visual metaphor; sources and limitations are in the in-app model panel.':'Move with WASD/arrows or click the ground. E interacts, Space dashes, and Escape pauses. Restore three shrines, then reach the exit.');
await writeFile(resolve(destination,'README.md'),`# ${title}\n\n${description}\n\nRequires Node.js 22+ and ${['ai-history','taster-diagram','taster-film','paper-lab','motion-lab','arduino-lab'].includes(template)?'a modern browser':'a WebGL 2 browser'}.\n\n\`\`\`sh\nnpm ci\nnpm start\n\`\`\`\n\nOpen http://localhost:5173/ . Use \`PORT=8080 npm start\` for another port.\n\n\`npm test\` checks model invariants. \`npm run build\` creates a self-contained \`dist/\`; serve that directory over HTTP.\n\n## Edit this project\n\n${editMap}\nKeep rules, labels, and visual mappings consistent when changing the subject. This project runs independently of the Taster skill.\n\n${scope}\n`);
await writeFile(resolve(destination,'.gitignore'),'node_modules/\ndist/\nshots/\n.DS_Store\n');
console.log(`Created ${template} at ${destination}\nRun npm install, then npm start in that directory. Edit the model, scene, and lesson together for your new subject.`);
