# Car Studio Template

A full-bleed static template for car wrapping, detailing and protection studios. Plain HTML + CSS, no build step and no JavaScript.

- **Structure:** taken from a study of a real wrap studio's site (one promise, one CTA everywhere, prices shown up front, quote form with a budget question).
- **Style:** light geometric type, pill buttons and big FAQ numerals from a dark automotive UI reference, recoloured from the landing photo.

Open `index.html` in a browser to view it.

| File | What it is |
|---|---|
| `index.html` | Home page, 7 sections |
| `service.html` | Service page template. Duplicate it once per service. |
| `style.css` | All styles. Colours and fonts are at the top in `:root`. |
| `img/` | 12 compressed WebP photos (about 1.2 MB in total) |

## Style
- **Fonts:** Urbanist 300/400/500/600 (body + headings), Mrs Saint Delafield (signature names on testimonials). Both from Google Fonts.
- **Palette (sampled from `img/hero.webp`):** warm black `#0b0705` · espresso `#140d09` / `#20140e` · leather line `#2e2018` · cream text `#f3ece5` · tan muted `#a8968a` · thread red `#c9221a` (CTAs) / `#e5352b` (hover and highlights)

## Home page sections (kept short on purpose)
7 sections, 4,110px tall at 1440px wide, against 7,038px for the reference site.
Prices, gallery and FAQ live on each service page, not the home page.

| # | Section | From |
|---|---|---|
| 1 | Full-screen hero: promise + proof + pill shortcuts to services | ref layout, AML message |
| 2 | Two edge-to-edge offers (PPF, Wrap) | AML banners, merged |
| 3 | Edge-to-edge services grid with "from X €" → service pages | AML |
| 4 | One row of client quotes + partner logos | ref + AML |
| 5 | Photo panel + quote form with budget question | AML |
| 6 | Map + contact, with the collection & delivery promise | ref + AML |
| 7 | Footer "Let's make it happen together" + mobile call bar | ref |

## Images

### Still to supply
| Code | What | Size |
|---|---|---|
| L1–L6 | Partner / film brand logos, white versions (SVG or PNG) | ~300×140 |

To fill a slot, replace its `<div class="ph">…</div>` with an `<img>`.

### In use
These are demo images. Replace them with the client's own work before launch, so the site never presents stock photos as real projects.

| File | Used for | Source |
|---|---|---|
| `hero` | Home hero | Supplied (`hero-section.png`) |
| `ppf-install` | PPF offer, service hero | Clarity Coat / Unsplash |
| `wrap-light` | Wrap offer, gallery | Tom Sodoge / Unsplash |
| `wrap-gloss` | Wrap card | Linda Pomerantz Zhang / Unsplash |
| `ppf-lines` | PPF card, service benefits | Jason Leung / Unsplash |
| `ceramic` | Ceramic card | Zac Nielson / Unsplash |
| `tint` | Tint card, gallery | Hamza Nouasria / Unsplash |
| `wheel` | Wheels card, gallery | Samuel Field / Unsplash |
| `bodykit` | Body kit card | Quentin Martinez / Unsplash |
| `custom` | Quote panel, gallery | Sindy Sussengut / Unsplash |
| `film` | Gallery | Clarity Coat / Unsplash |
| `detail` | Gallery | Vadym Lebedych / Unsplash |

## Before going live
- The quote form has no backend. Set its `action` to Formspree, Netlify Forms or your own endpoint.
- **Demo identity:** Fil Rouge Atelier ("red thread") is fictional. The phone uses a French range reserved for fiction and the email uses the reserved `.example` domain. Replace the name, phone, email, address, prices, stats and testimonials.
- **Map:** in `index.html`, change `Gerland, 69007 Lyon` in the iframe `src` and the "Open in Google Maps" link (URL-encoded). No API key needed.
- **EU sites:** the Google Maps embed loads content from Google, so check whether it must wait behind cookie consent.
- Replace the demo photos with the client's own.
- The hero shows hand-stitched leather. If the studio doesn't do upholstery, add it as a service or swap the hero.
