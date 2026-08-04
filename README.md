# GERGÖ GAINS — website

Static single-page site. No backend, no build step, no API keys.
Deployed with GitHub Pages from the `main` branch, root folder.
Repo: `MillenaryMILF/Gergogains`.

**Live URL:** https://gergogains.com  (github.io-Fallback: https://millenarymilf.github.io/Gergogains/)

(Project-repo URL, so the site lives under a `/Gergogains/` path. Every asset
path in the repo is relative, so this works unchanged — and keeps working once
you point a custom domain at the root.)

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
   | CNAME | `www` | `millenarymilf.github.io` |

3. On GitHub: **Settings → Pages → Custom domain**, type your domain, Save.
   GitHub writes the `CNAME` file for you — you do not edit it by hand.
4. Wait for the check to go green, then tick **Enforce HTTPS**. Certificate
   issuance can take up to an hour. This is normal; do not keep re-saving.
5. ~~Replace the placeholder domain across the repo.~~ **Done** — `config.js`,
   the five SEO tags in `index.html`, `robots.txt`, `sitemap.xml` and the contact
   address on the three legal pages all point at `gergogains.com`.

#### 1a · Make `info@gergogains.com` receive mail (≈5 min)

The address is already live on the three legal pages, but nothing is listening
yet — mail sent to it bounces today. Google Ads checks that the contact on your
privacy policy is reachable, so do this before running traffic.

**Plan: forward `info@` into your existing Gmail.** Free, no new mailbox to
check. Swappable later — if you outgrow it, you point the MX records at a real
provider and nothing in this repo changes.

If the domain's DNS is on **Cloudflare** (Email Routing is free and the easiest
path):

1. Cloudflare dashboard → your domain → **Email → Email Routing → Get started**.
2. Cloudflare offers to add the required MX + TXT records for you — accept.
   These do not touch the four `A` records, so the website keeps working.
3. Add a route: `info@gergogains.com` → your Gmail address.
4. Click the verification link Cloudflare emails to that Gmail. Not verified,
   not forwarding.
5. Send a test from any other address and confirm it lands.

If the DNS is **not** on Cloudflare, either move the nameservers there, or use
**ImprovMX**, which does the same job on a free tier at whatever registrar you
are on.

**The gap worth knowing about:** forwarding is inbound only. When a customer
mails `info@` and you hit reply in Gmail, the reply goes out as your personal
Gmail address — the customer sees a different address than the one they wrote
to, on a paid product. Fix it in Gmail: **Settings → Accounts and Import → Send
mail as → Add another email address**, enter `info@gergogains.com`, and confirm
via the code that arrives through the forward you just set up. Then pick it as
the From when replying. Takes two minutes and is the difference between looking
like a business and looking like a hobby.

**Also add these two DNS records** while you are in there. Without them your
domain is trivially spoofable, which matters once it is attached to ads and
payments:

| Type | Name      | Value |
|------|-----------|-------|
| TXT  | `@`       | `v=spf1 include:_spf.google.com ~all` |
| TXT  | `_dmarc`  | `v=DMARC1; p=none; rua=mailto:info@gergogains.com` |

SPF names Gmail as allowed to send for the domain, which is what the "send mail
as" above relies on. DMARC starts at `p=none` deliberately — that is
report-only. Do not jump straight to `p=reject`; watch the reports for a few
weeks first, or you risk silently binning your own mail.

### [ ] 2 · Payments — Stripe (≈20 min)

The funnel: free spec sheet on the site → free written **status check** by email
(you read the numbers yourself) → **The Programme, $29** for the engineered plan.
You build those plans by hand at first, which is why nothing here needs a server.

**⚠️ Do this first: the VAT question.** Lemon Squeezy was a *merchant of record* —
they charged the customer, collected EU VAT and remitted it, which is why selling
from Austria needed no VAT registration. **Stripe is not.** On Stripe you are the
seller of record, so EU B2C digital VAT is yours: register for **OSS**, and turn on
**Stripe Tax** so it is at least calculated and collected at checkout. Stripe Tax
does not remit for you. Settle this with your Steuerberater before the first sale —
nothing technical is blocking you, the tax treatment is.

1. **Activate the account.** dashboard.stripe.com → business details, IBAN for
   payouts. Account `GergöGains` already exists.
2. **Turn on Stripe Tax.** Settings → Tax → add Austria as your origin, enable
   automatic calculation.
