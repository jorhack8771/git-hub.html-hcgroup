/* ============================================================
   HC GROUP — script.js
   Los 3 bloques <script> que tenía index.html, unidos en un solo
   archivo y en el mismo orden (el comportamiento no cambia).
   ============================================================ */

/* ---------- Bloque 1: Carrusel de EQUIPO (sección Unidades) ---------- */
      (function(){
        var car = document.getElementById('unitsCarousel');
        if(!car) return;
        var track = car.querySelector('.carousel-track');
        var slides = Array.prototype.slice.call(track.children);
        var dotsBox = car.querySelector('.carousel-dots');
        var range = document.getElementById('unitsZoomRange');
        var zoomVal = document.getElementById('unitsZoomVal');
        var viewport = car.querySelector('.carousel-viewport');
        var i = 0, timer = null, zoom = 1.4, DELAY = 3500, isHovering = false;
        var slidesImgs = slides.map(function(sl){ return sl.querySelector('img'); });

        slides.forEach(function(_, k){
          var b = document.createElement('button');
          b.type = 'button'; b.className = 'car-dot';
          b.setAttribute('aria-label', 'Ver imagen ' + (k+1));
          b.addEventListener('click', function(){ go(k); restart(); });
          dotsBox.appendChild(b);
        });
        var dots = Array.prototype.slice.call(dotsBox.children);

        function go(n){
          i = (n + slides.length) % slides.length;
          track.style.transform = 'translateX(' + (-i*100) + '%)';
          dots.forEach(function(d,k){ d.classList.toggle('on', k === i); });
          resetImages();
          if(isHovering) applyScale();
        }
        function start(){ if(!timer) timer = setInterval(function(){ go(i+1); }, DELAY); }
        function stop(){ clearInterval(timer); timer = null; }
        function restart(){ stop(); start(); }

        car.querySelector('.car-prev').addEventListener('click', function(){ go(i-1); restart(); });
        car.querySelector('.car-next').addEventListener('click', function(){ go(i+1); restart(); });
        car.addEventListener('mouseenter', stop);
        car.addEventListener('mouseleave', start);

        /* El zoom ahora solo escala la IMAGEN activa (transform: scale), dentro
           del marco fijo de la diapositiva (que tiene overflow:hidden). El
           bloque/carrusel nunca cambia de tamaño, así que el resto de la
           página no se desajusta. El acercamiento se activa al pasar el
           cursor sobre la imagen; el control y la rueda solo definen el
           nivel de zoom a aplicar mientras el cursor está encima. */
        function resetImages(){
          slidesImgs.forEach(function(img){ if(img) img.style.transform = 'scale(1)'; });
        }
        function applyScale(forceOn){
          var img = slidesImgs[i];
          if(!img) return;
          var on = (forceOn !== undefined) ? forceOn : isHovering;
          img.style.transform = on ? ('scale(' + zoom + ')') : 'scale(1)';
        }
        function setZoom(z, forceOn){
          zoom = Math.min(2.2, Math.max(1, Math.round(z*10)/10));
          range.value = zoom;
          zoomVal.innerHTML = zoom.toFixed(1) + '&times;';
          applyScale(forceOn);
        }

        range.addEventListener('input', function(){
          /* En táctil no hay hover: mover el control aplica el zoom directo. */
          setZoom(parseFloat(range.value), true);
        });
        viewport.addEventListener('mouseenter', function(){
          isHovering = true;
          applyScale();
        });
        viewport.addEventListener('mouseleave', function(){
          isHovering = false;
          resetImages();
        });
        viewport.addEventListener('mousemove', function(e){
          var img = slidesImgs[i];
          if(!img) return;
          var rect = viewport.getBoundingClientRect();
          var x = ((e.clientX - rect.left) / rect.width) * 100;
          var y = ((e.clientY - rect.top) / rect.height) * 100;
          img.style.transformOrigin = x + '% ' + y + '%';
        });
        viewport.addEventListener('wheel', function(e){
          e.preventDefault();
          isHovering = true;
          setZoom(zoom + (e.deltaY < 0 ? 0.15 : -0.15));
        }, { passive:false });

        /* ---- M\u00f3vil / t\u00e1ctil: swipe para cambiar de imagen ---- */
        var sx=0, dx=0, moved=false;
        viewport.addEventListener('touchstart', function(e){
          stop();
          var t = e.touches[0];
          sx = t.clientX; dx = 0; moved = false;
        }, { passive:true });
        viewport.addEventListener('touchmove', function(e){
          var t = e.touches[0];
          dx = t.clientX - sx;
          if(Math.abs(dx) > 10){ moved = true; }
        }, { passive:true });
        viewport.addEventListener('touchend', function(){
          if(moved){
            if(dx < -40){ go(i+1); } else if(dx > 40){ go(i-1); }
          }
          start();
        });

        go(0); start();
      })();

