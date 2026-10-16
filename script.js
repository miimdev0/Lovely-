/* ═══════════════════════════════════════════════════════════
   برای بیتا ❤ — از محمدرضا
   مدیریت صحنه‌ها، ذرات، قلب زنده، آلبوم، موسیقی و اکولایزر
   ═══════════════════════════════════════════════════════════ */
(() => {
"use strict";

/* ─────────────── ابزارهای پایه ─────────────── */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
const FINE = matchMedia("(pointer: fine)").matches;
const FA = "۰۱۲۳۴۵۶۷۸۹";
const faNum = n => String(n).replace(/\d/g, d => FA[d]);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const DPR = Math.min(2, window.devicePixelRatio || 1);

let timers = [];
const later = (fn, ms) => { const id = setTimeout(() => { timers = timers.filter(t => t !== id); fn(); }, ms); timers.push(id); return id; };
const clearAllTimers = () => { timers.forEach(clearTimeout); timers = []; };
const sleep = ms => new Promise(r => later(r, ms));

function canvas2d(cv) {
  const ctx = cv.getContext("2d");
  return ctx;
}
function fitCanvas(cv) {
  const r = cv.getBoundingClientRect();
  cv.width  = Math.max(2, Math.round(r.width  * DPR));
  cv.height = Math.max(2, Math.round(r.height * DPR));
  const ctx = cv.getContext("2d");
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  return { w: r.width, h: r.height, ctx };
}

/* اسپرایت‌های نور از پیش‌رندر شده */
function glowSprite(color) {
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const x = c.getContext("2d");
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, color + "ff"); g.addColorStop(0.28, color + "aa");
  g.addColorStop(0.65, color + "2e"); g.addColorStop(1, color + "00");
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  return c;
}
function heartSprite(color) {
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const x = c.getContext("2d");
  x.translate(32, 34); x.scale(0.34, 0.34);
  x.shadowColor = color; x.shadowBlur = 18; x.fillStyle = color;
  x.beginPath();
  x.moveTo(0, 52);
  x.bezierCurveTo(-52, 10, -38, -42, 0, -14);
  x.bezierCurveTo(38, -42, 52, 10, 0, 52);
  x.fill(); x.fill();
  return c;
}
const SPR = {
  red:    glowSprite("#e0263f"),
  pink:   glowSprite("#ff7ba6"),
  soft:   glowSprite("#ffb3cc"),
  violet: glowSprite("#a05aff"),
  gold:   glowSprite("#e9c07a"),
  heartP: heartSprite("#ff6b9a"),
  heartR: heartSprite("#e0263f")
};
const SPR_LIST = [SPR.red, SPR.pink, SPR.soft, SPR.violet];

/* ─────────────── ذرات پس‌زمینه ─────────────── */
const bgCv = $("#bg-canvas");
let bg = { w: 0, h: 0, ctx: null, parts: [], boost: 0, px: -999, py: -999, running: false };

function bgInit() {
  const { w, h, ctx } = fitCanvas(bgCv);
  bg.w = w; bg.h = h; bg.ctx = ctx;
  const n = RM ? 0 : clamp(Math.round((w * h) / 22000), 34, 110);
  bg.parts = Array.from({ length: n }, () => ({
    x: Math.random() * w, y: Math.random() * h,
    r: 2.5 + Math.random() * 6,
    vy: -(0.06 + Math.random() * 0.22), vx: (Math.random() - .5) * 0.1,
    tw: 0.4 + Math.random() * 1.2, ph: Math.random() * Math.PI * 2,
    spr: SPR_LIST[(Math.random() * SPR_LIST.length) | 0],
    a: 0.25 + Math.random() * 0.5
  }));
}
function bgFrame(t) {
  if (!bg.running) return;
  const { ctx, w, h } = bg;
  ctx.clearRect(0, 0, w, h);
  const boost = 1 + bg.boost;
  bg.boost *= 0.96;
  for (const p of bg.parts) {
    p.y += p.vy * boost; p.x += p.vx * boost + Math.sin(t / 1900 + p.ph) * 0.12;
    const dx = p.x - bg.px, dy = p.y - bg.py, d2 = dx * dx + dy * dy;
    if (d2 < 110 * 110) { const d = Math.sqrt(d2) || 1; p.x += (dx / d) * 1.7; p.y += (dy / d) * 1.7; }
    if (p.y < -20) { p.y = h + 18; p.x = Math.random() * w; }
    if (p.x < -20) p.x = w + 18; else if (p.x > w + 20) p.x = -18;
    const tw = 0.55 + 0.45 * Math.sin(t / 700 * p.tw + p.ph);
    ctx.globalAlpha = p.a * tw;
    ctx.drawImage(p.spr, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(bgFrame);
}
function bgStart() { if (!bg.running && !RM) { bg.running = true; requestAnimationFrame(bgFrame); } }
function bgBurstVeilMult() { bg.boost = 5.5; later(() => bg.boost = 0, 900); }

addEventListener("pointermove", e => { bg.px = e.clientX; bg.py = e.clientY; }, { passive: true });
addEventListener("pointerdown", e => {
  bg.px = e.clientX; bg.py = e.clientY;
  if (!RM) fxSparkle(e.clientX, e.clientY, 4);
}, { passive: true });

/* ─────────────── بوم افکت‌ها (قلب/موج/جرقه) ─────────────── */
const fxCv = $("#fx-canvas");
let fx = { w: 0, h: 0, ctx: null, items: [], running: false };
function fxInit() { const f = fitCanvas(fxCv); fx.w = f.w; fx.h = f.h; fx.ctx = f.ctx; }
function fxEnsure() { if (!fx.running && !RM) { fx.running = true; requestAnimationFrame(fxFrame); } }
function fxFrame() {
  if (!fx.items.length) { fx.running = false; fx.ctx.clearRect(0, 0, fx.w, fx.h); return; }
  const { ctx } = fx; const now = performance.now();
  ctx.clearRect(0, 0, fx.w, fx.h);
  fx.items = fx.items.filter(it => {
    const k = (now - it.born) / it.ttl;
    if (k >= 1) return false;
    if (it.type === "ring") {
      const r = it.r0 + (it.r1 - it.r0) * (1 - Math.pow(1 - k, 3));
      ctx.globalAlpha = (1 - k) * it.a;
      ctx.strokeStyle = it.color; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.arc(it.x, it.y, r, 0, 7); ctx.stroke();
    } else {
      it.vy += it.g; it.x += it.vx; it.y += it.vy; it.rot += it.vr;
      const s = it.size * (it.grow ? (0.4 + k * 1.2) : (1 - k * 0.4));
      ctx.save();
      ctx.globalAlpha = (1 - k) * it.a;
      ctx.translate(it.x, it.y); ctx.rotate(it.rot);
      ctx.drawImage(it.spr, -s, -s, s * 2, s * 2);
      ctx.restore();
    }
    return true;
  });
  requestAnimationFrame(fxFrame);
}
function fxSparkle(x, y, n = 6) {
  if (RM) return;
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, sp = 0.4 + Math.random() * 1.6;
    fx.items.push({ type: "p", x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 0.6, g: 0.012,
      rot: 0, vr: 0, size: 5 + Math.random() * 8, grow: false, a: 0.9,
      spr: SPR_LIST[(Math.random() * 3) | 0], born: performance.now(), ttl: 700 + Math.random() * 700 });
  }
  fxEnsure();
}
function fxHearts(x, y, n = 34) {
  if (RM) return;
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (Math.random() - .5) * 2.2, sp = 1.2 + Math.random() * 3.4;
    fx.items.push({ type: "p", x: x + (Math.random() - .5) * 40, y: y + (Math.random() - .5) * 20,
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: 0.028,
      rot: (Math.random() - .5) * .8, vr: (Math.random() - .5) * .06,
      size: 7 + Math.random() * 12, grow: true, a: 0.95,
      spr: Math.random() < .5 ? SPR.heartP : SPR.heartR,
      born: performance.now(), ttl: 1600 + Math.random() * 1400 });
  }
  fxEnsure();
}
function fxRings(x, y, color = "rgba(255,140,180,.65)", n = 3, max = 0.6) {
  if (RM) return;
  const R = Math.hypot(fx.w, fx.h) * max;
  for (let i = 0; i < n; i++)
    fx.items.push({ type: "ring", x, y, r0: 10, r1: R, a: 0.8 - i * 0.18, color,
      born: performance.now() + i * 260, ttl: 1500 + i * 260 });
  fxEnsure();
}

/* ─────────────── پرده و مدیریت صحنه‌ها ─────────────── */
const veil = $("#veil");
const progressFill = $("#progress-fill");
const sceneEls = $$(".scene");
let current = 0, transit = false;

function setMood(m) { document.body.dataset.mood = m; }
function updateProgress() { progressFill.style.width = (current / (scenes.length - 1)) * 100 + "%"; }

function goToScene(idx, grand = false) {
  if (transit || idx === current) return;
  transit = true;
  clearAllTimers();
  const from = scenes[current], to = scenes[idx];
  from.exit();

  const swap = () => {
    sceneEls[current].classList.remove("is-active");
    sceneEls[current].setAttribute("aria-hidden", "true");
    current = idx;
    sceneEls[idx].classList.add("is-active");
    sceneEls[idx].removeAttribute("aria-hidden");
    setMood(to.mood); updateProgress();
    veil.classList.remove("on", "grand");
    to.enter();
    later(() => { transit = false; }, grand ? 900 : 400);
  };

  if (RM) { swap(); return; }
  veil.classList.toggle("grand", grand);
  veil.classList.add("on");
  later(swap, grand ? 780 : 520);
}

// دکمه‌های «ادامه»
$$("[data-next]").forEach(b => b.addEventListener("click", () => goToScene(current + 1)));

/* ─────────────── تایپ متن ─────────────── */
async function typeInto(el, text, scope, speed = 42) {
  const my = scope.tok;
  el.textContent = ""; el.classList.add("shown");
  if (RM) { el.textContent = text; return; }
  el.classList.add("typing");
  for (let i = 1; i <= text.length; i++) {
    if (scope.tok !== my) return;
    el.textContent = text.slice(0, i);
    await sleep(speed);
  }
  el.classList.remove("typing");
}

/* ═══════════════ سکانس ۱: شروع ═══════════════ */
const introM = {
  el: $("#scene-intro"), mood: "intro", tok: 0,
  async enter() {
    const my = ++this.tok;
    const l1 = $("#intro-line1"), l2 = $("#intro-line2"), btn = $("#btn-start");
    if (RM) {
      l1.textContent = "بیتا... یه چیزی هست که دلم می‌خواد بهت نشون بدم."; l1.classList.add("shown");
      l2.textContent = "این بار نمی‌خوام فقط بگم دوستت دارم..."; l2.classList.add("shown");
      btn.classList.add("shown"); return;
    }
    await sleep(1400); if (this.tok !== my) return;
    await typeInto(l1, "بیتا... یه چیزی هست که دلم می‌خواد بهت نشون بدم.", this); if (this.tok !== my) return;
    await sleep(900); if (this.tok !== my) return;
    await typeInto(l2, "این بار نمی‌خوام فقط بگم دوستت دارم...", this, 46); if (this.tok !== my) return;
    await sleep(750); if (this.tok !== my) return;
    btn.classList.add("shown");
  },
  exit() { this.tok++; },
  reset() {
    this.tok++;
    ["#intro-line1", "#intro-line2"].forEach(s => { const e = $(s); e.textContent = ""; e.className = "line type"; });
    $("#btn-start").classList.remove("shown");
  }
};
$("#btn-start").addEventListener("click", e => {
  const r = e.currentTarget.getBoundingClientRect();
  fxSparkle(r.left + r.width / 2, r.top + r.height / 2, 14);
  bgBurstVeilMult();
  goToScene(1, true);
});

/* ═══════════════ سکانس ۲: نام ═══════════════ */
const nameM = {
  el: $("#scene-name"), mood: "name", tok: 0,
  async enter() {
    const my = ++this.tok;
    const d = RM ? 150 : 900;
    $("#bita-name").classList.add("shown");
    await sleep(d + (RM ? 0 : 1000)); if (this.tok !== my) return;
    $('.name-line[data-seq="1"]').classList.add("shown");
    await sleep(d + (RM ? 0 : 2000)); if (this.tok !== my) return;
    $('.name-line[data-seq="2"]').classList.add("shown");
    await sleep(d + (RM ? 0 : 2100)); if (this.tok !== my) return;
    $('.name-line[data-seq="3"]').classList.add("shown");
    await sleep(1300); if (this.tok !== my) return;
    $("#scene-name [data-next]").classList.add("shown");
  },
  exit() { this.tok++; },
  reset() {
    this.tok++;
    $("#bita-name").classList.remove("shown");
    $$(".name-line").forEach(e => e.classList.remove("shown"));
    $("#scene-name [data-next]").classList.remove("shown");
  }
};

/* ═══════════════ سکانس ۳: قلب دیجیتال ═══════════════ */
const heartM = {
  el: $("#scene-heart"), mood: "heart", tok: 0,
  raf: 0, parts: [], w: 0, h: 0, ctx: null, boostT: 0,

  size() {
    const cv = $("#heart-canvas"), st = $("#heart-stage");
    const r = st.getBoundingClientRect();
    cv.width = r.width * 1.36 * DPR; cv.height = r.height * 1.36 * DPR;
    this.ctx = cv.getContext("2d"); this.ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    this.w = r.width * 1.36; this.h = r.height * 1.36;
    const n = clamp(Math.round(window.innerWidth / 9), 46, 120);
    this.parts = Array.from({ length: n }, () => this.mkPart(true));
  },
  mkPart(any) {
    const orb = Math.random() < 0.62;
    return {
      orb,
      ang: Math.random() * Math.PI * 2,
      rad: orb ? (0.42 + Math.random() * 0.55) * (this.w / 2) : (0.55 + Math.random() * 0.45) * (this.w / 2),
      sp: (0.0018 + Math.random() * 0.0035) * (Math.random() < .5 ? 1 : -1),
      r: 2 + Math.random() * 4.5,
      tw: Math.random() * Math.PI * 2,
      spr: SPR_LIST[(Math.random() * SPR_LIST.length) | 0],
      x: any ? Math.random() * this.w : (Math.random() < .5 ? -10 : this.w + 10),
      y: Math.random() * this.h,
      vx: 0, vy: 0, life: 0, ttl: 240 + Math.random() * 240, inflow: !orb && Math.random() < .8
    };
  },
  beat(t) { // ضربان لُب‌دوب
    const P = 1.18, p = (t % P) / P;
    const g = (c, w, a) => a * Math.exp(-((p - c) ** 2) / (2 * w * w));
    return 1 + g(0.10, 0.05, 0.085) + g(0.30, 0.07, 0.06);
  },
  frame(tms) {
    if (!this.raf) return;
    const t = tms / 1000;
    const core = $("#heart-core");
    const s = this.beat(t) + (performance.now() < this.boostT ? 0.05 : 0);
    core.style.transform = `scale(${s.toFixed(4)})`;

    const { ctx, w, h } = this; if (!ctx) { this.raf = requestAnimationFrame(this.frame.bind(this)); return; }
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2, R = w * 0.185;
    // هاله زیر قلب هماهنگ با ضربان
    ctx.globalAlpha = 0.5 + (s - 1) * 4;
    ctx.drawImage(SPR.red, cx - R * 1.7 * s, cy - R * 1.5 * s, R * 3.4 * s, R * 3 * s);
    ctx.globalAlpha = 1;

    for (const p of this.parts) {
      p.tw += 0.05;
      if (p.orb) {
        p.ang += p.sp * (performance.now() < this.boostT ? 5 : 1);
        const wob = Math.sin(p.tw * 0.5) * 6;
        p.x = cx + Math.cos(p.ang) * (p.rad + wob);
        p.y = cy + Math.sin(p.ang) * (p.rad + wob) * 0.92;
      } else { // ذرات جذب‌شونده به سمت قلب
        const dx = cx - p.x, dy = cy - p.y, d = Math.hypot(dx, dy) || 1;
        p.vx += (dx / d) * 0.03; p.vy += (dy / d) * 0.03;
        p.vx *= 0.985; p.vy *= 0.985;
        p.x += p.vx; p.y += p.vy; p.life++;
        if (d < R * 0.75 || p.life > p.ttl) Object.assign(p, this.mkPart(false), { x: Math.random() < .5 ? -12 : w + 12, y: Math.random() * h, vx: 0, vy: 0, life: 0 });
        if (d < R * 1.1) ctx.globalAlpha = clamp((d - R * 0.5) / R, 0, 1) * 0.9;
      }
      const a = 0.35 + 0.5 * Math.abs(Math.sin(p.tw));
      if (p.orb) ctx.globalAlpha = a;
      ctx.drawImage(p.spr, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
    }
    ctx.globalAlpha = 1;
    this.raf = requestAnimationFrame(this.frame.bind(this));
  },
  async enter() {
    const my = ++this.tok;
    this.size();
    if (!RM) { cancelAnimationFrame(this.raf); this.raf = requestAnimationFrame(this.frame.bind(this)); }
    const d = RM ? 200 : 0;
    await sleep(900 + d); if (this.tok !== my) return;
    $("#heart-line1").classList.add("shown");
    await sleep((RM ? 300 : 4300)); if (this.tok !== my) return;
    $("#heart-line2").classList.add("shown");
    await sleep(2200); if (this.tok !== my) return;
    $("#scene-heart [data-next]").classList.add("shown");
  },
  exit() { this.tok++; cancelAnimationFrame(this.raf); this.raf = 0; },
  reset() {
    this.tok++; cancelAnimationFrame(this.raf); this.raf = 0;
    $("#heart-line1").classList.remove("shown"); $("#heart-line2").classList.remove("shown");
    $("#scene-heart [data-next]").classList.remove("shown");
  }
};
function heartTap() {
  heartM.boostT = performance.now() + 1000;
  const wv = $("#heart-wave");
  wv.classList.remove("go"); void wv.offsetWidth; wv.classList.add("go");
  const r = $("#heart-core").getBoundingClientRect();
  fxRings(r.left + r.width / 2, r.top + r.height / 2, "rgba(255,120,165,.7)", 2, 0.28);
  fxSparkle(r.left + r.width / 2, r.top + r.height / 2, 10);
}
$("#heart-core").addEventListener("click", heartTap);
$("#heart-core").addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); heartTap(); } });

