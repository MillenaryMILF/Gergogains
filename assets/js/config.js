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
     1) PAYMENT LINKS — Lemon Squeezy                          [PLACEHOLDER x3]
     --------------------------------------------------------------------------
     Create 3 products in your Lemon Squeezy store, copy each product's
     "Buy now" / checkout URL, and paste it below. Nothing else to change.
     Until replaced, the buttons open a URL that does not exist.
     ----------------------------------------------------------------------- */
  CHECKOUT: {
    plan:       "https://YOUR-STORE.lemonsqueezy.com/buy/REPLACE-PLAN-19",        // PLACEHOLDER — $29 The Programme
    blueprint:  "https://YOUR-STORE.lemonsqueezy.com/buy/REPLACE-BLUEPRINT-99",   // PLACEHOLDER — $199 The Audit
    commission: "https://YOUR-STORE.lemonsqueezy.com/buy/REPLACE-COMMISSION-249"  // PLACEHOLDER — $499 The Commission
  },

  /* --------------------------------------------------------------------------
     1b) CRYPTO PAYMENT LINKS — Coinbase Commerce            [PLACEHOLDER x3]
     --------------------------------------------------------------------------
     Create the same three products in Coinbase Commerce, copy each hosted
     checkout URL, paste below. Buttons only appear when CRYPTO.enabled is true
     AND the URL below no longer says REPLACE — so this is safe to ship as-is.

     ⚠️ READ BEFORE SWITCHING THIS ON. Lemon Squeezy is a *merchant of record*:
     they charge, collect and remit EU VAT for you, which is the whole reason
     the card flow works from Austria with no VAT registration. Coinbase
     Commerce is NOT a merchant of record. It is a payment processor. On a
     crypto sale YOU are the seller of record, which means:
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
     actual charge is whatever your Lemon Squeezy product is set to.
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
