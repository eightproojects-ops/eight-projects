/* EIGHT PROJECTS — interactions */
(() => {
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const lerp = (a,b,t) => a + (b-a)*t;
  const clamp = (v,a,b) => Math.max(a, Math.min(b, v));

  /* ---------- custom cursor ---------- */
  const dot = document.createElement('div'); dot.className = 'cursor-dot';
  const ring = document.createElement('div'); ring.className = 'cursor-ring';
  document.body.appendChild(dot); document.body.appendChild(ring);

  let rx = 0, ry = 0, mx = 0, my = 0;
  let raf;
  window.addEventListener('pointermove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx - 3}px, ${my - 3}px)`;
    if (!raf) raf = requestAnimationFrame(loop);
  });
  function loop(){
    rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
    ring.style.transform = `translate(${rx - 16}px, ${ry - 16}px)`;
    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);

  function bindMagnet(el){
    el.addEventListener('pointerenter', () => ring.classList.add('is-mag'));
    el.addEventListener('pointerleave', () => { ring.classList.remove('is-mag'); el.style.transform = ''; });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width/2)) * 0.18;
      const dy = (e.clientY - (r.top + r.height/2)) * 0.18;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    });
  }
  $$('a, button, .svc-card, .wk__row, .proj-cta, .contact__chip').forEach((el) => {
    el.addEventListener('pointerenter', () => ring.classList.add('is-mag'));
    el.addEventListener('pointerleave', () => ring.classList.remove('is-mag'));
  });
  $$('.magnet').forEach(bindMagnet);

  /* ---------- loader ---------- */
  const loader = $('.loader');
  if (loader){
    const count = $('.loader__count');
    let pct = 0;
    const start = performance.now();
    function tick(now){
      const elapsed = now - start;
      const target = Math.min(100, (elapsed / 2400) * 100);
      pct += (target - pct) * 0.15;
      count.textContent = String(Math.floor(pct)).padStart(3, '0') + '%';
      const bar = $('.loader__bar'); if (bar) bar.style.width = pct + '%';
      if (pct < 99.5){ requestAnimationFrame(tick); }
      else{
        count.textContent = '100%';
        setTimeout(() => {
          loader.classList.add('is-done');
          document.body.classList.add('is-ready');
          window.dispatchEvent(new Event('site:ready'));
        }, 600);
      }
    }
    requestAnimationFrame(tick);
  } else {
    document.body.classList.add('is-ready');
  }

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting){ e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '-10% 0px -10% 0px', threshold: 0.01 });
  $$('.reveal, .reveal-stagger').forEach((el) => io.observe(el));

  /* ---------- HERO horizontal parallax on scroll ---------- */
  const hero = $('.hero');
  const heroLines = $$('.hero__line');
  if (hero){
    function onHero(){
      const r = hero.getBoundingClientRect();
      const h = window.innerHeight;
      const p = clamp(-r.top / h, 0, 1.2);
      heroLines.forEach((line, i) => {
        const dir = (i === 0) ? -1 : 1;
        const tx = dir * p * 260;
        const sc = 1 - p * 0.06;
        const op = 1 - clamp(p, 0, 1) * 0.55;
        line.style.transform = `translate3d(${tx}px, ${p * -20}px, 0) scale(${sc})`;
        line.style.opacity = String(op);
      });
    }
    window.addEventListener('scroll', onHero, { passive: true });
    window.addEventListener('resize', onHero);
    onHero();
  }

  /* ---------- VISION: 8 stages — keep only the two circles, morph them ---------- */
  const vision = $('.vision');
  if (vision){
    const stage = $('#vision-stage');
    const stepEl = $('#vision-step');
    const hEl = $('#vision-h');
    const pEl = $('#vision-p');
    const pips = $$('#vision-pips .pip');

    const STAGES = [
      { title: 'Le chiffre.',
        p: 'Notre nom est un chiffre. Deux cercles qui se touchent, qui s\u2019équilibrent. Un départ simple — lisible à deux mètres, signable au tampon, gravable dans le métal.' },
      { title: 'Fusion.',
        p: 'On s\u2019assoit. On parle. On s\u2019écoute. Et à un moment précis, les deux cercles se rejoignent — votre projet devient le nôtre, le nôtre devient le vôtre.' },
      { title: 'L\u2019infini.',
        p: 'Une fois réunis, on bascule à l\u2019horizontale. Le huit devient lemniscate — un cycle ouvert, qui revient à lui-même, transformé à chaque itération.' },
      { title: 'L\u2019équilibre.',
        p: 'De cette union naît un équilibre. On redevient distincts, mais alignés — chacun garde sa voix, le travail garde sa cohérence.' },
      { title: 'Collaboration.',
        p: 'Un pont s\u2019installe. Pas une absorption, pas une délégation — un échange continu, où chaque retour resserre la cible.' },
      { title: 'Vision.',
        p: 'Le pont, les cercles : déjà des lunettes. Notre rôle, ajuster le foyer — pour que la marque soit lue exactement comme vous la voyez.' },
      { title: 'Boucle.',
        p: 'Pas de ligne droite. On revient, on affine, on documente. Les deux cercles tournent autour d\u2019un même centre — chaque tour resserre la cible.' },
      { title: 'Résultats.',
        p: 'À la fin : la boule rentre. Net, décisif, propre. Reconnaissance, presse, conversion, archive — la beauté oui, mais qui marque le coup.' },
    ];

    const NS = 'http://www.w3.org/2000/svg';
    const mk = (tag, attrs={}) => {
      const el = document.createElementNS(NS, tag);
      for (const k in attrs) el.setAttribute(k, attrs[k]);
      return el;
    };

    const svg = mk('svg', { viewBox: '0 0 480 480' });
    svg.classList.add('vision__svg');

    // graduation ticks around the SVG
    const marksG = mk('g', { opacity: '0.16' });
    for (let i = 0; i < 24; i++){
      const a = (i / 24) * Math.PI * 2;
      marksG.appendChild(mk('line', {
        x1: 240 + Math.cos(a)*220, y1: 240 + Math.sin(a)*220,
        x2: 240 + Math.cos(a)*230, y2: 240 + Math.sin(a)*230,
        stroke: '#f6f2ea', 'stroke-width': '1'
      }));
    }
    svg.appendChild(marksG);

    // motion trail (Résultats)
    const trail = mk('line', {
      x1: 140, y1: 240, x2: 140, y2: 240,
      stroke: '#d8d0bd', 'stroke-width': '1.4',
      'stroke-dasharray': '2 7', opacity: '0'
    });
    svg.appendChild(trail);

    // vesica lens — for L'équilibre
    const lens = mk('path', {
      fill: '#d8d0bd', 'fill-opacity': '0.22',
      stroke: '#d8d0bd', 'stroke-width': '1', opacity: '0'
    });
    svg.appendChild(lens);

    // the two main circles — protagonists for all 7 stages
    const c1 = mk('circle', { cx: 240, cy: 160, r: 80, fill: 'none', stroke: '#f6f2ea', 'stroke-width': '1.6' });
    const c2 = mk('circle', { cx: 240, cy: 320, r: 80, fill: 'none', stroke: '#f6f2ea', 'stroke-width': '1.6' });
    svg.appendChild(c1); svg.appendChild(c2);

    // bridge between circles + two exchange dots (Collaboration / Vision)
    const bridge = mk('line', { stroke: '#d8d0bd', 'stroke-width': '1.6', opacity: '0' });
    const bridgeDotA = mk('circle', { r: 4, fill: '#d8d0bd', opacity: '0' });
    const bridgeDotB = mk('circle', { r: 4, fill: '#d8d0bd', opacity: '0' });
    svg.appendChild(bridge); svg.appendChild(bridgeDotA); svg.appendChild(bridgeDotB);

    // 8 décoration — même vocabulaire que le reste du SVG (traits fins, pas de gradients)
    const ballRing = mk('circle', { fill: 'none', stroke: 'rgba(246,242,234,0.35)', 'stroke-width': '1', opacity: '0' });
    const ballShine = mk('path', { fill: 'none', stroke: 'rgba(246,242,234,0.18)', 'stroke-width': '1', 'stroke-linecap': 'round', opacity: '0' });
    const ballText = mk('text', {
      'text-anchor': 'middle', 'dominant-baseline': 'central',
      fill: '#f6f2ea', 'font-family': 'Montserrat, sans-serif',
      'font-weight': '200', opacity: '0'
    });
    ballText.textContent = '8';
    svg.appendChild(ballRing); svg.appendChild(ballShine); svg.appendChild(ballText);

    // blackout — envahit tout quand la boule rentre
    const blackout = mk('rect', { x: '0', y: '0', width: '480', height: '480', fill: '#0a0a0a', opacity: '0', 'pointer-events': 'none' });
    svg.appendChild(blackout);

    stage.appendChild(svg);

    let lastIdx = -1;
    function setStageContent(idx){
      if (idx === lastIdx) return;
      lastIdx = idx;
      stepEl.textContent = String(idx + 1).padStart(2, '0');
      hEl.textContent = STAGES[idx].title;
      pEl.textContent = STAGES[idx].p;
      pips.forEach((pip, i) => {
        pip.classList.toggle('is-on', i === idx);
        pip.classList.toggle('is-past', i < idx);
      });
    }

    function setProgress(p){
      const v = clamp(p, 0, 7);

      // defaults — vertical 8 (stage 0)
      let c1x = 240, c1y = 160, c1r = 80;
      let c2x = 240, c2y = 320, c2r = 80;
      let c1Fill = 'none', c1Stroke = '#f6f2ea', c1Op = 1;
      let c2Fill = 'none', c2Stroke = '#f6f2ea', c2Op = 1;
      let lensOp = 0;
      let bridgeOp = 0, bridgeDotsOp = 0, bridgeOffset = 0;
      let ballOp = 0;
      let trailOp = 0;
      blackout.setAttribute('opacity', '0');

      if (v <= 1){
        // 0 → 1 : Le chiffre → Fusion (les deux cercles se rejoignent en un seul)
        const k = v;
        c1x = 240; c1y = lerp(160, 240, k);
        c2x = 240; c2y = lerp(320, 240, k);
        c1r = lerp(80, 100, k); c2r = lerp(80, 100, k);
      } else if (v <= 2){
        // 1 → 2 : Fusion → L'infini (le cercle unique s'ouvre horizontalement, contact)
        const k = v - 1;
        c1x = lerp(240, 160, k); c1y = 240;
        c2x = lerp(240, 320, k); c2y = 240;
        c1r = lerp(100, 80, k); c2r = lerp(100, 80, k);
      } else if (v <= 3){
        // 2 → 3 : L'infini → Équilibre (rapprochement, lens apparaît)
        const k = v - 2;
        c1x = lerp(160, 195, k); c1y = 240;
        c2x = lerp(320, 285, k); c2y = 240;
        c1r = 80; c2r = 80;
        lensOp = k;
      } else if (v <= 4){
        // 3 → 4 : Équilibre → Collaboration (écartement + pont + dots)
        const k = v - 3;
        c1x = lerp(195, 140, k); c1y = 240;
        c2x = lerp(285, 340, k); c2y = 240;
        c1r = 80; c2r = 80;
        lensOp = Math.max(0, 1 - k * 1.6);
        bridgeOp = k;
        bridgeDotsOp = k;
        bridgeOffset = lerp(0, 40, k);
      } else if (v <= 5){
        // 4 → 5 : Collaboration → Vision (lunettes raffinées)
        const k = v - 4;
        c1x = 140; c1y = 240; c1r = lerp(80, 70, k);
        c2x = 340; c2y = 240; c2r = lerp(80, 70, k);
        bridgeOp = 1;
        bridgeDotsOp = (1 - k);
        bridgeOffset = lerp(40, 100, k);
      } else if (v <= 6){
        // 5 → 6 : Vision → Boucle (orbite autour du centre)
        const k = v - 5;
        const ang = k * Math.PI * 2;
        const orbR = 100;
        c1x = 240 + Math.cos(Math.PI + ang) * orbR;
        c1y = 240 + Math.sin(Math.PI + ang) * orbR;
        c2x = 240 + Math.cos(ang) * orbR;
        c2y = 240 + Math.sin(ang) * orbR;
        c1r = 70; c2r = 70;
        bridgeOp = Math.max(0, 1 - k * 1.4);
      } else {
        // 6 → 7 : Boucle → Résultats (c1 devient 8-ball, roule dans c2 = poche)
        const k = v - 6;

        const fillK = Math.min(1, k * 1.6);
        c2x = 340; c2y = 240; c2r = lerp(70, 84, fillK);
        c2Fill = `rgba(4,4,4,${fillK.toFixed(3)})`;
        c2Stroke = `rgba(40,40,40,${(1 - fillK * 0.8).toFixed(3)})`;

        c1y = 240; c1r = 70;
        c1Fill = `rgba(8,8,8,${fillK.toFixed(3)})`;
        c1Stroke = `rgba(246,242,234,${(fillK * 0.45).toFixed(3)})`;

        const morphT = clamp(k / 0.20, 0, 1);
        const rollT  = clamp((k - 0.20) / 0.60, 0, 1);
        const dropT  = clamp((k - 0.80) / 0.20, 0, 1);
        const rollEase = 1 - Math.pow(1 - rollT, 2);

        c1x = lerp(140, 340, rollEase);
        c1r = lerp(70, 8, dropT);
        c1Op = lerp(1, 0, dropT);

        ballOp = morphT * (1 - dropT * 0.6);
        trailOp = rollT * (1 - dropT);
        // blackout commence dès que la balle commence à tomber
        const blackoutT = clamp((k - 0.75) / 0.25, 0, 1);
        blackout.setAttribute('opacity', (blackoutT * blackoutT).toFixed(3));
        svg.style.filter = blackoutT > 0.01 ? 'none' : '';
      }

      // --- apply ---
      c1.setAttribute('cx', c1x.toFixed(2)); c1.setAttribute('cy', c1y.toFixed(2)); c1.setAttribute('r', c1r.toFixed(2));
      c1.setAttribute('fill', c1Fill); c1.setAttribute('stroke', c1Stroke);
      c1.setAttribute('opacity', c1Op.toFixed(3));

      c2.setAttribute('cx', c2x.toFixed(2)); c2.setAttribute('cy', c2y.toFixed(2)); c2.setAttribute('r', c2r.toFixed(2));
      c2.setAttribute('fill', c2Fill); c2.setAttribute('stroke', c2Stroke);
      c2.setAttribute('opacity', c2Op.toFixed(3));

      // Lens (vesica between c1 and c2)
      const ddx = c2x - c1x, ddy = c2y - c1y;
      const dist = Math.hypot(ddx, ddy);
      if (lensOp > 0 && dist < c1r + c2r && Math.abs(c1r - c2r) < 1 && dist > 1){
        const r = c1r;
        const h = Math.sqrt(Math.max(0, r*r - (dist/2)*(dist/2)));
        const midX = (c1x + c2x)/2, midY = (c1y + c2y)/2;
        const perpX = -ddy / dist, perpY = ddx / dist;
        const p1x = midX + perpX * h, p1y = midY + perpY * h;
        const p2x = midX - perpX * h, p2y = midY - perpY * h;
        lens.setAttribute('d', `M ${p1x.toFixed(2)} ${p1y.toFixed(2)} A ${r} ${r} 0 0 1 ${p2x.toFixed(2)} ${p2y.toFixed(2)} A ${r} ${r} 0 0 1 ${p1x.toFixed(2)} ${p1y.toFixed(2)} Z`);
      }
      lens.setAttribute('opacity', lensOp.toFixed(3));

      // Bridge between inner edges of c1 and c2
      if (bridgeOp > 0.001 && dist > 1){
        const dir = Math.atan2(ddy, ddx);
        const bx1 = c1x + Math.cos(dir) * c1r;
        const by1 = c1y + Math.sin(dir) * c1r;
        const bx2 = c2x - Math.cos(dir) * c2r;
        const by2 = c2y - Math.sin(dir) * c2r;
        bridge.setAttribute('x1', bx1.toFixed(2)); bridge.setAttribute('y1', by1.toFixed(2));
        bridge.setAttribute('x2', bx2.toFixed(2)); bridge.setAttribute('y2', by2.toFixed(2));
        bridge.setAttribute('opacity', bridgeOp.toFixed(3));

        const bdLen = Math.hypot(bx2 - bx1, by2 - by1) || 1;
        const bdT = clamp(bridgeOffset / Math.max(bdLen, 30), 0, 1);
        bridgeDotA.setAttribute('cx', lerp(bx1, bx2, bdT).toFixed(2)); bridgeDotA.setAttribute('cy', lerp(by1, by2, bdT).toFixed(2));
        bridgeDotB.setAttribute('cx', lerp(bx1, bx2, 1 - bdT).toFixed(2)); bridgeDotB.setAttribute('cy', lerp(by1, by2, 1 - bdT).toFixed(2));
        bridgeDotA.setAttribute('opacity', bridgeDotsOp.toFixed(3));
        bridgeDotB.setAttribute('opacity', bridgeDotsOp.toFixed(3));
      } else {
        bridge.setAttribute('opacity', '0');
        bridgeDotA.setAttribute('opacity', '0');
        bridgeDotB.setAttribute('opacity', '0');
      }

      // 8 décoration — vocabulaire site (traits fins, paper/bone, zéro gradient)
      const ballEff = ballOp * c1Op;
      // anneau intérieur (cercle outline, même style que les autres cercles du SVG)
      ballRing.setAttribute('cx', c1x.toFixed(2)); ballRing.setAttribute('cy', c1y.toFixed(2));
      ballRing.setAttribute('r', (c1r * 0.44).toFixed(2));
      ballRing.setAttribute('opacity', ballEff.toFixed(3));
      // "8" — Montserrat 200, paper color
      ballText.setAttribute('x', c1x.toFixed(2)); ballText.setAttribute('y', c1y.toFixed(2));
      ballText.setAttribute('font-size', (c1r * 0.52).toFixed(2));
      ballText.setAttribute('opacity', ballEff.toFixed(3));
      // arc de brillance top (même style que les traits du SVG)
      if (ballEff > 0.01){
        const a1 = -Math.PI * 0.72, a2 = -Math.PI * 0.28;
        const sx = c1x + Math.cos(a1)*c1r*0.78, sy = c1y + Math.sin(a1)*c1r*0.78;
        const ex = c1x + Math.cos(a2)*c1r*0.78, ey = c1y + Math.sin(a2)*c1r*0.78;
        const ar = (c1r * 0.78).toFixed(2);
        ballShine.setAttribute('d', `M ${sx.toFixed(2)} ${sy.toFixed(2)} A ${ar} ${ar} 0 0 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`);
        ballShine.setAttribute('opacity', (ballEff * 0.6).toFixed(3));
      } else { ballShine.setAttribute('opacity', '0'); }

      // Trail (only during Résultats roll)
      if (trailOp > 0.001){
        trail.setAttribute('x1', '140'); trail.setAttribute('y1', '240');
        trail.setAttribute('x2', (c1x - (c1x - 140) * 0.12).toFixed(2));
        trail.setAttribute('y2', c1y.toFixed(2));
        trail.setAttribute('opacity', (trailOp * 0.55).toFixed(3));
      } else {
        trail.setAttribute('opacity', '0');
      }

      const activeIdx = clamp(Math.round(v), 0, 7);
      setStageContent(activeIdx);
    }

    function onScroll(){
      const r = vision.getBoundingClientRect();
      const total = vision.offsetHeight - window.innerHeight;
      const scrolled = clamp(-r.top, 0, total);
      const p = (scrolled / total) * 7;
      setProgress(p);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    setProgress(0);
    onScroll();
  }

  /* ---------- contact chip toggles ---------- */
  $$('.contact__chip').forEach((c) => {
    c.addEventListener('click', () => c.classList.toggle('is-on'));
  });

  /* ---------- year ---------- */
  $$('[data-year]').forEach((el) => el.textContent = new Date().getFullYear());

  /* ---------- services carousel ---------- */
  const carousel = $('#svc-carousel');
  if (carousel){
    const cards = $$('.svc-card', carousel);
    const prev = $('#svc-prev');
    const next = $('#svc-next');
    const counter = $('#svc-cur');
    const progress = $('#svc-progress');

    function cardWidth(){
      if (cards.length < 2) return cards[0]?.offsetWidth || 400;
      return cards[1].getBoundingClientRect().left - cards[0].getBoundingClientRect().left;
    }
    function activeIndex(){
      const w = cardWidth();
      return Math.round(carousel.scrollLeft / w);
    }
    function update(){
      const i = activeIndex();
      const max = cards.length - 1;
      const clamped = Math.max(0, Math.min(max, i));
      counter.textContent = String(clamped + 1).padStart(2, '0');
      const pct = max === 0 ? 100 : (clamped / max) * 100;
      progress.style.width = pct + '%';
      prev.disabled = clamped === 0;
      next.disabled = clamped === max;
    }
    function goTo(i){
      const w = cardWidth();
      carousel.scrollTo({ left: i * w, behavior: 'smooth' });
    }
    prev.addEventListener('click', () => goTo(Math.max(0, activeIndex() - 1)));
    next.addEventListener('click', () => goTo(Math.min(cards.length - 1, activeIndex() + 1)));
    carousel.addEventListener('scroll', () => { window.requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', update);

    let isDown = false, startX = 0, startScroll = 0;
    carousel.addEventListener('pointerdown', (e) => {
      isDown = true;
      startX = e.clientX; startScroll = carousel.scrollLeft;
      carousel.classList.add('is-dragging');
      try { carousel.setPointerCapture(e.pointerId); } catch(_){}
    });
    carousel.addEventListener('pointermove', (e) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      carousel.scrollLeft = startScroll - dx;
    });
    function endDrag(e){
      if (!isDown) return;
      isDown = false;
      carousel.classList.remove('is-dragging');
      try { carousel.releasePointerCapture(e.pointerId); } catch(_){}
      const w = cardWidth();
      const i = Math.round(carousel.scrollLeft / w);
      goTo(Math.max(0, Math.min(cards.length - 1, i)));
    }
    carousel.addEventListener('pointerup', endDrag);
    carousel.addEventListener('pointercancel', endDrag);

    carousel.tabIndex = 0;
    carousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight'){ goTo(Math.min(cards.length-1, activeIndex()+1)); e.preventDefault(); }
      if (e.key === 'ArrowLeft'){ goTo(Math.max(0, activeIndex()-1)); e.preventDefault(); }
    });

    update();
  }

  /* ---------- WORDMARK: scroll-driven melt ---------- */
  const wordmark = $('.wordmark');
  const wordmarkStage = $('#wordmark-stage');
  if (wordmark && wordmarkStage){
    function onWm(){
      const r = wordmark.getBoundingClientRect();
      const h = window.innerHeight;
      // p: 0 when section bottom is just entering, 1 when section top has reached 25% from top
      const start = r.top - h * 0.85;   // negative when entering
      const span = h * 0.85;
      const p = clamp(-start / span, 0, 1);
      // eased
      const e = p < .5 ? 2*p*p : 1 - Math.pow(-2*p+2, 2)/2;
      wordmarkStage.style.setProperty('--p', e.toFixed(4));
    }
    window.addEventListener('scroll', onWm, { passive: true });
    window.addEventListener('resize', onWm);
    onWm();
  }

  /* ---------- clock ---------- */
  function tickClock(){
    const tz = 'Europe/Paris';
    const now = new Date();
    const fmt = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', second:'2-digit', timeZone: tz });
    $$('[data-clock]').forEach((el) => el.textContent = fmt.format(now) + ' \u00b7 PARIS');
  }
  setInterval(tickClock, 1000); tickClock();

})();
