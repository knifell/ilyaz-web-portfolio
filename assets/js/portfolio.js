(() => {
  'use strict';
  const config=window.SITE_CONFIG||{};
  const name=(config.name||'').trim();
  if(name){document.querySelectorAll('[data-owner]').forEach(el=>{el.textContent=name;});document.title=`${name} — разработка сайтов`;}

  // Меню на телефоне
  const nav=document.getElementById('main-nav'),toggle=document.querySelector('.menu-toggle');
  const close=()=>{nav.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');};
  toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);});
  nav.addEventListener('click',event=>{if(event.target.closest('a'))close();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&toggle.getAttribute('aria-expanded')==='true'){close();toggle.focus();}});

  const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const svg=id=>`<svg class="icon" aria-hidden="true"><use href="#${id}"></use></svg>`;

  // Работы
  document.getElementById('works').innerHTML=window.PORTFOLIO_WORKS.map(work=>`<article class="project"><a class="project-visual" href="${esc(work.url)}" aria-label="Открыть ${esc(work.title)}"><span class="project-preview-bar"><span class="preview-dots" aria-hidden="true"><i></i><i></i><i></i></span><span>${esc(work.previewLabel||work.title)}</span>${svg('arrow-up-right')}</span><img src="${esc(work.image)}" alt="${esc(work.imageAlt||work.title)}" width="1440" height="900" loading="lazy"></a><div class="project-meta"><p class="project-type">${esc(work.type)}</p><h3>${esc(work.title)}</h3><p class="project-description">${esc(work.description)}</p><a class="button project-open" href="${esc(work.url)}">${esc(work.linkLabel||'Открыть проект')} ${svg('arrow-up-right')}</a></div></article>`).join('');

  // Контакты
  const links=[];
  const wa=String(config.whatsapp||'').replace(/\D/g,'');
  let waUrl='';
  if(/^\d{10,15}$/.test(wa)){
    waUrl=`https://wa.me/${wa}`+(config.whatsappText?`?text=${encodeURIComponent(config.whatsappText)}`:'');
    const pretty=wa.startsWith('996')&&wa.length===12?`+996 ${wa.slice(3,6)} ${wa.slice(6,8)} ${wa.slice(8,10)} ${wa.slice(10)}`:`+${wa}`;
    links.push({kind:'WhatsApp',label:pretty,url:waUrl,icon:'chat',external:true});
  }
  const tg=(config.telegram||'').replace(/^@/,'').trim();
  if(/^[a-zA-Z0-9_]{5,32}$/.test(tg))links.push({kind:'Telegram',label:`@${tg}`,url:`https://t.me/${tg}`,icon:'chat',external:true});
  if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email||''))links.push({kind:'Почта',label:config.email,url:`mailto:${config.email}`,icon:'mail'});

  if(links.length){
    const box=document.getElementById('contact-links');box.replaceChildren();
    links.forEach(({kind,label,url,icon,external},index)=>{
      const a=document.createElement('a');a.className='contact-link'+(index?' secondary':'');a.href=url;
      if(external){a.target='_blank';a.rel='noopener';}
      a.insertAdjacentHTML('beforeend',svg(icon));
      const text=document.createElement('span');text.className='contact-text';
      const small=document.createElement('small');small.textContent=kind;
      text.append(small,document.createTextNode(label));a.append(text);
      a.insertAdjacentHTML('beforeend',`<svg class="icon go" aria-hidden="true"><use href="#arrow-up-right"></use></svg>`);
      box.append(a);
    });
    // Главные кнопки «Написать» ведут сразу в первый мессенджер
    const main=links[0];
    document.querySelectorAll('[data-contact-main]').forEach(a=>{a.href=main.url;if(main.external){a.target='_blank';a.rel='noopener';}});
  }

  // Выбор задачи
  const goals={
    business:{title:'Чтобы вас было легко выбрать.',description:'Понятно объяснить услугу, ответить на главные вопросы и помочь человеку связаться с вами.'},
    catalog:{title:'Чтобы нужное было легко найти.',description:'Собрать товары в одном месте. Чтобы их было удобно смотреть, сравнивать и выбирать.'},
    tool:{title:'Чтобы привычная задача стала проще.',description:'Калькулятор, форма или небольшой рабочий инструмент. Сначала обсудим, что действительно нужно и реально сделать.'}
  };
  const tabs=[...document.querySelectorAll('[data-goal]')],panel=document.getElementById('goal-panel');
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  const select=tab=>{
    if(tab.getAttribute('aria-selected')==='true')return;
    tabs.forEach(button=>{const active=button===tab;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;});
    const goal=goals[tab.dataset.goal];document.getElementById('goal-title').textContent=goal.title;document.getElementById('goal-description').textContent=goal.description;panel.setAttribute('aria-labelledby',tab.id);
    if(panel.getAnimations)panel.getAnimations().forEach(animation=>animation.cancel());
    if(!preference.matches&&panel.animate)panel.animate([{opacity:.3,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:260,easing:'cubic-bezier(.16,1,.3,1)'});
  };
  tabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>select(tab));
    tab.addEventListener('keydown',event=>{
      let next;
      if(event.key==='ArrowDown'||event.key==='ArrowRight')next=(index+1)%tabs.length;
      if(event.key==='ArrowUp'||event.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;
      if(event.key==='Home')next=0;
      if(event.key==='End')next=tabs.length-1;
      if(next!==undefined){event.preventDefault();select(tabs[next]);tabs[next].focus();}
    });
  });
})();
