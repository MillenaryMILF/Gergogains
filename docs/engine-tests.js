global.window = {};
require('/Users/gergoszittyai/Projects/gergo-gains/assets/js/exercise-db.js');
require('/Users/gergoszittyai/Projects/gergo-gains/assets/js/programming.js');
const DB = window.GG_DB, E = window.GG_ENGINE;

let fail = 0;
const ok = (c,m)=>{ console.log((c?'  PASS  ':'  FAIL  ')+m); if(!c) fail++; };

// Geri's own spec from his notes: 87kg, 183cm, ~12% bf, weak arms + side delts
const geri = {goal:'aesthetics', age:24, weight:87, height:183, bf:12,
              exp:'intermediate', days:4, env:'gym', weak:['biceps','triceps','side_delt','rear_delt']};
const r = E.build(geri);

console.log('\n=== FFMI / Diagnose ===');
console.log('  FFMI norm:', r.diagnosis.ffmi.norm.toFixed(1), '| lean', r.diagnosis.ffmi.lean.toFixed(1),'kg');
console.log('  Protein:', r.diagnosis.protein.lo+'-'+r.diagnosis.protein.hi+' g');

console.log('\n=== Wochenvolumen: Ziel vs. erreicht (fraktionierte Saetze) ===');
for (const m of DB.MUSCLES){
  const t=r.targets[m], a=Math.round(r.achieved[m]||0), f=r.freq[m];
  const flag = a < t*0.7 ? ' << UNTER ZIEL' : (a > t*1.5 ? ' << WEIT DRUEBER' : '');
  console.log(`  ${DB.LABEL[m].padEnd(12)} Ziel ${String(t).padStart(2)}  erreicht ${String(a).padStart(2)}  Frequenz ${f}${flag}`);
}

console.log('\n=== Regel-Checks ===');
// 1. frequency >= 2 for every muscle that gets meaningful volume
const lowFreq = DB.MUSCLES.filter(m => (r.achieved[m]||0) >= 6 && r.freq[m] < 2);
ok(lowFreq.length===0, 'Jeder trainierte Muskel >=2x/Woche' + (lowFreq.length?' -> '+lowFreq.join(','):''));

// 2. per-session cap respected
let capViol=[];
for (const d of r.split) for (const [m,v] of Object.entries(d.volume))
  if (v > E.SESSION_CAP) capViol.push(`${d.label}:${m}=${v}`);
ok(capViol.length===0, 'Kein Muskel ueber '+E.SESSION_CAP+' Saetze pro Einheit' + (capViol.length?' -> '+capViol.join(','):''));

// 3. weak point leads its session
const weakSet=new Set(geri.weak);
const leadTargets = r.split.map(d=>d.items[0] && d.items[0].target);
ok(leadTargets.some(t=>weakSet.has(t)), 'Mind. eine Einheit startet mit einer Schwachstelle -> '+leadTargets.join(', '));

// 4. no two adjacent axial lifts
let axViol=[];
for (const d of r.split) for (let i=1;i<d.items.length;i++)
  if (d.items[i-1].ex.axial && d.items[i].ex.axial) axViol.push(d.label);
ok(axViol.length===0, 'Keine zwei axialen Lifts hintereinander' + (axViol.length?' -> '+axViol.join(','):''));

// 5. HIS RULE: isolation never directly after a compound that pre-fatigued it
let interViol=[];
for (const d of r.split){
  for (let i=1;i<d.items.length;i++){
    const cur=d.items[i], prev=d.items[i-1];
    const iso = Object.keys(cur.ex.contrib).length===1;
    if (iso && (prev.ex.contrib[cur.target]||0) > 0)
      interViol.push(`${d.label}: ${cur.ex.name} direkt nach ${prev.ex.name}`);
  }
}
ok(interViol.length===0, 'Keine Isolation direkt nach vorermuedendem Compound' + (interViol.length?'\n         -> '+interViol.join('\n         -> '):''));

// 6. long-length preferred as first lift for a muscle
const leads = r.split.flatMap(d=>d.items.filter(x=>x.lead));
ok(leads.every(x=>x.ex.len!=='short'), 'Fuehrende Uebung nie eine Short-Length-Variante');

// 7. deloads present
const dl = r.weeks.filter(w=>w.deload).map(w=>w.week);
ok(dl.length===2 && dl.includes(4) && dl.includes(8), 'Deload in Woche 4 und 8 -> '+dl.join(','));

// 8. every exercise is home-legal when env=home
const home = E.build(Object.assign({},geri,{env:'home'}));
const gymOnly = home.split.flatMap(d=>d.items).filter(x=>x.ex.equip==='gym');
ok(gymOnly.length===0, 'Home-Plan enthaelt keine Gym-only Uebung' + (gymOnly.length?' -> '+gymOnly.map(x=>x.ex.name).join(','):''));

// 9. all day-splits produce non-empty sessions
let emptyDays=[];
for (const d of [3,4,5,6]){
  const rr=E.build(Object.assign({},geri,{days:d}));
  rr.split.forEach(s=>{ if(!s.items.length) emptyDays.push(d+'d:'+s.label); });
}
ok(emptyDays.length===0, 'Alle Splits 3-6 Tage erzeugen gefuellte Einheiten' + (emptyDays.length?' -> '+emptyDays.join(','):''));

console.log('\n=== Beispiel-Einheit (Upper A, Woche 3) ===');
const w3=r.weeks[2];
r.split[0].items.forEach((it,i)=>{
  const iso=Object.keys(it.ex.contrib).length===1;
  const sets=Math.round(it.sets*w3.setMult);
  console.log(`  ${i+1}. ${it.ex.name.padEnd(30)} ${sets}x  RIR ${iso?w3.rir.iso:w3.rir.comp}  [${DB.LABEL[it.target]}${it.ex.len==='long'?', long-length':''}]`);
});

console.log('\n'+(fail?`### ${fail} FEHLER`:'### alle Checks bestanden'));
process.exit(fail?1:0);
