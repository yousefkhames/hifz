// Hifz - spaced-revision scheduler. Pure logic, no DOM, no storage.
// Shared between the browser app (window.HifzScheduler) and the node tests.
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = factory(require("./data.js"));
  } else {
    root.HifzScheduler = factory(root.HIFZ_DATA);
  }
})(typeof self !== "undefined" ? self : this, function (DATA) {
  "use strict";

  // Revision interval ladder in days. A portion climbs one rung per
  // successful review; beyond the top rung it stays on a long cycle.
  var INTERVALS = [1, 2, 4, 7, 15, 30, 60, 120, 240];
  var MAX_STAGE = INTERVALS.length - 1;
  var QUALITIES = ["again", "hard", "good", "easy"];

  function pad2(n) { return (n < 10 ? "0" : "") + n; }

  // Canonical local date string YYYY-MM-DD. Accepts Date or string.
  function dayStr(d) {
    if (typeof d === "string") return d.slice(0, 10);
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
  }

  function addDays(day, n) {
    var parts = day.split("-").map(Number);
    var d = new Date(parts[0], parts[1] - 1, parts[2] + n);
    return dayStr(d);
  }

  function diffDays(a, b) { // whole days from a to b (b - a)
    var pa = a.split("-").map(Number), pb = b.split("-").map(Number);
    return Math.round((Date.UTC(pb[0], pb[1] - 1, pb[2]) - Date.UTC(pa[0], pa[1] - 1, pa[2])) / 86400000);
  }

  function today() { return dayStr(new Date()); }

  var surahByN = {};
  DATA.surahs.forEach(function (s) { surahByN[s.n] = s; });

  function surah(n) { return surahByN[n] || null; }

  // Validate a memorization range. Returns null when valid, else an error key.
  function validateRange(surahN, from, to) {
    var s = surahByN[surahN];
    if (!s) return "err_surah";
    if (!Number.isInteger(from) || !Number.isInteger(to)) return "err_number";
    if (from < 1) return "err_from_low";
    if (to > s.ayahs) return "err_to_high";
    if (from > to) return "err_order";
    return null;
  }

  var uidCounter = 0;
  function uid() {
    uidCounter += 1;
    return "p" + Date.now().toString(36) + uidCounter.toString(36) + Math.floor(Math.random() * 1e6).toString(36);
  }

  // Create a memorized portion. confidence: "weak" | "medium" | "strong".
  // A freshly memorized portion is due the next day (weak) or later (strong).
  function createEntry(opts) {
    var err = validateRange(opts.surah, opts.from, opts.to);
    if (err) throw new Error(err);
    var conf = opts.confidence || "medium";
    var stage = conf === "weak" ? 0 : conf === "strong" ? 2 : 1;
    var added = dayStr(opts.date || new Date());
    return {
      id: opts.id || uid(),
      surah: opts.surah,
      from: opts.from,
      to: opts.to,
      added: added,
      stage: stage,
      reps: 0,
      lapses: 0,
      lastReview: null,
      nextDue: addDays(added, INTERVALS[stage]),
      note: opts.note || ""
    };
  }

  // Record a review. quality in QUALITIES. Returns the mutated entry.
  function review(entry, quality, day) {
    if (QUALITIES.indexOf(quality) === -1) throw new Error("err_quality");
    var d = dayStr(day || new Date());
    entry.reps += 1;
    entry.lastReview = d;
    if (quality === "again") {
      entry.lapses += 1;
      entry.stage = 0;
    } else if (quality === "hard") {
      // stay on the rung, but shorten the wait a little
      entry.nextDue = addDays(d, Math.max(1, Math.round(INTERVALS[entry.stage] * 0.6)));
      return entry;
    } else if (quality === "easy") {
      entry.stage = Math.min(MAX_STAGE, entry.stage + 2);
    } else { // good
      entry.stage = Math.min(MAX_STAGE, entry.stage + 1);
    }
    entry.nextDue = addDays(d, INTERVALS[entry.stage]);
    return entry;
  }

  function ayahCount(e) { return e.to - e.from + 1; }

  function isDue(e, day) { return e.nextDue <= dayStr(day); }

  // Entries due on or before `day`, most overdue first, then by surah order.
  function dueList(entries, day) {
    var d = dayStr(day);
    return entries.filter(function (e) { return isDue(e, d); }).sort(function (a, b) {
      if (a.nextDue !== b.nextDue) return a.nextDue < b.nextDue ? -1 : 1;
      if (a.surah !== b.surah) return a.surah - b.surah;
      return a.from - b.from;
    });
  }

  // Forecast: map of dayStr -> count for the next `days` days (including today).
  function forecast(entries, day, days) {
    var d0 = dayStr(day);
    var out = [];
    for (var i = 0; i < days; i++) {
      var d = addDays(d0, i);
      var c = 0;
      entries.forEach(function (e) { if (e.nextDue <= d) c += 1; });
      out.push({ day: d, count: c });
    }
    return out;
  }

  // Merge overlapping/adjacent ranges per surah -> unique ayah count.
  function uniqueAyahs(entries) {
    var bySurah = {};
    entries.forEach(function (e) {
      (bySurah[e.surah] = bySurah[e.surah] || []).push([e.from, e.to]);
    });
    var total = 0;
    Object.keys(bySurah).forEach(function (k) {
      var ranges = bySurah[k].sort(function (a, b) { return a[0] - b[0]; });
      var cur = null;
      ranges.forEach(function (r) {
        if (!cur || r[0] > cur[1] + 1) {
          if (cur) total += cur[1] - cur[0] + 1;
          cur = r.slice();
        } else if (r[1] > cur[1]) {
          cur[1] = r[1];
        }
      });
      if (cur) total += cur[1] - cur[0] + 1;
    });
    return total;
  }

  var TOTAL_AYAHS = DATA.surahs.reduce(function (s, x) { return s + x.ayahs; }, 0);

  // Coverage per surah: merged unique ayahs memorized in that surah.
  function surahCoverage(entries, surahN) {
    var sub = entries.filter(function (e) { return e.surah === surahN; });
    return uniqueAyahs(sub);
  }

  // Absolute index of an ayah in the whole mushaf (1-based).
  function globalIndex(surahN, ayah) {
    var idx = 0;
    for (var i = 1; i < surahN; i++) idx += surahByN[i].ayahs;
    return idx + ayah;
  }

  // Juz progress: fraction 0..1 of each juz's ayahs covered by entries.
  function juzProgress(entries) {
    var covered = {}; // global index set would be huge; merge per surah instead
    var bySurah = {};
    entries.forEach(function (e) {
      (bySurah[e.surah] = bySurah[e.surah] || []).push([e.from, e.to]);
    });
    var merged = {};
    Object.keys(bySurah).forEach(function (k) {
      var ranges = bySurah[k].sort(function (a, b) { return a[0] - b[0]; });
      var out = [];
      ranges.forEach(function (r) {
        var last = out[out.length - 1];
        if (last && r[0] <= last[1] + 1) last[1] = Math.max(last[1], r[1]);
        else out.push(r.slice());
      });
      merged[k] = out;
    });
    function coveredIn(surahN, from, to) {
      var list = merged[surahN] || [];
      var c = 0;
      list.forEach(function (r) {
        var lo = Math.max(r[0], from), hi = Math.min(r[1], to);
        if (hi >= lo) c += hi - lo + 1;
      });
      return c;
    }
    var result = [];
    for (var j = 0; j < 30; j++) {
      var start = DATA.juzBounds[j];
      var end = j < 29
        ? (function () { var nb = DATA.juzBounds[j + 1]; return nb[1] === 1 ? [nb[0] - 1, surahByN[nb[0] - 1].ayahs] : [nb[0], nb[1] - 1]; })()
        : [114, 6];
      var size = globalIndex(end[0], end[1]) - globalIndex(start[0], start[1]) + 1;
      var cov = 0;
      for (var s = start[0]; s <= end[0]; s++) {
        var lo = s === start[0] ? start[1] : 1;
        var hi = s === end[0] ? end[1] : surahByN[s].ayahs;
        cov += coveredIn(s, lo, hi);
      }
      result.push({ juz: j + 1, covered: cov, size: size, ratio: size ? cov / size : 0 });
    }
    return result;
  }

  // Current review streak in days, from a set of review-day strings.
  // A streak survives when today has no reviews yet but yesterday does.
  function streak(reviewDays, day) {
    var set = {};
    reviewDays.forEach(function (d) { set[d] = true; });
    var d = dayStr(day);
    var n = 0;
    if (!set[d]) { // today not done yet; start counting from yesterday
      d = addDays(d, -1);
      if (!set[d]) return 0;
    }
    while (set[d]) { n += 1; d = addDays(d, -1); }
    return n;
  }

  // Suggest the next portion to memorize: continue right after the furthest
  // memorized position in the mushaf. size = target portion length in ayahs.
  function suggestNext(entries, size) {
    size = size || 5;
    var maxG = 0;
    entries.forEach(function (e) {
      var g = globalIndex(e.surah, e.to);
      if (g > maxG) maxG = g;
    });
    var surahN = 1, ayah = 1;
    if (maxG > 0) {
      var acc = 0;
      for (var i = 1; i <= 114; i++) {
        var c = surahByN[i].ayahs;
        if (maxG <= acc + c) {
          if (maxG === acc + c) { surahN = i + 1; ayah = 1; }
          else { surahN = i; ayah = maxG - acc + 1; }
          break;
        }
        acc += c;
      }
      if (surahN > 114) return null; // khatm - everything memorized
    }
    var s = surahByN[surahN];
    var to = Math.min(s.ayahs, ayah + size - 1);
    return { surah: surahN, from: ayah, to: to };
  }

  // Burden estimate: ayahs due per day over the coming week.
  function weeklyLoad(entries, day) {
    var d0 = dayStr(day), out = [];
    for (var i = 0; i < 7; i++) {
      var d = addDays(d0, i), n = 0;
      entries.forEach(function (e) { if (e.nextDue <= d) n += ayahCount(e); });
      out.push({ day: d, ayahs: n });
    }
    return out;
  }

  return {
    INTERVALS: INTERVALS,
    MAX_STAGE: MAX_STAGE,
    QUALITIES: QUALITIES,
    TOTAL_AYAHS: TOTAL_AYAHS,
    dayStr: dayStr,
    addDays: addDays,
    diffDays: diffDays,
    today: today,
    surah: surah,
    validateRange: validateRange,
    createEntry: createEntry,
    review: review,
    ayahCount: ayahCount,
    isDue: isDue,
    dueList: dueList,
    forecast: forecast,
    uniqueAyahs: uniqueAyahs,
    surahCoverage: surahCoverage,
    globalIndex: globalIndex,
    juzProgress: juzProgress,
    streak: streak,
    suggestNext: suggestNext,
    weeklyLoad: weeklyLoad
  };
});
