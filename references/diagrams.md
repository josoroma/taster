# Interactive diagrams

Use a diagram when the explanation concerns relationships, direction, structure, or sequence. Choose SVG and semantic HTML for a crisp, inspectable result. A diagram can be static when that fully answers the request; add interaction when it reveals useful detail, a path, or a comparison.

## Decide what the diagram means

Start with one sentence stating what the reader should understand. Choose the diagram type from that claim: workflow for successive actions, architecture for components and connections, sequence for messages over time, hierarchy for containment, or state machine for transitions. Do not imply time through a left-to-right architecture unless time is genuinely part of the model.

Write the graph before drawing it. Give nodes stable IDs and short names. Give edges explicit endpoints, a semantic type, a direction when needed, and a useful label. Distinguish workflow, dependency, containment, data movement, and feedback. If the request concerns a codebase, inspect the code and cite the relevant files; a plausible connection is not evidence that it exists.

Keep topology separate from placement and presentation. Selection, descriptions, traces, and exports should reuse the authored graph. A focus mode must not invent an edge or quietly treat a visual group as a dependency. Define whether traversal includes feedback cycles and terminate traversal with a visited set. An animated path communicates the authored story, not measured execution or live traffic.

## Establish hierarchy with the project's identity

Use the established palette, typography, mark, and tone. Taster's own identity is documented in [identity.md](identity.md). Choose one reading order and give important relationships enough room to be understood. Prefer restrained outlines, quiet surfaces, deliberate alignment, and one operation accent. A tiny label, a short arrow, or a repeated heading that adds no information can often be removed.

Route connectors intentionally. Arrowheads must reach their actual endpoints; labels must stay away from unrelated lines and node boundaries. Separate feedback from forward flow. Use a dashed stroke only when its meaning is explained. Keep labels as text, include direction in accessible descriptions, and use shape, wording, or line style alongside color.

For small diagrams, authored coordinates are often clearer than a layout dependency. For larger graphs, choose an appropriate layout engine, pin its version, and still inspect its output. Do not force every graph into a generic grid of identical boxes or every relationship into an arrow.

## Make inspection useful

Give nodes keyboard focus and an accessible action. Select a node to reveal details without losing context or silently scrolling the page. Keep focus stable after a selection; provide Previous/Next or an equivalent path through the explanation. If nodes are interactive, use an SVG `group` with accessible controls rather than an `img` role that can hide interactive descendants.

Provide pan/zoom and an obvious fit/reset control only when they help inspection. Scope keyboard shortcuts to the diagram so forms and page navigation keep their normal behavior. Make gestures work on touch without preventing the surrounding page from scrolling. A compact layout may rearrange positions but must preserve topology and numbering.

Support reduced motion. Do not require animated tracing to understand relationships. Any guided sequence should pause, restart, and show one unambiguous state at a time. Announce changes after user actions, not every animation frame.

## Deliver portable, editable work

Keep the graph data, layout, and renderer editable. For SVG exports, include the complete intended view independent of temporary zoom, selection, hidden details, or trace dimming. Include `xmlns`, explicit dimensions, a `viewBox`, accessible `title` and `desc`, and styling within the file. Embed licensed fonts when identity fidelity matters; otherwise use a declared system-font fallback. Preserve font licenses with the deliverable. Avoid external images and stylesheet dependencies in an export advertised as standalone.

Use [examples/taster-diagram](../examples/taster-diagram/) as the working reference. It has the Taster identity, six connected practices, domain-specific explanations, focus and forward-path exploration, keyboard controls, responsive layout, and a downloadable SVG with embedded fonts. `node examples/taster-diagram/export.mjs` regenerates its checked-in static artifact.

## Verify the claim and the artifact

Check the graph's identifiers and endpoints, relevant known paths, cycle handling, and source claims. Inspect the overview and focused view, narrow and desktop layouts, keyboard focus, labels, arrowheads, and export independently. Make sure detail panels and highlighted paths agree with the selected node. Do not call an export verified just because a download button ran: open the actual SVG and inspect it.

The requested references were [Diagram Design](https://github.com/cathrynlavery/diagram-design), for editorial hierarchy and identity-aware SVG, and [Archify](https://github.com/tt-a1i/archify), for authored topology and interactive inspection. These principles inform Taster's workflow; they do not require installing either project or claiming compatibility with an upstream schema. If upstream code is reused for a later task, inspect its current license and retain the required notices.
