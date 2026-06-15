# EDAR ESD Mat Website

A static, production-ready B2B website for EDAR — one-stop ESD and cleanroom product supplier.

## Stack
- Pure HTML5 + CSS3 (no framework, no build step)
- Vanilla JavaScript (no dependencies)
- Google Fonts: Inter + Poppins
- OpenStreetMap embed (no API key required)

## Pages
| File | Description |
|------|-------------|
| `index.html` | Home — hero, why-us, products, material, specs, quote form |
| `products.html` | Product catalog with all 6 SKUs |
| `about.html` | Company history, mission, stats |
| `contact.html` | Contact info, form, map embed |
| `resource.html` | Technical docs, FAQ |
| `terms.html` | Trading terms, payment, shipping, warranty, privacy |

## Data
- `data/products.json` — product catalog (6 items)
- `data/specs.json` — TDS technical specs

## Local Preview
```bash
cd /Users/jason/Projects/esdroll
python3 -m http.server 8000
# Open http://localhost:8000
```

## Deployment
Drop the entire folder onto any static host:
- **Cloudflare Pages** (recommended, free, global CDN)
- **Netlify** (drag-and-drop deploy)
- **Vercel** (`vercel deploy`)
- **GitHub Pages** (push to gh-pages branch)

For the contact form, replace the `handleQuoteSubmit` / `handleSampleSubmit` functions in `assets/js/main.js` with a real submission endpoint (FormSpree, Web3Forms, or your own API).

## Customization
- Brand colors: edit `:root` CSS variables in `assets/css/style.css`
- Contact details: search/replace `+86 18697593366` and `sales@edar-esd.com`
- Product data: edit `data/products.json` (no need to touch HTML)
- Hero video: replace `assets/img/hero.mp4` (currently references a missing file; falls back to cover image)

## Pending Before Production
1. Replace hero video (`assets/img/hero.mp4`) — current placeholder shows cover image
2. Wire contact form to real submission endpoint
3. Add Google Analytics / Plausible
4. Add favicon (currently uses catalog cover as fallback)
5. Replace `186****3366` masked phone numbers with full number
6. Confirm `sales@edar-esd.com` email is active and monitored
