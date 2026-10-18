// A deliberately bounded reader for the bundled single-model 1CRN PDB file.
// Original coordinates are retained in ångströms. View centering is a translation only.
export const DURATION = 24;
export const COLORS = Object.freeze({helix:'#83c9b5',sheet:'#bbacd5',loop:'#c5c3ad',C:'#c9d4c9',N:'#7eace5',O:'#ec8d80',S:'#e7bc66'});
export const STAGES = Object.freeze([
  {id:'fold',start:0,end:8,label:'Follow the fold',title:'One chain.\nA spatial story.',caption:'Follow the pale backbone through the fold. Each stop along it is an amino-acid residue; neighbors in space can be far apart in the sequence.',insight:'Select a letter below to connect its sequence position to its place in three dimensions.',representation:'ribbon'},
  {id:'atoms',start:8,end:16,label:'Reveal the atoms',title:'A shape made\nof chemistry.',caption:'Switch to the atomic view. The spheres mark deposited atom positions, and the sticks make local connectivity easier to follow.',insight:'Colors identify elements. Sphere sizes are display choices; this is not an electron-density or molecular-surface map.',representation:'atoms'},
  {id:'bridges',start:16,end:24,label:'Find the bridges',title:'Far along the chain.\nClose in the fold.',caption:'Three disulfide links join pairs of cysteine residues. Choose a pair to inspect its sulfur atoms and measure their separation in this structure.',insight:'The orange segments use the entry’s recorded disulfide pairs. Their measured lengths come directly from the deposited coordinates.',representation:'ribbon'},
]);
const AMINO = Object.freeze({ALA:['A','Alanine'],ARG:['R','Arginine'],ASN:['N','Asparagine'],ASP:['D','Aspartate'],CYS:['C','Cysteine'],GLN:['Q','Glutamine'],GLU:['E','Glutamate'],GLY:['G','Glycine'],HIS:['H','Histidine'],ILE:['I','Isoleucine'],LEU:['L','Leucine'],LYS:['K','Lysine'],MET:['M','Methionine'],PHE:['F','Phenylalanine'],PRO:['P','Proline'],SER:['S','Serine'],THR:['T','Threonine'],TRP:['W','Tryptophan'],TYR:['Y','Tyrosine'],VAL:['V','Valine']});
export const residueKey = (chain,number,insertion='') => `${chain}:${number}${insertion}`;
export const distance = (a,b) => Math.hypot(...a.map((x,i)=>x-b[i]));

