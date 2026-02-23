import { buildUtmUrl, abTest, seoMetrics, scoreSubjectLine } from "./app.js";

(function runTests(){
  const assert = (cond, msg) => { if (!cond) throw new Error("TEST FAIL: " + msg); };

  // UTM
  const u = buildUtmUrl("https://example.com/x", { source:"a", medium:"b", campaign:"c" });
  assert(u.includes("utm_source=a"), "UTM source");
  assert(u.includes("utm_medium=b"), "UTM medium");
  assert(u.includes("utm_campaign=c"), "UTM campaign");

  // A/B: basic sanity
  const r = abTest({aVisitors:1000,aConv:50,bVisitors:1000,bConv:80});
  assert(r.ok, "AB ok");
  assert(r.winner === "B", "B should win");

  // SEO
  const m = seoMetrics("123456789012345678901234567890", "x".repeat(130));
  assert(m.titleOk === true, "Title ok range");
  assert(m.descOk === true, "Desc ok range");

  // Subject scoring
  const s1 = scoreSubjectLine("Free cash!!!");
  assert(s1.score < 80, "Spammy subject penalized");
  const s2 = scoreSubjectLine("3 quick wins to improve conversions this week");
  assert(s2.score > s1.score, "Better subject scores higher");

  console.log("✅ All tests passed.");
})();