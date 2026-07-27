/* ============================================================================
   FORMA — Real AI physique analysis  (serverless function, "Level 2")
   ----------------------------------------------------------------------------
   WHERE THIS GOES
     • Vercel:      put this file at  /api/analyze.js   (auto-becomes POST /api/analyze)
     • Cloudflare:  rename the export to `onRequestPost` (note at bottom)
     • Netlify:     put at /netlify/functions/analyze.js and rename handler (note at bottom)

   ENV VAR (set in your host dashboard, never in the frontend):
     ANTHROPIC_API_KEY = sk-ant-...

   WHAT IT DOES
     Receives the user's stats + up to 3 base64 photos, sends them to Claude with
     a strict prompt, and returns clean JSON the frontend can render directly.

   COST/SAFETY NOTES
     • Photos never touch the browser's network except to hit YOUR endpoint over HTTPS.
     • Add your own rate-limiting / auth (e.g. a signed token after checkout) before launch.
     • This is fitness guidance, not medical advice — keep your on-site disclaimer.
   ========================================================================== */

const MODEL = "claude-opus-4-8";           // or "claude-sonnet-4-6" for lower cost
const MAX_TOKENS = 1500;

const SYSTEM_PROMPT = `You are FORMA's physique analyst. You think like an industrial engineer: measured inputs, controlled assessment, specified output. You are encouraging but honest and never flattering. You are NOT a doctor and never diagnose.

You receive a person's training inputs and 1-3 photos (front/back/side). Assess what is visibly supportable from the photos plus the numbers. If photos are missing or low quality, say so and lean on the numbers.

Rules:
- Be specific and constructive. Name real muscle groups and real, actionable fixes.
- Never comment on anything beyond physique/training. Never speculate about health conditions.
- Keep scores honest on a 1-10 scale; most trained people sit 6-8. Do not inflate.
- If the person looks very lean already, do NOT push further fat loss; emphasise muscle and balance.
- Output ONLY valid minified JSON matching the schema. No markdown, no commentary, no code fences.`;

function buildUserPrompt(d) {
  const ffmi = computeFFMI(d);
  return `INPUTS
goal: ${d.goal}
age: ${d.age ?? "n/a"}
weight_kg: ${d.weight ?? "n/a"}
height_cm: ${d.height ?? "n/a"}
bodyfat_pct: ${d.bf ?? "n/a"}
experience: ${d.experience ?? "n/a"}
days_per_week: ${d.days ?? "n/a"}
environment: ${d.environment ?? "n/a"}
computed_normalised_FFMI: ${ffmi ?? "n/a (needs weight, height, bodyfat)"}

Return JSON with EXACTLY this schema:
{
  "summary": "2-3 sentence honest overview",
  "ffmi_readout": "one sentence interpreting the FFMI value, or what to fill in if missing",
  "scores": [
    {"label":"Symmetry","value":0},
    {"label":"Proportion","value":0},
    {"label":"Muscularity","value":0},
    {"label":"Conditioning","value":0}
  ],
  "strengths": ["...", "..."],
  "weak_points": ["...", "..."],
  "priority_fixes": ["most important first", "...", "..."],
  "plan_adjustments": "2-3 sentences on how their plan should be weighted given the above"
}`;
}

function computeFFMI(d) {
  const w = parseFloat(d.weight), h = parseFloat(d.height), bf = parseFloat(d.bf);
  if (!w || !h || !bf) return null;
  const hm = h / 100;
  const ffm = w * (1 - bf / 100);
  const ffmi = ffm / (hm * hm);
  return +(ffmi + 6.1 * (1.8 - hm)).toFixed(1);
}

/* ---- Vercel / generic Node handler (req, res) ---- */
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { photos = [] } = body; // photos: [{ media_type, data }] base64 (no data: prefix)

    // Assemble the message content: text + any images
    const content = [{ type: "text", text: buildUserPrompt(body) }];
    for (const p of photos.slice(0, 3)) {
      if (p && p.data) {
        content.push({
          type: "image",
          source: { type: "base64", media_type: p.media_type || "image/jpeg", data: p.data }
        });
      }
    }

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content }]
      })
    });

    if (!r.ok) {
      const errText = await r.text();
      return res.status(502).json({ error: "Upstream error", detail: errText });
    }

    const data = await r.json();
    // Claude returns content blocks; concatenate the text blocks then parse JSON.
    const text = (data.content || [])
      .filter(b => b.type === "text")
      .map(b => b.text)
      .join("")
      .trim()
      .replace(/^```json\s*|\s*```$/g, ""); // strip fences just in case

    let analysis;
    try { analysis = JSON.parse(text); }
    catch { return res.status(200).json({ raw: text, warning: "Model did not return clean JSON" }); }

    return res.status(200).json({ analysis, ffmi: computeFFMI(body) });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}

/* ============================================================================
   FRONTEND CALL (drop into your site's builder, replacing the local generator
   or running alongside it). Reads the file inputs as base64 and posts them.
   ----------------------------------------------------------------------------
   async function runRealAnalysis(state, fileInputs) {
     const photos = [];
     for (const input of fileInputs) {
       const f = input.files[0];
       if (!f) continue;
       const b64 = await new Promise((res, rej) => {
         const r = new FileReader();
         r.onload = () => res(r.result.split(",")[1]);  // strip "data:image/...;base64,"
         r.onerror = rej;
         r.readAsDataURL(f);
       });
       photos.push({ media_type: f.type || "image/jpeg", data: b64 });
     }
     const resp = await fetch("/api/analyze", {
       method: "POST",
       headers: { "content-type": "application/json" },
       body: JSON.stringify({
         goal: state.goal, age: state.age, weight: state.weight, height: state.height,
         bf: state.bf, experience: state.exp, days: state.days,
         environment: state.env, photos
       })
     });
     const { analysis, ffmi } = await resp.json();
     // render analysis.summary, analysis.scores[], analysis.strengths[], etc.
     return { analysis, ffmi };
   }
   ============================================================================

   CLOUDFLARE PAGES FUNCTIONS variant — same logic, different signature:
     export async function onRequestPost(context) {
       const body = await context.request.json();
       // ...same assembly...
       const r = await fetch("https://api.anthropic.com/v1/messages", {
         headers: { ..., "x-api-key": context.env.ANTHROPIC_API_KEY, ... }, ...
       });
       return new Response(JSON.stringify({ analysis, ffmi }), {
         headers: { "content-type": "application/json" }
       });
     }

   NETLIFY variant: export const handler = async (event) => { const body = JSON.parse(event.body); ... return { statusCode:200, body: JSON.stringify(...) }; }
   ========================================================================== */
