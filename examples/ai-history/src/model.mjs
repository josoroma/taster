/** A deliberately selective history. All film state is sampled from absolute seconds. */
export const DURATION = 90;
export const CHAPTERS = Object.freeze([
  {id:'attention', start:0, end:14, year:'2017', label:'Attention', title:'A new way\nto connect.', lead:'Attention Is All You Need', caption:'The Transformer relates tokens through attention. Relationships become part of the computation, without a recurrent chain.', note:'Attention weights here are illustrative. Training can process positions in parallel; autoregressive generation still advances token by token.', insight:'Relationships, computed.', source:0},
  {id:'transfer', start:14, end:26, year:'2018', label:'Transfer', title:'Learn once.\nAdapt widely.', lead:'BERT & pre-training', caption:'BERT learns contextual representations from unlabeled text, then adapts them to tasks such as answering questions and classifying sentences.', note:'This is an encoder model, not a next-token chatbot. Pre-training and transfer learning have earlier roots.', insight:'One foundation. Many tasks.', source:1},
  {id:'scale', start:26, end:39, year:'2020', label:'Scale', title:'Examples\nbecome prompts.', lead:'GPT-3 · 175 billion parameters', caption:'GPT-3 demonstrates how a large language model can attempt new tasks from examples in its context, without updating its weights for each prompt.', note:'The architecture drawing is symbolic, not 175 billion units. More parameters do not guarantee truth, reasoning, or general intelligence.', insight:'Adapt through context.', source:2},
  {id:'feedback', start:39, end:51, year:'2022', label:'Feedback', title:'Prediction\nmeets preference.', lead:'Instruction following', caption:'Demonstrations and ranked responses help train models to follow instructions. Human feedback changes which answers the model is encouraged to produce.', note:'The ranking is an example, not an experimental result. Preference is not the same as truth, and models can still make mistakes.', insight:'A different training signal.', source:3},
  {id:'multimodal', start:51, end:63, year:'2023', label:'Multimodal', title:'The input\ngets wider.', lead:'GPT-4 · image + text', caption:'Multimodal models connect more than one kind of input. The GPT-4 report describes a model that accepts images and text and produces text.', note:'These are conceptual input streams, not a disclosed GPT-4 architecture. Seeing an image does not imply human perception or awareness.', insight:'More ways to represent a world.', source:4},
  {id:'systems', start:63, end:78, year:'2024 +', label:'Systems', title:'From answers\nto processes.', lead:'Reasoning & tools', caption:'Some systems spend more computation on solving a problem. Tool-using systems can act, observe a result, and revise their next step.', note:'These are related research directions, not a single invention in 2024. ReAct was introduced in 2022; reasoning and tool use are not guarantees of reliability.', insight:'Compute. Act. Check. Repeat.', source:5},
  {id:'frontier', start:78, end:90, year:'OPEN QUESTION', label:'AGI?', title:'How general\nis general?', lead:'The frontier, not a finish date', caption:'AGI asks for breadth as well as depth: strong performance across many kinds of tasks. Definitions and ways of measuring it remain subjects of research.', note:'This ending is a question, not a claim that AGI has arrived or a prediction of when it will. Intelligence does not imply consciousness.', insight:'Capability needs evidence.', source:7},
].map(Object.freeze));
export const SOURCES = Object.freeze([
  {title:'Attention Is All You Need', author:'Vaswani et al.', date:'2017', url:'https://arxiv.org/abs/1706.03762', detail:'Transformer architecture and attention; not the beginning of AI or attention research.'},
  {title:'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding', author:'Devlin et al.', date:'2018', url:'https://arxiv.org/abs/1810.04805', detail:'Contextual pre-training followed by fine-tuning for downstream tasks.'},
  {title:'Language Models are Few-Shot Learners', author:'Brown et al.', date:'2020', url:'https://arxiv.org/abs/2005.14165', detail:'GPT-3, 175B parameters, and examples provided in context without weight updates.'},
  {title:'Training language models to follow instructions with human feedback', author:'Ouyang et al.', date:'2022', url:'https://arxiv.org/abs/2203.02155', detail:'Demonstrations, response comparisons, and reinforcement learning from human feedback.'},
  {title:'GPT-4 Technical Report', author:'OpenAI', date:'2023', url:'https://arxiv.org/abs/2303.08774', detail:'Image and text inputs, text outputs; no undisclosed architectural details are implied here.'},
  {title:'Learning to reason with LLMs', author:'OpenAI', date:'2024', url:'https://openai.com/index/learning-to-reason-with-llms/', detail:'The historical o1 announcement describes reinforcement learning for reasoning and increased computation at inference.'},
  {title:'ReAct: Synergizing Reasoning and Acting in Language Models', author:'Yao et al.', date:'2022 / ICLR 2023', url:'https://arxiv.org/abs/2210.03629', detail:'An earlier example of interleaving reasoning traces, actions, and observations.'},
  {title:'Levels of AGI for Operationalizing Progress on the Path to AGI', author:'Morris et al.', date:'2023', url:'https://arxiv.org/abs/2311.02462', detail:'One proposed framework separating performance, generality, and autonomy; no universal AGI threshold is assumed.'},
].map(Object.freeze));
export const clamp = (n, lo=0, hi=1) => Math.min(hi, Math.max(lo, n));
export const smooth = n => {const v=clamp(n); return v*v*(3-2*v);};
export function sampleFilm(seconds) {
  const time = clamp(Number.isFinite(seconds) ? seconds : 0, 0, DURATION);
  const index = Math.max(0, CHAPTERS.findLastIndex(c => time >= c.start));
  const chapter = CHAPTERS[index];
  const local = time - chapter.start;
  return { time, index, chapter, local, progress:clamp(local/(chapter.end-chapter.start)), reveal:smooth(local/1.6), finished:time===DURATION };
}
export function attentionWeights(row, size=8) {
  const scores = Array.from({length:size},(_,col) => Math.exp(Math.sin((row+1)*(col+3)*.69)*1.9 + (row===col?1:0)));
  const sum=scores.reduce((a,b)=>a+b,0);
  return scores.map(n=>n/sum);
}