/* ═══════════════ سکانس ۴: آلبوم ═══════════════ */
const PHOTOS = ["img/bita1.jpg", "img/bita2.jpg", "img/bita3.jpg", "img/bita4.jpg", "img/bita5.jpg"];
const CAPS = [
  "بعضی آدما، حتی با یه حضور ساده، دنیا رو قشنگ‌تر می‌کنن.",
  "بعضی تصویرها، بی‌دلیل آدم رو به لبخند می‌رسونن.",
  "گاهی قشنگ‌ترین لحظه‌ها، همون لحظه‌های ساده‌ان.",
  "برای من، تو فقط یه عکس قشنگ نیستی؛ یه حس قشنگی.",
  "این آلبوم پنج تا عکس داره، ولی حرف دلم خیلی بیشتر از ایناست."
];
const albumM = {
  el: $("#scene-album"), mood: "album", tok: 0,
  cur: 0, open: false, flipping: false,

  paint(which, i) {
    const fig = $("#fig-" + which), img = $("#img-" + which), cap = $("#cap-" + which);
    fig.classList.remove("missing");
    img.style.setProperty("opacity", "");
    img.src = PHOTOS[i];
    fig.style.setProperty("--phbg", `url("${PHOTOS[i]}")`);
    cap.textContent = CAPS[i];
    if (img.complete && img.naturalWidth === 0 && img.src) fig.classList.add("missing");
  },
  syncUI() {
    $("#album-num").textContent = faNum(this.cur + 1);
    $$("#album-dots i").forEach((d, i) => d.classList.toggle("on", i === this.cur));
    $("#btn-prev").toggleAttribute("disabled", this.cur === 0 || this.flipping);
    $("#btn-next").toggleAttribute("disabled", this.cur === 4 || this.flipping);
  },
  heal() { // خودترمیمی اگر ترنزیشن نیمه‌کاره مانده باشد
    this.flipping = false;
    const leaf = $("#leaf");
    leaf.classList.add("no-trans"); leaf.style.transform = "";
    void leaf.offsetWidth; leaf.classList.remove("no-trans");
    this.paint("base", this.cur);
    this.paint("front", this.cur);
    this.syncUI();
  },
  flipTo(dir) {
    if (!this.open || this.flipping) return;
    const target = this.cur + dir;
    if (target < 0 || target > 4) return;
    this.flipping = true; this.syncUI();
    const leaf = $("#leaf");
    const done = () => {
      this.cur = target; this.flipping = false;
      leaf.classList.add("no-trans"); leaf.style.transform = "";
      void leaf.offsetWidth; leaf.classList.remove("no-trans");
      this.paint("front", this.cur);
      this.syncUI();
    };
    if (RM) { this.paint("base", target); this.paint("front", target); this.paint("back", target); done(); return; }
    leaf.classList.remove("no-trans");
    if (dir > 0) {
      this.paint("front", this.cur); this.paint("back", target); this.paint("base", target);
      requestAnimationFrame(() => { leaf.style.transform = "rotateY(180deg)"; });
    } else {
      this.paint("front", target); this.paint("back", this.cur); this.paint("base", target);
      leaf.classList.add("no-trans"); leaf.style.transform = "rotateY(180deg)";
      void leaf.offsetWidth; leaf.classList.remove("no-trans");
      requestAnimationFrame(() => { requestAnimationFrame(() => { leaf.style.transform = ""; }); });
    }
    let finished = false;
    const finish = () => { if (!finished) { finished = true; done(); } };
    const h = e => { if (e.propertyName === "transform") { leaf.removeEventListener("transitionend", h); finish(); } };
    leaf.addEventListener("transitionend", h);
    later(finish, 1250); // اگر رویداد نیومد
  },
  openBook() {
    if (this.open) return;
    this.open = true;
    const book = $("#book");
    book.classList.add("open");
    fxSparkle(innerWidth / 2, innerHeight / 2, 10);
    later(() => { $("#album-ui").classList.add("shown"); $("#btn-after-album").classList.add("shown"); }, RM ? 100 : 1250);
  },
  enter() { this.tok++; if (this.open) this.heal(); },
  exit() { this.tok++; },
  reset() {
    this.tok++; this.cur = 0; this.open = false; this.flipping = false;
    const book = $("#book"), leaf = $("#leaf");
    book.classList.add("no-trans"); book.classList.remove("open");
    leaf.classList.add("no-trans"); leaf.style.transform = "";
    this.paint("base", 0); this.paint("front", 0); this.paint("back", 1);
    void book.offsetWidth; book.classList.remove("no-trans");
    leaf.classList.remove("no-trans");
    $("#album-ui").classList.remove("shown"); $("#btn-after-album").classList.remove("shown");
    this.syncUI();
  }
};
$("#book-cover").addEventListener("click", () => albumM.openBook());
$("#book-cover").addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); albumM.openBook(); } });
$("#btn-next").addEventListener("click", () => albumM.flipTo(1));
$("#btn-prev").addEventListener("click", () => albumM.flipTo(-1));
["base", "front", "back"].forEach(k => {
  const img = $("#img-" + k);
  img.addEventListener("error", () => $("#fig-" + k).classList.add("missing"));
  img.addEventListener("load", () => $("#fig-" + k).classList.remove("missing"));
});
// سوایپ و لمس روی کتاب
(() => {
  const book = $("#book");
  let sx = 0, sy = 0, st = 0, inside = false;
  book.addEventListener("pointerdown", e => { inside = true; sx = e.clientX; sy = e.clientY; st = performance.now(); }, { passive: true });
  book.addEventListener("pointerup", e => {
    if (!inside) return; inside = false;
    if (!albumM.open || albumM.flipping) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 46 && Math.abs(dx) > Math.abs(dy) * 1.2) albumM.flipTo(dx > 0 ? 1 : -1);
    else if (Math.abs(dx) < 10 && Math.abs(dy) < 10 && performance.now() - st < 450 && e.target.closest(".ph")) openLightbox();
  }, { passive: true });
})();