export function parseStructure(text) {
  const atoms=[],residues=[],ranges=[],links=[],residueById=new Map();
  let modelCount=0;
  for (const line of text.split(/\r?\n/)) {
    const record=line.slice(0,6).trim();
    if(record==='MODEL'&&++modelCount>1)throw new Error('This reader accepts one model only.');
    if(record==='HELIX')ranges.push({kind:'helix',chain:line[19],start:Number(line.slice(21,25)),end:Number(line.slice(33,37))});
    if(record==='SHEET')ranges.push({kind:'sheet',chain:line[21],start:Number(line.slice(22,26)),end:Number(line.slice(33,37))});
    if(record==='SSBOND')links.push([residueKey(line[15],Number(line.slice(17,21)),line[21].trim()),residueKey(line[29],Number(line.slice(31,35)),line[35].trim())]);
    if(record!=='ATOM')continue;
    const altLoc=line[16].trim();
    if(altLoc)throw new Error('Alternate locations need an explicit conformer policy.');
    const serial=Number(line.slice(6,11)),name=line.slice(12,16).trim(),resName=line.slice(17,20),chain=line[21],number=Number(line.slice(22,26)),insertion=line[26].trim();
    const position=[Number.parseFloat(line.slice(30,38)),Number.parseFloat(line.slice(38,46)),Number.parseFloat(line.slice(46,54))];
    const occupancy=Number.parseFloat(line.slice(54,60)),bFactor=Number.parseFloat(line.slice(60,66)),element=line.slice(76,78).trim();
    if(!Number.isInteger(serial)||!Number.isInteger(number)||!position.every(Number.isFinite)||!Number.isFinite(occupancy)||!COLORS[element])throw new Error('Invalid or unsupported atom record.');
    const id=residueKey(chain,number,insertion);
    let residue=residueById.get(id);
    if(!residue){const amino=AMINO[resName];if(!amino)throw new Error(`Unknown residue ${resName}`);residue={id,chain,number,insertion,name:resName,letter:amino[0],fullName:amino[1],atomIndices:[],secondary:'loop'};residueById.set(id,residue);residues.push(residue);}
    const atom={serial,name,element,position,occupancy,bFactor,residueId:id,index:atoms.length};
    residue.atomIndices.push(atom.index);atoms.push(atom);
  }
  if(!atoms.length)throw new Error('No atom coordinates found.');
  if(new Set(atoms.map(a=>a.serial)).size!==atoms.length)throw new Error('Atom serials must be unique.');
  if(new Set(residues.map(r=>r.chain)).size!==1)throw new Error('This example requires one continuous chain.');
  if(residues.some((r,i)=>r.insertion||(i>0&&r.number!==residues[i-1].number+1)))throw new Error('Gaps and insertion codes require segmented backbone handling.');
  for(const residue of residues){
    residue.secondary=ranges.find(r=>r.chain===residue.chain&&residue.number>=r.start&&residue.number<=r.end)?.kind??'loop';
    residue.ca=atoms.find(a=>a.residueId===residue.id&&a.name==='CA');
    residue.oxygen=atoms.find(a=>a.residueId===residue.id&&a.name==='O');
    if(!residue.ca)throw new Error(`Missing alpha carbon for ${residue.id}`);
  }
  const disulfides=links.map(([a,b])=>{
    const atomA=atoms.find(atom=>atom.residueId===a&&atom.name==='SG'),atomB=atoms.find(atom=>atom.residueId===b&&atom.name==='SG');
    if(!atomA||!atomB)throw new Error('Disulfide references a missing sulfur atom.');
    return {id:`${a}-${b}`,a,b,atomA:atomA.index,atomB:atomB.index,distance:distance(atomA.position,atomB.position)};
  });
  const bounds={min:[0,1,2].map(i=>Math.min(...atoms.map(a=>a.position[i]))),max:[0,1,2].map(i=>Math.max(...atoms.map(a=>a.position[i])))};
  const center=bounds.min.map((v,i)=>(v+bounds.max[i])/2),radius=Math.max(...atoms.map(a=>distance(a.position,center)));
  // Local sticks are a display heuristic, not a bond-order or interaction assignment.
  const radii={C:.76,N:.71,O:.66,S:1.05},bonds=[];
  for(let i=0;i<atoms.length;i++)for(let j=i+1;j<atoms.length;j++){
    const a=atoms[i],b=atoms[j],ra=residueById.get(a.residueId),rb=residueById.get(b.residueId);
    const same=a.residueId===b.residueId;
    const peptide=ra.chain===rb.chain&&rb.number-ra.number===1&&a.name==='C'&&b.name==='N';
    const d=distance(a.position,b.position);
    if((same||peptide)&&d>.4&&d<radii[a.element]+radii[b.element]+.35)bonds.push({a:i,b:j,kind:peptide?'peptide':'inferred'});
  }
  for(const link of disulfides)bonds.push({a:link.atomA,b:link.atomB,kind:'disulfide'});
  return {atoms,residues,residueById,disulfides,bonds,bounds,center,radius,ranges,sequence:residues.map(r=>r.letter).join('')};
}

export function inspectResidue(structure,id){
  const residue=structure.residueById.get(id);
  if(!residue)throw new RangeError(`Unknown residue: ${id}`);
  const link=structure.disulfides.find(d=>d.a===id||d.b===id);
  return {...residue,atomCount:residue.atomIndices.length,link:link??null,partner:link?structure.residueById.get(link.a===id?link.b:link.a):null};
}

export function sampleTour(value){
  const time=Math.max(0,Math.min(DURATION,Number.isFinite(value)?value:0));
  const stageIndex=Math.min(2,Math.floor(time/8)),stage=STAGES[stageIndex],progress=(time-stage.start)/8;
  return {time,stageIndex,stage,progress,representation:stage.representation,traceProgress:stageIndex===0?progress:1,bridgeIndex:stageIndex===2?Math.min(2,Math.floor(progress*3)):-1,finished:time===DURATION};
}
