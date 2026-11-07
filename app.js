/* =========================================================
   CHEMBOND — logika media pembelajaran
   Disusun oleh: Afifah Naurah Royyani (NIM 06101182530009)
   ========================================================= */
(() => {
'use strict';

/* =========================================================
   PENGATURAN GOOGLE SPREADSHEET
   Tempel URL Web App dari Google Apps Script di antara tanda kutip.
   Contoh: 'https://script.google.com/macros/s/AKfycb.../exec'
   Biarkan kosong ('') jika belum ingin mengirim ke spreadsheet.
   ========================================================= */
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbxfuCEKkoS-YnW-v6s1eRmd8DwceRXYhunpcr4QDifrgWkpiUdpZ9wE3rl_gUXFEjrG5Q/exec'

/* ---------------- Helpers ---------------- */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const NS = 'http://www.w3.org/2000/svg';
function svgEl(tag, attrs = {}, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
function setPos(el, x, y) { el.style.transform = `translate(${x}px, ${y}px)`; el._x = x; el._y = y; }
function show(el, on = true) { el.style.opacity = on ? 1 : 0; el.style.pointerEvents = on ? '' : 'none'; }
const wait = ms => new Promise(r => setTimeout(r, ms));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function toast(msg, ms = 3200) {
  const t = $('#toast');
  t.innerHTML = msg; t.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), ms);
}
function feedback(el, type, html) {
  el.className = 'feedback show ' + type;
  el.innerHTML = html;
}

/* Normalisasi teks jawaban siswa */
function norm(t) {
  return (' ' + String(t || '') + ' ')
    .toLowerCase()
    .replace(/⁺/g, '+').replace(/⁻|−/g, '-')
    .replace(/[₀-₉]/g, d => String(d.charCodeAt(0) - 8320))
    .replace(/[⁰¹²³⁴-⁹]/g, d => ({ '⁰': 0, '¹': 1, '²': 2, '³': 3, '⁴': 4, '⁵': 5, '⁶': 6, '⁷': 7, '⁸': 8, '⁹': 9 }[d]))
    .replace(/\s+/g, ' ');
}
const testGroup = (g, txt) => (g.fn ? g.fn(txt) : g.re.test(txt));

/* ---------------- Sumber ---------------- */
const SOURCES = {
  cp: 'Badan Standar, Kurikulum, dan Asesmen Pendidikan. (2024). <i>Keputusan Kepala BSKAP Kemendikbudristek Nomor 032/H/KR/2024 tentang Capaian Pembelajaran pada PAUD, Jenjang Pendidikan Dasar, dan Jenjang Pendidikan Menengah pada Kurikulum Merdeka</i>. Jakarta: Kemendikbudristek.',
  kemdik: 'Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi. (2022). <i>Kimia untuk SMA/MA Kelas XI</i> (Buku Siswa, Kurikulum Merdeka). Jakarta: Pusat Kurikulum dan Perbukuan.',
  chang: 'Chang, R., &amp; Goldsby, K. A. (2016). <i>Chemistry</i> (12th ed.). New York: McGraw-Hill Education.',
  brown: 'Brown, T. L., LeMay, H. E., Bursten, B. E., Murphy, C. J., Woodward, P. M., &amp; Stoltzfus, M. W. (2018). <i>Chemistry: The Central Science</i> (14th ed.). New York: Pearson.',
  petrucci: 'Petrucci, R. H., Herring, F. G., Madura, J. D., &amp; Bissonnette, C. (2017). <i>General Chemistry: Principles and Modern Applications</i> (11th ed.). Toronto: Pearson.',
  housecroft: 'Housecroft, C. E., &amp; Sharpe, A. G. (2018). <i>Inorganic Chemistry</i> (5th ed.). Harlow: Pearson.',
  silberberg: 'Silberberg, M. S., &amp; Amateis, P. (2018). <i>Chemistry: The Molecular Nature of Matter and Change</i> (8th ed.). New York: McGraw-Hill Education.',
  erisman: 'Erisman, J. W., Sutton, M. A., Galloway, J., Klimont, Z., &amp; Winiwarter, W. (2008). How a century of ammonia synthesis changed the world. <i>Nature Geoscience, 1</i>(10), 636–639.',
  smil: 'Smil, V. (2001). <i>Enriching the Earth: Fritz Haber, Carl Bosch, and the Transformation of World Food Production</i>. Cambridge, MA: MIT Press.'
};
$$('.sources').forEach(box => {
  const keys = box.dataset.src.split(/\s+/).filter(k => SOURCES[k]);
  box.innerHTML = '<b>Sumber</b><ol>' + keys.map(k => `<li>${SOURCES[k]}</li>`).join('') + '</ol>';
});

/* ---------------- Langit berbintang ---------------- */
(function stars() {
  const c = $('#stars'), ctx = c.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W, H, list = [];
  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    c.width = W * dpr; c.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round((W * H) / 6500);
    list = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.3 + 0.2, p: Math.random() * Math.PI * 2, s: 0.4 + Math.random() * 1.4,
      c: Math.random() < 0.15 ? '255,214,120' : (Math.random() < 0.4 ? '150,200,255' : '255,255,255')
    }));
  }
  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    for (const s of list) {
      const a = 0.35 + 0.65 * Math.abs(Math.sin(s.p + t * 0.0006 * s.s));
      ctx.fillStyle = `rgba(${s.c},${a})`;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill();
    }
    if (!reduce) requestAnimationFrame(draw);
  }
  resize(); addEventListener('resize', resize); requestAnimationFrame(draw);
})();

