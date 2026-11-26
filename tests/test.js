// Hifz - node test suite for the scheduler core and the bundled data.
// Run: node tests/test.js
"use strict";
const S = require("../scheduler.js");
const DATA = require("../data.js");

let passed = 0, failed = 0;
const failures = [];
function ok(cond, name) {
  if (cond) { passed++; }
  else { failed++; failures.push(name); console.error("FAIL:", name); }
}
function eq(a, b, name) { ok(a === b, name + " (got " + JSON.stringify(a) + ", want " + JSON.stringify(b) + ")"); }

// ---------- data integrity ----------
eq(DATA.surahs.length, 114, "data: 114 surahs");
eq(S.TOTAL_AYAHS, 6236, "data: total ayahs 6236");
eq(DATA.surahs[0].ayahs, 7, "data: Al-Fatiha 7");
eq(DATA.surahs[1].ayahs, 286, "data: Al-Baqarah 286");
eq(DATA.surahs[17].ayahs, 110, "data: Al-Kahf 110");
eq(DATA.surahs[35].ayahs, 83, "data: Ya-Sin 83");
eq(DATA.surahs[113].ayahs, 6, "data: An-Nas 6");
DATA.surahs.forEach((s, i) => {
  eq(s.n, i + 1, "data: surah order " + (i + 1));
  ok(s.ayahs > 0 && Number.isInteger(s.ayahs), "data: positive count " + s.n);
  ok(s.ar && s.en && s.enTr, "data: names present " + s.n);
});
eq(DATA.juzBounds.length, 30, "data: 30 juz boundaries");
eq(DATA.juzBounds[0][0], 1, "data: juz 1 surah 1");
eq(DATA.juzBounds[0][1], 1, "data: juz 1 ayah 1");
eq(DATA.juzBounds[29][0], 78, "data: juz 30 starts An-Naba");
eq(DATA.juzBounds[1][0], 2, "data: juz 2 surah 2");
eq(DATA.juzBounds[1][1], 142, "data: juz 2 ayah 142");

// ---------- date helpers ----------
eq(S.dayStr(new Date(2026, 0, 5)), "2026-01-05", "date: dayStr");
eq(S.addDays("2026-01-31", 1), "2026-02-01", "date: month rollover");
eq(S.addDays("2026-12-31", 1), "2027-01-01", "date: year rollover");
eq(S.addDays("2024-02-28", 1), "2024-02-29", "date: leap year");
eq(S.diffDays("2026-01-01", "2026-01-08"), 7, "date: diff");

// ---------- validation ----------
eq(S.validateRange(1, 1, 7), null, "valid: full Fatiha");
eq(S.validateRange(2, 142, 141), "err_order", "valid: from>to rejected");
eq(S.validateRange(2, 0, 5), "err_from_low", "valid: 0 rejected");
eq(S.validateRange(1, 1, 8), "err_to_high", "valid: beyond Fatiha rejected");
eq(S.validateRange(115, 1, 1), "err_surah", "valid: surah 115 rejected");
eq(S.validateRange(9, 3.5, 5), "err_number", "valid: non-integer rejected");

// ---------- entry creation ----------
let e = S.createEntry({ surah: 1, from: 1, to: 7, date: "2026-11-01", confidence: "medium" });
eq(e.stage, 1, "create: medium starts stage 1");
eq(e.nextDue, "2026-11-03", "create: medium due +2 days");
e = S.createEntry({ surah: 2, from: 1, to: 5, date: "2026-11-01", confidence: "weak" });
eq(e.nextDue, "2026-11-02", "create: weak due next day");
e = S.createEntry({ surah: 2, from: 6, to: 10, date: "2026-11-01", confidence: "strong" });
eq(e.nextDue, "2026-11-05", "create: strong due +4 days");
let threw = false;
try { S.createEntry({ surah: 1, from: 1, to: 99, date: "2026-11-01" }); } catch (x) { threw = true; }
ok(threw, "create: invalid range throws");

