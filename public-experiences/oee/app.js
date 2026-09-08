const demos = [
  {status:'ALAMBRES · DEMO',question:'¿Qué requiere atención ahora?',answer:'Una lectura compartida de activos, alertas, trabajo en curso y responsables permite dirigir la operación sin reconstruir el contexto.',decision:'Priorizar el caso correcto y asignar la siguiente acción.',image:'assets/wire-control.jpg',alt:'Centro de control de la demo Alambres'},
  {status:'ALAMBRES · DEMO',question:'¿Qué activo cambió de condición?',answer:'El activo conserva ubicación, criticidad, reporte, responsable y siguiente acción dentro de un mismo contexto operativo.',decision:'Determinar prioridad y protocolo antes de intervenir.',image:'assets/wire-operator.jpg',alt:'Operación móvil de la demo Alambres'},
  {status:'ATM · DEMO',question:'¿Qué debe estar listo antes de ejecutar?',answer:'Ventana, ubicación, requisitos y evidencia esperada se presentan a quien realiza el trabajo en el momento de actuar.',decision:'Iniciar únicamente cuando las condiciones requeridas están completas.',image:'assets/atm-operator.jpg',alt:'Vista de operación móvil de la demo ATM'},
  {status:'RETAIL · DEMO',question:'¿Cómo coordinar una operación distribuida?',answer:'Programa, tiendas, asignaciones, avance y desviaciones comparten una lectura sin perder el contexto de cada ubicación.',decision:'Dirigir la atención hacia la tienda y el caso que la requieren.',image:'assets/retail-control.jpg',alt:'Centro de control de la demo Retail'},
  {status:'ATM · DEMO',question:'¿Cómo demostrar lo que ocurrió en campo?',answer:'GPS, fotografías, marca temporal y firma forman parte del protocolo y permanecen asociados al caso.',decision:'Enviar una ejecución completa a revisión.',image:'assets/atm-control.jpg',alt:'Control de ejecución de la demo ATM'},
  {status:'RETAIL · DEMO',question:'¿Qué necesita decidir supervisión?',answer:'Estado, avance, evidencia, incidencias y responsables permiten validar, devolver o escalar con la misma historia.',decision:'Cerrar, corregir o intervenir sin perder trazabilidad.',image:'assets/retail-operator.jpg',alt:'Operación y seguimiento de la demo Retail'}
];

const progress = document.getElementById('pageProgress');
const header = document.getElementById('siteHeader');
const nav = document.getElementById('siteNav');
const menuToggle = document.getElementById('menuToggle');
const sections = [...document.querySelectorAll('main .section')];
const navLinks = [...nav.querySelectorAll('a')];
const chapterRail = document.getElementById('chapterRail');
const previousChapter = document.getElementById('previousChapter');
const nextChapter = document.getElementById('nextChapter');
const openStoryIndex = document.getElementById('openStoryIndex');
const closeStoryIndex = document.getElementById('closeStoryIndex');
const closeStoryIndexBackdrop = document.getElementById('closeStoryIndexBackdrop');
const storyIndex = document.getElementById('storyIndex');
const storyIndexList = document.getElementById('storyIndexList');
const currentChapterNumber = document.getElementById('currentChapterNumber');
const chapterProgress = document.getElementById('chapterProgress');
let activeChapter = 0;
let controlsTimer;
let indexOpen = false;

const chapters = sections.map((section,index)=>({
  id:section.id,
  label:section.dataset.label,
  number:section.dataset.chapterNumber || String(index+1).padStart(2,'0')
}));

function createChapterButton(chapter,index,location){
  const button=document.createElement('button');
  button.type='button';
  button.dataset.chapter=String(index);
  button.setAttribute('aria-label',`Ir a ${chapter.label}`);
  button.innerHTML=location==='rail'
    ? `<i aria-hidden="true"></i><span>${chapter.number}</span><strong>${chapter.label}</strong>`
    : `<span>${chapter.number}</span><strong>${chapter.label}</strong><i aria-hidden="true">→</i>`;
  if(location!=='rail') button.tabIndex=-1;
  button.addEventListener('click',()=>goToChapter(index));
  return button;
}

