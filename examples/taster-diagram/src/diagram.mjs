import { STAGES, ROUTES, layoutGraph, traceGraph } from './model.mjs';

const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;' }[character]));
const ICONS = {
  prompt:'<path d="M4 8H38V30H17L8 38V30H4Z"/><path d="M11 16H31M11 22H24"/>',
  model:'<circle cx="10" cy="12" r="5"/><circle cx="33" cy="10" r="5"/><circle cx="25" cy="34" r="5"/><path d="M15 12L28 10M12 17L22 30M31 15L27 29"/>',
  representation:'<path d="M3 13L22 3L41 13L22 23Z M3 13V32L22 42L41 32V13M22 23V42"/>',
  interaction:'<circle cx="22" cy="22" r="17"/><path d="M22 12V32M12 22H32"/>',
  verify:'<circle cx="22" cy="22" r="17"/><path d="M12 22L19 29L32 15"/>',
  deliver:'<path d="M6 8H19L24 13H39V37H6ZM14 23L10 27L14 31M30 23L34 27L30 31M25 21L20 33"/>',
};

export const SVG_STYLE = `
  .diagram-paper{fill:#f3f2eb}.diagram-ink{fill:#273026}.diagram-muted{fill:#697064}
  .diagram-label{font-family:'DM Sans',Arial,sans-serif;font-weight:400}
  .diagram-node{cursor:pointer;outline:none}.node-box{fill:#f8f8f2;stroke:#b9bfb1;stroke-width:1.2}
  .node-number{font:500 13px 'DM Sans',Arial,sans-serif;letter-spacing:1.3px;fill:#697064}
  .node-name{font:500 27px 'DM Sans',Arial,sans-serif;letter-spacing:-.8px;fill:#273026}
  .node-hint{font:400 13px 'DM Sans',Arial,sans-serif;fill:#697064}
  .node-action{font:500 10px 'DM Sans',Arial,sans-serif;letter-spacing:1px;fill:#697064}
  .node-icon{fill:none;stroke:#697064;stroke-width:1.4;stroke-linejoin:round;stroke-linecap:round}
  .diagram-node.selected .node-box{fill:#d9ed92;stroke:#465434;stroke-width:1.3}
  .diagram-node.selected .node-icon{stroke:#273026}.diagram-node.selected .node-number,.diagram-node.selected .node-hint,.diagram-node.selected .node-action{fill:#465434}
  .diagram-node:hover .node-box{stroke:#273026;stroke-width:2}
  .diagram-node:focus-visible .node-box{stroke:#273026;stroke-width:3}
  .diagram-node:focus-visible .focus-ring{stroke:#273026;stroke-width:1;fill:none}
  .focus-ring{fill:none;stroke:none}.diagram-edge{fill:none;stroke:#697064;stroke-width:1.2;stroke-linecap:round;stroke-linejoin:round}
  .diagram-edge.revision{stroke-dasharray:5 5}.edge-label{fill:#697064;font:400 12px 'DM Sans',Arial,sans-serif}
  .section-label{fill:#697064;font:500 11px 'DM Sans',Arial,sans-serif;letter-spacing:2px}
  .diagram-node.dimmed,.edge-group.dimmed{opacity:.24}.diagram-node,.edge-group{transition:opacity .16s}
  @media(prefers-reduced-motion:reduce){.diagram-node,.edge-group{transition:none}}
`;

