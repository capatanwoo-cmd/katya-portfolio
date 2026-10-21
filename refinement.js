/* Career selection, one-time signal lettering, and section reveals. */
(()=>{
 'use strict';
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 const effects=document.getElementById('effects-toggle'),root=document.documentElement;
 const animations=[];
 const motionOff=()=>preference.matches||root.dataset.motion==='off';
 function syncButton(){if(preference.matches){effects.textContent='Анимация уменьшена';effects.disabled=true;}else{effects.disabled=false;effects.textContent=root.dataset.motion==='off'?'Включить эффекты':'Остановить эффекты';}effects.setAttribute('aria-pressed',String(motionOff()));}
 effects.addEventListener('click',()=>{root.dataset.motion=root.dataset.motion==='off'?'on':'off';if(motionOff())animations.forEach(a=>a.finish());syncButton();document.dispatchEvent(new CustomEvent('portfolio-motion'));});
 preference.addEventListener('change',()=>{if(motionOff())animations.forEach(a=>a.finish());syncButton();document.dispatchEvent(new CustomEvent('portfolio-motion'));});syncButton();
 const map=document.querySelector('.career-map');
 new IntersectionObserver(entries=>map.classList.toggle('in-view',entries[0].isIntersecting),{threshold:.15}).observe(map);
 const title=document.getElementById('intro-title');
 title.setAttribute('aria-label','Катя Сидорова');title.replaceChildren();
 ['КАТЯ','СИДОРОВА'].forEach((word,index)=>{
  if(index)title.append(document.createElement('br'));
  const line=document.createElement('span');line.className='signal-word';line.setAttribute('aria-hidden','true');
  [...word].forEach(letter=>{const span=document.createElement('span');span.className='signal-letter';span.textContent=letter;line.append(span);});title.append(line);
 });
 if(!motionOff()){
  const letters=[...title.querySelectorAll('.signal-letter')];
  letters.forEach((letter,index)=>{
   const delay=130+((index*7)%letters.length)*48;
   const animation=letter.animate([
    {opacity:.22,textShadow:'0 0 0 transparent',offset:0},
    {opacity:.65,textShadow:'0 0 11px #ed302b44',offset:.22},
    {opacity:.4,textShadow:'0 0 0 transparent',offset:.38},
    {opacity:1,textShadow:'0 0 16px #ed302b66',offset:.64},
    {opacity:.72,textShadow:'0 0 4px #ed302b22',offset:.77},
    {opacity:1,textShadow:'0 0 0 transparent',offset:1}
   ],{duration:640,delay,easing:'linear',fill:'backwards'});animations.push(animation);
  });
 }
 const targets=[...document.querySelectorAll('main>.career,main>.showcase,main>.work-intro,main>.case,main>.more-work,main>.contact')];
 if(!motionOff()){
  const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}});},{threshold:.04,rootMargin:'0px 0px -35px 0px'});
  targets.forEach(node=>{node.classList.add('reveal-ready');observer.observe(node);});
 }
})();