// ---------- review flow ----------
e = S.createEntry({ surah: 36, from: 1, to: 10, date: "2026-11-01", confidence: "weak" });
S.review(e, "good", "2026-11-02");
eq(e.stage, 1, "review: good climbs one rung");
eq(e.nextDue, "2026-11-04", "review: good reschedules +2");
eq(e.reps, 1, "review: reps counted");
S.review(e, "easy", "2026-11-04");
eq(e.stage, 3, "review: easy climbs two rungs");
eq(e.nextDue, "2026-11-11", "review: easy reschedules +7");
S.review(e, "again", "2026-11-11");
eq(e.stage, 0, "review: again resets to stage 0");
eq(e.lapses, 1, "review: lapse counted");
eq(e.nextDue, "2026-11-12", "review: again due tomorrow");
S.review(e, "hard", "2026-11-12");
eq(e.stage, 0, "review: hard keeps stage");
eq(e.nextDue, "2026-11-13", "review: hard shortens interval (round(1*0.6)=1)");
// climb to the cap
for (let i = 0; i < 20; i++) S.review(e, "easy", e.nextDue);
eq(e.stage, S.MAX_STAGE, "review: stage capped at max");
eq(e.nextDue, S.addDays(e.lastReview, 240), "review: max interval 240d");
threw = false;
try { S.review(e, "perfect", "2026-11-12"); } catch (x) { threw = true; }
ok(threw, "review: bad quality throws");

// ---------- due list ----------
const entries = [
  S.createEntry({ surah: 1, from: 1, to: 7, date: "2026-11-01", confidence: "weak", id: "a" }),
  S.createEntry({ surah: 2, from: 1, to: 5, date: "2026-11-01", confidence: "strong", id: "b" }),
  S.createEntry({ surah: 3, from: 1, to: 5, date: "2026-11-05", confidence: "weak", id: "c" })
];
let due = S.dueList(entries, "2026-11-02");
eq(due.length, 1, "due: only weak entry due");
eq(due[0].id, "a", "due: right entry");
due = S.dueList(entries, "2026-11-05");
eq(due.length, 2, "due: two due by the 5th");
eq(due[0].id, "a", "due: most overdue first");
eq(due[1].id, "b", "due: ordering");

// ---------- forecast / weekly load ----------
const fc = S.forecast(entries, "2026-11-01", 5);
eq(fc.length, 5, "forecast: length");
eq(fc[0].count, 0, "forecast: nothing due day 0");
eq(fc[1].count, 1, "forecast: one due day 1");
eq(fc[4].count, 2, "forecast: two due day 4 (cumulative)");
const wl = S.weeklyLoad(entries, "2026-11-01");
eq(wl.length, 7, "load: 7 days");
eq(wl[1].ayahs, 7, "load: 7 ayahs (Fatiha) on day 1");
eq(wl[4].ayahs, 12, "load: 7+5 ayahs by day 4");

// ---------- unique ayahs & coverage ----------
const ov = [
  S.createEntry({ surah: 2, from: 1, to: 10, date: "2026-11-01", id: "x1" }),
  S.createEntry({ surah: 2, from: 5, to: 20, date: "2026-11-01", id: "x2" }),
  S.createEntry({ surah: 2, from: 25, to: 30, date: "2026-11-01", id: "x3" }),
  S.createEntry({ surah: 3, from: 1, to: 7, date: "2026-11-01", id: "x4" })
];
eq(S.uniqueAyahs(ov), 33, "unique: overlapping ranges merged (20+6+7)");
eq(S.uniqueAyahs([]), 0, "unique: empty");
eq(S.surahCoverage(ov, 2), 26, "coverage: surah 2 = 20+6");
// adjacent ranges merge (1-5 and 6-10)
const adj = [
  S.createEntry({ surah: 1, from: 1, to: 3, date: "2026-11-01", id: "y1" }),
  S.createEntry({ surah: 1, from: 4, to: 7, date: "2026-11-01", id: "y2" })
];
eq(S.uniqueAyahs(adj), 7, "unique: adjacent ranges merge");