3. **Create three products** (Product catalogue → Add product), one-time price,
   USD:

   | Product | Price | Type |
   |---|---|---|
   | The Programme | $29 | Digital / one-time |
   | The Audit | $199 | Service / one-time |
   | The Commission | $499 | Service / one-time |

4. **Create a Payment Link per product** (Payment links → New). On each one:
   - **Collect customer email** — ON. You cannot deliver anything without it.
   - **After payment** → show a confirmation message, or point it at a thank-you
     page. Say plainly that the plan arrives by email within 24 hours.
   - Leave "Allow promotion codes" on if you want discount codes later.
5. **Copy the three URLs** — they look like `https://buy.stripe.com/aBC123xyz`.
6. **Paste them into `assets/js/config.js` → `CHECKOUT`**, replacing the three
   `REPLACE-…` strings. Keep `provider: "stripe"`. That is the only file to edit.
7. **Test in Stripe test mode** with card `4242 4242 4242 4242`, any future expiry,
   any CVC. Confirm the receipt arrives and the email reaches you.
8. **Set the customer email receipt** (Settings → Emails → successful payments) so
   buyers get proof of purchase without you sending it.

Until step 6 is done the buy button does not dump anyone on a broken URL — it
shows "card checkout is not connected yet" and gives the contact address instead.

**Delivering The Programme by hand.** The free status-check form already emails you
the buyer's full spec: goal, days, environment, experience, bodyweight, FFMI,
protein range and the per-muscle volume targets. When a $29 order comes in, match
the Stripe receipt email to that submission, build weeks 2–8 from the same engine
the site runs, and send the PDF. Nothing else is required to fulfil an order.

**Crypto** is already wired alongside at 30% off and stays invisible until the
Coinbase Commerce URLs in `CHECKOUT_CRYPTO` are real. Same VAT position as Stripe.

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
index.html               the site — markup, inline <style>, inline <script>
admin.html               low-code editor (noindex) — words, settings, photos
404.html                 not-found page (GitHub Pages serves this automatically)
audit-sample.html        worked example of the $199 Audit deliverable
volume-calculator.html   standalone tool — weekly sets per muscle
bottleneck-analysis.html standalone tool — which muscle is the constraint
ffmi-calculator.html     standalone tool — FFMI from mass/height/body fat
training-plan.html       sample deliverable
aesthetic-report.html    sample deliverable
privacy.html             legal — business details filled in, review before selling
terms.html               legal — same
refund.html              legal — same
robots.txt  sitemap.xml
CNAME                    gergogains.com — written by GitHub Pages, don't edit
CNAME.example            what it looks like before a domain is connected
.nojekyll                skips Jekyll processing
assets/
  css/fonts.css          @font-face rules — GENERATED, do not hand-edit
  css/legal.css          styling for the legal pages + audit sample
  css/tool.css           styling for the three tool pages
  fonts/                 16 self-hosted .woff2 files (381 KB)
  js/config.js           ⚠️ ALL PLACEHOLDERS
  js/consent.js          GDPR gate + conversion tracking
  js/exercise-db.js      60 exercises, fractional muscle contributions
  js/programming.js      the engine — volume, frequency, RIR, deloads
  js/plan-ui.js          renders engine output + paywall
  js/tool-common.js      DOM helpers for the tool pages (no training logic)
  js/admin.js            the editor: GitHub Contents API, marker surgery, crop
  img/                   7 photos as .webp + .jpg, icons, OG image
  video/coach.mp4        avatar clip
docs/
  engine-tests.js        9 assertions — run before every commit
  prepare-photo.py       crops/resizes a photo into a slot, writes .jpg + .webp
  content-plan.md        launch content plan for TikTok / YouTube / Journal
  analyze.js             serverless analysis — PARKED, not wired up
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

## Die Seite selbst bearbeiten (ohne Terminal)

### Der Editor — der einfachste Weg

**https://gergogains.com/admin.html**

Texte, Einstellungen und Fotos ändern, ohne Code anzufassen. Jede Speicherung ist
ein ganz normaler Commit, also lässt sich alles über GitHub wieder rückgängig
machen. Die Seite ist `noindex` und in `robots.txt` gesperrt — sie taucht in
keiner Suchmaschine auf.

**Einmalig einrichten (2 Minuten):** Der Editor braucht Schreibrechte auf das
Repo. Die kommen von einem Token, das du selbst erstellst:

1. [github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new)
2. **Expiration:** 90 Tage
3. **Repository access:** *Only select repositories* → `Gergogains`
4. **Permissions:** Repository permissions → **Contents** → **Read and write**.
   Sonst nichts.
