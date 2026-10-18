import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {DURATION,STAGES,distance,parseStructure,inspectResidue,sampleTour} from '../examples/molecular-lab/src/model.mjs';
import {createTransport} from '../kit/motion.mjs';

const source=readFileSync(new URL('../examples/molecular-lab/assets/1crn.pdb',import.meta.url),'utf8');
const model=parseStructure(source);

test('the bundled experimental snapshot is reproducible and preserves author atom/residue identity',()=>{
  assert.equal(createHash('sha256').update(source).digest('hex'),'42199a30a0701864a2a5cc76cd7f35cc544cd0e65fbcf63e03c166543249b811');
  assert.equal(model.atoms.length,327);assert.equal(model.residues.length,46);
  assert.deepEqual([...new Set(model.residues.map(r=>r.chain))],['A']);
  assert.equal(model.sequence,'TTCCPSIVARSNFNVCRLPGTPEAICATYTGCIIIPGATCPGDYAN');
  assert.deepEqual(model.atoms[0].position,[17.047,14.099,3.625]);
  assert.equal(model.atoms[0].name,'N');assert.equal(model.atoms[0].serial,1);assert.equal(model.atoms[0].residueId,'A:1');
  assert.equal(model.atoms[0].occupancy,1);assert.equal(model.atoms[0].bFactor,13.79);
  assert.equal(new Set(model.atoms.map(a=>a.serial)).size,327);
  for(const residue of model.residues){assert.equal(residue.ca.name,'CA');assert.equal(residue.ca.residueId,residue.id);for(const index of residue.atomIndices)assert.equal(model.atoms[index].residueId,residue.id);}
});

test('chain continuity and peptide sticks agree without inventing inter-residue proximity bonds',()=>{
  for(let i=1;i<model.residues.length;i++){const a=model.residues[i-1],b=model.residues[i];assert.equal(b.number-a.number,1);const d=distance(a.ca.position,b.ca.position);assert.ok(d>3.5&&d<4,`Cα gap at ${a.id}: ${d}`);}
  const peptide=model.bonds.filter(b=>b.kind==='peptide');assert.equal(peptide.length,45);
  for(const bond of model.bonds){const a=model.atoms[bond.a],b=model.atoms[bond.b];assert.ok(bond.a<bond.b);assert.ok(distance(a.position,b.position)>.4);if(bond.kind==='peptide'){assert.equal(a.name,'C');assert.equal(b.name,'N');assert.equal(model.residueById.get(b.residueId).number-model.residueById.get(a.residueId).number,1);}else if(bond.kind==='inferred')assert.equal(a.residueId,b.residueId);}
  assert.equal(new Set(model.bonds.map(b=>`${b.a}:${b.b}`)).size,model.bonds.length);
});

test('disulfide measurements use the recorded sulfur atoms and coordinate distances',()=>{
  assert.deepEqual(model.disulfides.map(d=>[d.a,d.b]),[['A:3','A:40'],['A:4','A:32'],['A:16','A:26']]);
  assert.deepEqual(model.disulfides.map(d=>[model.atoms[d.atomA].serial,model.atoms[d.atomB].serial]),[[20,282],[26,229],[116,188]]);
  const expected=[2.0041072825574995,2.034701698038314,2.050763028728576];
  model.disulfides.forEach((link,i)=>{assert.ok(Math.abs(link.distance-expected[i])<1e-10);assert.equal(model.atoms[link.atomA].name,'SG');assert.equal(model.atoms[link.atomB].element,'S');const info=inspectResidue(model,link.a);assert.equal(info.partner.id,link.b);assert.equal(inspectResidue(model,link.b).partner.id,link.a);});
  assert.equal(model.disulfides[1].distance.toFixed(2),'2.03');
  assert.equal(inspectResidue(model,'A:12').link,null);
  assert.throws(()=>inspectResidue(model,'B:3'),RangeError);
});

