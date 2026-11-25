# divine-ajayi.vercel.app

Personal portfolio of Divine Ajayi — static HTML, CSS and vanilla JS. No framework, no runtime dependencies.

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
```

## Editing

1. Change copy or data in `src/content.mjs` (or styles/scripts in `assets/`).
2. Run `node scripts/build.mjs` — it regenerates the HTML and stamps asset URLs with a content hash.
3. Commit the generated files. Vercel serves the repository as static files; there is no build step on deploy.

## CV

Edit `src/cv/cv.html`, then run `swift scripts/cv.swift` from the repo root. It fails if either page overflows A4 and writes `divine-ajayi-cv.pdf`, which the Resume buttons link to. Ligatures are disabled in the CV so applicant-tracking systems extract words like “Flutter” correctly.

Preview locally with `python3 -m http.server 4321` and open http://localhost:4321.
