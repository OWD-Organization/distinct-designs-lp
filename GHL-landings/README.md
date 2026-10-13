# GHL-landings

Single-file HTML builds of the landing pages, for pasting into GoHighLevel.

Each file carries its own CSS and JS inline and references no sibling files, so
one file is one complete page.

```
GHL-landings/
└── custom-home-build/
    ├── custom-home-build.html            standard version
    └── custom-home-build-hero-form.html  variant, lead form in the hero
```

The remaining two landing pages and their variants are not built yet.

## Regenerating

These are generated, not hand-edited. Change the source page, then run:

```bash
python3 GHL-landings/build.py
```

Editing a file here directly means the next build overwrites it.

## Images

Images are **not** embedded. The set weighs about 1.8 MB and base64 would make
each file too large to paste comfortably, so they are absolute URLs pointing at
the deployed site:

```
https://distinct-designs-construction.vercel.app/custom-home-build/images/
```

Both files share that one base URL, because the variant's images are
byte-identical copies of the standard page's.

To serve them from GHL instead, upload the files to the GHL media library and
replace the base URL throughout. Find them with:

```bash
grep -o 'https://[^"]*images/[a-z0-9.-]*' GHL-landings/custom-home-build/*.html | sort -u
```

## What the build changes

- **Feedbucket is stripped.** It is a staging review widget and should not run in
  front of prospects.
- **WhatConverts is kept**, so call and form tracking still works. It rewrites the
  displayed phone number at runtime for attribution, which is why the number on
  screen differs from the one in the markup.

## Before launch

The lead form validates and shows a confirmation but **does not post anywhere**.
Wire it to GHL before these go live: see the `TODO` in the inlined script near the
bottom of each file.
