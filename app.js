/* Hifz - app shell: state, i18n, routing, rendering. No Quran text is stored
   anywhere in this app - only surah names, ayah counts and the user's ranges. */
(function () {
  "use strict";
  var S = window.HifzScheduler;
  var DATA = typeof HIFZ_DATA !== "undefined" ? HIFZ_DATA : window.HIFZ_DATA;
  var STORE_KEY = "hifz.v1";

  /* ---------------- i18n ---------------- */
  var STR = {
    en: {
      app_name: "Hifz", tagline: "Memorize. Revise. Never forget.",
      nav_today: "Today", nav_add: "Add", nav_library: "Library", nav_progress: "Progress", nav_settings: "Settings",
      footer_line: "المراجعة أمّ الحفظ", footer_note: "Your data never leaves this browser.",
      greeting_morning: "Good morning", greeting_evening: "Good evening",
      stat_ayahs: "Ayahs memorized", stat_mushaf: "Of the mushaf", stat_streak: "Day streak", stat_due: "Due today",
      due_title: "Today's revision", due_none: "Nothing due right now",
      due_none_hint: "Add what you memorized, or enjoy the calm.",
      overdue_days: "overdue {n}d", due_now: "due today", stage_label: "stage {n}", ayahs_n: "{n} ayahs",
      q_again: "Forgot", q_again_hint: "start over", q_hard: "Hard", q_hard_hint: "shaky",
      q_good: "Good", q_good_hint: "solid", q_easy: "Easy", q_easy_hint: "fluent",
      reviewed_toast: "Scheduled - next revision in {n}d",
      suggest_title: "Continue memorizing", suggest_cta: "Add it",
      week_title: "Revision load, next 7 days", week_ayahs: "ayahs",
      add_title: "Log a memorization", add_sub: "What did you memorize?",
      f_surah: "Surah", f_surah_ph: "Search by name or number...",
      f_from: "From ayah", f_to: "To ayah", f_date: "Date memorized", f_conf: "How well do you know it?",
      conf_weak: "Fresh", conf_medium: "Fair", conf_strong: "Strong",
      f_note: "Note (optional)", f_note_ph: "e.g. needs work on the endings",
      add_submit: "Save memorization", add_saved: "Saved - first revision on {d}",
      err_surah: "Pick a surah first.", err_number: "Enter whole numbers.",
      err_from_low: "First ayah is 1.", err_to_high: "This surah has {n} ayahs.", err_order: "From must be <= to.",
      lib_title: "Your memorizations", lib_empty: "Nothing logged yet.",
      lib_empty_hint: "Tap Add to log your first portion.",
      f_all: "All", f_due: "Due", f_weak: "Struggling", f_mastered: "Mastered",
      lib_reps: "{r} reviews", lib_lapses: "{l} lapses", lib_next: "next {d}",
      confirm_delete: "Delete this portion?", deleted_toast: "Portion deleted",
      prog_title: "Mushaf progress", prog_sub: "Unique ayahs covered, overlaps counted once",
      juz_title: "Juz by juz", surah_title: "Surah coverage", act_title: "Reviews, last 12 weeks",
      mastered_label: "mastered (240d cycle)",
      set_title: "Settings", set_lang: "Language", set_lang_d: "Switch between English and Arabic (RTL)",
      set_goal: "Daily new-ayah target", set_goal_d: "Used for the continue-memorizing suggestion",
      set_export: "Export data", set_export_d: "Download everything as JSON",
      set_import: "Import data", set_import_d: "Restore from a previous export",
      set_clear: "Erase everything", set_clear_d: "Removes all portions and history from this browser",
      confirm_clear: "Erase ALL data? This cannot be undone.",
      imported_toast: "Data imported", import_bad: "That file is not a valid Hifz export",
      cleared_toast: "All data erased",
      about_d: "Hifz is a private, offline-first tracker. No account, no server, no Quran text - only your ranges and schedule.",
      listen: "Listen", stop: "Stop", listen_ayah: "Ayah {n} of {m}", audio_err: "Could not load the recitation. Check your connection.",
      set_reciter: "Reciter", set_reciter_d: "Used by the Listen buttons. Audio streams from everyayah.com, so it needs a connection.",
      days_short: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      months_short: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    },
    ar: {
      app_name: "حِفْظ", tagline: "احفظ. راجع. لا تنسَ أبدًا.",
      nav_today: "اليوم", nav_add: "إضافة", nav_library: "محفوظاتي", nav_progress: "التقدّم", nav_settings: "الإعدادات",
      footer_line: "المراجعة أمّ الحفظ", footer_note: "بياناتك لا تغادر هذا المتصفح أبدًا.",
      greeting_morning: "صباح الخير", greeting_evening: "مساء الخير",
      stat_ayahs: "آية محفوظة", stat_mushaf: "من المصحف", stat_streak: "أيام متتالية", stat_due: "مستحق اليوم",
      due_title: "مراجعة اليوم", due_none: "لا شيء مستحق الآن",
      due_none_hint: "أضِف ما حفظته، أو استمتع بالهدوء.",
      overdue_days: "متأخر {n} يوم", due_now: "مستحق اليوم", stage_label: "مرحلة {n}", ayahs_n: "{n} آية",
      q_again: "نسيت", q_again_hint: "من جديد", q_hard: "صعب", q_hard_hint: "متردد",
      q_good: "جيد", q_good_hint: "متماسك", q_easy: "سهل", q_easy_hint: "متقن",
      reviewed_toast: "تمت الجدولة - المراجعة القادمة بعد {n} يوم",
      suggest_title: "واصل الحفظ", suggest_cta: "أضِفها",
      week_title: "عبء المراجعة، ٧ أيام قادمة", week_ayahs: "آية",
      add_title: "سجّل حفظًا", add_sub: "ماذا حفظت؟",
      f_surah: "السورة", f_surah_ph: "ابحث بالاسم أو الرقم...",
      f_from: "من آية", f_to: "إلى آية", f_date: "تاريخ الحفظ", f_conf: "ما مدى إتقانك؟",
      conf_weak: "جديد", conf_medium: "وسط", conf_strong: "قوي",
      f_note: "ملاحظة (اختياري)", f_note_ph: "مثال: أواخر المقاطع تحتاج تثبيتًا",
      add_submit: "احفظ التسجيل", add_saved: "تم الحفظ - أول مراجعة {d}",
      err_surah: "اختر السورة أولًا.", err_number: "أدخل أرقامًا صحيحة.",
      err_from_low: "أول آية هي ١.", err_to_high: "هذه السورة فيها {n} آية.", err_order: "«من» يجب أن تكون ≤ «إلى».",
      lib_title: "محفوظاتك", lib_empty: "لم تسجّل شيئًا بعد.",
      lib_empty_hint: "اضغط «إضافة» لتسجيل أول مقطع.",
      f_all: "الكل", f_due: "مستحق", f_weak: "متعثر", f_mastered: "متقَن",
      lib_reps: "{r} مراجعة", lib_lapses: "{l} نسيان", lib_next: "التالية {d}",
      confirm_delete: "حذف هذا المقطع؟", deleted_toast: "تم حذف المقطع",
      prog_title: "تقدّم المصحف", prog_sub: "الآيات الفريدة المحفوظة، التداخل يُحسب مرة واحدة",
      juz_title: "جزءًا بجزء", surah_title: "تغطية السور", act_title: "المراجعات، آخر ١٢ أسبوعًا",
      mastered_label: "متقَن (دورة ٢٤٠ يومًا)",
      set_title: "الإعدادات", set_lang: "اللغة", set_lang_d: "التبديل بين العربية (RTL) والإنجليزية",
      set_goal: "هدف الآيات الجديدة يوميًا", set_goal_d: "يُستخدم في اقتراح «واصل الحفظ»",
      set_export: "تصدير البيانات", set_export_d: "نزّل كل شيء كملف JSON",
      set_import: "استيراد البيانات", set_import_d: "استعد من تصدير سابق",
      set_clear: "مسح كل شيء", set_clear_d: "يزيل كل المقاطع والسجل من هذا المتصفح",
      confirm_clear: "مسح كل البيانات؟ لا يمكن التراجع.",
      imported_toast: "تم الاستيراد", import_bad: "هذا الملف ليس تصديرًا صالحًا من حِفْظ",
      cleared_toast: "تم مسح كل البيانات",
      about_d: "حِفْظ متتبّع خاص يعمل دون اتصال. لا حساب ولا خادم ولا نص قرآني - فقط مقاطعك وجدولك.",
      listen: "استمع", stop: "إيقاف", listen_ayah: "الآية {n} من {m}", audio_err: "تعذّر تحميل التلاوة. تأكد من الاتصال بالإنترنت.",
      set_reciter: "القارئ", set_reciter_d: "تستخدمه أزرار الاستماع. الصوت يُبثّ من everyayah.com لذلك يحتاج اتصالًا بالإنترنت.",
      days_short: ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"],
      months_short: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
    }
  };

  var state = load();

  function load() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        var s = JSON.parse(raw);
        if (s && Array.isArray(s.entries)) {
          s.settings = s.settings || {};
          s.reviewDays = s.reviewDays || [];
          return s;
        }
      }
    } catch (e) { /* corrupted -> start clean */ }
    return { entries: [], reviewDays: [], settings: { lang: "en", goal: 5 } };
  }
  function save() { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }

  var RECITERS = [
    { id: "Alafasy_128kbps", en: "Mishary Alafasy", ar: "مشاري العفاسي" },
    { id: "Husary_128kbps", en: "Mahmoud Al-Husary", ar: "محمود خليل الحصري" },
    { id: "Minshawy_Murattal_128kbps", en: "Muhammad Al-Minshawi", ar: "محمد صديق المنشاوي" },
    { id: "Abdul_Basit_Murattal_192kbps", en: "Abdul Basit", ar: "عبد الباسط عبد الصمد" },
    { id: "Abdurrahmaan_As-Sudais_192kbps", en: "As-Sudais", ar: "عبد الرحمن السديس" },
    { id: "Saood_ash-Shuraym_128kbps", en: "Ash-Shuraim", ar: "سعود الشريم" }
  ];
  function pad3(n) { return ("00" + n).slice(-3); }
  function ayahUrl(reciter, surah, ayah) {
    return "https://everyayah.com/data/" + reciter + "/" + pad3(surah) + pad3(ayah) + ".mp3";
  }
  var player = { audio: null, id: null, cur: 0 };
  function stopPlayer() {
    if (player.audio) { player.audio.onended = null; player.audio.onerror = null; player.audio.pause(); player.audio.removeAttribute("src"); }
    player.id = null;
    document.querySelectorAll(".listen-btn.playing").forEach(function (b) {
      b.classList.remove("playing");
      b.querySelector("span").textContent = t("listen");
    });
    document.querySelectorAll(".listen-status").forEach(function (s) { s.textContent = ""; });
  }
  function togglePlay(id, btn) {
    var wasPlaying = player.id === id;
    stopPlayer();
    if (wasPlaying) return;
    var e = state.entries.find(function (x) { return x.id === id; });
    if (!e) return;
    var reciter = state.settings.reciter || RECITERS[0].id;
    if (!player.audio) player.audio = new Audio();
    var audio = player.audio, total = e.to - e.from + 1, ayah = e.from;
    var status = btn.parentNode.querySelector(".listen-status");
    player.id = id;
    btn.classList.add("playing");
    btn.querySelector("span").textContent = t("stop");
    function playAyah() {
      player.cur = ayah;
      if (status) status.textContent = t("listen_ayah", { n: ayah - e.from + 1, m: total });
      audio.src = ayahUrl(reciter, e.surah, ayah);
      var pr = audio.play();
      if (pr && pr.catch) pr.catch(function () { if (player.id === id) { stopPlayer(); toast(t("audio_err")); } });
    }
    audio.onended = function () {
      if (player.id !== id) return;
      if (ayah < e.to) { ayah++; playAyah(); } else stopPlayer();
    };
    audio.onerror = function () { if (player.id === id) { stopPlayer(); toast(t("audio_err")); } };
    playAyah();
  }
  function listenBtn(e) {
    return '<div class="listen-wrap"><button class="listen-btn" type="button" data-id="' + esc(e.id) + '">' +
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg><span>' + esc(t("listen")) + "</span></button>" +
      '<small class="listen-status" aria-live="polite"></small></div>';
  }

  function lang() { return state.settings.lang === "ar" ? "ar" : "en"; }
  function t(key, vars) {
    var s = (STR[lang()] && STR[lang()][key]) || STR.en[key] || key;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.replace("{" + k + "}", vars[k]); });
    return s;
  }

  function esc(x) {
    return String(x).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function applyDir() {
    var l = lang();
    document.documentElement.lang = l;
    document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
    document.title = l === "ar" ? "حِفْظ - متتبّع حفظ القرآن" : "Hifz - Quran Memorization Tracker";
    document.getElementById("langToggle").textContent = l === "ar" ? "English" : "العربية";
    document.querySelectorAll("[data-i18n]").forEach(function (el) { el.textContent = t(el.getAttribute("data-i18n")); });
  }

  function fmtDate(day) {
    var parts = day.split("-").map(Number);
    var d = new Date(parts[0], parts[1] - 1, parts[2]);
    return t("days_short")[d.getDay()] + " " + parts[2] + " " + t("months_short")[parts[1] - 1];
  }

  function surahLabel(n) {
    var s = S.surah(n);
    return lang() === "ar" ? s.ar : s.en;
  }

  function toast(msg) {
    var el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.classList.remove("show"); }, 2400);
  }

  /* ---------------- shared render bits ---------------- */
  function dueChips(e, today) {
    var chips = [];
    var late = S.diffDays(e.nextDue, today);
    if (late > 0) chips.push('<span class="chip overdue">' + esc(t("overdue_days", { n: late })) + "</span>");
    else chips.push('<span class="chip today-c">' + esc(t("due_now")) + "</span>");
    chips.push('<span class="chip stage-c">' + esc(t("stage_label", { n: e.stage + 1 })) + "</span>");
    chips.push('<span class="chip">' + esc(t("ayahs_n", { n: S.ayahCount(e) })) + "</span>");
    return chips.join("");
  }

  function stageMeter(stage) {
    var out = '<div class="stage-meter" aria-hidden="true">';
    for (var i = 0; i <= S.MAX_STAGE; i++) out += '<i class="' + (i <= stage ? "on" : "") + '"></i>';
    return out + "</div>";
  }

  function dueCardHTML(e, today) {
    var s = S.surah(e.surah);
    return '<article class="card due-card" data-id="' + esc(e.id) + '">' +
      '<div class="due-head">' +
      '<div class="surah-badge">' + e.surah + "</div>" +
      '<div class="due-info">' +
      '<div class="due-surah">' + esc(lang() === "ar" ? s.ar : s.en) + ' <span style="font-family:var(--font-ui);font-size:0.8rem;color:var(--ink-faint)">' + esc(lang() === "ar" ? s.en : s.ar) + "</span></div>" +
      '<div class="due-range">' + esc(t("f_from")) + " " + e.from + " · " + esc(t("f_to")) + " " + e.to + "</div>" +
      '<div class="due-meta">' + dueChips(e, today) + "</div>" +
      stageMeter(e.stage) +
      "</div></div>" +
      listenBtn(e) +
      '<div class="quality-row">' +
      '<button class="qbtn q-again" data-q="again" type="button">' + esc(t("q_again")) + "<small>" + esc(t("q_again_hint")) + "</small></button>" +
      '<button class="qbtn q-hard" data-q="hard" type="button">' + esc(t("q_hard")) + "<small>" + esc(t("q_hard_hint")) + "</small></button>" +
      '<button class="qbtn q-good" data-q="good" type="button">' + esc(t("q_good")) + "<small>" + esc(t("q_good_hint")) + "</small></button>" +
      '<button class="qbtn q-easy" data-q="easy" type="button">' + esc(t("q_easy")) + "<small>" + esc(t("q_easy_hint")) + "</small></button>" +
      "</div></article>";
  }

  function barChart(points, labelFn, valueFn) {
    var max = 1;
    points.forEach(function (p) { max = Math.max(max, valueFn(p)); });
    var hi = 0, hiV = -1;
    points.forEach(function (p, i) { if (valueFn(p) > hiV) { hiV = valueFn(p); hi = i; } });
    return '<div class="chart">' + points.map(function (p, i) {
      var v = valueFn(p);
      var h = Math.max(3, Math.round((v / max) * 100));
      return '<div class="col"><span class="cv">' + (v || "") + '</span>' +
        '<div class="bar-v' + (i === hi && v > 0 ? " hi" : "") + '" style="height:' + h + '%"></div>' +
        "<small>" + esc(labelFn(p)) + "</small></div>";
    }).join("") + "</div>";
  }

  /* ---------------- views ---------------- */
  function viewToday() {
    var today = S.today();
    var due = S.dueList(state.entries, today);
    var uniq = S.uniqueAyahs(state.entries);
    var pct = Math.round((uniq / S.TOTAL_AYAHS) * 1000) / 10;
    var st = S.streak(state.reviewDays, today);
    var hour = new Date().getHours();
    var load = S.weeklyLoad(state.entries, today);
    var sug = S.suggestNext(state.entries, state.settings.goal || 5);

    var html = '<h2 class="section">' + esc(hour < 12 ? t("greeting_morning") : t("greeting_evening")) + "</h2>" +
      '<div class="stats-grid">' +
      '<div class="stat"><div class="num">' + uniq + '</div><div class="lbl">' + esc(t("stat_ayahs")) + "</div></div>" +
      '<div class="stat"><div class="num">' + pct + '%</div><div class="lbl">' + esc(t("stat_mushaf")) + "</div></div>" +
      '<div class="stat accent"><div class="num">' + st + '</div><div class="lbl">' + esc(t("stat_streak")) + "</div></div>" +
      '<div class="stat"><div class="num">' + due.length + '</div><div class="lbl">' + esc(t("stat_due")) + "</div></div>" +
      "</div>";

    if (sug) {
      var s = S.surah(sug.surah);
      html += '<div class="card suggest">' +
        '<div class="txt"><div class="t">' + esc(t("suggest_title")) + '</div>' +
        '<div class="d"><span class="s-ar">' + esc(surahLabel(sug.surah)) + "</span> · " + sug.from + "–" + sug.to + "</div></div>" +
        '<button class="btn btn-primary" id="suggestBtn" type="button" data-surah="' + sug.surah + '" data-from="' + sug.from + '" data-to="' + sug.to + '">' + esc(t("suggest_cta")) + "</button>" +
        "</div>";
    }

    html += '<h2 class="section">' + esc(t("due_title")) + '</h2><div class="section-sub">' + esc(fmtDate(today)) + "</div>";
    if (!due.length) {
      html += '<div class="card empty"><span class="big">☾</span><p>' + esc(t("due_none")) + "<br>" + esc(t("due_none_hint")) + "</p></div>";
    } else {
      due.forEach(function (e) { html += dueCardHTML(e, today); });
    }

    html += '<h2 class="section">' + esc(t("week_title")) + "</h2>" +
      '<div class="card">' + barChart(load, function (p) {
        var d = new Date(p.day + "T00:00:00");
        return t("days_short")[d.getDay()];
      }, function (p) { return p.ayahs; }) + "</div>";

    return html;
  }

  function viewAdd() {
    var today = S.today();
    return '<h2 class="section">' + esc(t("add_title")) + '</h2><div class="section-sub">' + esc(t("add_sub")) + "</div>" +
      '<div class="card"><form id="addForm" novalidate>' +
      '<div class="field surah-picker" id="fSurah">' +
      "<label>" + esc(t("f_surah")) + "</label>" +
      '<input type="text" id="surahInput" placeholder="' + esc(t("f_surah_ph")) + '" autocomplete="off" role="combobox" aria-expanded="false">' +
      '<div class="surah-options" id="surahOptions"></div>' +
      '<div class="err" data-err="surah"></div>' +
      "</div>" +
      '<div class="range-row">' +
      '<div class="field" id="fFrom"><label>' + esc(t("f_from")) + '</label><input type="number" id="fromInput" min="1" step="1" inputmode="numeric"><div class="err" data-err="from"></div></div>' +
      '<div class="field" id="fTo"><label>' + esc(t("f_to")) + '</label><input type="number" id="toInput" min="1" step="1" inputmode="numeric"><div class="hint" id="toHint"></div><div class="err" data-err="to"></div></div>' +
      "</div>" +
      '<div class="field"><label>' + esc(t("f_date")) + '</label><input type="date" id="dateInput" value="' + today + '" max="' + today + '"></div>' +
      '<div class="field"><label>' + esc(t("f_conf")) + "</label>" +
      '<div class="segmented" id="confSeg">' +
      '<button type="button" class="seg" data-conf="weak">' + esc(t("conf_weak")) + "</button>" +
      '<button type="button" class="seg on" data-conf="medium">' + esc(t("conf_medium")) + "</button>" +
      '<button type="button" class="seg" data-conf="strong">' + esc(t("conf_strong")) + "</button>" +
      "</div></div>" +
      '<div class="field"><label>' + esc(t("f_note")) + '</label><input type="text" id="noteInput" placeholder="' + esc(t("f_note_ph")) + '" maxlength="120"></div>' +
      '<button class="btn btn-primary btn-block" type="submit">' + esc(t("add_submit")) + "</button>" +
      "</form></div>";
  }

  function libFilterMatch(e, filter, today) {
    if (filter === "due") return S.isDue(e, today);
    if (filter === "weak") return e.lapses > 0 && e.stage <= 2;
    if (filter === "mastered") return e.stage >= S.MAX_STAGE - 1;
    return true;
  }

  var libFilter = "all";

  function viewLibrary() {
    var today = S.today();
    var filters = ["all", "due", "weak", "mastered"];
    var html = '<h2 class="section">' + esc(t("lib_title")) + "</h2>" +
      '<div class="filter-chips">' + filters.map(function (f) {
        return '<button class="fchip' + (libFilter === f ? " on" : "") + '" data-filter="' + f + '" type="button">' + esc(t("f_" + f)) + "</button>";
      }).join("") + "</div>";

    var list = state.entries.slice().sort(function (a, b) {
      if (a.surah !== b.surah) return a.surah - b.surah;
      return a.from - b.from;
    }).filter(function (e) { return libFilterMatch(e, libFilter, today); });

    if (!list.length) {
      html += '<div class="card empty"><span class="big">۝</span><p>' + esc(t("lib_empty")) + "<br>" + esc(t("lib_empty_hint")) + "</p></div>";
      return '<div id="libWrap">' + html + "</div>";
    }
    html += '<div class="card">';
    list.forEach(function (e) {
      var dueCls = S.isDue(e, today) ? " overdue" : "";
      html += '<div class="lib-item" data-id="' + esc(e.id) + '">' +
        '<div class="surah-badge" style="width:38px;height:38px;font-size:0.8rem">' + e.surah + "</div>" +
        '<div class="info"><div class="t">' + esc(surahLabel(e.surah)) + ' <span style="font-family:var(--font-ui);font-size:0.75rem;color:var(--ink-faint)">' + e.from + "–" + e.to + "</span></div>" +
        '<div class="m">' + esc(t("lib_reps", { r: e.reps })) + " · " + esc(t("lib_lapses", { l: e.lapses })) + ' · <span class="chip' + dueCls + '" style="padding:1px 8px">' + esc(t("lib_next", { d: e.nextDue })) + "</span></div>" +
        stageMeter(e.stage) +
        listenBtn(e) +
        "</div>" +
        '<button class="icon-btn del-btn" type="button" aria-label="delete" data-id="' + esc(e.id) + '">✕</button>' +
        "</div>";
    });
    html += "</div>";
    return '<div id="libWrap">' + html + "</div>";
  }

  function viewProgress() {
    var uniq = S.uniqueAyahs(state.entries);
    var pct = (uniq / S.TOTAL_AYAHS);
    var R = 52, C = 2 * Math.PI * R;
    var mastered = state.entries.filter(function (e) { return e.stage >= S.MAX_STAGE - 1; }).length;
    var jp = S.juzProgress(state.entries);

    // weekly activity over last 12 weeks
    var today = S.today();
    var weeks = [];
    for (var w = 11; w >= 0; w--) {
      var start = S.addDays(today, -7 * (w + 1) + 1);
      var end = S.addDays(today, -7 * w);
      var c = 0;
      state.reviewDays.forEach(function (d) { if (d >= start && d <= end) c += 1; });
      weeks.push({ label: end.slice(5).replace("-", "/"), count: c });
    }

    var html = '<h2 class="section">' + esc(t("prog_title")) + '</h2><div class="section-sub">' + esc(t("prog_sub")) + "</div>" +
      '<div class="card ring-wrap">' +
      '<svg class="ring" width="120" height="120" viewBox="0 0 120 120">' +
      '<circle class="track" cx="60" cy="60" r="' + R + '" fill="none" stroke-width="10"/>' +
      '<circle class="fill" cx="60" cy="60" r="' + R + '" fill="none" stroke-width="10" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + (C * (1 - pct)).toFixed(1) + '"/>' +
      "</svg>" +
      '<div class="ring-label"><div class="pct">' + (Math.round(pct * 1000) / 10) + '%</div>' +
      '<div class="of">' + uniq + " / " + S.TOTAL_AYAHS + " · " + esc(t("stat_ayahs")) + "<br>" + mastered + " " + esc(t("mastered_label")) + "</div></div>" +
      "</div>";

    html += '<h2 class="section">' + esc(t("juz_title")) + "</h2>" +
      '<div class="card"><div class="juz-grid">' +
      jp.map(function (j) {
        var p = Math.round(j.ratio * 100);
        return '<div class="juz-cell" title="Juz ' + j.juz + ": " + j.covered + "/" + j.size + '">' +
          '<div class="fillbar" style="height:' + p + '%"></div>' +
          '<span class="jnum">' + j.juz + '</span><span class="jpct">' + p + "%</span></div>";
      }).join("") + "</div></div>";

    html += '<h2 class="section">' + esc(t("act_title")) + "</h2>" +
      '<div class="card">' + barChart(weeks, function (p) { return p.label; }, function (p) { return p.count; }) + "</div>";

    html += '<h2 class="section">' + esc(t("surah_title")) + "</h2>" + '<div class="card">';
    DATA.surahs.forEach(function (s) {
      var cov = S.surahCoverage(state.entries, s.n);
      if (!cov) return;
      var p = Math.round((cov / s.ayahs) * 100);
      html += '<div class="surah-row">' +
        '<span class="s-n">' + s.n + "</span>" +
        '<span class="s-name"><span class="ar">' + esc(lang() === "ar" ? s.ar : s.en) + '</span><span class="en">' + esc(lang() === "ar" ? s.en : s.ar) + "</span></span>" +
        '<span class="bar"><i style="width:' + p + '%"></i></span>' +
        '<span class="s-cnt">' + cov + "/" + s.ayahs + "</span></div>";
    });
    if (!state.entries.length) html += '<div class="empty"><p>' + esc(t("lib_empty")) + "</p></div>";
    html += "</div>";
    return html;
  }

  function viewSettings() {
    var goal = state.settings.goal || 5;
    return '<h2 class="section">' + esc(t("set_title")) + "</h2>" +
      '<div class="card">' +
      '<div class="set-row"><div><div class="t">' + esc(t("set_lang")) + '</div><div class="d">' + esc(t("set_lang_d")) + '</div></div>' +
      '<button class="btn btn-ghost" id="langSwap" type="button">' + (lang() === "ar" ? "English" : "العربية") + "</button></div>" +
      '<div class="set-row"><div><div class="t">' + esc(t("set_goal")) + '</div><div class="d">' + esc(t("set_goal_d")) + '</div></div>' +
      '<input type="number" id="goalInput" min="1" max="50" value="' + goal + '" style="width:76px;background:rgba(7,18,14,.6);border:1px solid var(--card-line);border-radius:10px;color:var(--ink);padding:8px 10px;font-family:var(--font-ui)">' +
      "</div>" +
      '<div class="set-row"><div><div class="t">' + esc(t("set_reciter")) + '</div><div class="d">' + esc(t("set_reciter_d")) + '</div></div>' +
      '<select id="reciterSel" aria-label="' + esc(t("set_reciter")) + '">' + RECITERS.map(function (r) {
        return '<option value="' + r.id + '"' + ((state.settings.reciter || RECITERS[0].id) === r.id ? " selected" : "") + ">" + esc(lang() === "ar" ? r.ar : r.en) + "</option>";
      }).join("") + "</select></div>" +
      '<div class="set-row"><div><div class="t">' + esc(t("set_export")) + '</div><div class="d">' + esc(t("set_export_d")) + '</div></div>' +
      '<button class="btn btn-ghost" id="exportBtn" type="button">JSON</button></div>' +
      '<div class="set-row"><div><div class="t">' + esc(t("set_import")) + '</div><div class="d">' + esc(t("set_import_d")) + '</div></div>' +
      '<button class="btn btn-ghost" id="importBtn" type="button">JSON</button>' +
      '<input type="file" id="importFile" accept="application/json" hidden></div>' +
      '<div class="set-row"><div><div class="t">' + esc(t("set_clear")) + '</div><div class="d">' + esc(t("set_clear_d")) + '</div></div>' +
      '<button class="btn btn-danger" id="clearBtn" type="button">✕</button></div>' +
      "</div>" +
      '<div class="card"><div class="d" style="font-size:0.78rem;color:var(--ink-dim)">' + esc(t("about_d")) + "</div></div>";
  }

  /* ---------------- actions ---------------- */
  function doReview(id, quality) {
    var e = state.entries.find(function (x) { return x.id === id; });
    if (!e) return;
    var today = S.today();
    S.review(e, quality, today);
    if (state.reviewDays.indexOf(today) === -1) state.reviewDays.push(today);
    save();
    toast(t("reviewed_toast", { n: S.diffDays(today, e.nextDue) }));
    render();
  }

  function doDelete(id) {
    var e = state.entries.find(function (x) { return x.id === id; });
    if (!e) return;
    if (!window.confirm(t("confirm_delete"))) return;
    state.entries = state.entries.filter(function (x) { return x.id !== id; });
    save();
    toast(t("deleted_toast"));
    render();
  }

  function addPortion(opts) {
    var e = S.createEntry(opts);
    state.entries.push(e);
    save();
    return e;
  }

  /* ---------------- add-form wiring ---------------- */
  var pickedSurah = null;

  function wireAddForm() {
    pickedSurah = null;
    var input = document.getElementById("surahInput");
    var opts = document.getElementById("surahOptions");
    var fromI = document.getElementById("fromInput");
    var toI = document.getElementById("toInput");
    var toHint = document.getElementById("toHint");
    var conf = "medium";

    function norm(s) {
      return String(s).toLowerCase()
        .replace(/[ً-ْٰـأإآٱ]/g, function (c) { return c === "ـ" ? "" : "ا"; })
        .replace(/[\s\-_'’`.]+/g, "")
        .replace(/ee|ii/g, "i").replace(/aa/g, "a").replace(/oo|ou|uu/g, "u").replace(/h/g, "")
        .trim();
    }

    function renderOptions(q) {
      var nq = norm(q);
      var matches = DATA.surahs.filter(function (s) {
        if (!nq) return true;
        return String(s.n) === nq || norm(s.en).indexOf(nq) !== -1 || norm(s.ar).indexOf(nq) !== -1 || norm(s.enTr).indexOf(nq) !== -1;
      }).slice(0, 12);
      opts.innerHTML = matches.map(function (s) {
        return '<div class="surah-option" data-n="' + s.n + '">' +
          '<span class="o-n">' + s.n + '</span><span class="o-ar">' + esc(s.ar) + '</span><span class="o-en">' + esc(s.en) + " · " + s.ayahs + "</span></div>";
      }).join("");
      opts.classList.toggle("open", matches.length > 0);
      input.setAttribute("aria-expanded", matches.length ? "true" : "false");
    }

    function pick(n) {
      pickedSurah = S.surah(n);
      input.value = pickedSurah.n + " · " + (lang() === "ar" ? pickedSurah.ar : pickedSurah.en);
      opts.classList.remove("open");
      toHint.textContent = "1 – " + pickedSurah.ayahs;
      toI.max = pickedSurah.ayahs;
      fromI.max = pickedSurah.ayahs;
      if (!fromI.value) fromI.value = 1;
      clearErr("surah");
    }

    input.addEventListener("focus", function () { renderOptions(input.value); });
    input.addEventListener("input", function () { pickedSurah = null; renderOptions(input.value); });
    opts.addEventListener("mousedown", function (ev) {
      var o = ev.target.closest(".surah-option");
      if (o) pick(Number(o.getAttribute("data-n")));
    });
    input.addEventListener("blur", function () { setTimeout(function () { opts.classList.remove("open"); }, 150); });

    document.getElementById("confSeg").addEventListener("click", function (ev) {
      var b = ev.target.closest(".seg");
      if (!b) return;
      conf = b.getAttribute("data-conf");
      document.querySelectorAll("#confSeg .seg").forEach(function (x) { x.classList.toggle("on", x === b); });
    });

    function showErr(which, msg) {
      var map = { surah: "fSurah", from: "fFrom", to: "fTo" };
      var wrap = document.getElementById(map[which]);
      if (!wrap) return;
      wrap.classList.add("invalid");
      var e = wrap.querySelector('[data-err="' + which + '"]');
      if (e) e.textContent = msg;
    }
    function clearErr(which) {
      var map = { surah: "fSurah", from: "fFrom", to: "fTo" };
      var wrap = document.getElementById(map[which]);
      if (wrap) wrap.classList.remove("invalid");
    }

    document.getElementById("addForm").addEventListener("submit", function (ev) {
      ev.preventDefault();
      ["surah", "from", "to"].forEach(clearErr);
      if (!pickedSurah) { showErr("surah", t("err_surah")); return; }
      var from = Number(fromI.value), to = Number(toI.value);
      var err = S.validateRange(pickedSurah.n, from, to);
      if (err) {
        var which = err === "err_to_high" || err === "err_order" ? "to" : "from";
        if (err === "err_number") which = "from";
        showErr(which, t(err, { n: pickedSurah.ayahs }));
        return;
      }
      var e = addPortion({
        surah: pickedSurah.n, from: from, to: to,
        date: document.getElementById("dateInput").value || today,
        confidence: conf,
        note: document.getElementById("noteInput").value.trim()
      });
      toast(t("add_saved", { d: fmtDate(e.nextDue) }));
      location.hash = "#/";
    });

    // prefill from suggestion button (stored via sessionStorage)
    var pre = sessionStorage.getItem("hifz.prefill");
    if (pre) {
      sessionStorage.removeItem("hifz.prefill");
      try {
        var p = JSON.parse(pre);
        pick(p.surah);
        fromI.value = p.from;
        toI.value = p.to;
      } catch (x) { /* ignore */ }
    }
  }

  /* ---------------- settings wiring ---------------- */
  function wireSettings() {
    document.getElementById("langSwap").addEventListener("click", swapLang);
    document.getElementById("reciterSel").addEventListener("change", function (ev) {
      state.settings.reciter = ev.target.value;
      save();
    });
    document.getElementById("goalInput").addEventListener("change", function (ev) {
      var v = Math.max(1, Math.min(50, Number(ev.target.value) || 5));
      state.settings.goal = v;
      ev.target.value = v;
      save();
    });
    document.getElementById("exportBtn").addEventListener("click", function () {
      var blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "hifz-export-" + S.today() + ".json";
      a.click();
      URL.revokeObjectURL(a.href);
    });
    document.getElementById("importBtn").addEventListener("click", function () {
      document.getElementById("importFile").click();
    });
    document.getElementById("importFile").addEventListener("change", function (ev) {
      var f = ev.target.files[0];
      if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        try {
          var s = JSON.parse(r.result);
          if (!s || !Array.isArray(s.entries)) throw new Error("bad");
          s.entries.forEach(function (e) {
            var err = S.validateRange(e.surah, e.from, e.to);
            if (err) throw new Error(err);
          });
          state = { entries: s.entries, reviewDays: s.reviewDays || [], settings: s.settings || state.settings };
          save();
          toast(t("imported_toast"));
          render();
        } catch (x) {
          toast(t("import_bad"));
        }
      };
      r.readAsText(f);
    });
    document.getElementById("clearBtn").addEventListener("click", function () {
      if (!window.confirm(t("confirm_clear"))) return;
      state = { entries: [], reviewDays: [], settings: state.settings };
      save();
      toast(t("cleared_toast"));
      render();
    });
  }

  function swapLang() {
    state.settings.lang = lang() === "ar" ? "en" : "ar";
    save();
    applyDir();
    render();
  }

  /* ---------------- router ---------------- */
  function route() {
    var h = location.hash || "#/";
    if (h.indexOf("#/add") === 0) return "add";
    if (h.indexOf("#/library") === 0) return "library";
    if (h.indexOf("#/progress") === 0) return "progress";
    if (h.indexOf("#/settings") === 0) return "settings";
    return "today";
  }

  function render() {
    stopPlayer();
    var r = route();
    var view = document.getElementById("view");
    document.querySelectorAll(".nav-btn").forEach(function (b) {
      b.classList.toggle("on", b.getAttribute("data-route") === (r === "today" ? "#/" : "#/" + r));
    });
    if (r === "add") { view.innerHTML = viewAdd(); wireAddForm(); }
    else if (r === "library") view.innerHTML = viewLibrary();
    else if (r === "progress") view.innerHTML = viewProgress();
    else if (r === "settings") { view.innerHTML = viewSettings(); wireSettings(); }
    else view.innerHTML = viewToday();
  }

  /* ---------------- global events ---------------- */
  document.getElementById("langToggle").addEventListener("click", swapLang);

  document.querySelectorAll(".nav-btn").forEach(function (b) {
    b.addEventListener("click", function () { location.hash = b.getAttribute("data-route"); });
  });

  document.getElementById("view").addEventListener("click", function (ev) {
    var lb = ev.target.closest(".listen-btn");
    if (lb) { togglePlay(lb.getAttribute("data-id"), lb); return; }
    var q = ev.target.closest(".qbtn");
    if (q) {
      var card = q.closest(".due-card");
      if (card) doReview(card.getAttribute("data-id"), q.getAttribute("data-q"));
      return;
    }
    var del = ev.target.closest(".del-btn");
    if (del) { doDelete(del.getAttribute("data-id")); return; }
    var fc = ev.target.closest(".fchip");
    if (fc) { libFilter = fc.getAttribute("data-filter"); render(); return; }
    var sug = ev.target.closest("#suggestBtn");
    if (sug) {
      sessionStorage.setItem("hifz.prefill", JSON.stringify({
        surah: Number(sug.getAttribute("data-surah")),
        from: Number(sug.getAttribute("data-from")),
        to: Number(sug.getAttribute("data-to"))
      }));
      location.hash = "#/add";
    }
  });

  window.addEventListener("hashchange", render);

  applyDir();
  render();
})();
