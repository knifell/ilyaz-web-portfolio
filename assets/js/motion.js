(() => {
  'use strict';
  window.refreshMotion = (scope = document) => scope.querySelectorAll('.product-card').forEach((card,index) => card.style.setProperty('--card-index',index % 3));
  const links = [...document.querySelectorAll('.nav a[href^="#"], #shop-nav a[href^="#"]')];
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(link => { const active=link.hash===`#${entry.target.id}`; link.classList.toggle('is-active',active); if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current'); });
    }),{rootMargin:'-10% 0px -55% 0px',threshold:0});
    links.forEach(link => { const section=document.getElementById(link.hash.slice(1));if(section)observer.observe(section); });
  }
  refreshMotion();
  if(location.hash){const target=document.getElementById(location.hash.slice(1));if(target)requestAnimationFrame(()=>target.scrollIntoView({block:'start',behavior:'instant'}));}
})();
