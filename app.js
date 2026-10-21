'use strict';
const $ = selector=>document.querySelector(selector);
const make=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text)node.textContent=text;return node;};
const galleryDialog=$('#gallery-dialog'),imageDialog=$('#image-dialog');
let currentImages=[],currentIndex=0,currentTitle='',productIndex=0;
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
function imageButton(id,title,ids=[id],index=0){
 const button=make('button','image-button');button.type='button';button.setAttribute('aria-label',`Увеличить: ${title}`);
 const img=make('img');const media=MEDIA[id];img.src=media.src;img.alt=title;img.width=media.width;img.height=media.height;img.loading='lazy';
 const mark=make('span','zoom-mark','↗');mark.setAttribute('aria-hidden','true');button.append(img,mark);button.addEventListener('click',()=>openImage(ids,index,title.replace(/, (?:изображение|слайд|креатив) \d+$/,'')));return button;
}
function openImage(ids,index,title){
 currentImages=ids;currentIndex=index;currentTitle=title;renderImage();imageDialog.showModal();
}
function renderImage(){const id=currentImages[currentIndex],img=$('#image-full');img.src=MEDIA[id].src;img.alt=`${currentTitle} — изображение ${currentIndex+1}`;$('#image-caption').textContent=`${currentTitle} / ${currentIndex+1} из ${currentImages.length}`;$('#image-prev').hidden=currentImages.length<2;$('#image-next').hidden=currentImages.length<2;}
function stepImage(direction){currentIndex=(currentIndex+direction+currentImages.length)%currentImages.length;renderImage();}
$('#image-prev').addEventListener('click',()=>stepImage(-1));$('#image-next').addEventListener('click',()=>stepImage(1));
imageDialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();stepImage(-1);}if(event.key==='ArrowRight'){event.preventDefault();stepImage(1);}});
function openGallery(title,description,ids){
 $('#gallery-title').textContent=title;$('#gallery-description').textContent=description;const grid=$('#gallery-images');grid.replaceChildren();
 ids.forEach((id,i)=>grid.append(imageButton(id,`${title}, изображение ${i+1}`,ids,i)));
 galleryDialog.showModal();galleryDialog.scrollTop=0;
}
document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>document.getElementById(button.dataset.close).close()));
for(const dialog of [galleryDialog,imageDialog])dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
const select=$('#doctrine-position');
let productFilter='all',currentGeo='garage';
const filteredProducts=()=>DOCTRINE.map((_,i)=>i).filter(i=>productFilter==='all'||(productFilter==='cats'?i<6:i>=6));
function syncProductOptions(){select.replaceChildren();filteredProducts().forEach(index=>{const option=make('option','',DOCTRINE[index].label);option.value=String(index);select.append(option);});}
function renderProduct(index){
 const available=filteredProducts();productIndex=available.includes(index)?index:available[0];
 const product=DOCTRINE[productIndex],ids=[product.main,...product.slides],rail=$('#doctrine-funnel-rail');
 select.value=String(productIndex);$('#doctrine-count').textContent=`${available.indexOf(productIndex)+1} / ${available.length}`;$('#doctrine-current-label').textContent=product.label;
 rail.replaceChildren();rail.classList.toggle('single',ids.length===1);
 ids.forEach((id,i)=>{const card=make('figure','showcase-card funnel-card liquid-glass');const button=imageButton(id,`Doctrine — ${product.label}, слайд ${i+1}`,ids,i);if(!i){button.id='doctrine-main';button.querySelector('img').id='doctrine-main-image';}card.append(button,make('figcaption','',i?`Слайд ${String(i).padStart(2,'0')}`:'Главная карточка'));rail.append(card);});
 $('#doctrine-full').textContent=ids.length>1?`Вся воронка (${ids.length} слайдов) ↗`:'Рассмотреть карточку ↗';rail.scrollLeft=0;rail.dispatchEvent(new CustomEvent('portfolio-rail-update',{bubbles:true}));
}
document.querySelectorAll('[data-doctrine-filter]').forEach(button=>button.addEventListener('click',()=>{productFilter=button.dataset.doctrineFilter;document.querySelectorAll('[data-doctrine-filter]').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});syncProductOptions();renderProduct(productIndex);}));
select.addEventListener('change',()=>renderProduct(Number(select.value)));
function stepProduct(direction){const ids=filteredProducts();renderProduct(ids[(ids.indexOf(productIndex)+direction+ids.length)%ids.length]);}
$('#doctrine-prev').addEventListener('click',()=>stepProduct(-1));$('#doctrine-next').addEventListener('click',()=>stepProduct(1));
$('#doctrine-full').addEventListener('click',()=>{const p=DOCTRINE[productIndex];openGallery(`Doctrine — ${p.label}`,'Главная карточка и слайды инфографики для этой позиции. Photoshop / Figma.',[p.main,...p.slides]);});
syncProductOptions();renderProduct(0);
function renderGeo(key){
 currentGeo=key;const group=GEO[key],rail=$('#geo-rail');rail.replaceChildren();
 group.images.forEach((id,i)=>{const square=group.squares.includes(id),story=group.stories.indexOf(id),label=id===group.route?'Как пройти':square?`Витрина услуг ${String(group.squares.indexOf(id)+1).padStart(2,'0')}`:`Сторис ${String(story+1).padStart(2,'0')}`;
 const card=make('figure',`showcase-card geo-card liquid-glass ${square?'geo-square':'geo-story'}`);card.dataset.tilt='';card.style.setProperty('--stagger',`${square?72:i===0?0:(i%3)*22}px`);card.append(imageButton(id,`${group.title}, креатив ${i+1}`,group.images,i),make('figcaption','',label));rail.append(card);});
 rail.scrollLeft=0;$('#geo-caption').textContent=`${group.title} · материалов: ${group.images.length}`;
 $('.geo-order').textContent=group.squares.length?'Как пройти → Сторис → Витрина услуг':'Как пройти → Сторис';
 document.querySelectorAll('[data-geo]').forEach(button=>{const active=button.dataset.geo===key;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});rail.dispatchEvent(new CustomEvent('portfolio-rail-update',{bubbles:true}));
}
document.querySelectorAll('[data-geo]').forEach(button=>button.addEventListener('click',()=>renderGeo(button.dataset.geo)));renderGeo('garage');
$('#geo-all').addEventListener('click',()=>{const g=GEO[currentGeo];openGallery(g.title,g.caption,g.images);});
GALLERIES.statera.images.forEach((id,i)=>$('#statera-gallery').append(imageButton(id,`Statera — этикетка паштета, вариант ${i+1}`,GALLERIES.statera.images,i)));
[1,2].forEach(id=>$('#spices-details').append(imageButton(id,'Дизайн этикетки для специй',GALLERIES.spices.images,GALLERIES.spices.images.indexOf(id))));

