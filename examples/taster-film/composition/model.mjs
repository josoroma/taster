// A finite film clock. All authored motion is a pure function of absolute time.
export const FILM = Object.freeze({ width:1280, height:720, fps:30, duration:28, frames:840 });
export const CHAPTERS = Object.freeze([
  Object.freeze({ start:0, end:6, title:'Begin with an idea', caption:'Turn an idea into an experience someone can explore, understand, and play.' }),
  Object.freeze({ start:6, end:13, title:'Give it a model', caption:'Change a variable. Inspect the mechanism. See why the result changes.' }),
  Object.freeze({ start:13, end:21, title:'Choose the right form', caption:'Explore molecular structures, trace a system, or tell the story in motion.' }),
  Object.freeze({ start:21, end:28, title:'Keep the source', caption:'Get a working experience, readable explanations, and editable source.' }),
]);
export function clamp(value,min=0,max=1){return Math.max(min,Math.min(max,value));}
export function ease(value){const t=clamp(value);return t*t*(3-2*t);}
export function timeAtFrame(frame){return clamp(Math.round(Number.isFinite(frame)?frame:0),0,FILM.frames-1)/FILM.fps;}
export function frameAtTime(time){return Math.min(FILM.frames-1,Math.floor(clamp(Number.isFinite(time)?time:0,0,FILM.duration)*FILM.fps+1e-7));}
export function filmState(time){
  const t=clamp(Number.isFinite(time)?time:0,0,FILM.duration);
  const chapterIndex=CHAPTERS.findIndex((chapter,index)=>t<chapter.end||index===CHAPTERS.length-1);
  const chapter=CHAPTERS[chapterIndex];
  return {
    time:t,frame:frameAtTime(t),chapterIndex,chapter,progress:t/FILM.duration,
    local:t-chapter.start,
    scenes:CHAPTERS.map((scene,index)=>({
      local:clamp(t-scene.start,0,scene.end-scene.start),
      alpha: index===chapterIndex?1:0,
      enter:ease((t-scene.start)/0.85),
    })),
  };
}
// Stylized topology, explicitly not a chemical structure or physical simulation.
export function helixPoints(time,count=19){
  return Array.from({length:count},(_,index)=>{
    const angle=index*0.48+time*0.65;
    return {x:Math.cos(angle)*59,y:(index-(count-1)/2)*12,z:Math.sin(angle),index};
  });
}
export function packetPoint(time){
  const p=((time%3)+3)%3/3;
  const route=[[51,136],[116,136],[116,81],[229,81],[229,136],[299,136]];
  const lengths=route.slice(1).map((point,index)=>Math.hypot(point[0]-route[index][0],point[1]-route[index][1]));
  let remaining=p*lengths.reduce((sum,length)=>sum+length,0);
  for(let index=0;index<lengths.length;index++){
    if(remaining<=lengths[index]){
      const fraction=remaining/lengths[index];
      return {x:route[index][0]+(route[index+1][0]-route[index][0])*fraction,y:route[index][1]+(route[index+1][1]-route[index][1])*fraction,progress:p};
    }
    remaining-=lengths[index];
  }
  return {x:299,y:136,progress:p};
}
