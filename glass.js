/* Pointer edge reflections; manual galleries retain their deliberate reading order. */
(()=>{'use strict';
 const off=()=>matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.dataset.motion==='off';
 document.querySelectorAll('.tools span,.intro-tools span,.statera-stage,.geo-stat').forEach(el=>el.classList.add('liquid-glass'));
 let previous=null;
 const reset=el=>{if(!el)return;el.style.setProperty('--edge-glow','0');el.style.setProperty('--tilt-x','0deg');el.style.setProperty('--tilt-y','0deg');};
 document.addEventListener('pointermove',e=>{const el=e.target.closest('.liquid-glass');if(previous!==el)reset(previous);previous=el;if(!el||e.pointerType==='touch'||off())return;const r=el.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;el.style.setProperty('--glass-x',`${x}px`);el.style.setProperty('--glass-y',`${y}px`);el.style.setProperty('--edge-glow',String(Math.max(0,1-Math.min(x,y,r.width-x,r.height-y)/85)));if(el.hasAttribute('data-tilt')&&!el.closest('.dragging')){el.style.setProperty('--tilt-x',`${(0.5-y/r.height)*5}deg`);el.style.setProperty('--tilt-y',`${(x/r.width-.5)*5}deg`);}});
 document.addEventListener('pointerout',e=>{if(!e.relatedTarget){reset(previous);previous=null;}});
 document.addEventListener('portfolio-motion',()=>{reset(previous);});
 document.querySelectorAll('.drag-rail').forEach(rail=>{
  let start=null,dragging=false,suppressUntil=0,frame=0,velocity=0,last=0,lastTime=0;
  const controls=[...document.querySelectorAll('[data-scroll]')].filter(b=>b.dataset.scroll===rail.id);
  const sync=()=>controls.forEach(b=>b.disabled=Number(b.dataset.direction)<0?rail.scrollLeft<2:rail.scrollLeft>=rail.scrollWidth-rail.clientWidth-2);
  const stop=()=>{cancelAnimationFrame(frame);velocity=0;rail.classList.remove('dragging');};
  rail.addEventListener('pointerdown',e=>{if(e.button!==0||e.pointerType==='touch')return;stop();start={x:e.clientX,y:e.clientY,id:e.pointerId};last=e.clientX;lastTime=performance.now();dragging=false;});
  rail.addEventListener('pointermove',e=>{if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;if(!dragging){if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>8){start=null;return;}if(Math.abs(dx)<7)return;dragging=true;rail.classList.add('dragging');rail.setPointerCapture(start.id);}e.preventDefault();const now=performance.now(),delta=e.clientX-last;rail.scrollLeft-=delta;velocity=-delta/Math.max(1,now-lastTime)*1000;last=e.clientX;lastTime=now;});
  const release=()=>{if(!start)return;start=null;if(!dragging)return;dragging=false;suppressUntil=performance.now()+350;if(off()||performance.now()-lastTime>100){stop();return;}let previousTime=performance.now();const glide=time=>{const dt=Math.min(.035,(time-previousTime)/1000);previousTime=time;const before=rail.scrollLeft;rail.scrollLeft+=velocity*dt;velocity*=Math.exp(-7*dt);if(Math.abs(velocity)>12&&Math.abs(rail.scrollLeft-before)>.1){frame=requestAnimationFrame(glide);}else stop();};frame=requestAnimationFrame(glide);};
  rail.addEventListener('pointerup',release);rail.addEventListener('pointercancel',()=>{start=null;stop();});rail.addEventListener('pointerleave',()=>{if(start&&!dragging)start=null;});rail.addEventListener('click',e=>{if(performance.now()<suppressUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
  rail.addEventListener('keydown',e=>{if(e.target===rail&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();stop();rail.scrollBy({left:(e.key==='ArrowLeft'?-1:1)*rail.clientWidth*.75,behavior:off()?'instant':'smooth'});}});
  rail.addEventListener('scroll',sync,{passive:true});rail.addEventListener('portfolio-rail-update',()=>{stop();rail.scrollLeft=0;requestAnimationFrame(sync);});document.addEventListener('portfolio-motion',stop);new ResizeObserver(sync).observe(rail);sync();
 });
})();
