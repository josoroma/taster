# Interactive books and narrated lessons

Use this workflow for a supplied PDF, book excerpt, chapter, article, or original story that should become a readable interactive lesson. A short authored text is enough; a PDF is optional. Begin with one complete chapter or the requested scope. Preserve the audience, tone, and central idea while replacing passive explanation with useful, controllable evidence.

## Relationship to Papermorph

[DozenTwelve/Papermorph](https://github.com/DozenTwelve/Papermorph) describes a book workflow that moves from source material and visual direction through storyboards, narration, animated chapters, and exercises. Its [authoring skill](https://github.com/DozenTwelve/Papermorph/blob/main/.claude/skills/papermorph/SKILL.md) separates the source/reference workspace from a static delivered book and uses shared visual decisions across chapters.

Taster adapts that workflow using its own examples and runtime. This is authoring support, not compatibility with Papermorph's engine, `style.json`, beat schema, PDF extraction scripts, speech services, SCORM packaging, or video exporter. A request to operate the upstream tool itself needs inspection of its actual instructions and dependencies. Do not silently install or execute the upstream repository. Sources checked October 2026.

## Source → scope → style

1. **Read the actual source.** Identify title, author, edition, language, and chapter or page range. Preserve printed page numbers alongside PDF page indices when they differ. For a story without pages, use stable section or paragraph IDs. Keep an explicit source map so a storyboard beat can be traced back to its source.
2. **Choose a complete scope.** Infer audience and a sensible pilot when the request leaves them open. Use earlier user choices. State what this chapter will help the reader understand; expand to a whole book when requested. Do useful preparation before asking about a genuinely missing source or consequential ambiguity.
3. **Set a coherent style.** Record palette meanings, type, diagram vocabulary, character treatment if any, voice, chapter navigation, and accessibility behavior in an ordinary project note. Diagram-led lessons suit abstract mechanisms; scene-led treatments suit stories and physical settings. The file is a Taster project artifact, not an upstream-compatible manifest.
4. **Recreate the explanation.** Write original concise narration and draw original figures. Preserve source claims and distinguish corrections, simplifications, and new examples. Quote only when appropriate and label quotations. Keep private PDFs, scans, extracted text, page images, and working material outside the public static output unless the user requested and authorized inclusion.

Taster does not provide an automatic PDF extraction service. Use available document-reading tools to inspect a supplied file, verifying page images where equations, diagrams, or reading order require it. Do not invent an extraction result, source page, or inaccessible book content. If only a title is supplied, make a clearly original lesson from verified sources or obtain the actual content before claiming to adapt it.

## Storyboard → narration → animation → quick check

For each beat, write the source location, learning point, narration, visible objects, action, and intended pause. Resolve the key static frames before motion. Use a shared model for the diagrams, labels, readouts, and answer feedback; document units and limitations. A film-like chapter can still allow reading at the user's own pace.

Keep narration available as text. Recorded audio may have measured timestamps; optional browser speech is device-dependent and must be user-triggered with stop controls and a transcript fallback. Do not imply that a speech synthesis request is a generated downloadable soundtrack. Word-by-word synchronization needs a real timing model; a separate read-aloud action does not provide it.

Derive animation from absolute lesson time so seeking and replay reproduce a frame. Distinguish lesson time from physical/model time and label slowing or exaggeration. Include play/pause, seek, chapter navigation, restart, and focused keyboard controls. Pause when hidden, keep reduced-motion playback opt-in, and announce chapter or quiz changes instead of every animation frame.

Put a quick check after the idea it tests. Ask about a visible consequence, explain wrong answers, allow retries, and retain a readable completion state. A story can use a prediction or inspection instead of a scored quiz when that better serves the request. Do not force a quiz that contradicts the simplified model.

## Local example: LEAF / Paper Lab

```sh
node /absolute/path/to/taster/scripts/create-project.mjs /absolute/path/to/my-book --template paper-lab
```

[LEAF](../examples/paper-lab/) is an original three-chapter book on equal-frequency sinusoidal superposition. It pairs an SVG figure with chapter text, a 48-second deterministic timeline, a phase slider, a knowledge check, and a complete transcript with optional browser voice. It requires no remote runtime assets or speech service to operate; available browser voices may be local or remote. It is a small reference implementation, not an imported or converted book.

Its model uses displacement in centimetres, position in metres, phase in degrees, and fourfold slower visual time. See its [README](../examples/paper-lab/README.md) for equations, assumptions, and source attribution. Replace the source map, narration, experiment, model, figures, and quiz together when changing the subject.

## Verify and deliver

Test model invariants and known outcomes, all chapter cuts, seek backward, replay, paused state, and quiz feedback. Use desktop and narrow layouts, keyboard-only controls, reduced motion, a missing speech API or unavailable voice, and console inspection. Visually review screenshots at representative beats and experiment endpoints; an accessible transcript must remain available regardless of audio support.

Deliver the editable local book, run/build commands, controls, actual source references, and scope notes. Keep working extraction assets out of the static build. Include a source map for adapted material and disclose any unread or omitted portions. Publishing, a full bookshelf, LMS packaging, generated audio, or video export are separate deliverables when requested; use the appropriate workflow for each.
