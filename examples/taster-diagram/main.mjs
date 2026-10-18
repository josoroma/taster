import { STAGES, ROUTES, inspectStage, traceGraph, nextStage, layoutGraph } from './src/model.mjs';
import { SVG_STYLE, renderGraph, exportSVG } from './src/diagram.mjs';

const $ = selector => document.querySelector(selector);
const svg = $('#diagram');
const viewport = $('#diagram-viewport');
const compactQuery = matchMedia('(max-width:760px)');
const state = { route:'all', selected:'prompt', trace:'none', zoom:1, compact:compactQuery.matches, x:0, y:0 };
const style = document.createElementNS('http://www.w3.org/2000/svg','style');
style.textContent = SVG_STYLE;
svg.append(style);
const graph = document.createElementNS('http://www.w3.org/2000/svg','g');
svg.append(graph);
let dragging = null;
let fontPromise;

function announce(message) { $('#status').textContent = message; }

function updateView() {
  const { width, height } = layoutGraph(state.compact);
  const w = width / state.zoom, h = height / state.zoom;
  // Retain some context around the graph; repeated pan cannot lose it entirely.
  state.x = Math.min(width-w+width*.12, Math.max(-width*.12, state.x));
  state.y = Math.min(height-h+height*.12, Math.max(-height*.12, state.y));
  svg.setAttribute('viewBox', `${state.x} ${state.y} ${w} ${h}`);
  $('#zoom-level').textContent = `${Math.round(state.zoom*100)}%`;
  $('#zoom-out').disabled = state.zoom <= 1;
  $('#zoom-in').disabled = state.zoom >= 3.5;
}

function zoomBy(factor) {
  const { width,height } = layoutGraph(state.compact);
  const before = state.zoom;
  state.zoom = Math.max(1,Math.min(3.5,before*factor));
  state.x += width/before/2-width/state.zoom/2;
  state.y += height/before/2-height/state.zoom/2;
  updateView();
}

function fit() { state.zoom=1;state.x=0;state.y=0;updateView(); }

function draw() {
  graph.innerHTML = renderGraph({ ...state });
  updateView();
}

function updateSelection() {
  const details = inspectStage(state.route,state.selected);
  const index = STAGES.findIndex(stage => stage.id === state.selected);
  const traced = traceGraph(state.selected,state.trace);
  for (const element of graph.querySelectorAll('[data-stage]')) {
    const selected = element.dataset.stage === state.selected;
    element.classList.toggle('selected',selected);
    element.classList.toggle('dimmed',!traced.nodes.includes(element.dataset.stage));
    element.setAttribute('aria-pressed',String(selected));
  }
  for (const element of graph.querySelectorAll('[data-edge]')) element.classList.toggle('dimmed',!traced.edges.includes(element.dataset.edge));
  $('#detail-number').textContent = `${details.number} / 06`;
  $('#detail-type').textContent = details.short;
  $('#detail-name').textContent = details.name;
  $('#detail-title').textContent = details.title;
  $('#detail-description').textContent = details.text;
  $('#detail-evidence').replaceChildren(...details.evidence.map(text => { const li=document.createElement('li');li.textContent=text;return li; }));
  $('#stage-position').textContent = String(index+1);
  $('#previous-stage').disabled = index === 0;
  $('#next-stage').disabled = index === STAGES.length-1;
  $('#trace-note').textContent = state.trace === 'forward'
    ? 'Follows solid arrows only. The revision loop stays separate.'
    : state.trace === 'related' ? 'Shows incoming and outgoing relationships, including revision.' : 'Every line is an authored relationship.';
}

function selectStage(stage, {focus=false, announceChange=true} = {}) {
  inspectStage(state.route,stage);
  state.selected = stage;
  updateSelection();
  if (focus) {
    const node = graph.querySelector(`[data-stage="${stage}"]`);
    node.focus({preventScroll:true});
    if (state.zoom > 1) {
      const { width,height,nodes }=layoutGraph(state.compact);
      const position = nodes.find(node => node.id === stage);
      state.x=position.x+position.width/2-width/state.zoom/2;
      state.y=position.y+position.height/2-height/state.zoom/2;
      updateView();
    }
  }
  if (announceChange) announce(`${STAGES.find(item => item.id === stage).short}. ${inspectStage(state.route,stage).title}`);
}

function selectRoute(route) {
  if (!Object.hasOwn(ROUTES,route)) return;
  state.route=route;
  const content=ROUTES[route];
  for (const button of document.querySelectorAll('[data-route]')) button.setAttribute('aria-pressed',String(button.dataset.route === route));
  $('#route-kicker').textContent=content.kicker;
  $('#route-description').textContent=content.description;
  $('#takeaway-title').textContent=content.outcome;
  $('#outcome-label').textContent=route === 'all' ? 'The shared thread' : content.name;
  $('.capabilities').replaceChildren(...content.examples.map(text => {const span=document.createElement('span');span.textContent=text;return span;}));
  draw();updateSelection();
  announce(`${content.name}. ${inspectStage(route,state.selected).title}`);
}

