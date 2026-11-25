// Zero-dependency static build.
//   node scripts/build.mjs
// Reads src/content.mjs and writes index.html, work/<slug>/index.html, 404.html and sitemap.xml.
// The generated HTML is committed, so Vercel serves it as plain static files (no build step needed).

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { site, projects, moreWork, experience, education, principles, expertise } from '../src/content.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const NOW = new Date();
const VERSION = createHash('sha1')
  .update(readFileSync(join(ROOT, 'assets/css/site.css')))
  .update(readFileSync(join(ROOT, 'assets/js/site.js')))
  .digest('hex')
  .slice(0, 10);

// ---------------------------------------------------------------- helpers
const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const attrs = (o) =>
  Object.entries(o)
    .filter(([, v]) => v !== undefined && v !== null && v !== false)
    .map(([k, v]) => (v === true ? k : `${k}="${esc(v)}"`))
    .join(' ');
const themeStyle = (t) =>
  `--c-bg:${t.bg};--c-fg:${t.fg};--c-muted:${t.muted};--c-accent:${t.accent};--c-panel:${t.panel}`;
const ext = (href) => (/^https?:/.test(href) ? ' target="_blank" rel="noopener"' : '');

const sizeCache = new Map();
function webpSize(src) {
  if (sizeCache.has(src)) return sizeCache.get(src);
  const buf = readFileSync(join(ROOT, src));
  const fmt = buf.toString('ascii', 12, 16);
  let s;
  if (fmt === 'VP8 ') s = { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
  else if (fmt === 'VP8L') {
    const b = buf.readUInt32LE(21);
    s = { w: (b & 0x3fff) + 1, h: ((b >> 14) & 0x3fff) + 1 };
  } else if (fmt === 'VP8X') s = { w: 1 + buf.readUIntLE(24, 3), h: 1 + buf.readUIntLE(27, 3) };
  else throw new Error(`Unknown webp format in ${src}`);
  sizeCache.set(src, s);
  return s;
}

function img(shot, { eager = false, priority = false, sizes } = {}) {
  const { w, h } = webpSize(shot.src);
  return `<img ${attrs({
    src: '/' + shot.src,
    alt: shot.alt,
    width: w,
    height: h,
    loading: eager ? 'eager' : 'lazy',
    decoding: eager ? 'sync' : 'async',
    fetchpriority: priority ? 'high' : undefined,
    sizes,
  })}>`;
}

// A screenshot in its presentation: store graphics ("poster") are shown as-is,
// raw screenshots ("device") sit in a minimal hardware frame.
function shot(kind, s, { cls = '', caption = false, parallax, eager, priority } = {}) {
  const p = parallax ? ` data-parallax="${parallax}"` : '';
  const cap = caption && s.caption ? `<figcaption>${esc(s.caption)}</figcaption>` : '';
  return `<figure class="shot shot--${kind} ${cls}"${p}><div class="shot__frame">${img(s, { eager, priority })}</div>${cap}</figure>`;
}

const ICON = {
  out: '<svg class="i i--out" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 11 11 5M6 5h5v5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  right: '<svg class="i i--right" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  down: '<svg class="i i--down" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10M4 9l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  copy: '<svg class="i" viewBox="0 0 16 16" aria-hidden="true"><rect x="5.5" y="5.5" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M10.5 3.5v-.5A1.5 1.5 0 0 0 9 1.5H4A1.5 1.5 0 0 0 2.5 3v5A1.5 1.5 0 0 0 4 9.5h.5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
};

// Headline words are wrapped so they can rise in sequence; spaces stay as text so it reads naturally.
function words(text, start = 0, em = false) {
  const out = text
    .split(' ')
    .map((w, i) => `<span class="w"><span style="--i:${start + i}">${em ? `<em>${esc(w)}</em>` : esc(w)}</span></span>`)
    .join(' ');
  // keep an emphasised phrase together on one line (wider screens only, see .em-group)
  return em ? `<span class="em-group">${out}</span>` : out;
}

// ---------------------------------------------------------------- shell
function head({ title, shareTitle = title, description, path, ogImage = '/assets/og.png', jsonld }) {
  const url = site.url + path;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<meta name="author" content="${esc(site.name)}">
<meta name="theme-color" content="#F3F0E8">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(shareTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${site.url}${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(shareTitle)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${site.url}${ogImage}">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@300..700&family=Geist+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&family=Tektur:wdth,wght@75..100,500..800&display=swap">
<link rel="stylesheet" href="/assets/css/site.css?v=${VERSION}">
<script>document.documentElement.classList.add('js')</script>
<script src="/assets/js/site.js?v=${VERSION}" defer></script>
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>` : ''}
</head>`;
}

const NAV = [
  ['top', 'Home'],
  ['work', 'Work'],
  ['experience', 'Experience'],
  ['about', 'About'],
  ['contact', 'Contact'],
];

function header() {
  const links = NAV.map(([id, label]) => `<li><a href="/#${id}" data-nav-link="${id}">${label}</a></li>`).join('');
  const menuLinks = NAV.map(
    ([id, label], i) =>
      `<li style="--i:${i}"><a href="/#${id}" data-menu-link><span class="menu__n">0${i + 1}</span>${label}</a></li>`,
  ).join('');
  return `<a class="skip" href="#main">Skip to content</a>
<header class="site-header" data-header>
  <div class="site-header__inner">
    <a class="wordmark" href="/" aria-label="${esc(site.name)}, home">
      <span class="wordmark__mark" aria-hidden="true">DA</span>
      <span class="wordmark__text"><span class="wordmark__name">${esc(site.name)}</span><span class="wordmark__role">Mobile Engineer</span></span>
    </a>
    <nav class="nav" aria-label="Primary">
      <ul class="nav__list" data-nav>${links}<li class="nav__indicator" aria-hidden="true" data-nav-indicator></li></ul>
    </nav>
    <a class="btn btn--sm btn--ink header__resume" href="${site.resume}" target="_blank" rel="noopener">Resume ${ICON.out}</a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="menu" data-menu-toggle>
      <span class="menu-toggle__label">Menu</span><span class="menu-toggle__bars" aria-hidden="true"><span></span><span></span></span>
    </button>
  </div>
</header>
<div class="menu" id="menu" data-menu hidden>
  <nav class="menu__inner" aria-label="Menu">
    <ul class="menu__list">${menuLinks}</ul>
    <div class="menu__foot">
      <a class="btn btn--ink" href="${site.resume}" target="_blank" rel="noopener">Resume ${ICON.out}</a>
      <a class="menu__mail" href="mailto:${site.email}">${esc(site.email)}</a>
    </div>
  </nav>
</div>`;
}

function contactSection({ compact = false } = {}) {
  const links = [
    ...site.links.map((l) => ({ label: l.label, value: l.handle, href: l.href })),
    { label: 'Resume', value: 'PDF · 2 pages', href: site.resume },
    { label: 'Phone', value: site.phone.display, href: site.phone.href },
  ];
  return `<section class="contact" id="contact" aria-labelledby="contact-title">
  <div class="wrap">
    <p class="eyebrow eyebrow--light" data-reveal>Contact</p>
    <h2 class="contact__title" id="contact-title" data-split>${words('Let’s build something', 0)} ${words('that ships.', 3, true)}</h2>
    <div class="contact__grid">
      <p class="contact__lede" data-reveal>I’m open to meaningful engineering roles — international and remote included — and to collaborating on mobile products that need to be built well and keep working once they ship.</p>
      <div class="contact__primary" data-reveal>
        <span class="contact__label">Email</span>
        <div class="contact__email">
          <a class="contact__mail" href="mailto:${site.email}">${esc(site.email)}</a>
          <button class="copy" type="button" data-copy="${site.email}" aria-label="Copy email address">${ICON.copy}<span data-copy-label>Copy</span></button>
        </div>
      </div>
    </div>
    <ul class="contact__links" data-reveal-group>
      ${links
        .map(
          (l) =>
            `<li data-reveal><a href="${l.href}"${ext(l.href)}><span class="contact__k">${l.label}</span><span class="contact__v">${esc(l.value)}</span>${ICON.out}</a></li>`,
        )
        .join('')}
    </ul>
  </div>
  <footer class="footer wrap">
    <span>${esc(site.fullName)} · © ${NOW.getFullYear()}</span>
    <span>${esc(site.location)} · <span data-clock>WAT</span></span>
    <a href="#top" class="footer__top">Back to top ${ICON.right}</a>
  </footer>
</section>`;
}

function page({ title, shareTitle, description, path, body, bodyClass = '', bodyStyle, jsonld }) {
  return `${head({ title, shareTitle, description, path, jsonld })}
<body class="${bodyClass}"${bodyStyle ? ` style="${bodyStyle}"` : ''}>
${header()}
${body}
</body>
</html>
`;
}

// ---------------------------------------------------------------- homepage parts
function hero() {
  const poster = 'assets/relay-poster.webp';
  const { w, h } = webpSize(poster);
  return `<section class="hero" id="top" aria-labelledby="hero-title">
  <div class="wrap hero__grid">
    <p class="hero__eyebrow eyebrow" data-reveal><span>${esc(site.name)}</span><span class="hero__sep" aria-hidden="true"></span><span>${esc(site.role)}</span></p>
    <h1 class="hero__title" id="hero-title" data-split>${words('Mobile products, engineered from architecture', 0)} ${words('to App Store.', 5, true)}</h1>
    <div class="hero__intro">
      <p class="hero__lede" data-reveal>I take production apps end to end — architecture, payments, real-time features, offline-ready data layers, and the release pipeline that gets them to real users on iOS and Android.</p>
      <div class="hero__actions" data-reveal>
        <a class="btn btn--ink" href="#work">View my work ${ICON.down}</a>
        <a class="btn btn--line" href="${site.resume}" target="_blank" rel="noopener">Resume ${ICON.out}</a>
      </div>
    </div>
    <div class="hero__stage hero__stage--demo">
      <figure class="demo" data-demo data-src="/assets/demo/">
        <div class="demo__device" data-reveal>
          <div class="demo__screen" data-demo-screen>
            <img class="demo__poster" src="/${poster}" width="${w}" height="${h}" alt="Relay, a demo Flutter app: an orders list with sync status, a live event console and a developer menu button" fetchpriority="high" decoding="async">
            <div class="demo__cta" data-demo-cta>
              <button class="demo__run" type="button" data-demo-run>
                <span class="demo__play" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M5 3.5v9l7.5-4.5z" fill="currentColor"/></svg></span>
                <span>Run the live Flutter build</span>
              </button>
              <span class="demo__meta">Flutter → WebAssembly · ~3 MB</span>
            </div>
            <div class="demo__loading" data-demo-loading hidden><span class="demo__bar"></span><span>Starting the Flutter engine…</span></div>
          </div>
        </div>
        <figcaption class="demo__caption" data-reveal>
          <span class="demo__live"><span class="status-dot" aria-hidden="true"></span>Live demo</span>
          A real Flutter app I built for this site. Open its developer menu, go offline or make the network flaky, and try to break it.
          <span class="demo__links"><a class="textlink" href="https://github.com/Justdivine7/portfolio/tree/main/demo" target="_blank" rel="noopener">View the source ${ICON.out}</a><a class="textlink" href="/assets/demo/" target="_blank" rel="noopener" data-demo-popout>Open full screen ${ICON.out}</a></span>
        </figcaption>
      </figure>
    </div>
    <dl class="hero__facts" data-reveal-group>
      <div data-reveal><dt>Status</dt><dd><span class="fact__n"><span class="status-dot" aria-hidden="true"></span>Open</span><span class="fact__v">to international roles</span></dd></div>
      ${site.facts.map((f) => `<div data-reveal><dt>${esc(f.k)}</dt><dd><span class="fact__n">${esc(f.n)}</span> <span class="fact__v">${esc(f.v)}</span></dd></div>`).join('')}
    </dl>
  </div>
</section>`;
}

function chapterMeta(p, i) {
  return `<div class="chapter__meta">
      <span class="chapter__index">${String(i + 1).padStart(2, '0')}</span>
      <span class="chapter__cat">${esc(p.category)}</span>
      <span class="chapter__status"><span class="status-dot status-dot--${p.status === 'Live' ? 'live' : 'dev'}" aria-hidden="true"></span>${esc(p.status)}<span class="chapter__status-note">&nbsp;·&nbsp;${esc(p.statusNote)}</span></span>
    </div>`;
}

function chapterTitle(p, level = 'h3') {
  return `<${level} class="chapter__title" id="t-${p.slug}"><a href="/work/${p.slug}/" style="view-transition-name:t-${p.slug}">${esc(p.name)}</a></${level}>
    <p class="chapter__tagline">${esc(p.tagline)}</p>`;
}

function owned(p, n = 4) {
  return `<div class="chapter__owned">
      <h4 class="label">What I owned</h4>
      <ul>${p.owned
        .slice(0, n)
        .map((o) => `<li>${esc(o)}</li>`)
        .join('')}</ul>
    </div>`;
}

function stackLine(p) {
  return `<p class="chapter__stack"><span class="label">Built with</span> ${p.stack.map(esc).join('<span aria-hidden="true"> / </span>')}</p>`;
}

function cta(p) {
  const store = p.links
    .map((l) => `<a class="textlink" href="${l.href}" target="_blank" rel="noopener">${esc(l.label)} ${ICON.out}</a>`)
    .join('');
  return `<div class="chapter__cta">
      <a class="btn btn--case" href="/work/${p.slug}/" aria-describedby="t-${p.slug}">Read the case study ${ICON.right}</a>
      ${store ? `<div class="chapter__stores">${store}</div>` : ''}
    </div>`;
}

const LAYOUTS = {
  posters(p, i) {
    const all = p.screens.flatMap((g) => g.items);
    const par = ['0.05', '-0.03', '0.07', '-0.05', '0.04', '-0.02'];
    return `<article class="chapter chapter--posters stage" style="${themeStyle(p.theme)}" aria-labelledby="t-${p.slug}">
  <div class="wrap">
    ${chapterMeta(p, i)}
    <div class="chapter__head" data-reveal>${chapterTitle(p)}</div>
  </div>
  <div class="rail" data-rail tabindex="0" role="group" aria-label="${esc(p.name)} screens">
    ${all.map((s, k) => shot(p.kind, s, { cls: `rail__item rail__item--${k}`, parallax: par[k] })).join('')}
  </div>
  <div class="wrap chapter__body chapter__body--3">
    <p class="chapter__summary" data-reveal>${esc(p.summary)}</p>
    <div data-reveal>${owned(p)}</div>
    <div data-reveal>${stackLine(p)}${cta(p)}</div>
  </div>
</article>`;
  },

  companion(p, i) {
    const s = p.screens.flatMap((g) => g.items);
    return `<article class="chapter chapter--companion" style="${themeStyle(p.theme)}" aria-labelledby="t-${p.slug}">
  <div class="wrap companion">
    <div class="companion__panel" data-reveal>
      <div class="fan">
        ${shot(p.kind, s[0], { cls: 'fan__l', parallax: '0.04' })}
        ${shot(p.kind, s[1], { cls: 'fan__c', parallax: '-0.03' })}
        ${shot(p.kind, s[3], { cls: 'fan__r', parallax: '0.06' })}
      </div>
    </div>
    <div class="companion__text">
      ${chapterMeta(p, i)}
      <div data-reveal>${chapterTitle(p)}</div>
      <p class="chapter__summary" data-reveal>${esc(p.summary)}</p>
      <div data-reveal>${owned(p)}</div>
      <div data-reveal>${stackLine(p)}${cta(p)}</div>
    </div>
  </div>
</article>`;
  },

  triptych(p, i) {
    const notes = {
      'Customer app': 'Shop, find vets, ask PawsAI.',
      'Merchant app': 'Earnings, inventory, orders.',
      'Merchant app · Vets': 'Consultations, emergencies, clinics.',
    };
    return `<article class="chapter chapter--triptych stage" style="${themeStyle(p.theme)}" aria-labelledby="t-${p.slug}">
  <div class="wrap">
    ${chapterMeta(p, i)}
    <div class="chapter__split">
      <div data-reveal>${chapterTitle(p)}</div>
      <p class="chapter__summary" data-reveal>${esc(p.summary)}</p>
    </div>
    <div class="triptych" data-reveal-group>
      ${p.screens
        .map(
          (g, k) => `<div class="triptych__col" data-reveal>
        <div class="triptych__shots triptych__shots--${g.items.length > 2 ? 3 : 2}">
          ${g.items
            .slice(0, 3)
            .map((s, j) => shot(p.kind, s, { cls: `tri tri--${j}`, parallax: j === 1 ? '-0.04' : '0.03' }))
            .join('')}
        </div>
        <p class="triptych__label"><span class="label">0${k + 1}</span> ${esc(g.title)}</p>
        <p class="triptych__note">${esc(notes[g.title] || '')}</p>
      </div>`,
        )
        .join('')}
    </div>
    <div class="chapter__body chapter__body--2">
      <div data-reveal>${owned(p, 5)}</div>
      <div data-reveal>${stackLine(p)}${cta(p)}</div>
    </div>
  </div>
</article>`;
  },

  spotlight(p, i) {
    const [mood, disc, play] = p.screens;
    const steps = [
      ['Describe', 'Chips, free text, or live voice over WebRTC.'],
      ['Resolve', 'Every suggestion verified against iTunes before it’s queued.'],
      ['Listen', 'A queue for the feeling, with synced lyrics.'],
    ];
    return `<article class="chapter chapter--spotlight stage" style="${themeStyle(p.theme)}" aria-labelledby="t-${p.slug}">
  <div class="wrap spotlight">
    <div class="spotlight__text">
      ${chapterMeta(p, i)}
      <div data-reveal>${chapterTitle(p)}</div>
      <p class="chapter__summary" data-reveal>${esc(p.summary)}</p>
      <ol class="steps" data-reveal-group>
        ${steps.map(([k, v], n) => `<li data-reveal><span class="steps__n">0${n + 1}</span><span class="steps__k">${k}</span><span class="steps__v">${esc(v)}</span></li>`).join('')}
      </ol>
      <div data-reveal>${stackLine(p)}${cta(p)}</div>
    </div>
    <div class="spotlight__stage" aria-label="${esc(p.name)} screens" role="group">
      ${shot(p.kind, mood.items[1], { cls: 'spot spot--l', parallax: '0.06' })}
      ${shot(p.kind, play.items[0], { cls: 'spot spot--c', parallax: '-0.03' })}
      ${shot(p.kind, mood.items[2], { cls: 'spot spot--r', parallax: '0.09' })}
    </div>
  </div>
</article>`;
  },

  pipeline(p, i) {
    const [score, scan] = p.screens;
    return `<article class="chapter chapter--pipeline" style="${themeStyle(p.theme)}" aria-labelledby="t-${p.slug}">
  <div class="wrap">
    <div class="pipeline-panel">
      <div class="pipeline-panel__visual" role="group" aria-label="${esc(p.name)} screens">
        ${shot(p.kind, scan.items[1], { cls: 'pv pv--back', parallax: '0.05' })}
        ${shot(p.kind, score.items[0], { cls: 'pv pv--front', parallax: '-0.03' })}
      </div>
      <div class="pipeline-panel__text">
        ${chapterMeta(p, i)}
        <div data-reveal>${chapterTitle(p)}</div>
        <p class="chapter__summary" data-reveal>${esc(p.summary)}</p>
        <div class="pipeline" data-reveal-group>
          <h4 class="label" data-reveal>A four-stage AI pipeline</h4>
          <ol>${p.pipeline.map((s, n) => `<li data-reveal><span class="pipeline__n">${n + 1}</span><span class="pipeline__k">${s.k}</span><span class="pipeline__v">${esc(s.v)}</span></li>`).join('')}</ol>
        </div>
        <div data-reveal>${stackLine(p)}${cta(p)}</div>
      </div>
    </div>
  </div>
</article>`;
  },

  strip(p, i) {
    const [cust, rider] = p.screens;
    return `<article class="chapter chapter--strip" style="${themeStyle(p.theme)}" aria-labelledby="t-${p.slug}">
  <div class="wrap">
    ${chapterMeta(p, i)}
    <div class="chapter__split">
      <div data-reveal>${chapterTitle(p)}</div>
      <p class="chapter__summary" data-reveal>${esc(p.summary)}</p>
    </div>
  </div>
  <div class="strip" data-rail tabindex="0" role="group" aria-label="${esc(p.name)} screens">
    <div class="strip__group">
      <span class="label strip__label">Customer app</span>
      <div class="strip__row">${cust.items.map((s, k) => shot(p.kind, s, { caption: true, cls: 'strip__shot', parallax: k % 2 ? '-0.03' : '0.03' })).join('')}</div>
    </div>
    <div class="strip__group strip__group--rider">
      <span class="label strip__label">Rider app</span>
      <div class="strip__row">${rider.items.map((s) => shot(p.kind, s, { caption: true, cls: 'strip__shot' })).join('')}</div>
    </div>
  </div>
  <div class="wrap chapter__body chapter__body--2">
    <div data-reveal>${owned(p, 5)}</div>
    <div data-reveal>${stackLine(p)}${cta(p)}</div>
  </div>
</article>`;
  },
};

function moreWorkSection() {
  return `<div class="more wrap">
  <div class="more__head" data-reveal>
    <h3 class="eyebrow">Also shipped</h3>
    <p>Two more products, built from scratch and now in internal testing.</p>
  </div>
  <ul class="more__list">
    ${moreWork
      .map(
        (m) => `<li class="more__item" data-reveal>
      <details>
        <summary data-preview="/${m.screens[0].src}">
          <span class="more__name">${esc(m.name)}</span>
          <span class="more__cat">${esc(m.category)}</span>
          <span class="more__where">${esc(m.where)} · ${esc(m.status)}</span>
          <span class="more__toggle" aria-hidden="true"></span>
        </summary>
        <div class="more__body">
          <div class="more__text">
            <p>${esc(m.summary)}</p>
            <ul>${m.points.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
            <p class="chapter__stack"><span class="label">Built with</span> ${m.stack.map(esc).join('<span aria-hidden="true"> / </span>')}</p>
          </div>
          <div class="more__shots">${m.screens.map((s) => shot('device', s, { caption: true })).join('')}</div>
        </div>
      </details>
    </li>`,
      )
      .join('')}
  </ul>
  <div class="more__preview" aria-hidden="true" data-preview-el><img alt="" width="180" height="390"></div>
</div>`;
}

function monthIndex(ym) {
  const [y, m] = ym.split('-').map(Number);
  return (y - 2025) * 12 + (m - 2);
}

function timeline() {
  const nowIdx = (NOW.getFullYear() - 2025) * 12 + NOW.getMonth() + 1 - 2; // months since Feb 2025
  const cols = nowIdx + 1;
  const rows = [...experience].sort((a, b) => a.start.localeCompare(b.start));
  const ticks = [`<span class="tl__tick" style="grid-column:1 / span 3">Feb 2025</span>`];
  for (let i = 1; i < cols; i++) {
    const month = ((i + 1) % 12) + 1;
    const year = 2025 + Math.floor((i + 1) / 12);
    if (month === 1 && i < cols - 3) ticks.push(`<span class="tl__tick" style="grid-column:${i + 1} / span 3">Jan ${year}</span>`);
  }
  ticks.push(`<span class="tl__tick tl__tick--now" style="grid-column:${cols - 2} / span 3">Now</span>`);
  return `<figure class="tl" data-reveal style="--cols:${cols}">
  <figcaption class="visually-hidden">Timeline of roles from February 2025 to today.</figcaption>
  <div class="tl__axis" aria-hidden="true"><span class="tl__ticks">${ticks.join('')}</span></div>
  <ol class="tl__rows">
    ${rows
      .map((r, k) => {
        const s = monthIndex(r.start) + 1;
        const e = (r.end ? monthIndex(r.end) : nowIdx) + 2;
        return `<li class="tl__row${r.end ? '' : ' tl__row--open'}" style="--k:${k}"><span class="tl__name">${esc(r.company)} <span class="tl__scope">${esc(r.scope)}</span></span><span class="tl__track"><span class="tl__bar" style="grid-column:${s} / ${e}"></span></span><span class="visually-hidden">${esc(r.dates)}</span></li>`;
      })
      .join('')}
  </ol>
</figure>`;
}

function experienceSection() {
  const bySlug = Object.fromEntries(projects.map((p) => [p.slug, p]));
  return `<section class="experience" id="experience" aria-labelledby="exp-title">
  <div class="wrap">
    <header class="section-head">
      <p class="eyebrow" data-reveal>Experience</p>
      <h2 class="section-title" id="exp-title" data-split>${words('From internship finalist', 0)} ${words('to leading mobile.', 3, true)}</h2>
      <p class="section-lede" data-reveal>Six roles since February 2025 — from intern to mentor to lead, each with more of the product, and more of the release, in my hands.</p>
    </header>
    ${timeline()}
    <ol class="roles">
      ${experience
        .map(
          (r) => `<li class="role" data-reveal>
        <div class="role__when"><span class="role__dates">${esc(r.dates)}</span><span class="role__scope">${esc(r.scope)}</span></div>
        <div class="role__who">
          <h3 class="role__title">${esc(r.role)}</h3>
          <p class="role__co">${esc(r.company)}</p>
          <p class="role__meta">${esc(r.meta)}</p>
        </div>
        <div class="role__what">
          <ul>${r.points.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
          ${
            r.projects.length
              ? `<p class="role__projects">${r.projects.map((s) => `<a class="textlink" href="/work/${s}/">${esc(bySlug[s].name)} case study ${ICON.right}</a>`).join('')}</p>`
              : ''
          }
        </div>
      </li>`,
        )
        .join('')}
    </ol>
    <div class="edu" data-reveal>
      <h3 class="eyebrow">Education</h3>
      <ul>${education.map((e) => `<li><span class="edu__what">${esc(e.what)}</span><span class="edu__where">${esc(e.where)}</span><span class="edu__when">${esc(e.when)}</span></li>`).join('')}</ul>
    </div>
  </div>
</section>`;
}

function aboutSection() {
  return `<section class="about" id="about" aria-labelledby="about-title">
  <div class="wrap">
    <div class="about__grid">
      <p class="eyebrow" data-reveal>About</p>
      <h2 class="about__statement" id="about-title" data-split>${words('I care most about the parts of an app', 0)} ${words('nobody screenshots', 8, true)} ${words('— the architecture, the failure states, the release.', 10)}</h2>
      <div class="about__bio" data-reveal-group>
        <p data-reveal>I’m a mobile engineer based in Akure, Nigeria, working in Flutter, Dart and Kotlin. Today I lead mobile development at Midddleman Technologies, where I own the release pipeline and the layers that keep the customer and agent apps dependable. Before that I was the sole mobile engineer at Jamforte Technologies, shipping Pawshauz and Difamer, and I’ve built delivery and sports apps on contract. In 2026 I went back to the HNG Internship as a Flutter mentor.</p>
        <p data-reveal>Alongside that I build AI-native products — Shmood and Sanah — to push on what a mobile app can do with voice, vision and language models, without letting a model make things up.</p>
      </div>
    </div>
    <ol class="principles" data-reveal-group>
      ${principles
        .map(
          (x, i) => `<li data-reveal><span class="principles__n">0${i + 1}</span><h3>${esc(x.title)}</h3><p>${esc(x.body)}</p></li>`,
        )
        .join('')}
    </ol>
    <div class="toolkit">
      <header class="toolkit__head" data-reveal>
        <h3 class="eyebrow">Toolkit</h3>
        <p>What I reach for, grouped by the job it does.</p>
      </header>
      <dl class="toolkit__list">
        ${expertise
          .map(
            (g) => `<div class="toolkit__row" data-reveal><dt>${esc(g.group)}</dt><dd><span class="toolkit__items">${g.items.map(esc).join('<span class="toolkit__sep" aria-hidden="true">,</span> ')}</span><span class="toolkit__note">${esc(g.note)}</span></dd></div>`,
          )
          .join('')}
      </dl>
    </div>
  </div>
</section>`;
}

function homepage() {
  const body = `<main id="main">
${hero()}
<section class="work" id="work" aria-labelledby="work-title">
  <header class="wrap section-head section-head--work">
    <p class="eyebrow" data-reveal>Selected work · 2025 — ${NOW.getFullYear()}</p>
    <h2 class="section-title" id="work-title" data-split>${words('Products in', 0)} ${words('people’s hands.', 2, true)}</h2>
    <p class="section-lede" data-reveal>Fintech, marketplaces, delivery and AI — live in the stores or in testing ahead of launch. Where a product was built by a team, I say exactly which parts were mine.</p>
  </header>
  ${projects.map((p, i) => LAYOUTS[p.layout](p, i)).join('\n')}
  ${moreWorkSection()}
</section>
${experienceSection()}
${aboutSection()}
${contactSection()}
</main>`;
  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: site.name,
    alternateName: site.fullName,
    jobTitle: 'Mobile Engineer',
    url: site.url,
    address: { '@type': 'PostalAddress', addressLocality: 'Akure', addressCountry: 'NG' },
    sameAs: site.links.map((l) => l.href),
    knowsAbout: ['Flutter', 'Dart', 'Kotlin', 'Mobile architecture', 'iOS', 'Android'],
  };
  return page({ title: site.title, shareTitle: site.shareTitle, description: site.description, path: '/', body, bodyClass: 'home', jsonld });
}

// ---------------------------------------------------------------- case study
function caseStudy(p, i) {
  const next = projects[(i + 1) % projects.length];
  const meta = [
    ['Role', p.role],
    ['Context', p.context],
    ['Timeline', p.timeline],
    ['Platforms', p.platforms],
    ['Status', `${p.status} · ${p.statusNote}`],
  ];
  const toc = [
    ['overview', 'Overview'],
    ['problem', 'The problem'],
    ['role', 'My role'],
    ['challenges', 'Engineering'],
    ['architecture', 'Architecture'],
    ['screens', 'Screens'],
    ['outcome', 'Outcome'],
  ];
  const heroShots = p.screens.flatMap((g) => g.items).slice(0, p.kind === 'poster' ? 5 : 4);
  const native = webpSize(p.screens[0].items[0].src).w;
  const body = `<main id="main" class="case case--${p.slug}">
  <section class="case-hero stage" id="top">
    <div class="wrap">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="/#work">Work</a><span aria-hidden="true">/</span><span aria-current="page">${esc(p.name)}</span></nav>
      <p class="eyebrow case-hero__cat" data-reveal>${esc(p.category)}</p>
      <h1 class="case-hero__title"><span style="view-transition-name:t-${p.slug}">${esc(p.name)}</span></h1>
      <p class="case-hero__tagline" data-reveal>${esc(p.tagline)}</p>
      <dl class="case-meta" data-reveal-group>
        ${meta.map(([k, v]) => `<div data-reveal><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}
      </dl>
      ${p.links.length ? `<div class="case-links" data-reveal>${p.links.map((l) => `<a class="btn btn--sm btn--onstage" href="${l.href}" target="_blank" rel="noopener">${esc(l.label)} ${ICON.out}</a>`).join('')}</div>` : ''}
    </div>
    <div class="case-hero__visual case-hero__visual--${p.kind}" role="group" aria-label="${esc(p.name)} screens">
      ${heroShots.map((s, k) => shot(p.kind, s, { eager: true, priority: k === 0, cls: `ch ch--${k}`, parallax: ['0.04', '-0.03', '0.06', '-0.05', '0.03'][k] })).join('')}
    </div>
  </section>

  <div class="wrap case-body">
    <aside class="case-toc" aria-label="On this page">
      <p class="label">On this page</p>
      <ol>${toc.map(([id, l]) => `<li><a href="#${id}" data-toc-link="${id}">${l}</a></li>`).join('')}</ol>
    </aside>
    <div class="case-content">
      <section id="overview" class="case-sec">
        <h2 class="case-sec__title" data-reveal>Overview</h2>
        <div class="case-prose" data-reveal-group>${p.overview.map((x) => `<p data-reveal>${esc(x)}</p>`).join('')}</div>
      </section>
      <section id="problem" class="case-sec">
        <h2 class="case-sec__title" data-reveal>The problem</h2>
        <p class="case-pull" data-reveal>${esc(p.problem)}</p>
      </section>
      <section id="role" class="case-sec">
        <h2 class="case-sec__title" data-reveal>My role</h2>
        <div class="case-prose"><p data-reveal>${esc(p.team)}</p></div>
        <div class="case-owned" data-reveal>
          <h3 class="label">What I owned</h3>
          <ul>${p.owned.map((o) => `<li>${esc(o)}</li>`).join('')}</ul>
        </div>
      </section>
      <section id="challenges" class="case-sec">
        <h2 class="case-sec__title" data-reveal>Engineering challenges</h2>
        ${
          p.pipeline
            ? `<ol class="case-pipeline" data-reveal-group aria-label="Pipeline stages">${p.pipeline.map((s, n) => `<li data-reveal><span class="case-pipeline__n">${n + 1}</span><span class="case-pipeline__k">${s.k}</span><span class="case-pipeline__v">${esc(s.v)}</span></li>`).join('')}</ol>`
            : ''
        }
        <ol class="challenges">
          ${p.challenges.map((c, n) => `<li data-reveal><span class="challenges__n">${String(n + 1).padStart(2, '0')}</span><h3>${esc(c.title)}</h3><p>${esc(c.body)}</p></li>`).join('')}
        </ol>
      </section>
      <section id="architecture" class="case-sec">
        <h2 class="case-sec__title" data-reveal>Architecture &amp; integrations</h2>
        <dl class="arch" data-reveal-group>${p.architecture.map((a) => `<div data-reveal><dt>${esc(a.k)}</dt><dd>${esc(a.v)}</dd></div>`).join('')}</dl>
        <p class="chapter__stack" data-reveal><span class="label">Built with</span> ${p.stack.map(esc).join('<span aria-hidden="true"> / </span>')}</p>
      </section>
    </div>
  </div>

  <section id="screens" class="case-screens stage" aria-labelledby="screens-title">
    <div class="wrap">
      <h2 class="case-sec__title" id="screens-title" data-reveal>Screens</h2>
      ${p.screens
        .map(
          (g) => `<div class="case-gallery">
        <h3 class="label" data-reveal>${esc(g.title)}</h3>
        <div class="case-gallery__row case-gallery__row--${p.kind}" data-reveal-group>${g.items.map((s) => `<div data-reveal>${shot(p.kind, s, { caption: true })}</div>`).join('')}</div>
      </div>`,
        )
        .join('')}
    </div>
  </section>

  <section id="outcome" class="wrap case-outcome" aria-labelledby="outcome-title">
    <h2 class="case-sec__title" id="outcome-title" data-reveal>Outcome</h2>
    <ul class="case-outcome__list" data-reveal-group>${p.outcome.map((o) => `<li data-reveal>${esc(o)}</li>`).join('')}</ul>
  </section>

  <a class="next-case" href="/work/${next.slug}/" style="${themeStyle(next.theme)}">
    <span class="wrap next-case__inner">
      <span class="label">Next project</span>
      <span class="next-case__name">${esc(next.name)} ${ICON.right}</span>
      <span class="next-case__tag">${esc(next.tagline)}</span>
    </span>
  </a>
</main>
${contactSection()}`;
  return page({
    title: `${p.name} — Case study · ${site.name}`,
    description: `${p.name}: ${p.summary}`,
    path: `/work/${p.slug}/`,
    body,
    bodyClass: `case-page case-page--${p.theme.bg === '#0A0E18' || p.theme.bg === '#0F2419' ? 'dark' : 'light'}`,
    bodyStyle: `${themeStyle(p.theme)};--native:${native}px`,
  });
}

function notFound() {
  const body = `<main id="main" class="nf">
  <div class="wrap">
    <p class="eyebrow">404</p>
    <h1 class="section-title">This screen <em>didn’t ship.</em></h1>
    <p class="section-lede">The page you’re looking for doesn’t exist. The work does.</p>
    <p class="nf__actions"><a class="btn btn--ink" href="/">Back home ${ICON.right}</a> <a class="btn btn--line" href="/#work">Selected work</a></p>
  </div>
</main>`;
  return page({ title: `Not found · ${site.name}`, description: site.description, path: '/404', body, bodyClass: 'nf-page' });
}

// ---------------------------------------------------------------- write
function write(rel, html) {
  const out = join(ROOT, rel);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  console.log('  wrote', rel, `(${(html.length / 1024).toFixed(1)} kB)`);
}

if (existsSync(join(ROOT, 'work'))) rmSync(join(ROOT, 'work'), { recursive: true });
write('index.html', homepage());
projects.forEach((p, i) => write(`work/${p.slug}/index.html`, caseStudy(p, i)));
write('404.html', notFound());
write(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${['/', ...projects.map((p) => `/work/${p.slug}/`)].map((u) => `  <url><loc>${site.url}${u}</loc></url>`).join('\n')}
</urlset>
`,
);
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);