5. Token kopieren, im Editor einfügen. Es bleibt nur in diesem Browser.

⚠️ **Das Token ist wie ein Passwort.** Nicht auf fremden Rechnern eingeben, nicht
auf Screenshots. Mit den Rechten oben kann es ausschliesslich in dieses eine Repo
schreiben — nicht in andere Repos, nicht in Kontoeinstellungen. Falls es doch mal
irgendwo landet: auf der GitHub-Token-Seite löschen, dann ist der Zugriff sofort
weg.

**Die drei Reiter:**

| Reiter | Was du damit machst |
|---|---|
| **Words** | Überschriften und Absätze auf der Startseite |
| **Settings** | Stripe-Links, Social-Links, Kontakt-E-Mail, Tracking-IDs |
| **Photos** | Foto hochladen, mit Reglern zuschneiden, veröffentlichen |

Beim Foto-Reiter erzeugt der Editor automatisch **beide** Dateien (`.jpg` und
`.webp`). Genau das ist die Falle beim Hochladen von Hand: der Browser bevorzugt
die WebP-Datei, also bleibt beim Ersetzen nur des JPGs das alte Bild stehen.

**Welche Texte editierbar sind:** alles, was in `index.html` zwischen
`<!--e:name-->` und `<!--/e-->` steht. Kommt später ein Textblock dazu, einfach
diese beiden Marker drumherum setzen und einen Eintrag in `LABELS` in
`assets/js/admin.js` ergänzen — dann erscheint das Feld im Editor.

### Der Web-Editor (für alles andere)

Im Repo auf github.com die Taste **`.`** drücken → vollständiges VS Code im
Browser, nichts zu installieren. Damit kommst du an *jede* Datei, nicht nur an
die im Editor freigegebenen.

Direktlink: https://github.dev/MillenaryMILF/Gergogains

| Was du ändern willst | Datei |
|---|---|
| Preise, Zahlungslinks, Tracking-IDs, Domain | `assets/js/config.js` |
| Überschriften, Fließtext, FAQ, Journal-Artikel | `index.html` |
| Rechtstexte | `privacy.html`, `terms.html`, `refund.html` |

### Ein Bild austauschen — ohne Editor

Der Foto-Reiter oben macht das alles. Falls du es doch lieber im Terminal machst:

```bash
pip install Pillow
python3 docs/prepare-photo.py ~/Desktop/neues-foto.jpg editorial --zoom 1.8 --focus 50,62
```

`--zoom` grösser als 1 zoomt näher heran, `--focus x,y` legt den Bildpunkt fest,
der mittig bleibt. Slots: `hero`, `editorial`, `gallery-fullbody`,
`gallery-field`, `gallery-coach`, `community-band`, `og-image`.


### Sicherheitsnetz
Jede Änderung ist ein Commit. Wenn etwas kaputt geht, im Repo auf **Commits**
gehen, den letzten guten auswählen und **Revert**. Nichts ist unwiederbringlich.

---

## Before every commit

```bash
node docs/engine-tests.js     # 9 assertions, all must pass
```

The suite loads `exercise-db.js` and `programming.js` relative to its own
location, so it runs from any checkout.

Two rules that come from outages, not theory:

1. **Never anchor an edit in `index.html` to a comment string.** Several exist in
   both the `<style>` and the `<script>` block. A CSS block once landed inside
   the script, threw `SyntaxError`, aborted the whole inline script, and because
   the scroll-reveal observer never ran, every `.rv` element stayed at
   `opacity: 0` and the page rendered blank. Anchor to `</style>` or to unique
   markup.
2. **Replace prices longest-first.** `$99`→`$199` then `$19`→`$29` turns `$199`
   into `$299`.

After any change to `index.html`, confirm the inline script still parses and no
`.rv` element is stuck at opacity 0 after scrolling.

**Capacity lives in one place.** `GG_ENGINE.capacity({days})` is the only
definition of how many counted sets a week can hold. The tool pages call it. If
you change it, the copy quoting "roughly 190 counted sets" in `index.html`
(Method, principle 02), `volume-calculator.html` and `audit-sample.html` needs
updating too — those are the only hardcoded mentions.

## Things deliberately left undone

- **`docs/analyze.js` is not wired up.** It calls Claude with an
  `ANTHROPIC_API_KEY`, which needs a server. GitHub Pages serves static files
  only, so activating it means adding Cloudflare Pages Functions or Vercel.
  The plan builder currently runs its rule-based logic in the browser — which is
  also why the site needs no keys and leaks nothing.

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