test('centering and rigid display rotation cannot change the geometric measurement',()=>{
  const rotateTranslate=p=>[-p[1]+12,p[0]-7,p[2]+31];
  for(const link of model.disulfides){const a=model.atoms[link.atomA].position,b=model.atoms[link.atomB].position;const centered=p=>p.map((v,i)=>v-model.center[i]);assert.ok(Math.abs(distance(centered(a),centered(b))-link.distance)<1e-12);assert.ok(Math.abs(distance(rotateTranslate(a),rotateTranslate(b))-link.distance)<1e-12);}
  for(const atom of model.atoms)assert.ok(distance(atom.position,model.center)<=model.radius+1e-10);
});

test('secondary colors follow deposited HELIX/SHEET ranges and retain loops',()=>{
  const numbers=kind=>model.residues.filter(r=>r.secondary===kind).map(r=>r.number);
  assert.deepEqual(numbers('sheet'),[1,2,3,4,32,33,34,35]);
  assert.deepEqual(numbers('helix'),[7,8,9,10,11,12,13,14,15,16,17,18,19,23,24,25,26,27,28,29,30]);
  assert.equal(numbers('loop').length,17);
});

test('unsupported or damaged input is rejected rather than silently combining conformers',()=>{
  assert.throws(()=>parseStructure(''),/No atom/);
  const lines=source.split('\n'),first=lines.findIndex(line=>line.startsWith('ATOM'));
  const replaceAtom=mutate=>{const copy=lines.slice();copy[first]=mutate(copy[first]);return copy.join('\n');};
  assert.throws(()=>parseStructure(replaceAtom(line=>line.slice(0,16)+'B'+line.slice(17))),/Alternate locations/);
  assert.throws(()=>parseStructure('MODEL        1\n'+source+'\nMODEL        2\n'),/one model/);
  assert.throws(()=>parseStructure(replaceAtom(line=>line.slice(0,30)+'invalid '+line.slice(38))),/Invalid/);
  assert.throws(()=>parseStructure(replaceAtom(line=>line.slice(0,30)+'        '+line.slice(38))),/Invalid/);
  assert.throws(()=>parseStructure(replaceAtom(line=>line.slice(0,21)+'B'+line.slice(22))),/continuous chain/);
  assert.throws(()=>parseStructure(source.split('\n').filter(line=>!line.startsWith('ATOM')||Number(line.slice(22,26))!==13).join('\n')),/segmented backbone/);
  assert.throws(()=>parseStructure(source.replace(/^ATOM\s+20 .*\n/m,'')),/missing sulfur/);
});

test('explanatory seek/reverse/replay is deterministic and never changes the structure',()=>{
  const before=JSON.stringify(model.atoms),times=[0,3.7,7.999,8,12,15.999,16,18.67,21.34,24];
  for(const t of times){const first=sampleTour(t);sampleTour(24-t);assert.deepEqual(sampleTour(t),first);assert.ok(first.traceProgress>=0&&first.traceProgress<=1);}
  for(let i=0;i<STAGES.length;i++){assert.equal(sampleTour(STAGES[i].start).stageIndex,i);if(i)assert.equal(STAGES[i-1].end,STAGES[i].start);}
  assert.equal(sampleTour(-1).time,0);assert.equal(sampleTour(Infinity).time,0);assert.equal(sampleTour(30).time,DURATION);assert.equal(sampleTour(24).finished,true);
  assert.equal(sampleTour(8).representation,'atoms');assert.equal(sampleTour(16).bridgeIndex,0);assert.equal(sampleTour(24).bridgeIndex,2);
  const clock=createTransport({duration:DURATION});clock.play();clock.update(24);assert.equal(clock.getState().playing,false);clock.setRate(-1);clock.play();clock.update(8);assert.equal(clock.getState().time,16);clock.pause();clock.update(4);assert.equal(clock.getState().time,16);clock.seek(0);clock.setRate(1);clock.play();clock.update(8);assert.equal(sampleTour(clock.getState().time).stageIndex,1);
  assert.equal(JSON.stringify(model.atoms),before);
});
