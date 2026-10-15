# Scientific storytelling

The spectacle should make the science easier to examine. A glowing path, rotating shell, or camera dive can suggest a stronger claim than its caption; check the picture and the words together.

## Establish the contract

Before geometry, identify the question, audience, state variables, equations or rules, units, and what can be changed. Verify consequential and unfamiliar claims against primary sources: original papers, official technical documentation, observatories, laboratories, or university course material. Read the relevant material rather than treating a search snippet or a reference image as evidence. Record source URLs near the claim they support or in a short in-app Sources panel.

Distinguish these levels visibly where it matters:

| Representation | What the viewer should understand |
| --- | --- |
| Quantitative model | Which equations, parameters, and domain of validity generate the result. |
| Schematic | Which scale, dimensions, speed, or topology has been simplified. |
| Metaphor | What the analogy corresponds to and where it stops corresponding. |
| Hypothesis/speculation | Whose proposal it is, what is assumed, and what has not been established. |

“Not to scale,” “probability density,” “ideal noiseless simulation,” or “embedding analogy” are useful concise labels. Avoid a wall of caveats. Put limitations where a viewer could otherwise infer the wrong thing. Sources do not make a numerical simulation correct: test the implemented model against known cases and invariants.

## Teach through a controllable reveal

Orient with the whole system, isolate the relevant relationship, then expose one control that changes an observable result. Ask the viewer to predict or reproduce that result when a challenge fits. Reassemble the scene to connect the discovered mechanism back to the whole.

Separate explanatory time from physical time. A slowed photon pulse, enlarged nucleus, or separated transformer block is an inspection device; label scale or timing when the distinction matters. Keep readouts and captions tied to the actual model snapshot. Use exact expectations and sampled observations as separate quantities, and show sample size when displaying random outcomes.

The domains below are starting points, not permission to reuse a claim without checking the chosen model.

## Quantum computers and entanglement

Represent a chosen state and basis explicitly. Amplitudes, phase, and probabilities are different quantities; compute measurement probabilities from squared amplitude magnitudes. An individual pure qubit can use a Bloch sphere, but an entangled subsystem may be mixed and its local Bloch vector can lie inside the sphere. Do not render every entangled qubit as an independent pure-state arrow.

A circuit explainer can show preparation, gate action, interference, measurement, and repeated sampling. Label ideal simulation versus device data and keep noise assumptions explicit. A quantum computer does not expose all answers from a superposition on demand.

For the Bell state `( |00⟩ + |11⟩ ) / √2`, computational-basis outcomes are equally likely 00 and 11. Correlation in one measurement basis alone is insufficient evidence of entanglement; a classical mixture can share those counts. IBM's [entanglement introduction](https://quantum.cloud.ibm.com/learning/en/courses/basics-of-quantum-information/entanglement-in-action/introduction) makes this distinction. Entanglement does not provide a controllable faster-than-light message; [quantum teleportation](https://quantum.cloud.ibm.com/learning/en/modules/computer-science/quantum-teleportation) requires classical communication. Do not animate a signal racing from one measurement site to the other as the explanation of correlation.

For photon experiments, verify the optical setup, prepared state, and measurement basis together. “Type-I SPDC” alone does not specify a polarization singlet. Source geometry matters: [Kwiat and colleagues' polarization-entangled source](https://arxiv.org/abs/quant-ph/9810003) uses a two-crystal arrangement. Do not combine a schematic crystal, a convenient Bell-state formula, spin arrows, and claimed anticorrelation as if those were automatically the same experiment.

## Atoms and molecules

Use orbital wavefunctions, probability density, energy levels, or a clearly labeled historical model. A bright dot following a planetary track teaches a classical orbit; it is not a literal picture of an electron in a stationary atomic orbital. Point clouds can represent samples from a probability density, with that meaning stated. Distinguish density per volume from a radial probability distribution. MIT's [hydrogen orbital lesson](https://ocw.mit.edu/courses/5-111sc-principles-of-chemical-science-fall-2014/pages/unit-i-the-atom/lecture-6-hydrogen-atom-wavefunctions-orbitals/) is a useful primary teaching source.

For molecular assembly, define whether bonds are a connectivity diagram, a geometric approximation, or a force model. A beautiful DNA helix can explain base pairing and structure without pretending to simulate molecular dynamics. Mark enlarged components and artificial spacing.

## LLMs and transformers

Choose the architecture being explained. Show tokenization, embeddings, positional information, attention, feed-forward operations, residual paths, and next-token distributions only as applicable. The original [Transformer paper](https://arxiv.org/abs/1706.03762) describes a particular encoder-decoder architecture; it is not a specification for every contemporary LLM.

An exploded block is a conceptual computation graph, not a literal physical stack of neurons. Label illustrative weights or toy probabilities. An attention line encodes an attention quantity, not guaranteed causal influence or a thought. Distinguish training (parameters change) from ordinary inference (parameters are used). Avoid minds, memories, or understanding represented as literal mechanisms unless the requested experience is explicitly a metaphor. If depicting a real model, verify its current architecture and use actual tensors or identify the simulation as illustrative.

## Space, time, and black holes

Specify the model and observer. Newtonian orbit mechanics, a relativistic geodesic calculation, and a shader that bends background imagery make different claims. A rubber sheet or funnel is an embedding analogy, not proof that physical space bends downward into an extra surrounding space. Showing time dilation requires a defined comparison of clocks; changing animation speed alone does not establish the result.

Keep an event horizon, black-hole shadow, photon paths, and accretion disk distinct. A black hole need not have a luminous disk. NASA's [black-hole anatomy guide](https://science.nasa.gov/universe/black-holes/anatomy/) and [visualization explanation](https://www.nasa.gov/universe/nasa-visualization-shows-a-black-holes-warped-world/) distinguish these features. If the renderer approximates lensing for visual effect, say so rather than claiming ray tracing of a spacetime metric.

## Higher dimensions and emerging theories

Distinguish spatial dimensions, coordinates, mathematical degrees of freedom, and the dimension of a state space. A projection or slice should state what was projected and what information was lost. An animation of a manifold or subspace illustrates a construction; it does not demonstrate that the universe has that construction.

Treat claims equating extra dimensions with relational degrees of freedom, or deriving spacetime from a new geometric object, as attributable proposals unless the evidence establishes more. Inspect the actual paper and its assumptions, results, and status. If a source cannot be verified, present a clearly labeled conceptual visualization or narrow the claim; never promote a compelling social-media graphic into settled physics.

## Scientific review before delivery

Check that the model preserves its relevant invariant, the visualization maps variables correctly, the captions follow the same state, and the challenge's success condition tests the stated learning goal. Check misleading implications of color, distance, motion, and timing. Include a concise scope note and source links in the artifact. Report what is simulated, what is schematic, and what was actually verified.