async function embeddedFonts() {
  fontPromise ??= Promise.all([
    ['DM Sans','dm-sans-400.ttf',400],['DM Sans','dm-sans-500.ttf',500],['DM Sans','dm-sans-600.ttf',600],['Italiana','italiana.ttf',400],
  ].map(async ([family,file,weight]) => {
    const response = await fetch(new URL(`../../assets/fonts/${file}`,import.meta.url));
    if (!response.ok) throw new Error(`Font unavailable: ${file}`);
    const data = new Uint8Array(await response.arrayBuffer());
    let binary='';for (let index=0;index<data.length;index+=8192) binary+=String.fromCharCode(...data.subarray(index,index+8192));
    return `@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};src:url(data:font/ttf;base64,${btoa(binary)}) format('truetype');}`;
  })).then(styles=>styles.join('')).catch(error => {fontPromise=null;throw error;});
  return fontPromise;
}

async function standaloneSVG() { return exportSVG(state.route,await embeddedFonts()); }

$('#export').addEventListener('click',async () => {
  const button=$('#export');button.disabled=true;
  announce('Preparing the complete diagram and embedding its fonts…');
  try {
    const source=await standaloneSVG();
    const blob=new Blob([source],{type:'image/svg+xml;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const link=document.createElement('a');link.href=url;link.download=`taster-${state.route}-diagram.svg`;
    document.body.append(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),30000);
    announce('SVG downloaded with local fonts, all six stages, and an accessible description.');
  } catch (error) { announce(`Export could not finish: ${error.message}. Keep the local fonts beside the example and try again.`); }
  finally { button.disabled=false; }
});

for (const button of document.querySelectorAll('[data-route]')) button.addEventListener('click',()=>selectRoute(button.dataset.route));
$('#trace-mode').addEventListener('change',event=>{state.trace=event.target.value;updateSelection();announce($('#trace-note').textContent);});
$('#previous-stage').addEventListener('click',()=>selectStage(nextStage(state.selected,-1)));
$('#next-stage').addEventListener('click',()=>selectStage(nextStage(state.selected,1)));
$('#zoom-in').addEventListener('click',()=>zoomBy(1.25));
$('#zoom-out').addEventListener('click',()=>zoomBy(1/1.25));
$('#reset-view').addEventListener('click',()=>{fit();announce('Full diagram restored.');});
graph.addEventListener('click',event=>{const node=event.target.closest('[data-stage]');if(node) selectStage(node.dataset.stage);});
graph.addEventListener('keydown',event=>{
  const node=event.target.closest('[data-stage]');if(!node)return;
  if (event.key === 'Enter' || event.key === ' ') {event.preventDefault();selectStage(node.dataset.stage);}
  if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)) {
    event.preventDefault();event.stopPropagation();
    selectStage(nextStage(node.dataset.stage,['ArrowRight','ArrowDown'].includes(event.key)?1:-1),{focus:true});
  }
});
viewport.addEventListener('keydown',event=>{
  if (event.key === '+' || event.key === '=') {event.preventDefault();zoomBy(1.25);}
  else if (event.key === '-') {event.preventDefault();zoomBy(.8);}
  else if (event.key === 'Home') {event.preventDefault();fit();}
  else if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)) {
    event.preventDefault();const amount=50/state.zoom;
    if(event.key==='ArrowLeft')state.x-=amount;if(event.key==='ArrowRight')state.x+=amount;
    if(event.key==='ArrowUp')state.y-=amount;if(event.key==='ArrowDown')state.y+=amount;updateView();
  }
});
viewport.addEventListener('pointerdown',event=>{
  if(event.button!==0 || event.target.closest('[data-stage]'))return;
  const size=svg.getBoundingClientRect();
  dragging={id:event.pointerId,x:event.clientX,y:event.clientY,startX:state.x,startY:state.y,scale:layoutGraph(state.compact).width/state.zoom/size.width};
  viewport.setPointerCapture(event.pointerId);viewport.classList.add('dragging');
});
viewport.addEventListener('pointermove',event=>{
  if(!dragging || event.pointerId!==dragging.id)return;
  state.x=dragging.startX-(event.clientX-dragging.x)*dragging.scale;
  state.y=dragging.startY-(event.clientY-dragging.y)*dragging.scale;updateView();
});
for (const name of ['pointerup','pointercancel','lostpointercapture']) viewport.addEventListener(name,()=>{dragging=null;viewport.classList.remove('dragging');});
compactQuery.addEventListener('change',()=>{state.compact=compactQuery.matches;fit();draw();updateSelection();});
draw();updateSelection();

window.__tasterDiagram=Object.freeze({
  ready:true,
  getState:()=>({...state,traced:traceGraph(state.selected,state.trace)}),
  exportSVG:standaloneSVG,
});