/* ---------------- Audio (Web Speech API) ---------------- */
const Voice = {
  on: true, voice: null, current: null,
  init() {
    if (!('speechSynthesis' in window)) return;
    const pick = () => {
      const vs = speechSynthesis.getVoices();
      this.voice = vs.find(v => /^id[-_]ID/i.test(v.lang)) || vs.find(v => /^id/i.test(v.lang)) || null;
    };
    pick(); speechSynthesis.onvoiceschanged = pick;
  },
  spoken(t) {
    return String(t)
      .replace(/e⁻/g, ' elektron')
      .replace(/H⁺/g, 'H plus').replace(/⁺/g, ' plus')
      .replace(/[₀-₉]/g, d => ' ' + (d.charCodeAt(0) - 8320) + ' ')
      .replace(/—|–|→/g, ', ');
  },
  say(text, btn) {
    if (!this.on || !('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(this.spoken(text));
    u.lang = 'id-ID'; u.rate = 0.98; u.pitch = 1;
    if (this.voice) u.voice = this.voice;
    $$('.spk.talking').forEach(b => b.classList.remove('talking'));
    if (btn) { u.onstart = () => btn.classList.add('talking'); u.onend = u.onerror = () => btn.classList.remove('talking'); }
    speechSynthesis.speak(u);
  },
  stop() { if ('speechSynthesis' in window) speechSynthesis.cancel(); $$('.spk.talking').forEach(b => b.classList.remove('talking')); }
};
Voice.init();
$('#soundBtn').addEventListener('click', () => {
  Voice.on = !Voice.on;
  $('#soundBtn').innerHTML = Voice.on ? '🔊 <span>Suara aktif</span>' : '🔇 <span>Suara mati</span>';
  if (!Voice.on) Voice.stop();
});

/* ---------------- Navigasi & penguncian slide ---------------- */
const slides = $$('.slide');
const N = slides.length;
const state = { cur: 0, done: Array(N).fill(false), student: { name: '', kelas: '' }, quiz: null };
const LOCK_MSG = [
  'Tekan “Mulai Belajar” untuk memulai',
  'Baca semua langkah lalu simpan data siswa',
  'Jawab pertanyaan pemantik dengan tepat',
  'Jawab latihan konfigurasi N dan H dengan benar',
  'Selesaikan simulasi lalu jawab pertanyaannya',
  'Selesaikan 6 tahap simulasi lalu jawab pertanyaannya',
  'Selesaikan bagian a sampai d',
  'Jawab kesepuluh soal sampai nilaimu muncul',
  'Isi semua pertanyaan refleksi'
];
const canGo = i => i === 0 || state.done.slice(0, i).every(Boolean);

const chipNav = $('#chipNav');
slides.forEach((s, i) => {
  const b = document.createElement('button');
  b.className = 'chip';
  b.innerHTML = `<b>${String(i + 1).padStart(2, '0')}</b> ${s.dataset.name}`;
  b.addEventListener('click', () => go(i));
  chipNav.appendChild(b);
});
const dots = $('#dots');
slides.forEach(() => dots.appendChild(document.createElement('i')));

function renderNav() {
  const chips = $$('.chip', chipNav);
  chips.forEach((c, i) => {
    c.classList.toggle('active', i === state.cur);
    c.classList.toggle('done', state.done[i]);
    c.classList.toggle('locked', !canGo(i));
  });
  $$('i', dots).forEach((d, i) => { d.className = i === state.cur ? 'now' : (state.done[i] ? 'done' : ''); });
  $('#slideNo').textContent = `Slide ${state.cur + 1} / ${N}`;
  $('#prevBtn').disabled = state.cur === 0;
  const last = state.cur === N - 1;
  const nb = $('#nextBtn');
  nb.style.visibility = last ? 'hidden' : 'visible';
  nb.disabled = !state.done[state.cur];
  $('#lockNote').textContent = state.done[state.cur] ? '' : '🔒 ' + LOCK_MSG[state.cur];
  const pct = Math.round(state.done.filter(Boolean).length / N * 100);
  $('#progFill').style.width = pct + '%'; $('#progPct').textContent = pct + '%';
  $$('.progFill2').forEach(e => (e.style.width = pct + '%'));
  $$('.progPct2').forEach(e => (e.textContent = pct + '%'));
  const ac = chips[state.cur]; if (ac) ac.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
}
function go(i) {
  if (i < 0 || i >= N) return;
  if (!canGo(i)) { toast('🔒 Slide ini masih terkunci. ' + LOCK_MSG[firstUndone()] + '.'); return; }
  Voice.stop();
  slides.forEach((s, k) => s.classList.toggle('active', k === i));
  state.cur = i; renderNav();
  window.scrollTo({ top: 0, behavior: 'auto' });
  const hook = ENTER[i]; if (hook) hook();
}
const firstUndone = () => { const k = state.done.indexOf(false); return k < 0 ? N - 1 : k; };
function complete(i, msg) {
  if (state.done[i]) return;
  state.done[i] = true; renderNav();
  if (i < N - 1) toast(msg || '✅ Hebat! Slide berikutnya sudah terbuka. Tekan “Berikutnya →”.');
}
$('#prevBtn').addEventListener('click', () => go(state.cur - 1));
$('#nextBtn').addEventListener('click', () => {
  if (!state.done[state.cur]) { toast('🔒 ' + LOCK_MSG[state.cur] + ' dulu ya.'); return; }
  go(state.cur + 1);
});
const ENTER = {};

/* ---------------- Kirim hasil ke Google Spreadsheet ---------------- */
function collectResult() {
  const q = state.quiz || { nilai: '', benar: '', answers: [], result: [] };
  const val = id => ($('#' + id) ? $('#' + id).value.trim() : '');
  return {
    nama: state.student.name, kelas: state.student.kelas,
    nilai: q.nilai, benar: q.benar,
    pemantik: val('pemantikAns'), nh3: val('nh3Ans'), nh4: val('nh4Ans'), h3o: val('h3oAns'),
    soal: Array.from({ length: 10 }, (_, k) => ({ jawaban: (q.answers || [])[k] || '', status: (q.result || [])[k] ? 'Benar' : 'Salah' })),
    refleksi1: val('r1'), refleksi2: val('r2'), refleksi3: val('r3'),
    perangkat: navigator.userAgent.slice(0, 120)
  };
}
async function sendToSheet() {
  const box = $('#sheetStatus'), again = $('#resendBtn');
  if (!box) return;
  if (!SHEET_URL) {
    box.innerHTML = 'ℹ️ Media belum terhubung ke spreadsheet guru. Gunakan tombol <b>Unduh Hasil Belajar</b> untuk menyimpan jawabanmu.';
    return;
  }
  box.innerHTML = '⏳ Mengirim hasil belajarmu ke guru...';
  again.style.display = 'none';
  try {
    // text/plain agar tidak memicu preflight CORS; no-cors karena Apps Script mengalihkan respons
    await fetch(SHEET_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(collectResult()) });
    box.innerHTML = '✅ Hasil belajarmu sudah terkirim ke spreadsheet guru.';
  } catch (e) {
    box.innerHTML = '⚠️ Gagal mengirim (periksa koneksi internet). Tekan <b>Kirim Ulang ke Guru</b>.';
    again.style.display = '';
  }
}

/* ---------------- Pemeriksa jawaban esai bertahap ---------------- */
/* groups: [{re|fn, hint}], need: jumlah kelompok konsep minimum, req: indeks kelompok wajib */
function openQuestion({ ta, btn, fb, groups, need, req = [], minChars = 10, okHtml, model, onOk }) {
  let attempts = 0, solved = false;
  btn.addEventListener('click', () => {
    const raw = ta.value.trim();
    if (raw.length < minChars) {
      feedback(fb, 'bad', `<b>Jawaban terlalu singkat.</b>Tulis minimal ${minChars} karakter dengan kata-katamu sendiri (${raw.length}/${minChars}).`);
      return;
    }
    const txt = norm(raw);
    const hit = groups.map(g => testGroup(g, txt));
    const count = hit.filter(Boolean).length;
    const reqOk = req.every(k => hit[k]);
    if (count >= need && reqOk) {
      solved = true; ta.classList.remove('bad'); ta.classList.add('ok');
      feedback(fb, 'ok', `<b>✅ Jawabanmu sudah tepat!</b>${okHtml}`);
      if (onOk) onOk();
      return;
    }
    attempts++;
    ta.classList.add('bad'); ta.classList.remove('ok');
    const missing = groups.filter((g, k) => !hit[k] || (req.includes(k) && !hit[k]));
    let html = '<b>❌ Jawabanmu belum tepat.</b>';
    if (attempts === 1) html += `Alasannya: ${missing[0].hint}`;
    else if (attempts === 2) html += 'Alasannya, jawabanmu belum memuat hal berikut:<ul>' + missing.map(g => `<li>${g.hint}</li>`).join('') + '</ul>';
    else html += 'Perhatikan petunjuk berikut:<ul>' + missing.map(g => `<li>${g.hint}</li>`).join('') + `</ul><div class="callout gold" style="margin-top:8px"><b>Contoh jawaban yang tepat:</b> ${model}<br><i>Sekarang tulis ulang dengan kata-katamu sendiri, lalu periksa lagi.</i></div>`;
    feedback(fb, 'bad', html);
  });
  return { get solved() { return solved; } };
}

/* ---------------- Konfigurasi elektron ---------------- */
const ATOMS = {
  H: { Z: 1, name: 'Hidrogen' }, C: { Z: 6, name: 'Karbon' }, N: { Z: 7, name: 'Nitrogen' },
  O: { Z: 8, name: 'Oksigen' }, Na: { Z: 11, name: 'Natrium' }, Cl: { Z: 17, name: 'Klorin' }, K: { Z: 19, name: 'Kalium' }
};
const SHELL_NAMES = ['K', 'L', 'M', 'N'];
function shells(Z) {
  const out = []; let rest = Z;
  const caps = [2, 8, 8, 2];
  for (let i = 0; i < caps.length && rest > 0; i++) { const n = Math.min(caps[i], rest); out.push(n); rest -= n; }
  return out;
}
function subshells(Z) {
  const order = [['1s', 2], ['2s', 2], ['2p', 6], ['3s', 2], ['3p', 6], ['4s', 2]];
  const out = []; let rest = Z;
  for (const [n, c] of order) { if (rest <= 0) break; const k = Math.min(c, rest); out.push(n + k); rest -= k; }
  return out.join(' ');
}
function checkConfig(input, Z) {
  const raw = String(input || '').trim();
  if (!raw) return { ok: false, msg: 'Konfigurasinya belum diisi.' };
  const exp = shells(Z);
  if (/[spdf]/i.test(raw)) {
    const parts = [...raw.toLowerCase().matchAll(/(\d)\s*([spdf])\s*\^?\s*(\d+)/g)].map(m => m[1] + m[2] + m[3]);
    if (parts.join(' ') === subshells(Z)) return { ok: true };
    const sum = parts.reduce((a, p) => a + Number(p.slice(2)), 0);
    if (sum !== Z) return { ok: false, msg: `Jumlah elektron pada notasimu ${sum}, padahal nomor atomnya ${Z}. Atom netral memiliki elektron sebanyak nomor atomnya.` };
    return { ok: false, msg: 'Urutan pengisian subkulit belum tepat. Isi berurutan 1s → 2s → 2p → 3s → 3p → 4s; subkulit s maksimal 2 elektron, p maksimal 6.' };
  }
  const nums = (raw.match(/\d+/g) || []).map(Number);
  const sum = nums.reduce((a, b) => a + b, 0);
  if (nums.join(' ') === exp.join(' ')) return { ok: true };
  if (sum !== Z) return { ok: false, msg: `Jumlah elektron pada konfigurasimu ${sum}, padahal nomor atomnya ${Z}. Atom netral memiliki elektron sebanyak nomor atomnya.` };
  if (nums[0] > 2) return { ok: false, msg: 'Kulit K (n = 1) hanya dapat menampung maksimal 2 elektron (2n² = 2).' };
  if (nums.length > 1 && nums[0] < 2) return { ok: false, msg: 'Kulit K harus terisi penuh (2 elektron) sebelum elektron mengisi kulit L.' };
  if (nums.some(n => n > 8)) return { ok: false, msg: 'Kulit terluar paling banyak berisi 8 elektron. Periksa lagi pembagian elektronmu.' };
  return { ok: false, msg: 'Pembagian elektron per kulit belum tepat. Isi kulit dalam sampai penuh dulu (K = 2, L = 8), baru kulit berikutnya.' };
}
function checkValence(input, Z) {
  const exp = shells(Z).slice(-1)[0];
  const v = (String(input).match(/\d+/) || [])[0];
  if (v === undefined) return { ok: false, msg: 'Elektron valensinya belum diisi.' };
  if (Number(v) === exp) return { ok: true };
  if (Number(v) === Z) return { ok: false, msg: `${v} adalah jumlah seluruh elektron. Elektron valensi hanya elektron pada kulit terluar.` };
  return { ok: false, msg: 'Elektron valensi = jumlah elektron pada kulit terluar, yaitu angka terakhir pada konfigurasimu.' };
}
function buildExercise(container, syms) {
  container.innerHTML = syms.map(s => `
    <div class="ex-atom" data-sym="${s}">
      <div class="z"><div class="sym ${s === 'H' ? 'h' : s === 'O' ? 'o' : ''}">${s}</div><div><b>${ATOMS[s].name} (${s})</b><small>Nomor atom (Z) = ${ATOMS[s].Z}</small></div></div>
      <div class="field"><label>Konfigurasi elektron ${s}</label><input class="input cfg" placeholder="contoh: 2 8 1"></div>
      <div class="field" style="margin-bottom:0"><label>Elektron valensi ${s}</label><input class="input val" inputmode="numeric" placeholder="angka"></div>
    </div>`).join('');
}
function gradeExercise(container, fbEl) {
  const errs = []; let allOk = true;
  $$('.ex-atom', container).forEach(box => {
    const s = box.dataset.sym, Z = ATOMS[s].Z;
    const ci = $('.cfg', box), vi = $('.val', box);
    const c = checkConfig(ci.value, Z), v = checkValence(vi.value, Z);
    ci.classList.toggle('ok', c.ok); ci.classList.toggle('bad', !c.ok);
    vi.classList.toggle('ok', v.ok); vi.classList.toggle('bad', !v.ok);
    if (!c.ok) errs.push(`<li><b>Konfigurasi ${s}:</b> ${c.msg}</li>`);
    if (!v.ok) errs.push(`<li><b>Elektron valensi ${s}:</b> ${v.msg}</li>`);
    if (!(c.ok && v.ok)) allOk = false;
  });
  if (!allOk) feedback(fbEl, 'bad', '<b>❌ Masih ada yang kurang tepat. Coba perhatikan petunjuk ini:</b><ul>' + errs.join('') + '</ul>');
  return allOk;
}

/* ---------------- Model atom Bohr (elektron berputar) ---------------- */
function bohrSVG(sym, opts = {}) {
  const Z = ATOMS[sym].Z, sh = shells(Z);
  const svg = svgEl('svg', { viewBox: '-170 -170 340 340', role: 'img', 'aria-label': `Model atom ${ATOMS[sym].name}` });
  const defs = svgEl('defs', {}, svg);
  const g = svgEl('radialGradient', { id: 'nuc' + sym + (opts.id || ''), cx: '35%', cy: '30%' }, defs);
  svgEl('stop', { offset: 0, 'stop-color': sym === 'O' ? '#ff9fa8' : sym === 'H' ? '#ffffff' : '#8fb4ff' }, g);
  svgEl('stop', { offset: 1, 'stop-color': sym === 'O' ? '#c92f45' : sym === 'H' ? '#8fd9c5' : '#1b3f9e' }, g);
  const radii = [52, 82, 112, 142];
  sh.forEach((n, i) => {
    const r = radii[i], last = i === sh.length - 1;
    svgEl('circle', { r, fill: 'none', stroke: last ? 'rgba(246,198,78,.55)' : 'rgba(143,180,255,.45)', 'stroke-width': 1.4, 'stroke-dasharray': '4 5' }, svg);
    const t = svgEl('text', { x: r * Math.cos(-0.75) + 6, y: r * Math.sin(-0.75) - 4, fill: last ? '#f6c64e' : '#a9c1f5', 'font-size': 13, 'font-weight': 700 }, svg);
    t.textContent = `${SHELL_NAMES[i]}`;
    const rot = svgEl('g', { class: 'orbit-spin' }, svg);
    rot.style.animationDuration = (7 + i * 4) + 's';
    if (i % 2) rot.style.animationDirection = 'reverse';
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 - Math.PI / 2;
      svgEl('circle', { cx: (r * Math.cos(a)).toFixed(2), cy: (r * Math.sin(a)).toFixed(2), r: 6.5, fill: last ? '#f6c64e' : '#dbe9ff', stroke: last ? '#fff3c4' : '#8fb4ff', 'stroke-width': 1 }, rot);
    }
  });
  svgEl('circle', { r: 30, fill: `url(#nuc${sym}${opts.id || ''})` }, svg);
  const tx = svgEl('text', { y: 8, 'text-anchor': 'middle', fill: sym === 'H' ? '#0c1a3d' : '#fff', 'font-size': 24, 'font-weight': 800 }, svg);
  tx.textContent = sym;
  return svg;
}
function bohrInfoHTML(sym) {
  const Z = ATOMS[sym].Z, sh = shells(Z);
  return `<div class="big">${ATOMS[sym].name} (${sym})</div>
    <div>Nomor atom Z = <b>${Z}</b> → ${Z} elektron</div>
    <div class="cfg" style="margin:6px 0 10px">Konfigurasi: ${sh.join(' ')}</div>
    <table class="shell-table"><thead><tr><th>Kulit</th><th>Isi elektron</th><th>Maks.</th></tr></thead><tbody>
    ${sh.map((n, i) => `<tr><td>${SHELL_NAMES[i]}${i === sh.length - 1 ? ' (terluar)' : ''}</td><td class="num">${n} elektron</td><td>${[2, 8, 18, 32][i]}</td></tr>`).join('')}
    </tbody></table>
    <div class="callout blue" style="margin-top:10px">Elektron valensi ${sym} = <b>${sh[sh.length - 1]}</b> (kulit ${SHELL_NAMES[sh.length - 1]})</div>
    <div class="legend"><span><i style="background:#dbe9ff;border:1px solid #8fb4ff"></i>elektron kulit dalam</span><span><i style="background:#f6c64e"></i>elektron valensi</span></div>`;
}

