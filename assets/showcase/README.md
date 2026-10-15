# Taster showcase captures

These are screenshots of the seven running, code-rendered examples. The collage is a browser-rendered layout of those screenshots; it contains no generated imagery.

To refresh them, run the local development server, then:

```sh
node scripts/capture-showcase.mjs
```

Refresh one screenshot and the collage with `node scripts/capture-showcase.mjs cyborg-hand`. Refresh only the collage with `node scripts/capture-showcase.mjs collage`. Set `TASTER_PREVIEW_URL` to capture another deployed copy with the same paths. The script requires Chrome or Chromium, as documented by `scripts/drive.mjs`.

`collage.html` is the composition source for the 1600 × 960 PNG. Each example is captured in a real inspectable state: Lumen after starting, Bell Lab at its entanglement chapter, Workshop after the pocket operation, SHIFT at attention, Cerebra with regions separated, INNERSPACE at the atom, and DEXTRA with its hand extended.
