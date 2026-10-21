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
DOCTRINE.forEach((product,index)=>{const option=make('option','',product.label);option.value=String(index);select.append(option);const thumb=make('button','position-thumb');thumb.type='button';thumb.setAttribute('aria-label',`Выбрать: ${product.label}`);thumb.setAttribute('aria-pressed','false');const image=make('img');image.src=MEDIA[product.main].src;image.alt=product.label;image.loading='lazy';image.width=81;image.height=108;thumb.append(image);thumb.addEventListener('click',()=>renderProduct(index,false));$('#doctrine-strip').append(thumb);});
function renderProduct(index,scrollThumb=true){
 productIndex=(index+DOCTRINE.length)%DOCTRINE.length;const product=DOCTRINE[productIndex],ids=[product.main,...product.slides],media=MEDIA[product.main];
 select.value=String(productIndex);$('#doctrine-count').textContent=`${productIndex+1} / ${DOCTRINE.length}`;$('#doctrine-current-label').textContent=product.label;
 const main=$('#doctrine-main-image');main.src=media.src;main.alt=`Doctrine — ${product.label}`;main.width=media.width;main.height=media.height;$('#doctrine-main').setAttribute('aria-label',`Увеличить главную карточку: ${product.label}`);
 const preview=$('#doctrine-preview');preview.replaceChildren();preview.classList.toggle('empty',product.slides.length===0);
 if(product.slides.length){product.slides.slice(0,4).forEach((id,i)=>preview.append(imageButton(id,`${product.label}, слайд ${i+1}`,ids,i+1)));}
 else{const block=make('div','position-empty');block.append(make('strong','','FRESH\nMEAT'),make('p','','Индейка. Главная карточка для корма собак средних и крупных пород.'));preview.append(block);}
 const full=$('#doctrine-full');full.replaceChildren(document.createTextNode(product.slides.length?`Вся воронка (${ids.length} слайдов) `:'Рассмотреть карточку '));const arrow=make('span','','↗');arrow.setAttribute('aria-hidden','true');full.append(arrow);
 [...$('#doctrine-strip').children].forEach((thumb,i)=>{thumb.classList.toggle('active',i===productIndex);thumb.setAttribute('aria-pressed',String(i===productIndex));});
 if(scrollThumb)$('#doctrine-strip').children[productIndex].scrollIntoView({behavior:reduced()?'instant':'smooth',block:'nearest',inline:'nearest'});
}
select.addEventListener('change',()=>renderProduct(Number(select.value),false));$('#doctrine-prev').addEventListener('click',()=>renderProduct(productIndex-1));$('#doctrine-next').addEventListener('click',()=>renderProduct(productIndex+1));
$('#doctrine-main').addEventListener('click',()=>{const p=DOCTRINE[productIndex];openImage([p.main,...p.slides],0,`Doctrine — ${p.label}`);});
$('#doctrine-full').addEventListener('click',()=>{const p=DOCTRINE[productIndex];openGallery(`Doctrine — ${p.label}`,'Главная карточка и слайды инфографики для этой позиции. Photoshop / Figma.',[p.main,...p.slides]);});
renderProduct(0,false);
function renderGeo(key){const group=GEO[key];const rail=$('#geo-rail');rail.replaceChildren();group.images.forEach((id,i)=>rail.append(imageButton(id,`${group.title}, креатив ${i+1}`,group.images,i)));rail.scrollLeft=0;$('#geo-caption').textContent=`${group.caption} / работ: ${group.images.length}`;document.querySelectorAll('[data-geo]').forEach(button=>{const active=button.dataset.geo===key;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});}
document.querySelectorAll('[data-geo]').forEach(button=>button.addEventListener('click',()=>renderGeo(button.dataset.geo)));renderGeo('laser');
GALLERIES.statera.images.forEach((id,i)=>$('#statera-gallery').append(imageButton(id,`Statera — этикетка паштета, вариант ${i+1}`,GALLERIES.statera.images,i)));
[1,2].forEach(id=>$('#spices-details').append(imageButton(id,'Дизайн этикетки для специй',GALLERIES.spices.images,GALLERIES.spices.images.indexOf(id))));
MAIN_CARDS.forEach((id,i)=>$('#cards-rail').append(imageButton(id,`Главная карточка товара ${i+1}`,MAIN_CARDS,i)));
for(const key of ['toys','ads','windows']){const group=GALLERIES[key];const button=make('button','more-card');button.type='button';button.setAttribute('aria-label',`Открыть: ${group.title}`);const imageWrap=make('div','more-image'),img=make('img');img.src=MEDIA[group.cover].src;img.alt=group.title;img.width=MEDIA[group.cover].width;img.height=MEDIA[group.cover].height;img.loading='lazy';imageWrap.append(img);const title=make('h3','',group.title);title.append(make('span','','↗'));button.append(imageWrap,title,make('p','',`Работ в подборке: ${group.images.length}`));button.addEventListener('click',()=>openGallery(group.title,group.description,group.images));$('#more-grid').append(button);}
document.querySelectorAll('[data-open-gallery]').forEach(button=>button.addEventListener('click',()=>{const group=GALLERIES[button.dataset.openGallery];openGallery(group.title,group.description,group.images);}));
document.querySelectorAll('[data-image]').forEach(button=>button.addEventListener('click',()=>{const id=Number(button.dataset.image);const ids=id===0?GALLERIES.spices.images:[5,6];openImage(ids,ids.indexOf(id),id===0?'Специи — этикетка и 3D':'Doctrine Health Sticks — 3D-визуализация');}));
document.querySelectorAll('[data-scroll]').forEach(button=>button.addEventListener('click',()=>{const rail=document.getElementById(button.dataset.scroll);rail.scrollBy({left:Number(button.dataset.direction)*(rail.clientWidth*.78),behavior:reduced()?'instant':'smooth'});}));
for(const rail of document.querySelectorAll('.rail'))rail.addEventListener('keydown',event=>{if(event.target!==rail)return;if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();rail.scrollBy({left:(event.key==='ArrowRight'?1:-1)*rail.clientWidth*.7,behavior:reduced()?'instant':'smooth'});}});
for(const dialog of [galleryDialog,imageDialog])dialog.addEventListener('close',()=>{$('#image-full').removeAttribute('src');});
