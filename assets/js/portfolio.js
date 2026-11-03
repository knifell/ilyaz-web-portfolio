(() => {
  'use strict';
  const config=window.SITE_CONFIG||{};
  const name=(config.name||'').trim();
  if(name){document.querySelectorAll('[data-owner]').forEach(el=>{el.textContent=name;});document.title=`${name} — разработка сайтов`;}
  const nav=document.getElementById('main-nav'),toggle=document.querySelector('.menu-toggle');
  const close=()=>{nav.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');};
  toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);});
  nav.addEventListener('click',event=>{if(event.target.closest('a'))close();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&toggle.getAttribute('aria-expanded')==='true'){close();toggle.focus();}});
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon='<svg class="icon" aria-hidden="true"><use href="#arrow-up-right"></use></svg>';
  document.getElementById('works').innerHTML=window.PORTFOLIO_WORKS.map(work=>`<article class="project"><a class="project-visual" href="${esc(work.url)}" aria-label="Открыть ${esc(work.title)}"><span class="project-preview-bar"><span class="preview-dots" aria-hidden="true"><i></i><i></i><i></i></span><span>${esc(work.previewLabel||work.title)}</span><svg class="icon" aria-hidden="true"><use href="#arrow-up-right"></use></svg></span><img src="${esc(work.image)}" alt="${esc(work.imageAlt||work.title)}" width="1536" height="1024" loading="lazy"></a><div class="project-meta"><p class="project-type">${esc(work.type)}</p><h3>${esc(work.title)}</h3><p class="project-description">${esc(work.description)}</p><a class="button primary project-open" href="${esc(work.url)}">${esc(work.linkLabel||"Открыть проект")} ${icon}</a><p class="project-hint">Откроется отдельная страница</p></div></article>`).join('');
  const links=[];
  if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email))links.push({label:config.email,url:`mailto:${config.email}`});
  const tg=(config.telegram||'').replace(/^@/,'').trim();
  if(/^[a-zA-Z0-9_]{5,32}$/.test(tg))links.push({label:`Telegram · @${tg}`,url:`https://t.me/${tg}`});
  if(links.length){const box=document.getElementById('contact-links');box.replaceChildren();links.forEach(({label,url})=>{const a=document.createElement('a');a.className='contact-link';a.href=url;const text=document.createElement('span');text.textContent=label;a.append(text);a.insertAdjacentHTML('beforeend',icon);box.append(a);});}
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
    if(!preference.matches&&panel.animate)panel.animate([{opacity:.4},{opacity:1}],{duration:220,easing:'ease-out'});
  };
  tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>select(tab));tab.addEventListener('keydown',event=>{let next;if(event.key==='ArrowDown')next=(index+1)%tabs.length;if(event.key==='ArrowUp')next=(index-1+tabs.length)%tabs.length;if(event.key==='Home')next=0;if(event.key==='End')next=tabs.length-1;if(next!==undefined){event.preventDefault();select(tabs[next]);tabs[next].focus();}});});
  preference.addEventListener('change',()=>{if(preference.matches&&panel.getAnimations)panel.getAnimations().forEach(animation=>animation.cancel());});
})();
