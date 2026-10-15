const $=selector=>document.querySelector(selector);
const filters=$('.filters'),projects=$('.projects');
filters.hidden=false;
filters.addEventListener('click',event=>{
  const button=event.target.closest('button[data-filter]');if(!button)return;
  const category=button.dataset.filter;projects.dataset.filter=category;let count=0;
  for(const project of projects.children){project.hidden=category!=='all'&&project.dataset.category!==category;if(!project.hidden)count++;}
  for(const control of filters.querySelectorAll('button'))control.setAttribute('aria-pressed',String(control===button));
  $('#result-count').textContent=String(count).padStart(2,'0');
});
const prompts={
  mechanism:'Create a robotic hand that opens, closes into a fist, and reveals its inner mechanism. Let me pan, zoom, separate the armor, and reassemble it. Make the motion precise and the design quietly futuristic.',
  science:'Take me on a journey from an atom to its nucleus and quarks. Use careful labels, changes of scale, and a timeline I can scrub. Explain what is measured, what is a visual metaphor, and where our knowledge ends.',
  world:'Build a playable garden where I restore three ancient machines by learning their rhythms. Give the world atmospheric lighting, satisfying movement, readable goals, and an ending that changes the landscape.'
};
let currentPrompt='mechanism';
$('.prompt-tabs').addEventListener('click',event=>{
  const button=event.target.closest('button[data-prompt]');if(!button)return;
  currentPrompt=button.dataset.prompt;
  for(const control of $('.prompt-tabs').querySelectorAll('button'))control.setAttribute('aria-pressed',String(control===button));
  const command=document.createElement('span');command.className='prompt-command';command.textContent='$taster';
  $('#starter-prompt').replaceChildren(command,document.createTextNode(' '+prompts[currentPrompt]));
  $('#copy-status').textContent='';
});
for(const button of document.querySelectorAll('[data-copy]'))button.addEventListener('click',async()=>{
  const isPrompt=button.dataset.copy==='prompt',text=isPrompt?'$taster '+prompts[currentPrompt]:$('#install-commands').textContent;
  try{
    if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(text);
    $('#copy-status').textContent=isPrompt?'Prompt copied. Bring it to your coding agent.':'Installation commands copied.';
  }catch{
    const range=document.createRange();range.selectNodeContents(isPrompt?$('#starter-prompt'):$('#install-commands'));
    const selection=getSelection();selection.removeAllRanges();selection.addRange(range);
    $('#copy-status').textContent='Text selected. Use your browser’s Copy command.';
  }
});
