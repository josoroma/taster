/** Capture real, running examples. Requires the local server (`npm run dev`). */
import {spawnSync} from 'node:child_process';
import {writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
const base=process.env.TASTER_PREVIEW_URL||'http://localhost:5173/taster/';
const temp=mkdtempSync(join(tmpdir(),'taster-showcase-'));
const examples=[
 {id:'arduino-lab',width:1440,height:1100,selector:'.spark-stage',ready:'window.__arduinoLab?.ready',actions:[['eval','document.fonts.ready']]},
 {id:'machine-lab',width:1440,height:1100,selector:'.workbench',ready:'window.__machineLab?.ready',actions:[['eval','document.fonts.ready']]},
 {id:'motion-lab',width:1440,height:1100,selector:'.preview',ready:'window.__cue?.getState().ready',actions:[['eval','document.fonts.ready'],['eval',"window.__cue.select('002'); window.__cue.seek(1.25)"]]},
 {id:'paper-lab',width:1440,height:1100,selector:'#reader',ready:'window.__paperLab?.ready',actions:[['eval','document.fonts.ready'],['eval','window.__paperLab.seek(38)']]},
 {id:'lumen',width:1200,height:780,selector:'#game',ready:'window.__lumen && !document.querySelector("#start").disabled',actions:[['click','#start'],['wait',800]]},
 {id:'bell-lab',width:1680,height:1100,selector:'.stage',ready:'window.__bellLab?.stats()',actions:[['click','[data-chapter="2"]'],['wait',1200]]},
 {id:'workshop',width:1760,height:1150,selector:'.viewport',ready:'window.__workshop?.getState().ready',actions:[['click','[data-step="3"]'],['wait',900]]},
 {id:'ai-history',width:1200,height:1050,selector:'#film',ready:'window.__aiHistory',actions:[['eval','window.__aiHistory.seek(8)'],['wait',300]]},
 {id:'brain-atlas',width:1600,height:1150,selector:'.canvas-wrap',ready:'window.__brainAtlas?.stats().webgl',actions:[['click','#separate'],['wait',1800]]},
 {id:'particle-atlas',width:1600,height:1150,selector:'#scene-frame',ready:'window.__particleAtlas?.stats().webgl',actions:[['eval','window.__particleAtlas.seek(7)'],['wait',500]]},
 {id:'cyborg-hand',width:1600,height:1150,selector:'#scene-frame',ready:'window.__dextra?.stats().webgl',actions:[['eval','window.__dextra.seek(0)'],['wait',500]]},
 {id:'molecular-lab',width:1440,height:1100,selector:'.workbench',ready:'window.__molecularLab?.ready',actions:[]},
 {id:'taster-diagram',width:1440,height:1100,selector:'#diagram',ready:'window.__tasterDiagram?.ready',actions:[]},
 {id:'taster-film',path:'examples/taster-film/composition/',width:1280,height:720,selector:'#film',region:[0,0,1280,720],ready:'window.tasterFilm?.ready',actions:[['eval','window.tasterFilm.ready'],['eval','window.tasterFilm.renderAt(17)']]},
];
try{
 for(const e of examples){
  if(process.argv[2] && process.argv[2]!==e.id)continue;
  const actions=[['until',e.ready,20000],...e.actions,['scroll',e.selector],['wait',250],['eval',`(()=>{const r=document.querySelector(${JSON.stringify(e.selector)}).getBoundingClientRect();return {width:r.width,height:r.height}})()`],['shot',resolve(`assets/showcase/${e.id}.png`),e.selector,1,e.region]];
  const path=join(temp,`${e.id}.json`);writeFileSync(path,JSON.stringify(actions));
  console.log(`Capturing ${e.id}`);
  const run=spawnSync(process.execPath,['scripts/drive.mjs',new URL(e.path||`examples/${e.id}/`,base).href,'--actions',path,'--width',String(e.width),'--height',String(e.height)],{stdio:'inherit'});
  if(run.status!==0)throw new Error(`${e.id} capture failed`);
 }
 const collageActions=join(temp,'collage.json');
 writeFileSync(collageActions,JSON.stringify([['until','Array.from(document.images).every(i=>i.complete&&i.naturalWidth>0)',10000],['eval','document.fonts.ready.then(()=>true)'],['shot',resolve('assets/showcase/taster-collage.png'),'#collage',1,[0,0,1600,1280]]]));
 const collage=spawnSync(process.execPath,['scripts/drive.mjs',new URL('assets/showcase/collage.html',base).href,'--actions',collageActions,'--width','1600','--height','1280'],{stdio:'inherit'});
 if(collage.status!==0)throw new Error('Collage capture failed');
}finally{rmSync(temp,{recursive:true,force:true});}
