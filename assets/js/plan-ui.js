/* ============================================================================
   GERGÖ GAINS — PLAN UI + PAYWALL
   ----------------------------------------------------------------------------
   Renders the engine's output into the existing #result panel and draws the
   free/paid line.

     FREE  — the diagnosis. FFMI, per-muscle weekly volume targets, what your
             chosen number of days can actually carry, weak-point priority,
             protein, and the whole of week 1. Enough to prove the method works.
     PAID  — weeks 2-8: the progression, the RIR schedule, the deloads, the
             substitutions, the PDF.

   The old inline generator's schedule is replaced by engine output, so what the
   page shows is what the citations claim. Deliberately decoupled: this file
   reads the form from the DOM and does not touch the original script.
   ========================================================================= */
(function () {
  "use strict";
  const DB = window.GG_DB, EN = window.GG_ENGINE;
  if (!DB || !EN) { console.error('GG: engine or database missing'); return; }

  const CFG = (window.GG_CONFIG || {});
  const LEAD = (CFG.LEAD || {});
  const real = v => typeof v === 'string' && v && !/X{3,}|REPLACE/i.test(v);

  /* Weak points the user can prioritise. Kept short — asking about 14 muscles
     turns a 20-second form into a chore. */
  const WEAK_CHOICES = [
    ['side_delt','Shoulder caps'], ['rear_delt','Rear delts'],
    ['biceps','Biceps'], ['triceps','Triceps'], ['chest','Chest'],
    ['lats','Lats / width'], ['upper_back','Upper back'],
    ['quads','Quads'], ['hams','Hamstrings'], ['calves','Calves']
  ];

  let weak = [];

  /* -------------------------------------------------- read the form from DOM */
  function readState(){
    const num = id => { const e=document.getElementById(id); const v=e?parseFloat(e.value):NaN; return isFinite(v)?v:null; };

    /* The builder's segmented controls are <button data-v="..."> inside #exp,
       #days and #env, and the chosen one carries .sel. An earlier version of
       this function looked for data-exp / data-days / data-env attributes,
       which do not exist anywhere in the markup — so every lookup returned
       null and the engine was silently handed the defaults. That meant the
       plan ignored the visitor's training days, experience and gym/home
       choice completely: everybody got the same 4-day intermediate gym plan. */
    const seg = id => {
      const b = document.querySelector('#' + id + ' button.sel');
      return b ? b.dataset.v : null;
    };
    const goalEl = document.querySelector('#goals .goal.sel');
    const days = parseInt(seg('days'), 10);

    return {
      goal:  (goalEl && goalEl.dataset.goal) || 'aesthetics',
      exp:   (seg('exp') || 'intermediate').toLowerCase(),
      days:  isFinite(days) ? days : 4,
      env:   (seg('env') || 'gym').toLowerCase(),
      age: num('age'), weight: num('weight'), height: num('height'), bf: num('bf'),
      weak
    };
  }

  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  /* ------------------------------------------------------------------ render */
  /* Last rendered plan, exposed for the .ics export in index.html. Without
     this the calendar was built from the old hardcoded template, so the
     sessions you downloaded were not the sessions on the screen. */
  let lastPlan = null;

  function render(){
    const st = readState();
    const r  = EN.build(st);
    const host = document.getElementById('sched');
    if (!host) return;

    const w1p = r.weeks[0];
    lastPlan = {
      used: st.days,
      days: r.split.map(s => ({
        nm: s.label,
        ex: s.items.map(it => {
          const iso = Object.keys(it.ex.contrib).length === 1;
          const sets = Math.max(2, Math.round(it.sets * w1p.setMult));
          return [it.ex.name, sets + ' x RIR ' + (iso ? w1p.rir.iso : w1p.rir.comp)];
        })
      }))
    };

    const d = r.diagnosis;
    const bar = (got, tgt) => {
      const pct = Math.min(100, Math.round(got/tgt*100));
      const ok = pct >= 75;
      return '<div class="gg-bar"><i style="width:'+pct+'%;background:'+(ok?'#0b0b0b':'#b8951f')+'"></i></div>';
    };

    /* ---- FREE: volume prescription, the actual differentiator ---- */
    let vol = '';
    for (const m of DB.MUSCLES){
      const tgt = r.targets[m], got = Math.round(r.achieved[m]||0), f = r.freq[m];
      vol += '<tr'+(weak.includes(m)?' class="gg-pri"':'')+'>'+
             '<td>'+esc(DB.LABEL[m])+(weak.includes(m)?' <span class="gg-tag">PRIORITY</span>':'')+'</td>'+
             '<td class="gg-n">'+got+' / '+tgt+'</td>'+
             '<td>'+bar(got,tgt)+'</td>'+
             '<td class="gg-n">'+f+'&times;</td></tr>';
    }

    const gapRows = r.diagnosis.gaps.filter(g=>g.issue==='under').slice(0,3)
      .map(g => '<li><b>'+esc(DB.LABEL[g.muscle])+':</b> '+esc(g.fix)+'</li>').join('');

    /* ---- FREE: week 1 in full ---- */
    let wk1 = '';
    const w1 = r.weeks[0];
    r.split.forEach((s,i) => {
      const li = s.items.map(it => {
        const iso = Object.keys(it.ex.contrib).length === 1;
        const sets = Math.max(2, Math.round(it.sets * w1.setMult));
        const tags = [];
        if (it.lead) tags.push('leads &mdash; freshest');
        if (it.ex.len === 'long') tags.push('long-length');
        if (it.separated) tags.push('kept off pre-fatigue');
        return '<li><span class="gg-ex">'+esc(it.ex.name)+'</span>'+
               '<span class="gg-rx">'+sets+' &times; RIR '+(iso?w1.rir.iso:w1.rir.comp)+'</span>'+
               (tags.length?'<span class="gg-why">'+tags.join(' &middot; ')+'</span>':'')+'</li>';
      }).join('');
      wk1 += '<div class="scard"><div class="sh"><span class="dy">WEEK 1 &middot; SESSION '+(i+1)+
             '</span><span class="nm">'+esc(s.label)+'</span></div><ul class="gg-sess">'+li+'</ul></div>';
    });

    /* ---- PAID: what is behind the gate ---- */
    const weeksTeaser = r.weeks.slice(1).map(w =>
      '<li><b>Week '+w.week+'</b> &mdash; '+(w.deload
        ? 'deload, '+Math.round(w.setMult*100)+'% sets, RIR '+w.rir
        : 'RIR '+w.rir.comp+' compounds / '+w.rir.iso+' isolation, '+Math.round(w.setMult*100)+'% sets')+'</li>').join('');

    const cite = r.citations.map(c =>
      '<li><a href="'+c.u+'" target="_blank" rel="noopener">'+esc(c.t)+'</a><br><span class="gg-use">'+esc(c.use)+'</span></li>').join('');

    host.innerHTML =
      '<div class="gg-block">'+
        '<h4>Your weak points</h4>'+
        '<p class="gg-sub">Pick up to three. These get the first exercise slot while you are '+
        'fresh &mdash; exercise order does not change growth, but it does decide which lift '+
        'you get strongest at.</p>'+
        '<div class="gg-chips">'+ WEAK_CHOICES.map(([id,l]) =>
          '<button type="button" class="gg-chip'+(weak.includes(id)?' on':'')+'" data-weak="'+id+'">'+l+'</button>').join('') +'</div>'+
      '</div>'+

      '<div class="gg-block">'+
        '<h4>Weekly volume prescription</h4>'+
        '<p class="gg-sub">Sets counted the way the research counts them: a set of incline press '+
        'credits 1.0 to chest and 0.5 each to front delts and triceps. Most plans ignore this '+
        'and quietly give your triceps twice what you think.</p>'+
        '<table class="gg-tbl"><thead><tr><th>Muscle</th><th>Programmed / target</th><th></th><th>Freq</th></tr></thead>'+
        '<tbody>'+vol+'</tbody></table>'+
        (gapRows ? '<div class="gg-note"><b>What your '+st.days+' sessions cannot carry</b><ul>'+gapRows+'</ul></div>' : '')+
      '</div>'+

      '<div class="gg-block"><h4>Week 1 &mdash; complete, free</h4>'+wk1+'</div>'+

      '<div class="gg-gate">'+
        '<div class="gg-lock">LOCKED</div>'+
        '<h4>Weeks 2&ndash;8</h4>'+
        '<ul class="gg-teaser">'+weeksTeaser+'</ul>'+
        '<p class="gg-sub">Plus every exercise substitution for your setup, the deload protocol, '+
        'and the whole thing as a PDF you can take to the gym.</p>'+
        '<button class="btn" data-buy="plan">Unlock weeks 2&ndash;8 &mdash; '+((CFG.TIERS&&CFG.TIERS.plan&&CFG.TIERS.plan.price)||'')+' &#9656;</button>'+
      '</div>'+

      '<div class="gg-block gg-eviblock"><h4>Why these numbers</h4>'+
        '<p class="gg-sub">Every figure above traces to a source. Check them.</p>'+
        '<ol class="gg-cite">'+cite+'</ol>'+
        '<p class="gg-disc">General fitness guidance, not medical advice. Individual response varies.</p>'+
      '</div>'+

      '<form class="gg-lead" id="ggLead">'+
        '<h4>Email me this diagnosis</h4>'+
        '<p class="gg-sub">Your volume table and week 1, sent to you. No spam.</p>'+
        '<div class="gg-row"><input type="email" name="email" required placeholder="you@example.com" aria-label="Email">'+
        '<button class="btn" type="submit">Send it &#9656;</button></div>'+
        '<div class="gg-msg" id="ggLeadMsg" role="status"></div>'+
      '</form>';

    wireChips();
    wireLead(st, r);
  }

  function wireChips(){
    document.querySelectorAll('[data-weak]').forEach(b => b.addEventListener('click', () => {
      const id = b.dataset.weak;
      if (weak.includes(id)) weak = weak.filter(x => x !== id);
      else if (weak.length < 3) weak.push(id);
      render();
      const el = document.querySelector('.gg-chips'); if (el) el.scrollIntoView({block:'center'});
    }));
  }

  /* Lead capture + buyer spec. No server: posts to a form endpoint whose public
     key lives in config.js. Nothing secret is involved. */
  function wireLead(st, r){
    const f = document.getElementById('ggLead');
    if (!f) return;
    f.addEventListener('submit', async e => {
      e.preventDefault();
      const msg = document.getElementById('ggLeadMsg');
      const email = f.email.value.trim();
      if (!real(LEAD.endpointKey)){
        msg.textContent = 'Not configured yet — set LEAD.endpointKey in assets/js/config.js.';
        msg.className = 'gg-msg warn';
        return;
      }
      msg.textContent = 'Sending…'; msg.className = 'gg-msg';
      const spec = {
        access_key: LEAD.endpointKey,
        subject: 'GG diagnosis request — ' + email,
        email,
        goal: st.goal, experience: st.exp, days: st.days, environment: st.env,
        age: st.age, weight_kg: st.weight, height_cm: st.height, bodyfat_pct: st.bf,
        weak_points: (st.weak||[]).map(m => DB.LABEL[m]).join(', ') || 'none selected',
        ffmi: r.diagnosis.ffmi ? r.diagnosis.ffmi.norm.toFixed(1) : 'n/a',
        protein_g: r.diagnosis.protein ? r.diagnosis.protein.lo+'-'+r.diagnosis.protein.hi : 'n/a',
        volume_targets: DB.MUSCLES.map(m => DB.LABEL[m]+':'+r.targets[m]).join(' | ')
      };
      try {
        const res = await fetch(LEAD.endpoint, {
          method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(spec)
        });
        if (!res.ok) throw new Error('HTTP '+res.status);
        msg.textContent = 'Sent. Check your inbox.'; msg.className = 'gg-msg ok';
        f.querySelector('button[type=submit]').disabled = true;
      } catch (err) {
        msg.textContent = 'Could not send. Try again, or email me directly.';
        msg.className = 'gg-msg warn';
        console.error('GG lead submit failed:', err);
      }
    });
  }

  /* Re-render after the original generator finishes, without touching it. */
  document.addEventListener('click', e => {
    if (e.target && e.target.id === 'generate') setTimeout(render, 60);
  }, true);

  window.GG_UI = { render, plan: () => lastPlan, get weak(){ return weak; } };
})();
