/* EIGHT PROJECTS — advanced scroll animations */
(() => {
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ---- 1. SPLIT TEXT ---- */
  // Split [data-split] elements into word spans for staggered reveal
  function splitText() {
    document.querySelectorAll('[data-split]').forEach(el => {
      const html = el.innerHTML;
      // Split by words but preserve HTML tags and <br/>
      const parts = html.split(/(<[^>]+>|\s+)/g);
      el.innerHTML = parts.map(part => {
        if (!part.trim() || part.startsWith('<')) return part;
        return `<span class="sw" style="display:inline-block;overflow:hidden;vertical-align:bottom;padding-bottom:0.22em;margin-bottom:-0.22em"><span class="sw__inner" style="display:inline-block;transform:translateY(115%);transition:transform 0.95s cubic-bezier(0.16,1,0.3,1)">${part}</span></span>`;
      }).join('');
      el.style.overflow = 'visible';
    });

    const splitIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const words = entry.target.querySelectorAll('.sw__inner');
        words.forEach((w, i) => {
          setTimeout(() => {
            w.style.transform = 'translateY(0)';
            w.style.opacity = '1';
          }, i * 55);
        });
        splitIO.unobserve(entry.target);
      });
    }, { rootMargin: '-5% 0px -5% 0px', threshold: 0.1 });

    document.querySelectorAll('[data-split]').forEach(el => splitIO.observe(el));
  }

  /* ---- 2. COUNTER ANIMATION ---- */
  function setupCounters() {
    const counterIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = el.dataset.count;
        if (target === '∞') return;
        const num = parseInt(target);
        const duration = 1800;
        const start = performance.now();
        function update(now) {
          const p = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          el.textContent = String(Math.round(ease * num));
          if (p < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
        counterIO.unobserve(el);
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('[data-count]').forEach(el => counterIO.observe(el));
  }

  /* ---- 3. PARALLAX MULTI-LAYER ---- */
  function setupParallax() {
    const sections = document.querySelectorAll('.section, .manifesto, .testimonials');

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const center = rect.top + rect.height / 2 - window.innerHeight / 2;
        // Subtle parallax on section backgrounds
        const offset = center * 0.04;
        section.style.backgroundPositionY = `calc(50% + ${offset}px)`;
      });
    }, { passive: true });
  }

  /* ---- 4. SKEW ON SCROLL ---- */
  function setupSkew() {
    let lastScroll = 0;
    let currentSkew = 0;
    let targetSkew = 0;
    // Apply skew to section wrappers only — not to headings (conflicts with split text)
    const skewTargets = document.querySelectorAll('.marquee-track, .wordmark__mark');

    function onScroll() {
      const scroll = window.scrollY;
      const delta = scroll - lastScroll;
      lastScroll = scroll;
      targetSkew = clamp(delta * -0.025, -0.8, 0.8);
    }

    function animateSkew() {
      currentSkew = lerp(currentSkew, targetSkew, 0.08);
      targetSkew = lerp(targetSkew, 0, 0.12);
      if (Math.abs(currentSkew) > 0.001) {
        skewTargets.forEach(el => {
          el.style.transform = `skewX(${currentSkew.toFixed(3)}deg)`;
        });
      }
      requestAnimationFrame(animateSkew);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    animateSkew();
  }

  /* ---- 5. SECTION ENTRANCE — scale + fade from bottom ---- */
  function setupSectionEntrance() {
    const entranceIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const el = entry.target;
        if (entry.isIntersecting) {
          el.style.transition = 'opacity 1.2s cubic-bezier(0.2,0.7,0.2,1), transform 1.2s cubic-bezier(0.2,0.7,0.2,1)';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0) scale(1)';
          entranceIO.unobserve(el);
        }
      });
    }, { rootMargin: '-8% 0px -8% 0px', threshold: 0.05 });

    document.querySelectorAll('.universe__block, .svc-card').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(40px) scale(0.97)';
      entranceIO.observe(el);
    });
  }

  /* ---- 6. APPROACH CELLS — stagger on entrance ---- */
  function setupApproachStagger() {
    const approachIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const cells = entry.target.querySelectorAll('.approach__cell');
        cells.forEach((cell, i) => {
          setTimeout(() => {
            cell.style.transition = 'opacity 0.9s cubic-bezier(0.2,0.7,0.2,1), transform 0.9s cubic-bezier(0.2,0.7,0.2,1)';
            cell.style.opacity = '1';
            cell.style.transform = 'translateY(0) scale(1)';
          }, i * 120);
        });
        approachIO.unobserve(entry.target);
      });
    }, { threshold: 0.1 });

    const grid = document.querySelector('.approach__grid');
    if (grid) {
      grid.querySelectorAll('.approach__cell').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px) scale(0.97)';
      });
      approachIO.observe(grid);
    }
  }

  /* ---- 7. TESTI CARDS — stagger ---- */
  function setupTestiStagger() {
    const testiIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const cards = entry.target.querySelectorAll('.testi__card');
        cards.forEach((card, i) => {
          setTimeout(() => {
            card.style.transition = 'opacity 1s cubic-bezier(0.2,0.7,0.2,1), transform 1s cubic-bezier(0.2,0.7,0.2,1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
          }, i * 160);
        });
        testiIO.unobserve(entry.target);
      });
    }, { threshold: 0.1 });

    const grid = document.querySelector('.testi__grid');
    if (grid) {
      grid.querySelectorAll('.testi__card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(50px) scale(0.96)';
      });
      testiIO.observe(grid);
    }
  }

  /* ---- 8. MANIFESTO STATS — stagger + count ---- */
  function setupManifestoStagger() {
    const manifestoIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const stats = entry.target.querySelectorAll('.manifesto__stat');
        stats.forEach((stat, i) => {
          setTimeout(() => {
            stat.style.transition = 'opacity 1s cubic-bezier(0.2,0.7,0.2,1), transform 1s cubic-bezier(0.2,0.7,0.2,1)';
            stat.style.opacity = '1';
            stat.style.transform = 'translateY(0)';
          }, i * 100);
        });
        manifestoIO.unobserve(entry.target);
      });
    }, { threshold: 0.2 });

    const statsEl = document.querySelector('.manifesto__stats');
    if (statsEl) {
      statsEl.querySelectorAll('.manifesto__stat').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
      });
      manifestoIO.observe(statsEl);
    }
  }

  /* ---- 9. SCROLL PROGRESS LINE (top of page) ---- */
  function setupProgressBar() {
    const bar = document.createElement('div');
    bar.style.cssText = `
      position: fixed; top: 0; left: 0; height: 1px; z-index: 999;
      background: linear-gradient(90deg, rgba(216,208,189,0.3), rgba(216,208,189,0.8));
      width: 0%; transition: width 0.1s linear; pointer-events: none;
    `;
    document.body.appendChild(bar);

    window.addEventListener('scroll', () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const pct = (window.scrollY / total * 100).toFixed(2);
      bar.style.width = pct + '%';
    }, { passive: true });
  }

  /* ---- 10. PROJECTS LIST — line reveal on entrance ---- */
  function setupProjectsReveal() {
    const projIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const rows = entry.target.querySelectorAll('.wk__row');
        rows.forEach((row, i) => {
          row.style.opacity = '0';
          row.style.transform = 'translateX(-20px)';
          setTimeout(() => {
            row.style.transition = 'opacity 0.8s cubic-bezier(0.2,0.7,0.2,1), transform 0.8s cubic-bezier(0.2,0.7,0.2,1)';
            row.style.opacity = '1';
            row.style.transform = 'translateX(0)';
          }, i * 100);
        });
        projIO.unobserve(entry.target);
      });
    }, { threshold: 0.05 });

    const wk = document.querySelector('.wk');
    if (wk) projIO.observe(wk);
  }

  /* ---- 11. CONTACT SECTION — text reveal + glow ---- */
  function setupContactReveal() {
    const contactIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const inner = entry.target.querySelector('.contact__inner');
        if (!inner) return;
        inner.style.opacity = '0';
        inner.style.transform = 'translateY(60px) scale(0.98)';
        setTimeout(() => {
          inner.style.transition = 'opacity 1.4s cubic-bezier(0.2,0.7,0.2,1), transform 1.4s cubic-bezier(0.2,0.7,0.2,1)';
          inner.style.opacity = '1';
          inner.style.transform = 'translateY(0) scale(1)';
        }, 100);
        contactIO.unobserve(entry.target);
      });
    }, { threshold: 0.1 });

    const contact = document.querySelector('.contact');
    if (contact) contactIO.observe(contact);
  }

  /* ---- 12. HORIZONTAL MARQUEE SPEED ON SCROLL ---- */
  function setupMarqueeScroll() {
    const track = document.querySelector('.marquee-track');
    if (!track) return;
    let speed = 28;
    let targetSpeed = 28;
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
      const delta = Math.abs(window.scrollY - lastScroll);
      lastScroll = window.scrollY;
      targetSpeed = Math.max(8, 28 - delta * 0.8);
    }, { passive: true });

    function updateMarquee() {
      speed = lerp(speed, targetSpeed, 0.05);
      targetSpeed = lerp(targetSpeed, 28, 0.02);
      track.style.animationDuration = speed.toFixed(1) + 's';
      requestAnimationFrame(updateMarquee);
    }
    requestAnimationFrame(updateMarquee);
  }

  /* ---- INIT ---- */
  function init() {
    splitText();
    setupCounters();
    setupParallax();
    setupSkew();
    setupSectionEntrance();
    setupApproachStagger();
    setupTestiStagger();
    setupManifestoStagger();
    setupProgressBar();
    setupProjectsReveal();
    setupContactReveal();
    setupMarqueeScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
