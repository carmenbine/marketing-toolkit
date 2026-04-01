// --- Utils ---
export function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

export function buildUtmUrl(baseUrl, params) {
  const url = new URL(baseUrl);
  const mapping = {
    utm_source: params.source,
    utm_medium: params.medium,
    utm_campaign: params.campaign,
    utm_content: params.content,
    utm_term: params.term
  };
  Object.entries(mapping).forEach(([k, v]) => {
    if (v && String(v).trim().length) url.searchParams.set(k, String(v).trim());
  });
  return url.toString();
}

// Two-proportion z-test for quick decision support
export function abTest({aVisitors, aConv, bVisitors, bConv}) {
  const n1 = Number(aVisitors), x1 = Number(aConv);
  const n2 = Number(bVisitors), x2 = Number(bConv);
  if ([n1,x1,n2,x2].some(v => !Number.isFinite(v) || v < 0)) {
    return { ok:false, error:"Inputs must be non-negative numbers." };
  }
  if (x1 > n1 || x2 > n2) return { ok:false, error:"Conversions cannot exceed visitors." };
  if (n1 === 0 || n2 === 0) return { ok:false, error:"Visitors must be > 0 for both variants." };

  const p1 = x1 / n1;
  const p2 = x2 / n2;
  const p = (x1 + x2) / (n1 + n2);
  const se = Math.sqrt(p * (1 - p) * (1/n1 + 1/n2));
  if (se === 0) return { ok:false, error:"Standard error is 0 (no variability)." };
  const z = (p2 - p1) / se;

  // Approx normal CDF via erf approximation
  const cdf = (z) => 0.5 * (1 + erf(z / Math.SQRT2));
  const pValueTwoSided = 2 * (1 - cdf(Math.abs(z)));

  const lift = (p2 - p1) / (p1 || 1e-12);
  const winner = p2 > p1 ? "B" : (p1 > p2 ? "A" : "Tie");

  return {
    ok:true,
    p1, p2, z,
    pValueTwoSided,
    lift,
    winner
  };
}

// Abramowitz-Stegun erf approximation
export function erf(x) {
  const sign = x < 0 ? -1 : 1;
  const a1=0.254829592, a2=-0.284496736, a3=1.421413741, a4=-1.453152027, a5=1.061405429;
  const p=0.3275911;
  const ax = Math.abs(x);
  const t = 1 / (1 + p * ax);
  const y = 1 - (((((a5*t + a4)*t) + a3)*t + a2)*t + a1)*t * Math.exp(-ax*ax);
  return sign * y;
}

export function seoMetrics(title, desc) {
  const t = (title || "").trim();
  const d = (desc || "").trim();
  return {
    titleLen: t.length,
    descLen: d.length,
    titleOk: t.length >= 30 && t.length <= 60,
    descOk: d.length >= 120 && d.length <= 160
  };
}

const SPAM_WORDS = ["free", "guaranteed", "winner", "act now", "urgent", "cash", "deal", "!!!"];
export function scoreSubjectLine(subject) {
  const s = (subject || "").trim();
  if (!s.length) return { score: 0, notes: ["Enter a subject line."] };

  let score = 100;
  const notes = [];

  // Length
  if (s.length < 25) { score -= 15; notes.push("A bit short — consider adding specificity."); }
  if (s.length > 70) { score -= 20; notes.push("Long — may truncate on mobile."); }

  // Spam signals
  const lower = s.toLowerCase();
  const spamHits = SPAM_WORDS.filter(w => lower.includes(w));
  if (spamHits.length) {
    score -= 10 * spamHits.length;
    notes.push(`Spammy terms detected: ${spamHits.join(", ")}.`);
  }
  const excls = (s.match(/!/g) || []).length;
  if (excls >= 2) { score -= 10; notes.push("Too many exclamation points."); }

  // Clarity heuristics: numbers + concrete words
  if (/\d/.test(s)) { score += 5; notes.push("Good: numbers often improve clarity."); }
  if (s.split(/\s+/).length < 4) { score -= 10; notes.push("Very few words — may be vague."); }

  score = clamp(score, 0, 100);
  return { score, notes };
}

