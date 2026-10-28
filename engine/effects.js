// Each effect builds DOM into three layers and adds tweens to one paused timeline.
//   b = behind you (under the cut-out)   c = in front of you, moves with the camera   f = on the screen (no camera)
(function () {
  const FX = window.FX, T = FX.track, CARDS = FX.cards || [];
  const tl = gsap.timeline({ paused: true });
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const split = (s, d) => String(s == null || s === '' ? d : s).split('|').map((x) => x.trim()).filter(Boolean);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const fit = (s, maxW, max, k = 0.62) => Math.round(Math.min(max, maxW / (Math.max(1, [...String(s)].length) * k)));

  function mk(parent, cls, html, style) {
    const d = document.createElement('div');
    if (cls) d.className = cls;
    if (html != null) d.innerHTML = html;
    if (style) for (const k in style) d.style[k] = typeof style[k] === 'number' ? style[k] + 'px' : style[k];
    parent.appendChild(d);
    return d;
  }
  // head at time t: x = centre, top = top of hair, w = head width, y = face centre, chin = under the chin
  function head(t) {
    const n = T.x.length, i = clamp(t * T.fps, 0, n - 1), a = Math.floor(i), b = Math.min(a + 1, n - 1), f = i - a;
    const L = (k) => T[k][a] * (1 - f) + T[k][b] * f;
    const x = L('x'), top = L('top'), w = L('w');
    return { x, top, w, y: top + 1.2 * w, chin: top + 2.05 * w };
  }
  const pop = (node, t, from, dur = 0.4, ease = 'power3.out') =>
    tl.fromTo(node, Object.assign({ opacity: 0 }, from), { opacity: 1, x: 0, y: 0, scale: 1, rotation: 0, duration: dur, ease }, t);
  const fadeIn = (node, t, dur = 0.3) => tl.fromTo(node, { opacity: 0 }, { opacity: 1, duration: dur, ease: 'power1.out' }, t);
  const CAM0 = { scale: 1, x: 0, y: 0 };
  const eo = (x) => 1 - Math.pow(1 - clamp(x, 0, 1), 3);
  function faceCam(h, z, headAt = 0.4) {
    z = Math.min(z, 2);
    const x0 = clamp(h.x - 540 / z, 0, 1080 - 1080 / z), y0 = clamp(h.y + (1920 / z) * (0.5 - headAt) - 960 / z, 0, 1920 - 1920 / z);
    gsap.set('#cam', { transformOrigin: '0px 0px', scale: z, x: -x0 * z, y: -y0 * z });
  }
  // per-frame model: fn(lt, f) runs on every frame (seek-safe). f = face at that time: fx, fy (face centre), fw (face width), plus head fields
  const faceAt = (t) => { const h = head(t); return Object.assign({ fx: h.x, fy: h.y, fw: h.w * 0.8 }, h); };
  function frame(e, fn) {
    const o = { t: 0 }, d = e.end - e.start, draw = () => fn(o.t, faceAt(e.track ? e.start + o.t : e.start));   // effects stay still unless e.track
    tl.fromTo(o, { t: 0 }, { t: d, duration: d, ease: 'none', onUpdate: draw, onStart: draw }, e.start);
  }
  const eio = (x) => { x = clamp(x, 0, 1); return 3 * x * x - 2 * x * x * x; };
  const eback = (x) => eo(x);   // no overshoot: things appear smoothly and never bounce
  const ramp = (lt, d, tin = 0.25, tout = 0.2) => clamp(lt / tin, 0, 1) * (tout ? clamp((d - lt) / tout, 0, 1) : 1);
  function camRun(e, fn) {
    const o = { t: 0 }, d = e.end - e.start, draw = () => fn(o.t, head(e.track ? e.start + o.t : e.start));
    tl.fromTo(o, { t: 0 }, { t: d, duration: d, ease: 'none', onUpdate: draw, onStart: draw }, e.start);
    tl.set('#cam', CAM0, e.end);
  }
  function camFilter(e, f, dur = 0.3) {
    const V = '#src, .matte';   // grade the footage only, so coloured effects keep their colour
    tl.fromTo(V, { filter: 'none' }, { filter: f, duration: dur, immediateRender: false }, e.start);
    tl.fromTo(V, { filter: f }, { filter: 'none', duration: 0.25, immediateRender: false }, e.end - 0.25);
  }
  function chars(parent, s) { return [...String(s)].map((ch) => parent.appendChild(Object.assign(document.createElement('i'), { textContent: ch }))); }
  function typeOut(spans, t, per) { spans.forEach((sp, k) => tl.set(sp, { display: 'inline' }, t + k * per)); return t + spans.length * per; }
  const GRADES = {
    moody: 'contrast(1.18) saturate(0.72) brightness(0.88) sepia(0.12)', bw: 'grayscale(1) contrast(1.22) brightness(0.98)',
    warm: 'sepia(0.28) saturate(1.25) brightness(1.04) contrast(1.04)', cool: 'saturate(0.85) hue-rotate(-12deg) brightness(1.03) contrast(1.05)',
    pop: 'saturate(1.5) contrast(1.12)', film: 'sepia(0.2) contrast(1.1) saturate(0.9) brightness(0.95)',
  };
  const grade = (g) => GRADES[g] || GRADES.moody;
  const VARY = { pop: 'saturate(1.35) contrast(1.12)', bw: 'grayscale(1) contrast(1.25)', warm: 'sepia(0.12) saturate(1.1) brightness(1.03)',
    cool: 'saturate(0.92) hue-rotate(8deg) brightness(0.98)', moody: 'saturate(0.6) brightness(0.86) contrast(1.12)' };
  // a word behind the head: mostly visible above it, only the bottom tucked behind; shrinks when there's no room above
  function behind(h, sz) {
    sz = Math.min(sz, (h.top - 20) / 0.82);
    return { sz: Math.round(sz), top: h.top - 0.82 * sz };
  }
  function darkRoom(L, e, h, alpha = 0.93) {
    const dk = mk(L, 'full', null, { background: `radial-gradient(ellipse 700px 1150px at ${h.x}px ${h.y + 520}px, rgba(0,0,0,.22), rgba(0,0,0,${alpha}) 78%)` });
    fadeIn(dk, e.start, 0.35);
    return dk;
  }
  function cardImg(i) { return CARDS.length ? `url('${CARDS[i % CARDS.length]}')` : 'linear-gradient(#f3d9c8,#c98d74)'; }

  const E = {
    backdrop(e, B) {
      const h = head(e.start), txt = e.text || 'קלוד', bold = e.font === 'bold', x = 540 * 0.6 + h.x * 0.4;
      const { sz, top } = behind(h, fit(txt, 1080 * 0.94, 400, bold ? 0.62 : 0.5));
      const w = mk(B, 'word' + (bold ? '' : ' serif'), esc(txt), { left: x - 540, top, fontSize: sz, lineHeight: '1',
        color: e.color || '#f2a9c4', textShadow: '0 5px 10px rgba(0,0,0,.63)' });
      tl.fromTo(w, { y: -(top + sz) }, { y: 0, duration: 0.42, ease: 'power3.out' }, e.start);
    },
    glitter(e, B, C) {
      const h = head(e.start), txt = e.text || 'מושלם', sz = fit(txt, 980, 300);
      darkRoom(B, e, h, 0.9);
      const r = mk(B, 'rays', null, { left: h.x - 1200, top: h.y - 1200 });
      fadeIn(r, e.start, 0.4);   // the rays stay still
      const w = mk(B, 'word gold', esc(txt), { top: h.top - sz * 0.35, fontSize: sz });
      pop(w, e.start + 0.2, { scale: 0.7 }, 0.6);
      for (let i = 0; i < 22; i++) {
        const a = rnd() * Math.PI * 2, rr = 260 + rnd() * 330, s = 26 + rnd() * 50;
        const sp = mk(i % 3 ? B : C, 'spark', '✦', { left: h.x + Math.cos(a) * rr, top: h.y + Math.sin(a) * rr * 1.2 - 120, fontSize: s });
        const t0 = e.start + 0.2 + rnd() * 0.6;
        tl.fromTo(sp, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.35, ease: 'power3.out' }, t0);   // each sparkle appears once and stays
      }
    },
    zoom(e) {
      const Z = clamp(+e.zoom || 1.45, 1, 2), sp = +e.speed || 0.18;
      camRun(e, (lt, h) => faceCam(h, 1 + (Z - 1) * eo(lt / sp), 0.42));
    },
    locked(e, B, C, F) {
      e.track = true;  // the brackets follow the face
      const Z = clamp(+e.zoom || 1.35, 1, 2), d = e.end - e.start;
      const pin = mk(C, 'pin'), br = [0, 1, 2, 3].map((k) => mk(pin, 'lk lk' + k)), tag = e.text ? mk(pin, 'lk-tag', `<span>${esc(e.text)}</span>`) : null;
      camRun(e, (lt, h) => {
        const fw = h.w * 0.8, z = 1 + (Z - 1) * eo(lt / 0.6);
        faceCam(h, z);
        const sc = 0.85 * fw * (1 + 0.6 * (1 - eo(lt / 0.22))), bw = 2 * sc, bh = 2.5 * sc + 10, L = sc * 0.32 + 'px', lw = 5.4 / z + 'px';
        gsap.set(pin, { x: h.x, y: h.y, opacity: clamp(lt / 0.12, 0, 1) * clamp((d - lt) / 0.2, 0, 1) });
        br.forEach((n, k) => gsap.set(n, { left: (k % 2 ? bw / 2 : -bw / 2), top: (k < 2 ? -bh / 2 : bh / 2), width: L, height: L, borderWidth: lw }));
        if (tag) gsap.set(tag, { top: sc * 1.25 + 30, opacity: clamp((lt - 0.15) / 0.15, 0, 1), scale: 1 / z });
      });
    },
    push(e) {
      const h = head(e.start), z = clamp(+e.zoom || 1.6, 1, 2), blur = +e.blur || 10;
      tl.fromTo('#cam', Object.assign({}, CAM0, { transformOrigin: `${h.x}px ${h.y}px` }), { scale: z, duration: e.end - e.start - 0.25, ease: 'power1.inOut', immediateRender: false }, e.start);
      tl.fromTo('#cam', { scale: z }, Object.assign({ duration: 0.25, ease: 'power2.inOut', immediateRender: false }, CAM0), e.end - 0.25);
      tl.fromTo('#src', { filter: 'blur(0px)' }, { filter: `blur(${blur}px)`, duration: 1, immediateRender: false }, e.start);
      tl.fromTo('#src', { filter: `blur(${blur}px)` }, { filter: 'blur(0px)', duration: 0.25, immediateRender: false }, e.end - 0.25);
    },
    messages(e, B, C, F) {
      const msgs = split(e.text, 'ראית את הסרטון האחרון?|איך עשית את האפקט הזה?!|תשלחי לי את הסקיל 🙏');
      const base = (+e.y || 0.78) * 1920, step = (e.end - e.start - 0.4) / msgs.length, gap = 180;
      msgs.forEach((m, k) => {
        const outer = mk(F, 'pin', null, { left: 0, top: base }), card = mk(outer, 'msg', `<div class="msg-ic"></div><div class="msg-tx"><b>${esc(e.title || 'הודעות')}<s>עכשיו</s></b><p>${esc(m)}</p></div>`, { top: 0 });
        const t = e.start + k * step;
        pop(card, t, { y: 70, scale: 0.9 }, 0.4, 'power3.out');
        for (let j = k + 1; j < msgs.length; j++) tl.to(outer, { y: -(j - k) * gap, duration: 0.3, ease: 'power3.out' }, e.start + j * step);
      });
    },
    graph(e, B, C) {
      const h = head(e.start), W = 640, Hc = 420, to = String(e.to || '197K'), m = to.match(/^([^\d]*)([\d.,]+)(.*)$/) || ['', '', '100', ''];
      const end = parseFloat(m[2].replace(/,/g, '')), from = parseFloat(String(e.from || 0)), dec = (m[2].split('.')[1] || '').length;
      const card = mk(C, 'glass', null, { left: clamp(h.x - W / 2, 40, 1040 - W), top: clamp(h.chin + 20, 800, 1660 - Hc), width: W, height: Hc, overflow: 'hidden' });
      mk(card, 'gr-lbl', esc(e.text || 'צפיות החודש'));
      const num = mk(card, 'gr-num', esc(m[1] + from + m[3]));
      const col = e.color || '#34d17a';
      const pts = [0, 0.08, 0.05, 0.2, 0.17, 0.35, 0.3, 0.55, 0.5, 0.78, 1].map((v, i) => [20 + i * 60, 180 - v * 150]);
      const d = 'M' + pts.map((p) => p.join(',')).join(' L');
      const svg = mk(card, 'gr-svg', `<svg width="640" height="200" viewBox="0 0 640 200"><defs><linearGradient id="gg${e.i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${col}" stop-opacity=".45"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></linearGradient></defs><path class="ar" d="${d} L620,200 L20,200 Z" fill="url(#gg${e.i})"/><path class="ln" d="${d}" fill="none" stroke="${col}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" /></svg>`);
      const dur = Math.max(0.8, e.end - e.start - 0.8);
      pop(card, e.start, { y: 80, scale: 0.92 }, 0.45, 'power3.out');
      tl.fromTo(svg.querySelector('.ln'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: dur, ease: 'power2.inOut' }, e.start + 0.3);
      tl.fromTo(svg.querySelector('.ar'), { opacity: 0 }, { opacity: 1, duration: dur, ease: 'power2.in' }, e.start + 0.3);
      const o = { v: from };
      tl.fromTo(o, { v: from }, { v: end, duration: dur, ease: 'power2.inOut', onUpdate: () => { num.textContent = m[1] + o.v.toFixed(dec) + m[3]; } }, e.start + 0.3);
    },
    toggles(e, B, C) {
      const rows = split(e.text, 'עריכה אוטומטית|הסרת שקטים|כתוביות בעברית|אפקטים של קלוד');
      const h = head(e.start), W = 800, Hc = 100 + rows.length * 96 + 20;
      const card = mk(C, 'glass light', null, { left: clamp(h.x - W / 2, 40, 1040 - W), top: clamp(h.chin + 30, 760, 1690 - Hc), width: W, height: Hc });
      mk(card, 'tg-h', esc(e.title || 'הגדרות'));
      pop(card, e.start, { y: 80, scale: 0.92 }, 0.45, 'power3.out');
      const ticks = split(e.ticks, '').map(Number), step = (e.end - e.start - 0.8) / rows.length;
      rows.forEach((r, k) => {
        const row = mk(card, 'tg-row'); mk(row, null, esc(r));
        const sw = mk(row, 'tg-sw'), on = mk(sw, 'tg-on'), kn = mk(sw, 'tg-k');
        const t = ticks[k] || e.start + 0.5 + k * step;
        tl.fromTo(on, { opacity: 0 }, { opacity: 1, duration: 0.2 }, t);
        tl.fromTo(kn, { x: 42 }, { x: 0, duration: 0.25, ease: 'power3.out' }, t);   // RTL: on = knob to the left
      });
    },
    led(e, B) {
      const h = head(e.start), lines = split(e.text, 'תגיבו|סקיל'), col = e.color || '#ff4fa3';
      darkRoom(B, e, h, 0.95);
      const room = h.top + 0.35 * h.w - 60, sz = Math.round(Math.min(...lines.map((l) => fit(l, 1000, 300, 0.64)), room / lines.length / 1.02)), y0 = Math.max(40, h.top + 0.35 * h.w - lines.length * sz * 1.02);
      let t = e.start + 0.3; const per = Math.min(0.1, (e.end - e.start - 0.8) / Math.max(1, lines.join('').length));
      lines.forEach((l, k) => {
        const st = { top: y0 + k * sz * 1.02, fontSize: sz, color: col };
        const g = mk(B, 'led glow', null, st), dd = mk(B, 'led dots', null, Object.assign({}, st, { color: '#fff' }));
        dd.style.textShadow = `0 0 6px ${col}`;
        const sg = chars(g, l), sd = chars(dd, l);
        typeOut(sg, t, per); t = typeOut(sd, t, per);
      });
    },
    grade(e) { camFilter(e, grade(e.grade)); },
    orbit(e, B, C) {
      const K = +e.count || 6, cw = 1080 * (+e.size || 0.27), ch = cw * 16 / 9, sp = +e.speed || 1.2, d = e.end - e.start;
      const looks = ['pop', 'bw', 'warm', 'cool', 'moody'], eo = (x) => 1 - Math.pow(1 - clamp(x, 0, 1), 3), pair = [];
      for (let i = 0; i < K; i++) {
        const st = { left: -cw / 2, top: -ch / 2, width: cw, height: ch, borderRadius: cw * 0.07, backgroundImage: cardImg(i), filter: VARY[looks[i % 5]],
          border: 'none', outline: '2px solid rgba(0,0,0,.27)', outlineOffset: '-2px', backgroundSize: 'cover', backgroundPosition: 'center',
          boxShadow: `0 ${cw / 22}px ${cw / 8}px rgba(0,0,0,.59)` };
        pair.push([mk(mk(B, 'pin'), 'ncard', null, st), mk(mk(C, 'pin'), 'ncard', null, st)]);
      }
      const o = { t: 0 };
      const draw = () => {
        const lt = o.t, h = head(e.start), fw = h.w * 0.8, intro = eo(lt / 0.4), a = clamp((d - lt) / 0.25, 0, 1) * clamp(lt / 0.15, 0, 1);
        const rx = 1080 * 0.38 * intro, ry = Math.max(fw * 1.5, 1920 * 0.1), oy = h.y + fw * 0.9;
        pair.forEach(([b, c], i) => {
          const th = (i * 2 * Math.PI) / K + lt * sp, dp = Math.sin(th);
          const p = { x: h.x + rx * Math.cos(th), y: oy + ry * dp, scale: (0.78 + (0.24 * (dp + 1)) / 2) * (0.5 + 0.5 * intro), rotation: 6 * Math.cos(th), zIndex: Math.round(dp * 100) + 100 };
          gsap.set(b.parentNode, p); gsap.set(c.parentNode, p);
          b.style.opacity = dp < 0 ? a : 0; c.style.opacity = dp >= 0 ? a : 0;
        });
      };
      tl.fromTo(o, { t: 0 }, { t: d, duration: d, ease: 'none', onUpdate: draw, onStart: draw }, e.start);
    },
    noise(e, B) {
      const h = head(e.start), per = +e.per || 9, rows = +e.rows || 3, n = per * rows, fw = h.w * 0.8;
      const cx = 540 * 0.6 + h.x * 0.4, cy = h.y + fw * 0.3, looks = ['pop', 'bw', 'warm', 'cool', 'moody'];
      const every = Math.min(0.22, (e.end - e.start - 0.45) / n);
      for (let r = 0; r < rows; r++) {
        const R = 1080 * (0.5 - (0.22 * r) / Math.max(1, rows - 1));
        for (let k = 0; k < per; k++) {
          const i = r * per + k, a = Math.PI * (0.94 - (0.88 * k) / (per - 1));
          const pin = mk(B, 'pin', null, { left: cx + R * Math.cos(a), top: cy - R * Math.sin(a) * 1.05 });
          const c = mk(pin, 'ncard', `<i style="background-image:${cardImg(i)};filter:${grade(looks[i % 5])}"></i><b>${i + 1}</b>`);
          const t = e.start + i * every, rot = -((a - Math.PI / 2) * 180) / Math.PI * 0.3;
          tl.fromTo(c, { opacity: 0, scale: 0.6, rotation: rot }, { opacity: 1, duration: 0.08, ease: 'none' }, t);
          tl.fromTo(c, { scale: 0.6 }, { scale: 1, duration: 0.25, ease: 'power3.out', immediateRender: false }, t);
        }
      }
    },
    lineup(e, B) {
      const names = split(e.text, 'מניפה|אריחים|נעילה|מסלול|זום|מילה ענקית|זרקור|קבלה|מודי|לפני אחרי|פתק|תגובה|עקבו|עצירה|מחיקה|פילם|מקשים|חותמת|ספירה|מנהרה|מגזין|שרבוט');
      const h = head(e.start), n = names.length, outer = Math.ceil(n / 2 + 0.5), fw = h.w * 0.8, slots = [];
      const cx = 540 * 0.6 + h.x * 0.4, cy = h.y + fw * 0.3;
      [[outer, 1080 * 0.47], [n - outer, 1080 * 0.33]].forEach(([cnt, R]) => {
        for (let k = 0; k < cnt; k++) {
          const a = Math.PI * (0.94 - (0.88 * k) / Math.max(1, cnt - 1));
          slots.push([cx + R * Math.cos(a), cy - R * Math.sin(a) * 1.05, -((a - Math.PI / 2) * 180) / Math.PI * 0.3]);
        }
      });
      names.forEach((nm, i) => {
        const [x, y, r] = slots[i], t = e.start + 0.035 * i;
        const tile = mk(mk(B, 'pin', null, { left: x, top: y }), 'ltile', `<s>${String(i + 1).padStart(2, '0')}</s><span>${esc(nm)}</span>`);
        tl.fromTo(tile, { opacity: 0, scale: 0.5, y: 40, rotation: r }, { opacity: 1, duration: 0.1, ease: 'none' }, t);
        tl.fromTo(tile, { scale: 0.5, y: 40 }, { scale: 1, y: 0, duration: 0.3, ease: 'power3.out', immediateRender: false }, t);
      });
    },
    /*PARTS*/
  };

  // build only after every font has loaded, so text measured while building never changes size between frames
  const FONTS = ['300', '400', '500', '600', '700', '800', '900'].map((w) => `${w} 40px Heebo`)
    .concat(['400', '500', '700', '800', '900'].map((w) => `${w} 40px Rubik`), ['900 40px FrankRuhl', '40px Gveret']);
  Promise.all(FONTS.map((f) => document.fonts.load(f, 'אבג abc 123'))).catch(() => {}).then(() => {
  FX.effects.forEach((e, i) => {
    e.i = i; e.start = +e.start; e.end = +e.end;
    const L = ['b', 'c', 'f'].map((k) => mk(document.getElementById(`fx${i}-${k}`), 'wrap'));
    E[e.fx](e, L[0], L[1], L[2]);
    if (e.label) {
      const lb = mk(L[2], 'lbl', esc(e.label));
      pop(lb, e.start, { y: 30 }, 0.3, 'power3.out');
    }
    if (!e.cut) tl.fromTo(L, { opacity: 1 }, { opacity: 0, duration: 0.22, ease: 'power1.in', immediateRender: false }, e.end - 0.22);
  });
  window.__timelines['main'] = tl;
  });
})();
