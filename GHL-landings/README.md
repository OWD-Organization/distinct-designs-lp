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

The lead form POSTs JSON to a GoHighLevel inbound webhook, set in the
`LEAD_WEBHOOK_URL` constant in the inlined script near the bottom of each file.

**Confirm that URL before these go live.** The endpoint answers
`{"status":"Success: test request received"}` with HTTP 200 for *any* id,
including ones that do not exist, so a 200 proves nothing. The only real check is
submitting the form and seeing the contact appear in GHL.

One webhook serves all six pages: every payload carries `page`
(`custom-home-build`, `whole-home-remodel`, `custom-adu`) and `variant`
(`standard` or `hero-form`), so the workflow can branch on those instead of
needing a webhook per form.

Payload fields: `name`, `email`, `phone`, `budget` (the option label),
`budget_value`, `message`, `page`, `variant`, `page_url`, `submitted_at`.

The form carries a honeypot field named `company_website`: off-screen,
`tabindex="-1"` and inside an `aria-hidden` wrapper, so no human fills it.
Submissions arriving with a value in it are dropped before the POST. It is
positioned off-screen rather than `display: none` because some bots skip fields
they can tell are hidden.

If the POST fails the page keeps what the visitor typed and asks them to call,
rather than clearing the form.
