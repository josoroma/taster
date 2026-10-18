# SHIFT

A 90-second interactive film about selected milestones of the Transformer era, from *Attention Is All You Need* to the open question of AGI. Seven chapters use original code-drawn diagrams, warm paper, cobalt, and vermilion. No stock footage, generated images, external fonts, or network-dependent runtime assets.

[Watch SHIFT](https://josoroma.github.io/taster/examples/ai-history/).

## Run the source

From the Taster repository root:

```sh
npm install
npm start
npm test
npm run build
```

Open the address printed by the server and choose **SHIFT** from the example catalog.

The production page is `dist/examples/ai-history/index.html`. Serve `dist/` over HTTP. This example needs the shared `kit/motion.mjs` and `assets/fonts/` directory; use Taster's project generator when copying it independently.

## Watch and explore

- **Play / pause:** the button or Space while the film panel is focused. Playback starts paused, including under reduced motion.
- **Seek:** drag the timeline; choose any chapter; use ← / → on the film panel for five-second steps.
- **Restart / end:** the restart button, or Home / End while the film panel is focused.
- **Speed:** 0.5×–2×, or −1× to play the film backward. Play from the final frame replays from the beginning.
- **Sources & context:** opens the primary sources and pauses playback. A full transcript is below the film.

No voice track or video encoder is included. Captions are the narration. Every rendered frame is derived from absolute film time, so seeking backward and replaying cannot accumulate animation drift. The Canvas 2D renderer does not depend on WebGL and works offline after local dependencies are available.

## Scientific scope

This is a selective history beginning in 2017, not the history of all AI. Attention, pre-training, transfer learning, and reinforcement learning have earlier roots. The film covers:

1. **2017 — Transformer:** relationships computed through attention; parallel training positions do not imply parallel autoregressive generation.
2. **2018 — BERT:** bidirectional representations and downstream fine-tuning. BERT is an encoder, not a next-token chatbot.
3. **2020 — GPT-3:** 175 billion parameters and few-shot examples in context, without prompt-specific weight updates.
4. **2022 — InstructGPT:** demonstrations and ranked responses as training signals; preference does not establish truth.
5. **2023 — GPT-4:** image and text inputs, text output. No unpublished architectural details are implied.
6. **2024+ — systems:** increased reasoning computation and tool-use loops. ReAct, an earlier example of tool-using reasoning, was introduced in 2022.
7. **AGI? — open question:** breadth, depth, and evidence. No forecast date, claim of achievement, or claim of consciousness.

All diagrams are conceptual; attention weights are illustrative, not values from a trained model. Drawn units do not correspond one-to-one with parameters. The final capability map has no numerical measurements and does not rank actual systems.

## Primary sources

- Vaswani et al., [Attention Is All You Need](https://arxiv.org/abs/1706.03762), 2017.
- Devlin et al., [BERT](https://arxiv.org/abs/1810.04805), 2018.
- Brown et al., [Language Models are Few-Shot Learners](https://arxiv.org/abs/2005.14165), 2020.
- Ouyang et al., [Training language models to follow instructions with human feedback](https://arxiv.org/abs/2203.02155), 2022.
- OpenAI, [GPT-4 Technical Report](https://arxiv.org/abs/2303.08774), 2023.
- OpenAI, [Learning to reason with LLMs](https://openai.com/index/learning-to-reason-with-llms/), historical 2024 announcement.
- Yao et al., [ReAct](https://arxiv.org/abs/2210.03629), 2022 / ICLR 2023.
- Morris et al., [Levels of AGI](https://arxiv.org/abs/2311.02462), 2023; one proposed operational framework, not a universal definition.

Sources checked October 2026.

## Editing and inspection

- [src/model.mjs](src/model.mjs): chapters, narration, source metadata, and pure timeline sampling.
- [src/scene.mjs](src/scene.mjs): seven Canvas diagrams; each accepts sampled absolute time.
- [main.mjs](main.mjs): transport, DOM captions, keyboard controls, and modal context.
- [style.css](style.css): responsive visual system.

`window.__aiHistory.stats()` exposes transport and renderer state. `seek(seconds)` pauses and renders that exact frame; `pause()` and `render()` are available for deterministic capture. The developer API is not required for playback.
