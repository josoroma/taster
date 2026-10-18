# Molecular and biomolecular exploration

Choose one inspectable relationship: sequence versus fold, a ligand at an interface, a changing conformation, or a molecule within a larger cellular setting. Establish whether the scene uses experimental coordinates, a predicted structure, a supplied trajectory, or an authored schematic. Keep that distinction near the view.

## Match the renderer to the evidence

Use [Mol*](https://molstar.org/) for large structures, mmCIF/BinaryCIF, trajectories, density, assemblies, and layered molecular representations. [3Dmol.js](https://3dmol.csb.pitt.edu/doc/) provides embeddable molecular selections and sphere/stick/cartoon/surface representations. Consult their current official documentation, pin dependencies, and bundle runtime assets when delivery must work offline. Preserve required library licenses and data attribution.

Custom Three.js is appropriate for a small, bounded coordinate model or a deliberately schematic molecular mechanism. It is not a general chemistry parser. The [FOLD example](../examples/molecular-lab/) bundles 1CRN and uses a Cα guide plus atomic inspection; its parser explicitly rejects unsupported conformers/models. Keep spatial data separate from renderer objects and ordinary UI. Do not recreate a full molecular engine merely to obtain orbit controls.

## Data contract before geometry

Record the accession, exact file or URL, retrieval date, checksum, experiment/prediction provenance, assembly/model selection, coordinate units, and any processing. Use mmCIF when identifiers or assemblies exceed legacy PDB limits. Preserve author and label chain/residue mappings, insertion codes, atom names, alternate locations, occupancies, and model/frame identity. Never deduplicate by residue number alone.

Choose a conformer policy explicitly. Handle missing residues as gaps, rather than drawing a continuous backbone across them. Retain nonstandard residues, ligands, ions, water, and hydrogens only when supported by the source and relevant to the explanation. Verify which assembly is shown; an asymmetric unit and biological assembly may differ. Color by a stated property. Predicted confidence, experimental B-factors, occupancy, and resolution are different quantities.

For small molecules, carry explicit chemical connectivity and bond order from an appropriate source, such as SDF or a chemical component dictionary. Proximity alone does not establish a covalent bond, hydrogen bond, salt bridge, or binding affinity. If a display uses inferred sticks, document its rule and limits. Read [wwPDB coordinate fields](https://www.wwpdb.org/documentation/file-format-content/format33/sect9.html) and [secondary-structure records](https://www.wwpdb.org/documentation/file-format-content/format33/sect5.html) before interpreting legacy records.

## A useful first interaction

Offer whole-system framing, chain/residue/atom selection, a sequence-to-structure link, and two representations that answer different questions. Keep the selected identifier and units readable. Measure from the same coordinates that position the geometry. Make molecular scale explicit: a ribbon, van der Waals envelope, solvent-accessible surface, and experimental density are different representations.

For a ligand/protein interface, identify the ligand and each interacting chain, expose their atom-level contacts, and let the viewer compare the whole assembly with the binding site. Report the exact atom pairs and distance cutoff used. A close contact is geometric evidence; chemistry and energetic claims need appropriate additional evidence. Do not infer a molecular-glue mechanism from an attractive docking animation or from a screenshot.

Use one camera owner. Gestures interrupt guided travel. Provide focus/reset, keyboard equivalents, labels that stay legible while orbiting, narrow-screen controls, and a useful text guide when WebGL is unavailable. Avoid decorating molecular scenes with unrelated orbital electrons or glowing paths that imply measured signals.

## Motion, from inspection to trajectories

**Static structure:** a deterministic trace, camera tour, representation crossfade, or reversible separation is explanatory motion. Say so. Never call a guessed breathing deformation molecular dynamics. Separation may reveal a chain interface but must not suggest a validated dissociation pathway.

**Multiple experimental or predicted conformers:** preserve each model's identity. An interpolated transition is a morph unless a physical trajectory establishes the intermediate states. Keep atom correspondence and missing-atom policy explicit; do not interpolate between unrelated indices.

**Molecular dynamics:** require compatible topology and trajectory files, stable atom ordering, frame count, physical timestamps and units, and the stated simulation setup. Distinguish sampling interval from playback speed. Decide how to unwrap or reimage periodic coordinates and align structures before computing displacement; periodic jumps and whole-body rotation are not internal conformational changes. Preserve box dimensions where they matter. Treat frame interpolation as display interpolation and keep measurements tied to defined frames or stated interpolated coordinates. Offer play/pause, step, time scrub, rate, and reset; report frame/time alongside selected atoms. Validate atom count/mapping, known distances, periodic handling, endpoint sampling, and repeated seek/reverse behavior.

**Crowded-cell and multiscale scenes:** use instancing, level of detail, spatial indexing, and selective visibility. State what positions, abundances, surfaces, and motion were measured versus placed or animated for explanation. A compelling cellular landscape is not automatically a quantitative reconstruction. On scale changes, retain context and identify which geometries become schematic. Add trajectories or biochemical kinetics only when those models and data exist.

## Verify the claim and the view

Check source bytes and identities; no cross-chain backbone bridges; missing/alternate/model policies; bond provenance; known coordinate distances; consistent ångström/nanometer conversion; and rigid-transform invariance. Test annotation selection against actual atoms, deterministic time, reset, camera interruption, and complete playback. Render overview, selected site, atom view, mobile, reduced motion, and fallback. Inspect console errors and the static build. Report tested scope without claiming scientific validation beyond these checks.
