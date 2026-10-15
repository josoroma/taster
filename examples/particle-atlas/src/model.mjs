/**
 * INNERSPACE — an educational map, not a numerical quantum simulation.
 * Charges are in units of positive elementary charge e; spin is the quantum
 * number s (not a rotation rate). Geometry, timing, and visual scale are schematic.
 * Science reviewed against the linked primary/institutional sources, 2026-10-15.
 */
export const DURATION = 78;

export const SOURCES = Object.freeze([
  {id:'standard-model', title:'The Standard Model', author:'CERN', url:'https://home.cern/science/physics/standard-model/', detail:'The observed quarks, leptons, interaction carriers, and limits of the Standard Model.'},
  {id:'pdg', title:'Review of Particle Physics — particle listings', author:'Particle Data Group', date:'2026', url:'https://pdg.lbl.gov/2026/listings/contents_listings.html', detail:'Particle classification and quantum properties. Listings also contain searches; a search entry does not establish a discovery.'},
  {id:'electrons', title:'DOE Explains… Electrons', author:'US Department of Energy', url:'https://www.energy.gov/science/doe-explainselectrons', detail:'Electron probability clouds, atomic charge, and the distinction between electrons and nuclear constituents.'},
  {id:'quarks-gluons', title:'DOE Explains… Quarks and Gluons', author:'US Department of Energy', url:'https://www.energy.gov/science/doe-explainsquarks-and-gluons', detail:'Hadrons, color charge, strong interactions, confinement, and the origin of most nucleon mass.'},
  {id:'spin', title:'Inside the nucleon: the physics of SpinQuest', author:'Fermilab · SpinQuest', url:'https://spinquest.fnal.gov/', detail:'Valence quarks, the quark–antiquark sea, gluons, and why intrinsic spin is not a ball turning in space.'},
  {id:'neutrinos', title:'Neutrino masses', author:'Fermilab · All Things Neutrino', url:'https://neutrinos.fnal.gov/types/masses/', detail:'Flavor states and mass states are different descriptions connected by quantum mixing.'},
  {id:'antineutrinos', title:'Are neutrinos their own antiparticles?', author:'Fermilab · All Things Neutrino', url:'https://neutrinos.fnal.gov/mysteries/majorana-or-dirac/', detail:'Whether massive neutrinos are Dirac or Majorana particles remains an open question.'},
  {id:'higgs', title:'DOE Explains… the Higgs Boson', author:'US Department of Energy', url:'https://www.energy.gov/science/doe-explainsthe-higgs-boson', detail:'The Higgs field, its associated particle, and elementary-particle masses.'},
  {id:'frontier', title:'CMS looks deep inside quarks', author:'CERN · CMS', date:'2026', url:'https://home.cern/cms-looks-deep-inside-quarks/', detail:'Scattering measurements find no significant evidence of quark substructure. Limits depend on the model tested.'},
  {id:'compositeness', title:'Compositeness', author:'CERN', url:'https://home.cern/science/physics/compositeness/', detail:'The possibility of smaller constituents is a research question; it has not been established for quarks or leptons.'},
].map(Object.freeze));

