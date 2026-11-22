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

## Home page sections
| # | Section | From |
|---|---|---|
| 1 | Hero: promise + proof + pill shortcuts to services | ref layout, AML message |
| 2 | Statement in 3 grid cells (years, mission, warranty) | ref |
| 3 | Two big offer banners (PPF, Wrap) | AML |
| 4 | Services grid → service pages | AML |
| 5 | "From X €" price tiers | AML |
| 6 | Testimonial mosaic + partner logos | ref + AML |
| 7 | Gallery of recent work | AML |
| 8 | Quote form with budget question | AML |
| 9 | FAQ with big numerals | ref |
| 10 | Collection & delivery (objection killer) | AML |
| 11 | Map + contact info | ref |
| – | Footer "Let's make it happen together" + mobile call bar | ref |

## Images to supply

Every placeholder on the page shows its code (e.g. `[H1]`). Use the client's own photos, shot on a dark background when possible so they match the theme.

### Home (`index.html`)
| Code | What to shoot / supply | Size |
|---|---|---|
| H1 | Hero: flagship car, 3/4 rear, dark studio, low-key light (or a 10s silent video loop) | 2400×1200 |
| O1 | PPF being applied: installer squeegeeing clear film on a bonnet | 1200×1400 portrait |
| O2 | Striking colour wrap result, side profile | 1200×1400 portrait |
| S1 | Freshly wrapped car | 1200×900 |
| S2 | Water beading on protected paint | 1200×900 |
| S3 | Mirror-gloss paint reflection (ceramic) | 1200×900 |
| S4 | Tinted rear windows, interior view | 1200×900 |
| S5 | Forged wheel close-up | 1200×900 |
| S6 | Carbon diffuser + exhaust tips | 1200×900 |
| T1–T3 | Client portraits with their cars, moody light (with permission) | 800×800 |
| L1–L6 | Partner / film brand logos, white versions (SVG or PNG) | ~300×140 |
| G1, G6 | Signature project / several client cars together | 1600×800 |
| G2–G5 | Finished car, detail shot, before/after, workshop in action | 1000×1000 |
| F1 | Car in the workshop (inside FAQ answer 01) | 400×300 |
| D1 | Car loaded in a closed trailer / transporter | 1400×1000 |
| M1 | Map: Google Maps embed (dark style) or static screenshot | 1400×1000 |

### Each service page (`service.html`), one set per service
| Code | What | Size |
|---|---|---|
| P1 | The service at its best (hero) | 2400×1200 |
| P2 | Macro of the benefit (water beading, scratch healing, wheel detail…) | 1200×1400 |
| P3 | Best finished car for this service | 1600×800 |
| P4–P7 | Detail/edge, during install, another model, before/after | 1000×1000 |
| P8 | Client handover | 1600×800 |

**Total:** 30 home images + 8 per service page (6 services = 48), plus 6 logos.

## Replacing a placeholder
Replace the whole placeholder `<div class="ph">…</div>` with
`<img src="img/h1.jpg" alt="Black Porsche 911 GT3 in our studio" loading="lazy">`
and give the image the same CSS sizing (e.g. `.hero img { aspect-ratio: 16/8; object-fit: cover; width: 100% }`).

## Before going live
- The quote form has no backend. Set its `action` to Formspree, Netlify Forms or your own endpoint.
- Replace `BRAND`, phone numbers, addresses, prices and testimonials.
