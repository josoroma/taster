import { attentionWeights, smooth, clamp } from './model.mjs';
const C={paper:'#f6f3ec',ink:'#1a2228',blue:'#294ac3',light:'#a6b8e8',pale:'#e3e7ef',red:'#c7432c',peach:'#e6a08d',muted:'#81877d',line:'#cdd0c5'};
const TAU=Math.PI*2;
const lerp=(a,b,t)=>a+(b-a)*t;
export function createFilmScene(canvas){
 const ctx=canvas.getContext('2d'); if(!ctx)throw new Error('A Canvas 2D context is required for this film.');
 let width=0,height=0,ratio=1; let last;
 function resize(){const r=canvas.getBoundingClientRect();width=r.width;height=r.height;ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);if(last)render(last);}
 function path(points,color=C.ink,lw=1,fill){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));if(fill){ctx.closePath();ctx.fillStyle=fill;ctx.fill();}if(color){ctx.strokeStyle=color;ctx.lineWidth=lw;ctx.stroke();}}
 function line(x,y,x2,y2,color=C.line,lw=1,dash=[]){ctx.setLineDash(dash);path([[x,y],[x2,y2]],color,lw);ctx.setLineDash([]);}
 function circle(x,y,r,fill=C.blue,stroke=null,lw=1){ctx.beginPath();ctx.arc(x,y,r,0,TAU);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.lineWidth=lw;ctx.strokeStyle=stroke;ctx.stroke()}}
 function text(s,x,y,size=16,color=C.ink,align='left',weight=400){ctx.fillStyle=color;ctx.textAlign=align;ctx.font=`${weight} ${size}px DM, sans-serif`;ctx.fillText(s,x,y)}
 function mono(s,x,y,size=12,color=C.muted,align='left'){ctx.fillStyle=color;ctx.textAlign=align;ctx.font=`${size}px ui-monospace, monospace`;ctx.fillText(s,x,y)}
 function curve(x1,y1,x2,y2,color=C.blue,lw=1,progress=1){ctx.beginPath();ctx.moveTo(x1,y1);const dx=(x2-x1)*.48;ctx.bezierCurveTo(x1+dx,y1,x2-dx,y2,x2,y2);ctx.strokeStyle=color;ctx.lineWidth=lw;ctx.stroke();if(progress>=0){const t=progress%1;const u=1-t;circle(u*u*u*x1+3*u*u*t*(x1+dx)+3*u*t*t*(x2-dx)+t*t*t*x2,u*u*u*y1+3*u*u*t*y1+3*u*t*t*y2+t*t*t*y2,4,color)}}
 function roundRect(x,y,w,h,r,fill,stroke=null,lw=1){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke()}}
 function arrow(x,y,x2,y2,color=C.red){line(x,y,x2,y2,color,1.5);const a=Math.atan2(y2-y,x2-x);path([[x2-9*Math.cos(a-.4),y2-9*Math.sin(a-.4)],[x2,y2],[x2-9*Math.cos(a+.4),y2-9*Math.sin(a+.4)]],color,1.5)}
 function iso(x,y,z){return[410+(x-y)*.88,365+(x+y)*.4-z]}
 function slab(x,y,z,w,d,h,fill=C.blue,light=C.light){const a=iso(x,y,z+h),b=iso(x+w,y,z+h),c=iso(x+w,y+d,z+h),e=iso(x,y+d,z+h);const al=iso(x,y,z),bl=iso(x+w,y,z),cl=iso(x+w,y+d,z),el=iso(x,y+d,z);path([e,c,cl,el],C.paper,.8,fill);path([b,c,cl,bl],C.paper,.8,C.ink);path([a,b,c,e],C.paper,1,light);return[a,b,c,e]}
 function label(s,x,y,color=C.muted){mono(s,x,y,13,color)}
 function register(s){mono(s,54,54,12);line(54,70,742,70,C.line,.8);[[54,90],[742,90],[54,585],[742,585]].forEach(([x,y])=>{line(x-5,y,x+5,y,C.line);line(x,y-5,x,y+5,C.line)})}
 function attention(s){register('01 / RELATIONSHIPS AS WEIGHTS');const reveal=smooth(s.local/3);const focus=Math.floor(s.local*.55)%8;
  for(let j=0;j<8;j++)for(let i=0;i<8;i++){const weight=attentionWeights(j)[i];const accent=j===focus;const z=12+weight*180*reveal;slab((i-4)*41,(j-4)*41,0,35,35,z,accent?C.red:C.blue,accent?'#d97661':`rgb(${Math.round(157-weight*100)},${Math.round(179-weight*100)},${Math.round(220-weight*40)})`)}
  for(let j=0;j<8;j++){const p=iso(-205,(j-4)*41,0);mono(`t${j+1}`,p[0]-8,p[1]+5,14,j===focus?C.red:C.muted,'right')}
  const a=iso(-170,-170,0),b=iso(170,-170,0);line(a[0],a[1]-160,b[0],b[1]-160,C.blue,.7);for(let i=0;i<8;i++){const p=iso((i-4)*41,-164,15);line(p[0],p[1]-145,p[0],p[1]-25,C.blue,.6);circle(p[0],p[1]-145,3,C.blue)}
  label('QUERY',114,488);label('KEY',593,480);mono('softmax(QKᵀ / √d) V',400,555,22,C.ink,'center');text('Each token draws on context.',400,592,16,C.muted,'center');
 }
 function transfer(s){register('02 / REPRESENTATIONS THAT TRANSFER');const open=smooth(s.local/5);const outputs=[['ANSWER',622,205],['CLASSIFY',668,337],['COMPARE',610,490]];
  for(let j=5;j>=0;j--){const z=j*(18+open*12);slab(-110,-100,z,210,210,13,j%2?C.blue:C.ink,j%2?'#b5c5e9':'#dadeda');for(let k=0;k<5;k++){const a=iso(-90+k*38,-80,z+14),b=iso(-90+k*38,87,z+14);line(...a,...b,j%2?'#7794cb':'#b2b9b3',.8)}}
  outputs.forEach(([word,x,y],i)=>{const a=iso(95,-50+i*65,80);curve(...a,x-50,y,C.red,1.3,(s.local*.2+i*.3)%1);roundRect(x-51,y-29,112,58,3,C.paper,C.red);text(word,x+5,y+6,15,C.red,'center',700)});
  for(let i=0;i<4;i++){const x=105+(i%2)*45,y=225+Math.floor(i/2)*65;roundRect(x,y,30,42,1,C.paper,C.line);for(let j=0;j<4;j++)line(x+5,y+10+j*6,x+24,y+10+j*6,C.muted,.7);curve(x+32,y+21,243,353,C.blue,.7,-1)}
  mono('UNLABELED TEXT',84,420,12);mono('PRE-TRAIN',400,550,18,C.ink,'center');text('Shared representations → task adaptation',400,585,16,C.muted,'center');
 }
 function scale(s){register('03 / LEARNING FROM THE CONTEXT');const lift=smooth(s.local/4);
  for(let i=6;i>=0;i--){const z=i*25*lift;const h=120+i*3;slab(-h,-h,z,h*2,h*2,8,i%2?C.blue:C.ink,i%2?'#c8d3ed':'#e1e4de');for(let j=0;j<6;j++)for(let k=0;k<6;k++){const p=iso(-h+24+j*(h*2-40)/6,-h+24+k*(h*2-40)/6,z+10);circle(...p,1.8,(j+k+i)%4===0?C.red:'#6e82a4')}}
  const entries=[['sea → mar',155],['sun → sol',200],['moon → ?',245]];entries.forEach(([word,y],i)=>{roundRect(60,y,150,32,2,C.paper,i===2?C.red:C.line);text(word,73,y+21,15,i===2?C.red:C.ink);curve(210,y+16,310,330,C.blue,.7,(s.local*.2+i*.1)%1)});
  mono('PROMPT',62,132,12);const p=iso(150,0,65);curve(...p,665,385,C.red,1.5,s.local*.2);roundRect(608,386,120,47,2,C.red);text('luna',668,416,24,C.paper,'center',500);mono('175B',400,547,37,C.ink,'center');text('parameters · GPT-3',400,582,16,C.muted,'center');
 }
 function feedback(s){register('04 / A TRAINING SIGNAL FROM PEOPLE');const p=smooth((s.local-1)/5);const cards=[{label:'A',lines:[130,95,140],y:180,target:310},{label:'B',lines:[150,125,95],y:310,target:180},{label:'C',lines:[70,105,60],y:440,target:440}];
  cards.forEach((c,i)=>{const y=lerp(c.y,c.target,p);const picked=i===1;roundRect(205,y-48,370,99,4,picked?'#e6eaf4':C.paper,picked?C.blue:C.line,picked?2:1);circle(237,y,17,picked?C.blue:C.ink);text(c.label,237,y+5,15,C.paper,'center',700);c.lines.forEach((w,j)=>line(273,y-19+j*18,273+w,y-19+j*18,picked?'#8094cd':'#b7bcb2',5));if(picked&&p>.5){circle(551,y-48,17,C.red);text('1',551,y-43,15,C.paper,'center',700)}});
  text('COMPARE',98,309,12,C.muted,'center');arrow(131,320,184,320,C.red);const ys=[180,310,440];ys.forEach((y,i)=>{line(592,y,635,y,C.muted);mono(String(i+1).padStart(2,'0'),653,y+6,18,i===0?C.red:C.muted)});mono('DEMONSTRATE → RANK → TRAIN',400,560,17,C.ink,'center');text('Feedback changes the objective.',400,595,16,C.muted,'center');
 }
 function multimodal(s){register('05 / DIFFERENT INPUTS. SHARED CONTEXT.');const t=s.local;const r=smooth(t/4);
  roundRect(60,180,180,145,3,C.paper,C.blue,1.5);circle(196,216,15,C.red);path([[73,308],[128,230],[162,281],[190,251],[227,308]],null,1,'#b0bfdf');text('IMAGE',150,356,13,C.blue,'center',700);
  roundRect(73,403,155,71,3,C.paper,C.red,1.5);text('What is here?',150,445,17,C.ink,'center');text('TEXT',150,505,13,C.red,'center',700);
  curve(240,250,365,325,C.blue,2,(t*.2)%1);curve(230,440,365,350,C.red,2,(t*.2+.5)%1);
  ctx.save();ctx.translate(434,337);ctx.rotate(-.15+r*.35);for(let i=0;i<6;i++){ctx.rotate(Math.PI/6);roundRect(-74,-74,148,148,8,null,i%2?C.blue:'#b5c1d5',1.5)}circle(0,0,31,C.blue);text('+',0,9,31,C.paper,'center');ctx.restore();
  curve(510,338,605,338,C.ink,1.4,t*.17);roundRect(606,276,135,125,4,C.ink);for(let i=0;i<4;i++){const len=[83,69,90,48][i];line(624,301+i*23,624+len*smooth((t-i*.8)/1.8),301+i*23,i===3?C.peach:'#c2c9c3',4)}
  mono('TEXT OUTPUT',675,433,12,C.muted,'center');text('Images and language, in one interaction.',400,585,16,C.muted,'center');
 }
 function systems(s){register('06 / MORE THAN A SINGLE RESPONSE');const boxes=[{x:400,y:170,label:'PLAN',symbol:'01'},{x:610,y:335,label:'ACT',symbol:'02'},{x:400,y:500,label:'OBSERVE',symbol:'03'},{x:190,y:335,label:'CHECK',symbol:'04'}];
  ctx.save();ctx.setLineDash([4,5]);ctx.beginPath();ctx.ellipse(400,335,210,165,0,0,TAU);ctx.strokeStyle=C.line;ctx.lineWidth=1.5;ctx.stroke();ctx.restore();
  boxes.forEach((b,i)=>{const n=boxes[(i+1)%4];curve(b.x,b.y,n.x,n.y,i%2?C.blue:C.red,1.2,(s.local*.23+i*.25)%1)});
  const active=Math.floor(s.local*.55)%4;boxes.forEach((b,i)=>{const selected=i===active;roundRect(b.x-62,b.y-38,124,76,4,selected?C.blue:C.paper,selected?C.blue:C.line,1.5);mono(b.symbol,b.x,b.y-5,12,selected?'#b5c3ef':C.red,'center');text(b.label,b.x,b.y+18,15,selected?C.paper:C.ink,'center',700)});
  circle(400,335,48,null,C.blue,1.3);for(let i=0;i<8;i++){const a=i*TAU/8+s.local*.1;line(400+Math.cos(a)*20,335+Math.sin(a)*20,400+Math.cos(a)*40,335+Math.sin(a)*40,C.blue,.8)}circle(400,335,10,C.red);
  mono('ITERATION',400,409,12,C.muted,'center');text('More computation ≠ automatic correctness.',400,592,16,C.muted,'center');
 }
 function frontier(s){register('07 / THE FRONTIER IS A QUESTION');const open=smooth(s.local/6);const origin=[180,498];arrow(...origin,692,498,C.muted);arrow(...origin,180,142,C.muted);mono('BREADTH OF CAPABILITY',435,550,14,C.muted,'center');ctx.save();ctx.translate(118,320);ctx.rotate(-Math.PI/2);mono('DEPTH OF PERFORMANCE',0,0,14,C.muted,'center');ctx.restore();
  for(let y=0;y<4;y++)for(let x=0;x<5;x++){const px=219+x*86,py=190+y*79;ctx.globalAlpha=.3;roundRect(px,py,71,64,2,null,C.line);ctx.globalAlpha=1;}
  const x=220+open*155,y=435-open*120;for(let i=0;i<6;i++){const sx=x+(i%3)*45,sy=y+Math.floor(i/3)*39;roundRect(sx,sy,33,27,2,i%2?C.blue:'#829bd1');}
  ctx.save();ctx.setLineDash([6,6]);roundRect(486,180,142,145,2,null,C.red,1.5);ctx.restore();text('?',557,272,86,C.red,'center',400);mono('AGI',557,356,16,C.red,'center');
  const gapStart=[x+135,y+35];arrow(...gapStart,475,283,C.red);text('What would count as evidence?',400,597,17,C.ink,'center');
 }
 const drawers=[attention,transfer,scale,feedback,multimodal,systems,frontier];
 function render(sample){last=sample;if(!width||!height)return;ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);const scale=Math.min(width/800,height/655);ctx.translate((width-800*scale)/2,(height-655*scale)/2);ctx.scale(scale,scale);ctx.globalAlpha=1;drawers[sample.index](sample);ctx.setTransform(ratio,0,0,ratio,0,0);}
 const observer=new ResizeObserver(resize);observer.observe(canvas);resize();return {render,resize,dispose(){observer.disconnect()},stats(){return{width,height,pixelRatio:ratio,renderer:'Canvas 2D',chapter:last?.index}}};
}
