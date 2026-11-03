'use strict';
(() => {
  const C = window.CAFE;
  const $ = s => document.querySelector(s);
  const icons = {
    bag:'<path d="M5 7h14l1 14H4L5 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/>',
    arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
    leaf:'<path d="M20 3C9 2 3 9 6 17c8 4 16-2 14-14Z"/><path d="m3 21 12-12"/>',
    pin:'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
    wifi:'<path d="M2 8a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0m-11 4a6 6 0 0 1 8 0"/><circle cx="12" cy="20" r=".5"/>',
    heart:'<path d="M20 4c-3-2-6-1-8 2-2-3-5-4-8-2-4 3-2 8 0 10l8 7 8-7c2-2 4-7 0-10Z"/>',
    search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    plus:'<path d="M12 5v14M5 12h14"/>', minus:'<path d="M5 12h14"/>', close:'<path d="m6 6 12 12M6 18 18 6"/>',
    menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
    plug:'<path d="M8 2v5m8-5v5M6 7h12v4a6 6 0 0 1-12 0V7Zm6 10v5"/>',
    external:'<path d="M14 3h7v7m0-7L10 14M10 4H4v16h16v-6"/>',
    copy:'<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M15 8V3H3v13h5"/>',
    trash:'<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
    whatsapp:'<path d="m3 21 1.5-5A9 9 0 1 1 8 20L3 21Z"/><path d="M8 7c-1 4 3 8 7 9l2-2-3-2-1 1c-2-1-3-2-3-3l1-1-2-3-1 1Z"/>'
  };
  const icon = name => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.leaf}</svg>`;
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = n => `${new Intl.NumberFormat('ru-RU').format(n)} ${C.currency}`;
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const save = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} };
  const find = id => C.menu.find(item => item.id === id);
  let cart = read('list-cart-v1', {});
  if (!cart || typeof cart !== 'object' || Array.isArray(cart)) cart = {};
  cart = Object.fromEntries(Object.entries(cart).filter(([id,n]) => find(id) && Number.isInteger(n) && n > 0 && n <= 99));
  let favorites = read('list-favorites-v1', []);
  favorites = new Set(Array.isArray(favorites) ? favorites.filter(id => find(id)) : []);
  let category = 'Все блюда', favoritesOnly = false, query = '', vegOnly = false;
  let checkout = { method:'pickup', name:'', phone:'', address:'', comment:'' };
  let currentDish = null, toastTimer, messageText = '';
  const categories = ['Все блюда', ...new Set(C.menu.map(x => x.category))];
  document.querySelectorAll('[data-icon]').forEach(el => el.innerHTML = icon(el.dataset.icon));
  document.querySelectorAll('dialog').forEach(dialog=>{const heading=dialog.querySelector('h2');if(heading){heading.id=`${dialog.id}-title`;dialog.setAttribute('aria-labelledby',heading.id);}});
  $('#dish-dialog').setAttribute('aria-label','Описание блюда');
  $('#year').textContent = new Date().getFullYear();
  $('#cafe-address').textContent = C.address;
  $('#cafe-hours').textContent = C.hours;
  $('#cafe-phone').textContent = C.phone || 'Контакт не указан';
  $('#route-link').href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(C.address)}`;
  $('#cafe-map').src = `https://maps.google.com/maps?q=${encodeURIComponent(C.mapQuery)}&z=15&output=embed`;
  const count = () => Object.values(cart).reduce((a,b) => a+b,0);
  const subtotal = () => Object.entries(cart).reduce((sum,[id,n]) => sum + find(id).price*n,0);
  const delivery = () => checkout.method === 'delivery' && subtotal() < C.freeDeliveryFrom ? C.deliveryFee : 0;
  const qtyControl = (id, n) => `<div class="qty-control"><button type="button" data-action="minus" data-id="${id}" aria-label="Убрать одну порцию: ${escape(find(id).name)}">${icon('minus')}</button><span aria-label="Количество">${n}</span><button type="button" data-action="add" data-id="${id}" aria-label="Добавить порцию: ${escape(find(id).name)}" ${n>=99?'disabled':''}>${icon('plus')}</button></div>`;
  function notify(text) { const el=$('.toast'); el.textContent=text;el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.hidden=true,2600); }
  function renderCategories() { $('.categories').innerHTML = categories.map(c=>`<button class="category ${c===category?'active':''}" data-category="${escape(c)}" aria-pressed="${c===category}">${c}</button>`).join(''); }
  function renderMenu() {
    const items = C.menu.filter(x => (category==='Все блюда'||x.category===category) && (!vegOnly||x.veg) && (!favoritesOnly||favorites.has(x.id)) && `${x.name} ${x.description}`.toLocaleLowerCase('ru').includes(query.toLocaleLowerCase('ru').trim()));
    $('#dish-grid').innerHTML=items.map(x=>`<article class="dish-card"><div class="dish-image"><button class="dish-photo" data-action="detail" data-id="${x.id}" aria-label="Состав и описание: ${escape(x.name)}"><img src="assets/${x.image}" alt="${escape(x.name)}" loading="lazy" width="480" height="420"></button><span class="dish-badge">${x.tag}</span><button class="favorite-button icon-button" data-action="favorite" data-id="${x.id}" aria-label="${favorites.has(x.id)?'Убрать из избранного':'Добавить в избранное'}: ${escape(x.name)}" aria-pressed="${favorites.has(x.id)}">${icon('heart')}</button></div><div class="dish-info"><button class="dish-title" data-action="detail" data-id="${x.id}">${x.name}</button><div class="dish-weight">${x.weight}${x.veg?` <span aria-label="Вегетарианское">${icon('leaf')}</span>`:''}</div><p class="dish-description">${x.description}</p><div class="dish-bottom"><span class="dish-price">${x.price} <small>${C.currency}</small></span>${cart[x.id]?qtyControl(x.id,cart[x.id]):`<button class="add-button" data-action="add" data-id="${x.id}" aria-label="Добавить в заказ: ${escape(x.name)}">В заказ ${icon('plus')}</button>`}</div></div></article>`).join('');
    $('.empty-menu').hidden=items.length>0;
    $('#results-count').textContent=`Найдено: ${items.length} из ${C.menu.length}`;
    $('#favorite-count').textContent=favorites.size;
  }
  function updateSummary() {
    document.querySelectorAll('.cart-count').forEach(el=>el.textContent=count());
    $('#floating-count').textContent=count();$('#floating-total').textContent=money(subtotal());
    $('.floating-cart').hidden=!count();
  }
  function renderCart() {
    $('#cart-subtitle').textContent=count()?`Позиций в заказе: ${count()}`:'Здесь скоро будет что-то вкусное';
    if (!count()) { $('#cart-content').innerHTML=`<div class="cart-empty">${icon('bag')}<h3>Вы пока ничего не выбрали</h3><p>Начните с любимого блюда.<br>Остальное сложится само.</p><button class="dark-button" id="back-to-menu">Посмотреть меню ${icon('arrow')}</button></div>`;return; }
    $('#cart-content').innerHTML=`<div class="cart-items">${Object.entries(cart).map(([id,n])=>{const x=find(id);return `<div class="cart-item"><img src="assets/${x.image}" alt="${x.name}"><div class="cart-item-info"><strong>${x.name}</strong><small>${money(x.price)} за порцию</small>${qtyControl(id,n)}</div><span class="cart-item-price">${money(x.price*n)}</span><button class="remove-item" type="button" data-action="remove" data-id="${id}" aria-label="Удалить из заказа: ${x.name}">${icon('trash')}</button></div>`}).join('')}</div><div class="delivery-hint">${subtotal()>=C.freeDeliveryFrom?'Доставка этого заказа — бесплатно.':`Ещё ${money(C.freeDeliveryFrom-subtotal())} — и доставка за наш счёт.`}</div><form id="checkout-form"><fieldset class="delivery-options"><legend>Как вам удобно?</legend><label><input type="radio" name="method" value="pickup" ${checkout.method==='pickup'?'checked':''}>Самовывоз</label><label><input type="radio" name="method" value="delivery" ${checkout.method==='delivery'?'checked':''}>Доставка</label></fieldset><div class="field-row"><label>Ваше имя<input name="name" value="${escape(checkout.name)}" placeholder="Как к вам обращаться" autocomplete="given-name" maxlength="70" required></label><label>Телефон<input name="phone" value="${escape(checkout.phone)}" type="tel" autocomplete="tel" placeholder="+996 …" maxlength="25" pattern="[+0-9() .\-]{7,25}" title="Введите номер телефона: не менее 7 цифр" required></label></div><label id="address-field" ${checkout.method!=='delivery'?'hidden':''}>Адрес доставки<input name="address" value="${escape(checkout.address)}" placeholder="Улица, дом, квартира" maxlength="200" autocomplete="street-address" ${checkout.method==='delivery'?'required':''}></label><label>Что нам учесть?<textarea name="comment" rows="2" placeholder="Без лука, приборы на двоих…" maxlength="500">${escape(checkout.comment)}</textarea></label><div class="cart-totals"><div><span>Блюда</span><span>${money(subtotal())}</span></div><div><span>${checkout.method==='delivery'?'Доставка':'Самовывоз'}</span><span id="delivery-price">${delivery()?money(delivery()):'Бесплатно'}</span></div><div class="total"><span>Итого</span><span id="checkout-total">${money(subtotal()+delivery())}</span></div></div><button class="dark-button full-width" type="submit">${icon('whatsapp')}Продолжить в WhatsApp ${icon('arrow')}</button><small>Демо: сначала покажем сообщение. Оплата не требуется.</small></form>`;
  }
  function renderDetail() {
    if(!currentDish)return;const x=find(currentDish);
    $('#dish-detail').innerHTML=`<img class="detail-image" src="assets/${x.image}" alt="${x.name}"><div class="detail-copy"><h2 id="dish-dialog-title">${x.name}</h2><div class="dish-weight">${x.weight}${x.veg?' · Вегетарианское':''}</div><p>${x.description}</p><p class="allergens"><strong>Аллергены:</strong> ${x.allergens}. Если у вас есть ограничения в питании, уточните состав перед заказом.</p><div class="dish-bottom"><span class="dish-price">${money(x.price)}</span>${cart[x.id]?qtyControl(x.id,cart[x.id]):`<button class="dark-button" data-action="add" data-id="${x.id}">Добавить в заказ ${icon('plus')}</button>`}</div></div>`;
    $('#dish-dialog').setAttribute('aria-labelledby','dish-dialog-title');
  }
  function updateCart(id,delta) {
    if(!find(id))return;
    const n=Math.min(99,(cart[id]||0)+delta);if(n<=0)delete cart[id];else cart[id]=n;
    save('list-cart-v1',cart);renderMenu();updateSummary();
    if($('#cart-dialog').open)renderCart();if($('#dish-dialog').open)renderDetail();
  }
  function showDialog(id) { const el=$(id); if(!el.open)el.showModal(); }
  function previewMessage(text) {
    messageText=text;$('#message-preview').textContent=text;
    const phone = !C.demo && /^\d{10,15}$/.test(C.whatsapp) ? C.whatsapp : '';
    $('#whatsapp-link').href=`https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    showDialog('#message-dialog');
  }
  document.addEventListener('click',e=>{
    const action=e.target.closest('[data-action]');
    const focusScope=action?.closest('dialog') || $('#dish-grid');
    if(action){const {id,action:a}=action.dataset;if(a==='add'){updateCart(id,1);notify(`${find(id).name} — в вашем заказе`);}if(a==='minus')updateCart(id,-1);if(a==='remove')updateCart(id,-99);if(a==='favorite'){favorites.has(id)?favorites.delete(id):favorites.add(id);save('list-favorites-v1',[...favorites]);renderMenu();}if(a==='detail'){currentDish=id;renderDetail();showDialog('#dish-dialog');}}
    if(action && ['add','minus','remove','favorite'].includes(action.dataset.action)){
      const {id,action:a}=action.dataset;
      const target=focusScope.querySelector(`[data-action="${a}"][data-id="${id}"]:not(:disabled)`) || focusScope.querySelector(`[data-action="add"][data-id="${id}"]:not(:disabled)`) || focusScope.querySelector(`[data-action="minus"][data-id="${id}"]`) || focusScope.querySelector('[data-action]:not(:disabled), #back-to-menu, .close-dialog');
      (target || (favoritesOnly?$('.favorite-toggle'):$('#search'))).focus({preventScroll:true});
    }
    if(e.target.closest('.cart-trigger')){renderCart();showDialog('#cart-dialog');}
    if(e.target.closest('.reserve-trigger')){showDialog('#reserve-dialog');$('.mobile-nav').hidden=true;$('.mobile-nav-toggle').setAttribute('aria-expanded','false');}
    if(e.target.closest('.close-dialog'))e.target.closest('dialog').close();
    if(e.target.closest('#back-to-menu')){$('#cart-dialog').close();$('#menu').scrollIntoView({behavior:'smooth'});}
    const cat=e.target.closest('[data-category]');if(cat){category=cat.dataset.category;renderCategories();renderMenu();$('.category.active')?.focus({preventScroll:true});}
  });
  document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}}));
  $('.favorite-toggle').addEventListener('click',()=>{favoritesOnly=!favoritesOnly;$('.favorite-toggle').setAttribute('aria-pressed',String(favoritesOnly));renderMenu();});
  $('#search').addEventListener('input',e=>{query=e.target.value;renderMenu();});
  $('#veg-only').addEventListener('change',e=>{vegOnly=e.target.checked;renderMenu();});
  $('#reset-filters').addEventListener('click',()=>{category='Все блюда';favoritesOnly=false;vegOnly=false;query='';$('#search').value='';$('#veg-only').checked=false;$('.favorite-toggle').setAttribute('aria-pressed','false');renderCategories();renderMenu();});
  $('.mobile-nav-toggle').addEventListener('click',()=>{const nav=$('.mobile-nav');nav.style.top=`${$('.header').getBoundingClientRect().bottom}px`;nav.hidden=!nav.hidden;$('.mobile-nav-toggle').setAttribute('aria-expanded',String(!nav.hidden));});
  window.addEventListener('scroll',()=>{if(!$('.mobile-nav').hidden)$('.mobile-nav').style.top=`${$('.header').getBoundingClientRect().bottom}px`;},{passive:true});
  $('.mobile-nav').addEventListener('click',e=>{if(e.target.closest('a')){$('.mobile-nav').hidden=true;$('.mobile-nav-toggle').setAttribute('aria-expanded','false');}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('.mobile-nav').hidden=true;$('.mobile-nav-toggle').setAttribute('aria-expanded','false');}});
  $('#cart-content').addEventListener('input',e=>{if(e.target.name in checkout)checkout[e.target.name]=e.target.value;});
  $('#cart-content').addEventListener('change',e=>{if(e.target.name==='method'){checkout.method=e.target.value;renderCart();$(`#checkout-form input[value="${checkout.method}"]`)?.focus();}});
  $('#cart-content').addEventListener('submit',e=>{
    e.preventDefault();if(!count())return;
    const f=e.target;if(!f.reportValidity())return;const data=new FormData(f);Object.keys(checkout).forEach(k=>{if(data.has(k))checkout[k]=String(data.get(k)).trim();});
    if(!checkout.name || checkout.phone.replace(/\D/g,'').length<7){notify('Укажите имя и номер телефона (не менее 7 цифр).');return;}
    if(checkout.method==='delivery'&&!checkout.address){notify('Укажите адрес доставки.');return;}
    const lines=Object.entries(cart).map(([id,n])=>`${find(id).name} × ${n} — ${money(find(id).price*n)}`);
    previewMessage(`${C.demo?'ДЕМОНСТРАЦИЯ — НЕ РЕАЛЬНЫЙ ЗАКАЗ\n\n':''}Здравствуйте, ${C.name}! Хочу заказать:\n\n${lines.join('\n')}\n\n${checkout.method==='delivery'?`Доставка: ${checkout.address}\nСтоимость доставки: ${money(delivery())}`:`Самовывоз: ${C.address}`}\nИтого: ${money(subtotal()+delivery())}\n\nИмя: ${checkout.name}\nТелефон: ${checkout.phone}${checkout.comment?`\nКомментарий: ${checkout.comment}`:''}`);
  });
  const dateInput=$('#reserve-form input[name=date]');
  const localDate = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  dateInput.min=localDate(new Date());dateInput.value=localDate(new Date());
  const max=new Date();max.setDate(max.getDate()+60);dateInput.max=localDate(max);
  const timeSelect=$('#reserve-form select[name=time]');
  function updateTimes(){const now=new Date();const today=dateInput.value===localDate(now);const options=[];for(let h=9;h<23;h++)for(const m of [0,30]){const value=`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;if(!today || h*60+m>now.getHours()*60+now.getMinutes()+30)options.push(value);}timeSelect.innerHTML=options.length?options.map(t=>`<option>${t}</option>`).join(''):'<option value="">Сегодня свободного времени уже нет</option>';}
  dateInput.addEventListener('change',updateTimes);updateTimes();
  $('#reserve-form').addEventListener('submit',e=>{e.preventDefault();if(!e.target.reportValidity())return;const f=new FormData(e.target);const name=String(f.get('name')).trim();if(!name){notify('Укажите ваше имя.');return;}const date=String(f.get('date'));const formatted=date.split('-').reverse().join('.');previewMessage(`ДЕМОНСТРАЦИЯ — НЕ РЕАЛЬНАЯ БРОНЬ\n\nЗдравствуйте, ${C.name}! Хочу забронировать столик.\n\nИмя: ${name}\nДата: ${formatted}\nВремя: ${f.get('time')}\nГостей: ${f.get('guests')}\n${f.get('comment')?`Пожелания: ${String(f.get('comment')).trim()}\n`:''}\nПодтвердите, пожалуйста, возможность бронирования.`);});
  $('#copy-message').addEventListener('click',async()=>{try{if(navigator.clipboard && window.isSecureContext)await navigator.clipboard.writeText(messageText);else{const t=document.createElement('textarea');t.value=messageText;$('#message-dialog').append(t);t.select();const success=document.execCommand('copy');t.remove();if(!success)throw new Error('copy');}notify('Сообщение скопировано');}catch{notify('Выделите и скопируйте текст сообщения вручную.');}});
  renderCategories();renderMenu();updateSummary();
})();
