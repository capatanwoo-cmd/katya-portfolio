/* Styled product selection, floating top control and shared view counter fallback. */
(()=>{'use strict';
 const native=document.getElementById('doctrine-position'),trigger=document.getElementById('doctrine-combobox'),list=document.getElementById('doctrine-options'),shell=trigger.closest('.product-dropdown'),text=document.getElementById('doctrine-selected-text');
 const options=()=>[...list.querySelectorAll('[role=option]')];
 function close(focus=false){list.hidden=true;trigger.setAttribute('aria-expanded','false');shell.classList.remove('is-open');if(focus)trigger.focus({preventScroll:true});}
 function layout(){const r=trigger.getBoundingClientRect(),below=innerHeight-r.bottom,above=r.top,up=below<260&&above>below;shell.classList.toggle('opens-up',up);shell.style.setProperty('--menu-height',`${Math.min(420,Math.max(160,(up?above:below)-24))}px`);}
 function open(focus=false){layout();list.hidden=false;trigger.setAttribute('aria-expanded','true');shell.classList.add('is-open');if(focus){const item=options().find(b=>b.getAttribute('aria-selected')==='true')||options()[0];item?.focus({preventScroll:true});item?.scrollIntoView({block:'nearest'});}}
 function sync(){text.textContent=native.selectedOptions[0]?.textContent||'Выбрать воронку';list.replaceChildren();[...native.options].forEach(option=>{const button=document.createElement('button');button.type='button';button.className='product-option';button.setAttribute('role','option');button.setAttribute('aria-selected',String(option.value===native.value));button.tabIndex=-1;button.textContent=option.textContent;if(option.value===native.value){const check=document.createElement('span');check.className='option-check';check.textContent='✓';check.setAttribute('aria-hidden','true');button.append(check);}button.addEventListener('click',()=>{native.value=option.value;native.dispatchEvent(new Event('change',{bubbles:true}));close(true);});list.append(button);});close();}
 native.addEventListener('portfolio-select-update',sync);sync();
 trigger.addEventListener('click',()=>list.hidden?open():close());
 trigger.addEventListener('keydown',event=>{if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();open(true);}else if(event.key==='Escape')close();});
 list.addEventListener('keydown',event=>{const items=options(),i=items.indexOf(document.activeElement);let target=null;if(event.key==='ArrowDown')target=items[(i+1)%items.length];if(event.key==='ArrowUp')target=items[(i-1+items.length)%items.length];if(event.key==='Home')target=items[0];if(event.key==='End')target=items.at(-1);if(target){event.preventDefault();target.focus();}else if(event.key==='Escape'){event.preventDefault();close(true);}else if(event.key==='Tab')close();});
 document.addEventListener('pointerdown',event=>{if(!shell.contains(event.target))close();});
 window.addEventListener('resize',()=>{if(!list.hidden)layout();});
 const top=document.getElementById('back-to-top');let queued=false;
 function update(){top.hidden=scrollY<Math.max(600,innerHeight*.9);queued=false;}
 window.addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(update);}},{passive:true});window.addEventListener('resize',update);update();
 top.addEventListener('click',()=>{const off=matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.dataset.motion==='off';window.scrollTo({top:0,behavior:off?'instant':'smooth'});document.querySelector('.brand')?.focus({preventScroll:true});});
 const image=document.getElementById('page-view-count'),unavailable=document.getElementById('page-view-unavailable');
 function failed(){image.hidden=true;unavailable.hidden=false;}
 image.addEventListener('error',failed);if(image.complete&&!image.naturalWidth)failed();
})();