/* ---------- Bloque 2: RESEÑAS (carrusel, filtro, formulario) ---------- */
    (function(){
      var car = document.getElementById('teamCarousel');
      if(!car) return;
      var track = car.querySelector('.team-track');
      var cards = Array.prototype.slice.call(track.children);
      var dotsBox = car.querySelector('.team-dots');
      var i = 0, timer = null, DELAY = 3000;

      function perView(){
        var w = window.innerWidth;
        return w <= 560 ? 1 : (w <= 900 ? 2 : 3);
      }
      function pages(){ return Math.max(1, cards.length - perView() + 1); }

      function buildDots(){
        dotsBox.innerHTML = '';
        for(var k=0; k<pages(); k++){
          (function(k){
            var b = document.createElement('button');
            b.type='button'; b.className='car-dot';
            b.setAttribute('aria-label','Integrantes ' + (k+1));
            b.addEventListener('click', function(){ go(k); restart(); });
            dotsBox.appendChild(b);
          })(k);
        }
      }
      function go(n){
        var p = pages();
        i = ((n % p) + p) % p;
        var gap = parseFloat(getComputedStyle(track).gap) || 24;
        var step = cards[0].getBoundingClientRect().width + gap;
        track.style.transform = 'translateX(' + (-i*step) + 'px)';
        var ds = dotsBox.children;
        for(var k=0;k<ds.length;k++){ ds[k].classList.toggle('on', k===i); }
      }
      function start(){ if(!timer) timer = setInterval(function(){ go(i+1); }, DELAY); }
      function stop(){ clearInterval(timer); timer = null; }
      function restart(){ stop(); start(); }

      car.querySelector('[data-team-prev]').addEventListener('click', function(){ go(i-1); restart(); });
      car.querySelector('[data-team-next]').addEventListener('click', function(){ go(i+1); restart(); });
      car.addEventListener('mouseenter', stop);
      car.addEventListener('mouseleave', start);
      window.addEventListener('resize', function(){ buildDots(); go(i); });

      var vp = car.querySelector('.team-viewport');
      var tsx=0, tdx=0, tmoved=false;
      vp.addEventListener('touchstart', function(e){ stop(); tsx=e.touches[0].clientX; tdx=0; tmoved=false; }, {passive:true});
      vp.addEventListener('touchmove', function(e){ tdx=e.touches[0].clientX - tsx; if(Math.abs(tdx)>10) tmoved=true; }, {passive:true});
      vp.addEventListener('touchend', function(){ if(tmoved){ if(tdx<-40){ go(i+1); } else if(tdx>40){ go(i-1); } } start(); });

      buildDots(); go(0); start();
    })();

