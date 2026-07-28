/* ============================================================================
   GERGÖ GAINS — EXERCISE DATABASE
   ----------------------------------------------------------------------------
   Data model, and why each field exists:

   contrib   How much each muscle is worked, as a fraction of one "hard set".
             1.0 = direct set (the muscle is a prime mover)
             0.5 = fractional set (meaningful synergist contribution)
             This mirrors how Pelland et al. (2025, Sports Medicine) classify
             direct vs. fractional sets in their volume meta-regression, so the
             weekly volume we prescribe is counted the same way the research
             counted it. Without this, "12 sets for chest" is meaningless —
             incline press also loads front delts and triceps.

   len       Muscle length at which the target is loaded under most tension:
             'long'  = stretched position emphasis
             'mid'   = mid-range
             'short' = shortened / peak-contraction emphasis
             A 2025 systematic review (8 studies) found training at longer
             muscle length produced greater hypertrophy overall (ES 0.283),
             distal (0.433) and central (0.276). So the engine prefers 'long'
             options for the first exercise per muscle.

   equip     'gym' | 'home' | 'both'  — drives the home/gym/both toggle.
   sub       Home substitution when equip is 'gym'.
   pattern   Used to avoid stacking three near-identical movements.
   axial     true = meaningful spinal/systemic load. Used to avoid putting two
             heavy axial lifts back-to-back, and to cap them per session.

   Adding an exercise: copy any row, keep contrib fractions honest. Anything
   you add is picked up automatically — no other file needs editing.
   ========================================================================= */