/* ---------------- Elemen SVG simulasi ---------------- */
function simDefs(svg) {
  const d = svgEl('defs', {}, svg);
  const mk = (id, a, b) => { const g = svgEl('radialGradient', { id, cx: '35%', cy: '30%' }, d); svgEl('stop', { offset: 0, 'stop-color': a }, g); svgEl('stop', { offset: 1, 'stop-color': b }, g); };
  mk(svg.id + 'gN', '#a6c4ff', '#3a72f0');
  mk(svg.id + 'gH', '#ffffff', '#bdeedd');
  mk(svg.id + 'gO', '#ffb0b8', '#d8384c');
  const m = svgEl('marker', { id: svg.id + 'arr', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, d);
  svgEl('path', { d: 'M0 0 L10 5 L0 10 z', fill: '#f6c64e' }, m);
}
function atomG(svg, parent, sym, r, kind) {
  const g = svgEl('g', {}, parent);
  const fill = kind === 'hplus' ? 'rgba(255,143,184,.08)' : `url(#${svg.id}g${sym === 'H' ? 'H' : sym})`;
  const c = svgEl('circle', { r, fill }, g);
  if (kind === 'hplus') { c.setAttribute('stroke', '#ff8fb8'); c.setAttribute('stroke-width', 2.5); c.setAttribute('stroke-dasharray', '6 5'); }
  const t = svgEl('text', { y: r > 30 ? 10 : 7, 'text-anchor': 'middle', 'font-size': r > 30 ? 30 : 20, 'font-weight': 800, fill: kind === 'hplus' ? '#ff8fb8' : (sym === 'H' ? '#0c1a3d' : '#fff') }, g);
  t.textContent = kind === 'hplus' ? 'H⁺' : sym;
  g._circle = c; g._text = t;
  return g;
}
function electron(parent, color, x, y, cls = 'tr') {
  const e = svgEl('circle', { r: 7, fill: color, stroke: 'rgba(255,255,255,.7)', 'stroke-width': 1.2, class: cls }, parent);
  setPos(e, x, y); return e;
}
function label(parent, x, y, txt, opt = {}) {
  const t = svgEl('text', { x, y, fill: opt.color || '#cfe0ff', 'font-size': opt.size || 15, 'text-anchor': opt.anchor || 'middle', 'font-weight': opt.weight || 600, class: 'fadeT' }, parent);
  t.textContent = txt; t.style.transition = 'opacity .6s'; t.style.opacity = opt.hidden ? 0 : 1; return t;
}
function line(parent, x1, y1, x2, y2, color = '#dbe6ff', w = 5) {
  const l = svgEl('line', { x1, y1, x2, y2, stroke: color, 'stroke-width': w, 'stroke-linecap': 'round' }, parent);
  l.style.transition = 'opacity .6s'; l.style.opacity = 0; return l;
}
const C = { nE: '#4fb3ff', hE: '#ff8fb8', oE: '#ffb0b8', lp: '#f6c64e' };

/* Seret & lepas (pointer events: mouse + sentuh) */
function enableDrag(svg, g, onDrop) {
  g.classList.add('drag');
  let start = null;
  const pt = ev => { const p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
  g.addEventListener('pointerdown', ev => {
    if (g._locked) return;
    ev.preventDefault();
    svg.appendChild(g);
    try { g.setPointerCapture(ev.pointerId); } catch (e) {}
    const p = pt(ev); start = { dx: p.x - g._x, dy: p.y - g._y };
    g.classList.remove('returning', 'snapping'); g.classList.add('dragging');
  });
  g.addEventListener('pointermove', ev => { if (!start) return; const p = pt(ev); setPos(g, p.x - start.dx, p.y - start.dy); });
  const end = () => { if (!start) return; start = null; g.classList.remove('dragging'); onDrop(g._x, g._y); };
  g.addEventListener('pointerup', end); g.addEventListener('pointercancel', end);
}
function bounceBack(g, panel) {
  g.classList.add('returning'); setPos(g, g._home[0], g._home[1]);
  if (panel) { panel.classList.remove('shake'); void panel.offsetWidth; panel.classList.add('shake'); }
  setTimeout(() => g.classList.remove('returning'), 700);
}
function snapTo(g, x, y) { g.classList.add('snapping'); setPos(g, x, y); g._locked = true; g.classList.remove('drag'); setTimeout(() => g.classList.remove('snapping'), 400); }
function nearestSlot(slots, x, y, max = 62) {
  let best = null, bd = 1e9;
  for (const s of slots) { const d = Math.hypot(s.x - x, s.y - y); if (d < bd) { bd = d; best = s; } }
  return bd <= max ? best : null;
}
function flashSlot(s) { s.el.classList.remove('wrong'); void s.el.getBBox(); s.el.classList.add('wrong'); setTimeout(() => s.el.classList.remove('wrong'), 600); }

/* =========================================================
   SLIDE 1 — Beranda
   ========================================================= */
$('#startBtn').addEventListener('click', () => { complete(0, '🚀 Selamat datang! Baca petunjuk penggunaan dulu ya.'); go(1); });
$('#seeSimBtn').addEventListener('click', () => {
  if (canGo(4)) go(4);
  else toast('🔒 Simulasi terbuka setelah kamu menyelesaikan slide sebelumnya. Mulai dari “Mulai Belajar” ya!');
});

/* =========================================================
   SLIDE 2 — Cara belajar (langkah per nomor) + data siswa
   ========================================================= */
(function howto() {
  const STEPS = [
    ['🧭', 'Ikuti alur slide secara berurutan', 'Media ini terdiri atas 9 slide. Setiap slide <b>terkunci 🔒</b> dan baru terbuka setelah kamu menyelesaikan tugas di slide sebelumnya. Lihat petunjuk kecil di bagian bawah layar untuk mengetahui tugas yang harus diselesaikan.'],
    ['🪪', 'Isi data dirimu', 'Setelah membaca semua langkah, isi <b>nama</b> dan <b>kelas</b> pada kotak di bawah. Namamu akan muncul pada hasil belajar di akhir.'],
    ['📖', 'Baca materi dengan teliti', 'Bacalah capaian, tujuan, dan materi pada setiap slide. Materi disusun dari buku kimia yang relevan, dan <b>sumbernya tercantum di bagian paling bawah setiap slide</b>.'],
    ['✍️', 'Jawab dengan kata-katamu sendiri', 'Beberapa slide berisi pertanyaan. Jawabanmu akan diperiksa. Jika <b>kurang tepat</b>, kamu akan mendapat alasan dan petunjuk. Perbaiki jawabanmu sampai <b>cukup benar</b> agar slide berikutnya terbuka.'],
    ['🧪', 'Gerakkan simulasinya', 'Pada simulasi, kamu akan <b>mengklik</b> dan <b>menyeret</b> atom. Jika atom diseret ke arah yang salah, atom akan <b>terpental kembali</b>. Perhatikan elektron mana yang masih tunggal dan mana yang sudah berpasangan.'],
    ['🔊', 'Dengarkan audio penjelasan', 'Setiap tahap simulasi memiliki <b>audio penjelasan otomatis</b>. Nyalakan suara perangkatmu. Tombol 🔊 di pojok kanan atas dapat menyalakan atau mematikan audio, dan tombol 🔊 biru memutar ulang penjelasan.'],
    ['🏁', 'Uji pemahaman & refleksi', 'Di akhir ada <b>10 soal esai</b> (nilaimu langsung muncul setelah semua soal dijawab) dan <b>pertanyaan refleksi wajib</b>. Setelah semuanya selesai, kamu akan melihat hasil belajarmu.']
  ];
  let i = 0, seen = new Set([0]), timer = null, finished = false;
  const READ_MS = 3000;
  const dotsBox = $('#howDots');
  dotsBox.innerHTML = STEPS.map(() => '<i></i>').join('');
  function render() {
    const [ico, t, p] = STEPS[i];
    $('#howNum').innerHTML = `${i + 1}<small> / ${STEPS.length}</small>`;
    $('#howIco').textContent = ico; $('#howTitle').textContent = t; $('#howText').innerHTML = p;
    $$('i', dotsBox).forEach((d, k) => { d.className = k === i ? 'now' : (seen.has(k) ? 'seen' : ''); });
    $('#howPrev').disabled = i === 0;
    const nb = $('#howNext'), fill = $('.fill', nb), lbl = $('.lbl', nb);
    const isLast = i === STEPS.length - 1;
    lbl.textContent = isLast ? (finished ? '✓ Semua langkah sudah dibaca' : 'Saya sudah membaca semua langkah ✓') : 'Lanjut →';
    clearTimeout(timer);
    fill.style.transition = 'none'; fill.style.width = '0';
    if (readSet.has(i)) { nb.disabled = isLast && finished; return; }
    nb.disabled = true;
    void fill.offsetWidth;
    fill.style.transition = `width ${READ_MS}ms linear`; fill.style.width = '100%';
    const k = i;
    timer = setTimeout(() => { readSet.add(k); if (i === k) { nb.disabled = false; fill.style.transition = 'none'; fill.style.width = '0'; } }, READ_MS);
  }
  const readSet = new Set();
  $('#howPrev').addEventListener('click', () => { if (i > 0) { i--; render(); } });
  $('#howNext').addEventListener('click', () => {
    if (i < STEPS.length - 1) { i++; seen.add(i); render(); }
    else if (!finished) {
      finished = true; render();
      $('#studentCard').classList.remove('is-locked');
      $('#stName').focus({ preventScroll: true });
      $('#studentCard').scrollIntoView({ behavior: 'smooth', block: 'center' });
      toast('👍 Sekarang isi data dirimu.');
    }
  });
  ENTER[1] = () => { if (!finished) render(); };
  render();

  $('#saveStudent').addEventListener('click', () => {
    const name = $('#stName').value.trim(), kelas = $('#stClass').value.trim();
    const fb = $('#studentFb');
    $('#stName').classList.toggle('bad', name.length < 3);
    $('#stClass').classList.toggle('bad', kelas.length < 1);
    if (name.length < 3) return feedback(fb, 'bad', '<b>Nama belum diisi.</b>Tulis nama lengkapmu (minimal 3 huruf).');
    if (!kelas) return feedback(fb, 'bad', '<b>Kelas belum diisi.</b>Contoh penulisan: XI MIPA 2.');
    state.student = { name, kelas };
    $('#stName').classList.add('ok'); $('#stClass').classList.add('ok');
    feedback(fb, 'ok', `<b>✅ Data tersimpan.</b>Selamat belajar, ${esc(name)} (${esc(kelas)})! Tekan “Berikutnya →” untuk melihat tujuan pembelajaran.`);
    complete(1, `✅ Halo ${esc(name)}! Slide Tujuan Pembelajaran sudah terbuka.`);
  });
})();

/* =========================================================
   SLIDE 3 — Pertanyaan pemantik
   ========================================================= */
openQuestion({
  ta: $('#pemantikAns'), btn: $('#pemantikBtn'), fb: $('#pemantikFb'), minChars: 10, need: 2,
  groups: [
    { re: /pupuk|urea|\bza\b|amonium (sulfat|nitrat|fosfat|klorida)|fertili/, hint: 'jawabanmu belum menyebutkan produk utama yang dibuat dari amonia untuk pertanian. Pikirkan apa yang ditaburkan petani agar tanaman tumbuh subur.' },
    { re: /nitrogen|unsur n\b|unsur hara|nutrisi|\bhara\b|zat makanan|nutrien/, hint: 'jawabanmu belum menjelaskan unsur penting apa yang disediakan amonia bagi tanaman (lihat rumus NH₃: unsur apa selain H?).' },
    { re: /tanam|tumbuh|subur|panen|daun|hasil pertanian|produktiv|klorofil|protein|tumbuhan/, hint: 'jawabanmu belum menjelaskan dampaknya bagi tanaman (misalnya pertumbuhan, kesuburan, atau hasil panen).' }
  ],
  okHtml: 'Alasannya: amonia (NH₃) adalah <b>bahan baku utama pupuk nitrogen</b> seperti urea, amonium sulfat (ZA), dan amonium nitrat, bahkan dapat langsung disuntikkan ke tanah sebagai amonia anhidrat. Nitrogen dibutuhkan tanaman untuk membentuk <b>protein, asam amino, dan klorofil</b>, sehingga tanaman tumbuh subur dan hasil panen meningkat. Sebagian besar amonia yang diproduksi di dunia dipakai untuk pupuk.',
  model: 'Amonia digunakan sebagai bahan baku pupuk nitrogen (misalnya urea dan ZA) yang menyediakan unsur hara nitrogen sehingga tanaman tumbuh subur dan hasil panen meningkat.',
  onOk: () => complete(2, '✅ Tepat! Slide Konsep Dasar sudah terbuka.')
});

/* =========================================================
   SLIDE 4 — Konsep dasar: model Bohr + latihan N & H
   ========================================================= */
(function konsep() {
  const picker = $('#bohrPicker');
  const list = ['H', 'C', 'N', 'O', 'Na', 'Cl', 'K'];
  picker.innerHTML = list.map(s => `<button data-s="${s}">${s} <small style="opacity:.7">(${ATOMS[s].Z})</small></button>`).join('');
  function showAtom(s) {
    $$('button', picker).forEach(b => b.classList.toggle('on', b.dataset.s === s));
    const st = $('#bohrStage'); st.innerHTML = ''; st.appendChild(bohrSVG(s, { id: 'v' }));
    $('#bohrInfo').innerHTML = bohrInfoHTML(s);
  }
  picker.addEventListener('click', e => { const b = e.target.closest('button'); if (b) showAtom(b.dataset.s); });
  showAtom('N');

  buildExercise($('#ex4'), ['N', 'H']);
  $('#ex4Btn').addEventListener('click', () => {
    const fb = $('#ex4Fb');
    if (gradeExercise($('#ex4'), fb)) {
      feedback(fb, 'ok', '<b>✅ Semua benar!</b>Nitrogen (Z = 7): <b>2 5</b> → elektron valensi <b>5</b>. Hidrogen (Z = 1): <b>1</b> → elektron valensi <b>1</b>. Artinya N membutuhkan 3 elektron lagi untuk oktet, sedangkan H membutuhkan 1 elektron lagi untuk duplet. Ini yang akan kamu lihat pada simulasi NH₃!');
      complete(3, '✅ Hebat! Simulasi NH₃ sudah terbuka.');
    }
  });
})();

/* =========================================================
   SLIDE 5 — Simulasi bertahap NH3
   ========================================================= */
const S5 = (function nh3() {
  const svg = $('#nh3Svg');
  const STAGES = [
    { status: 'Elektron valensi', em: 'N: 5 elektron valensi • H: 1 elektron valensi', cap: 'Konfigurasi N (Z = 7) = 2 5 dan H (Z = 1) = 1. Atom N membutuhkan 3 elektron lagi agar oktet, sedangkan tiap atom H membutuhkan 1 elektron lagi agar duplet.' },
    { status: 'Atom H mendekat', em: 'Tiga atom H mendekati atom N', cap: 'Tiga elektron tunggal N akan berpasangan dengan elektron tunggal masing-masing atom H. Dua elektron N lainnya sudah berpasangan sejak awal.' },
    { status: 'Pemakaian bersama', em: '3 pasangan elektron ikatan terbentuk', cap: 'Setiap pasangan terdiri atas 1 elektron dari N (biru) dan 1 elektron dari H (merah muda) yang dipakai bersama oleh kedua atom.' },
    { status: 'NH₃ terbentuk', em: '3 ikatan kovalen N—H + 1 pasangan elektron bebas', cap: 'NH₃ terbentuk: N mencapai oktet (8 e⁻) dan tiap H mencapai duplet (2 e⁻). Elektron di tiap pasangan ikatan berasal dari dua atom.' }
  ];
  let s = 0, E = {}, reached = 0;
  const NY = -20;
  function build() {
    svg.innerHTML = ''; simDefs(svg);
    E.bonds = [line(svg, -42, NY, -134, NY), line(svg, 42, NY, 134, NY), line(svg, 0, NY + 42, 0, NY + 134)];
    E.N = atomG(svg, svg, 'N', 42); setPos(E.N, 0, NY);
    E.H = [0, 1, 2].map(() => { const g = atomG(svg, svg, 'H', 26); g.classList.add('tr'); return g; });
    E.nE = [0, 1, 2, 3, 4].map(() => electron(svg, C.nE, 0, 0));
    E.hE = [0, 1, 2].map(() => electron(svg, C.hE, 0, 0));
    E.lpLbl = label(svg, 120, NY - 120, 'pasangan elektron bebas', { color: '#f6c64e', hidden: true });
    E.lpLine = svgEl('path', { d: `M14 ${NY - 66} L60 ${NY - 112} L60 ${NY - 112}`, stroke: '#f6c64e', fill: 'none', 'stroke-width': 1.5 }, svg); E.lpLine.style.transition = 'opacity .6s';
    E.oktet = label(svg, 150, NY - 70, 'oktet N (8 e⁻)', { hidden: true, size: 16 });
    E.duet = [label(svg, -160, NY + 50, 'duet (2 e⁻)', { hidden: true }), label(svg, 160, NY + 50, 'duet (2 e⁻)', { hidden: true }), label(svg, 70, NY + 150, 'duet (2 e⁻)', { hidden: true, anchor: 'start' })];
    E.title = label(svg, 250, NY - 140, 'NH₃', { hidden: true, size: 40, weight: 800, color: '#fff' });
    E.pairLbl = label(svg, 0, 172, 'pasangan elektron ikatan = 1 e⁻ dari N + 1 e⁻ dari H', { hidden: true, size: 14, color: '#5fd4ff' });
    E.valLbl = [label(svg, 0, NY + 100, 'N: 2 5 → 5 e⁻ valensi', { size: 14, color: '#4fb3ff', hidden: true }), label(svg, -250, NY - 45, 'H: 1 e⁻', { size: 14, color: '#ff8fb8', hidden: true })];
    // posisi awal tanpa animasi
    svg.classList.remove('sim-anim'); place(0); void svg.getBBox(); svg.classList.add('sim-anim');
  }
  function place(k) {
    const lp = [[-9, NY - 58], [9, NY - 58]];
    let H, nS, hS;
    if (k === 0) { H = [[-250, NY], [250, NY], [0, NY + 170]]; nS = [[-58, NY], [58, NY], [0, NY + 58]]; hS = [[-216, NY], [216, NY], [0, NY + 136]]; }
    else if (k === 1) { H = [[-180, NY], [180, NY], [0, NY + 150]]; nS = [[-58, NY], [58, NY], [0, NY + 58]]; hS = [[-146, NY], [146, NY], [0, NY + 116]]; }
    else { H = [[-160, NY], [160, NY], [0, NY + 160]]; nS = [[-95, NY - 9], [95, NY - 9], [-9, NY + 96]]; hS = [[-95, NY + 9], [95, NY + 9], [9, NY + 96]]; }
    E.H.forEach((g, i) => setPos(g, ...H[i]));
    [lp[0], lp[1], ...nS].forEach((p, i) => setPos(E.nE[i], ...p));
    E.hE.forEach((e, i) => setPos(e, ...hS[i]));
    E.bonds.forEach(b => (b.style.opacity = k === 3 ? 1 : 0));
    [E.lpLbl, E.lpLine].forEach(x => (x.style.opacity = k >= 2 ? 1 : 0));
    E.oktet.style.opacity = E.title.style.opacity = k === 3 ? 1 : 0;
    E.duet.forEach(d => (d.style.opacity = k === 3 ? 1 : 0));
    E.pairLbl.style.opacity = k === 2 ? 1 : 0;
    E.valLbl.forEach(v => (v.style.opacity = k === 0 ? 1 : 0));
    [...E.nE, ...E.hE].forEach(e => (e.style.opacity = k === 3 ? 0.85 : 1));
  }
  function render(speak = true) {
    place(s);
    $('#nh3Pill').textContent = `Tahap ${s + 1}/4`;
    $('#nh3Bars').innerHTML = STAGES.map((_, i) => `<i class="${i <= s ? 'on' : ''}"></i>`).join('');
    $('#nh3Status').textContent = STAGES[s].status;
    $('#nh3Em').textContent = STAGES[s].em;
    $('#nh3Cap').textContent = STAGES[s].cap;
    const narr = `Tahap ${s + 1}. ${STAGES[s].em}. ${STAGES[s].cap}`;
    $('#nh3Narr').textContent = narr;
    $('#nh3Prev').disabled = s === 0; $('#nh3Next').disabled = s === 3;
    reached = Math.max(reached, s);
    if (reached === 3) $('#nh3Q').classList.remove('is-locked');
    if (speak) Voice.say(narr, $('#nh3Spk'));
  }
  $('#nh3Next').addEventListener('click', () => { if (s < 3) { s++; render(); } });
  $('#nh3Prev').addEventListener('click', () => { if (s > 0) { s--; render(); } });
  $('#nh3Reset').addEventListener('click', () => { s = 0; build(); render(); });
  $('#nh3Spk').addEventListener('click', () => Voice.say($('#nh3Narr').textContent, $('#nh3Spk')));
  const ans = $('#nh3Ans');
  ans.addEventListener('input', () => { const n = ans.value.trim().length; $('#nh3Count').textContent = `Tulis minimal 10 karakter (${Math.min(n, 10)}/10).`; });
  openQuestion({
    ta: ans, btn: $('#nh3Check'), fb: $('#nh3Fb'), minChars: 10, need: 2, req: [0],
    groups: [
      { re: /elektron/, hint: 'jawabanmu belum menyebut <b>elektron</b>, padahal yang terlihat bergerak dan berpasangan pada simulasi adalah elektron.' },
      { re: /bersama|berbagi|patungan|dipakai (oleh )?(kedua|dua)|sharing|pasangan elektron ikatan|\bpei\b|kovalen/, hint: 'jelaskan bagaimana elektron itu digunakan: apakah dipindahkan, atau <b>dipakai bersama</b> oleh N dan H?' },
      { re: /tiga|\b3\b|pasangan elektron bebas|\bpeb\b|oktet|duplet|duet|stabil|masing-masing|kedua atom|dari n dan( dari)? h|n dan h/, hint: 'sebutkan hasilnya: berapa ikatan N—H yang terbentuk, atau dari atom mana elektron tiap pasangan berasal, atau keadaan stabil (oktet/duplet).' }
    ],
    okHtml: 'Pada NH₃, atom N (5 elektron valensi) memakai bersama 3 elektron tunggalnya dengan elektron dari 3 atom H. Terbentuk <b>3 ikatan kovalen N—H</b>; setiap pasangan elektron ikatan berasal dari <b>kedua atom</b> (1 dari N, 1 dari H). N mencapai oktet, setiap H mencapai duplet, dan N masih memiliki <b>1 pasangan elektron bebas</b>.',
    model: 'NH₃ terbentuk karena atom N dan tiga atom H memakai bersama pasangan elektron. Setiap ikatan N—H berisi 1 elektron dari N dan 1 elektron dari H, sehingga N oktet, H duplet, dan N masih punya 1 pasangan elektron bebas.',
    onOk: () => complete(4, '✅ Bagus! Simulasi NH₄⁺ sudah terbuka.')
  });
  build(); render(false);
  ENTER[4] = () => { if (!S5.started) { S5.started = true; render(true); } };
  return { started: false };
})();

/* =========================================================
   SLIDE 6 — Simulasi interaktif NH4+ (siswa menggerakkan)
   ========================================================= */
(function nh4() {
  const svg = $('#nh4Svg'), panel = svg.closest('.sim-panel');
  const STEPS = [
    { chip: '1. Konfigurasi N', title: 'Konfigurasi elektron atom N',
      narr: 'Tahap 1. Konfigurasi elektron atom N. Nitrogen memiliki nomor atom 7. Klik atom N untuk melihat susunan elektronnya pada kulit K dan L.',
      ok: 'Bagus! Konfigurasi nitrogen adalah 2 5: dua elektron di kulit K dan lima elektron di kulit L.' },
    { chip: '2. Elektron valensi', title: 'Tandai elektron valensi N',
      narr: 'Tahap 2. Elektron valensi. Elektron pada kulit terluar disebut elektron valensi. Klik kelima elektron pada kulit L satu per satu.',
      ok: 'Tepat! Nitrogen memiliki 5 elektron valensi: satu pasang elektron dan tiga elektron tunggal.' },
    { chip: '3. NH₃', title: 'Bentuk molekul NH₃',
      narr: 'Tahap 3. Membentuk NH₃. Seret ketiga atom hidrogen ke dekat elektron tunggal nitrogen. Ingat, elektron yang sudah berpasangan tidak dipakai untuk ikatan kovalen biasa.',
      ok: 'NH₃ terbentuk! Ada tiga ikatan kovalen N—H, dan nitrogen masih memiliki satu pasangan elektron bebas.' },
    { chip: '4. Pasangan bebas', title: 'Temukan pasangan elektron bebas',
      narr: 'Tahap 4. Temukan pasangan elektron bebas. Klik pasangan elektron pada atom N yang tidak dipakai untuk berikatan.',
      ok: 'Benar, itulah pasangan elektron bebas. Pasangan inilah yang nanti akan didonorkan.' },
    { chip: '5. Donasi ke H⁺', title: 'Hadirnya ion H⁺',
      narr: 'Tahap 5. Hadirnya ion H⁺. Ion H⁺ tidak memiliki elektron, orbital 1s-nya kosong. Seret ion H⁺ ke arah pasangan elektron bebas nitrogen.',
      ok: 'Pasangan elektron bebas nitrogen kini dipakai bersama dengan H⁺. Perhatikan panahnya: kedua elektron berasal dari nitrogen.' },
    { chip: '6. NH₄⁺', title: 'Tentukan donor & akseptor',
      narr: 'Tahap 6. Tentukan donor dan akseptor pasangan elektron pada kotak di bawah simulasi, lalu tekan Periksa.',
      ok: 'Hebat! Nitrogen sebagai donor dan H⁺ sebagai akseptor. Terbentuklah ikatan kovalen koordinasi pada ion amonium, NH₄⁺. Setelah terbentuk, keempat ikatan N—H identik.' }
  ];
  let step = 0, doneSteps = new Set(), E = {}, timers = [], simDone = false;
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  const track = $('#nh4Track');
  track.innerHTML = STEPS.map((s, i) => `${i ? '<span class="arr">→</span>' : ''}<button data-i="${i}">${s.chip}</button>`).join('');
  track.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || b.disabled) return;
    const i = +b.dataset.i;
    // klik tahap → audio otomatis menjelaskan tahap tsb
    const t = doneSteps.has(i) && i !== step ? STEPS[i].ok : STEPS[i].narr;
    $('#nh4Narr').textContent = t; Voice.say(t, $('#nh4Spk'));
  });
  $('#nh4Spk').addEventListener('click', () => Voice.say($('#nh4Narr').textContent, $('#nh4Spk')));

  function setStep(i, speak = true) {
    step = i;
    $$('button', track).forEach((b, k) => { b.className = k === i ? 'now' : (doneSteps.has(k) ? 'done' : ''); b.disabled = k > i && !doneSteps.has(k); });
    $('#nh4Pill').textContent = `Tahap ${i + 1}/6`;
    $('#nh4StepTag').textContent = `Tahap ${i + 1} dari 6`;
    $('#nh4StepTitle').textContent = STEPS[i].title;
    $('#nh4Narr').textContent = STEPS[i].narr;
    if (speak) Voice.say(STEPS[i].narr, $('#nh4Spk'));
    ENTERSTEP[i] && ENTERSTEP[i]();
  }
  function finishStep(i, em, cap) {
    doneSteps.add(i);
    $('#nh4Em').textContent = em; $('#nh4Cap').textContent = cap || '';
    $('#nh4Narr').textContent = STEPS[i].ok;
    Voice.say(STEPS[i].ok, $('#nh4Spk'));
    $$('button', track)[i].className = 'done';
    if (i < 5) later(() => setStep(i + 1), Math.min(4500, Math.max(2600, STEPS[i].ok.length * 40)));
  }

  const NY = 10;
  const LP = [[-9, NY - 58], [9, NY - 58]];
  const SLOTS_POS = { left: [-150, NY], right: [150, NY], bottom: [0, NY + 150], top: [0, NY - 150] };
  function build() {
    timers.forEach(clearTimeout); timers = [];
    svg.innerHTML = ''; simDefs(svg);
    E = { slots: [], placedH: 0 };
    E.bondL = svgEl('g', {}, svg);
    E.bonds = {
      left: line(E.bondL, -42, NY, -124, NY), right: line(E.bondL, 42, NY, 124, NY),
      bottom: line(E.bondL, 0, NY + 42, 0, NY + 124), top: line(E.bondL, 0, NY - 42, 0, NY - 124, '#f6c64e', 6)
    };
    E.slotL = svgEl('g', {}, svg);
    for (const k in SLOTS_POS) {
      const [x, y] = SLOTS_POS[k];
      const el = svgEl('circle', { cx: x, cy: y, r: 34, class: 'slot' }, E.slotL);
      el.style.opacity = 0; el.style.transition = 'opacity .4s';
      E.slots.push({ key: k, x, y, el, used: false });
    }
    E.ringK = svgEl('circle', { cx: 0, cy: NY, r: 64, fill: 'none', stroke: 'rgba(143,180,255,.5)', 'stroke-dasharray': '4 6' }, svg);
    E.ringL = svgEl('circle', { cx: 0, cy: NY, r: 104, fill: 'none', stroke: 'rgba(246,198,78,.55)', 'stroke-dasharray': '4 6' }, svg);
    E.ringTxt = [label(svg, 52, NY - 52, 'K = 2', { size: 13, color: '#a9c1f5', anchor: 'start' }), label(svg, 82, NY - 86, 'L = 5', { size: 13, color: '#f6c64e', anchor: 'start' })];
    [E.ringK, E.ringL].forEach(r => { r.style.opacity = 0; r.style.transition = 'opacity .6s'; });
    E.ringTxt.forEach(t => (t.style.opacity = 0));
    E.N = atomG(svg, svg, 'N', 42); setPos(E.N, 0, NY); E.N.classList.add('clickable');
    E.clickMe = label(svg, 0, NY - 62, '👆 Klik atom N', { color: '#f6c64e', size: 15 }); E.clickMe.classList.add('blink');
    E.inner = [0, 1].map(k => { const e = electron(svg, '#dbe9ff', 64 * Math.cos(Math.PI * k), NY + 64 * Math.sin(Math.PI * k)); e.style.opacity = 0; return e; });
    E.val = [0, 1, 2, 3, 4].map(k => {
      const a = (k / 5) * Math.PI * 2 - Math.PI / 2;
      const e = electron(svg, '#dbe9ff', 104 * Math.cos(a), NY + 104 * Math.sin(a));
      e.style.opacity = 0; e.setAttribute('r', 9); return e;
    });
    // target Lewis: val0→lp kanan, val4→lp kiri, val1→kanan, val2→bawah, val3→kiri
    E.lewis = [[9, NY - 58], [58, NY], [0, NY + 58], [-58, NY], [-9, NY - 58]];
    E.single = { right: 1, bottom: 2, left: 3 };
    E.lpHit = svgEl('ellipse', { cx: 0, cy: NY - 58, rx: 28, ry: 18, fill: 'rgba(246,198,78,0)', stroke: 'none' }, svg);
    E.lpHit.style.display = 'none';
    E.lpLbl = label(svg, 150, NY - 92, 'pasangan elektron bebas', { color: '#f6c64e', hidden: true });
    E.H = []; E.hplus = null;
    E.arrow = svgEl('path', { d: `M28 ${NY - 66} Q 60 ${NY - 105} 28 ${NY - 132}`, fill: 'none', stroke: '#f6c64e', 'stroke-width': 3, 'marker-end': `url(#${svg.id}arr)` }, svg);
    E.arrow.style.opacity = 0; E.arrow.style.transition = 'opacity .6s';
    E.arrowLbl = label(svg, 70, NY - 110, 'N → H⁺', { color: '#f6c64e', hidden: true, anchor: 'start' });
    E.final = [label(svg, 230, NY - 10, 'NH₄⁺', { size: 40, weight: 800, color: '#fff', hidden: true }), label(svg, 230, NY + 20, 'ion amonium', { size: 14, color: '#a9c1f5', hidden: true }),
      label(svg, 22, NY - 95, 'ikatan kovalen koordinasi', { color: '#f6c64e', hidden: true, anchor: 'start' })];
    E.nh3Lbl = label(svg, -230, NY + 190, 'NH₃: 3 ikatan N—H + 1 PEB', { color: '#5fd4ff', hidden: true, size: 14 });
    $('#nh4Em').textContent = ''; $('#nh4Cap').textContent = '';
    $('#nh4Choice').style.display = 'none'; $('#nh4ChoiceFb').className = 'feedback';
    $('#nh4Donor').value = ''; $('#nh4Acc').value = '';

    E.N.addEventListener('click', onClickN);
    E.val.forEach((e, k) => e.addEventListener('click', () => onClickVal(k)));
    E.lpHit.addEventListener('click', onClickLP);
  }
  svg.addEventListener('click', ev => onSvgClick(ev));

  /* --- Tahap 1 --- */
  function onClickN() {
    if (step === 0 && !doneSteps.has(0)) {
      E.clickMe.style.opacity = 0; E.clickMe.classList.remove('blink');
      [E.ringK, E.ringL, ...E.ringTxt, ...E.inner, ...E.val].forEach(x => (x.style.opacity = 1));
      E.N.classList.remove('clickable');
      finishStep(0, 'N (Z = 7): K = 2, L = 5', 'Dua elektron mengisi kulit K (penuh), lima elektron sisanya berada di kulit L.');
    }
  }
  /* --- Tahap 2 --- */
  const clickedVal = new Set();
  function onClickVal(k) {
    if (step !== 1 || doneSteps.has(1)) return;
    if (clickedVal.has(k)) return;
    clickedVal.add(k);
    E.val[k].setAttribute('fill', C.lp); E.val[k].classList.add('glow');
    $('#nh4Em').textContent = `Elektron valensi ditandai: ${clickedVal.size}/5`;
    if (clickedVal.size === 5) {
      E.val.forEach(e => { e.classList.remove('clickable', 'blink', 'glow'); e.setAttribute('r', 7); e.setAttribute('fill', C.nE); });
      [E.ringK, E.ringL, ...E.ringTxt, ...E.inner].forEach(x => (x.style.opacity = 0));
      later(() => E.val.forEach((e, i) => setPos(e, ...E.lewis[i])), 50);
      finishStep(1, '5 elektron valensi N', 'Elektron valensi disusun sebagai notasi Lewis: 1 pasang elektron (atas) dan 3 elektron tunggal (kiri, kanan, bawah).');
    }
  }
  const ENTERSTEP = {
    0: () => {},
    1: () => { E.val.forEach(e => e.classList.add('clickable', 'blink')); $('#nh4Em').textContent = 'Klik 5 elektron di kulit L'; $('#nh4Cap').textContent = 'Elektron di kulit terluar (L) adalah elektron valensi.'; },
    2: () => spawnH(),
    3: () => { E.lpHit.style.display = ''; E.lpHit.classList.add('clickable'); $('#nh4Em').textContent = 'Klik pasangan elektron bebas'; $('#nh4Cap').textContent = 'Cari pasangan elektron pada N yang tidak terlibat ikatan dengan H.'; },
    4: () => spawnHplus(),
    5: () => { $('#nh4Choice').style.display = ''; $('#nh4Em').textContent = 'Siapa donor? Siapa akseptor?'; $('#nh4Cap').textContent = 'Pilih jawabanmu pada kotak di bawah simulasi.'; $('#nh4Choice').scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  };
  /* --- Tahap 3 --- */
  function showSlots(keys) { E.slots.forEach(s => { const on = keys.includes(s.key) && !s.used; s.el.style.opacity = on ? 1 : 0; s.el.classList.toggle('pulse', on); }); }
  function spawnH() {
    showSlots(['left', 'right', 'bottom', 'top']);
    $('#nh4Em').textContent = 'Seret 3 atom H ke elektron tunggal N';
    $('#nh4Cap').textContent = 'Lingkaran putus-putus menunjukkan posisi di sekitar N. Pilih posisi yang tepat!';
    const homes = [[-250, NY - 170], [-250, NY + 170], [250, NY + 170]];
    homes.forEach(h => {
      const g = atomG(svg, svg, 'H', 26);
      g._home = h; setPos(g, ...h);
      g._e = electron(g, C.hE, 0, -38, 'tr');
      enableDrag(svg, g, (x, y) => dropH(g, x, y));
      E.H.push(g);
    });
  }
  function dropH(g, x, y) {
    const s = nearestSlot(E.slots, x, y);
    if (!s) { bounceBack(g, panel); toast('Dekatkan atom H ke salah satu posisi di sekitar atom N.'); return; }
    if (s.key === 'top') {
      flashSlot(s); bounceBack(g, panel);
      const m = 'Atom H terpental! Dua elektron di atas N sudah berpasangan (pasangan elektron bebas). Atom H harus berpasangan dengan elektron tunggal N.';
      toast('↩️ ' + m, 4200); $('#nh4Narr').textContent = m; Voice.say(m, $('#nh4Spk')); return;
    }
    if (s.used) { flashSlot(s); bounceBack(g, panel); toast('Posisi itu sudah ditempati atom H lain.'); return; }
    s.used = true; snapTo(g, s.x, s.y); s.el.style.opacity = 0; s.el.classList.remove('pulse');
    const nE = E.val[E.single[s.key]];
    if (s.key === 'left') { setPos(nE, -95, NY - 9); setPos(g._e, 55, 9); }
    if (s.key === 'right') { setPos(nE, 95, NY - 9); setPos(g._e, -55, 9); }
    if (s.key === 'bottom') { setPos(nE, -9, NY + 95); setPos(g._e, 9, -55); }
    later(() => (E.bonds[s.key].style.opacity = 1), 350);
    E.placedH++;
    $('#nh4Em').textContent = `Ikatan N—H terbentuk: ${E.placedH}/3`;
    if (E.placedH === 3) {
      E.slots.find(z => z.key === 'top').el.style.opacity = 0;
      E.nh3Lbl.style.opacity = 1;
      finishStep(2, 'NH₃ terbentuk: 3 ikatan kovalen N—H', 'Setiap ikatan N—H berisi 1 elektron dari N dan 1 elektron dari H. Masih ada 1 pasangan elektron bebas pada N.');
    }
  }
  /* --- Tahap 4 --- */
  function onClickLP(ev) {
    ev.stopPropagation();
    if (step !== 3 || doneSteps.has(3)) return;
    E.lpHit.classList.remove('clickable');
    [E.val[0], E.val[4]].forEach(e => { e.setAttribute('fill', C.lp); e.classList.add('glow'); });
    E.lpLbl.style.opacity = 1;
    finishStep(3, 'Pasangan elektron bebas N ditemukan', 'Pasangan ini milik N sepenuhnya dan belum dipakai berikatan.');
  }
  function onSvgClick(ev) {
    if (step === 3 && !doneSteps.has(3) && ev.target !== E.lpHit) toast('Bukan itu. Cari dua elektron di atas atom N yang tidak terhubung dengan atom H.');
  }
  /* --- Tahap 5 --- */
  function spawnHplus() {
    E.lpHit.style.display = 'none';
    showSlots(['top', 'left', 'right', 'bottom'].filter(k => k === 'top'));
    E.slots.forEach(s => { if (s.key !== 'top') s.el.style.opacity = 0; });
    const g = atomG(svg, svg, 'H', 26, 'hplus');
    g._home = [250, NY - 170]; setPos(g, ...g._home);
    g._lbl = label(g, 0, 48, 'orbital 1s kosong', { size: 12, color: '#ff8fb8' });
    enableDrag(svg, g, (x, y) => dropHplus(g, x, y));
    E.hplus = g;
    $('#nh4Em').textContent = 'Seret ion H⁺ ke pasangan elektron bebas N';
    $('#nh4Cap').textContent = 'H⁺ tidak membawa elektron; ia hanya menyediakan orbital kosong.';
    // tampilkan semua slot agar siswa memilih sendiri
    E.slots.forEach(s => { s.el.style.opacity = s.key === 'top' ? 1 : 0.35; s.el.classList.toggle('pulse', s.key === 'top'); });
  }
  function dropHplus(g, x, y) {
    const s = nearestSlot(E.slots, x, y);
    if (!s) { bounceBack(g, panel); toast('Dekatkan ion H⁺ ke atom N.'); return; }
    if (s.key !== 'top') {
      flashSlot(s); bounceBack(g, panel);
      const m = 'H⁺ terpental! Atom H di posisi itu sudah berikatan dan tidak punya elektron bebas. H⁺ butuh pasangan elektron bebas.';
      toast('↩️ ' + m, 4200); $('#nh4Narr').textContent = m; Voice.say(m, $('#nh4Spk')); return;
    }
    snapTo(g, s.x, s.y); g._lbl.style.opacity = 0;
    E.slots.forEach(z => (z.el.style.opacity = 0));
    E.lpLbl.style.opacity = 0;
    E.arrow.style.opacity = 1; E.arrowLbl.style.opacity = 1;
    later(() => { setPos(E.val[4], -9, NY - 95); setPos(E.val[0], 9, NY - 95); }, 700);
    finishStep(4, 'Pasangan elektron N dipakai bersama dengan H⁺', 'Panah N → H⁺ menunjukkan kedua elektron ikatan berasal dari atom N.');
  }
  /* --- Tahap 6 --- */
  $('#nh4ChoiceBtn').addEventListener('click', () => {
    if (step !== 5) return;
    const d = $('#nh4Donor').value, a = $('#nh4Acc').value, fb = $('#nh4ChoiceFb');
    if (!d || !a) return feedback(fb, 'bad', '<b>Pilih keduanya dulu.</b>Tentukan donor dan akseptor pasangan elektron.');
    if (d === 'n' && a === 'h') {
      feedback(fb, 'ok', '<b>✅ Tepat!</b>Atom N pada NH₃ adalah <b>donor</b> (memberi pasangan elektron bebas), ion H⁺ adalah <b>akseptor</b> (menerima pasangan elektron ke orbital 1s yang kosong).');
      const g = E.hplus;
      g._circle.setAttribute('fill', `url(#${svg.id}gH)`); g._circle.removeAttribute('stroke-dasharray'); g._circle.setAttribute('stroke', '#f6c64e');
      g._text.textContent = 'H'; g._text.setAttribute('fill', '#0c1a3d');
      const badge = svgEl('g', {}, g); svgEl('circle', { cx: 22, cy: -22, r: 11, fill: '#f6c64e' }, badge);
      const bt = svgEl('text', { x: 22, y: -17, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: '#0c1a3d' }, badge); bt.textContent = '+';
      E.bonds.top.style.opacity = 1; E.arrow.style.opacity = 0; E.arrowLbl.style.opacity = 0;
      [E.val[0], E.val[4]].forEach(e => e.classList.remove('glow'));
      E.final.forEach(t => (t.style.opacity = 1)); E.nh3Lbl.style.opacity = 0;
      $('#nh4Status').textContent = 'NH₄⁺ terbentuk';
      finishStep(5, '3 ikatan kovalen + 1 ikatan kovalen koordinasi', 'Ion amonium NH₄⁺ terbentuk. Muatan +1 berasal dari ion H⁺. Setelah terbentuk, keempat ikatan N—H identik.');
      simDone = true; $('#nh4Q').classList.remove('is-locked');
      later(() => $('#nh4Q').scrollIntoView({ behavior: 'smooth', block: 'center' }), 1800);
      return;
    }
    let msg = '<b>❌ Belum tepat.</b>';
    if (d === 'h') msg += 'Ion H⁺ tidak memiliki elektron sama sekali, jadi tidak mungkin memberi (mendonorkan) pasangan elektron. ';
    if (d === 'hb' || a === 'hb') msg += 'Atom H pada NH₃ sudah duplet dan tidak terlibat dalam ikatan baru ini. ';
    if (a === 'n') msg += 'Atom N tidak menerima elektron; justru pasangan elektron bebas N yang berpindah ke arah H⁺. ';
    msg += 'Ingat arah panah N → H⁺: panah keluar dari donor menuju akseptor.';
    feedback(fb, 'bad', msg);
  });

  $('#nh4Reset').addEventListener('click', () => { doneSteps = new Set(); clickedVal.clear(); build(); setStep(0); });
  openQuestion({
    ta: $('#nh4Ans'), btn: $('#nh4Check'), fb: $('#nh4Fb'), minChars: 15, need: 2, req: [1],
    groups: [
      { re: /pasangan elektron bebas|\bpeb\b|elektron bebas|sepasang elektron|pasangan elektron/, hint: 'jawabanmu belum menyebut bagian NH₃ yang dipakai untuk berikatan, yaitu <b>pasangan elektron bebas</b> pada atom N.' },
      { re: /h\+|ion h\b|ion hidrogen|proton/, hint: 'jawabanmu belum menyebut <b>ion H⁺</b> sebagai pihak yang menerima pasangan elektron.' },
      { re: /donor|menyumbang|memberi|mendonorkan|diberikan|disumbangkan|berasal dari (atom )?n|dari nitrogen|koordinasi|akseptor|menerima|orbital kosong/, hint: 'jelaskan peran masing-masing: siapa yang <b>memberi (donor)</b> dan siapa yang <b>menerima (akseptor)</b>, atau sebutkan jenis ikatannya (kovalen koordinasi).' }
    ],
    okHtml: 'NH₃ memiliki 1 <b>pasangan elektron bebas</b> pada atom N. Ion <b>H⁺</b> tidak memiliki elektron tetapi memiliki orbital 1s kosong. Atom N <b>mendonorkan</b> pasangan elektron bebasnya untuk dipakai bersama dengan H⁺ (akseptor), sehingga terbentuk <b>ikatan kovalen koordinasi</b> dan ion NH₄⁺ yang bermuatan +1.',
    model: 'NH₃ punya pasangan elektron bebas pada N. Pasangan ini didonorkan ke ion H⁺ yang orbitalnya kosong, sehingga N menjadi donor, H⁺ akseptor, dan terbentuk ikatan kovalen koordinasi pada NH₄⁺.',
    onOk: () => { if (simDone) complete(5, '✅ Luar biasa! Uji simulasi H₃O⁺ sudah terbuka.'); }
  });

  build();
  let started = false;
  ENTER[5] = () => { if (!started) { started = true; setStep(0); } };
  setStep(0, false);
})();

