# Car Studio Template

A static demo website for car wrap, PPF and detailing studios. It uses plain HTML, CSS and a small script for the quote form, with no build step.

**Fil Rouge Atelier is a fictional business** in Scottsdale, Arizona. Its prices and sample reviews are demo content.

| File | What it is |
|---|---|
| `index.html` | Home page and quote form |
| `color-wrap.html`, `paint-protection-film.html`, `ceramic-coating.html`, `window-tint.html`, `wheels.html`, `body-kits.html` | Service pages |
| `quote.js` | Four-step quote form |
| `style.css` | All styles. Colors and fonts are at the top in `:root`. |
| `robots.txt`, `sitemap.xml`, `llms.txt` | Search and AI crawler files |
| `check.py` | Checks links, metadata, schema and the sitemap |
| `img/` | Demo photos |

Run the check before deploying:

```powershell
python check.py
```

## Connect the quote form

Paste your Make.com webhook URL into `data-webhook` on `#quote-form` in `index.html`. While it is empty, the form says "Demo mode: nothing was sent."

Leads are sent as form fields: `car`, `service`, `budget`, `preferred_time`, `name`, `phone`, `email` and `sms_consent`.

## After deploying

Replace every `https://filrouge.example` with the real site URL. This makes canonical links, social previews, the sitemap and `llms.txt` correct.

## Before using this for a real client

- Remove the `noindex` line from every page. It keeps the fictional business out of search.
- Remove the demo labels and replace the name, phone, email, address, prices, reviews and schema.
- Replace demo photos with the client's own work. Only publish real reviews and claims.
- Add a privacy policy, because the form collects personal data.
- Only text people who opted in, and complete any required SMS registration.
- Set up Google Business Profile, Bing Places and consistent directory listings.
- Check the current window tint rules for the client's state.

## Photo credits

Hero supplied. Other photos from Unsplash: Clarity Coat, Tom Sodoge, Linda Pomerantz Zhang, Jason Leung, Zac Nielson, Hamza Nouasria, Samuel Field, Quentin Martinez, Sindy Sussengut and Vadym Lebedych.