/* لایت‌باکس */
const lightbox = $("#lightbox");
function openLightbox() {
  const i = albumM.cur;
  const fig = $("#lb-fig"), img = $("#lb-img");
  fig.classList.remove("missing");
  img.style.opacity = "1";
  img.src = PHOTOS[i];
  img.alt = "عکس بزرگ بیتا — قاب " + faNum(i + 1);
  $("#lb-cap").textContent = CAPS[i];
  lightbox.classList.remove("hidden");
}
function closeLightbox() { lightbox.classList.add("hidden"); }
$("#lb-img").addEventListener("error", () => {
  $("#lb-img").style.opacity = "0";
  $("#lb-cap").textContent = "این قاب لحظه‌ای پیدا نشد... ولی جاش توی قلبمه ❤";
});
$("#lb-close").addEventListener("click", closeLightbox);
$("#lb-backdrop").addEventListener("click", closeLightbox);
addEventListener("keydown", e => { if (e.key === "Escape") closeLightbox(); });

/* ═══════════════ سکانس ۵: روایت ═══════════ */
const storyM = {
  el: $("#scene-story"), mood: "story", tok: 0, io: null,
  init() {
    const sc = $("#story-scroll");
    this.io = new IntersectionObserver(es => es.forEach(en => {
      if (en.isIntersecting) en.target.classList.add("in");
    }), { root: sc, threshold: 0.32 });
    $$(".story-panel").forEach(p => this.io.observe(p));
    $$(".story-go").forEach(b => b.addEventListener("click", () => {
      const next = b.closest(".story-panel").nextElementSibling;
      if (next) next.scrollIntoView({ behavior: RM ? "auto" : "smooth", block: "start" });
    }));
    if (!RM) sc.addEventListener("scroll", () => {
      $(".story-glow").style.transform = `translateY(${clamp(sc.scrollTop * 0.05, 0, 90)}px)`;
    }, { passive: true });
  },
  enter() {},
  exit() {},
  reset() {
    $("#story-scroll").scrollTop = 0;
    $$(".story-panel").forEach(p => p.classList.remove("in"));
    $(".story-glow").style.transform = "";
  }
};

