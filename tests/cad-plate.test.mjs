import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const cad=JSON.parse(readFileSync(new URL('../examples/workshop/assets/cad-plate/manifest.json',import.meta.url),'utf8'));
const p=cad.parameters;
const vertex=(stage,i)=>stage.positions.slice(i*3,i*3+3);
const close=(actual,expected,tolerance=1e-6)=>assert.ok(Math.abs(actual-expected)<=tolerance,`${actual} != ${expected}`);

test('CAD stage volumes agree with independent solid geometry calculations',()=>{
  const stock=p.length*p.width*p.thickness;
  const rounded=stock-(4-Math.PI)*p.cornerRadius**2*p.thickness;
  const drilled=rounded-4*Math.PI*p.holeRadius**2*p.thickness;
  const pocket=drilled-p.pocketLength*p.pocketWidth*p.pocketDepth;
  cad.stages.forEach((stage,i)=>close(stage.volume,[stock,rounded,drilled,pocket][i],1e-4));
});

test('preview meshes are closed, bounded, and agree with solid volume',()=>{
  for(const stage of cad.stages){
    const edges=new Map();let volume=0;
    const key=v=>v.map(n=>Math.round(n*1e6)).join(',');
    for(let i=0;i<stage.indices.length;i+=3){
      const [a,b,c]=stage.indices.slice(i,i+3).map(index=>vertex(stage,index));
      volume+=(a[0]*(b[1]*c[2]-b[2]*c[1])+a[1]*(b[2]*c[0]-b[0]*c[2])+a[2]*(b[0]*c[1]-b[1]*c[0]))/6;
      for(const v of [a,b,c])for(let axis=0;axis<3;axis++)assert.ok(Number.isFinite(v[axis])&&v[axis]>=stage.bounds.min[axis]-1e-5&&v[axis]<=stage.bounds.max[axis]+1e-5);
      for(const [u,v] of [[a,b],[b,c],[c,a]]){const k=[key(u),key(v)].sort().join('|');edges.set(k,(edges.get(k)||0)+1);}
    }
    for(const count of edges.values())assert.equal(count,2,`${stage.id} has a non-manifold mesh edge`);
    close(volume,stage.volume,stage.volume*.002);
  }
});

function verticalHits(stage,x,y){
  const heights=[];
  for(let i=0;i<stage.indices.length;i+=3){
    const [a,b,c]=stage.indices.slice(i,i+3).map(index=>vertex(stage,index));
    const d=(b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]);
    if(Math.abs(d)<1e-9)continue;
    const u=((b[1]-c[1])*(x-c[0])+(c[0]-b[0])*(y-c[1]))/d;
    const v=((c[1]-a[1])*(x-c[0])+(a[0]-c[0])*(y-c[1]))/d,w=1-u-v;
    if(Math.min(u,v,w)>=-1e-8)heights.push(u*a[2]+v*b[2]+w*c[2]);
  }
  return [...new Set(heights.map(z=>Math.round(z*1e6)/1e6))].sort((a,b)=>a-b);
}

test('display geometry contains four through holes and a pocket with its floor intact',()=>{
  const final=cad.stages.at(-1);
  for(const x of [-p.holePitchX/2,p.holePitchX/2])for(const y of [-p.holePitchY/2,p.holePitchY/2])assert.deepEqual(verticalHits(final,x,y),[]);
  assert.deepEqual(verticalHits(final,0,0),[-p.thickness/2,p.thickness/2-p.pocketDepth]);
  assert.deepEqual(verticalHits(final,p.pocketLength/2+3,0),[-p.thickness/2,p.thickness/2]);
  assert.deepEqual(verticalHits(cad.stages[0],p.holePitchX/2,p.holePitchY/2),[-p.thickness/2,p.thickness/2]);
});

test('drawing curves lie on the part bounds and retain the physical hole radius',()=>{
  const final=cad.stages.at(-1);
  for(const edge of final.edges){
    assert.ok(edge.length>=6&&edge.length%3===0);
    for(let i=0;i<edge.length;i++)assert.ok(Number.isFinite(edge[i])&&edge[i]>=final.bounds.min[i%3]-1e-5&&edge[i]<=final.bounds.max[i%3]+1e-5);
  }
  // Each through hole contributes a circular edge on each stock face.
  for(const x of [-p.holePitchX/2,p.holePitchX/2])for(const y of [-p.holePitchY/2,p.holePitchY/2]){
    const rings=final.edges.filter(edge=>edge.length>6&&edge.every((_,i)=>i%3!==0||Math.abs(Math.hypot(edge[i]-x,edge[i+1]-y)-p.holeRadius)<1e-6));
    assert.equal(rings.length,2);
  }
});