/* =========================================================
   SLIDE 7 — Uji simulasi H3O+
   ========================================================= */
(function h3o() {
  // a. model atom H dan O
  const box = $('#h3oBohr');
  ['H', 'O'].forEach(s => {
    const sh = shells(ATOMS[s].Z);
    const wrap = document.createElement('div');
    wrap.innerHTML = `<div class="bohr-stage"></div>
      <div style="margin-top:10px"><b style="font-size:17px">${ATOMS[s].name} (${s}) — Z = ${ATOMS[s].Z}</b>
      <ul>${sh.map((n, i) => `<li>Kulit ${SHELL_NAMES[i]}: <b>${n} elektron</b>${i === sh.length - 1 ? ' <span style="color:#d39b12">(kulit terluar)</span>' : ''} — maksimal ${[2, 8][i]}</li>`).join('')}</ul></div>`;
    $('.bohr-stage', wrap).appendChild(bohrSVG(s, { id: 'h3o' }));
    box.appendChild(wrap);
  });

  // b. latihan
  buildExercise($('#ex7'), ['H', 'O']);
  let partB = false;
  $('#ex7Btn').addEventListener('click', () => {
    const fb = $('#ex7Fb');
    if (gradeExercise($('#ex7'), fb)) {
      feedback(fb, 'ok', '<b>✅ Benar!</b>H (Z = 1): <b>1</b> → elektron valensi 1. O (Z = 8): <b>2 6</b> → elektron valensi 6 (2 elektron tunggal + 2 pasangan elektron bebas). Sekarang lakukan simulasi di bawah.');
      if (!partB) { partB = true; $('#h3oSimBlock').classList.remove('is-locked'); startSim(); }
    }
  });

  // c. simulasi seret
  const svg = $('#h3oSvg'), panel = svg.closest('.sim-panel');
  const NY = 10;
  let E = {}, part = 0, simDone = false, timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  const NARR = {
    p1: 'Bagian 1. Atom oksigen memiliki 6 elektron valensi: dua pasangan elektron bebas dan dua elektron tunggal. Seret kedua atom H ke elektron tunggal oksigen untuk membentuk H₂O.',
    p1ok: 'H₂O terbentuk: dua ikatan kovalen O—H, dan oksigen masih memiliki dua pasangan elektron bebas.',
    p2: 'Bagian 2. Ion H⁺ datang tanpa elektron. Seret ion H⁺ ke salah satu pasangan elektron bebas oksigen.',
    p2ok: 'Ion hidronium H₃O⁺ terbentuk! Oksigen bertindak sebagai donor dan H⁺ sebagai akseptor pasangan elektron. Ikatan yang baru terbentuk adalah ikatan kovalen koordinasi.'
  };
  function narr(t) { $('#h3oNarr').textContent = t; Voice.say(t, $('#h3oSpk')); }
  $('#h3oSpk').addEventListener('click', () => Voice.say($('#h3oNarr').textContent, $('#h3oSpk')));
  const POS = { left: [-150, NY], right: [150, NY], top: [0, NY - 150], bottom: [0, NY + 150] };
  function build() {
    timers.forEach(clearTimeout); timers = [];
    svg.innerHTML = ''; simDefs(svg);
    E = { slots: [], placed: 0 };
    E.bonds = {
      left: line(svg, -42, NY, -124, NY), right: line(svg, 42, NY, 124, NY),
      top: line(svg, 0, NY - 42, 0, NY - 124, '#f6c64e', 6), bottom: line(svg, 0, NY + 42, 0, NY + 124, '#f6c64e', 6)
    };
    for (const k in POS) {
      const el = svgEl('circle', { cx: POS[k][0], cy: POS[k][1], r: 34, class: 'slot pulse' }, svg);
      el.style.transition = 'opacity .4s';
      E.slots.push({ key: k, x: POS[k][0], y: POS[k][1], el, used: false });
    }
    E.O = atomG(svg, svg, 'O', 42); setPos(E.O, 0, NY);
    E.e = {
      top: [electron(svg, C.lp, -9, NY - 58), electron(svg, C.lp, 9, NY - 58)],
      bottom: [electron(svg, C.lp, -9, NY + 58), electron(svg, C.lp, 9, NY + 58)],
      left: electron(svg, C.oE, -58, NY), right: electron(svg, C.oE, 58, NY)
    };
    E.lbl = label(svg, -250, NY - 205, 'O: 6 e⁻ valensi → 2 PEB + 2 elektron tunggal', { size: 13, color: '#ffb0b8', anchor: 'start' });
    E.h2o = label(svg, -250, NY + 210, 'H₂O: 2 ikatan O—H + 2 PEB', { size: 14, color: '#5fd4ff', anchor: 'start', hidden: true });
    E.final = [label(svg, 230, NY - 10, 'H₃O⁺', { size: 38, weight: 800, color: '#fff', hidden: true }), label(svg, 230, NY + 20, 'ion hidronium', { size: 14, color: '#a9c1f5', hidden: true })];
    E.coordLbl = label(svg, 24, 0, 'ikatan kovalen koordinasi', { color: '#f6c64e', hidden: true, anchor: 'start' });
    E.H = [[-250, NY - 160], [250, NY - 160]].map(h => {
      const g = atomG(svg, svg, 'H', 26); g._home = h; setPos(g, ...h);
      g._e = electron(g, C.hE, 0, 38, 'tr');
      enableDrag(svg, g, (x, y) => dropH(g, x, y));
      return g;
    });
    part = 1;
    $('#h3oPill').textContent = 'Bagian 1/2';
    $('#h3oEm').textContent = 'Bentuk H₂O: seret 2 atom H';
    $('#h3oCap').textContent = 'Pilih posisi di sekitar O yang memiliki elektron tunggal.';
    $('#h3oStatus').textContent = 'Seret atom ke posisi yang tepat';
  }
  function wrongMsg(m, g, s) { if (s) flashSlot(s); bounceBack(g, panel); toast('↩️ ' + m, 4200); $('#h3oNarr').textContent = m; Voice.say(m, $('#h3oSpk')); }
  function dropH(g, x, y) {
    if (part !== 1) { bounceBack(g, panel); return; }
    const s = nearestSlot(E.slots, x, y);
    if (!s) return wrongMsg('Dekatkan atom H ke salah satu posisi di sekitar atom O.', g);
    if (s.key === 'top' || s.key === 'bottom') return wrongMsg('Atom H terpental! Elektron di posisi itu sudah berpasangan (pasangan elektron bebas). Cari elektron tunggal oksigen.', g, s);
    if (s.used) return wrongMsg('Posisi itu sudah ditempati.', g, s);
    s.used = true; snapTo(g, s.x, s.y); s.el.style.opacity = 0;
    if (s.key === 'left') { setPos(E.e.left, -95, NY - 9); setPos(g._e, 55, 9); }
    else { setPos(E.e.right, 95, NY - 9); setPos(g._e, -55, 9); }
    later(() => (E.bonds[s.key].style.opacity = 1), 350);
    E.placed++;
    if (E.placed === 2) {
      E.h2o.style.opacity = 1;
      $('#h3oEm').textContent = 'H₂O terbentuk!'; $('#h3oCap').textContent = 'Dua ikatan kovalen O—H; O masih memiliki 2 pasangan elektron bebas.';
      narr(NARR.p1ok);
      later(spawnHplus, 4200);
    }
  }
  function spawnHplus() {
    part = 2;
    $('#h3oPill').textContent = 'Bagian 2/2';
    const g = atomG(svg, svg, 'H', 26, 'hplus');
    g._home = [250, NY + 160]; setPos(g, ...g._home);
    g._lbl = label(g, 0, -40, 'orbital 1s kosong', { size: 12, color: '#ff8fb8' });
    enableDrag(svg, g, (x, y) => dropHplus(g, x, y));
    E.hplus = g;
    E.slots.forEach(s => { s.el.style.opacity = s.used ? 0 : 1; });
    $('#h3oEm').textContent = 'Seret ion H⁺ ke pasangan elektron bebas O';
    $('#h3oCap').textContent = 'Ingat: H⁺ tidak membawa elektron.';
    narr(NARR.p2);
  }
  function dropHplus(g, x, y) {
    const s = nearestSlot(E.slots, x, y);
    if (!s) return wrongMsg('Dekatkan ion H⁺ ke atom O.', g);
    if (s.key === 'left' || s.key === 'right') return wrongMsg('H⁺ terpental! Atom H di posisi itu sudah berikatan. H⁺ hanya dapat menerima pasangan elektron bebas dari oksigen.', g, s);
    snapTo(g, s.x, s.y); g._lbl.style.opacity = 0;
    E.slots.forEach(z => (z.el.style.opacity = 0));
    const pair = E.e[s.key], dy = s.key === 'top' ? -95 : 95;
    later(() => { setPos(pair[0], -9, NY + dy); setPos(pair[1], 9, NY + dy); }, 300);
    later(() => {
      E.bonds[s.key].style.opacity = 1;
      g._circle.setAttribute('fill', `url(#${svg.id}gH)`); g._circle.removeAttribute('stroke-dasharray'); g._circle.setAttribute('stroke', '#f6c64e');
      g._text.textContent = 'H'; g._text.setAttribute('fill', '#0c1a3d');
      const b = svgEl('g', {}, g); svgEl('circle', { cx: 22, cy: -22, r: 11, fill: '#f6c64e' }, b);
      const t = svgEl('text', { x: 22, y: -17, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: '#0c1a3d' }, b); t.textContent = '+';
      E.coordLbl.setAttribute('y', NY + (s.key === 'top' ? -95 : 105));
      E.final.forEach(f => (f.style.opacity = 1)); E.coordLbl.style.opacity = 1; E.h2o.style.opacity = 0;
    }, 900);
    $('#h3oEm').textContent = '2 ikatan kovalen + 1 ikatan kovalen koordinasi';
    $('#h3oCap').textContent = 'O = donor pasangan elektron, H⁺ = akseptor. Terbentuk ion hidronium H₃O⁺.';
    $('#h3oStatus').textContent = 'H₃O⁺ terbentuk';
    narr(NARR.p2ok);
    part = 3; simDone = true;
    $('#h3oQ').classList.remove('is-locked');
  }
  function startSim() { build(); narr(NARR.p1); }
  $('#h3oReset').addEventListener('click', () => { if (partB) startSim(); });
  $('#h3oNarr').textContent = NARR.p1;

  // d. penjelasan
  openQuestion({
    ta: $('#h3oAns'), btn: $('#h3oCheck'), fb: $('#h3oFb'), minChars: 15, need: 2, req: [1],
    groups: [
      { re: /pasangan elektron bebas|\bpeb\b|elektron bebas|sepasang elektron|pasangan elektron/, hint: 'jawabanmu belum menyebut <b>pasangan elektron bebas</b> pada atom O yang dipakai untuk mengikat H⁺.' },
      { re: /h\+|ion h\b|ion hidrogen|proton/, hint: 'jawabanmu belum menyebut <b>ion H⁺</b> yang menerima pasangan elektron.' },
      { re: /donor|menyumbang|memberi|mendonorkan|diberikan|disumbangkan|berasal dari (atom )?o|dari oksigen|koordinasi|akseptor|menerima|orbital kosong/, hint: 'jelaskan peran O sebagai <b>donor</b> dan H⁺ sebagai <b>akseptor</b>, atau sebutkan bahwa ikatan yang terbentuk adalah <b>ikatan kovalen koordinasi</b>.' }
    ],
    okHtml: 'Atom O pada H₂O memiliki <b>2 pasangan elektron bebas</b>. Salah satunya <b>didonorkan</b> kepada ion <b>H⁺</b> yang memiliki orbital 1s kosong (akseptor). Pasangan elektron itu kemudian dipakai bersama sehingga terbentuk <b>ikatan kovalen koordinasi</b> O→H dan ion hidronium H₃O⁺ yang bermuatan +1.',
    model: 'Atom O pada H₂O mendonorkan salah satu pasangan elektron bebasnya kepada ion H⁺ yang orbitalnya kosong. O menjadi donor, H⁺ menjadi akseptor, dan terbentuk ikatan kovalen koordinasi sehingga menjadi H₃O⁺.',
    onOk: () => { if (simDone) complete(6, '✅ Mantap! Uji Pemahaman sudah terbuka.'); }
  });
})();

