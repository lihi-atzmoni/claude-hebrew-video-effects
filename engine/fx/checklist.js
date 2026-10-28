    // fx_checklist: a see-through liquid-glass Claude task card rises under your chin; each step spins (orange arc) in turn,
    // then pops a green tick; header shows the Claude star, the title and "n of 5". Mirrored for Hebrew (icons on the right).
    checklist(e, B, C, F) {
      const W = 1080, H = 1920, u = W / 1080, d = e.end - e.start, OR = 'rgb(217,119,87)', GR = 'rgb(52,199,89)', GY = 'rgb(170,170,176)';
      const rows = String(e.text == null || e.text === '' ? 'מצאתי את הפנים שלך::כל פריים|גזרתי אותך מהחדר::מסכת AI|שמתי את הטקסט מאחורייך::עומק|'
        + 'תיקנתי את הצבעים::חמים|ייצאתי ב-4K::2160p' : e.text).split('|').map((x) => x.split('::').concat(['']).slice(0, 2));
      const n = rows.length, cw = W * 0.9, rh = 104 * u, hh = 120 * u, chh = hh + rh * n + 26 * u;
      const span = Math.max(0.4, d - 0.55), doneAt = rows.map((_, i) => 0.3 + span * (i + 1) / n);
      // glass(c, cw, chh, 40u, W/2, cy, amt=0.78, tint=(14,13,16), blur=30u): liquid = the room blurred (sigma 9), x0.9, specular top-left rim; shadowed(24, 12, 120)
      const g = mk(C, 'checklist-glass', null, { width: cw, height: chh, borderRadius: 40 * u });
      const NS = 'http://www.w3.org/2000/svg';
      const svg = (parent, w, h, st) => { const s = document.createElementNS(NS, 'svg'); s.setAttribute('width', w); s.setAttribute('height', h);
        Object.assign(s.style, { position: 'absolute', overflow: 'visible' }, st); parent.appendChild(s); return s; };
      const el = (s, tag, at) => { const x = document.createElementNS(NS, tag); for (const k in at) x.setAttribute(k, at[k]); s.appendChild(x); return x; };
      // header star at (44u, hh/2), mirrored to the right edge: 4 diagonal strokes 7u + 4 straight strokes 5u, length 18u
      const sx = cw - 44 * u, sy = hh / 2, st = svg(g, cw, chh, { left: 0, top: 0 });
      for (let a = 0; a < 4; a++) {
        const ang = a * Math.PI / 2 + Math.PI / 4;
        el(st, 'line', { x1: sx, y1: sy, x2: sx + 18 * u * Math.cos(ang), y2: sy + 18 * u * Math.sin(ang), stroke: OR, 'stroke-width': Math.floor(7 * u) });
        el(st, 'line', { x1: sx, y1: sy, x2: sx + 18 * u * Math.cos(ang + Math.PI / 4), y2: sy + 18 * u * Math.sin(ang + Math.PI / 4), stroke: OR, 'stroke-width': Math.floor(5 * u) });
      }
      mk(g, 'checklist-title', esc(e.title || 'Claude עורך את הסרטון שלך'), { right: 80 * u, top: hh / 2 - 50 * u, height: 100 * u, lineHeight: 100 * u + 'px', fontSize: 42 * u });
      const cnt = mk(g, 'checklist-count', '', { left: 36 * u, top: hh / 2 - 50 * u, height: 100 * u, lineHeight: 100 * u + 'px', fontSize: 28 * u });
      mk(g, 'checklist-rule', null, { left: 30 * u, top: hh - Math.max(1, Math.floor(2 * u)) / 2, width: cw - 60 * u, height: Math.max(1, Math.floor(2 * u)) });
      const r_ = 24 * u, R = rows.map(([txt, meta], i) => {
        const y = hh + 13 * u + rh * i + rh / 2, x = cw - 56 * u;
        const ic = svg(g, 2 * r_, 2 * r_, { left: x - r_, top: y - r_ });
        const ring = el(ic, 'circle', { cx: r_, cy: r_, fill: 'none' });
        const arc = el(ic, 'circle', { cx: r_, cy: r_, r: r_ - 2.5 * u, fill: 'none', stroke: OR, 'stroke-width': Math.floor(5 * u) });
        const dot = el(ic, 'circle', { cx: r_, cy: r_, fill: GR });
        const tick = el(ic, 'polyline', { fill: 'none', stroke: '#fff', 'stroke-width': Math.floor(5 * u), 'stroke-linejoin': 'round' });
        const t = mk(g, 'checklist-txt', esc(txt), { right: 56 * u + 48 * u, top: y - 50 * u, height: 100 * u, lineHeight: 100 * u + 'px', fontSize: 40 * u });
        const m = mk(g, 'checklist-meta', esc(meta), { left: 36 * u, top: y - 50 * u, height: 100 * u, lineHeight: 100 * u + 'px', fontSize: 28 * u });
        return { ring, arc, dot, tick, t, m, start: i ? doneAt[i - 1] : 0.3, done: doneAt[i] };
      });
      frame(e, (lt, f) => {
        const al = clamp((d - lt) / 0.2, 0, 1);
        const y0 = Math.min(Math.max(f.fy + f.fw * 1.35, H * 0.42), H * 0.93 - chh), cy = y0 + chh / 2 + (1 - eo(lt / 0.35)) * H * 0.12;
        gsap.set(g, { x: W / 2, y: cy, xPercent: -50, yPercent: -50, opacity: al * clamp(lt / 0.12, 0, 1) });
        cnt.textContent = `${doneAt.filter((t) => lt >= t).length} מתוך ${n}`;
        R.forEach((r) => {
          const show = (o, v) => o.setAttribute('visibility', v ? 'visible' : 'hidden');
          if (lt >= r.done) {
            const q = eback((lt - r.done) / 0.25), rr = r_ * (0.6 + 0.4 * q), x0 = r_ - rr * 0.5, y1 = r_ - rr * 0.45;
            r.dot.setAttribute('r', rr); show(r.dot, 1); show(r.tick, 1); show(r.ring, 0); show(r.arc, 0);
            r.tick.setAttribute('points', `${x0},${y1 + rr * 0.5} ${x0 + rr * 0.36},${y1 + rr * 0.85} ${x0 + rr},${y1 + rr * 0.1}`);
            r.t.style.color = '#fff'; r.m.style.color = GR;
          } else if (lt >= r.start) {
            const a0 = (lt * 540) % 360, w = Math.floor(5 * u), ra = r_ - w / 2, L = 2 * Math.PI * ra;
            r.ring.setAttribute('r', ra); r.ring.setAttribute('stroke', 'rgba(255,255,255,0.196)'); r.ring.setAttribute('stroke-width', w);
            r.arc.setAttribute('r', ra); r.arc.setAttribute('stroke-dasharray', `${L * 100 / 360} ${L}`); r.arc.setAttribute('transform', `rotate(${a0} ${r_} ${r_})`);
            show(r.dot, 0); show(r.tick, 0); show(r.ring, 1); show(r.arc, 1);
            r.t.style.color = '#fff'; r.m.style.color = GY;
          } else {
            const w = Math.floor(4 * u);
            r.ring.setAttribute('r', r_ - w / 2); r.ring.setAttribute('stroke', 'rgba(255,255,255,0.235)'); r.ring.setAttribute('stroke-width', w);
            show(r.dot, 0); show(r.tick, 0); show(r.ring, 1); show(r.arc, 0);
            r.t.style.color = 'rgba(255,255,255,0.431)'; r.m.style.color = 'rgba(170,170,176,0.353)';
          }
        });
      });
    },
