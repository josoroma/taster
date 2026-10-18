# Taster — One idea. Many ways in.

An interactive diagram explaining how Taster turns a question into a model, a visual representation, an interaction, a verified explanation, and editable source. Switch among overview, molecular structure, diagram, and video examples without changing the underlying workflow.

[Explore the Taster diagram](https://josoroma.github.io/taster/examples/taster-diagram/). The example uses native HTML, SVG, and JavaScript modules, with no diagram library, account, external API, or external runtime dependency.

## Run the source

Run `npm install` and `npm start` from the repository root, then open the address printed by the server and choose **The Taster map** from the example catalog. Serve the files over HTTP so module imports and the font-embedding export can load.

## Controls

- Select a stage for details. Previous and next buttons move through the six stages.
- Tab reaches every stage. Enter or Space selects it. Arrow keys on a stage move through the workflow and retain keyboard focus.
- Choose **Related to this stage** for incident relationships or **Follow the output** for the authored forward path. Forward tracing deliberately excludes the revision loop.
- Drag the diagram background to pan. Use `+`, `−`, or the visible buttons to zoom. Arrow keys on the focused viewport pan; **Home** or **Fit** restores the complete diagram.
- **Download SVG** exports the chosen explanation form with the entire graph, embedded fonts, and accessible title/description. Temporary focus, trace dimming, and zoom are not exported.

The narrow layout rearranges the same six stages into three rows. Reduced motion disables focus-fade transitions. There is no unsolicited animation.

## Source and exports

- `src/model.mjs` holds authored nodes, typed relationships, explanation text, topology traversal, and responsive layout.
- `src/diagram.mjs` renders the SVG and exports a complete static diagram.
- `main.mjs` owns selection, accessible details, viewport state, and browser download.
- [taster-workflow.svg](https://josoroma.github.io/taster/examples/taster-diagram/taster-workflow.svg) is a ready-to-share standalone overview with embedded local fonts. Regenerate it with `node examples/taster-diagram/export.mjs` from the repository root.

The diagram represents Taster's authoring practice. It is not a telemetry trace, a service architecture, or a claim that all work happens in a rigid sequence. The dashed verification-to-model relationship explicitly represents revision.

## Identity and references

The example uses Taster's existing mark from `assets/showcase/logo.svg`, local DM Sans and Italiana, paper `#f3f2eb`, ink `#273026`, accent `#d9ed92`, dark `#1b231d`, muted `#697064`, and line `#d6d8cc`. Font licenses are in `assets/fonts/DM-Sans-OFL.txt` and `assets/fonts/Italiana-OFL.txt`; keep them when redistributing the bundled fonts or SVG.

Two requested projects informed the approach, reviewed on October 18, 2026:

- [Diagram Design](https://github.com/cathrynlavery/diagram-design): editorial hierarchy, restrained emphasis, semantic identity tokens, and portable SVG.
- [Archify](https://github.com/tt-a1i/archify): authored graph relationships, inspectable nodes, and faithful path exploration.

This is an original Taster implementation. Neither project is installed, imported, or required at runtime; no upstream source code or templates are copied. Their current capabilities may extend beyond the principles used here.

## Verification

`node --test tests/taster-diagram.test.mjs` checks graph integrity, complete explanation forms, directed forward tracing, incident relationships, keyboard sequence boundaries, responsive node separation, and export completeness.

With the local server running:

```sh
node scripts/drive.mjs http://localhost:5173/taster/examples/taster-diagram/ --actions tests/browser/taster-diagram.actions.json --width 1440 --height 1100
node scripts/drive.mjs http://localhost:5173/taster/examples/taster-diagram/ --actions tests/browser/taster-diagram.actions.json --width 390 --height 844 --reduced
```

The example exposes `window.__tasterDiagram.getState()` for read-only browser checks and `window.__tasterDiagram.exportSVG()` to inspect the same standalone source used by Download SVG.