window.GG_DB = {

  MUSCLES: ['chest','front_delt','side_delt','rear_delt','lats','upper_back',
            'traps','biceps','triceps','quads','hams','glutes','calves','abs'],

  LABEL: {
    chest:'Chest', front_delt:'Front delts', side_delt:'Side delts',
    rear_delt:'Rear delts', lats:'Lats', upper_back:'Upper back',
    traps:'Traps', biceps:'Biceps', triceps:'Triceps', quads:'Quads',
    hams:'Hamstrings', glutes:'Glutes', calves:'Calves', abs:'Abs'
  },

  EX: [
  /* ---------------------------------------------------------------- CHEST */
  {id:'incline_db_press',  name:'Incline DB Press (60°)', pattern:'incline_push', equip:'both',
   contrib:{chest:1, front_delt:0.5, triceps:0.5}, len:'long', axial:false,
   note:'Upper-chest anchor. Stretch under load at the bottom.'},
  {id:'incline_bb_press',  name:'Incline Barbell Press', pattern:'incline_push', equip:'gym',
   contrib:{chest:1, front_delt:0.5, triceps:0.5}, len:'mid', axial:false,
   sub:'incline_db_press', note:'Heavier loading, less stretch than dumbbells.'},
  {id:'flat_db_press',     name:'Flat DB Press', pattern:'horizontal_push', equip:'both',
   contrib:{chest:1, front_delt:0.5, triceps:0.5}, len:'long', axial:false},
  {id:'bench_press',       name:'Barbell Bench Press', pattern:'horizontal_push', equip:'gym',
   contrib:{chest:1, front_delt:0.5, triceps:0.5}, len:'mid', axial:false,
   sub:'flat_db_press'},
  {id:'low_high_fly',      name:'Low-to-High Cable Fly', pattern:'fly', equip:'gym',
   contrib:{chest:1, front_delt:0.5}, len:'long', axial:false,
   sub:'band_low_high_fly', note:'Upper-chest fibres, constant tension.'},
  {id:'band_low_high_fly', name:'Band Low-to-High Fly', pattern:'fly', equip:'home',
   contrib:{chest:1, front_delt:0.5}, len:'mid', axial:false},
  {id:'mid_cable_fly',     name:'Mid Cable Fly', pattern:'fly', equip:'gym',
   contrib:{chest:1}, len:'long', axial:false, sub:'band_low_high_fly'},
  {id:'deficit_pushup',    name:'Deficit Push-up', pattern:'horizontal_push', equip:'home',
   contrib:{chest:1, front_delt:0.5, triceps:0.5}, len:'long', axial:false,
   note:'Hands elevated on books/blocks for extra stretch.'},
  {id:'dip',               name:'Chest Dip', pattern:'vertical_push', equip:'both',
   contrib:{chest:1, triceps:1, front_delt:0.5}, len:'long', axial:false},

  /* ------------------------------------------------------------- SHOULDERS */
  {id:'ohp',               name:'Overhead Press', pattern:'vertical_push', equip:'gym',
   contrib:{front_delt:1, side_delt:0.5, triceps:0.5}, len:'mid', axial:true,
   sub:'db_ohp'},
  {id:'db_ohp',            name:'Seated DB Overhead Press', pattern:'vertical_push', equip:'both',
   contrib:{front_delt:1, side_delt:0.5, triceps:0.5}, len:'mid', axial:false},
  {id:'cable_lat_raise',   name:'Cable Lateral Raise', pattern:'lateral_raise', equip:'gym',
   contrib:{side_delt:1}, len:'long', axial:false, sub:'band_lat_raise',
   note:'Cable from behind the body loads the stretched position.'},
  {id:'db_lat_raise',      name:'DB Lateral Raise', pattern:'lateral_raise', equip:'both',
   contrib:{side_delt:1}, len:'short', axial:false},
  {id:'band_lat_raise',    name:'Band Lateral Raise', pattern:'lateral_raise', equip:'home',
   contrib:{side_delt:1}, len:'mid', axial:false},
  {id:'lean_lat_raise',    name:'Leaning DB Lateral Raise', pattern:'lateral_raise', equip:'both',
   contrib:{side_delt:1}, len:'long', axial:false,
   note:'Lean away from a support — tension where the delt is stretched.'},
  {id:'reverse_pec_deck',  name:'Reverse Pec-Deck', pattern:'rear_delt', equip:'gym',
   contrib:{rear_delt:1, upper_back:0.5}, len:'long', axial:false, sub:'band_rear_delt'},
  {id:'band_rear_delt',    name:'Band Rear-Delt Row', pattern:'rear_delt', equip:'home',
   contrib:{rear_delt:1, upper_back:0.5}, len:'mid', axial:false},
  {id:'face_pull',         name:'Face Pull', pattern:'rear_delt', equip:'gym',
   contrib:{rear_delt:1, upper_back:0.5, traps:0.5}, len:'mid', axial:false,
   sub:'band_rear_delt'},
  {id:'prone_y_raise',     name:'Prone Y-Raise', pattern:'rear_delt', equip:'home',
   contrib:{rear_delt:1, upper_back:0.5, traps:0.5}, len:'mid', axial:false},

  /* ------------------------------------------------------------------ BACK */
  {id:'weighted_pullup',   name:'Weighted Pull-up', pattern:'vertical_pull', equip:'both',
   contrib:{lats:1, biceps:0.5, upper_back:0.5}, len:'long', axial:false},
  {id:'pullup',            name:'Pull-up', pattern:'vertical_pull', equip:'both',
   contrib:{lats:1, biceps:0.5, upper_back:0.5}, len:'long', axial:false},
  {id:'lat_pulldown',      name:'Lat Pulldown', pattern:'vertical_pull', equip:'gym',
   contrib:{lats:1, biceps:0.5, upper_back:0.5}, len:'long', axial:false, sub:'pullup'},
  {id:'chest_supported_row',name:'Chest-Supported Row', pattern:'horizontal_pull', equip:'gym',
   contrib:{upper_back:1, lats:1, rear_delt:0.5, biceps:0.5}, len:'mid', axial:false,
   sub:'db_row', note:'No lower-back fatigue cost — good after squats.'},
  {id:'db_row',            name:'Single-Arm DB Row', pattern:'horizontal_pull', equip:'both',
   contrib:{upper_back:1, lats:1, biceps:0.5}, len:'long', axial:false},
  {id:'barbell_row',       name:'Barbell Row', pattern:'horizontal_pull', equip:'gym',
   contrib:{upper_back:1, lats:1, biceps:0.5, hams:0.5}, len:'mid', axial:true,
   sub:'db_row'},
  {id:'inverted_row',      name:'Inverted Row', pattern:'horizontal_pull', equip:'home',
   contrib:{upper_back:1, lats:0.5, biceps:0.5, rear_delt:0.5}, len:'mid', axial:false},
  {id:'straight_arm_pd',   name:'Straight-Arm Pulldown', pattern:'lat_isolation', equip:'gym',
   contrib:{lats:1}, len:'long', axial:false, sub:'band_lat_pullover'},
  {id:'band_lat_pullover', name:'Band Lat Pullover', pattern:'lat_isolation', equip:'home',
   contrib:{lats:1}, len:'long', axial:false},
  {id:'shrug',             name:'DB Shrug', pattern:'shrug', equip:'both',
   contrib:{traps:1}, len:'long', axial:false},

  /* ----------------------------------------------------------------- ARMS */
  {id:'incline_db_curl',   name:'Incline DB Curl', pattern:'curl', equip:'both',
   contrib:{biceps:1}, len:'long', axial:false,
   note:'Arm behind the torso — biceps loaded in the stretch.'},
  {id:'cable_curl_behind', name:'Behind-Body Cable Curl', pattern:'curl', equip:'gym',
   contrib:{biceps:1}, len:'long', axial:false, sub:'incline_db_curl'},
  {id:'preacher_curl',     name:'Preacher Curl', pattern:'curl', equip:'gym',
   contrib:{biceps:1}, len:'long', axial:false, sub:'incline_db_curl'},
  {id:'hammer_curl',       name:'Hammer Curl', pattern:'curl', equip:'both',
   contrib:{biceps:1}, len:'mid', axial:false, note:'Brachialis emphasis — adds arm width.'},
  {id:'bb_curl',           name:'Barbell Curl', pattern:'curl', equip:'both',
   contrib:{biceps:1}, len:'mid', axial:false},
  {id:'overhead_tri_ext',  name:'Overhead Tricep Extension', pattern:'tri_extension', equip:'both',
   contrib:{triceps:1}, len:'long', axial:false,
   note:'Only position that loads the long head in its stretch.'},
  {id:'cable_overhead_tri',name:'Cable Overhead Extension', pattern:'tri_extension', equip:'gym',
   contrib:{triceps:1}, len:'long', axial:false, sub:'overhead_tri_ext'},
  {id:'skullcrusher',      name:'EZ-Bar Skullcrusher', pattern:'tri_extension', equip:'both',
   contrib:{triceps:1}, len:'long', axial:false},
  {id:'rope_pushdown',     name:'Rope Pushdown', pattern:'tri_pushdown', equip:'gym',
   contrib:{triceps:1}, len:'short', axial:false, sub:'band_pushdown'},
  {id:'band_pushdown',     name:'Band Pushdown', pattern:'tri_pushdown', equip:'home',
   contrib:{triceps:1}, len:'short', axial:false},
  {id:'close_grip_pushup', name:'Close-Grip Push-up', pattern:'tri_pushdown', equip:'home',
   contrib:{triceps:1, chest:0.5, front_delt:0.5}, len:'mid', axial:false},

  /* ----------------------------------------------------------------- LEGS */
  {id:'back_squat',        name:'Back Squat', pattern:'squat', equip:'gym',
   contrib:{quads:1, glutes:1, hams:0.5}, len:'long', axial:true, sub:'goblet_squat'},
  {id:'front_squat',       name:'Front Squat', pattern:'squat', equip:'gym',
   contrib:{quads:1, glutes:0.5}, len:'long', axial:true, sub:'goblet_squat'},
  {id:'hack_squat',        name:'Hack Squat', pattern:'squat', equip:'gym',
   contrib:{quads:1, glutes:0.5}, len:'long', axial:false, sub:'goblet_squat'},
  {id:'goblet_squat',      name:'Goblet Squat', pattern:'squat', equip:'home',
   contrib:{quads:1, glutes:0.5}, len:'long', axial:false},
  {id:'bulgarian_split',   name:'Bulgarian Split Squat', pattern:'lunge', equip:'both',
   contrib:{quads:1, glutes:1, hams:0.5}, len:'long', axial:false},
  {id:'leg_press',         name:'Leg Press', pattern:'squat', equip:'gym',
   contrib:{quads:1, glutes:0.5}, len:'mid', axial:false, sub:'goblet_squat'},
  {id:'rdl',               name:'Romanian Deadlift', pattern:'hinge', equip:'both',
   contrib:{hams:1, glutes:1, upper_back:0.5}, len:'long', axial:true},
  {id:'seated_leg_curl',   name:'Seated Leg Curl', pattern:'knee_flexion', equip:'gym',
   contrib:{hams:1}, len:'long', axial:false, sub:'nordic_curl',
   note:'Hip flexed = hamstring stretched. Beats lying curl for growth.'},
  {id:'nordic_curl',       name:'Nordic Hamstring Curl', pattern:'knee_flexion', equip:'home',
   contrib:{hams:1}, len:'long', axial:false},
  {id:'hip_thrust',        name:'Hip Thrust', pattern:'hip_extension', equip:'both',
   contrib:{glutes:1, hams:0.5}, len:'short', axial:false},
  {id:'leg_extension',     name:'Leg Extension', pattern:'knee_extension', equip:'gym',
   contrib:{quads:1}, len:'short', axial:false, sub:'sissy_squat'},
  {id:'sissy_squat',       name:'Sissy Squat', pattern:'knee_extension', equip:'home',
   contrib:{quads:1}, len:'long', axial:false},
  {id:'standing_calf',     name:'Standing Calf Raise', pattern:'calf', equip:'both',
   contrib:{calves:1}, len:'long', axial:false, note:'Full stretch at the bottom, no bouncing.'},
  {id:'seated_calf',       name:'Seated Calf Raise', pattern:'calf', equip:'gym',
   contrib:{calves:1}, len:'long', axial:false, sub:'standing_calf'},

  /* ------------------------------------------------------------------ ABS */
  {id:'hanging_leg_raise', name:'Hanging Leg Raise', pattern:'ab_flexion', equip:'both',
   contrib:{abs:1}, len:'long', axial:false},
  {id:'cable_crunch',      name:'Cable Crunch', pattern:'ab_flexion', equip:'gym',
   contrib:{abs:1}, len:'long', axial:false, sub:'hanging_leg_raise'},
  {id:'ab_wheel',          name:'Ab Wheel Rollout', pattern:'ab_antiext', equip:'home',
   contrib:{abs:1}, len:'long', axial:false},

  /* ----------------------------------------------------------- SKILL WORK */
  {id:'front_lever_prog',  name:'Front Lever Progression', pattern:'skill', equip:'both',
   contrib:{lats:1, abs:1, upper_back:0.5}, len:'mid', axial:false, skill:true},
  {id:'muscle_up_prog',    name:'Muscle-up Progression', pattern:'skill', equip:'both',
   contrib:{lats:1, chest:0.5, triceps:0.5}, len:'mid', axial:false, skill:true},
  {id:'hspu_prog',         name:'Handstand Push-up Progression', pattern:'skill', equip:'both',
   contrib:{front_delt:1, triceps:1, side_delt:0.5}, len:'mid', axial:false, skill:true}
  ],

  byId(id){ return this.EX.find(e => e.id === id) || null; },

  /* Exercises available for a given equipment setting, with gym-only lifts
     swapped for their home substitute when the user trains at home. */
  available(env){
    const out = [];
    for (const e of this.EX){
      if (env === 'home'){
        if (e.equip === 'home' || e.equip === 'both') out.push(e);
        else if (e.sub){ const s = this.byId(e.sub); if (s && !out.includes(s)) out.push(s); }
      } else {
        if (e.equip === 'gym' || e.equip === 'both') out.push(e);
        else if (env === 'both') out.push(e);
      }
    }
    return [...new Set(out)];
  }
};