for(const key of ['windows']){const group=GALLERIES[key];const button=make('button','more-card');button.type='button';button.setAttribute('aria-label',`Открыть: ${group.title}`);const imageWrap=make('div','more-image'),img=make('img');img.src=MEDIA[group.cover].src;img.alt=group.title;img.width=MEDIA[group.cover].width;img.height=MEDIA[group.cover].height;img.loading='lazy';imageWrap.append(img);const title=make('h3','',group.title);title.append(make('span','','↗'));button.append(imageWrap,title,make('p','',`Работ в подборке: ${group.images.length}`));button.addEventListener('click',()=>openGallery(group.title,group.description,group.images));$('#more-grid').append(button);}
document.querySelectorAll('[data-open-gallery]').forEach(button=>button.addEventListener('click',()=>{const group=GALLERIES[button.dataset.openGallery];openGallery(group.title,group.description,group.images);}));
document.querySelectorAll('[data-image]').forEach(button=>button.addEventListener('click',()=>{const id=Number(button.dataset.image);openImage(GALLERIES.spices.images,GALLERIES.spices.images.indexOf(id),'Специи — этикетка и 3D');}));
document.querySelectorAll('[data-scroll]').forEach(button=>button.addEventListener('click',()=>{const rail=document.getElementById(button.dataset.scroll);rail.scrollBy({left:Number(button.dataset.direction)*(rail.clientWidth*.78),behavior:reduced()?'instant':'smooth'});}));
for(const rail of document.querySelectorAll('.rail'))rail.addEventListener('keydown',event=>{if(event.target!==rail)return;if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();rail.scrollBy({left:(event.key==='ArrowRight'?1:-1)*rail.clientWidth*.7,behavior:reduced()?'instant':'smooth'});}});
for(const dialog of [galleryDialog,imageDialog])dialog.addEventListener('close',()=>{$('#image-full').removeAttribute('src');});

let buggyIndex=0;
function renderBuggy(index){buggyIndex=index;const group=BUGGY[index],rail=$('#buggy-rail');rail.replaceChildren();group.images.forEach((id,i)=>{const card=make('figure','showcase-card funnel-card liquid-glass');card.append(imageButton(id,`${group.title}, слайд ${i+1}`,group.images,i),make('figcaption','',`Слайд ${String(i+1).padStart(2,'0')}`));rail.append(card);});$('#buggy-count').textContent=`${group.images.length} слайдов`;$('#buggy-label').textContent=group.title;$('#buggy-all').textContent=`Вся воронка (${group.images.length} слайдов) ↗`;document.querySelectorAll('[data-buggy]').forEach(b=>{const active=Number(b.dataset.buggy)===index;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});rail.scrollLeft=0;rail.dispatchEvent(new CustomEvent('portfolio-rail-update',{bubbles:true}));}
document.querySelectorAll('[data-buggy]').forEach(b=>b.addEventListener('click',()=>renderBuggy(Number(b.dataset.buggy))));
$('#buggy-all').addEventListener('click',()=>{const g=BUGGY[buggyIndex];openGallery(g.title,'Инфографика детских игрушек / ГК «Примио».',g.images);});renderBuggy(0);
GALLERIES.ads.images.forEach((id,i)=>$('#petfabric-fallback-rail').append(imageButton(id,`PetFabric, изображение ${i+1}`,GALLERIES.ads.images,i)));