/* ═══════════════ سکانس ۶: موسیقی و اکولایزر ═══════════ */
const audio = $("#love-audio");
const musicM = {
  el: $("#scene-music"), mood: "music",
  started: false, dead: false,
  ac: null, analyser: null, freq: null, graph: false, sim: false,
  eqRaf: 0, bars: 48, smooth: null, grad: null, eqW: 0, eqH: 0,

  initGraph() {
    if (this.graph || this.sim) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) { this.sim = true; return; }
      this.ac = new AC();
      const src = this.ac.createMediaElementSource(audio);
      this.analyser = this.ac.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.82;
      src.connect(this.analyser);
      this.analyser.connect(this.ac.destination);
      this.freq = new Uint8Array(this.analyser.frequencyBinCount);
      this.graph = true;
    } catch (err) { this.sim = true; }
  },
  eqSize() {
    const cv = $("#eq-canvas");
    const f = fitCanvas(cv);
    this.eqW = f.w; this.eqH = f.h;
    this.eqCtx = f.ctx;
    this.bars = clamp(Math.floor(f.w / 9), 24, 64);
    this.smooth = new Float32Array(this.bars);
    const g = f.ctx.createLinearGradient(0, f.h, 0, 0);
    g.addColorStop(0, "#7c3aed"); g.addColorStop(0.42, "#e0263f"); g.addColorStop(1, "#ff8fb8");
    this.grad = g;
  },
  eqFrame(tms) {
    if (!this.eqRaf) return;
    const { eqCtx: c, eqW: w, eqH: h, bars } = this;
    const playing = !audio.paused && !audio.ended;
    let live = null;
    if (playing && this.graph && this.analyser) {
      this.analyser.getByteFrequencyData(this.freq);
      live = this.freq;
    }
    c.clearRect(0, 0, w, h);
    const bw = w / bars;
    let anyHigh = false;
    for (let i = 0; i < bars; i++) {
      let v;
      if (live) {
        const idx = 2 + Math.floor(Math.pow(i / bars, 1.55) * (live.length * 0.72));
        v = live[idx] / 255;
      } else if (playing && this.sim) { // تحلیل واقعی ممکن نیست: انیمیشن ساده جایگزین
        const t = tms / 1000;
        v = 0.28 + 0.22 * Math.sin(t * (2.1 + i * 0.11) + i * 0.7) + 0.18 * Math.sin(t * 4.3 + i * 1.7);
        v = clamp(v, 0.06, 0.9);
      } else v = 0;
      this.smooth[i] += (v - this.smooth[i]) * (v > this.smooth[i] ? 0.5 : 0.14);
      const bh = Math.max(3, this.smooth[i] * (h - 10));
      if (bh > 5) anyHigh = true;
      const x = w - (i + 1) * bw + bw * 0.18; // راست به چپ
      const y = h - 5 - bh;
      c.fillStyle = this.grad;
      c.shadowColor = "rgba(255,93,143,.5)"; c.shadowBlur = 9;
      if (c.roundRect) { c.beginPath(); c.roundRect(x, y, bw * 0.64, bh, 3); c.fill(); }
      else c.fillRect(x, y, bw * 0.64, bh);
    }
    c.shadowBlur = 0;
    if (!playing && !anyHigh) { this.eqStop(); this.eqRest(); return; }
    this.eqRaf = requestAnimationFrame(this.eqFrame.bind(this));
  },
  eqRest() {
    const c = this.eqCtx; if (!c) return;
    c.clearRect(0, 0, this.eqW, this.eqH);
    c.fillStyle = "rgba(255,143,184,.4)";
    const bw = this.eqW / this.bars;
    for (let i = 0; i < this.bars; i++) {
      const x = this.eqW - (i + 1) * bw + bw * 0.18;
      if (c.roundRect) { c.beginPath(); c.roundRect(x, this.eqH - 8, bw * 0.64, 3, 2); c.fill(); }
      else c.fillRect(x, this.eqH - 8, bw * 0.64, 3);
    }
  },
  eqStart() {
    if (this.dead) return;
    this.eqStop();
    if (!this.eqW) this.eqSize();
    this.eqRaf = requestAnimationFrame(this.eqFrame.bind(this));
  },
  eqStop() { cancelAnimationFrame(this.eqRaf); this.eqRaf = 0; },

  async tryPlay() {
    if (this.dead) return;
    this.initGraph();
    if (this.ac && this.ac.state === "suspended") { try { await this.ac.resume(); } catch (e) {} }
    try { await audio.play(); }
    catch (err) { this.fail(); }
  },
  play() { this.tryPlay(); },
  fail() {
    this.dead = true;
    $("#player-error").hidden = false;
    const bpm = $("#btn-play-main");
    bpm.setAttribute("disabled", ""); bpm.classList.add("shown");
    $(".btn-text", bpm).textContent = "موسیقی در دسترس نیست";
    $("#mini-player").classList.add("hidden");
    this.eqStop(); this.eqRest();
  },
  syncUI() {
    const playing = !audio.paused && !audio.ended;
    $("#player-card").classList.toggle("playing", playing);
    $("#btn-pp").classList.toggle("paused", !playing);
    $("#mini-player").classList.toggle("playing", playing);
    const bpm = $("#btn-play-main");
    if (this.started && !this.dead) bpm.style.display = "none";
    if (playing) this.eqStart();
  },
  enter() {
    this.eqSize();
    if (!this.started && !this.dead) this.eqRest();
    if (!audio.paused && !audio.ended) {
      this.eqStart();
      if (this.ac && this.ac.state === "suspended") this.ac.resume().catch(() => {});
    }
    this.syncUI();
  },
  exit() { this.eqStop(); },
  reset() { /* موسیقی عمداً ادامه پیدا می‌کند؛ فقط ظاهر همگام می‌شود */ this.syncUI(); }
};

