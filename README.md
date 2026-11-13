# Distinct Designs Construction — Landing Pages

High-ticket lead capture landing pages for **Distinct Designs Construction**, a licensed
luxury custom home builder (CA GC #1145786) serving the High Desert and Coachella Valley.

**Pure HTML / CSS / vanilla JS. No frameworks, no dependencies, no build step.**
Deployed as a static site on Vercel.

---

## Pages

| Page | Route | Status |
|---|---|---|
| Hub (index of landing pages) | `/` | Live |
| Custom Home Build | `/custom-home-build-hero-form/` | Live |
| Whole-Home Remodel | `/whole-home-remodel-hero-form/` | Live |
| Custom ADU & Guest Suite | `/custom-adu-hero-form/` | Live |

### Lead form in the hero

Every landing page carries its lead form in the hero, so it is visible without
scrolling. The pages began as `-hero-form` twins of standard pages that had the
form in the closing section. The standard pages were removed; the folders keep the
`-hero-form` suffix because those URLs are already in use.

- There is **one** form per page. Two copies would mean duplicate `id`s, which
  breaks `<label for>` and `getElementById`.
- The hero form carries `id="form"`, so the nav, sticky bar and footer links all
  still resolve. The closing section keeps its photo, heading and copy, and gains
  a button back up to the form.
- The hero CTA row has no "Schedule a Consultation" button, since it would scroll to
  a form already on screen. The call button stays.
- Each page is self-canonical on the host that currently serves it:
  `https://distinct-designs-construction.vercel.app/<slug>-hero-form/`. The same
  three URLs are the only ones in `sitemap.xml`. `go.distinctdesignsconstruction.com`
  is the intended future host, but it has no DNS yet, so canonicals do not use it.
- The hero-form CSS lives in section 9.b of the shared stylesheet. All three
  stylesheets are byte-identical.

The hub at `/` is an internal index — it is `noindex, nofollow` and links to each
landing page. All three pages are now built and linked.

The remodel and ADU pages are fully photographed, and `placeholder.svg` is gone
with their last gray blocks. **One placeholder remains: the custom-home-build
hero**, which is also the only image still carrying the `.grade` filter — once it
is replaced, that rule and its last usage can be deleted.

The three hub card images are also stand-ins, but the hub is an internal
`noindex` index, so they are lower priority.

The ADU page's budget dropdown ranges are an assumption — the source copy does not
specify them — and are marked with a TODO in the markup.

### Shared photographs

Shared photos are duplicated into each page's own `images/` folder rather than
served from one place, which keeps every page folder self-contained and
independently deployable. The trade-off: replacing a shared photo means replacing
it in every folder that uses it.

| Photo | Used on |
|---|---|
| the four project tiles | all three pages |
| `footer-cta.webp` (great room) | custom-home-build, custom-adu |
| `process-crew.webp` | each page has its own crew photo |

Two photos were shared and then diverged. On the ADU page they are named for their
**subject** rather than their slot or origin, so no two files share a name with
different contents:

- `hero-garage.webp` — the garage, once the remodel hero
- `process-break-patio.webp` — the sunset patio, once the remodel transition band

Both of those slots on the remodel page now hold different photographs under their
original names. **When a shared photo diverges, rename the copy** rather than
leaving two files with one name and two contents.

---

## Structure

```
.
├── index.html                          # Hub page (no footer, no JS)
├── styles.css                          # Hub styles (shares the design tokens)
├── robots.txt, sitemap.xml             # Crawling: sitemap lists the hero-form pages
├── favicon.ico, favicon.png, apple-touch-icon.png
├── vercel.json                         # Trailing slashes, font headers
├── .vercelignore                       # Internal files kept off the public site
├── assets/                             # Hub card images
├── custom-home-build-hero-form/        # Landing page 1 — self-contained
│   ├── index.html
│   ├── styles.css                      # The design system
│   ├── script.js
│   ├── images/
│   └── README.md                       # Full page docs: tokens, classes, gotchas
├── whole-home-remodel-hero-form/       # Landing page 2 — self-contained
├── custom-adu-hero-form/               # Landing page 3 — self-contained
├── thank-you/                          # Shared confirmation page after a lead
├── GHL-landings/                       # Single-file builds for GoHighLevel
└── distinct-designs-landing-pages.html # Source copy for all three pages
```

Each landing page folder is **self-contained** — its own HTML, CSS, JS, and images.
That keeps pages independently deployable and avoids one page's changes breaking another.

---

## Local development

No build step. Serve the folder with any static server:

```bash
python3 -m http.server 8000
# → http://localhost:8000/
```

Opening `index.html` directly via `file://` also works, but the root-relative links
to the page folders will not resolve. Use a server.

---

## Adding another page

Full instructions are in
[`custom-home-build-hero-form/README.md`](custom-home-build-hero-form/README.md).
Short version:

1. `cp -r custom-home-build-hero-form <new-slug>`
2. Swap in the copy from the matching `<article>` in `distinct-designs-landing-pages.html`
3. Update `<title>`, meta description, canonical URL, the Open Graph tags, and
   both JSON-LD blocks (FAQ and LocalBusiness)
4. Replace the images in that folder
5. In the hub's `index.html`, change that card's wrapper from
   `<div class="hub-card__link" aria-disabled="true">` to
   `<a class="hub-card__link" href="/<new-slug>/">`, and swap its
   `hub-card__status` to `hub-card__status--live` with the label `Live`

The stylesheet is a shared design system driven by `:root` tokens — rebrand or
retune by editing those values, not individual rules.

---

## Photography

The landing pages carry real project photography throughout. Only the
custom-home-build hero is still stock.

Placeholders are marked two ways, so any that reappear are easy to find:

```bash
grep -rn 'data-placeholder' --include='*.html' .
```

That currently returns the custom-home-build hero plus the three hub card images,
which are stand-ins on an internal `noindex` page.

When swapping a real photo in, drop both the `.grade` class and the
`data-placeholder` attribute — the grade exists only to reconcile mismatched stock
sources and skews skin tones over photographs of people. See the per-page README
for exact slot dimensions.

---

## Third-party scripts

WhatConverts lives in each landing page's `<head>`. The hub carries no tags.
The Google tag and the Meta pixel are on the three landing pages and on
`thank-you/`. There is no review widget.

| Script | Purpose | Notes |
|---|---|---|
| WhatConverts (`174814`) | call and form lead tracking | reads URL, referrer, query and hash |

WhatConverts loads with `async`, so it no longer blocks first paint. Page
behavior lives in `script.js`, loaded with `defer`.

---

## SEO and site-level files

| File | Purpose |
|---|---|
| `robots.txt` | allows everything and points at the sitemap |
| `sitemap.xml` | lists the three hero-form pages only |
| `favicon.ico`, `favicon.png`, `apple-touch-icon.png` | the monogram cropped from the logo |
| `vercel.json` | trailing-slash URLs, `index.html` duplicate redirects, plus cache and CORS headers for fonts |
| `.vercelignore` | keeps internal files out of the deployment |

- **URLs end in a slash.** `vercel.json` sets `trailingSlash: true`, so
  `/custom-adu-hero-form` redirects to `/custom-adu-hero-form/`. It has to be this
  way round: the pages use relative paths (`styles.css`, `images/...`), which only
  resolve inside the folder when the URL ends in a slash.
- **`index.html` copies redirect to the directory URL.** `/custom-home-build-hero-form/index.html`,
  `/whole-home-remodel-hero-form/index.html`, `/custom-adu-hero-form/index.html`,
  `/thank-you/index.html`, and `/index.html` are the same documents as the slash
  URLs, so `vercel.json` sends each one to its slash URL.
- **The hub and the thank-you page stay `noindex, nofollow`.** Do not block them in
  `robots.txt`: a crawler that cannot fetch a page never sees its `noindex`.
- **Each landing page carries Open Graph tags and a LocalBusiness JSON-LD block.**
  The schema holds only what the client publishes (name, phone, town, profiles,
  and the page's own areas list). It has no street address, hours or ratings; add
  them only when the client supplies them.
- **`images/og-image.jpg`** in each page folder is the 1200×630 social card, cut
  from that page's hero. Regenerate it when the hero changes.
- **Internal files are not deployed.** `.vercelignore` excludes the source copy
  draft, `GHL-landings/`, `AGENTS.md` and every `README.md`, so they return 404.

## Performance

- **Fonts are self-hosted.** Each page folder has its own `fonts/` (three variable
  woff2 files, latin subset) declared in section 0 of `styles.css`, with the two
  above-the-fold faces preloaded. The hub and thank-you page still use Google
  Fonts; neither is a landing page.
- **Hero `-1200` variants are encoded at WebP quality 60.** They sit under a scrim,
  where the saving is invisible.
- **`process-crew-800.webp`** is the small-screen variant of the crew photo, chosen
  through `srcset`. Replace both files together.

---

## Deployment

Deployed on Vercel as a static site: no framework preset, no build command.
Pushes to `main` deploy to production; pull requests get preview URLs.

---

## Conventions worth preserving

- **Scroll reveal fails open.** Content is visible by default; the hidden state is
  only armed by JS. Never move `opacity: 0` onto a bare `.reveal`.
- **Contrast is WCAG AA verified.** `--color-text-muted` is tuned to pass on both
  the page background and the sand background.
- **Scrims over photography are sized by measurement, not by eye.** The hero
  scrim and the project-tile scrim were both set by sampling the rendered
  background behind each text block and checking it against WCAG AA. The tile
  scrim deliberately uses pixel gradient stops rather than percentages, because
  the label is a fixed size while the tiles are not.
- **Replacing an image under its existing filename does not bust caches.** When
  verifying a swap, check the image's intrinsic size against the file on disk
  rather than trusting a screenshot.
- **FAQ JSON-LD must stay in sync** with the visible FAQ copy on each page.
- **`--nav-h` must equal the bar's real height at every width.** The hero is
  `calc(100dvh - var(--nav-h))`, so a 2px drift shows up as the hero overshooting
  the viewport. The link list therefore carries `white-space: nowrap` and
  `flex-shrink: 0`: when flex squeezed a label into wrapping, the bar grew to 73px
  and broke the calculation. Measured minimum for logo + links + button pair is
  about 1090px, which is why the links appear at 1120 and not at 1024.
- **Form fields must be able to shrink.** `.lead-form__row` carries `min-width: 0`
  and the controls carry `width: 100%`. A `1fr` track is `minmax(auto, 1fr)`, and
  that `auto` floor is the item's min-content: inputs and textareas bring their own
  intrinsic width from the `size`/`cols` defaults, which floored each column at
  ~257px and pushed the two-column form outside the narrow hero card. Removing
  either declaration brings the overflow back.
- **Copy is client-supplied and used verbatim.** Do not paraphrase or condense it.
  One deliberate exception: em dashes were removed from all three landing pages at
  the client's request. Each was replaced with the punctuation its own sentence
  needed (a comma, a colon, a full stop, or parentheses for a matched pair) rather
  than by one blanket substitution. Wording is unchanged. En dashes stay in the
  budget ranges, where they are the correct mark for a numeric span.