// --- DOM wiring ---
const $ = (id) => document.getElementById(id);

function setMsg(id, text) { const el = $(id); if (el) el.textContent = text; }

function initUtm() {
  $("utmBuild").addEventListener("click", () => {
    try {
      const base = $("utmBase").value.trim();
      const url = buildUtmUrl(base, {
        source: $("utmSource").value,
        medium: $("utmMedium").value,
        campaign: $("utmCampaign").value,
        content: $("utmContent").value,
        term: $("utmTerm").value
      });
      $("utmResult").value = url;
      setMsg("utmMsg", "Built.");
    } catch (e) {
      setMsg("utmMsg", "Invalid base URL.");
    }
  });

  $("utmPresetEmail").addEventListener("click", () => {
    $("utmSource").value = "newsletter";
    $("utmMedium").value = "email";
    $("utmCampaign").value = "weekly_update";
    setMsg("utmMsg", "Preset applied.");
  });

  $("utmPresetPaid").addEventListener("click", () => {
    $("utmSource").value = "meta";
    $("utmMedium").value = "paid_social";
    $("utmCampaign").value = "prospecting";
    setMsg("utmMsg", "Preset applied.");
  });

  $("utmCopy").addEventListener("click", async () => {
    const val = $("utmResult").value;
    try {
      await navigator.clipboard.writeText(val);
      setMsg("utmMsg", "Copied.");
    } catch {
      setMsg("utmMsg", "Copy failed (browser permission).");
    }
  });
}

function initAb() {
  $("abRun").addEventListener("click", () => {
    const res = abTest({
      aVisitors: $("aVisitors").value,
      aConv: $("aConv").value,
      bVisitors: $("bVisitors").value,
      bConv: $("bConv").value
    });
    const out = $("abOut");
    if (!res.ok) { out.textContent = res.error; return; }

    const pct = (x) => (100 * x).toFixed(2) + "%";
    const pval = res.pValueTwoSided;
    const sig = pval < 0.05 ? "Likely real (p < 0.05)" : "Not significant (p ≥ 0.05)";
    const liftPct = (100 * res.lift).toFixed(2) + "%";

    out.innerHTML = `
      <div><strong>A:</strong> ${pct(res.p1)} conversion</div>
      <div><strong>B:</strong> ${pct(res.p2)} conversion</div>
      <div><strong>Winner:</strong> ${res.winner}</div>
      <div><strong>Lift:</strong> ${liftPct}</div>
      <div><strong>p-value (2-sided):</strong> ${pval.toFixed(4)} → ${sig}</div>
      <div class="small">Note: This is quick decision support, not a full experimentation platform.</div>
    `;
  });
}

function initSeo() {
  const update = () => {
    const t = $("seoTitle").value;
    const d = $("seoDesc").value;
    const m = seoMetrics(t, d);
    $("seoCounts").innerHTML = `
      <div><strong>Title:</strong> ${m.titleLen} chars ${m.titleOk ? "✅" : "⚠️ (aim 30–60)"}</div>
      <div><strong>Meta:</strong> ${m.descLen} chars ${m.descOk ? "✅" : "⚠️ (aim 120–160)"}</div>
    `;
    $("serpTitle").textContent = t.trim() || "Your Title Appears Here";
    $("serpDesc").textContent = d.trim() || "Your meta description preview shows here.";
  };
  $("seoTitle").addEventListener("input", update);
  $("seoDesc").addEventListener("input", update);
  update();
}

function initSubject() {
  $("subjScore").addEventListener("click", () => {
    const s = $("subj").value;
    const r = scoreSubjectLine(s);
    $("subjOut").innerHTML = `
      <div><strong>Score:</strong> ${r.score}/100</div>
      <ul>${r.notes.map(n => `<li>${n}</li>`).join("")}</ul>
    `;
  });
}

initUtm();
initAb();
initSeo();
initSubject();