chapters.forEach((chapter,index)=>{
  chapterRail.append(createChapterButton(chapter,index,'rail'));
  storyIndexList.append(createChapterButton(chapter,index,'index'));
});

function setActiveChapter(index,updateHash=false){
  activeChapter=Math.max(0,Math.min(chapters.length-1,index));
  const chapter=chapters[activeChapter];
  currentChapterNumber.textContent=chapter.number;
  chapterProgress.style.width=`${((activeChapter+1)/chapters.length)*100}%`;
  previousChapter.disabled=activeChapter===0;
  nextChapter.disabled=activeChapter===chapters.length-1;
  openStoryIndex.setAttribute('aria-label',`Abrir índice. ${chapter.label}`);
  document.querySelectorAll('[data-chapter]').forEach(button=>{
    const selected=Number(button.dataset.chapter)===activeChapter;
    button.classList.toggle('is-active',selected);
    button.classList.toggle('is-current',selected);
    if(button.closest('.chapter-rail')) selected ? button.setAttribute('aria-current','step') : button.removeAttribute('aria-current');
  });
  if(updateHash && location.hash!==`#${chapter.id}`) history.replaceState(null,'',`#${chapter.id}`);
}

function goToChapter(index){
  const bounded=Math.max(0,Math.min(chapters.length-1,index));
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  setActiveChapter(bounded,true);
  document.getElementById(chapters[bounded].id)?.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});
  setStoryIndex(false);
}

function setStoryIndex(open){
  const wasOpen=indexOpen;
  indexOpen=open;
  storyIndex.classList.toggle('is-open',open);
  storyIndex.setAttribute('aria-hidden',String(!open));
  closeStoryIndex.tabIndex=open?0:-1;
  closeStoryIndexBackdrop.tabIndex=open?0:-1;
  storyIndexList.querySelectorAll('button').forEach(button=>{button.tabIndex=open?0:-1;});
  document.body.classList.toggle('story-index-open',open);
  showStoryControls();
  if(open) closeStoryIndex.focus(); else if(wasOpen) openStoryIndex.focus({preventScroll:true});
}

function showStoryControls(){
  document.body.classList.add('controls-visible');
  clearTimeout(controlsTimer);
  if(!indexOpen) controlsTimer=setTimeout(()=>{
    if(!document.querySelector('.story-controller:focus-within, .chapter-rail:focus-within')) document.body.classList.remove('controls-visible');
  },2400);
}

function isTypingTarget(target){
  return target instanceof HTMLElement && (target.isContentEditable || ['INPUT','TEXTAREA','SELECT'].includes(target.tagName));
}

previousChapter.addEventListener('click',()=>goToChapter(activeChapter-1));
nextChapter.addEventListener('click',()=>goToChapter(activeChapter+1));
openStoryIndex.addEventListener('click',()=>setStoryIndex(true));
closeStoryIndex.addEventListener('click',()=>setStoryIndex(false));
closeStoryIndexBackdrop.addEventListener('click',()=>setStoryIndex(false));

['pointermove','pointerdown'].forEach(eventName=>addEventListener(eventName,showStoryControls,{passive:true}));
addEventListener('keydown',event=>{
  showStoryControls();
  if(isTypingTarget(event.target)) return;
  if(event.key==='Escape' && indexOpen){event.preventDefault();setStoryIndex(false);return;}
  if(['ArrowDown','ArrowRight','PageDown'].includes(event.key)){event.preventDefault();goToChapter(activeChapter+1);}
  else if(['ArrowUp','ArrowLeft','PageUp'].includes(event.key)){event.preventDefault();goToChapter(activeChapter-1);}
  else if(event.key==='Home'){event.preventDefault();goToChapter(0);}
  else if(event.key==='End'){event.preventDefault();goToChapter(chapters.length-1);}
  else if(event.key.toLowerCase()==='g'){event.preventDefault();setStoryIndex(!indexOpen);}
});