export const STAGES = Object.freeze([
  {
    id:'atom', start:0, end:13, eyebrow:'01 / THE ATOM', title:'The familiar\nbecomes strange.',
    caption:'Begin with helium-4: two electrons around a nucleus of two protons and two neutrons. The luminous cloud is a map of possibility, not a set of tiny planetary paths.',
    note:'Cloud points illustrate where electron detections might occur. They are not extra electrons; this is a schematic, not a calculated helium wavefunction.',
    insight:'An atom has structure. An electron has no known smaller parts.',
    scaleLabel:'Atomic scale · roughly 10⁻¹⁰ m', sourceIds:['electrons'],
  },
  {
    id:'nucleus', start:13, end:26, eyebrow:'02 / THE NUCLEUS', title:'A small center.\nA deep story.',
    caption:'Nearly all the atom’s mass is concentrated in its nucleus. The strong nuclear interaction binds this compact cluster, while the surrounding electron cloud sets the atom’s much larger extent.',
    note:'Atomic and nuclear views are enlarged independently. A nucleus is roughly 10⁻¹⁵ m across in order of magnitude; these spheres are explanatory markers.',
    insight:'The scale changes. The same four nucleons remain.',
    scaleLabel:'Nuclear scale · roughly 10⁻¹⁵ m', sourceIds:['quarks-gluons'],
  },
  {
    id:'nucleon', start:26, end:39, eyebrow:'03 / INSIDE A NUCLEON', title:'Even the center\nhas an inside.',
    caption:'A proton carries two up valence quarks and one down; a neutron carries one up and two down. Change the selection and watch fractional charges combine into a whole.',
    note:'The three markers show valence identity. A nucleon also contains gluons and a quantum sea of quark–antiquark pairs, not just three beads.',
    insight:'Proton: ⅔ + ⅔ − ⅓ = +1. Neutron: ⅔ − ⅓ − ⅓ = 0.',
    scaleLabel:'Inside a nucleon · schematic', sourceIds:['pdg','spin'],
  },
  {
    id:'quarks', start:39, end:52, eyebrow:'04 / THE STRONG INTERACTION', title:'The binding\nis part of the matter.',
    caption:'Gluons carry the strong interaction between color charges. Most of a proton’s mass comes from the energy of its quarks and gluons, rather than the small masses of its valence quarks.',
    note:'Links and motion illustrate relationships, not measured trajectories. Quarks are confined: pulling apart a hadron does not release an isolated quark. Color is a quantum label, not visible paint.',
    insight:'Quantum spin is intrinsic angular momentum. The rotating display is only a view.',
    scaleLabel:'Quarks + gluons · no resolved internal structure', sourceIds:['quarks-gluons','spin'],
  },
  {
    id:'atlas', start:52, end:65, eyebrow:'05 / THE KNOWN PARTICLES', title:'A small alphabet.\nAn immense universe.',
    caption:'Six quarks. Six leptons. Force carriers and the Higgs boson. Select a symbol to discover the charge, spin, and role of each entry in this map of known elementary particles.',
    note:'These 17 groups include W⁺ and W⁻ together and all eight gluon color states together. Antiparticles are described in the inspector; this is not a catalog of every composite hadron.',
    insight:'Matter, interactions, and a field linked to mass: different roles in one theory.',
    scaleLabel:'The Standard Model · classification, not spatial size', sourceIds:['standard-model','pdg'],
  },
  {
    id:'frontier', start:65, end:78, eyebrow:'06 / THE OPEN FRONTIER', title:'The edge of the map\nis a question.',
    caption:'No smaller constituents of quarks or leptons have been confirmed. We have reached the boundary of established structure, not proof that nature has nothing more to reveal.',
    note:'Dark matter, quantum gravity, and the origin of neutrino masses are open problems. Hypothetical particles are not presented here as discoveries.',
    insight:'The next layer must be found in evidence, not invented by a deeper zoom.',
    scaleLabel:'Beyond the known · unanswered', sourceIds:['frontier','compositeness','standard-model','neutrinos'],
  },
].map(stage => Object.freeze({...stage, sourceIds:Object.freeze(stage.sourceIds)})));

const quark = (id, symbol, name, generation, charge, role, detail) => ({
  id, symbol, name, family:'quark', generation, charge, chargeLabel:charge>0?'+⅔':'−⅓', spin:0.5,
  role, detail, antiparticle:`${name.replace('quark','antiquark')}; opposite electric and color charges.`, sourceIds:['pdg','quarks-gluons'],
});
const lepton = (id, symbol, name, generation, role, detail, antiparticle) => ({
  id, symbol, name, family:'lepton', generation, charge:-1, chargeLabel:'−1', spin:0.5,
  role, detail, antiparticle, sourceIds:['pdg','standard-model'],
});
const neutrino = (id, symbol, name, generation, partner) => ({
  id, symbol, name, family:'lepton', generation, charge:0, chargeLabel:'0', spin:0.5,
  role:`The neutral lepton flavor associated with the ${partner}.`,
  detail:'Neutrino flavors mix during propagation. A flavor state is a superposition of mass states, not a particle with one fixed flavor-specific mass.',
  antiparticle:'An antineutrino is observed through its weak interactions; whether massive neutrinos are their own antiparticles remains unresolved.', sourceIds:['pdg','neutrinos','antineutrinos'],
});

