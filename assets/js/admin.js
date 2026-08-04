/* ============================================================================
   GERGÖ GAINS — SITE EDITOR
   ----------------------------------------------------------------------------
   A no-build, no-server editing UI for this repository. It talks to the GitHub
   Contents API directly from the browser using a fine-grained token the owner
   pastes once and which is kept in this browser's localStorage — it is never
   committed, never sent anywhere except api.github.com.

   Three principles it is built on:

   1) HTML STAYS THE SOURCE OF TRUTH. Copy is not moved into a JSON blob and
      rendered by JavaScript, because that would strip the text out of the
      served HTML and cost the SEO the tool pages were written to win. Editable
      copy is delimited in index.html by <!--e:key--> ... <!--/e--> and this
      editor replaces only what is between those markers. The document is never
      re-serialised, so nothing outside a marker can be reformatted or lost.

   2) SETTINGS ARE EDITED AS STRING LITERALS. config.js keeps its comments —
      including the VAT warning — because the editor rewrites the value inside
      the quotes and touches nothing else.

   3) EVERY WRITE IS A COMMIT. There is no hidden database. Anything done here
      shows up in the repository history and can be reverted from GitHub like
      any other change.
   ========================================================================= */
(function () {
  "use strict";

  const REPO = 'MillenaryMILF/Gergogains';
  const BRANCH = 'main';
  const API = 'https://api.github.com';
  const TOKEN_KEY = 'gg_admin_token_v1';

  const $ = s => document.querySelector(s);
  const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h !== undefined) e.innerHTML = h; return e; };

  let token = localStorage.getItem(TOKEN_KEY) || '';
  const cache = {};                 // path -> { text, sha }
  const dirty = { text: {}, config: {} };
  let photo = null;                 // { img, name }

  /* ------------------------------------------------------------ GitHub API */
  async function gh(path, opts) {
    const res = await fetch(API + path, Object.assign({
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }, opts || {}));
    if (!res.ok) {
      let detail = '';
      try { detail = (await res.json()).message || ''; } catch (e) {}
      throw new Error('GitHub ' + res.status + (detail ? ' — ' + detail : ''));
    }
    return res.json();
  }

  // Base64 that survives umlauts. btoa() alone throws on "Gergö".
  const b64encode = str => {
    const bytes = new TextEncoder().encode(str);
    let bin = ''; bytes.forEach(b => bin += String.fromCharCode(b));
    return btoa(bin);
  };
  const b64decode = b64 => {
    const bin = atob(b64.replace(/\n/g, ''));
    const bytes = Uint8Array.from(bin, ch => ch.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  };

  async function getFile(path) {
    if (cache[path]) return cache[path];
    const j = await gh('/repos/' + REPO + '/contents/' + path + '?ref=' + BRANCH);
    cache[path] = { text: b64decode(j.content), sha: j.sha };
    return cache[path];
  }

  async function putFile(path, text, message) {
    const cur = cache[path];
    const j = await gh('/repos/' + REPO + '/contents/' + path, {
      method: 'PUT',
      body: JSON.stringify({
        message, branch: BRANCH, content: b64encode(text),
        sha: cur ? cur.sha : undefined
      })
    });
    cache[path] = { text, sha: j.content.sha };   // keep the new sha or the next save 409s
    return j;
  }

  async function putBinary(path, base64, message) {
    let sha;
    try { sha = (await gh('/repos/' + REPO + '/contents/' + path + '?ref=' + BRANCH)).sha; }
    catch (e) { sha = undefined; }               // new file
    return gh('/repos/' + REPO + '/contents/' + path, {
      method: 'PUT',
      body: JSON.stringify({ message, branch: BRANCH, content: base64, sha })
    });
  }

  /* ----------------------------------------------------------------- status */
  function status(msg, kind) {
    const s = $('#status');
    s.textContent = msg;
    s.className = 'status' + (kind ? ' ' + kind : '');
  }

  /* ------------------------------------------------------------- text tab */
  const LABELS = {
    'hero.kicker':    ['Hero — small line above the headline', 'text'],
    'hero.headline':  ['Hero — big headline', 'html'],
    'hero.sub':       ['Hero — paragraph under the headline', 'area'],
    'hero.cta':       ['Hero — button label', 'text'],
    'hero.freetag':   ['Hero — line next to the button', 'html'],
    'about.headline': ['About — headline', 'area'],
    'about.body':     ['About — paragraph', 'area'],
    'about.standard': ['About — the boxed "standard" note', 'area'],
    'about.sign':     ['About — signature line', 'text'],
    'band.headline':  ['Bottom band — headline', 'text'],
    'band.body':      ['Bottom band — paragraph', 'area']
  };

  const RE = k => new RegExp('(<!--e:' + k.replace(/\./g, '\\.') + '-->)([\\s\\S]*?)(<!--/e-->)');

  async function loadText() {
    const f = await getFile('index.html');
    const host = $('#textFields'); host.innerHTML = '';
    Object.keys(LABELS).forEach(key => {
      const m = f.text.match(RE(key));
      if (!m) return;
      const [label, kind] = LABELS[key];
      const wrap = el('div', 'field');
      wrap.appendChild(el('label', null, label + (kind === 'html' ? ' <em>HTML allowed</em>' : '')));
      const input = kind === 'text' ? el('input') : el('textarea');
      if (kind === 'text') input.type = 'text';
      input.value = m[2].trim();
      input.dataset.key = key;
      input.addEventListener('input', () => {
        dirty.text[key] = input.value;
        $('#saveText').disabled = false;
      });
      wrap.appendChild(input);
      host.appendChild(wrap);
    });
    status('Loaded ' + Object.keys(LABELS).length + ' text blocks.', 'ok');
  }

  async function saveText() {
    const keys = Object.keys(dirty.text);
    if (!keys.length) return;
    status('Saving text…');
    const f = await getFile('index.html');
    let out = f.text;
    keys.forEach(k => {
      out = out.replace(RE(k), (_, a, __, c) => a + dirty.text[k] + c);
    });
    await putFile('index.html', out, 'Edit site copy via the editor\n\n' + keys.map(k => '- ' + k).join('\n'));
    dirty.text = {}; $('#saveText').disabled = true;
    status('Saved. Live in about a minute.', 'ok');
  }

  /* ----------------------------------------------------------- settings tab */
  /* key -> [label, hint]. Each maps to a "key: \"value\"" pair in config.js. */
  const SETTINGS = [
    ['__h', 'Payments — Stripe'],
    ['plan',        'Payment link — The Programme ($29)', 'From Stripe → Payment links. Looks like https://buy.stripe.com/…'],
    ['blueprint',   'Payment link — The Audit ($199)', ''],
    ['commission',  'Payment link — The Commission ($499)', ''],
    ['__h', 'Social'],
    ['tiktok',      'TikTok URL', ''],
    ['youtube',     'YouTube URL', ''],
    ['instagram',   'Instagram URL', 'Leave the REPLACE text in to hide the link entirely.'],
    ['__h', 'Contact'],
    ['contact',     'Contact email shown on the legal pages', ''],
    ['__h', 'Tracking — leave as-is until you have the real IDs'],
    ['ga4',         'Google Analytics 4 ID', 'G-XXXXXXXXXX'],
    ['googleAds',   'Google Ads ID', 'AW-XXXXXXXXX'],
    ['adsLabel',    'Google Ads conversion label', '']
  ];

  const cfgRE = k => new RegExp('(\\b' + k + ':\\s*")([^"]*)(")');

  async function loadSettings() {
    const f = await getFile('assets/js/config.js');
    const host = $('#cfgFields'); host.innerHTML = '';
    SETTINGS.forEach(row => {
      if (row[0] === '__h') { host.appendChild(el('h3', null, row[1])); return; }
      const [key, label, hint] = row;
      const m = f.text.match(cfgRE(key));
      if (!m) return;
      const wrap = el('div', 'field');
      wrap.appendChild(el('label', null, label + (hint ? ' <em>' + hint + '</em>' : '')));
      const input = el('input'); input.type = 'text'; input.value = m[2];
      input.addEventListener('input', () => {
        dirty.config[key] = input.value;
        $('#saveCfg').disabled = false;
      });
      wrap.appendChild(input);
      host.appendChild(wrap);
    });
    status('Loaded settings.', 'ok');
  }

  async function saveSettings() {
    const keys = Object.keys(dirty.config);
    if (!keys.length) return;
    status('Saving settings…');
    const f = await getFile('assets/js/config.js');
    let out = f.text;
    keys.forEach(k => {
      const v = dirty.config[k].replace(/"/g, '');   // a quote would break the file
      out = out.replace(cfgRE(k), (_, a, __, c) => a + v + c);
    });
    await putFile('assets/js/config.js', out, 'Update settings via the editor\n\n' + keys.map(k => '- ' + k).join('\n'));
    dirty.config = {}; $('#saveCfg').disabled = true;
    status('Saved. Live in about a minute.', 'ok');
  }

  /* -------------------------------------------------------------- photo tab */
  /* Same slot table as docs/prepare-photo.py, so both routes produce identical
     files. Cropping happens on a canvas here, which also lets the browser
     encode the WebP twin — the thing that is easy to forget by hand and which
     silently leaves the old photo on screen when missed. */
  const SLOTS = {
    'hero':             [1000, 1334, 'Hero portrait (tall)'],
    'editorial':        [1400, 1867, 'Wide editorial band'],
    'gallery-fullbody': [800, 1000, 'Gallery — full body'],
    'gallery-field':    [1200, 675, 'Gallery — wide'],
    'gallery-coach':    [600, 600, 'Gallery — square'],
    'community-band':   [1600, 667, 'Bottom band (very wide)'],
    'og-image':         [1200, 630, 'Link preview image']
  };

  function drawPreview() {
    if (!photo) return;
    const slot = $('#slot').value;
    const [w, h] = SLOTS[slot];
    const zoom = parseFloat($('#zoom').value);
    const fx = parseFloat($('#fx').value), fy = parseFloat($('#fy').value);
    const cv = $('#canvas');
    cv.width = w; cv.height = h;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h);

    const sw = photo.img.naturalWidth, sh = photo.img.naturalHeight;
    const ratio = w / h;
    let bw, bh;
    if (sw / sh > ratio) { bh = sh / zoom; bw = bh * ratio; }
    else { bw = sw / zoom; bh = bw / ratio; }
    bw = Math.min(bw, sw); bh = Math.min(bh, sh);
    const left = Math.max(0, Math.min(sw * fx / 100 - bw / 2, sw - bw));
    const top  = Math.max(0, Math.min(sh * fy / 100 - bh / 2, sh - bh));
    ctx.drawImage(photo.img, left, top, bw, bh, 0, 0, w, h);
    $('#pxOut').textContent = w + ' × ' + h;
  }

  const blobToB64 = blob => new Promise(res => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(',')[1]);
    r.readAsDataURL(blob);
  });

  async function savePhoto() {
    if (!photo) return;
    const slot = $('#slot').value;
    status('Encoding…');
    const cv = $('#canvas');
    const jpg  = await new Promise(r => cv.toBlob(r, 'image/jpeg', 0.82));
    const webp = await new Promise(r => cv.toBlob(r, 'image/webp', 0.8));
    if (!webp) { status('This browser cannot make WebP. Use Chrome, Edge or Safari 16+.', 'warn'); return; }
    status('Uploading two files…');
    await putBinary('assets/img/' + slot + '.jpg',  await blobToB64(jpg),  'Replace ' + slot + '.jpg via the editor');
    await putBinary('assets/img/' + slot + '.webp', await blobToB64(webp), 'Replace ' + slot + '.webp via the editor');
    status('Photo replaced. Live in about a minute — hard-refresh to see it.', 'ok');
  }

  /* ------------------------------------------------------------------ wiring */
  function showTab(name) {
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('on', t.dataset.tab === name));
    document.querySelectorAll('.panel').forEach(p => p.hidden = p.dataset.panel !== name);
  }

  async function connect() {
    token = $('#token').value.trim();
    if (!token) { status('Paste a token first.', 'warn'); return; }
    status('Checking token…');
    try {
      await gh('/repos/' + REPO);
      localStorage.setItem(TOKEN_KEY, token);
      $('#gate').hidden = true; $('#app').hidden = false;
      await loadText(); await loadSettings();
      status('Connected to ' + REPO + '.', 'ok');
    } catch (e) {
      status(e.message + ' — check the token has Contents: Read and write on this repository.', 'warn');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    $('#connect').onclick = connect;
    $('#token').addEventListener('keydown', e => { if (e.key === 'Enter') connect(); });
    $('#forget').onclick = () => {
      localStorage.removeItem(TOKEN_KEY); token = '';
      $('#app').hidden = true; $('#gate').hidden = false; $('#token').value = '';
      status('Token removed from this browser.', 'ok');
    };
    document.querySelectorAll('.tab').forEach(t => t.onclick = () => showTab(t.dataset.tab));
    $('#saveText').onclick = () => saveText().catch(e => status(e.message, 'warn'));
    $('#saveCfg').onclick  = () => saveSettings().catch(e => status(e.message, 'warn'));
    $('#savePhoto').onclick = () => savePhoto().catch(e => status(e.message, 'warn'));

    $('#file').addEventListener('change', e => {
      const f = e.target.files[0]; if (!f) return;
      const img = new Image();
      img.onload = () => { photo = { img, name: f.name }; $('#photoTools').hidden = false; drawPreview(); };
      img.onerror = () => status('Could not read that image. iPhone HEIC files need converting to JPG first.', 'warn');
      img.src = URL.createObjectURL(f);
    });
    ['slot', 'zoom', 'fx', 'fy'].forEach(id => $('#' + id).addEventListener('input', drawPreview));

    if (token) { $('#token').value = token; connect(); }
  });
})();
