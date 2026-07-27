/* ============================================================================
   GERGÖ GAINS — CONSENT GATE + TRACKING
   ----------------------------------------------------------------------------
   WHY THIS EXISTS
     You are running paid traffic from Austria (EU). Under GDPR/ePrivacy an
     analytics or ads cookie may only be set AFTER the visitor agrees. This
     file makes that true: gtag.js is not requested at all until "Accept".

   WHAT IT DOES
     1. Reads the saved decision from localStorage.
     2. If there is none, shows a banner with Accept and Decline weighted
        equally (required — a decline must be as easy as an accept).
     3. On Accept only: injects gtag.js and configures GA4 + Google Ads.
     4. Sends a conversion when a visitor actually clicks "pay".

   SAFE BY DEFAULT
     While the IDs in config.js are still placeholders this file makes ZERO
     network requests and throws no errors. You can deploy it untouched.

   YOU DO NOT NEED TO EDIT THIS FILE. Put your IDs in config.js.
   ========================================================================= */
(function () {
  "use strict";

  var KEY = "gg_consent_v1";
  var C   = (window.GG_CONFIG && window.GG_CONFIG.TRACKING) || {};

  /* An ID is "real" only if it is present and free of placeholder markers. */
  function real(v) {
    return typeof v === "string" && v && !/X{3,}|REPLACE/i.test(v);
  }

  var hasGa4  = real(C.ga4);
  var hasAds  = real(C.googleAds);
  var trackable = hasGa4 || hasAds;

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function save(v) {
    try { localStorage.setItem(KEY, v); } catch (e) { /* private mode — session only */ }
  }

  /* ---------------------------------------------------------------- tracking */
  var loaded = false;

  function loadTracking() {
    if (loaded || !trackable) return;
    loaded = true;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    gtag("js", new Date());

    /* Consent Mode v2 — we only get here after an explicit accept. */
    gtag("consent", "default", {
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
      analytics_storage: "granted"
    });

    var primary = hasGa4 ? C.ga4 : C.googleAds;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(primary);
    document.head.appendChild(s);

    if (hasGa4) gtag("config", C.ga4, { anonymize_ip: true });
    if (hasAds) gtag("config", C.googleAds);
  }

  /* Conversion signal: fired when someone commits, not when they browse. */
  function sendConversion(tier) {
    if (!loaded || !window.gtag) return;
    if (hasGa4) {
      gtag("event", "checkout_click", { tier: tier || "unknown" });
    }
    if (hasAds && real(C.adsLabel)) {
      /* Real order value lets Google Ads bid for revenue rather than raw
         conversion count — a $249 sale should outweigh a $19 one. Parsed from
         the same TIERS block you edit, so it stays correct if you change price. */
      var t = (window.GG_CONFIG && window.GG_CONFIG.TIERS && window.GG_CONFIG.TIERS[tier]) || null;
      var val = t ? parseFloat(String(t.price).replace(/[^0-9.]/g, "")) : NaN;
      gtag("event", "conversion", {
        send_to: C.googleAds + "/" + C.adsLabel,
        value: isNaN(val) ? 1.0 : val,
        currency: "USD"
      });
    }
  }

  /* Which tier the visitor last opened. Captured at click time — reading
     :focus later fails, because opening the modal moves focus off the button. */
  var lastTier = null;

  function wireEvents() {
    if (C.trackCheckoutClicks === false) return;

    /* Opening the pricing modal = interest. */
    document.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest("[data-buy]");
      if (!b) return;
      lastTier = b.dataset.buy || null;
      if (loaded && window.gtag && hasGa4) {
        gtag("event", "begin_checkout", { tier: lastTier || "unknown" });
      }
    }, true);

    /* Clicking pay = the conversion you want Google Ads to bid on. */
    var pay = document.getElementById("ckPay");
    if (pay) {
      pay.addEventListener("click", function () {
        sendConversion(lastTier || "unknown");
      }, true);
    }
  }

  /* ------------------------------------------------------------------ banner */
  function banner() {
    var el = document.createElement("div");
    el.id = "gg-consent";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-live", "polite");
    el.setAttribute("aria-label", "Cookie choice");
    el.innerHTML =
      '<div class="gg-c-in">' +
        '<p class="gg-c-txt">This site uses analytics cookies to measure which ads bring people here. ' +
        'Nothing is loaded unless you agree. <a href="privacy.html">Privacy</a></p>' +
        '<div class="gg-c-btns">' +
          '<button type="button" data-gg="no">Decline</button>' +
          '<button type="button" data-gg="yes" class="gg-c-yes">Accept</button>' +
        '</div>' +
      '</div>';

    var css = document.createElement("style");
    css.textContent =
      '#gg-consent{position:fixed;left:0;right:0;bottom:0;z-index:9999;background:#0b0b0b;color:#fff;' +
        'border-top:2px solid #fff;font-family:"Space Mono",ui-monospace,monospace;}' +
      '#gg-consent .gg-c-in{max-width:1240px;margin:0 auto;padding:14px clamp(16px,3.5vw,40px);' +
        'display:flex;gap:18px;align-items:center;justify-content:space-between;flex-wrap:wrap;}' +
      '#gg-consent .gg-c-txt{font-size:11px;letter-spacing:.06em;line-height:1.6;margin:0;max-width:70ch;color:#d8d8d8;}' +
      '#gg-consent a{color:#fff;text-decoration:underline;}' +
      '#gg-consent .gg-c-btns{display:flex;gap:10px;flex-shrink:0;}' +
      '#gg-consent button{font-family:inherit;font-size:11px;letter-spacing:.14em;text-transform:uppercase;' +
        'padding:10px 20px;border:1.5px solid #fff;background:transparent;color:#fff;cursor:pointer;}' +
      '#gg-consent button:hover{background:#fff;color:#0b0b0b;}' +
      '#gg-consent .gg-c-yes{background:#fff;color:#0b0b0b;}' +
      '#gg-consent .gg-c-yes:hover{background:transparent;color:#fff;}';

    document.head.appendChild(css);
    document.body.appendChild(el);

    el.addEventListener("click", function (e) {
      var b = e.target.closest("[data-gg]");
      if (!b) return;
      var yes = b.dataset.gg === "yes";
      save(yes ? "granted" : "denied");
      el.remove();
      if (yes) { loadTracking(); wireEvents(); }
    });
  }

  /* --------------------------------------------------------------------- run */
  function init() {
    var d = stored();

    if (d === "granted") { loadTracking(); wireEvents(); return; }
    if (d === "denied")  { return; }

    /* No decision yet. Only ask if there is actually something to consent to —
       showing a cookie banner while no tracking exists would be theatre. */
    if (trackable) banner();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  /* Lets you re-open the choice from a link: onclick="GGConsent.reset()" */
  window.GGConsent = {
    reset: function () {
      try { localStorage.removeItem(KEY); } catch (e) {}
      location.reload();
    },
    status: stored
  };
})();
