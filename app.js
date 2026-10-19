'use strict';
const grid = document.getElementById('project-grid');
const projectDialog = document.getElementById('project-dialog');
const content = document.getElementById('project-content');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxCaption = document.getElementById('lightbox-caption');
let currentProject = null;
let imageIndex = 0;
const imageCount = n => `${n} ${new Intl.PluralRules('ru').select(n)==='one'?'изображение':new Intl.PluralRules('ru').select(n)==='few'?'изображения':'изображений'}`;
const imagePath = id => `work-${String(id).padStart(3,'0')}.webp`;
const element = (tag, className, text) => {const el=document.createElement(tag);if(className)el.className=className;if(text)el.textContent=text;return el;};
for (const project of PROJECTS) {
 const card=element('button','project-card');card.type='button';card.dataset.id=project.id;card.setAttribute('aria-label',`Открыть проект «${project.title}»`);
 const top=element('div','project-top');top.append(element('span','project-category',project.category),element('h3','',project.title),element('p','',project.subtitle));
 const media=element('div','project-image');const img=element('img');img.src=imagePath(project.cover);img.alt=project.subtitle;img.loading='lazy';img.width=500;img.height=500;media.append(img);
 const bottom=element('div','project-bottom');bottom.append(element('span','',imageCount(project.images.length)));const arrow=element('span','card-arrow','↗');arrow.setAttribute('aria-hidden','true');bottom.append(arrow);
 card.append(top,media,bottom);card.addEventListener('click',()=>openProject(project));grid.append(card);
}
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
 const filter=button.dataset.filter;
 document.querySelectorAll('[data-filter]').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
 for(const card of grid.children){const project=PROJECTS.find(p=>p.id===card.dataset.id);card.hidden=filter!=='all'&&!project.tags.includes(filter);}
}));
function openProject(project){
 currentProject=project;content.replaceChildren();
 const title=element('h2','',project.title);title.id='dialog-title';content.append(title,element('p','project-category',project.subtitle));
 const summary=element('div','project-summary');
 for(const [label,key] of [['Задача','task'],['Что я сделала','solution'],['Результат','result']]){const block=element('div');block.append(element('h3','',label),element('p','',project[key]));summary.append(block);}
 content.append(summary);const gallery=element('div','detail-gallery');
 project.images.forEach((id,index)=>{const button=element('button','detail-image');button.type='button';button.setAttribute('aria-label',`Увеличить: ${project.subtitle}, изображение ${index+1}`);const img=element('img');img.src=imagePath(id);img.alt=`${project.subtitle} — работа ${index+1}`;img.loading=index<3?'eager':'lazy';button.append(img);button.addEventListener('click',()=>{imageIndex=index;showImage();lightbox.showModal();});gallery.append(button);});
 content.append(gallery);projectDialog.showModal();projectDialog.scrollTop=0;
}
function showImage(){const id=currentProject.images[imageIndex];lightboxImage.src=imagePath(id);lightboxImage.alt=`${currentProject.subtitle} — работа ${imageIndex+1}`;lightboxCaption.textContent=`${currentProject.title} / ${imageIndex+1} из ${currentProject.images.length}`;}
function stepImage(delta){imageIndex=(imageIndex+delta+currentProject.images.length)%currentProject.images.length;showImage();}
document.querySelector('.previous').addEventListener('click',()=>stepImage(-1));
document.querySelector('.next').addEventListener('click',()=>stepImage(1));
lightbox.addEventListener('keydown',event=>{if(event.key==='ArrowRight'){event.preventDefault();stepImage(1);}if(event.key==='ArrowLeft'){event.preventDefault();stepImage(-1);}});
document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>document.getElementById(button.dataset.close).close()));
projectDialog.addEventListener('click',event=>{if(event.target!==projectDialog)return;const r=projectDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)projectDialog.close();});
