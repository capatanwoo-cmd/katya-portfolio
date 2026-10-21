/* Curved work collection: geometry follows each card's actual position. */
(()=>{
 'use strict';
 const stage=document.getElementById('curved-stage');
 if(!stage)return;
 const names=['Термометр-гигрометр','Аэрогриль','Набор бокалов','Новогодний подарок со сказками','Радиоуправляемый джип-амфибия: оранжевый','Радиоуправляемый джип-амфибия: чёрный','Новогодний подарок с Алисой','Комплект зарядки','Сухое молоко'];
 const cards=MAIN_CARDS.map((id,index)=>{
  const card=imageButton(id,names[index],MAIN_CARDS,index);card.classList.add('curved-card');card.querySelector('img').loading='eager';card.querySelector('img').draggable=false;stage.append(card);return card;
 });
 const pause=document.getElementById('curved-pause'),label=document.getElementById('curved-pause-label'),symbol=pause.querySelector('.pause-symbol');
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 let width=0,unit=1,pitch=216,offset=pitch*2,velocity=0,raf=0,lastTime=null,clock=null;
 let inView=false,userPaused=false,focused=false,gesture=null,suppressUntil=0;
 const wrap=(n,length)=>((n+length/2)%length+length)%length-length/2;
 function draw(){
  if(!width)return;
  const middle=width/2,radius=width*.49,total=cards.length*pitch,baseHeight=256*unit;
  cards.forEach((card,index)=>{
   const t=wrap(index*pitch-offset,total);
   const x=middle+t*(1+.083*(t/radius)**2);
   const distance=Math.min(1.4,Math.abs(x-middle)/radius);
   const w=(190+28*distance**2)*unit,left=x-w/2;
   const edgeHeight=edge=>baseHeight+80*unit*Math.min(1.4,Math.abs(edge-middle)/radius)**2.6;
   const hL=edgeHeight(left),hR=edgeHeight(left+w),h=Math.max(hL,hR),cy=stage.clientHeight/2-12*unit*distance**2;
   const yL=(h-hL)/2,yR=(h-hR)/2,ratio=hL/hR,g=ratio-1,b=yR*ratio-yL;
   card.style.width=`${w}px`;card.style.height=`${baseHeight}px`;
   // Project the complete image onto a quad; the four corners remain inside the card.
   card.style.transform=`translate3d(${left}px,${cy-h/2}px,0) matrix3d(${ratio},${b/w},0,${g/w},0,${hL/baseHeight},0,0,0,0,1,0,0,${yL},0,1)`;
   const visible=left+w>2&&left<width-2;card.tabIndex=visible?0:-1;card.setAttribute('aria-hidden',String(!visible));
  });
 }
 function blocked(){return !inView||document.hidden||preference.matches||userPaused||document.documentElement.dataset.motion==='off'||focused||!!gesture||!!document.querySelector('dialog[open]');}
 function tick(){
  raf=0;if(blocked()){stop();return;}
  const time=clock.currentTime??0,dt=lastTime===null?0:Math.min(.05,(time-lastTime)/1000);lastTime=time;
  offset=(offset+(50*unit+velocity)*dt)%(cards.length*pitch);velocity*=Math.exp(-3.2*dt);if(Math.abs(velocity)<1)velocity=0;
  draw();raf=requestAnimationFrame(tick);
 }
 function stop(){if(raf)cancelAnimationFrame(raf);raf=0;lastTime=null;clock?.pause();}
 function start(){
  if(blocked()){stop();return;}
  if(!clock)clock=stage.animate([{opacity:1},{opacity:1}],{duration:1e9,iterations:Infinity});
  clock.play();if(!raf){lastTime=null;raf=requestAnimationFrame(tick);}
 }
 function syncLabel(){
  if(preference.matches){label.textContent='Без анимации';symbol.textContent='↗';pause.removeAttribute('aria-pressed');pause.setAttribute('aria-label','Открыть все главные карточки без анимации');}
  else{label.textContent=userPaused?'Продолжить':'Остановить';symbol.textContent=userPaused?'▷':'Ⅱ';pause.removeAttribute('aria-label');pause.setAttribute('aria-pressed',String(userPaused));}
 }
 function resize(){const old=pitch;width=stage.clientWidth;unit=Math.min(1.2,.4+width/2400);pitch=216*unit;offset=offset/old*pitch;draw();}
 function step(direction){velocity=0;offset+=direction*pitch;draw();}
 document.getElementById('curved-prev').addEventListener('click',()=>step(-1));
 document.getElementById('curved-next').addEventListener('click',()=>step(1));
 pause.addEventListener('click',()=>{
  if(preference.matches){openGallery('Главные карточки товаров','Все 9 работ. Средний рост CTR главных карточек после обновления — 10%.',MAIN_CARDS);return;}
  userPaused=!userPaused;syncLabel();start();
 });
 document.getElementById('cards-all').addEventListener('click',()=>openGallery('Главные карточки товаров','Разные категории и визуальные задачи. Нажми на работу, чтобы рассмотреть её целиком.',MAIN_CARDS));
 stage.addEventListener('keydown',event=>{
  if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();step(event.key==='ArrowRight'?1:-1);}
  if(event.target===stage&&event.key===' '){event.preventDefault();if(!preference.matches){userPaused=!userPaused;syncLabel();start();}}
 });
 stage.addEventListener('focusin',event=>{focused=event.target.matches(':focus-visible');start();});
 stage.addEventListener('focusout',event=>{if(!stage.contains(event.relatedTarget)){focused=false;start();}});
 stage.addEventListener('pointerdown',event=>{
  if(!event.isPrimary||event.button!==0)return;
  gesture={id:event.pointerId,startX:event.clientX,startY:event.clientY,x:event.clientX,time:event.timeStamp,dragged:false};velocity=0;stop();
 });
 stage.addEventListener('pointermove',event=>{
  if(!gesture||gesture.id!==event.pointerId)return;
  const dx=event.clientX-gesture.startX,dy=event.clientY-gesture.startY;
  if(!gesture.dragged){
   if(Math.abs(dy)>10&&Math.abs(dy)>Math.abs(dx)){gesture=null;start();return;}
   if(Math.abs(dx)<6)return;
   gesture.dragged=true;stage.classList.add('dragging');stage.setPointerCapture(event.pointerId);
  }
  const delta=event.clientX-gesture.x,dt=Math.max(.008,(event.timeStamp-gesture.time)/1000);
  offset-=delta;velocity=velocity*.35-delta/dt*.65;gesture.x=event.clientX;gesture.time=event.timeStamp;draw();
 });
 function release(event){
  if(!gesture||gesture.id!==event.pointerId)return;
  const dragged=gesture.dragged;if(event.timeStamp-gesture.time>120)velocity=0;gesture=null;stage.classList.remove('dragging');
  if(dragged){suppressUntil=performance.now()+350;focused=false;stage.querySelector(':focus')?.blur();}
  if(stage.hasPointerCapture(event.pointerId))stage.releasePointerCapture(event.pointerId);
  if(event.type==='pointercancel'||userPaused||preference.matches)velocity=0;
  start();
 }
 stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);stage.addEventListener('lostpointercapture',release);
 window.addEventListener('pointerup',release);
 stage.addEventListener('click',event=>{if(performance.now()<suppressUntil){event.preventDefault();event.stopImmediatePropagation();}},true);
 document.addEventListener('visibilitychange',start);
 document.addEventListener('portfolio-motion',start);
 new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;start();},{threshold:0}).observe(stage);
 new ResizeObserver(resize).observe(stage);
 new MutationObserver(start).observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
 preference.addEventListener('change',()=>{velocity=0;syncLabel();draw();start();});
 resize();syncLabel();
 if(!preference.matches){
  document.querySelectorAll('.intro-role,.intro-lead,.intro-description,.intro-links,.intro-portrait').forEach((node,index)=>node.animate([{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}],{duration:650,delay:60*index,easing:'cubic-bezier(.22,.61,.36,1)',fill:'backwards'}));
 }
})();