export const PARTICLES = Object.freeze([
  quark('up','u','Up quark',1,2/3,'A valence constituent of protons and neutrons.','Two up quarks help give a proton its +1 electric charge. An up quark is elementary in the Standard Model.'),
  quark('down','d','Down quark',1,-1/3,'A valence constituent of protons and neutrons.','Two down quarks balance one up quark in a neutral neutron. Zero total charge does not mean the constituents are uncharged.'),
  quark('charm','c','Charm quark',2,2/3,'The second-generation up-type quark.','Charm occurs in short-lived hadrons. It is a distinct elementary flavor, not an excited up quark.'),
  quark('strange','s','Strange quark',2,-1/3,'The second-generation down-type quark.','Strange quarks occur in particles such as kaons. Quark flavor is a particle identity, not a spatial direction.'),
  quark('top','t','Top quark',3,2/3,'The third-generation up-type quark.','The top is the most massive known elementary particle. It decays before forming the usual long-lived hadronic bound states.'),
  quark('bottom','b','Bottom quark',3,-1/3,'The third-generation down-type quark.','Bottom quarks form short-lived hadrons whose decays help test the Standard Model.'),
  lepton('electron','e⁻','Electron',1,'The charged lepton that shapes atoms and chemistry.','Electrons occupy quantum states around nuclei. No internal constituents have been confirmed.','Positron (e⁺); charge +1, the same mass and spin quantum number.'),
  lepton('muon','μ⁻','Muon',2,'A heavier, unstable relative of the electron.','A muon has the same electric charge and spin quantum number as an electron, but is a different particle.','Antimuon (μ⁺); charge +1.'),
  lepton('tau','τ⁻','Tau',3,'The heaviest charged lepton.','The tau is unstable. Its decays provide another window onto the weak interaction.','Antitau (τ⁺); charge +1.'),
  neutrino('electron-neutrino','νₑ','Electron neutrino',1,'electron'),
  neutrino('muon-neutrino','νμ','Muon neutrino',2,'muon'),
  neutrino('tau-neutrino','ντ','Tau neutrino',3,'tau'),
  {id:'photon',symbol:'γ',name:'Photon',family:'boson',charge:0,chargeLabel:'0',spin:1,role:'The quantum of the electromagnetic field.',detail:'Light consists of photons. Electromagnetic interactions connect charged particles; photons have zero rest mass.',antiparticle:'The photon is its own antiparticle.',sourceIds:['standard-model','pdg']},
  {id:'gluon',symbol:'g',name:'Gluon',family:'boson',charge:0,chargeLabel:'0',spin:1,role:'The carrier of the strong interaction.',detail:'Gluons carry color charge and interact with one another. This tile groups eight color states; their electric charge is zero.',antiparticle:'The gluon family is self-conjugate; color states transform into the corresponding states under charge conjugation.',sourceIds:['quarks-gluons','pdg']},
  {id:'w',symbol:'W±',name:'W bosons',family:'boson',charge:1,chargeValues:[-1,1],chargeLabel:'±1',spin:1,role:'Charged carriers of the weak interaction.',detail:'W⁺ and W⁻ can change quark or lepton flavor in weak processes. The two charge states share this entry and have opposite unit electric charges.',antiparticle:'W⁺ and W⁻ are each other’s antiparticles.',sourceIds:['standard-model','pdg']},
  {id:'z',symbol:'Z',name:'Z boson',family:'boson',charge:0,chargeLabel:'0',spin:1,role:'The neutral carrier of the weak interaction.',detail:'The Z mediates neutral-current weak interactions. Neutral electric charge does not mean it has no interactions.',antiparticle:'The Z boson is its own antiparticle.',sourceIds:['standard-model','pdg']},
  {id:'higgs',symbol:'H',name:'Higgs boson',family:'boson',charge:0,chargeLabel:'0',spin:0,role:'An excitation of the Higgs field.',detail:'Interactions with the Higgs field give masses to elementary particles such as electrons and quarks. Most proton mass instead arises from strong-interaction energy.',antiparticle:'The observed Higgs boson is its own antiparticle.',sourceIds:['higgs','quarks-gluons','pdg']},
].map(particle => Object.freeze({
  ...particle,
  sourceIds:Object.freeze(particle.sourceIds),
  ...(particle.chargeValues ? {chargeValues:Object.freeze(particle.chargeValues)} : {}),
})));

const particleIndex = new Map(PARTICLES.map(particle => [particle.id, particle]));
export function getParticle(id) { return particleIndex.get(id); }

/** Pure absolute-time sampling: seek, reverse, and replay never mutate the model. */
export function sampleJourney(seconds) {
  const time = Math.min(DURATION, Math.max(0, Number.isFinite(seconds) ? seconds : 0));
  const stageIndex = Math.max(0, STAGES.findLastIndex(stage => time >= stage.start));
  const stage = STAGES[stageIndex];
  const localProgress = (time - stage.start) / (stage.end - stage.start);
  return {time, progress:time/DURATION, stage, stageIndex, localProgress, finished:time===DURATION};
}

/** The valence identities fix net charge; they are not the complete nucleon state. */
export function nucleonContents(type='proton') {
  if (type !== 'proton' && type !== 'neutron') throw new RangeError('Choose proton or neutron.');
  const valenceIDs = Object.freeze(type==='proton' ? ['up','up','down'] : ['up','down','down']);
  const totalCharge = valenceIDs.reduce((sum,id) => sum + getParticle(id).charge, 0);
  return Object.freeze({type, valenceIDs, totalCharge, valence:valenceIDs, charge:totalCharge});
}
