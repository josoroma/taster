# FOLD — a molecular field study

Explore crambin through a backbone ribbon, an atomic view, a residue sequence, and three measured disulfide links. This is Taster's molecular structure starter: an explanation backed by inspectable coordinate data.

From the repository root, run `npm install` and `npm start`, then open [the example](http://localhost:5173/taster/examples/molecular-lab/). No runtime network requests leave the local server. All fonts, coordinates, and rendering dependencies are local. To create an independent project, run `node scripts/create-project.mjs /absolute/empty/destination --template molecular-lab` from the original Taster checkout.

## Explore

- Drag to orbit; Shift/right-drag to pan; scroll to zoom. Touch supports one-finger orbit and two-finger pan/pinch.
- Focus the canvas for left/right orbit, up/down pan, plus/minus zoom, and Home to frame all. Visible buttons provide the same camera actions.
- Select a residue in the sequence or click the structure. The panel gives its chain, author residue number, secondary structure, and recorded atom count.
- Select a disulfide card to focus its paired residues and inspect the measured sulfur distance. The sequence highlights both partners.
- Use Ribbon / Atoms & sticks to change representation. Play, pause, scrub, reverse, and restart the 24-second field study. Time is explanatory time, not a physical trajectory.
- A camera gesture pauses playback. Playback starts paused, including under reduced motion. Reduced motion makes requested camera moves immediate. Hiding the page pauses playback; returning does not resume it automatically.

## Coordinates and scientific scope

[RCSB PDB entry 1CRN](https://www.rcsb.org/structure/1CRN) supplies the bundled model: chain A, residues 1–46, 327 non-hydrogen atoms, X-ray diffraction at 1.50 Å resolution. See the [deposition DOI](https://doi.org/10.2210/pdb1CRN/pdb), [download](https://files.rcsb.org/download/1CRN.pdb), and local [unaltered PDB file](assets/1crn.pdb). Depositors: W. A. Hendrickson and M. M. Teeter. The entry records its literature citations in `JRNL` and `REMARK 1`.

The source snapshot was retrieved 2026-10-18. SHA-256: `42199a30a0701864a2a5cc76cd7f35cc544cd0e65fbcf63e03c166543249b811`. PDB archival data are distributed under [the wwPDB/RCSB data-use policies](https://www.rcsb.org/pages/policies). Retain the source file, identifier, and attribution when adapting the example.

The pure model preserves original atom coordinates in ångströms, atom serial/name, element, chain, author residue number, insertion-code field, occupancy, and B-factor. Rendering translates coordinates to center the scene; it never deforms them. The parser is deliberately limited to this single-model, continuous-chain, standard-amino-acid structure. It rejects alternate locations, multiple models/chains, numbering gaps, and nonempty insertion codes instead of silently combining conformers or bridging gaps. Use a full molecular reader for general PDB/mmCIF uploads.

HELIX and SHEET records assign the colored regions. The source notes distortions near helix termini; the display does not claim to independently assign secondary structure. The flat ribbon is a smooth Cα guide with schematic width, not an exact cartoon algorithm or protein surface. Local sticks use a distance heuristic within residues and adjacent peptide groups, with radii C 0.76, N 0.71, O 0.66, S 1.05 Å and a 0.35 Å tolerance; they do not encode bond order. Disulfide connectivity comes explicitly from SSBOND records. Hydrogens, solvent, density, and surface meshes are not invented.

Measured SG–SG separations from the rounded deposited coordinates:

| Pair, chain A | Atom serials | Distance / Å | Difference in residue numbers |
| --- | --- | --- | --- |
| Cys 3–Cys 40 | 20–282 | 2.004107 | 37 |
| Cys 4–Cys 32 | 26–229 | 2.034702 | 28 |
| Cys 16–Cys 26 | 116–188 | 2.050763 | 10 |

The second coordinate-derived value rounds to 2.03 Å even though the archival SSBOND field reports 2.04 Å. The interface always reports its own coordinate calculation. These are geometric separations, not a binding-energy estimate. The 10 Å reference segment is world-space geometry and changes apparent length under perspective.

Playback traces the backbone, switches representation, and selects pairs. Atom positions remain fixed. This is neither a folding simulation nor molecular dynamics. The 1.50 Å figure describes the deposited diffraction resolution, not the radius of an atom or the precision of every atomic position.

## Implementation and checks

`src/model.mjs` owns parsing, residue identity, connectivity, distance calculations, and deterministic explanatory time. `src/scene.mjs` owns static geometry, picking, and a single camera rig. `main.mjs` owns controls and playback. Atom and stick geometry is instanced; pixel ratio is capped at 1.6; there is one animation loop.

Run `node --test tests/molecular-lab.test.mjs` for provenance, identity, connectivity, measured distances, and reversible timing checks. Browser actions in `tests/browser/molecular-lab.actions.json` cover selection, representation, seek/reverse, camera interruption, and reset. `tests/browser/molecular-fallback.actions.json` checks the readable no-WebGL guide. The public `window.__molecularLab.stats()` hook reports data and viewer state for verification. It does not expose a molecular simulation.

Reusable dependencies: `kit/camera-rig.mjs`, `kit/motion.mjs`, `three`, local DM Sans / Italiana fonts, and the root favicon. Preserve the entire `assets/` subfolder with the example.
