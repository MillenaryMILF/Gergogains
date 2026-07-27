# GERGÖ GAINS — website

Static single-page site. No backend, no build step, no API keys.
Deployed with GitHub Pages straight from the `main` branch.

**Live URL:** https://gergoszittyai.github.io/

---

## WHAT I NEED TO DO NEXT — the whole checklist

Three jobs. Roughly 30 minutes total, in this order.

### [ ] 1 · Domain (≈10 min + DNS wait)

1. Buy the domain. Cloudflare Registrar sells at cost, no markup (~€10/yr).
2. At your registrar, add these DNS records:

   | Type  | Name  | Value |
   |-------|-------|-------|
   | A     | `@`   | `185.199.108.153` |
   | A     | `@`   | `185.199.109.153` |
   | A     | `@`   | `185.199.110.153` |
   | A     | `@`   | `185.199.111.153` |
   | CNAME | `www` | `gergoszittyai.github.io` |

3. On GitHub: **Settings → Pages → Custom domain**, type your domain, Save.
   GitHub writes the `CNAME` file for you — you do not edit it by hand.
4. Wait for the check to go green, then tick **Enforce HTTPS**. Certificate
   issuance can take up to an hour. This is normal; do not keep re-saving.
5. Replace the placeholder domain in these files:
   - `assets/js/config.js` → `SITE.domain`
   - `index.html` → 5 × `YOUR-DOMAIN.example` (all in the SEO block at the top)
   - `robots.txt`, `sitemap.xml`
   - `privacy.html`, `terms.html`, `refund.html` → contact address

### [ ] 2 · Payments — Lemon Squeezy (≈15 min)

1. Create a store. Fill in payout (IBAN) and tax details. As merchant of record
   they remit EU VAT — that is the whole reason to use them from Austria.
2. Create three products matching the current prices:
   - **The Plan** — $19, digital, instant delivery
   - **The Blueprint** — $99, coaching service
   - **The Commission** — $249, coaching service
3. On **The Plan**, enable the setting that captures the customer's express
   consent to immediate delivery and waiver of the 14-day withdrawal right.
   Skip this and every buyer keeps a full refund right after downloading.
   See `refund.html` section 2.
4. Copy each product's checkout URL into **`assets/js/config.js`** → `CHECKOUT`.
   That is the only file to touch. Three lines.
5. Turn on the checkout email field — you need it to deliver coaching.
6. Set the order-confirmation email to include your booking link (Cal.com free).
   For $99/$249 that is your entire fulfilment flow.
7. Test in Lemon Squeezy **test mode**, run a card through, confirm the email
   arrives, then switch to live.

### [ ] 3 · Ads — driving traffic here (≈10 min)

The site has no ad slots and sells no ad space. This step is about **buying**
traffic and being able to tell which ads actually pay for themselves.

1. **Google Analytics 4** → Admin → Data Streams → Web. Copy the `G-XXXXXXXXXX`
   Measurement ID.
2. **Google Ads** → Tools → Conversions → create a conversion for a website
   action. Copy the `AW-XXXXXXXXX` ID and the conversion **label**.
3. Paste all three into **`assets/js/config.js`** → `TRACKING`.
4. **Google Ads will review your landing page.** It needs a reachable privacy
   policy — that is `privacy.html`, already linked in the footer. Fill in the
   `PLACEHOLDER` business details first or you risk a rejection.
5. Verify the domain in **Google Search Console** and paste the verification
   meta tag into `index.html` (a commented placeholder is waiting in the head).

Nothing tracking-related fires until both the IDs are real *and* the visitor
accepts the cookie notice. With placeholders in place the site makes zero
tracking requests — safe to ship as-is.

---

## Where every placeholder lives

| What | File | Count |
|---|---|---|
| Lemon Squeezy checkout URLs | `assets/js/config.js` → `CHECKOUT` | 3 |
| Prices and tier copy | `assets/js/config.js` → `TIERS` | 3 tiers |
| GA4 / Google Ads IDs | `assets/js/config.js` → `TRACKING` | 3 |
| Domain + contact email | `assets/js/config.js` → `SITE` | 2 |
| Domain in SEO tags | `index.html` head | 5 |
| Domain | `robots.txt`, `sitemap.xml` | 2 |
| Business name, address, dates | `privacy.html`, `terms.html`, `refund.html` | several |

`assets/js/config.js` is the file you will actually spend time in. Everything
commercial is in there.

---

## Structure

```
index.html               the site (81 KB)
training-plan.html       sample deliverable
aesthetic-report.html    sample deliverable
privacy.html             DRAFT — fill in and review
terms.html               DRAFT — fill in and review
refund.html              DRAFT — fill in and review
robots.txt  sitemap.xml
CNAME                    empty; GitHub fills this in for you
CNAME.example            what it looks like once populated
.nojekyll                skips Jekyll processing
assets/
  css/legal.css          styling for the three legal pages only
  js/config.js           ⚠️ ALL PLACEHOLDERS
  js/consent.js          GDPR gate + conversion tracking
  img/                   7 photos as .webp + .jpg, icons, OG image
  video/coach.mp4        AI coach avatar
docs/
  analyze.js             serverless AI analysis — PARKED, not wired up
  go-live-checklist.md   the earlier Cloudflare-based plan, for reference
```

## Running it locally

No build step. Any static server works:

```bash
cd ~/Projects/gergo-gains
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` by double-clicking also works, but use the server if you
want the paths to behave exactly as they will on Pages.

---

## Things deliberately left undone

- **`docs/analyze.js` is not wired up.** It calls Claude with an
  `ANTHROPIC_API_KEY`, which needs a server. GitHub Pages serves static files
  only, so activating it means adding Cloudflare Pages Functions or Vercel.
  The plan builder currently runs its rule-based logic in the browser — which is
  also why the site needs no keys and leaks nothing.

- **Google Fonts loads from Google's CDN.** This sends visitor IPs to Google
  before consent, and EU courts have ruled against exactly that. It is
  disclosed in `privacy.html`, but the real fix is to self-host: download the
  four families, drop the `.woff2` files into `assets/fonts/`, replace the
  `<link>` in the head with local `@font-face` rules. Worth doing before you
  put real ad money behind the page.

- **No recurring tier.** Your notes mention a possible 39–79/month level.
  `config.js` has a comment marking where it would go.

- **Hero copy still says "for this demo"** in the photo-upload note. Accurate,
  but you may want different wording on a page you are paying to send traffic to.

## Notes

- No secrets in this repo, by design. Nothing here needs a key. If you ever add
  a build step that does, it goes in `.env` (already gitignored) and never in
  `config.js` — that file is public the moment it ships.
- Images are served as WebP with JPEG fallback via `<picture>`. Extracting them
  from the original inline base64 took `index.html` from 883 KB to 81 KB.
