import test from 'node:test';
import assert from 'node:assert/strict';
import { STAGES, EDGES, ROUTES, inspectStage, traceGraph, nextStage, layoutGraph } from '../examples/taster-diagram/src/model.mjs';
import { exportSVG } from '../examples/taster-diagram/src/diagram.mjs';

test('every explanation form uses the same complete authored workflow',()=>{
  const ids = new Set(STAGES.map(stage=>stage.id));
  assert.equal(ids.size,6);
  for (const route of Object.keys(ROUTES)) for (const stage of ids) {
    const details=inspectStage(route,stage);
    assert.ok(details.title && details.text && details.evidence.length);
  }
  for(const edge of EDGES) assert.ok(ids.has(edge.from) && ids.has(edge.to));
  assert.throws(()=>inspectStage('toString','prompt'),RangeError);
  assert.throws(()=>inspectStage('all','missing'),RangeError);
});

test('forward tracing cannot turn the revision cycle into a delivery dependency',()=>{
  assert.deepEqual(traceGraph('verify','forward'),{nodes:['verify','deliver'],edges:['verify-deliver']});
  assert.deepEqual(traceGraph('deliver','forward'),{nodes:['deliver'],edges:[]});
  const whole=traceGraph('prompt','forward');
  assert.equal(whole.nodes.length,6);
  assert.equal(whole.edges.length,5);
  assert.ok(!whole.edges.includes('verify-model'));
});

test('related tracing includes only incident edges, including explicit feedback',()=>{
  const related=traceGraph('model','related');
  assert.deepEqual(new Set(related.nodes),new Set(['model','prompt','representation','verify']));
  assert.deepEqual(new Set(related.edges),new Set(['prompt-model','model-representation','verify-model']));
  assert.ok(!related.nodes.includes('deliver'));
  assert.throws(()=>traceGraph('prompt','inferred'),RangeError);
});

test('keyboard stepping reaches both ends without wrapping the story',()=>{
  let stage='prompt';
  for(let count=0;count<20;count++)stage=nextStage(stage,1);
  assert.equal(stage,'deliver');
  for(let count=0;count<20;count++)stage=nextStage(stage,-1);
  assert.equal(stage,'prompt');
});

test('responsive layouts preserve graph identity and keep node bounds separate',()=>{
  for(const compact of [false,true]) {
    const layout=layoutGraph(compact);
    assert.deepEqual(layout.nodes.map(node=>node.id),STAGES.map(node=>node.id));
    assert.deepEqual(layout.edges.map(edge=>edge.id),EDGES.map(edge=>edge.id));
    for(const node of layout.nodes) {
      assert.ok(node.x>=0 && node.y>=0 && node.x+node.width<=layout.width && node.y+node.height<=layout.height);
      for(const other of layout.nodes)if(other.id!==node.id) assert.ok(node.x+node.width<=other.x || other.x+other.width<=node.x || node.y+node.height<=other.y || other.y+other.height<=node.y);
    }
  }
});

test('export is complete, accessible, and independent of interactive focus or zoom',()=>{
  const result=exportSVG('molecular',"@font-face{font-family:Test;src:url(data:font/ttf;base64,AAAA)}");
  assert.match(result,/role="img" aria-labelledby="taster-export-title taster-export-description"/);
  assert.match(result,/data:font\/ttf;base64,AAAA/);
  for(const stage of STAGES)assert.match(result,new RegExp(`data-stage="${stage.id}"`));
  for(const edge of EDGES)assert.match(result,new RegExp(`data-edge="${edge.id}"`));
  assert.doesNotMatch(result,/<g class="diagram-node (?:selected|dimmed)/);
  assert.doesNotMatch(result,/tabindex=|role="button"|aria-controls=|<script/);
  assert.throws(()=>exportSVG('toString'),RangeError);
});