let chapterFrame=0;
function updateChapterFromScroll(){
  chapterFrame=0;
  const readingLine=scrollY+innerHeight*.38;
  const current=sections.reduce((active,section,index)=>section.offsetTop<=readingLine?index:active,0);
  setActiveChapter(current,true);
}
addEventListener('scroll',()=>{if(!chapterFrame) chapterFrame=requestAnimationFrame(updateChapterFromScroll);},{passive:true});
addEventListener('resize',()=>{if(!chapterFrame) chapterFrame=requestAnimationFrame(updateChapterFromScroll);});

function onScroll(){
  const max=document.documentElement.scrollHeight-innerHeight;
  progress.style.width=`${max>0?(scrollY/max)*100:0}%`;
  header.classList.toggle('compact',scrollY>70);
  let current='';
  sections.forEach(section=>{if(scrollY>=section.offsetTop-innerHeight*.38) current=section.id;});
  navLinks.forEach(link=>link.classList.toggle('active',link.hash===`#${current}`));
}
addEventListener('scroll',onScroll,{passive:true});

menuToggle.addEventListener('click',()=>{
  const open=header.classList.toggle('nav-open');
  menuToggle.setAttribute('aria-expanded',String(open));
});
navLinks.forEach(link=>link.addEventListener('click',()=>{header.classList.remove('nav-open');menuToggle.setAttribute('aria-expanded','false');}));

const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target);}
}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(element=>revealObserver.observe(element));

const reducedMotionQuery=matchMedia('(prefers-reduced-motion: reduce)');
const reminderSection=document.getElementById('alertas');
let reminderSequenceTimer;
if(reducedMotionQuery.matches){reminderSection.dataset.animationState='complete';}
else{
  const reminderObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.intersectionRatio>=.2 && !reminderSection.classList.contains('is-playing')){
      clearTimeout(reminderSequenceTimer);
      reminderSection.classList.add('is-playing');
      reminderSection.dataset.animationState='playing';
      reminderSequenceTimer=setTimeout(()=>{reminderSection.dataset.animationState='complete';},5200);
    }else if(entry.intersectionRatio===0){
      clearTimeout(reminderSequenceTimer);
      reminderSection.classList.remove('is-playing');
      reminderSection.dataset.animationState='ready';
    }
  }),{threshold:[0,.2]});
  reminderObserver.observe(reminderSection);
}

const demoContent=document.getElementById('demoContent');
document.querySelectorAll('[data-demo]').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('[data-demo]').forEach(item=>item.setAttribute('aria-selected','false'));
  button.setAttribute('aria-selected','true');
  const item=demos[Number(button.dataset.demo)];
  demoContent.innerHTML=`<div class="demo-copy"><p class="status demo">${item.status}</p><small>PREGUNTA OPERATIVA</small><h3>${item.question}</h3><p>${item.answer}</p><div class="demo-decision"><small>DECISIÓN HABILITADA</small><strong>${item.decision}</strong></div></div><figure><img src="${item.image}" alt="${item.alt}"/><figcaption>Demo conceptual · datos y tiempos simulados</figcaption></figure>`;
}));

const captureButton=document.getElementById('captureButton');
const captureCard=document.getElementById('captureCard');
const captureImage=document.getElementById('captureImage');
captureButton.addEventListener('click',()=>{
  const captured=captureCard.classList.toggle('is-captured');
  captureButton.setAttribute('aria-pressed',String(captured));
  captureButton.textContent=captured?'Captura registrada':'Tomar fotografía';
  captureImage.src=captured?'assets/atm-photo-capture-component.jpg':'assets/atm-photo-camera-component.jpg';
  captureImage.alt=captured?'Captura fotográfica simulada registrada':'Componente de cámara basado en la demo ATM';
});

const initialHashIndex=chapters.findIndex(chapter=>`#${chapter.id}`===location.hash);
setActiveChapter(initialHashIndex>=0?initialHashIndex:0);
showStoryControls();
onScroll();
