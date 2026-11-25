# divine-ajayi.vercel.app

Personal portfolio of Divine Ajayi — static HTML, CSS and vanilla JS, plus **Relay**, a live Flutter demo app embedded in the hero.

## Structure

```
src/content.mjs      every fact on the site: projects, experience, toolkit, contact
scripts/build.mjs    zero-dependency generator → index.html, work/<slug>/index.html, 404.html, sitemap.xml, robots.txt
scripts/og.py        renders assets/og.png and assets/apple-touch-icon.png (Pillow, macOS fonts)
src/cv/cv.html       source of the CV (two A4 pages)
scripts/cv.swift     renders src/cv/cv.html → divine-ajayi-cv.pdf with macOS WebKit
assets/css/site.css  design system and layouts
assets/js/site.js    reveals, parallax, navigation, menu, copy-email, local time
assets/<project>/    app screenshots (WebP)
demo/                Relay — the Flutter app (source, tests)
scripts/build-demo.sh  analyze + test + poster + WebAssembly build → assets/demo/ and assets/relay-poster.webp
assets/demo/         compiled Flutter web build (generated, committed)
```

## Editing

1. Change copy or data in `src/content.mjs` (or styles/scripts in `assets/`).
2. Run `node scripts/build.mjs` — it regenerates the HTML and stamps asset URLs with a content hash.
3. Commit the generated files. Vercel serves the repository as static files; there is no build step on deploy.

## CV

Edit `src/cv/cv.html`, then run `swift scripts/cv.swift` from the repo root. It fails if either page overflows A4 and writes `divine-ajayi-cv.pdf`, which the Resume buttons link to. Ligatures are disabled in the CV so applicant-tracking systems extract words like “Flutter” correctly.

## Relay — the live Flutter demo

`demo/` is a small Flutter app (BLoC, get_it, Clean Architecture) that shows offline-first sync through an outbox with exponential backoff, optimistic chat with manual retry, and payment-state handling with idempotency keys and verify-before-retry. Only the network and the payment provider are simulated (`NetworkSimulator`, `FakePaymentApi`); the developer menu inside the app controls them.

```bash
bash scripts/build-demo.sh
```

That runs `flutter analyze` and `flutter test`, renders the hero still from the real widget tree (`demo/tool/poster_test.dart`), and compiles to WebAssembly with a JavaScript fallback into `assets/demo/`, self-hosting the engine files and leaving out Flutter's deprecated service worker. The site only downloads the build when a visitor taps "Run the live Flutter build"; on phones it opens full screen.

Preview locally with `python3 -m http.server 4321` and open http://localhost:4321.
