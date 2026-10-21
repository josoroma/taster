import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULTS, TAU, solveCrank, advanceAngle, revealOffset } from '../examples/machine-lab/src/model.mjs';

const close=(actual,expected,tolerance=1e-10)=>assert.ok(Math.abs(actual-expected)<tolerance,`${actual} ≠ ${expected}`);

test('dead centres give zero velocity and a stroke twice the crank radius',()=>{
  const outer=solveCrank({angle:0}),inner=solveCrank({angle:Math.PI});
  close(outer.travel,0);close(inner.travel,2*DEFAULTS.radius);
  close(outer.velocity,0);close(inner.velocity,0);close(outer.x-inner.x,outer.stroke);
});

test('closed loop keeps both link lengths at every angle, including short valid rods',()=>{
  for(const rodLength of [.041,.14,.4])for(let i=0;i<1440;i++){
    const s=solveCrank({angle:i/1440*TAU,rodLength});
    close(Math.hypot(s.pinX,s.pinY),s.radius);
    close(Math.hypot(s.x-s.pinX,s.pinY),s.rodLength);
    assert.ok(s.travel>=-1e-12&&s.travel<=s.stroke+1e-12);
    assert.ok(Number.isFinite(s.velocity));
  }
});

test('analytic velocity equals a central time derivative of displacement',()=>{
  const h=1e-6;
  for(const rpm of [-60,0,24,60])for(const angle of [.12,1.3,2.6,3.8,5.7]){
    const s=solveCrank({angle,rpm});
    const before=solveCrank({angle:angle-s.omega*h,rpm});
    const after=solveCrank({angle:angle+s.omega*h,rpm});
    close(s.travelVelocity,(after.travel-before.travel)/(2*h),1e-8);
    close(s.velocity,-s.travelVelocity);
  }
});

test('one revolution is periodic and time stepping composes independently of frame rate',()=>{
  const first=solveCrank({angle:.61}),next=solveCrank({angle:.61+TAU});
  close(first.x,next.x);close(first.velocity,next.velocity);
  let a=.61;for(let i=0;i<120;i++)a=advanceAngle(a,24,1/60);
  close(a,advanceAngle(.61,24,2));
  close(advanceAngle(.61,0,100),.61);close(advanceAngle(.61,24,2.5),.61);
  close(advanceAngle(advanceAngle(.61,24,.5),-24,.5),.61);
});

test('invalid dimensions and non-finite inputs fail before producing misleading geometry',()=>{
  for(const radius of [0,-.04,NaN,Infinity])assert.throws(()=>solveCrank({radius}));
  for(const rodLength of [.04,.02,NaN])assert.throws(()=>solveCrank({rodLength}));
  assert.throws(()=>solveCrank({angle:NaN}));assert.throws(()=>solveCrank({rpm:Infinity}));
  assert.throws(()=>advanceAngle(0,24,-1));assert.throws(()=>advanceAngle(NaN,24,1));
});

test('guard reveal is absolute, bounded, reversible and does not change kinematics',()=>{
  const before=solveCrank();
  for(let i=0;i<100;i++){close(revealOffset(1),.075);close(revealOffset(.5),.0375);close(revealOffset(0),0);}
  close(revealOffset(-1),0);close(revealOffset(2),.075);assert.throws(()=>revealOffset(NaN));
  assert.deepEqual(solveCrank(),before);
});