// ---------- global index ----------
eq(S.globalIndex(1, 1), 1, "gidx: first ayah");
eq(S.globalIndex(2, 1), 8, "gidx: Baqarah starts at 8");
eq(S.globalIndex(114, 6), 6236, "gidx: last ayah of the mushaf");

// ---------- juz progress ----------
const j1 = [S.createEntry({ surah: 1, from: 1, to: 7, date: "2026-11-01", id: "j1" })];
let jp = S.juzProgress(j1);
eq(jp.length, 30, "juz: 30 results");
eq(jp[0].covered, 7, "juz: 7 ayahs covered in juz 1");
eq(jp[0].size, 148, "juz: juz 1 size 148");
eq(jp[1].covered, 0, "juz: juz 2 empty");
// whole surah Al-Fatiha + Baqarah 1-141 completes juz 1
const j1full = j1.concat([S.createEntry({ surah: 2, from: 1, to: 141, date: "2026-11-01", id: "j2" })]);
jp = S.juzProgress(j1full);
eq(jp[0].covered, 148, "juz: full juz 1");
eq(jp[0].ratio, 1, "juz: ratio 1");
// total sizes must equal total ayahs
const sizeSum = S.juzProgress([]).reduce((s, j) => s + j.size, 0);
eq(sizeSum, 6236, "juz: sizes sum to 6236");
// last juz ends at 114:6
const lastJuz = [S.createEntry({ surah: 114, from: 1, to: 6, date: "2026-11-01", id: "j3" })];
jp = S.juzProgress(lastJuz);
eq(jp[29].covered, 6, "juz: An-Nas counted in juz 30");
// a range spanning a juz boundary is split correctly
const crossE = [S.createEntry({ surah: 2, from: 100, to: 286, date: "2026-11-01", id: "j4" })];
jp = S.juzProgress(crossE);
eq(jp[0].covered, 42, "juz: cross-boundary, juz 1 gets 2:100-141");
eq(jp[1].covered, 111, "juz: cross-boundary, juz 2 gets 2:142-252");
eq(jp[2].covered, 34, "juz: cross-boundary, juz 3 gets 2:253-286");

// ---------- streak ----------
eq(S.streak([], "2026-11-26"), 0, "streak: none");
eq(S.streak(["2026-11-26"], "2026-11-26"), 1, "streak: today counts");
eq(S.streak(["2026-11-24", "2026-11-25"], "2026-11-26"), 2, "streak: survives until today review");
eq(S.streak(["2026-11-24", "2026-11-25", "2026-11-26"], "2026-11-26"), 3, "streak: consecutive");
eq(S.streak(["2026-11-23", "2026-11-25"], "2026-11-26"), 1, "streak: old gap resets count");
eq(S.streak(["2026-11-23", "2026-11-24"], "2026-11-26"), 0, "streak: gap breaks");

// ---------- suggest next ----------
eq(JSON.stringify(S.suggestNext([], 5)), JSON.stringify({ surah: 1, from: 1, to: 5 }), "suggest: start at Fatiha");
const sg = [S.createEntry({ surah: 1, from: 1, to: 7, date: "2026-11-01", id: "s1" })];
eq(JSON.stringify(S.suggestNext(sg, 5)), JSON.stringify({ surah: 2, from: 1, to: 5 }), "suggest: rolls into Baqarah");
const sg2 = [S.createEntry({ surah: 2, from: 1, to: 280, date: "2026-11-01", id: "s2" })];
eq(JSON.stringify(S.suggestNext(sg2, 10)), JSON.stringify({ surah: 2, from: 281, to: 286 }), "suggest: clipped at surah end");
// khatm
const all = [];
DATA.surahs.forEach(s => all.push(S.createEntry({ surah: s.n, from: 1, to: s.ayahs, date: "2026-11-01", id: "k" + s.n })));
eq(S.suggestNext(all, 5), null, "suggest: null after khatm");
eq(S.uniqueAyahs(all), 6236, "unique: full mushaf");

console.log("\n" + passed + " passed, " + failed + " failed");
if (failed) { console.error("FAILURES:\n - " + failures.join("\n - ")); process.exit(1); }
