// Hifz - DOM click-through test with jsdom. Exercises the real UI:
// render, add a portion, review it, library, progress, settings, language.
// Run: node tests/dom.test.js   (requires devDependency jsdom)
"use strict";
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

let passed = 0, failed = 0;
function ok(cond, name) {
  if (cond) passed++;
  else { failed++; console.error("FAIL:", name); }
}

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8")
  .replace(/<link[^>]*fonts[^>]*>/g, ""); // no network in tests

const dom = new JSDOM(html, {
  url: "http://localhost/",
  runScripts: "outside-only",
  pretendToBeVisual: true
});
const { window } = dom;
const { document } = window;

// storage shim (jsdom has localStorage, but ensure clean slate)
window.localStorage.clear();
window.confirm = () => true;

// audio stub: records urls, lets the test end each ayah by hand
const played = [];
window.Audio = function () {
  this.pause = function () {}; this.removeAttribute = function () {};
  this.play = function () { played.push(this.src); return Promise.resolve(); };
};

// load app scripts concatenated, mirroring how classic <script> tags share
// one global lexical scope in the browser
const bundle = ["data.js", "scheduler.js", "app.js"]
  .map((f) => fs.readFileSync(path.join(__dirname, "..", f), "utf8"))
  .join("\n;\n");
window.eval(bundle);

const $ = (sel) => document.querySelector(sel);
const store = () => JSON.parse(window.localStorage.getItem("hifz.v1") || '{"entries":[],"reviewDays":[]}');
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
function click(el) { el.dispatchEvent(new window.MouseEvent("click", { bubbles: true })); }
function nav(hash) { window.location.hash = hash; window.dispatchEvent(new window.Event("hashchange")); }

// ---- today renders ----
ok($("header.top h1").textContent === "Hifz", "dom: header renders");
ok($$(".nav-btn").length === 5, "dom: 5 nav buttons");
ok($$(".stats-grid .stat").length === 4, "dom: 4 stat cards");
ok($("#view").textContent.includes("Nothing due"), "dom: empty due state on fresh store");
ok($("#suggestBtn") !== null, "dom: continue-memorizing suggestion present on empty store");

// ---- suggestion prefills the add form ----
click($("#suggestBtn"));
window.dispatchEvent(new window.Event("hashchange"));
ok(window.location.hash === "#/add", "dom: suggestion routes to add");
ok($("#surahInput").value.includes("1"), "dom: suggestion prefilled surah 1");
ok($("#fromInput").value === "1" && $("#toInput").value === "5", "dom: suggestion prefilled 1-5");

// ---- add form: pick surah via the searchable picker ----
const input = $("#surahInput");
input.value = "baqara";
input.dispatchEvent(new window.Event("focus", { bubbles: true }));
input.dispatchEvent(new window.Event("input", { bubbles: true }));
const opt = $(".surah-option");
ok(opt !== null, "dom: picker shows matches for 'baqara'");
opt.dispatchEvent(new window.MouseEvent("mousedown", { bubbles: true }));
ok($("#surahInput").value.includes("2"), "dom: picker selection fills input");
ok($("#toHint").textContent.includes("286"), "dom: picker shows ayah range hint");

// invalid: beyond surah length is rejected with an inline error
$("#fromInput").value = "1";
$("#toInput").value = "999";
$("#addForm").dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
ok($("#fTo").classList.contains("invalid"), "dom: over-range to rejected");
ok(store().entries.length === 0, "dom: invalid submit saves nothing");

// valid: backdate so it is immediately due
$("#toInput").value = "10";
$("#dateInput").value = "2026-11-01";
$("#addForm").dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
let stored = store();
ok(stored.entries.length === 1, "dom: valid submit saves one entry");
ok(stored.entries[0].surah === 2 && stored.entries[0].to === 10, "dom: saved range correct");
ok(window.location.hash === "#/" || window.location.hash === "", "dom: routes home after save");

// ---- today now shows a due card; review it ----
window.dispatchEvent(new window.Event("hashchange"));
const dueCard = $(".due-card");
ok(dueCard !== null, "dom: due card renders");
ok(dueCard.textContent.includes("Al-Baqara"), "dom: due card names the surah");
const before = store().entries[0].nextDue;
click(dueCard.querySelector('[data-q="good"]'));
stored = store();
ok(stored.entries[0].nextDue > before, "dom: good review pushes nextDue out");
ok(stored.entries[0].reps === 1, "dom: rep recorded");
ok(stored.reviewDays.length === 1, "dom: review day logged for streak");
ok($(".due-card") === null, "dom: reviewed card leaves the due list");