/* ---------- Bloque 3: script principal (header, menú, formulario, popups, etc.) ---------- */
/* ============================================================
   HC GROUP — script.js (inline)
   ============================================================
   BLOQUE JS — índice de comportamientos (en el orden en que
   aparecen más abajo, cada uno bajo un comentario separador
   con el nombre del bloque entre guiones):

     Almacenamiento seguro   → wrapper sobre localStorage con respaldo en memoria
     Año en footer           → año actual automático en el copyright
     Conteo animado          → números "+8 / 3" del hero suben desde 0
     Header con sombra       → clase .scrolled al hacer scroll
     Menú móvil              → abrir/cerrar nav lateral + backdrop
     Revelado al hacer scroll→ animación de aparición (IntersectionObserver)
     Banner de cookies       → mostrar/ocultar + guardar preferencia
     Formulario de contacto  → validación + arma un "mailto:" (no hay servidor)
     Enlaces "portal"        → abren el portal externo en pestaña nueva
     Clonar logo             → copia el logo del header a shop-row/menú/catálogo
     Foto real de unidades   → copia una foto del carrusel al popup del boletín
     Menú "solicitar catálogo" → abre/cierra el mini menú correo/WhatsApp
     Enlaces "próximamente"  → aviso flotante para enlaces sin destino aún
     Clonar logos de marcas  → logos de aliados al menú móvil
     Buscador (decorativo)
     Ventana emergente (boletín) → abrir/cerrar + envío simulado
     Burbuja WhatsApp        → mostrar/ocultar el globo de ayuda
     Reseñas                 → carrusel, filtro, formulario de nueva reseña
     Carruseles (equipo / unidades) → autoplay, flechas, puntos, zoom, swipe
   ============================================================ */
