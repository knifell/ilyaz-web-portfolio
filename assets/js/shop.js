(() => {
  'use strict';
  const products=window.SHOP_PRODUCTS;
  const find=id=>products.find(p=>p.id===id);
  const money=value=>`${new Intl.NumberFormat('ru-RU').format(value)} сом`;
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const image=p=>`../assets/images/${p.image}`;
  const icon=name=>`<svg class="icon" aria-hidden="true"><use href="#${name}"></use></svg>`;
  const storageKey='tikho-demo-cart-v1';
  let cart={},storageAvailable=true,lastRemoved=null,feedback='';
  try{
    const saved=JSON.parse(localStorage.getItem(storageKey)||'{}');
    if(saved&&typeof saved==='object'&&!Array.isArray(saved))for(const[id,quantity]of Object.entries(saved))if(find(id)&&Number.isInteger(quantity)&&quantity>0)cart[id]=Math.min(quantity,99);
  }catch{storageAvailable=false;}
  const persist=()=>{
    try{localStorage.setItem(storageKey,JSON.stringify(cart));storageAvailable=true;}catch{storageAvailable=false;}
    document.getElementById('storage-note').hidden=storageAvailable;
    const badge=document.getElementById('cart-count'),count=Object.values(cart).reduce((a,b)=>a+b,0);
    if(badge.textContent!==String(count)){badge.classList.remove('cart-count-bump');requestAnimationFrame(()=>badge.classList.add('cart-count-bump'));}
    badge.textContent=count;
    document.getElementById('checkout-message').hidden=true;
  };
  let toastTimer;
  const toast=message=>{const el=document.getElementById('toast');el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>{el.classList.remove('visible');},3000);};
  const productDialog=document.getElementById('product-dialog'),cartDialog=document.getElementById('cart-dialog');
  const announce=message=>{document.getElementById('cart-live').textContent=message;};
  function add(id){
    const p=find(id);if(!p)return;
    if((cart[id]||0)>=99){const message='В демокорзине максимум 99 единиц одного товара.';if(productDialog.open)document.getElementById('detail-added').textContent=message;else toast(message);return;}
    cart[id]=(cart[id]||0)+1;lastRemoved=null;feedback='';persist();
    if(productDialog.open)document.getElementById('detail-added').textContent=`Добавлено. В корзине: ${cart[id]} шт.`;
    else toast(`Добавлено в корзину: ${p.name}`);
  }
  document.querySelectorAll('dialog').forEach(dialog=>{
    dialog.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>dialog.close()));
    dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  });
  function detail(id){
    const p=find(id);if(!p)return;
    document.getElementById('product-detail').innerHTML=`<div class="detail-layout"><img class="detail-image" src="${image(p)}" alt="${esc(p.alt)}" width="${p.imageWidth || 900}" height="${p.imageHeight || 900}" style="object-position:${p.position}"><div class="detail-copy"><h2 id="product-title">${esc(p.name)}</h2><p class="detail-price">${money(p.price)}</p><p class="detail-description">${esc(p.description)}</p><dl><div><dt>Материалы</dt><dd>${esc(p.material)}</dd></div><div><dt>Размеры, условно</dt><dd>${esc(p.size)}</dd></div><div><dt>Цвет</dt><dd>${esc(p.color)}</dd></div></dl><button class="button rust" type="button" data-add="${p.id}">Добавить в корзину ${icon('plus')}</button><p id="detail-added" class="detail-added" role="status" aria-live="polite"></p><button type="button" class="continue-shopping" data-detail-cart>Открыть корзину</button><p class="detail-note">Учебный товар. Фото — иллюстрация, характеристики и цена вымышлены.</p></div></div>`;
    productDialog.showModal();
  }
  const grid=document.getElementById('products');
  const categories=[['all','Все предметы'],...new Map(products.map(p=>[p.category,p.label])).entries()];
  const validCategory=value=>categories.some(([id])=>id===value)?value:'all';
  const readCategory=()=>validCategory(new URL(location.href).searchParams.get('category'));
  let currentCategory=readCategory();
  const filters=document.getElementById('filters');
  filters.innerHTML=categories.map(([id,label])=>`<button type="button" class="filter" data-category="${id}" aria-pressed="${id===currentCategory}">${esc(label)}</button>`).join('');
  function renderProducts(category){
    currentCategory=validCategory(category);
    const visible=products.filter(p=>currentCategory==='all'||p.category===currentCategory);
    grid.innerHTML=visible.map((p,index)=>`<article class="product-card" style="--card-index:${index%3}"><button type="button" class="product-image" data-detail="${p.id}" aria-label="Подробнее: ${esc(p.name)}"><img src="${image(p)}" alt="${esc(p.alt)}" width="${p.imageWidth || 900}" height="${p.imageHeight || 900}" loading="lazy" style="object-position:${p.position}"><span class="product-view" aria-hidden="true">Рассмотреть ${icon('arrow-up-right')}</span></button><div class="product-info"><p class="product-category">${esc(p.label)}</p><h3 class="product-name"><button type="button" data-detail="${p.id}">${esc(p.name)}</button></h3><p class="product-price">${money(p.price)}</p><button type="button" class="quick-add" data-add="${p.id}" aria-label="Добавить в корзину: ${esc(p.name)}">${icon('plus')}<span>В корзину</span></button></div></article>`).join('');
    filters.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.category===currentCategory)));
    document.getElementById('product-count').textContent=`Показано: ${visible.length} из ${products.length}`;
  }
  filters.addEventListener('click',event=>{
    const button=event.target.closest('[data-category]');if(!button||button.dataset.category===currentCategory)return;
    renderProducts(button.dataset.category);
    const url=new URL(location.href);if(currentCategory==='all')url.searchParams.delete('category');else url.searchParams.set('category',currentCategory);
    try{history.pushState(null,'',url);}catch{/* file:// can restrict history; the filter still works. */}
  });
  addEventListener('popstate',()=>renderProducts(readCategory()));
  const total=()=>Object.entries(cart).reduce((sum,[id,quantity])=>sum+find(id).price*quantity,0);
  function renderCart(){
    const items=Object.entries(cart).filter(([id])=>find(id));
    document.getElementById('cart-summary').hidden=!items.length;
    document.getElementById('cart-items').innerHTML=items.length?items.map(([id,quantity])=>{
      const p=find(id);return `<article class="cart-row" data-cart-id="${id}"><img src="${image(p)}" alt="${esc(p.alt)}" width="76" height="90" style="object-position:${p.position}"><div><h3>${esc(p.name)}</h3><p>${money(p.price*quantity)}</p><div class="cart-row-bottom"><div class="quantity"><button type="button" data-change="-1" data-id="${id}" aria-label="Уменьшить количество: ${esc(p.name)}">−</button><output aria-label="Количество: ${esc(p.name)}">${quantity}</output><button type="button" data-change="1" data-id="${id}" aria-label="Увеличить количество: ${esc(p.name)}" ${quantity>=99?'disabled':''}>+</button></div><button class="remove-item" type="button" data-remove="${id}" aria-label="Удалить из корзины: ${esc(p.name)}">Удалить</button></div></div></article>`;
    }).join(''):'<div class="empty-cart"><h3>Корзина пока пуста</h3><p>Добавьте предмет из каталога.<br>Это демонстрация, покупки не принимаются.</p></div>';
    document.getElementById('cart-total').textContent=money(total());
    document.getElementById('storage-note').hidden=storageAvailable;
    const undo=document.getElementById('undo-remove');undo.hidden=!lastRemoved;
    const feedbackBox=document.getElementById('cart-feedback');feedbackBox.hidden=!feedback;
    document.getElementById('cart-feedback-text').textContent=feedback;
  }
  const openCart=()=>{renderCart();cartDialog.showModal();};
  document.addEventListener('click',event=>{
    const addButton=event.target.closest('[data-add]');if(addButton)add(addButton.dataset.add);
    const detailButton=event.target.closest('[data-detail]');if(detailButton)detail(detailButton.dataset.detail);
    if(event.target.closest('[data-cart-open]'))openCart();
    if(event.target.closest('[data-detail-cart]')){productDialog.close();openCart();}
  });
  document.getElementById('cart-items').addEventListener('click',event=>{
    const change=event.target.closest('[data-change]'),remove=event.target.closest('[data-remove]');if(!change&&!remove)return;
    const id=change?change.dataset.id:remove.dataset.remove,delta=change?Number(change.dataset.change):0;
    const previous=cart[id];
    const removing=Boolean(remove)||(change&&previous+delta<=0);
    if(removing){lastRemoved={id,quantity:previous};feedback=`Удалён товар: ${find(id).name}.`;delete cart[id];}
    else{cart[id]=Math.min(99,previous+delta);lastRemoved=null;feedback='';}
    persist();renderCart();announce(removing?`Товар удалён. Его можно вернуть: ${find(id).name}.`:`${find(id).name}: ${cart[id]} шт. Итого ${money(total())}.`);
    let focus=removing?document.getElementById('undo-remove'):document.querySelector(`[data-cart-id="${id}"] [data-change="${delta}"]`);
    if(focus&&focus.disabled)focus=document.querySelector(`[data-cart-id="${id}"] [data-change="-1"]`);
    if(focus)focus.focus();
  });
  document.getElementById('undo-remove').addEventListener('click',()=>{
    if(!lastRemoved)return;const{id,quantity}=lastRemoved;cart[id]=Math.min(99,(cart[id]||0)+quantity);lastRemoved=null;feedback=`Восстановлен товар: ${find(id).name}.`;
    persist();renderCart();announce(feedback);document.querySelector(`[data-cart-id="${id}"] [data-change="-1"]`).focus();
  });
  document.getElementById('checkout').addEventListener('click',()=>{document.getElementById('checkout-message').hidden=false;});
  const toggle=document.querySelector('.menu-toggle'),nav=document.getElementById('shop-nav');
  const closeNav=()=>{toggle.setAttribute('aria-expanded','false');nav.classList.remove('is-open');};
  toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);});
  nav.addEventListener('click',event=>{if(event.target.closest('a'))closeNav();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&toggle.getAttribute('aria-expanded')==='true'){closeNav();toggle.focus();}});
  renderProducts(currentCategory);persist();
})();