$("#btn-play-main").addEventListener("click", () => musicM.play());
$("#btn-pp").addEventListener("click", () => {
  if (musicM.dead) return;
  if (audio.paused || audio.ended) { if (audio.ended) audio.currentTime = 0; musicM.play(); }
  else audio.pause();
});
$("#mini-player").addEventListener("click", () => {
  if (musicM.dead) return;
  if (audio.paused || audio.ended) { if (audio.ended) audio.currentTime = 0; musicM.play(); }
  else audio.pause();
});

const fmtT = s => { if (!isFinite(s)) return "--:--"; s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
audio.addEventListener("play", () => {
  musicM.started = true;
  $("#player-controls").classList.add("shown");
  $("#mini-player").classList.remove("hidden");
  musicM.syncUI();
});
audio.addEventListener("pause", () => musicM.syncUI());
audio.addEventListener("ended", () => { audio.currentTime = 0; musicM.syncUI(); });
audio.addEventListener("error", () => musicM.fail());
audio.addEventListener("loadedmetadata", () => { $("#t-dur").textContent = fmtT(audio.duration); });
audio.addEventListener("timeupdate", () => {
  $("#t-cur").textContent = fmtT(audio.currentTime);
  $("#t-dur").textContent = fmtT(audio.duration);
  if (!seekDrag.on && isFinite(audio.duration) && audio.duration > 0) {
    const f = audio.currentTime / audio.duration;
    $("#seek-fill").style.width = f * 100 + "%";
    $("#seek-thumb").style.right = f * 100 + "%";
    $("#seek").setAttribute("aria-valuenow", Math.round(f * 100));
  }
});

/* نوار پیشرفت لمسی */
const seekDrag = { on: false };
(() => {
  const seek = $("#seek");
  const setFrom = x => {
    if (!isFinite(audio.duration) || audio.duration <= 0) return;
    const r = seek.getBoundingClientRect();
    const f = clamp((r.right - x) / r.width, 0, 1); // RTL
    audio.currentTime = f * audio.duration;
    $("#seek-fill").style.width = f * 100 + "%";
    $("#seek-thumb").style.right = f * 100 + "%";
  };
  seek.addEventListener("pointerdown", e => { seekDrag.on = true; seek.setPointerCapture(e.pointerId); setFrom(e.clientX); });
  seek.addEventListener("pointermove", e => { if (seekDrag.on) setFrom(e.clientX); });
  seek.addEventListener("pointerup", () => seekDrag.on = false);
  seek.addEventListener("pointercancel", () => seekDrag.on = false);
})();

/* حجم صدا */
const vol = $("#vol");
function volPaint() { vol.style.setProperty("--v", vol.value + "%"); }
vol.addEventListener("input", () => {
  audio.volume = vol.value / 100;
  audio.muted = false;
  $("#btn-mute").classList.toggle("muted", vol.value == 0);
  volPaint();
});
audio.volume = 0.8; volPaint();
$("#btn-mute").addEventListener("click", () => {
  audio.muted = !audio.muted;
  $("#btn-mute").classList.toggle("muted", audio.muted);
});

/* ═══════════════ سکانس ۷: اعتراف ═══════════ */
const confessM = {
  el: $("#scene-confess"), mood: "confess", tok: 0,
  raf: 0, pts: [], waves: [], w: 0, h: 0, ctx: null, t0: 0,

  targets() {
    const cx = this.w / 2, cy = this.h * 0.36;
    const s = Math.min(this.w, this.h * 1.25) * 0.62 / 36;
    const N = clamp(Math.round(this.w / 3.4), 90, 170);
    const arr = [];
    for (let i = 0; i < N; i++) {
      const t = (i / N) * Math.PI * 2;
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      arr.push({ tx: cx + x * s, ty: cy - y * s });
    }
    return arr;
  },
  size() {
    const cv = $("#confess-canvas");
    const f = fitCanvas(cv);
    this.w = f.w; this.h = f.h; this.ctx = f.ctx;
    const T = this.targets();
    this.pts = T.map((p, i) => ({
      ...p, x: Math.random() * this.w, y: Math.random() * this.h,
      dl: (i / T.length) * 0.9 + Math.random() * 0.4,
      r: 2.4 + Math.random() * 4.5, tw: Math.random() * Math.PI * 2,
      spr: SPR_LIST[(Math.random() * SPR_LIST.length) | 0]
    }));
  },
  frame(tms) {
    if (!this.raf) return;
    const { ctx: c, w, h } = this;
    const t = (tms - this.t0) / 1000;
    c.clearRect(0, 0, w, h);
    // هاله مرکزی
    const pulse = 1 + 0.06 * Math.sin(t * 2.4);
    c.globalAlpha = clamp((t - 1.4) / 2, 0, 0.55);
    c.drawImage(SPR.red, w / 2 - 120 * pulse, h * 0.36 - 100 * pulse, 240 * pulse, 200 * pulse);
    c.globalAlpha = 1;

    for (const p of this.pts) {
      p.tw += 0.04;
      const k = clamp((t - p.dl) / 2.1, 0, 1);
      const e = 1 - Math.pow(1 - k, 3);
      let x = p.x + (p.tx - p.x) * e;
      let y = p.y + (p.ty - p.y) * e;
      if (k >= 1) { x = p.tx + Math.sin(p.tw) * 1.6; y = p.ty + Math.cos(p.tw * 0.8) * 1.6; }
      const a = (0.3 + 0.6 * Math.abs(Math.sin(p.tw))) * clamp(k * 3 + 0.15, 0, 1);
      c.globalAlpha = a;
      c.drawImage(p.spr, x - p.r, y - p.r, p.r * 2, p.r * 2);
    }
    c.globalAlpha = 1;
    // موج نور بعد از شکل‌گیری
    this.waves = this.waves.filter(wv => {
      const k = (tms - wv.t0) / wv.ttl;
      if (k >= 1) return false;
      c.globalAlpha = (1 - k) * 0.6;
      c.strokeStyle = wv.color; c.lineWidth = 2;
      c.beginPath(); c.arc(w / 2, h * 0.36, 30 + k * Math.max(w, h) * 0.75, 0, 7); c.stroke();
      return true;
    });
    c.globalAlpha = 1;
    this.raf = requestAnimationFrame(this.frame.bind(this));
  },
  async enter() {
    const my = ++this.tok;
    this.size();
    this.waves = [];
    if (RM) { // بدون حرکت: قلب آماده
      this.t0 = performance.now() - 9000;
    } else this.t0 = performance.now();
    cancelAnimationFrame(this.raf);
    if (!RM) this.raf = requestAnimationFrame(this.frame.bind(this));
    else this.frameOnce();
    const d = RM ? 260 : 0;
    await sleep(800 + d); if (this.tok !== my) return;
    $("#conf-1").classList.add("shown");
    await sleep((RM ? 300 : 2600)); if (this.tok !== my) return;
    this.waves.push({ t0: performance.now(), ttl: 2400, color: "rgba(255,110,150,.8)" });
    $("#conf-2").classList.add("shown");
    await sleep((RM ? 300 : 3400)); if (this.tok !== my) return;
    $("#conf-3").classList.add("shown");
    await sleep((RM ? 400 : 3200)); if (this.tok !== my) return;
    this.waves.push({ t0: performance.now(), ttl: 2600, color: "rgba(255,170,200,.85)" });
    $("#conf-main").classList.add("shown");
    if (!RM) fxHearts(innerWidth / 2, innerHeight * 0.36, 18);
    await sleep(1800); if (this.tok !== my) return;
    $("#btn-after-confess").classList.add("shown");
  },
  frameOnce() {
    const { ctx: c, w, h } = this; if (!c) return;
    c.globalAlpha = 0.5; c.drawImage(SPR.red, w / 2 - 120, h * 0.36 - 100, 240, 200); c.globalAlpha = 1;
    for (const p of this.pts) { c.globalAlpha = 0.75; c.drawImage(p.spr, p.tx - p.r, p.ty - p.r, p.r * 2, p.r * 2); }
    c.globalAlpha = 1;
  },
  exit() { this.tok++; cancelAnimationFrame(this.raf); this.raf = 0; },
  reset() {
    this.tok++; cancelAnimationFrame(this.raf); this.raf = 0;
    ["#conf-1", "#conf-2", "#conf-3", "#conf-main"].forEach(s => $(s).classList.remove("shown"));
    $("#btn-after-confess").classList.remove("shown");
    const cv = $("#confess-canvas"); const c = cv.getContext("2d");
    if (c) c.clearRect(0, 0, cv.width, cv.height);
  }
};

/* ═══════════════ سکانس ۸: انتخاب ═══════════ */
const choiceM = {
  el: $("#scene-choice"), mood: "choice", tok: 0,
  async enter() {
    const my = ++this.tok;
    await sleep(500); if (this.tok !== my) return;
    $("#choice-ask").classList.add("shown");
  },
  exit() { this.tok++; },
  reset() {
    this.tok++;
    $("#choice-ask").hidden = false; $("#choice-ask").classList.remove("shown");
    $("#result-yes").hidden = true; $("#result-no").hidden = true;
    $("#btn-hug").hidden = false; $("#hug-note").hidden = true; $("#btn-yes-final").hidden = true;
  }
};
$("#btn-yes").addEventListener("click", () => {
  $("#choice-ask").hidden = true; $("#result-yes").hidden = false;
  if (!RM) { fxHearts(innerWidth / 2, innerHeight * 0.42, 42); fxRings(innerWidth / 2, innerHeight * 0.42, "rgba(255,120,165,.55)", 3, 0.5); }
});
$("#btn-notyet").addEventListener("click", () => {
  $("#choice-ask").hidden = true; $("#result-no").hidden = false;
  if (!RM) fxSparkle(innerWidth / 2, innerHeight * 0.4, 8);
});
$("#btn-hug").addEventListener("click", () => {
  const cx = innerWidth / 2, cy = innerHeight / 2;
  if (!RM) { fxRings(cx, cy, "rgba(233,192,122,.7)", 4, 0.72); fxHearts(cx, cy, 30); }
  $("#btn-hug").hidden = true; $("#hug-note").hidden = false; $("#btn-yes-final").hidden = false;
});
$("#btn-yes-final").addEventListener("click", () => goToScene(8, true));
$("#btn-chance").addEventListener("click", () => goToScene(8, true));

/* ═══════════════ سکانس ۹: پایانی ═══════════ */
const finalM = {
  el: $("#scene-final"), mood: "final", tok: 0,
  async enter() {
    const my = ++this.tok;
    const lines = $$(".final-line"), d = RM ? 160 : 1500;
    for (const l of lines) { await sleep(d); if (this.tok !== my) return; l.classList.add("shown"); }
    await sleep(RM ? 200 : 1600); if (this.tok !== my) return;
    $(".final-sign").classList.add("shown");
    await sleep(1200); if (this.tok !== my) return;
    $("#btn-restart").classList.add("shown");
  },
  exit() { this.tok++; },
  reset() {
    this.tok++;
    $$(".final-line").forEach(e => e.classList.remove("shown"));
    $(".final-sign").classList.remove("shown");
    $("#btn-restart").classList.remove("shown");
  }
};

function resetAll() {
  clearAllTimers();
  [introM, nameM, heartM, albumM, storyM, musicM, confessM, choiceM, finalM].forEach(m => m.reset());
  closeLightbox();
  fx.items = [];
}
$("#btn-restart").addEventListener("click", () => {
  if (transit) return;
  resetAll();
  // بازگشت نرم به صحنه اول بدون رفرش؛ موسیقی به حال خودش می‌ماند
  transit = true;
  const swap = () => {
    sceneEls[current].classList.remove("is-active");
    current = 0;
    sceneEls[0].classList.add("is-active");
    setMood(scenes[0].mood); updateProgress();
    veil.classList.remove("on", "grand");
    scenes[0].enter();
    later(() => transit = false, 900);
  };
  if (RM) swap();
  else { veil.classList.add("on", "grand"); later(swap, 780); }
});

/* ─────────────── ستاره‌های صحنه پایانی ─────────────── */
(() => {
  const box = $("#stars");
  const frag = document.createDocumentFragment();
  for (let i = 0; i < 56; i++) {
    const s = document.createElement("i");
    s.style.right = Math.random() * 100 + "%";
    s.style.top = Math.random() * 100 + "%";
    s.style.setProperty("--d", (2 + Math.random() * 3.5) + "s");
    s.style.setProperty("--dl", (-Math.random() * 4) + "s");
    s.style.opacity = String(0.2 + Math.random() * 0.7);
    frag.appendChild(s);
  }
  box.appendChild(frag);
})();

/* ─────────────── نشانگر اختصاصی دسکتاپ ─────────────── */
(() => {
  if (!FINE || RM) return;
  const cur = $("#cursor"), dot = $(".c-dot"), ring = $(".c-ring");
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, on = false;
  addEventListener("mousemove", e => {
    mx = e.clientX; my = e.clientY;
    if (!on) { on = true; document.body.classList.add("has-cursor"); }
    dot.style.transform = `translate(${mx}px,${my}px)`;
    const hov = e.target.closest("button, a, .seek, .heart-core, .book-cover, input");
    cur.classList.toggle("grow", !!hov);
  }, { passive: true });
  addEventListener("mousedown", () => cur.classList.add("down"));
  addEventListener("mouseup", () => cur.classList.remove("down"));
  addEventListener("touchstart", () => { document.body.classList.remove("has-cursor"); on = false; }, { passive: true, once: true });
  (function loop() {
    rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
    ring.style.transform = `translate(${rx}px,${ry}px)`;
    requestAnimationFrame(loop);
  })();
})();

/* ─────────────── رویدادهای سراسری ─────────────── */
let rsT = 0;
addEventListener("resize", () => {
  clearTimeout(rsT);
  rsT = setTimeout(() => {
    bgInit(); fxInit();
    if (scenes[current] === heartM && heartM.raf) heartM.size();
    if (scenes[current] === confessM) confessM.size();
    musicM.eqSize(); if (!musicM.eqRaf) musicM.eqRest();
  }, 220);
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) { bg.running = false; }
  else {
    bgStart();
    if (!audio.paused && musicM.ac && musicM.ac.state === "suspended") musicM.ac.resume().catch(() => {});
    if (scenes[current] === musicM && !audio.paused) musicM.eqStart();
  }
});

/* ─────────────── ثبت صحنه‌ها و شروع ─────────────── */
const scenes = [introM, nameM, heartM, albumM, storyM, musicM, confessM, choiceM, finalM];

bgInit(); fxInit(); bgStart();
storyM.init();
albumM.paint("base", 0); albumM.paint("front", 0); albumM.paint("back", 1);
albumM.syncUI();
sceneEls.forEach((s, i) => { if (i !== 0) s.setAttribute("aria-hidden", "true"); });
setMood("intro"); updateProgress();
introM.enter();

})();