/* =========================================================
   SLIDE 8 — 10 soal esai
   ========================================================= */
(function quiz() {
  const role = (subj, word) => new RegExp(
    `(?:${subj})\\s*(?:[:=(\\-]|adalah|ialah|yaitu|merupakan|sebagai|bertindak sebagai|berperan sebagai|menjadi)?\\s*(?:atom\\s*|ion\\s*)?${word}` +
    `|${word}\\s*(?:nya)?\\s*(?:[:=(\\-]|adalah|ialah|yaitu|merupakan|nya adalah)?\\s*(?:nya\\s*)?(?:adalah\\s*)?(?:atom\\s*|ion\\s*|molekul\\s*)?(?:${subj})`);
  const both = (a, b) => ({ fn: t => a.test(t) && b.test(t) });
  const Q = [
    { q: 'Atom nitrogen memiliki nomor atom 7. Tuliskan konfigurasi elektronnya dan tentukan jumlah elektron valensinya.',
      groups: [{ re: /\b2\s*[,.\-]?\s*5\b|1s2\s*2s2\s*2p3|k\s*[:=]?\s*2[^0-9]{0,6}l\s*[:=]?\s*5/ }, { re: /valensi[^.]*?(\b5\b|lima)|(\b5\b|lima)[^.]*?valensi/ }], need: 2,
      model: 'Konfigurasi N = 2 5 (1s² 2s² 2p³); elektron valensinya 5.',
      expl: 'Kulit K terisi 2 elektron (penuh), sisa 5 elektron berada di kulit L. Kulit terluar adalah L, sehingga elektron valensi = 5.' },
    { q: 'Pada molekul NH₃, berapa jumlah pasangan elektron ikatan (PEI) dan pasangan elektron bebas (PEB) pada atom N?',
      groups: [both(/\b3\b|tiga/, /\bpei\b|ikatan/), both(/\b1\b|satu|sepasang/, /\bpeb\b|bebas/)], need: 2,
      model: 'NH₃ memiliki 3 PEI dan 1 PEB pada atom N.',
      expl: 'Tiga elektron tunggal N masing-masing berpasangan dengan elektron dari 3 atom H (3 PEI). Dua elektron N sisanya tetap berpasangan dan tidak berikatan (1 PEB).' },
    { q: 'Mengapa atom hidrogen hanya dapat membentuk satu ikatan kovalen?',
      groups: [{ re: /(\b1\b|satu)\s*(buah\s*)?elektron|elektron valensi(nya)?\s*(hanya\s*)?(\b1\b|satu)|hanya (punya|memiliki|mempunyai) (\b1\b|satu)/ }, { re: /duplet|duet|(\b2\b|dua) elektron|kulit k|penuh|stabil|helium/ }], need: 2,
      model: 'Karena H hanya memiliki 1 elektron valensi dan cukup membutuhkan 1 elektron lagi untuk mencapai duplet (2 elektron pada kulit K).',
      expl: 'Kulit K maksimal berisi 2 elektron. Dengan satu ikatan (satu pasangan elektron), kulit K hidrogen sudah penuh seperti helium.' },
    { q: 'Apa perbedaan utama ikatan kovalen dan ikatan kovalen koordinasi jika dilihat dari asal pasangan elektronnya?',
      groups: [{ re: /kedua atom|dua atom|masing-masing|kedua belah|dari setiap atom|dari tiap atom|keduanya|kedua pihak/ }, { re: /satu atom|salah satu|satu pihak|hanya dari|dari satu|\bdonor\b/ }], need: 2,
      model: 'Pada ikatan kovalen, pasangan elektron berasal dari kedua atom (masing-masing menyumbang); pada ikatan kovalen koordinasi, pasangan elektron berasal dari satu atom saja (donor).',
      expl: 'Contohnya ikatan N—H pada NH₃ (1 e⁻ dari N + 1 e⁻ dari H) dibandingkan ikatan baru pada NH₄⁺ (kedua elektron dari N).' },
    { q: 'Pada pembentukan ion NH₄⁺ dari NH₃ dan H⁺, tentukan atom/ion yang menjadi donor dan akseptor pasangan elektron!',
      groups: [{ re: role('\\bn\\b|nh3|nitrogen|amonia', 'donor') }, { re: role('h\\+|ion h\\b|hidrogen|proton', 'akseptor') }], need: 2,
      model: 'Donor: atom N pada NH₃. Akseptor: ion H⁺.',
      expl: 'Atom N memiliki pasangan elektron bebas yang diberikan (donor); ion H⁺ memiliki orbital 1s kosong yang menerima pasangan tersebut (akseptor).' },
    { q: 'Mengapa ion H⁺ dapat bertindak sebagai akseptor pasangan elektron?',
      groups: [{ re: /(tidak|tak) (punya|memiliki|mempunyai|ada) elektron|tanpa elektron|\b0 elektron|nol elektron|kosong|kehilangan elektron|melepas(kan)? elektron|elektronnya (hilang|lepas)/ }], need: 1,
      model: 'Karena ion H⁺ tidak memiliki elektron sehingga orbital 1s-nya kosong dan dapat menerima pasangan elektron.',
      expl: 'Atom H yang melepas satu elektronnya menjadi H⁺ (proton). Orbital kosong inilah syarat sebuah akseptor.' },
    { q: 'Setelah NH₄⁺ terbentuk, apakah ikatan kovalen koordinasi masih dapat dibedakan dari tiga ikatan N—H lainnya? Jelaskan.',
      groups: [{ re: /(tidak|tak) (dapat|bisa|lagi) (di)?bedakan|identik|ekuivalen|ekivalen|sama (saja|persis|kuat|panjang)|semua(nya)? sama|keempat(nya)? (ikatan )?(n-h )?sama|tidak ada (per)?beda(an)?|sama semua|tidak berbeda/ }], need: 1,
      model: 'Tidak dapat dibedakan. Setelah terbentuk, keempat ikatan N—H pada NH₄⁺ identik (panjang dan kekuatannya sama).',
      expl: 'Perbedaan hanya terletak pada asal elektronnya saat pembentukan. Setelah ikatan terbentuk, pasangan elektronnya dipakai bersama sama seperti ikatan kovalen biasa.' },
    { q: 'Atom O memiliki nomor atom 8. Tentukan elektron valensinya dan jumlah pasangan elektron bebas pada molekul H₂O.',
      groups: [{ re: /valensi[^.]*?(\b6\b|enam)|(\b6\b|enam)[^.]*?valensi|\b2\s*[,.\-]?\s*6\b|k\s*[:=]?\s*2[^0-9]{0,6}l\s*[:=]?\s*6/ }, both(/\b2\b|dua/, /\bpeb\b|bebas/)], need: 2,
      model: 'Konfigurasi O = 2 6, elektron valensi 6. Pada H₂O, atom O memiliki 2 pasangan elektron bebas.',
      expl: 'Dari 6 elektron valensi O, 2 elektron dipakai berikatan dengan 2 atom H; 4 elektron sisanya membentuk 2 pasangan elektron bebas.' },
    { q: 'Mengapa molekul H₂O dapat membentuk ion H₃O⁺ ketika bertemu dengan ion H⁺?',
      groups: [{ re: /pasangan elektron bebas|\bpeb\b|elektron bebas|sepasang elektron|pasangan elektron/ }, { re: /h\+|ion h\b|proton|ion hidrogen/ }, { re: /donor|menyumbang|memberi|mendonorkan|koordinasi|akseptor|orbital kosong|menerima/ }], need: 2, req: [0],
      model: 'Karena atom O pada H₂O memiliki pasangan elektron bebas yang dapat didonorkan ke ion H⁺ (orbital kosong), sehingga terbentuk ikatan kovalen koordinasi.',
      expl: 'Syarat ikatan kovalen koordinasi: donor punya pasangan elektron bebas (O pada H₂O) dan akseptor punya orbital kosong (H⁺).' },
    { q: 'Mengapa ion amonium (NH₄⁺) dan ion hidronium (H₃O⁺) bermuatan +1?',
      groups: [{ re: /h\+|ion h\b|proton|ion hidrogen/ }, { re: /(tidak|tak) (membawa|memiliki|punya) elektron|tanpa elektron|kehilangan elektron|proton (lebih|berlebih)|kelebihan (\b1\b|satu) proton|lebih banyak proton|jumlah proton|bermuatan (positif|\+)|muatan(nya)? (positif|\+|\+1)|muatan (dari|berasal)/ }], need: 2,
      model: 'Karena keduanya terbentuk dari penambahan ion H⁺ yang bermuatan +1 (proton tanpa elektron), sehingga jumlah proton lebih banyak satu daripada elektron.',
      expl: 'NH₃ dan H₂O netral. H⁺ menambah 1 proton tanpa menambah elektron, sehingga muatan total menjadi +1.' }
  ];
  let order = Q.map((_, i) => i), pos = 0, result = Array(Q.length).fill(null), answers = Array(Q.length).fill('');
  const nums = $('#qNums');
  function render() {
    const i = order[pos];
    $('#qPill').textContent = `Soal ${i + 1}/10`;
    nums.innerHTML = Q.map((_, k) => `<span class="${k === i ? 'now' : ''} ${result[k] === true ? 'ok' : result[k] === false ? 'bad' : ''}">${k + 1}</span>`).join('');
    $('#qText').textContent = `${i + 1}. ${Q[i].q}`;
    const ta = $('#qAns'); ta.value = ''; ta.disabled = false; ta.className = 'input';
    $('#qCheck').style.display = ''; $('#qNext').style.display = 'none';
    $('#qFb').className = 'feedback';
  }
  $('#qCheck').addEventListener('click', () => {
    const i = order[pos], ta = $('#qAns'), raw = ta.value.trim();
    if (raw.length < 3) return feedback($('#qFb'), 'bad', '<b>Jawaban masih kosong.</b>Tulis jawabanmu terlebih dahulu.');
    const t = norm(raw), q = Q[i];
    const hit = q.groups.map(g => testGroup(g, t));
    const ok = hit.filter(Boolean).length >= q.need && (q.req || []).every(k => hit[k]);
    result[i] = ok; answers[i] = raw; ta.disabled = true; ta.classList.add(ok ? 'ok' : 'bad');
    feedback($('#qFb'), ok ? 'ok' : 'bad', ok
      ? `<b>✅ Jawabanmu tepat!</b>${q.expl}`
      : `<b>❌ Jawabanmu kurang tepat.</b><div style="margin:4px 0"><b style="display:inline">Jawaban yang tepat:</b> ${q.model}</div><div><b style="display:inline">Penjelasan:</b> ${q.expl}</div>`);
    $('#qCheck').style.display = 'none';
    const lbl = pos === order.length - 1 ? 'Lihat Hasil →' : 'Soal Berikutnya →';
    $('#qNext').textContent = lbl; $('#qNext').style.display = '';
    nums.children[i].className = ok ? 'ok' : 'bad';
  });
  $('#qNext').addEventListener('click', () => { if (pos < order.length - 1) { pos++; render(); } else showResult(); });
  function showResult() {
    const benar = result.filter(Boolean).length, nilai = benar * 10;
    state.quiz = { benar, nilai, answers: answers.slice(), result: result.slice(), questions: Q.map(q => q.q) };
    $('#quizCard').style.display = 'none';
    const r = $('#quizResult'); r.style.display = '';
    r.innerHTML = `<span class="tag">Hasil Uji Pemahaman</span>
      <div style="display:flex;gap:24px;align-items:center;flex-wrap:wrap">
        <div class="score-big">${nilai}</div>
        <div><b style="font-size:18px;color:var(--ink)">${esc(state.student.name || 'Siswa')}${state.student.kelas ? ' — ' + esc(state.student.kelas) : ''}</b><br>
        Nilai kamu <b>${nilai}</b> • Benar <b>${benar}</b> dari 10 soal</div>
      </div>
      <ul class="result-list">${Q.map((q, k) => `<li><b>${result[k] ? '✅' : '❌'}</b><span>${k + 1}. ${esc(q.q)}${result[k] ? '' : `<br><small><b>Jawaban tepat:</b> ${q.model}</small>`}</span></li>`).join('')}</ul>
      <div class="callout blue">Pelajari jawaban yang tepat pada soal yang masih salah. Tekan “Berikutnya →” untuk membaca ringkasan dan mengisi refleksi.</div>`;
    complete(7, `🎉 Nilaimu ${nilai}. Ringkasan sudah terbuka!`);
  }
  render();
})();

