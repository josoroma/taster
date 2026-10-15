# INNERSPACE

A journey into matter: cross an electron probability cloud, enter a helium-4 nucleus, inspect a proton or neutron, and discover the elementary particles of the Standard Model. A 78-second guided sequence connects six scales and ideas; pause at any point to orbit, pan, zoom, and inspect the model.

This is a rendered, interactive browser experience. All visual geometry is generated in code; no video export or narrated audio track is included.

## Run

From the Taster root:

```sh
npm install
npm start
```

Open [INNERSPACE](http://localhost:5173/taster/examples/particle-atlas/). `npm run build` produces the static entry at `dist/examples/particle-atlas/index.html`.

## Explore

- Play the complete journey or select any of its six chapters directly. Scrub the timeline to inspect a transition; replay and reverse sampling derive from absolute time.
- Switch between proton and neutron to compare `uud` with `udd` and see their charges add to `+1` or `0`.
- Select a particle in the atlas or the accessible particle list to read its role, electric charge, intrinsic spin, and antiparticle context.
- Drag to orbit, Shift/right drag to pan, and scroll to zoom. Touch supports one-finger orbit and two-finger pan/pinch. Visible camera buttons provide alternatives.
- Use the display-rotation toggle for a moving view; it never changes a particle’s quantum spin value. Camera gestures interrupt the guided view so inspection stays under your control.

## Scientific scope

The first two scenes depict a neutral helium-4 atom: two electrons, two protons, and two neutrons. Cloud markers illustrate detection probabilities, not thousands of electrons or planetary orbits. This is a qualitative cloud, not a solved two-electron wavefunction. Atomic and nuclear sizes are reframed independently; the journey is not a physically continuous scale model. [DOE: Electrons](https://www.energy.gov/science/doe-explainselectrons).

The proton’s `uud` and neutron’s `udd` are **valence identities**. The full nucleon also includes gluons and a quantum sea of quark–antiquark pairs. Moving markers, colored strands, and separation are explanatory devices, not measured particle trajectories or free-quark extraction. Quarks are confined, and color charge is unrelated to visible color. [Fermilab: SpinQuest](https://spinquest.fnal.gov/), [DOE: Quarks and Gluons](https://www.energy.gov/science/doe-explainsquarks-and-gluons).

The atlas contains 17 familiar particle **groups**: six quarks, six leptons, photon, gluon, W, Z, and Higgs. W⁺/W⁻ share an entry; the eight gluon color states share an entry. Antiparticles appear in inspector text. The atlas is not a list of all composite hadrons or every quantum state. Charge uses units of the positive elementary charge `e`; spin is the quantum number `s`, not a rotation rate. [CERN: Standard Model](https://home.cern/science/physics/standard-model/), [PDG: 2026 particle listings](https://pdg.lbl.gov/2026/listings/contents_listings.html).

Neutrino flavors and mass states are different, related bases. The question of whether massive neutrinos are their own antiparticles remains open. The Higgs field contributes to elementary-particle masses; most proton mass comes from strong-interaction energy. [Fermilab: Neutrino masses](https://neutrinos.fnal.gov/types/masses/), [Fermilab: Neutrino antiparticles](https://neutrinos.fnal.gov/mysteries/majorana-or-dirac/), [DOE: Higgs boson](https://www.energy.gov/science/doe-explainsthe-higgs-boson).

The final chapter stops at the boundary of evidence. No smaller constituents of quarks or leptons have been confirmed. Dark matter, quantum gravity, and the mechanism behind neutrino masses are open research subjects; the scene does not invent further discovered layers. Science checked on 15 October 2026 against the linked sources. [CERN: Compositeness](https://home.cern/science/physics/compositeness/), [CERN: CMS looks deep inside quarks](https://home.cern/cms-looks-deep-inside-quarks/).

## Editable source

| File | Purpose |
| --- | --- |
| [src/model.mjs](src/model.mjs) | Sourced particle metadata, story stages, pure timeline sampling, and valence charge arithmetic. |
| [src/scene.mjs](src/scene.mjs) | Procedural cloud, nuclear and quark scenes, particle atlas, and camera interaction. |
| [main.mjs](main.mjs) | Playback, chapter selection, particle inspection, controls, and accessibility. |
| [index.html](index.html) | Semantic experience structure. |
| [style.css](style.css) | Responsive presentation. |
| [../../tests/particle-atlas.test.mjs](../../tests/particle-atlas.test.mjs) | Charge conservation, observed taxonomy, deterministic seeking, exact boundaries, and immutable inspection state. |

`sampleJourney(seconds)` returns a bounded absolute time, global progress, stage identity, and stage-local progress. `nucleonContents(type)` returns the valence identities and summed electric charge; it does not simulate nuclear dynamics. `getParticle(id)` returns the corresponding immutable metadata or `undefined` for an unknown identity. The W record uses `charge: 1` as the representative W⁺ value and `chargeValues: [-1, 1]` for both states; interfaces display `chargeLabel: '±1'`.

The runtime uses local fonts, pinned Three.js, and the shared [camera rig](../../kit/camera-rig.mjs). It does not require remote images, a remote model endpoint, or an external rendering service.