export function renderGraph({route = 'all', selected = 'prompt', trace = 'none', compact = false, interactive = true} = {}) {
  if (!Object.hasOwn(ROUTES, route)) throw new RangeError('Unknown route');
  const layout = layoutGraph(compact);
  const traced = traceGraph(selected ?? 'prompt', trace);
  const markerId = interactive ? 'taster-arrow' : 'taster-export-arrow';
  const nodes = layout.nodes.map(node => {
    const text = ROUTES[route].stages[node.id];
    const nameSize = compact && node.id === 'representation' ? 23 : 27;
    const hints = node.hint.split(', ');
    const hint = compact && hints.length > 2 ? `${hints[0]}, ${hints[1]}` : node.hint;
    return `<g class="diagram-node${selected === node.id ? ' selected' : ''}${traced.nodes.includes(node.id) ? '' : ' dimmed'}" data-stage="${node.id}" transform="translate(${node.x} ${node.y})"${interactive ? ` tabindex="0" role="button" aria-pressed="${selected === node.id}" aria-label="${node.number}. ${escape(node.short)}: ${escape(text[0])}" aria-controls="stage-detail"` : ''}>
      <title>${escape(node.short)} — ${escape(text[0])}</title><desc>${escape(text[1])}</desc>
      <rect class="node-box" width="${node.width}" height="${node.height}" rx="3"/>
      <rect class="focus-ring" x="-5" y="-5" width="${node.width+10}" height="${node.height+10}" rx="5"/>
      <text class="node-number" x="22" y="30">${node.number}</text>
      <text class="node-name" style="font-size:${nameSize}px" x="22" y="71">${node.short}</text>
      <text class="node-hint" x="22" y="98">${escape(hint)}</text>
      <text class="node-action" x="22" y="148">${interactive ? 'EXPLORE' : 'TASTER'} <tspan dx="5">↗</tspan></text>
      <g class="node-icon" aria-hidden="true" transform="translate(${node.width-66} 115) scale(.8)">${ICONS[node.id]}</g>
    </g>`;
  }).join('');
  const shortLabels = {'prompt-model':'brief','model-representation':'view','representation-interaction':'inspect','interaction-verify':'test','verify-deliver':'deliver'};
  const edges = layout.edges.map(edge => `<g class="edge-group${traced.edges.includes(edge.id) ? '' : ' dimmed'}" data-edge="${edge.id}"><title>${escape(edge.from)} → ${escape(edge.to)}: ${escape(edge.label)}</title>
    <path class="diagram-edge ${edge.kind}" d="${edge.path}" marker-end="url(#${markerId})"/>
    <text class="edge-label" x="${edge.labelX}" y="${edge.labelY}" text-anchor="${edge.vertical ? 'start' : 'middle'}">${escape(compact && !edge.vertical && edge.kind !== 'revision' ? shortLabels[edge.id] : edge.label)}</text></g>`).join('');
  return `<defs><marker id="${markerId}" viewBox="0 0 8 8" refX="7.6" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M1 1L7 4L1 7" fill="none" stroke="#697064" stroke-width="1.2"/></marker></defs>
    <text class="section-label" x="48" y="40">${compact ? 'THE TASTER WORKFLOW' : 'INTENT → A WORKING EXPLANATION'}</text>
    <text class="section-label" x="${layout.width-48}" y="${layout.height-25}" text-anchor="end">${route === 'all' ? 'SIX CONNECTED PRACTICES' : escape(ROUTES[route].name.toUpperCase())}</text>
    ${edges}${nodes}`;
}

/** Always exports the full authored graph, independently of temporary viewport state. */
export function exportSVG(route, fontCSS = '') {
  if (!Object.hasOwn(ROUTES, route)) throw new RangeError('Unknown route');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="1080" viewBox="0 0 1440 1080" role="img" aria-labelledby="taster-export-title taster-export-description">
    <title id="taster-export-title">Taster — ${escape(ROUTES[route].name)}</title>
    <desc id="taster-export-description">${escape(ROUTES[route].description)} Six stages: ${STAGES.map(stage => stage.short).join(', ')}. Solid arrows show the forward workflow. A dashed arrow returns verification findings to the model for revision.</desc>
    <style>${fontCSS}${SVG_STYLE}</style><rect class="diagram-paper" width="1440" height="1080"/>
    <g transform="translate(60 40) scale(.8)" aria-label="Taster"><rect width="348" height="96" rx="8" fill="#f3f2eb"/><g transform="translate(8 10)"><path d="M38 0 46 25 71 33 46 41 38 66 30 41 5 33 30 25Z" fill="#273526"/><path d="M38 22 49 33 38 44 27 33Z" fill="#d9ed92"/><circle cx="38" cy="33" r="3.2" fill="#273526"/></g><text x="91" y="70" font-family="Arial,Helvetica,sans-serif" font-size="70" font-weight="600" letter-spacing="-4.5" fill="#273526">taster</text><circle cx="269" cy="63" r="5" fill="#7d8c58"/></g>
    <text x="1380" y="82" text-anchor="end" class="section-label">A FIELD GUIDE / ${escape(ROUTES[route].name.toUpperCase())}</text>
    <text x="60" y="202" fill="#273026" font-family="Italiana,Georgia,serif" font-size="70">One idea. Many ways in.</text>
    <text x="62" y="245" class="diagram-label diagram-muted" font-size="18">${escape(ROUTES[route].kicker)} ${escape(ROUTES[route].outcome)}</text>
    <g transform="translate(90 285) scale(1.05)">${renderGraph({route,selected:null,interactive:false})}</g>
    <path d="M60 1040H1380" stroke="#d6d8cc"/><text x="60" y="1065" class="diagram-label diagram-muted" font-size="12">Taster · Editable experiences for curious minds.</text>
    <text x="1380" y="1065" text-anchor="end" class="diagram-label diagram-muted" font-size="12">Solid: forward workflow · Dashed: revision</text>
  </svg>`;
}