/* =========================================================
   SLIDE 9 — Refleksi & hasil akhir
   ========================================================= */
$('#reflectBtn').addEventListener('click', () => {
  const ids = ['r1', 'r2', 'r3'];
  const short = ids.filter(id => $('#' + id).value.trim().split(/\s+/).filter(w => w.length > 1).length < 5);
  ids.forEach(id => $('#' + id).classList.toggle('bad', short.includes(id)));
  if (short.length) return feedback($('#reflectFb'), 'bad', `<b>Refleksi wajib diisi.</b>Jawab pertanyaan nomor ${short.map(s => s.slice(1)).join(', ')} minimal 5 kata dengan jujur.`);
  ids.forEach(id => { $('#' + id).classList.add('ok'); $('#' + id).disabled = true; });
  $('#reflectBtn').disabled = true;
  feedback($('#reflectFb'), 'ok', '<b>✅ Terima kasih atas refleksimu!</b>Refleksi membantumu menyadari apa yang sudah dan belum kamu kuasai.');
  complete(8);
  const s = state.student, q = state.quiz || { nilai: '-', benar: '-' };
  const fc = $('#finishCard'); fc.style.display = '';
  fc.innerHTML = `<div class="medal">🏅</div><h3 style="font-size:26px">Selamat, ${esc(s.name || 'Siswa')}!</h3>
    <p>Kamu telah menyelesaikan seluruh rangkaian belajar <b>CHEMBOND — Ikatan Kovalen Koordinasi</b>.</p>
    <p>Kelas: <b>${esc(s.kelas || '-')}</b> • Nilai uji pemahaman: <b>${q.nilai}</b> (${q.benar}/10 benar)</p>
    <div id="sheetStatus" class="callout" style="margin:12px auto;max-width:560px"></div>
    <div class="btn-row" style="justify-content:center"><button class="btn btn-gold" id="resendBtn" style="display:none">↻ Kirim Ulang ke Guru</button><button class="btn btn-blue" id="dlBtn">⬇️ Unduh Hasil Belajar (.txt)</button><button class="btn btn-line" id="printBtn">🖨️ Cetak</button></div>`;
  $('#dlBtn').addEventListener('click', () => {
    const txt = [
      'HASIL BELAJAR — CHEMBOND (Ikatan Kovalen Koordinasi)',
      '====================================================',
      `Nama  : ${s.name}`, `Kelas : ${s.kelas}`, `Tanggal: ${new Date().toLocaleString('id-ID')}`,
      `Nilai uji pemahaman: ${q.nilai} (${q.benar}/10 benar)`, '',
      'Pertanyaan pemantik:', $('#pemantikAns').value.trim(), '',
      'Pemahaman simulasi NH3:', $('#nh3Ans').value.trim(), '',
      'Pemahaman simulasi NH4+:', $('#nh4Ans').value.trim(), '',
      'Penjelasan pembentukan H3O+:', $('#h3oAns').value.trim(), '',
      'REFLEKSI', '1. ' + $('#r1').value.trim(), '2. ' + $('#r2').value.trim(), '3. ' + $('#r3').value.trim()
    ].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([txt], { type: 'text/plain;charset=utf-8' }));
    a.download = `hasil-chembond-${(s.name || 'siswa').replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(a); a.click(); a.remove();
  });
  $('#printBtn').addEventListener('click', () => window.print());
  $('#resendBtn').addEventListener('click', sendToSheet);
  sendToSheet();
  fc.scrollIntoView({ behavior: 'smooth', block: 'center' });
  Voice.say(`Selamat, ${s.name}! Kamu telah menyelesaikan seluruh pembelajaran.`);
});

/* ---------------- Mulai ---------------- */
slides[0].classList.add('active');
renderNav();
})();