// ---- library ----
nav("#/library");
ok($$(".lib-item").length === 1, "dom: library lists the entry");
click($(".fchip[data-filter='due']"));
ok($$(".lib-item").length === 0, "dom: due filter hides reviewed entry");
click($(".fchip[data-filter='all']"));
ok($$(".lib-item").length === 1, "dom: all filter shows it again");

// ---- progress ----
nav("#/progress");
ok($$(".juz-cell").length === 30, "dom: 30 juz cells");
ok($(".ring-label .pct").textContent.includes("%"), "dom: mushaf ring percentage");
ok($$(".surah-row").length === 1, "dom: only covered surahs listed");
ok($(".surah-row .s-cnt").textContent === "10/286", "dom: surah coverage count");

// ---- settings: goal, language ----
nav("#/settings");
$("#goalInput").value = "8";
$("#goalInput").dispatchEvent(new window.Event("change", { bubbles: true }));
ok(store().settings.goal === 8, "dom: goal saved");
click($("#langSwap"));
ok(document.documentElement.dir === "rtl", "dom: Arabic switches to RTL");
ok(document.documentElement.lang === "ar", "dom: lang=ar");
ok($("header.top h1").textContent === "حِفْظ", "dom: Arabic app name");
ok($("#view").textContent.includes("الإعدادات"), "dom: settings in Arabic");

// ---- Arabic add flow end to end ----
nav("#/add");
const input2 = $("#surahInput");
input2.value = "يس";
input2.dispatchEvent(new window.Event("focus", { bubbles: true }));
input2.dispatchEvent(new window.Event("input", { bubbles: true }));
const opt2 = $(".surah-option");
ok(opt2 !== null, "dom: Arabic search finds Ya-Sin");
opt2.dispatchEvent(new window.MouseEvent("mousedown", { bubbles: true }));
$("#fromInput").value = "1";
$("#toInput").value = "5";
$("#addForm").dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
stored = store();
ok(stored.entries.length === 2, "dom: Arabic flow saves entry");
ok(stored.entries[1].surah === 36, "dom: Ya-Sin is surah 36");

// ---- back to English, today in Arabic dir was set; toggle back ----
click($("#langToggle"));
ok(document.documentElement.dir === "ltr", "dom: back to LTR");

// ---- listen: plays every ayah of the range in order from everyayah.com ----
nav("#/library");
const lbtn = $(".lib-item .listen-btn");
ok(lbtn !== null, "dom: library item has a Listen button");
click(lbtn);
ok(played[0] === "https://everyayah.com/data/Alafasy_128kbps/" + ("00" + stored.entries[0].surah).slice(-3) + ("00" + stored.entries[0].from).slice(-3) + ".mp3", "dom: first ayah url is correct");
ok($(".listen-status").textContent.includes("1"), "dom: listen status shows ayah progress");
ok(lbtn.classList.contains("playing"), "dom: button shows playing state");
click(lbtn);
ok(!lbtn.classList.contains("playing"), "dom: second tap stops");

// ---- surah picker tolerates common spellings ----
nav("#/add");
{
  const inp = $("#surahInput");
  ["yasin", "Ya-Sin", "baqarah", "kahf", "ikhlas", "rahman"].forEach((q, i) => {
    inp.value = q; inp.dispatchEvent(new window.Event("input", { bubbles: true }));
    const n = $$(".surah-option").map((o) => o.getAttribute("data-n"));
    const want = [36, 36, 2, 18, 112, 55][i];
    ok(n.includes(String(want)), "dom: picker finds surah " + want + " for '" + q + "'");
  });
}

// ---- reciter setting ----
nav("#/settings");
$("#reciterSel").value = "Husary_128kbps";
$("#reciterSel").dispatchEvent(new window.Event("change", { bubbles: true }));
ok(store().settings.reciter === "Husary_128kbps", "dom: reciter saved");

// ---- delete ----
nav("#/library");
nav("#/library");
click($(".lib-item .del-btn"));
stored = store();
ok(stored.entries.length === 1, "dom: delete removes the entry");

// ---- import: bad file rejected ----
nav("#/settings");
const fileInput = $("#importFile");
const badFile = new window.File(["{not hifz"], "bad.json", { type: "application/json" });
Object.defineProperty(fileInput, "files", { value: [badFile], configurable: true });
fileInput.dispatchEvent(new window.Event("change", { bubbles: true }));
setTimeout(() => {
  stored = store();
  ok(stored.entries.length === 1, "dom: bad import changes nothing");

  // ---- clear all ----
  click($("#clearBtn"));
  stored = store();
  ok(stored.entries.length === 0, "dom: clear wipes entries");

  console.log("\n" + passed + " passed, " + failed + " failed");
  process.exit(failed ? 1 : 0);
}, 300);
