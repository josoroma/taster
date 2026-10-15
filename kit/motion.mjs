/** Time and assembly primitives. No renderer or DOM dependency. */
export const clamp01 = value => Math.max(0, Math.min(1, value));
export const mix = (a, b, t) => a + (b - a) * t;
export const smootherstep = t => { t=clamp01(t); return t*t*t*(t*(t*6-15)+10); };
export const damp = (current, target, rate, dt) => mix(current, target, 1-Math.exp(-Math.max(0,rate)*Math.max(0,dt)));

export function createTransport({ duration, time=0, rate=1, loop=false }={}) {
  if(!Number.isFinite(duration)||duration<=0)throw new RangeError('duration must be positive seconds');
  let cursor=Math.max(0,Math.min(duration,time)),speed=rate,running=false;
  if(!Number.isFinite(speed)||speed===0)throw new RangeError('rate must be finite and nonzero');
  const snapshot=()=>({time:cursor,progress:cursor/duration,duration,rate:speed,playing:running});
  const seek=value=>{if(!Number.isFinite(value))throw new TypeError('seek expects finite seconds');cursor=Math.max(0,Math.min(duration,value));return snapshot();};
  return {
    getState:snapshot,
    play(){ if((speed>0&&cursor===duration)||(speed<0&&cursor===0))cursor=speed>0?0:duration;running=true;return snapshot(); },
    pause(){running=false;return snapshot();},
    toggle(){return running?this.pause():this.play();},
    seek,
    step(seconds){running=false;return seek(cursor+seconds);},
    setRate(value){if(!Number.isFinite(value)||value===0)throw new RangeError('rate must be finite and nonzero');speed=value;return snapshot();},
    update(dt){
      if(!running||!Number.isFinite(dt)||dt<=0)return snapshot();
      const next=cursor+dt*speed;
      if(loop)cursor=((next%duration)+duration)%duration;
      else {cursor=Math.max(0,Math.min(duration,next));if(next>=duration||next<=0)running=false;}
      return snapshot();
    },
  };
}

/** Stage-local 0..1 progress; stage intervals are in seconds. */
export function segmentProgress(time, start, end, ease=smootherstep) {
  if(!(end>start))throw new RangeError('segment end must be after start');
  return ease(clamp01((time-start)/(end-start)));
}

const normalized=q=>{const n=Math.hypot(...q);if(n<1e-12)throw new RangeError('quaternion cannot be zero');return q.map(v=>v/n);};
export function slerp(a,b,t) {
  a=normalized(a);b=normalized(b);t=clamp01(t);
  let dot=a.reduce((sum,v,i)=>sum+v*b[i],0);
  if(dot<0){b=b.map(v=>-v);dot=-dot;}
  if(dot>.9995)return normalized(a.map((v,i)=>mix(v,b[i],t)));
  const theta=Math.acos(Math.min(1,dot)),s=Math.sin(theta);
  return a.map((v,i)=>(Math.sin((1-t)*theta)*v+Math.sin(t*theta)*b[i])/s);
}

/** Copy once at construction. Never capture again while the assembly is moving. */
export function capturePose(object) {
  return Object.freeze({
    position:Object.freeze(object.position.toArray()),
    quaternion:Object.freeze(object.quaternion.toArray()),
    scale:Object.freeze(object.scale.toArray()),
  });
}

/** Offsets are parent-local. rotation is an optional absolute destination quaternion. */
export function assemblyPose(rest,{translation=[0,0,0],rotation,scale=[1,1,1],delay=0,span=1}={},progress=0) {
  if(span<=0)throw new RangeError('assembly span must be positive');
  const t=smootherstep((clamp01(progress)-delay)/span);
  const quaternion=rest.quaternion||[0,0,0,1],baseScale=rest.scale||[1,1,1];
  return {
    position:rest.position.map((v,i)=>v+translation[i]*t),
    quaternion:rotation?slerp(quaternion,rotation,t):[...quaternion],
    scale:baseScale.map((v,i)=>v*mix(1,scale[i],t)),
  };
}

/** Apply absolute poses to Three.js-like objects, preserving exact assembled endpoints. */
export function applyAssembly(parts,progress) {
  for(const part of parts){
    const pose=assemblyPose(part.rest,part,progress);
    part.object.position.fromArray(pose.position);
    part.object.quaternion.fromArray(pose.quaternion);
    part.object.scale.fromArray(pose.scale);
  }
}
