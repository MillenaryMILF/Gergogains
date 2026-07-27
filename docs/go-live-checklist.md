# FORMA — Go Live This Weekend

A realistic order of operations to get from `index.html` to a live, paid product. You can ship Saturday with the free tier, and switch on payments + real AI the same weekend.

---

## SATURDAY — Get it online (≈1 hour)

**1. Host the static site (free)**
- Go to **Cloudflare Pages** (recommended) or **Netlify**.
- Create a free account → "Create project" → choose "Direct upload" / "Deploy manually".
- Drag in your `index.html`. You're live on a `*.pages.dev` / `*.netlify.app` URL in under a minute.
- Tip: rename the file to `index.html` (it already is) so it loads as the homepage.

**2. Buy a domain (≈€10/yr)**
- Buy at **Cloudflare Registrar** (at-cost pricing, no markup) or Namecheap.
- Good options: `forma.fit`, `trainforma.com`, `forma-system.com`.
- In Cloudflare Pages → your project → "Custom domains" → add it. DNS auto-configures if the domain is on Cloudflare. Allow up to an hour to propagate.

**3. Optimise the photos (optional, 15 min)**
- The photos are currently embedded (≈1.2 MB file). For faster load + better SEO, export each as separate `.webp` files and swap the `src="data:image..."` for `src="/img/hero.webp"`. Not required to launch — do it once traffic grows.

✅ **End of Saturday: a live, shareable site with the free analysis + calendar export working.**

---

## SUNDAY AM — Turn on payments (≈1–2 hours)

You're in Austria selling digital + coaching across the EU, so use a **merchant-of-record** — it handles EU VAT for you.

**4. Create a Lemon Squeezy account** (or Paddle if you prefer)
- Sign up → create a **Store**.
- Complete payout details (bank/IBAN) and tax info. As MoR, *they* remit VAT; you just provide your details.

**5. Create two products**
- **The Blueprint — €99** (one-time). Description: "Guided coaching: human review, 1× 45-min call, hand-tuned program, form check, week-4 review." Category: *coaching service / digital*.
- **The Commission — €249** (one-time). Description: the 16-week bespoke build.
- Turn ON: Apple Pay / Google Pay / card (default), and the **checkout email field** (you need it to contact buyers).

**6. Wire the buy links into the site**
- Each product gives you a **buy/checkout URL**.
- Open `index.html`, find the `CHECKOUT` config near the top of the `<script>`:
  ```js
  const CHECKOUT = {
    blueprint:  "https://YOUR-STORE.lemonsqueezy.com/buy/REPLACE-BLUEPRINT-99",
    commission: "https://YOUR-STORE.lemonsqueezy.com/buy/REPLACE-COMMISSION-249"
  };
  ```
- Paste your two real URLs. Re-upload `index.html` to Cloudflare/Netlify.

**7. Test a live purchase**
- Use Lemon Squeezy **test mode**, run a card through, confirm you get the order + buyer email. Then flip to live.

**8. Set up the post-purchase email**
- In Lemon Squeezy, set the **order confirmation** to send buyers a booking link (e.g. a free **Cal.com** or **Calendly** link) so they can schedule their call. This is your whole fulfilment flow for €99/€249 — no extra software needed.

✅ **End of Sunday AM: people can pay €99/€249 and auto-receive a booking link.**

---

## SUNDAY PM — Make the AI real (≈1–2 hours, optional for launch)

The free generator already works without this. Do this when you want the photo analysis to be genuine AI.

**9. Add the serverless function**
- Put `analyze.js` at `/api/analyze.js` (Vercel) or convert to `onRequestPost` for Cloudflare Pages Functions (note at the bottom of the file).
- If you host the static site on Cloudflare Pages, you can add a Pages Function in the same project — no separate server.

**10. Add your API key as an env var**
- Get a key from **console.anthropic.com**.
- In your host dashboard → Settings → Environment Variables → add `ANTHROPIC_API_KEY`. Never put it in the HTML.

**11. Connect the frontend**
- Use the `runRealAnalysis()` snippet at the bottom of `analyze.js` to POST the form + photos to `/api/analyze` and render the returned JSON in the result panel.

**12. Protect it**
- Add basic rate-limiting (e.g. Cloudflare rules) so the endpoint isn't abused, since each call costs you API credits. Optionally gate the *full* AI report behind a cheap unlock later, keeping the rule-based plan free.

✅ **AI photo analysis is now genuinely AI-powered.**

---

## BEFORE YOU PROMOTE IT

- [ ] **Legal pages**: add a simple **Terms**, **Privacy** (you process photos — say how), and **Refund** policy (you offer 14-day). Lemon Squeezy provides templates.
- [ ] **Photo consent**: your own photos are fine. For any future client transformation photos, get a one-line written release.
- [ ] **Claims check**: avoid "guaranteed shred in 8 weeks" type promises — payment processors and ad platforms penalise it. Keep it "engineered, progressive, honest."
- [ ] **Analytics**: add Cloudflare Web Analytics (free, privacy-friendly, no cookie banner needed).
- [ ] **Mobile pass**: open the live URL on your phone, run the full flow once (analysis → .ics export → checkout modal).
- [ ] **The funnel**: reel/post → link in bio → site → free analysis (hook) → coaching upsell. The free tier is the magnet; the €99/€249 is the business.

---

## COST SUMMARY (to start)
| Item | Cost |
|---|---|
| Hosting (Cloudflare Pages / Netlify) | €0 |
| Domain | ~€10 / year |
| Lemon Squeezy | ~5% + payment fees per sale, €0 upfront |
| Anthropic API (real AI) | pay-per-use, cents per analysis |
| Booking (Cal.com free / Calendly free) | €0 |

**You can be live and taking payments this weekend for the price of a domain.**
