import { FILM, filmState, helixPoints, packetPoint, ease, clamp } from './model.mjs';

const ink='#273026',accent='#d9ed92',paper='#f3f2eb',muted='#697064';
const el=id=>document.getElementById(id);
const f=value=>Number(value.toFixed(3));
const circle=(x,y,r,fill,stroke='none',extra='')=>`<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${fill}" stroke="${stroke}" ${extra}/>`;
const line=(x1,y1,x2,y2,stroke,width=1,extra='')=>`<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${stroke}" stroke-width="${width}" ${extra}/>`;
const text=(x,y,content,size=12,fill=muted,extra='')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" ${extra}>${content}</text>`;
const mark=(x,y,scale,fill=ink)=>`<g transform="translate(${f(x)} ${f(y)}) scale(${f(scale)})"><path d="M0 -74 18 -18 74 0 18 18 0 74 -18 18 -74 0 -18 -18Z" fill="${fill}"/><path d="M0 -25 25 0 0 25 -25 0Z" fill="${fill===ink?accent:ink}"/>${circle(0,0,6,fill)}</g>`;
const rect=(x,y,w,h,fill,stroke='none',radius=5,extra='')=>`<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${radius}" fill="${fill}" stroke="${stroke}" ${extra}/>`;

function idea(t){
  const orbit=Array.from({length:3},(_,i)=>`<ellipse cx="300" cy="230" rx="${143+i*27}" ry="${143+i*27}" fill="none" stroke="#c8cebc" stroke-width="${i===1?1.5:1}"/>`).join('');
  const nodes=Array.from({length:8},(_,i)=>{
    const a=i*Math.PI/4+t*.085;
    const x=300+Math.cos(a)*170,y=230+Math.sin(a)*170;
    return line(300,230,x,y,'#bfc8ae')+circle(x,y,i%2?7:11,i%3===0?ink:paper,'#82916d');
  }).join('');
  el('idea-orbit').innerHTML=orbit+nodes+text(310,442,'IDEA → MODEL → EXPERIENCE',11,muted,'text-anchor="middle" letter-spacing="2"');
  el('idea-mark').innerHTML=`<g transform="rotate(${f(8*Math.sin(t*.3))} 300 230)">${circle(300,230,102,accent)}${mark(300,230,1.02+ease(t/2)*.12)}</g>`;
}
function model(t){
  const explosion=ease((t-.8)/2.5)*(1-ease((t-5)/1.8));
  el('model-grid').innerHTML=Array.from({length:8},(_,i)=>line(60+i*58,382,250+i*36,86,'#344130')).join('')+Array.from({length:7},(_,i)=>line(60,110+i*45,530,110+i*45,'#344130')).join('');
  const diamond=(y,w,h,fill,stroke)=>`<path d="M300 ${f(y-h)} ${f(300+w)} ${f(y)} 300 ${f(y+h)} ${f(300-w)} ${f(y)}Z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`;
  let out='';
  [2,1,0].forEach(i=>{
    const y=265+i*29-(2-i)*explosion*62;
    out+=diamond(y+12,150,62,'#202a20','#536048');
    out+=diamond(y,150,62,i===1?'#d9ed92':'#31402c',i===1?'#e8f5c2':'#71815e');
    if(i===1){out+=`<g transform="translate(300 ${f(y)}) scale(1 .43) rotate(${f(t*23)})"><circle r="63" fill="none" stroke="${ink}" stroke-width="4"/>${line(-80,0,80,0,ink,4)}${line(0,-80,0,80,ink,4)}${circle(0,0,17,ink)}</g>`;}
    else out+=diamond(y,105,41,'none','#7b8e67');
  });
  el('model-layers').innerHTML=out;
  const guideY=265-explosion*62;
  el('model-inspect').innerHTML=line(332,guideY-16,470,guideY-78,accent,1.5)+circle(332,guideY-16,4,accent)+text(470,guideY-89,'INSPECT THE PART',10,accent,'text-anchor="end" letter-spacing="1.8"')+rect(102,411,382,4,'#46513e')+rect(102,411,382*explosion,4,accent)+circle(102+382*explosion,413,7,accent)+text(102,441,'ASSEMBLED',9,'#bcc6b2','letter-spacing="1.5"')+text(484,441,'EXPLODED',9,'#bcc6b2','text-anchor="end" letter-spacing="1.5"');
}
function forms(t){
  const pts=helixPoints(t);let molecule='';
  pts.forEach((p,i)=>{
    const x=175+p.x,y=134+p.y,x2=175-p.x;
    if(i%2===0)molecule+=line(x,y,x2,y,'#a7b68f',2);
    if(i>0){const prev=pts[i-1];molecule+=line(175+prev.x,134+prev.y,x,y,ink,3)+line(175-prev.x,134+prev.y,x2,y,'#809258',3);}
  });
  [...pts].sort((a,b)=>a.z-b.z).forEach(p=>{molecule+=circle(175+p.x,134+p.y,5+p.z*1.5,ink)+circle(175-p.x,134+p.y,5-p.z*1.5,'#96aa6a');});
  el('molecule-art').innerHTML=molecule+text(329,249,'ILLUSTRATIVE',8,'#545e4e','text-anchor="end" letter-spacing="1.4"');
  const packet=packetPoint(t);
  el('diagram-art').innerHTML=`<path d="M51 136H116V81H229V136H299M116 136V193H229V136" fill="none" stroke="#8d9d77" stroke-width="2"/>`+rect(26,113,50,46,ink)+rect(121,58,108,46,paper,'#879672')+rect(121,170,108,46,accent,'#879672')+rect(274,113,50,46,ink)+text(175,87,'MODEL',11,ink,'text-anchor="middle" letter-spacing="1"')+text(175,198,'EVIDENCE',11,ink,'text-anchor="middle" letter-spacing="1"')+circle(51,136,5,accent)+circle(299,136,5,accent)+circle(packet.x,packet.y,7,ink)+text(175,249,'TRACE THE RELATIONSHIP',8,'#545e4e','text-anchor="middle" letter-spacing="1.4"');
  const head=46+(t%5)/5*260;
  el('video-art').innerHTML=rect(42,51,266,131,'#33422c','#637251')+mark(175,113,.63,accent)+rect(42,202,266,21,'#46533c')+rect(42,232,266,8,'#394831')+[0,1,2,3,4].map(i=>line(42+i*66.5,202,42+i*66.5,223,'#1b231d',3)).join('')+line(head,191,head,246,accent,2)+circle(head,191,4,accent)+text(59,168,'FRAME / '+String(Math.floor(t*30)).padStart(3,'0'),8,'#d9ed92','letter-spacing="1.2"');
}
function source(t){
  let source=rect(80,62,414,326,'#253022','#536247',8)+line(80,104,494,104,'#536247');
  source+=circle(104,83,4,accent)+circle(120,83,4,'#697b56')+circle(136,83,4,'#697b56')+text(470,87,'YOUR IDEA / YOUR SOURCE',9,'#bdc9ae','text-anchor="end" letter-spacing="1"');
  const code=[['const experience = {',paper],['  question: "What if?",','#d9ed92'],['  model: inspectable,','#c8d0c0'],['  time: reversible,','#c8d0c0'],['  source: yours','#d9ed92'],['};',paper]];
  code.forEach(([s,color],i)=>{const opacity=ease((t-.3-i*.15)/.5);source+=`<g opacity="${f(opacity)}">${text(105,147+i*29,String(i+1).padStart(2,'0'),10,'#92a282')}${text(137,147+i*29,s,16,color)}</g>`;});
  source+=line(104,337,470,337,'#536247')+circle(110,362,4,accent)+text(126,366,'READY TO EXPLORE',10,accent,'letter-spacing="1.5"')+text(469,366,'↗',23,accent,'text-anchor="end"');
  el('source-lines').innerHTML=source;
  el('source-mark').innerHTML=`<g transform="translate(0 ${f(6*Math.sin(t*.8))})">${circle(465,386,61,accent)}${mark(465,386,.56)}</g>`;
}

