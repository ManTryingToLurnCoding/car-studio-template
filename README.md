# Car Studio Template

A static template for car wrapping, detailing and protection studios. Plain HTML + CSS, no build step and no JavaScript.

- **Structure:** taken from a study of a real wrap studio's site (one promise, one CTA everywhere, prices shown up front, quote form with a budget question, a gallery of real work).
- **Style:** inspired by a dark automotive UI reference (navy-black, thin grid lines, light geometric type, pill buttons, big FAQ numerals).

Open `index.html` in a browser to view it.

| File | What it is |
|---|---|
| `index.html` | Home page, 11 sections |
| `service.html` | Service page template. Duplicate it once per service. |
| `style.css` | All styles. Colours and fonts are at the top in `:root`. |

## Style
- **Fonts:** Urbanist 300/400/500/600 (body + headings), Mrs Saint Delafield (signature names on testimonials). Both from Google Fonts.
- **Palette:** bg `#0a0f16` · panel `#0e151e` / `#121b26` · lines `#1c2632` · text `#e8ecf1` · muted `#7b8796` · white `#fff` (CTAs) · accent `#3d8bff` (focus + labels only)

## Home page sections (kept short on purpose)
7 sections, about 30% shorter than the reference site (4,942px vs 7,038px at 1440px wide).
Prices, gallery and FAQ live on each service page, not the home page.

| # | Section | From |
|---|---|---|
| 1 | Hero: promise + proof + pill shortcuts to services | ref layout, AML message |
| 2 | Two offers side by side (PPF, Wrap) | AML banners, merged |
| 3 | Services grid with "from X €" → service pages | AML |
| 4 | One row of client quotes + partner logos | ref + AML |
| 5 | Quote form with budget question | AML |
| 6 | Map + contact, with the collection & delivery promise | ref + AML |
| 7 | Footer "Let's make it happen together" + mobile call bar | ref |

## Images to supply

Every placeholder on the page shows its code (e.g. `[H1]`). Use the client's own photos, shot on a dark background when possible so they match the theme.

### Home (`index.html`)
| Code | What to shoot / supply | Size |
|---|---|---|
| H1 | Hero: flagship car, 3/4 rear, dark studio, low-key light (or a 10s silent video loop) | 2400×1050 |
| O1 | PPF being applied: installer squeegeeing clear film on a bonnet | 1400×900 |
| O2 | Striking colour wrap result, side profile | 1400×900 |
| S1 | Freshly wrapped car | 1200×750 |
| S2 | Water beading on protected paint | 1200×750 |
| S3 | Mirror-gloss paint reflection (ceramic) | 1200×750 |
| S4 | Tinted rear windows | 1200×750 |
| S5 | Forged wheel close-up | 1200×750 |
| S6 | Carbon diffuser + exhaust tips | 1200×750 |
| L1–L6 | Partner / film brand logos, white versions (SVG or PNG) | ~300×140 |
| M1 | Map: Google Maps embed (dark style) or static screenshot | 1400×1000 |

### Each service page (`service.html`), one set per service
| Code | What | Size |
|---|---|---|
| P1 | The service at its best (hero) | 2400×1200 |
| P2 | Macro of the benefit (water beading, scratch healing, wheel detail…) | 1200×1400 |
| P3 | Best finished car for this service | 1600×800 |
| P4–P7 | Detail/edge, during install, another model, before/after | 1000×1000 |
| P8 | Client handover | 1600×800 |

**Total:** 10 home images + 6 logos, plus 8 per service page (6 services = 48).

## Replacing a placeholder
Replace the whole placeholder `<div class="ph">…</div>` with
`<img src="img/h1.jpg" alt="Black Porsche 911 GT3 in our studio" loading="lazy">`
and give the image the same CSS sizing (e.g. `.hero img { aspect-ratio: 16/8; object-fit: cover; width: 100% }`).

## Before going live
- The quote form has no backend. Set its `action` to Formspree, Netlify Forms or your own endpoint.
- Replace `BRAND`, phone numbers, addresses, prices and testimonials.
