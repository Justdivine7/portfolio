/* Divine Ajayi — portfolio interactions. No dependencies. */
(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  /* ------------------------------------------------------------ reveals */
  function initReveals() {
    // index children of a reveal group so they stagger
    $$('[data-reveal-group]').forEach((group) => {
      $$('[data-reveal]', group).forEach((el, i) => el.style.setProperty('--ri', Math.min(i, 8)));
    });
    const targets = $$('[data-reveal], [data-split], .hero-shot');
    if (!('IntersectionObserver' in window) || reduced.matches) {
      targets.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );
    targets.forEach((el) => io.observe(el));
  }

  /* ------------------------------------------------------------ parallax */
  function initParallax() {
    const els = $$('[data-parallax]');
    if (!els.length || reduced.matches) return;
    const active = new Set();
    const state = new WeakMap();
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => (e.isIntersecting ? active.add(e.target) : active.delete(e.target))),
      { rootMargin: '20% 0px 20% 0px' },
    );
    els.forEach((el) => {
      state.set(el, 0);
      io.observe(el);
    });
    let ticking = false;
    const update = () => {
      ticking = false;
      const vh = window.innerHeight;
      const scale = window.innerWidth < 760 ? 0.6 : 1;
      active.forEach((el) => {
        const current = state.get(el) || 0;
        const r = el.getBoundingClientRect();
        const center = r.top - current + r.height / 2; // untransformed position
        const offset = center - vh / 2;
        const y = Math.max(-90, Math.min(90, -offset * parseFloat(el.dataset.parallax) * scale));
        state.set(el, y);
        el.style.translate = `0 ${y.toFixed(1)}px`;
      });
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }

  /* ------------------------------------------------------------ header */
  function initHeader() {
    const header = $('[data-header]');
    if (!header) return;
    let lastY = window.scrollY;
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 8);
      const menuOpen = document.body.classList.contains('menu-open');
      const focusInside = header.contains(document.activeElement);
      if (!menuOpen && !focusInside && y > 160 && y - lastY > 6) header.classList.add('is-hidden');
      else if (lastY - y > 6 || y < 160) header.classList.remove('is-hidden');
      lastY = y;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
    header.addEventListener('focusin', () => header.classList.remove('is-hidden'));
    update();
  }

  /* ------------------------------------------------------------ nav indicator + scroll spy */
  function initNav() {
    const list = $('[data-nav]');
    const indicator = $('[data-nav-indicator]');
    if (!list || !indicator) return;
    const links = $$('[data-nav-link]', list);
    let current = null;

    const moveTo = (link) => {
      if (!link) {
        indicator.classList.remove('is-on');
        links.forEach((l) => l.classList.remove('is-active'));
        current = null;
        return;
      }
      const lr = list.getBoundingClientRect();
      const r = link.getBoundingClientRect();
      indicator.style.setProperty('--x', `${r.left - lr.left}px`);
      indicator.style.setProperty('--w', `${r.width}px`);
      indicator.classList.add('is-on');
      links.forEach((l) => {
        const on = l === link;
        l.classList.toggle('is-active', on);
        if (on) l.setAttribute('aria-current', 'location');
        else l.removeAttribute('aria-current');
      });
      current = link;
    };

    const isHome = document.body.classList.contains('home');
    if (!isHome) {
      // case studies live under Work
      const work = links.find((l) => l.dataset.navLink === 'work');
      if (document.body.classList.contains('case-page')) requestAnimationFrame(() => moveTo(work));
      window.addEventListener('resize', () => current && moveTo(current));
      return;
    }

    const sections = links
      .map((l) => document.getElementById(l.dataset.navLink))
      .filter(Boolean);
    const visible = new Map();
    const pick = () => {
      let best = null;
      let bestRatio = 0;
      visible.forEach((ratio, id) => {
        if (ratio > bestRatio) {
          bestRatio = ratio;
          best = id;
        }
      });
      if (best) moveTo(links.find((l) => l.dataset.navLink === best));
    };
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          // weight by how much of the viewport the section covers
          const cover = e.isIntersecting ? e.intersectionRect.height / window.innerHeight : 0;
          visible.set(e.target.id, cover);
        });
        pick();
      },
      { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] },
    );
    sections.forEach((s) => io.observe(s));
    window.addEventListener('resize', () => current && moveTo(current));
    // fonts change link widths
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => current && moveTo(current));
  }

  /* ------------------------------------------------------------ mobile menu */
  function initMenu() {
    const toggle = $('[data-menu-toggle]');
    const menu = $('[data-menu]');
    if (!toggle || !menu) return;
    const label = $('.menu-toggle__label', toggle);
    let open = false;

    const focusables = () => [toggle, ...$$('a, button', menu)];
    const setOpen = (next, { restoreFocus = true } = {}) => {
      open = next;
      toggle.setAttribute('aria-expanded', String(open));
      label.textContent = open ? 'Close' : 'Menu';
      document.body.classList.toggle('menu-open', open);
      if (open) {
        menu.hidden = false;
        requestAnimationFrame(() => {
          menu.classList.add('is-open');
          const first = $('a', menu);
          if (first) first.focus({ preventScroll: true });
        });
      } else {
        menu.classList.remove('is-open');
        const done = () => { if (!open) menu.hidden = true; };
        if (reduced.matches) done();
        else setTimeout(done, 350);
        if (restoreFocus) toggle.focus({ preventScroll: true });
      }
    };

    toggle.addEventListener('click', () => setOpen(!open));
    menu.addEventListener('click', (e) => {
      if (e.target.closest('[data-menu-link]')) setOpen(false, { restoreFocus: false });
    });
    document.addEventListener('keydown', (e) => {
      if (!open) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
      } else if (e.key === 'Tab') {
        const f = focusables();
        const i = f.indexOf(document.activeElement);
        if (e.shiftKey && (i <= 0)) {
          e.preventDefault();
          f[f.length - 1].focus();
        } else if (!e.shiftKey && i === f.length - 1) {
          e.preventDefault();
          f[0].focus();
        }
      }
    });
    window.matchMedia('(min-width: 900px)').addEventListener('change', (m) => {
      if (m.matches && open) setOpen(false, { restoreFocus: false });
    });
  }

  /* ------------------------------------------------------------ hover preview for "Also shipped" */
  function initPreview() {
    const el = $('[data-preview-el]');
    if (!el) return;
    const img = $('img', el);
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0, on = false;
    const loop = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      el.style.setProperty('--px', `${x.toFixed(1)}px`);
      el.style.setProperty('--py', `${y.toFixed(1)}px`);
      raf = on || Math.abs(tx - x) > 0.5 ? requestAnimationFrame(loop) : 0;
    };
    const place = (e) => {
      tx = e.clientX + 28;
      ty = e.clientY - 150;
    };
    $$('summary[data-preview]').forEach((s) => {
      s.addEventListener('pointerenter', (e) => {
        if (!finePointer.matches || reduced.matches) return;
        if (s.parentElement.open) return;
        img.src = s.dataset.preview;
        place(e);
        if (!on) { x = tx; y = ty; }
        on = true;
        el.classList.add('is-on');
        if (!raf) raf = requestAnimationFrame(loop);
      });
      s.addEventListener('pointermove', place);
      s.addEventListener('pointerleave', () => {
        on = false;
        el.classList.remove('is-on');
      });
      s.addEventListener('click', () => {
        on = false;
        el.classList.remove('is-on');
      });
    });
  }

  /* ------------------------------------------------------------ copy email */
  function initCopy() {
    $$('[data-copy]').forEach((btn) => {
      const label = $('[data-copy-label]', btn);
      label && label.setAttribute('aria-live', 'polite');
      btn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(btn.dataset.copy);
          btn.classList.add('is-done');
          if (label) label.textContent = 'Copied';
        } catch {
          if (label) label.textContent = /Mac|iPhone|iPad/.test(navigator.userAgent) ? 'Press ⌘C' : 'Press Ctrl+C';
          const sel = window.getSelection();
          const link = btn.parentElement.querySelector('a');
          if (sel && link) {
            const range = document.createRange();
            range.selectNodeContents(link);
            sel.removeAllRanges();
            sel.addRange(range);
          }
        }
        setTimeout(() => {
          btn.classList.remove('is-done');
          if (label) label.textContent = 'Copy';
        }, 2200);
      });
    });
  }

  /* ------------------------------------------------------------ local time */
  function initClock() {
    const els = $$('[data-clock]');
    if (!els.length) return;
    let fmt;
    try {
      fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos' });
    } catch {
      return;
    }
    const tick = () => els.forEach((el) => (el.textContent = `${fmt.format(new Date())} WAT`));
    tick();
    setInterval(tick, 30000);
  }

  /* ------------------------------------------------------------ case-study contents */
  function initToc() {
    const links = $$('[data-toc-link]');
    if (!links.length) return;
    const map = new Map(links.map((l) => [l.dataset.tocLink, l]));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            links.forEach((l) => l.classList.remove('is-active'));
            const l = map.get(e.target.id);
            if (l) l.classList.add('is-active');
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    map.forEach((_, id) => {
      const s = document.getElementById(id);
      if (s) io.observe(s);
    });
  }

  const start = () => {
    initReveals();
    initParallax();
    initHeader();
    initNav();
    initMenu();
    initPreview();
    initCopy();
    initClock();
    initToc();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
