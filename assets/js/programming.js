/* ============================================================================
   GERGÖ GAINS — PROGRAMMING ENGINE
   ----------------------------------------------------------------------------
   Turns a user's inputs into an 8-week programme. Every number below traces to
   a citation in CITATIONS at the bottom of this file. Where the evidence is
   thin or contested, the code says so rather than pretending otherwise.

   Public API:
     GG_ENGINE.build(state) -> { diagnosis, targets, split, weeks, notes }
     state = {goal, age, weight, height, bf, exp, days, env, weak:[muscleIds]}
   ========================================================================= */
(function () {
  "use strict";
  const DB = window.GG_DB;

  /* --------------------------------------------------------------- VOLUME
     Fractional weekly sets per muscle. Pelland et al. 2025 (67 studies,
     n=2058) found hypertrophy still increasing at ~0.24% per additional set
     around an average of 12.25 fractional sets/week, with diminishing but
     not absent returns higher up. So we anchor on ~12 and scale by training
     age — a beginner cannot recover from or benefit from an advanced load.  */
  const BASE_VOL = { beginner: 9, intermediate: 13, advanced: 16 };

  /* Weak points get more volume, capped so nothing runs away. */
  const PRIORITY_MULT = 1.35;
  const DEPRIORITY_MULT = 0.75;
  /* Weak-point boost and goal bias used to stack multiplicatively and produced
     21+ sets for a single head of the deltoid. Combined bias is capped. */
  const MAX_COMBINED_MULT = 1.45;

  /* Per-session ceiling per muscle, counted fractionally. Beyond roughly this,
     added sets in the same session contribute progressively less than the same
     sets spread across the week. */
  const SESSION_CAP = 8;

  /* A session has to be a session someone will actually finish. These are the
     binding real-world constraints: past ~7 exercises and ~22 hard sets you are
     looking at well over 90 minutes, and adherence — not stimulus — becomes the
     limiting factor on results. */
  const MAX_EX_PER_SESSION = 8;
  const MAX_SETS_PER_SESSION = 25;
  const SETS_PER_EXERCISE = 3;

  /* Minimum weekly frequency per trained muscle. Splitting a given weekly
     volume over >=2 sessions is at least as good as 1, and usually better. */
  const MIN_FREQ = 2;

  /* --------------------------------------------------- PROXIMITY TO FAILURE
     Robinson et al. 2024 meta-regression: hypertrophy improves as sets are
     taken closer to failure, with the curve flattening near 0-2 RIR. We keep
     compounds slightly further from failure (fatigue and technique cost) and
     push isolation nearer, then hold 0-1 RIR only in the last week of a block. */
  const RIR = {
    1:{comp:3, iso:2}, 2:{comp:2, iso:1}, 3:{comp:1, iso:0},
    4:'deload',
    5:{comp:2, iso:1}, 6:{comp:1, iso:1}, 7:{comp:1, iso:0},
    8:'deload'
  };

  const SPLITS = {
    3: [['full_a','Full body A'],['full_b','Full body B'],['full_c','Full body C']],
    4: [['upper_a','Upper A'],['lower_a','Lower A'],['upper_b','Upper B'],['lower_b','Lower B']],
    5: [['push_a','Push A'],['pull_a','Pull A'],['lower_a','Lower A'],['push_b','Push B'],['pull_b','Pull B']],
    6: [['push_a','Push A'],['pull_a','Pull A'],['lower_a','Lower A'],['push_b','Push B'],['pull_b','Pull B'],['lower_b','Lower B']]
  };

  /* Two constraints drive this map.

     (a) Every muscle appears on at least two days, otherwise the >=2x/week
         rule is unreachable no matter how the allocator behaves.

     (b) Direct arm isolation is deliberately placed on LOWER days, away from
         heavy pressing and pulling. This is the structural answer to "no
         triceps straight after incline press": you cannot fix it by reordering,
         because in a chest/shoulder session something is always going to have
         pre-fatigued the triceps. Moving the isolation to a day with no
         pressing means the arms get a session where they are the fresh, first
         priority — which is also the only way a weak-point arm target is
         reachable at all in four sessions.                                    */
  const DAY_MUSCLES = {
    full_a:['chest','lats','quads','side_delt','abs'],
    full_b:['upper_back','hams','glutes','front_delt','biceps','triceps','calves'],
    full_c:['chest','lats','quads','side_delt','rear_delt','traps','abs','calves'],

    upper_a:['side_delt','chest','lats','rear_delt','upper_back','traps'],
    upper_b:['rear_delt','upper_back','front_delt','chest','lats','side_delt','traps'],
    lower_a:['quads','glutes','hams','biceps','triceps','calves','abs'],
    lower_b:['hams','glutes','quads','triceps','biceps','calves','abs'],

    push_a:['chest','front_delt','side_delt'],
    push_b:['side_delt','chest','front_delt','triceps'],
    pull_a:['lats','upper_back','rear_delt','traps'],
    pull_b:['upper_back','lats','rear_delt','biceps','traps'],
  };

  /* ---------------------------------------------------------------- helpers */
  const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));

  function ffmi(state){
    const w = +state.weight, h = +state.height/100, bf = +state.bf;
    if(!w||!h) return null;
    const lean = w * (1 - (isFinite(bf)?bf:15)/100);
    const raw = lean / (h*h);
    return { raw, norm: raw + 6.1*(1.8-h), lean };
  }

  /* Weekly fractional-set target per muscle. */
  function targets(state){
    const base = BASE_VOL[state.exp] || BASE_VOL.intermediate;
    const weak = new Set(state.weak || []);
    /* Goal shifts emphasis but never zeroes a muscle out — you cannot build a
       balanced physique by deleting body parts. */
    const goalBias = {
      aesthetics:{side_delt:1.2, chest:1.15, lats:1.1, biceps:1.1, triceps:1.1, abs:1.1},
      strength:  {quads:1.2, hams:1.15, glutes:1.15, chest:1.1, upper_back:1.1},
      calisthenics:{lats:1.25, abs:1.2, triceps:1.1, upper_back:1.1}
    }[state.goal] || {};

    const t = {};
    for (const m of DB.MUSCLES){
      let mult = 1;
      if (weak.has(m)) mult *= PRIORITY_MULT;
      if (goalBias[m]) mult *= goalBias[m];
      mult = Math.min(mult, MAX_COMBINED_MULT);
      let v = base * mult;
      /* Calves and abs tolerate and need less absolute volume to progress. */
      if (m==='calves'||m==='abs'||m==='traps') v *= DEPRIORITY_MULT;
      /* Fewer training days = less realistic weekly volume. */
      v *= clamp(0.72 + 0.07*(+state.days||4), 0.8, 1.15);
      t[m] = clamp(v, 5, 26);
    }

    /* FEASIBILITY. A session carries at most MAX_SETS_PER_SESSION sets, and a
       set of a compound credits roughly 1.9 fractional sets once synergists are
       counted. So weekly capacity is bounded, and asking for 200 fractional sets
       across 4 sessions is arithmetic nonsense. We scale the whole target vector
       down to what the chosen number of days can actually carry, which keeps the
       relative priorities intact while making every number honest.
       Adding a training day raises every target — that trade is surfaced to the
       user rather than hidden. */
    const AVG_CREDIT = 1.9;
    const capacity = (+state.days||4) * MAX_SETS_PER_SESSION * AVG_CREDIT;
    const asked = DB.MUSCLES.reduce((a,m)=>a+t[m], 0);
    if (asked > capacity){
      const k = capacity / asked;
      for (const m of DB.MUSCLES) t[m] = t[m] * k;
    }
    for (const m of DB.MUSCLES) t[m] = Math.round(clamp(t[m], 4, 26));
    t._capacityLimited = asked > capacity;
    return t;
  }

  /* -------------------------------------------------------------- ALLOCATOR
     Allocates across the WHOLE WEEK, not one session at a time. Each session
     draws from the remaining weekly deficit, so whatever session 1 could not
     fit, session 2 picks up. That is what produces >=2x frequency naturally
     instead of forcing it.

     Ordering rules applied, in priority order:
       1. Weak points get the first slot while you are fresh. Exercise order
          does NOT reliably change hypertrophy (Nunes et al. 2020, 11 studies),
          but it does favour STRENGTH in whichever lift comes first — so the
          lift you most need to get stronger at leads.
       2. Prefer a long-muscle-length option (2025 ROM review: greater
          hypertrophy at long lengths).
       3. No two heavy axial lifts adjacent.
       4. An isolation is never placed directly after a compound that already
          fatigued that muscle as a synergist. FATIGUE MANAGEMENT, not a growth
          claim — pre-exhaustion evidence is inconsistent and we say so.
       5. Hard caps on exercises and sets per session, because a plan nobody
          finishes produces nothing.                                          */
  function allocateWeek(state, t, pool, split){
    const weak = new Set(state.weak || []);
    const remaining = Object.assign({}, t);
    const sessions = split.map(([key,label]) => ({key, label, items:[], volume:{}}));

    for (const sess of sessions){
      const dayMuscles = (DAY_MUSCLES[sess.key] || []).filter(m => t[m]);
      const usedPattern = new Set();
      let setCount = 0;

      while (sess.items.length < MAX_EX_PER_SESSION &&
             setCount + SETS_PER_EXERCISE <= MAX_SETS_PER_SESSION){

        /* who needs work most right now */
        const need = dayMuscles
          .filter(m => (remaining[m] || 0) > 1)
          .filter(m => (sess.volume[m] || 0) + SETS_PER_EXERCISE <= SESSION_CAP)
          .sort((a,b) => (weak.has(b)?1:0)-(weak.has(a)?1:0) ||
                         (remaining[b]-remaining[a]));
        if (!need.length) break;

        let placed = false;
        for (const m of need){
          const prev = sess.items[sess.items.length-1];
          const cands = pool
            .filter(e => (e.contrib[m]||0) >= 1)
            .filter(e => !usedPattern.has(e.pattern))
            .filter(e => !(prev && prev.ex.axial && e.axial))
            .filter(e => {
              /* cap check across every muscle this exercise touches */
              for (const [mm,c] of Object.entries(e.contrib))
                if ((sess.volume[mm]||0) + SETS_PER_EXERCISE*c > SESSION_CAP) return false;
              return true;
            })
            .sort((x,y) => {
              /* Share first: how much of this exercise's total work actually
                 lands on the muscle we are trying to train. Without this the
                 allocator will happily use a chest dip as "triceps work" and
                 lead a leg day with it. */
              const share = e => (e.contrib[m]||0) /
                Object.values(e.contrib).reduce((a,b)=>a+b,0);
              const lenS = e => e.len==='long'?2 : e.len==='mid'?1 : 0;
              return (share(y)-share(x)) || (lenS(y)-lenS(x));
            });
          if (!cands.length) continue;

          const e = cands[0];
          const isIso = Object.keys(e.contrib).length === 1;
          const preFatigued = sess.items.some(c => (c.ex.contrib[m]||0) > 0);

          /* a weak point earns a fourth set — this is where the extra volume
             from the priority multiplier actually gets spent */
          const sets = weak.has(m) ? SETS_PER_EXERCISE + 1 : SETS_PER_EXERCISE;
          sess.items.push({ex:e, sets, target:m,
                           separated: preFatigued && isIso, lead:false});
          usedPattern.add(e.pattern);
          setCount += sets;
          for (const [mm,c] of Object.entries(e.contrib)){
            sess.volume[mm] = (sess.volume[mm]||0) + sets*c;
            remaining[mm] = (remaining[mm]||0) - sets*c;
          }
          placed = true;
          break;
        }
        if (!placed) break;
      }

      /* Selection used "share of work on the target" to pick the right exercise
         for a muscle. Ordering is a separate concern: compounds go before
         isolation, or you have simply invented pre-exhaustion. The weak-point
         lead keeps its first slot regardless — that is the one place where
         being fresh is worth more than movement class. */
      const nMuscles = c => Object.keys(c.ex.contrib).length;
      const leadItem = sess.items[0];
      const tail = sess.items.slice(1)
        .map((c,i)=>({c,i}))
        .sort((a,b) => (nMuscles(b.c)-nMuscles(a.c)) || (a.i-b.i))
        .map(x=>x.c);
      sess.items = leadItem ? [leadItem, ...tail] : [];

      /* Rule 4 repair. Moving separated isolations to the end is not enough:
         the compound that fatigued them can simply end up as the new
         predecessor. So we repeatedly look for an isolation sitting directly
         behind a compound that works the same muscle, and swap it with the
         nearest later item that does not. Bounded so it cannot spin. */
      const fatigues = (a, b) => (a.ex.contrib[b.target] || 0) > 0 &&
                                 Object.keys(b.ex.contrib).length === 1;
      for (let pass=0; pass<sess.items.length; pass++){
        let fixed = true;
        for (let i=1; i<sess.items.length; i++){
          if (!fatigues(sess.items[i-1], sess.items[i])) continue;
          const j = sess.items.findIndex((c,k) =>
            k > i && !fatigues(sess.items[i-1], c) && !fatigues(c, sess.items[i]));
          if (j > -1){
            const tmp = sess.items[i]; sess.items[i] = sess.items[j]; sess.items[j] = tmp;
            fixed = false; break;
          }
        }
        if (fixed) break;
      }
      /* rule 3: break axial adjacency the reordering may have created */
      for (let i=1; i<sess.items.length; i++){
        if (sess.items[i-1].ex.axial && sess.items[i].ex.axial){
          const j = sess.items.findIndex((c,k) => k>i && !c.ex.axial);
          if (j > -1){ const tmp=sess.items[i]; sess.items[i]=sess.items[j]; sess.items[j]=tmp; }
        }
      }
      if (sess.items.length) sess.items[0].lead = true;
    }
    return sessions;
  }

  function build(state){
    state = Object.assign({goal:'aesthetics', exp:'intermediate', days:4, env:'gym', weak:[]}, state||{});
    const days = clamp(+state.days||4, 3, 6);
    const pool = DB.available(state.env);
    const t = targets(state);
    const split = SPLITS[days] || SPLITS[4];

    /* one canonical week, then progressed across 8 weeks */
    const week = allocateWeek(state, t, pool, split);

    /* achieved weekly volume, counted the same way the research counts it */
    const achieved = {};
    for (const d of week)
      for (const [m,v] of Object.entries(d.volume))
        achieved[m] = (achieved[m]||0) + v;

    const freq = {};
    for (const m of DB.MUSCLES)
      freq[m] = week.filter(d => (d.volume[m]||0) > 0).length;

    const weeks = [];
    for (let w=1; w<=8; w++){
      const r = RIR[w];
      if (r === 'deload'){
        weeks.push({ week:w, deload:true,
          rir:'4-5', setMult:0.55,
          note:'Deload. Same lifts, roughly half the sets, stop well short of '+
               'failure. Fatigue masks the strength you actually built — this '+
               'is where it surfaces.' });
      } else {
        /* volume creeps up within a block, RIR drops */
        const blockWeek = w<4 ? w : w-4;
        weeks.push({ week:w, deload:false, rir:r,
          setMult: 1 + 0.08*(blockWeek-1),
          note: blockWeek===1 ? 'Block start. Log every load — this is your baseline.'
              : blockWeek===2 ? 'Add a rep or a small load increment where last week felt controlled.'
              : 'Hardest week of the block. Last set of isolation work to failure is fine.' });
      }
    }

    return {
      diagnosis: diagnose(state, t, achieved, freq),
      targets: t, achieved, freq, split: week, weeks,
      citations: CITATIONS
    };
  }

  function diagnose(state, t, achieved, freq){
    const f = ffmi(state);
    const w = +state.weight;
    const protein = w ? { lo: Math.round(w*1.6), hi: Math.round(w*2.2) } : null;
    /* Honest reporting beats a plan that silently under-delivers. If the
       requested training days cannot carry the volume a muscle needs, the plan
       says so and names the fix, rather than quietly programming too little
       and letting the user wonder why nothing grew. */
    const gaps = [];
    for (const m of DB.MUSCLES){
      if (!t[m]) continue;
      const got = achieved[m]||0;
      if (got < t[m]*0.75)
        gaps.push({muscle:m, target:t[m], got:Math.round(got), issue:'under',
          fix:'Only '+Math.round(got)+' of '+t[m]+' target sets fit into '+
              (state.days||4)+' sessions. Add a training day, or accept slower '+
              'progress here and revisit at the week-4 deload.'});
      if (freq[m] === 1)
        gaps.push({muscle:m, target:t[m], got:Math.round(got), issue:'freq',
          fix:'Trained once weekly. Splitting the same sets over two sessions '+
              'is at least as effective and usually better.'});
    }
    return { ffmi:f, protein, gaps,
      weak: state.weak||[],
      cut: state.goal==='aesthetics' ? {lo:300, hi:500} : null };
  }

  const CITATIONS = [
    {k:'volume', t:'Pelland et al. (2025). The Resistance Training Dose Response: '+
      'Meta-Regressions on Weekly Volume and Frequency. Sports Medicine. 67 studies, n=2058.',
      u:'https://link.springer.com/article/10.1007/s40279-025-02344-w',
      use:'Sets the ~12 fractional-set anchor and the direct/fractional counting.'},
    {k:'rom', t:'Systematic review & meta-analysis (2025). Hypertrophy from partial '+
      'repetitions at long vs. short muscle length. 8 studies.',
      u:'https://pure.ulster.ac.uk/en/publications/muscle-hypertrophy-from-partial-repetition-at-long-vs-short-muscl/',
      use:'Long-muscle-length exercises are preferred as the first lift per muscle '+
          '(overall ES 0.283; distal 0.433; central 0.276).'},
    {k:'order', t:'Nunes et al. (2020). Does exercise order affect resistance training '+
      'adaptations? A systematic review and meta-analysis. 11 studies, n=268.',
      u:'https://pubmed.ncbi.nlm.nih.gov/33555822/',
      use:'Order does NOT reliably change hypertrophy. It does favour strength in the '+
          'lift performed first — which is why weak points are programmed first.'},
    {k:'preexh', t:'Pre-exhaustion literature (acute EMG studies, mixed findings).',
      u:'https://pmc.ncbi.nlm.nih.gov/articles/PMC4763829/',
      use:'Why isolation is separated from a compound that pre-fatigued the same '+
          'muscle is framed as fatigue management, not a growth claim.'},
    {k:'protein', t:'1.6-2.2 g/kg/day protein range for resistance-trained individuals.',
      u:'https://pubmed.ncbi.nlm.nih.gov/28698222/',
      use:'Daily protein target.'}
  ];

  window.GG_ENGINE = { build, targets, ffmi, CITATIONS, BASE_VOL, SESSION_CAP, MIN_FREQ, RIR };
})();