(function(){
  "use strict";

  /* --- almacenamiento seguro (degrada si está bloqueado, p.ej. en sandbox) --- */
  var mem = {};
  var store = {
    get: function(k){ try { return localStorage.getItem(k); } catch(e){ return mem[k] || null; } },
    set: function(k,v){ try { localStorage.setItem(k,v); } catch(e){ mem[k]=v; } }
  };

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- AÑO EN FOOTER ---------- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- CONTEO ANIMADO DE ESTADÍSTICAS DEL HERO ---------- */
  var heroCounters = document.querySelectorAll('.hero-chips strong[data-count-target]');
  heroCounters.forEach(function(el){
    var target = parseInt(el.getAttribute('data-count-target'), 10);
    var prefix = el.getAttribute('data-count-prefix') || '';
    if (isNaN(target) || el.getAttribute('data-count-static') === 'true' || reduceMotion){
      el.textContent = prefix + (isNaN(target) ? el.textContent : target);
      return;
    }
    var duration = 900, startTime = null;
    function step(ts){
      if (startTime === null) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      el.textContent = prefix + Math.round(progress * target);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });

  /* ---------- HEADER SOMBRA AL HACER SCROLL ---------- */
  var header = document.getElementById('siteHeader');
  function onScroll(){ if(header) header.classList.toggle('scrolled', window.scrollY > 8); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive:true });

  /* ---------- MENÚ MÓVIL ---------- */
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('primaryNav');
  var navBackdrop = document.getElementById('navBackdrop');
  function closeNav(){ if(!nav) return; nav.classList.remove('open'); if(navBackdrop) navBackdrop.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); toggle.setAttribute('aria-label','Abrir menú'); document.body.style.overflow=''; }
  if (toggle && nav){
    toggle.addEventListener('click', function(){
      var open = nav.classList.toggle('open');
      if(navBackdrop) navBackdrop.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      document.body.style.overflow = open ? 'hidden' : '';   // evita scroll de fondo con el menú abierto
    });
    if (navBackdrop) navBackdrop.addEventListener('click', closeNav);
    nav.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', closeNav); });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeNav(); });
    window.addEventListener('resize', function(){ if(window.innerWidth > 720) closeNav(); });
  }

  /* ---------- REVELADO AL HACER SCROLL ---------- */
  var revealEls = document.querySelectorAll('.unit, .vm-card, .strip-item, .diff-list li, .next-badge, .section-head, .col-body, .commit-inner, .contact-copy, .lead-form');
  if ('IntersectionObserver' in window && !reduceMotion){
    revealEls.forEach(function(el){ el.classList.add('reveal'); });
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold:0.12 });
    revealEls.forEach(function(el){ io.observe(el); });
  }

  /* ---------- BANNER DE COOKIES ---------- */
  var banner = document.getElementById('cookie-banner');
  var waFloat = document.querySelector('.wa-float');
  function adjustWaFloatForBanner(){
    if (waFloat && banner && banner.style.display !== 'none'){
      waFloat.style.bottom = (banner.offsetHeight + 16) + 'px';
    } else if (waFloat){
      waFloat.style.bottom = '';
    }
  }
  if (banner){
    if (!store.get('hc-cookie')) banner.style.display = 'flex';
    adjustWaFloatForBanner();
    window.addEventListener('resize', adjustWaFloatForBanner);
    var accept = document.getElementById('cookie-accept');
    var reject = document.getElementById('cookie-reject');
    if (accept) accept.addEventListener('click', function(){ store.set('hc-cookie','accepted'); banner.style.display='none'; adjustWaFloatForBanner(); });
    if (reject) reject.addEventListener('click', function(){ store.set('hc-cookie','rejected'); banner.style.display='none'; adjustWaFloatForBanner(); });
  }

  /* ---------- FORMULARIO (validación + estado) ---------- */
  var form = document.getElementById('leadForm');
  var status = document.getElementById('formStatus');
  function isEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  if (form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      // Anti-spam: si el campo trampa está lleno, lo envió un bot -> ignorar
      if (form.empresa_web && form.empresa_web.value.trim() !== ''){ return; }
      status.className = 'form-status';
      status.textContent = '';
      var nombre = form.nombre, email = form.email, segmento = form.segmento;
      [nombre, email, segmento].forEach(function(f){ f.classList.remove('invalid'); });

      var ok = true;
      if (!nombre.value.trim()){ nombre.classList.add('invalid'); ok = false; }
      if (!isEmail(email.value.trim())){ email.classList.add('invalid'); ok = false; }
      if (!segmento.value){ segmento.classList.add('invalid'); ok = false; }

      if (!ok){
        status.className = 'form-status error';
        status.textContent = 'Revisa los campos marcados antes de continuar.';
        return;
      }
      var destinatario = 'gerencia@roboticnic.com';
      var telefono = form.telefono, mensaje = form.mensaje;
      var unidadTexto = segmento.options[segmento.selectedIndex].text;
      var asunto = 'Nueva solicitud desde HC GROUP — ' + unidadTexto;
      var cuerpo = 'Nombre: ' + nombre.value.trim() + '\n' +
        'Correo: ' + email.value.trim() + '\n' +
        'Teléfono / WhatsApp: ' + (telefono.value.trim() || 'No proporcionado') + '\n' +
        'Unidad de interés: ' + unidadTexto + '\n' +
        'Mensaje: ' + (mensaje.value.trim() || 'Sin mensaje adicional');
      var mailtoLink = 'mailto:' + destinatario + '?subject=' + encodeURIComponent(asunto) + '&body=' + encodeURIComponent(cuerpo);

      status.className = 'form-status ok';
      status.textContent = '¡Gracias, ' + nombre.value.trim().split(' ')[0] + '! Vamos a abrir tu programa de correo para enviarnos la solicitud a ' + destinatario + '.';
      form.reset();
      setTimeout(function(){ window.location.href = mailtoLink; }, 600);
    });
  }

  /* ---------- ENLACES "PORTAL" (ahora abren el portal de clientes externo en pestaña nueva) ---------- */

  /* ---------- CLONAR LOGO AL SHOP-ROW Y AL MENÚ ---------- */
  var shopLogo = document.getElementById('shopLogo');
  var navLogo = document.getElementById('navLogo');
  var heroCatalogLogo = document.getElementById('heroCatalogLogo');
  var headerLogo = document.querySelector('.site-header .brand img');
  if (shopLogo && headerLogo) shopLogo.src = headerLogo.src;
  if (navLogo && headerLogo) navLogo.src = headerLogo.src;
  if (heroCatalogLogo && headerLogo) heroCatalogLogo.src = headerLogo.src;

  /* ---------- FOTO REAL DE UNIDADES EN EL POPUP DEL NEWSLETTER ---------- */
  var popUnitPhoto = document.getElementById('popUnitPhoto');
  var firstUnitPhoto = document.querySelector('.carousel-slide img');
  if (popUnitPhoto && firstUnitPhoto) popUnitPhoto.src = firstUnitPhoto.src;

  /* ---------- MENÚ "SOLICITAR CATÁLOGO" (correo / WhatsApp) ---------- */
  var catalogReqBtn = document.getElementById('catalogReqBtn');
  var catalogReqMenu = document.getElementById('catalogReqMenu');
  function closeCatalogReq(){
    if (!catalogReqMenu) return;
    catalogReqMenu.classList.remove('open');
    if (catalogReqBtn) catalogReqBtn.setAttribute('aria-expanded', 'false');
  }
  if (catalogReqBtn && catalogReqMenu){
    catalogReqBtn.addEventListener('click', function(e){
      e.stopPropagation();
      var open = catalogReqMenu.classList.toggle('open');
      catalogReqBtn.setAttribute('aria-expanded', String(open));
    });
    catalogReqMenu.addEventListener('click', function(e){
      if (e.target.closest('a')) closeCatalogReq();
    });
    document.addEventListener('click', function(e){
      if (!e.target.closest('.hero-catalog-request')) closeCatalogReq();
    });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape') closeCatalogReq();
    });
  }

  /* ---------- ENLACES "PRÓXIMAMENTE" (sin destino aún, p.ej. redes sociales/noticias) ---------- */
  var soonToast = document.createElement('div');
  soonToast.className = 'soon-toast';
  soonToast.setAttribute('role', 'status');
  soonToast.setAttribute('aria-live', 'polite');
  document.body.appendChild(soonToast);
  var soonTimer;
  function showSoonToast(msg){
    soonToast.textContent = msg;
    soonToast.classList.add('show');
    clearTimeout(soonTimer);
    soonTimer = setTimeout(function(){ soonToast.classList.remove('show'); }, 2600);
  }
  document.querySelectorAll('[data-soon]').forEach(function(a){
    a.addEventListener('click', function(e){
      e.preventDefault();
      showSoonToast('Estamos trabajando en esta sección 🚧');
    });
  });

  /* ---------- CLONAR LOGOS DE MARCAS AL MENÚ MÓVIL ---------- */
  document.querySelectorAll('.nav-partner-logo').forEach(function(img){
    var brand = img.getAttribute('data-brand');
    var source = document.querySelector('.brands-list .brand-chip[data-brand="' + brand + '"] img');
    if (source) img.src = source.src;
  });

  /* ---------- BUSCADOR (decorativo) ---------- */
  var shopSearch = document.getElementById('shopSearch');
  if (shopSearch){
    shopSearch.addEventListener('submit', function(e){
      e.preventDefault();
      var c = document.getElementById('contacto');
      if (c) c.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- VENTANA EMERGENTE (BOLETÍN) ---------- */
  var pop = document.getElementById('newsletterPop');
  var popClose = document.getElementById('popClose');
  var popForm = document.getElementById('popForm');
  var popMsg = document.getElementById('popMsg');
  function openPop(){ if(pop){ pop.classList.add('open'); pop.setAttribute('aria-hidden','false'); } }
  function closePop(){ if(pop){ pop.classList.remove('open'); pop.setAttribute('aria-hidden','true'); } }
  if (pop && !store.get('hc-newsletter')){
    setTimeout(openPop, 1500);
  }
  if (popClose) popClose.addEventListener('click', function(){ store.set('hc-newsletter','closed'); closePop(); });
  if (pop) pop.addEventListener('click', function(e){ if(e.target === pop){ store.set('hc-newsletter','closed'); closePop(); } });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape' && pop && pop.classList.contains('open')){ store.set('hc-newsletter','closed'); closePop(); } });
  if (popForm){
    popForm.addEventListener('submit', function(e){
      e.preventDefault();
      var email = popForm.email.value.trim();
      if (!isEmail(email)){ popMsg.style.color = '#ffd9d9'; popMsg.textContent = 'Escribe un correo válido.'; return; }
      popMsg.style.color = '#fff';
      popMsg.textContent = '¡Gracias! Te mantendremos al tanto.';
      store.set('hc-newsletter','subscribed');
      popForm.reset();
      setTimeout(closePop, 1400);
    });
  }

  /* ---------- BURBUJA WHATSAPP ---------- */
  var waBubbleClose = document.getElementById('waBubbleClose');
  var waBubble = document.getElementById('waBubble');
  if (waBubbleClose && waBubble){
    waBubbleClose.addEventListener('click', function(e){ e.preventDefault(); waBubble.style.display = 'none'; });
  }

  /* ---------- RESEÑAS ---------- */
  var reviewList = document.getElementById('reviewList');
  var reviews = (function(){
    var saved = store.get('hc-reviews');
    if (saved){
      try { var parsed = JSON.parse(saved); if (Array.isArray(parsed) && parsed.length) return parsed; } catch(e){}
    }
    return [
    {
      name: 'Marlene G.', verified: true, date: '3/2/2026', rating: 5,
      text: 'Excelente atención desde la primera llamada hasta la entrega. El equipo llegó completo, bien embalado y con todos los documentos en regla.',
      reply: '¡Muchas gracias, Marlene! Nos alegra muchísimo saber que todo el proceso, desde el primer contacto hasta la entrega, cumplió con tus expectativas.'
    },
    {
      name: 'Carlos M.', verified: true, date: '18/1/2026', rating: 5,
      text: 'El soporte técnico fue muy rápido resolviendo una duda de instalación. Se nota que conocen bien los equipos que venden.',
      reply: '¡Gracias, Carlos! Para nosotros es muy importante que el acompañamiento no termine en la entrega, así que valoramos mucho tu comentario.'
    },
    {
      name: 'Fernanda R.', verified: true, date: '22/12/2025', rating: 4,
      text: 'Buena variedad de equipos y precios competitivos. El tiempo de entrega fue un poco más largo de lo esperado, pero el resultado valió la pena.',
      reply: 'Gracias por tu honestidad, Fernanda. Estamos trabajando para optimizar nuestros tiempos de entrega y seguir mejorando la experiencia de compra.'
    }
    ];
  })();
  function saveReviews(){ try { store.set('hc-reviews', JSON.stringify(reviews)); } catch(e){} }

  function starSvg(on){
    return '<svg viewBox="0 0 24 24" class="' + (on ? 'star-on' : 'star-off') + '"><path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.1 20.9l1.1-6.5L2.5 9.8l6.5-.9z"/></svg>';
  }
  function starsRow(rating){
    var s = '';
    for (var i=1;i<=5;i++) s += starSvg(i<=rating);
    return s;
  }
  function esc(str){ var d=document.createElement('div'); d.textContent=str; return d.innerHTML; }
  function renderReviews(){
    if (!reviewList) return;
    reviewList.innerHTML = reviews.map(function(r){
      var initial = (r.name || 'A')[0].toUpperCase();
      var avatar = '<div class="rc-avatar">' + initial + '</div>';
      var reply = r.reply ? (
        '<div class="rc-reply">' +
          '<div class="rc-reply-icon"><svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg></div>' +
          '<div class="rc-reply-body"><strong>HC GROUP</strong><p>' + esc(r.reply) + '</p></div>' +
        '</div>'
      ) : '';
      var verified = r.verified ? (
        '<span class="rc-verified"><svg viewBox="0 0 24 24"><path d="M12 2l2.4 2.1 3.1-.5 1 3 2.9 1.3-1 3 1 3-2.9 1.3-1 3-3.1-.5L12 22l-2.4-2.1-3.1.5-1-3L2.6 15.5l1-3-1-3 2.9-1.3 1-3 3.1.5z" fill="currentColor" stroke="none"/><path d="M8.5 12l2.2 2.2 4.3-4.3" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>Verificada</span>'
      ) : '';
      return '<article class="review-card">' +
        '<div class="rc-quote-mark">&#8220;</div>' +
        '<div class="rc-stars">' + starsRow(r.rating) + '</div>' +
        '<p class="rc-text">' + esc(r.text) + '</p>' +
        '<div class="rc-author">' + avatar +
          '<div class="rc-meta">' +
            '<div class="rc-name-row"><span class="rc-name">' + esc(r.name) + '</span>' + verified + '</div>' +
            '<div class="rc-date">' + esc(r.date) + '</div>' +
          '</div>' +
        '</div>' +
        reply +
      '</article>';
    }).join('');

    // resumen: promedio + conteo
    var avg = Math.round(reviews.reduce(function(a,r){ return a + r.rating; }, 0) / reviews.length);
    var avgStars = document.getElementById('avgStars');
    var countBtn = document.getElementById('reviewsCount');
    if (avgStars) avgStars.innerHTML = starsRow(avg);
    if (countBtn) countBtn.textContent = reviews.length + (reviews.length === 1 ? ' Reseña ▾' : ' Reseñas ▾');
  }
  renderReviews();

  /* ---------- CARRUSEL DE RESEÑAS (una reseña a la vez) ---------- */
  var rvCarousel = document.getElementById('reviewsCarousel');
  var rvDotsWrap = document.getElementById('reviewDots');
  var rvIndex = 0;
  function rvSlides(){ return reviewList ? reviewList.querySelectorAll('.review-card') : []; }
  function rvBuildDots(){
    if (!rvDotsWrap) return;
    rvDotsWrap.innerHTML = '';
    rvSlides().forEach(function(_, k){
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'car-dot';
      b.setAttribute('aria-label', 'Ver reseña ' + (k+1));
      b.addEventListener('click', function(){ rvGo(k); });
      rvDotsWrap.appendChild(b);
    });
  }
  function rvGo(n){
    var s = rvSlides();
    if (!s.length || !reviewList) return;
    rvIndex = (n + s.length) % s.length;
    reviewList.style.transform = 'translateX(' + (-rvIndex*100) + '%)';
    if (rvDotsWrap) rvDotsWrap.querySelectorAll('button').forEach(function(d,k){ d.classList.toggle('on', k === rvIndex); });
  }
  if (rvCarousel){
    var rvPrev = rvCarousel.querySelector('[data-rv-prev]');
    var rvNext = rvCarousel.querySelector('[data-rv-next]');
    if (rvPrev) rvPrev.addEventListener('click', function(){ rvGo(rvIndex-1); });
    if (rvNext) rvNext.addEventListener('click', function(){ rvGo(rvIndex+1); });
  }
  rvBuildDots(); rvGo(0);

  // Selector de estrellas del formulario
  var pickedRating = 5;
  var starPick = document.getElementById('rvStarPick');
  function paintPick(){
    if (!starPick) return;
    starPick.querySelectorAll('svg').forEach(function(svg, i){
      svg.setAttribute('class', (i+1) <= pickedRating ? 'star-on' : 'star-off');
    });
  }
  if (starPick){
    for (var i=1;i<=5;i++){
      (function(val){
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', val + ' de 5');
        b.innerHTML = '<svg viewBox="0 0 24 24" class="star-on"><path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.1 20.9l1.1-6.5L2.5 9.8l6.5-.9z"/></svg>';
        b.addEventListener('click', function(){ pickedRating = val; paintPick(); });
        starPick.appendChild(b);
      })(i);
    }
    paintPick();
  }

  // Abrir/cerrar formulario
  var reviewForm = document.getElementById('reviewForm');
  var openReviewForm = document.getElementById('openReviewForm');
  var cancelReview = document.getElementById('cancelReview');
  if (openReviewForm && reviewForm){
    openReviewForm.addEventListener('click', function(){
      reviewForm.classList.toggle('open');
      if (reviewForm.classList.contains('open')){
        var n = document.getElementById('rvName');
        if (n) setTimeout(function(){ n.focus(); }, 100);
      }
    });
  }
  if (cancelReview && reviewForm){
    cancelReview.addEventListener('click', function(){ reviewForm.classList.remove('open'); });
  }

  // Enviar nueva reseña
  if (reviewForm){
    reviewForm.addEventListener('submit', function(e){
      e.preventDefault();
      var name = document.getElementById('rvName').value.trim();
      var text = document.getElementById('rvText').value.trim();
      if (!name || !text) return;
      var now = new Date();
      var fecha = now.getDate() + '/' + (now.getMonth()+1) + '/' + now.getFullYear();
      reviews.unshift({ name: name, verified: true, date: fecha, rating: pickedRating, text: text, reply: null });
      saveReviews();
      renderReviews();
      rvBuildDots(); rvGo(0);
      reviewForm.reset();
      pickedRating = 5; paintPick();
      reviewForm.classList.remove('open');
    });
  }
})();