const chapters=['idea','model','forms','source'];
export function renderAt(time){
  const state=filmState(time);
  state.scenes.forEach((scene,index)=>{
    const root=el(chapters[index]);root.style.opacity=scene.alpha;
    const title=root.querySelector('.words,.forms-title');
    title.style.transform=`translateY(${f((1-scene.enter)*28)}px)`;
    title.style.opacity=.45+.55*scene.enter;
  });
  idea(state.scenes[0].local);model(state.scenes[1].local);forms(state.scenes[2].local);source(state.scenes[3].local);
  document.querySelectorAll('.form-card').forEach((card,index)=>{
    const enter=ease((state.scenes[2].local-index*.18)/.7);
    card.style.transform=`translateY(${f(24*(1-enter))}px)`;card.style.opacity=enter;
  });
  el('film-progress').style.transform=`scaleX(${state.progress})`;
  document.documentElement.dataset.frame=state.frame;
  return state;
}
// HyperFrames' adapter seek event is the only render clock. No timers, network,
// accumulated deltas, user-input state, or random values affect encoded frames.
window.addEventListener('hf-seek',event=>renderAt(event.detail.time));
window.tasterFilm={renderAt,FILM};
renderAt(0);
window.tasterFilm.ready=Promise.all([document.fonts.ready,...Array.from(document.images,image=>image.decode())]).then(()=>renderAt(0));
