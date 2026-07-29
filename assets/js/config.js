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
    contact: "REPLACE@gergogains.com"   // PLACEHOLDER — used in legal pages
  }
};
