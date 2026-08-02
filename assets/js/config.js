/* ============================================================================
   GERGÖ GAINS — CENTRAL CONFIG
   ----------------------------------------------------------------------------
   THIS IS THE ONLY FILE YOU NEED TO EDIT TO GO LIVE.
   Everything marked PLACEHOLDER must be replaced with a real value.
   Nothing here is a secret — this file ships to the browser. Never put an
   API key, private token or password in it.
   ========================================================================= */

window.GG_CONFIG = {

  /* --------------------------------------------------------------------------
     1) PAYMENT LINKS — Stripe                                 [PLACEHOLDER x3]
     --------------------------------------------------------------------------
     Create three Payment Links in the Stripe Dashboard and paste the URLs
     below. They look like https://buy.stripe.com/aBC123...

     `provider` decides how the buyer's email is handed to the checkout:
       stripe        -> ?prefilled_email=
       lemonsqueezy  -> ?checkout[email]=
     Switching provider is a one-word change; nothing else in the site moves.

     ⚠️ VAT. Lemon Squeezy was a *merchant of record* — they charged the
     customer, collected EU VAT and remitted it, which is why selling from
     Austria needed no VAT registration. Stripe is NOT a merchant of record.
     It is a payment processor. On Stripe you are the seller of record, so:
       - you owe EU B2C digital VAT yourself (register for OSS),
       - you must issue compliant invoices,
       - Stripe Tax can CALCULATE and collect it, but it does not remit for you.
     This is the single biggest consequence of moving to Stripe. Nothing
     technical is blocking you; get the OSS registration in place first.
     ----------------------------------------------------------------------- */
  CHECKOUT: {
    provider:   "stripe",
    plan:       "https://buy.stripe.com/REPLACE-PROGRAMME-29",   // PLACEHOLDER — $29 The Programme
    blueprint:  "https://buy.stripe.com/REPLACE-AUDIT-199",      // PLACEHOLDER — $199 The Audit
    commission: "https://buy.stripe.com/REPLACE-COMMISSION-499"  // PLACEHOLDER — $499 The Commission
  },

  /* --------------------------------------------------------------------------
     1b) CRYPTO PAYMENT LINKS — Coinbase Commerce            [PLACEHOLDER x3]
     --------------------------------------------------------------------------
     Create the same three products in Coinbase Commerce, copy each hosted
     checkout URL, paste below. Buttons only appear when CRYPTO.enabled is true
     AND the URL below no longer says REPLACE — so this is safe to ship as-is.

     ⚠️ READ BEFORE SWITCHING THIS ON. Coinbase Commerce is a payment processor,
     not a merchant of record — the same position as Stripe above. On a crypto
     sale you are the seller of record, which means:
       - you owe the VAT on EU B2C digital sales yourself (OSS registration),
       - you carry the invoicing obligation,
       - each received coin is a disposal event for Austrian tax when converted.
     Talk to your Steuerberater before enabling. Nothing technical here is
     blocking you — the tax treatment is.
     ----------------------------------------------------------------------- */
  CHECKOUT_CRYPTO: {
    plan:       "https://commerce.coinbase.com/checkout/REPLACE-PLAN-CRYPTO",        // PLACEHOLDER
    blueprint:  "https://commerce.coinbase.com/checkout/REPLACE-AUDIT-CRYPTO",       // PLACEHOLDER
    commission: "https://commerce.coinbase.com/checkout/REPLACE-COMMISSION-CRYPTO"   // PLACEHOLDER
  },

  /* --------------------------------------------------------------------------
     1c) CRYPTO DISCOUNT
     --------------------------------------------------------------------------
     `discount` is the ONE number to change. Displayed prices are derived from
     it and rounded DOWN, so the buyer always gets at least the advertised
     percentage — never less, which would be a false price claim.
     Set `enabled:false` to hide every crypto element on the site at once.
     ----------------------------------------------------------------------- */
  CRYPTO: {
    enabled:  true,
    discount: 30,
    coins:    "BTC · ETH · USDC · LTC · more"
  },

  /* --------------------------------------------------------------------------
     2) PRICING TIERS
     --------------------------------------------------------------------------
     Prices, labels and descriptions exactly as in the source design.
     Change `price` and `pay` together so the button text stays consistent.
     To switch currency, edit the strings ($19 -> €19) — display only, the
     actual charge is whatever the Stripe Payment Link is set to.
     ----------------------------------------------------------------------- */
  TIERS: {
    plan:       {spec:"SPEC 01 — THE PROGRAMME", tier:"The Programme", price:"$29",  pay:"Pay $29 &amp; unlock weeks 2-8 &#9656;",   desc:"Weeks 2 to 8: the full progression, the reps-in-reserve schedule, both deload weeks, every exercise substitution for your setup, and a PDF. Your spec sheet and week 1 stay free. Emailed within 24 hours."},
    blueprint:  {spec:"SPEC 02 — THE AUDIT", tier:"The Audit", price:"$199", pay:"Pay $199 &amp; book my audit &#9656;", desc:"Send me your training log. I treat it like a line running below capacity: bottleneck analysis, utilisation profile per muscle, where sets are being spent without return, and a fix list ordered by effect per unit of effort. You get a report, a 45-minute call, and a re-audit after eight weeks."},
    commission: {spec:"SPEC 03 — THE COMMISSION",tier:"The Commission",price:"$499", pay:"Pay $499 &amp; start the build &#9656;", desc:"Sixteen weeks under my direct supervision: three calls, fortnightly reviews against your logged numbers, unlimited form checks, nutrition structuring and priority messaging. I take two or three of these at a time, because that is what I can actually deliver."}
  },

  /* --------------------------------------------------------------------------
     RECURRING TIER — not built, parked for later.
     Your notes mention a possible 39–79/month tier. When you want it, add a
     4th entry above + a 4th CHECKOUT link, and add a card in the #pricing
     section of index.html. No other code changes needed.
     ----------------------------------------------------------------------- */

  /* --------------------------------------------------------------------------
     3) TRACKING — for BUYING ads, not selling ad space      [PLACEHOLDER x2]
     --------------------------------------------------------------------------
     Nothing loads until the visitor accepts cookies (see consent.js) AND the
     IDs below are real. While they still say XXXX, zero network requests are
     made and no errors are thrown — safe to deploy as-is.

       ga4       Google Analytics 4 Measurement ID.
                 analytics.google.com -> Admin -> Data Streams -> Web
       googleAds Google Ads conversion ID.
                 ads.google.com -> Tools -> Conversions -> Google tag
       adsLabel  The conversion LABEL for your "checkout click" action.
                 Shown as AW-XXXXXXXXX/AbC-D_efG in the conversion setup.
     ----------------------------------------------------------------------- */
  TRACKING: {
    ga4:       "G-XXXXXXXXXX",   // PLACEHOLDER
    googleAds: "AW-XXXXXXXXX",   // PLACEHOLDER
    adsLabel:  "REPLACE_LABEL",  // PLACEHOLDER — conversion label only, not the full string
    // Fires a `checkout_click` event + Google Ads conversion when a visitor
    // clicks any pricing button. This is what lets Google Ads optimise your
    // spend against buy-intent instead of raw pageviews.
    trackCheckoutClicks: true
  },

  /* --------------------------------------------------------------------------
     4) LEAD CAPTURE / PLAN DELIVERY                            [PLACEHOLDER]
     --------------------------------------------------------------------------
     No server. The free diagnosis form and the buyer's spec are POSTed to a
     form endpoint that emails them to you, so you can send the plan by hand.

     Setup (2 minutes): go to web3forms.com, enter your email, and it gives you
     an access key. Paste it below. The key is public by design — it can only
     send mail to the address you registered, so it is safe in a public repo.
     Free tier covers 250 submissions/month.

     Until this is set, the form tells the visitor it is not configured rather
     than silently losing their email.
     ----------------------------------------------------------------------- */
  LEAD: {
    endpoint:    "https://api.web3forms.com/submit",
    endpointKey: "04e7eb17-9245-4dc9-aff6-c8e916404e31"
  },

  /* --------------------------------------------------------------------------
     5) SITE
     --------------------------------------------------------------------------
     Set `domain` once you own one. It is used for canonical + Open Graph URLs.
     Leave as-is until then — a wrong domain is worse than a placeholder.
     ----------------------------------------------------------------------- */
  SITE: {
    domain:  "https://gergogains.com",  // PLACEHOLDER — no trailing slash
    contact: "info@gergogains.com"   // forwarded to Gmail — see README 1a
  },

  /* --------------------------------------------------------------------------
     6) SOCIAL
     --------------------------------------------------------------------------
     Any entry left empty, or still containing REPLACE, is hidden everywhere
     rather than rendered as a dead link. Add a profile and it appears in the
     footer and the follow row automatically.
     ----------------------------------------------------------------------- */
  SOCIAL: {
    tiktok:    "https://www.tiktok.com/@gergogains",
    youtube:   "https://www.youtube.com/@gergogains",
    instagram: "https://www.instagram.com/REPLACE-INSTAGRAM-HANDLE"   // PLACEHOLDER
  }
};
