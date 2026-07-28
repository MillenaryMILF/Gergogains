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
    plan:       "https://YOUR-STORE.lemonsqueezy.com/buy/REPLACE-PLAN-19",        // PLACEHOLDER — $19 tier
    blueprint:  "https://YOUR-STORE.lemonsqueezy.com/buy/REPLACE-BLUEPRINT-99",   // PLACEHOLDER — $99 tier
    commission: "https://YOUR-STORE.lemonsqueezy.com/buy/REPLACE-COMMISSION-249"  // PLACEHOLDER — $249 tier
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
    plan:       {spec:"SPEC 00 — AI PLAN", tier:"The Plan",       price:"$19",  pay:"Pay $19 &amp; unlock weeks 2-8 ▸",      desc:"Weeks 2-8 of your programme: the full progression, RIR schedule, both deloads, every substitution for your setup, and a PDF. Your volume targets and week 1 stay free. Emailed within 24 hours."},
    blueprint:  {spec:"SPEC 01 — GUIDED",  tier:"The Blueprint",  price:"$99",  pay:"Pay $99 &amp; book your call ▸",   desc:"Everything in The Plan, plus I personally review it, a 45-min video call, a hand-tuned program, a form check and a week-4 review. I'll email you to book."},
    commission: {spec:"SPEC 02 — BESPOKE", tier:"The Commission", price:"$249", pay:"Pay $249 &amp; start the build ▸", desc:"A fully bespoke 16-week build: 3 calls, fortnightly reviews, unlimited form checks, nutrition structuring and priority messaging. I'll email you to begin."}
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
    endpointKey: "REPLACE-WEB3FORMS-ACCESS-KEY"   // PLACEHOLDER
  },

  /* --------------------------------------------------------------------------
     5) SITE
     --------------------------------------------------------------------------
     Set `domain` once you own one. It is used for canonical + Open Graph URLs.
     Leave as-is until then — a wrong domain is worse than a placeholder.
     ----------------------------------------------------------------------- */
  SITE: {
    domain:  "https://YOUR-DOMAIN.example",  // PLACEHOLDER — no trailing slash
    contact: "REPLACE@YOUR-DOMAIN.example"   // PLACEHOLDER — used in legal pages
  }
};
