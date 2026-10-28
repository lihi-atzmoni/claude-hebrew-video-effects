    widgets(e, B, C) {
      // port of fx_glass_widgets -> glass_widgets_v2 (default look): warm grade, 7 liquid-glass widgets behind you (stat tile,
      // render bar, profile, views artifact, now editing, calendar, 4K ring) popping in 0.07s apart and bobbing, plus the
      // "Edited by Claude" pill in front. Panel contents are the original PIL drawing calls on a canvas, redrawn every frame.
      const FONTS = { uim: [500, 'Heebo'], uib: [800, 'Heebo'], mono: [700, 'Rubik'], anton: [900, 'Rubik'] };
      const MONO_LATIN = (s) => `700 ${Math.max(6, Math.floor(s))}px ui-monospace, Menlo, monospace`;
      const fnt = (kind, size) => `${FONTS[kind][0]} ${Math.max(6, Math.floor(size))}px ${FONTS[kind][1]}`;
      const canvas = (w, h) => Object.assign(document.createElement('canvas'), { width: Math.max(1, Math.round(w)), height: Math.max(1, Math.round(h)) });
      Object.keys(FONTS).forEach((k) => document.fonts.load(fnt(k, 100), 'אב12'));
      const W = 1080, H = 1920, u = W / 1080, d = e.end - e.start, white = [255, 255, 255], ORANGE = [217, 119, 87];
      const col = (c, a = 255) => `rgba(${c[0]},${c[1]},${c[2]},${a / 255})`;
      // PIL d.text((x, y), s, font, fill, anchor): 'l'/'m' horizontal, 'a' (ascender, default) / 'm' (middle) vertical
      function txt(x, s, px, py, font, fill, anchor = 'la') {
        const heb = /[\u0590-\u05ff]/.test(s);
        if (anchor[0] === 'l' && !x.ltr) { anchor = 'r' + anchor[1]; px = x.canvas.width - px; }   // RTL: everything (numbers too) hangs off the right edge
        x.font = font; x.direction = heb ? 'rtl' : 'ltr'; x.fillStyle = fill; x.textAlign = { m: 'center', r: 'right' }[anchor[0]] || 'left'; x.textBaseline = 'alphabetic';
        const m = x.measureText(s), fa = m.fontBoundingBoxAscent, fd = m.fontBoundingBoxDescent;
        x.fillText(s, px, anchor[1] === 'm' ? py + (fa - fd) / 2 : py + fa);
      }
      const ell = (x, x0, y0, x1, y1, fill) => { x.fillStyle = fill; x.beginPath(); x.ellipse((x0 + x1) / 2, (y0 + y1) / 2, (x1 - x0) / 2, (y1 - y0) / 2, 0, 0, Math.PI * 2); x.fill(); };
      const rr = (x, x0, y0, x1, y1, r, fill) => { x.fillStyle = fill; x.beginPath(); x.roundRect(x0, y0, x1 - x0, y1 - y0, r); x.fill(); };
      const poly = (x, pts, fill) => { x.fillStyle = fill; x.beginPath(); pts.forEach(([a, b], k) => (k ? x.lineTo(a, b) : x.moveTo(a, b))); x.closePath(); x.fill(); };

      // warm grade mixed in at 0.6*ramp(0.3): img*[1.08,1,0.86]+0.02, as an exact colour matrix on the footage and the cut-out
      const fid = `fx${e.i}-wgwarm`, V = '#src, .matte';
      B.insertAdjacentHTML('beforeend', `<svg width="0" height="0" style="position:absolute"><filter id="${fid}" x="0" y="0" width="1080" height="1920" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"/></filter></svg>`);
      const cm = B.querySelector(`#${fid} feColorMatrix`), grd = e.grade || 'warm';
      const warm = (w) => `${1 + 0.08 * w} 0 0 0 ${0.02 * w} 0 1 0 0 ${0.02 * w} 0 0 ${1 - 0.14 * w} 0 ${0.02 * w} 0 0 0 1 0`;

      // the original face_chip: a round avatar cut from your face, grabbed once at the start of the effect
      let chip = null;
      function faceChip(f, size) {
        if (chip) return chip;
        const v = document.getElementById('src'), n = v && v.nextElementSibling;
        const srcImg = n && n.classList.contains('__render_frame__') && n.complete && n.naturalWidth ? n : (v && v.readyState >= 2 ? v : null);
        const c = canvas(size, size), x = c.getContext('2d');
        if (!srcImg) return c;
        const r = f.fw * 0.9, x0 = Math.floor(Math.max(0, f.fx - r)), y0 = Math.floor(Math.max(0, f.fy - r * 1.05));
        const sw = srcImg.naturalWidth || srcImg.videoWidth || 1080, k = sw / 1080;
        x.beginPath(); x.ellipse(size / 2, size / 2, size / 2, size / 2, 0, 0, Math.PI * 2); x.clip();
        x.drawImage(srcImg, x0 * k, y0 * k, 2 * r * k, 2 * r * k, 0, 0, size, size);
        chip = c; return c;
      }

      const panels = [];
      function G(P, w, h, cx, cy, r, draw, front = false) {
        const el = mk(P, 'widgets-glass' + (front ? ' pill' : ''), null, { left: cx - w / 2, top: cy - h / 2, width: w, height: h, borderRadius: r, opacity: '0' });
        const c = draw ? el.appendChild(canvas(w, h)) : null;
        panels.push({ el, c, x: c && c.getContext('2d'), w, h, draw, i: panels.length, front });
        return el;
      }
      // 1 · stat tile
      const S = 300 * u, ax = 50 * u + S / 2, ay = 118 * u + S / 2;
      const subs = String(e.sub || 'אפקטים|קליפ אחד').split('|');
      G(B, S, S, ax, ay, S * 0.2, (x) => {
        ell(x, S - S * 0.16, S * 0.115, S - S * 0.1, S * 0.175, col(ORANGE));
        txt(x, e.title || 'Claude', S * 0.2, S * 0.145, fnt('uim', S * 0.085), col(white, 235), 'lm');
        txt(x, e.text || '47', S * 0.08, S * 0.2, fnt('uib', S * 0.44), col(white));
        subs.forEach((ln, j) => txt(x, ln, S * 0.1, S * (0.7 + 0.11 * j), fnt('uim', S * 0.085), col(white, 235)));
      });
      // 2 · render bar
      const bw = 400 * u, bh = 150 * u, bx = W - 50 * u - bw / 2, by = 118 * u + bh / 2;
      G(B, bw, bh, bx, by, bh * 0.28, (x, lt) => {
        const p = eio(lt / Math.max(0.3, d * 0.85));
        ell(x, bw - bh * 0.28, bh * 0.2, bw - bh * 0.17, bh * 0.31, 'rgb(255,69,58)');
        txt(x, 'מרנדר', bh * 0.36, bh * 0.255, fnt('uim', bh * 0.19), col(white, 240), 'lm');
        rr(x, bh * 0.17, bh * 0.5, bw - bh * 0.17, bh * 0.6, bh * 0.05, col(white, 70));
        rr(x, bw - bh * 0.17 - (bw - bh * 0.34) * Math.max(0.04, p), bh * 0.5, bw - bh * 0.17, bh * 0.6, bh * 0.05, col(white, 245));
        txt(x, `רינדור 4K \u200F ·\u200F  ${Math.floor(p * 100)}%`, bh * 0.17, bh * 0.78, fnt('uim', bh * 0.14), col(white, 210), 'lm');
      });
      // 3 · profile
      const cy3 = by + bh / 2 + 22 * u + bh / 2;
      const avImg = FX.avatar ? Object.assign(new Image(), { src: FX.avatar }) : null;   // the speaker's profile photo
      G(B, bw, bh, bx, cy3, bh * 0.28, (x, lt, f) => {
        if (avImg && avImg.complete && avImg.naturalWidth) {
          const D = bh * 0.62, cx = bw - bh * 0.19 - D / 2, cy = bh / 2, iw = avImg.naturalWidth, ih = avImg.naturalHeight, m = Math.min(iw, ih);
          x.save(); x.beginPath(); x.arc(cx, cy, D / 2, 0, Math.PI * 2); x.clip();
          x.drawImage(avImg, (iw - m) / 2, Math.max(0, ih * 0.25 - m / 2), m, m, cx - D / 2, cy - D / 2, D, D); x.restore();
        }
        const tx = avImg ? bh * 0.86 : bh * 0.2;
        txt(x, e.name || FX.name, bw - tx, bh * 0.36, fnt('uib', bh * 0.22), col(white), 'rm');
        txt(x, e.handle || FX.handle, bw - tx, bh * 0.66, fnt('uim', bh * 0.14), col(white, 215), 'rm');
      });
      // 4 · views artifact (a mini page inside the glass)
      const aw = 330 * u, ah = 330 * u, dx = 50 * u + aw / 2, dy = ay + S / 2 + 26 * u + ah / 2;
      const inn = canvas(aw - 36 * u, ah - 74 * u), di = inn.getContext('2d'), iw = inn.width, ih = inn.height;
      G(B, aw, ah, dx, dy, 44 * u, (x, lt) => {
        txt(x, 'artifact · views.html', 24 * u, 30 * u, MONO_LATIN(15 * u), col(white, 220), 'lm');
        di.clearRect(0, 0, iw, ih); rr(di, 0, 0, iw, ih, 20 * u, 'rgb(250,248,244)');
        [[255, 95, 87], [255, 189, 46], [40, 200, 64]].forEach((c, j) => ell(di, 14 * u + j * 16 * u, 14 * u, 24 * u + j * 16 * u, 24 * u, col(c)));
        txt(di, 'הרילס המובילים', 16 * u, 40 * u, fnt('uib', 26 * u), 'rgb(24,22,26)');
        di.letterSpacing = '-1px'; txt(di, '197K', 16 * u, 72 * u, fnt('anton', 44 * u), 'rgb(200,85,61)'); di.letterSpacing = '0px';
        const vals = [197, 140, 124, 83, 50, 40, 38], gx0 = 16 * u, gx1 = iw - 16 * u, gy1 = ih - 18 * u, bwid = (gx1 - gx0) / 7 * 0.66;
        vals.forEach((v, j) => {
          const q = eo((lt - 0.35 - 0.05 * j) / 0.4), hh = (ih * 0.42) * v / 197 * q, x0 = gx0 + (gx1 - gx0) * j / 7;
          if (hh > 1) rr(di, x0, gy1 - hh, x0 + bwid, gy1, 5 * u, j === 0 ? 'rgb(242,196,109)' : 'rgb(200,85,61)');
        });
        x.drawImage(inn, Math.floor(18 * u), Math.floor(56 * u));
      });
      // 5 · now playing
      const mw = 360 * u, mh = 220 * u, mx = W - 50 * u - mw / 2, my = cy3 + bh / 2 + 22 * u + mh / 2, A = Math.floor(96 * u);
      const art2 = canvas(A, A), a2 = art2.getContext('2d'), gr = a2.createLinearGradient(0, 0, 0, A);
      gr.addColorStop(0, 'rgb(255,150,110)'); gr.addColorStop(1, 'rgb(217,90,70)');
      a2.beginPath(); a2.roundRect(0, 0, A, A, 16 * u); a2.clip(); a2.fillStyle = gr; a2.fillRect(0, 0, A, A);
      a2.strokeStyle = '#fff'; a2.lineWidth = Math.floor(7 * u);
      for (let k = 0; k < 6; k++) { const g = k * Math.PI / 3; a2.beginPath(); a2.moveTo(A / 2 - 26 * u * Math.cos(g), A / 2 - 26 * u * Math.sin(g)); a2.lineTo(A / 2 + 26 * u * Math.cos(g), A / 2 + 26 * u * Math.sin(g)); a2.stroke(); }
      G(B, mw, mh, mx, my, 40 * u, (x, lt) => {
        x.drawImage(art2, Math.floor(mw - 22 * u - A), Math.floor(22 * u));
        txt(x, 'מתנגן עכשיו', 134 * u, 44 * u, fnt('uim', 17 * u), col(white, 200), 'lm');
        txt(x, e.song || 'הסאונד של הרילס', 134 * u, 78 * u, fnt('uib', 28 * u), col(white), 'lm');
        txt(x, 'אודיו מקורי · 0:25', 134 * u, 108 * u, fnt('uim', 20 * u), col(white, 200), 'lm');
        const pp = clamp(lt / Math.max(0.5, d), 0, 1);
        rr(x, 22 * u, 140 * u, mw - 22 * u, 146 * u, 3 * u, col(white, 70));
        rr(x, mw - 22 * u - (mw - 44 * u) * pp, 140 * u, mw - 22 * u, 146 * u, 3 * u, col(white, 240));
        const cxm = mw / 2, cym = 184 * u;
        poly(x, [[cxm - 12 * u, cym - 16 * u], [cxm - 12 * u, cym + 16 * u], [cxm + 16 * u, cym]], col(white));
        for (const sg of [-1, 1]) {
          const px = cxm + sg * 80 * u;
          poly(x, [[px - sg * 10 * u, cym - 11 * u], [px - sg * 10 * u, cym + 11 * u], [px + sg * 6 * u, cym]], col(white, 220));
          poly(x, [[px + sg * 4 * u, cym - 11 * u], [px + sg * 4 * u, cym + 11 * u], [px + sg * 20 * u, cym]], col(white, 220));
        }
      });
      // 6 · calendar
      const kw = 330 * u, kh = 190 * u, kx = 50 * u + kw / 2, ky = dy + ah / 2 + 26 * u + kh / 2;
      G(B, kw, kh, kx, ky, 40 * u, (x) => {
        txt(x, e.day || 'יום ד׳', 26 * u, 36 * u, fnt('uib', 22 * u), 'rgb(255,92,82)', 'lm');
        txt(x, e.date || '21', 26 * u, 82 * u, fnt('uib', 56 * u), col(white), 'lm');
        rr(x, 22 * u, 120 * u, kw - 22 * u, 168 * u, 12 * u, col([255, 92, 82], 210));
        txt(x, e.event || 'להעלות 2 רילס · הערב', 36 * u, 144 * u, fnt('uib', 22 * u), col(white), 'lm');
      });
      // 7 · 4K ring
      const R = 250 * u, rx = W - 50 * u - R / 2, ry = my + mh / 2 + 26 * u + R / 2;
      G(B, R, R, rx, ry, 56 * u, (x, lt) => {
        const rp = eio((lt - 0.4) / 1.0), rr0 = R * 0.34, lw = Math.floor(16 * u), cyr = R / 2 - 8 * u;
        x.lineWidth = lw; x.lineCap = 'butt';
        x.strokeStyle = col(white, 60); x.beginPath(); x.arc(R / 2, cyr, rr0 - lw / 2, 0, Math.PI * 2); x.stroke();
        if (rp > 0) { x.strokeStyle = 'rgb(52,199,89)'; x.beginPath(); x.arc(R / 2, cyr, rr0 - lw / 2, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * rp); x.stroke(); }
        txt(x, '4K', R / 2, R / 2 - 8 * u, fnt('uib', 52 * u), col(white), 'mm');
        txt(x, 'רינדור', R / 2, R - 26 * u, fnt('uim', 20 * u), col(white, 210), 'mm');
      });
      // 8 · Edited by Claude pill (in front)
      const pre = 'נערך ע״י ', hi = 'Claude', fs = W * 0.045, mm = canvas(1, 1).getContext('2d'), ph = W * 0.105, py = H * 0.875;
      let pillOk = false;
      const pillW = () => { mm.font = fnt('uim', fs); const t1 = mm.measureText(pre).width; mm.font = fnt('uib', fs); return t1 + mm.measureText(hi).width + ph * 0.9; };
      const pill = G(C, pillW(), ph, W / 2, py, ph / 2, null, true);
      pill.innerHTML = `<span style="font-size:${Math.floor(fs)}px">${esc(pre).replace(/ $/, '&nbsp;')}</span><b style="font-size:${Math.floor(fs)}px">${esc(hi)}</b>`;

      frame(e, (lt, f) => {
        const k0 = ramp(lt, d, 0.3, 0), al = clamp((d - lt) / 0.2, 0, 1);
        if (!pillOk && document.fonts.check(fnt('uib', 50), 'אב') && document.fonts.check(fnt('uim', 50), 'אב')) { const pw = pillW(); Object.assign(pill.style, { width: pw + 'px', left: W / 2 - pw / 2 + 'px' }); pillOk = true; }
        if (grd !== 'none') { cm.setAttribute('values', warm(0.6 * k0)); document.querySelectorAll(V).forEach((v) => { v.style.filter = `url(#${fid})`; }); }
        panels.forEach((p) => {
          const t0 = 0.07 * p.i;
          if (lt < t0) { p.el.style.opacity = '0'; return; }
          if (p.draw) { p.x.clearRect(0, 0, p.c.width, p.c.height); p.draw(p.x, lt, f); }
          const bob = 0, pop = lt > t0 ? eback((lt - t0) / 0.32) : 0;
          gsap.set(p.el, { y: bob, scale: 0.6 + 0.4 * pop, opacity: al * clamp((lt - t0) / 0.08, 0, 1) });
        });
      });
      tl.set(V, { filter: 'none' }, e.end);
    },
