    cover(e, B, C) {
      // port of fx_cover_star (default look): pop grade, a giant masthead sliding down behind your head, an issue line,
      // cover lines on the left (first one big, thin, yellow) and a barcode bottom-right; lines + barcode avoid the face (guard)
      const FONTS = { bold: [900, 'Rubik'], serif: [300, 'Heebo'], mono: [700, 'Rubik'], big: [800, 'Heebo'], line: [600, 'Heebo'] };
      const fnt = (kind, size) => `${FONTS[kind][0]} ${Math.max(6, Math.floor(size))}px ${FONTS[kind][1]}`;
      const canvas = (w, h) => Object.assign(document.createElement('canvas'), { width: Math.max(1, Math.round(w)), height: Math.max(1, Math.round(h)) });
      const g2 = (c) => { const x = c.getContext('2d'); x.direction = 'rtl'; x.textAlign = 'left'; return x; };
      const FL = Object.keys(FONTS).map((k) => fnt(k, 100)), SAMPLE = 'אב12';
      FL.forEach((f) => document.fonts.load(f, SAMPLE));
      const ready = () => FL.every((f) => document.fonts.check(f, SAMPLE));
      const M = g2(canvas(1, 1)), measure = (s, kind, size) => { M.font = fnt(kind, size); return M.measureText(s); };
      const rgbs = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
      const rgbOpt = (v, def) => { const h = String(v || '').replace('#', ''); return h.length === 6 ? [0, 2, 4].map((k) => parseInt(h.slice(k, k + 2), 16)) : def; };
      // text_img: ink box + pad, optional soft shadow (black 160, dy shadow/2, blur sigma = shadow)
      function textImg(s, size, kind, fill, o = {}) {
        const sh = o.shadow || 0, t = measure(s, kind, size), pad = Math.floor(size * 0.2 + sh * 2.5) + 4;
        const w = t.actualBoundingBoxLeft + t.actualBoundingBoxRight + 2 * pad, h = t.actualBoundingBoxAscent + t.actualBoundingBoxDescent + 2 * pad;
        const px = pad + t.actualBoundingBoxLeft, py = pad + t.actualBoundingBoxAscent, c = canvas(w, h), x = g2(c);
        const draw = (ctx, col, dy) => { ctx.font = fnt(kind, size); ctx.fillStyle = col; ctx.fillText(s, px, py + dy); };
        if (sh) { const l = canvas(w, h); draw(g2(l), 'rgba(0,0,0,0.627)', sh * 0.5); x.filter = `blur(${sh}px)`; x.drawImage(l, 0, 0); x.filter = 'none'; }
        draw(x, rgbs(fill), 0);
        return c;
      }
      const fitText = (s, maxW, kind, start, fill, o) => { let size = start; while (size > 10 && measure(s, kind, size).width > maxW) size = Math.floor(size * 0.92); return textImg(s, size, kind, fill, o); };
      function place(ctx, im, cx, cy, sc = 1, rot = 0, al = 1) {
        if (sc <= 0.01 || al <= 0) return;
        ctx.save(); ctx.globalAlpha = Math.min(1, al); ctx.translate(cx, cy); ctx.rotate(-rot * Math.PI / 180); ctx.scale(sc, sc);
        ctx.drawImage(im, -im.width / 2, -im.height / 2); ctx.restore();
      }
      const comp = (ctx, im, x, y, al = 1) => { if (al <= 0) return; ctx.globalAlpha = Math.min(1, al); ctx.drawImage(im, Math.round(x), Math.round(y)); ctx.globalAlpha = 1; };
      const store = {}, cached = (k, fn) => { if (store[k]) return store[k]; const v = fn(); if (ready()) store[k] = v; return v; };
      // the original guard: hide where (inside the face ellipse) AND (on the person); the cut-out comes from the matte frame
      const GM = canvas(1080, 1920), gm = GM.getContext('2d');
      const matteImg = () => {
        for (const v of document.querySelectorAll('video.matte')) {
          const n = v.nextElementSibling;
          if (n && n.classList.contains('__render_frame__') && n.complete && n.naturalWidth && n.style.visibility === 'visible') return n;
          if (v.readyState >= 2 && getComputedStyle(v).visibility !== 'hidden') return v;
        }
        return null;
      };
      function guard(ctx, f) {
        const ax = f.fw * 0.95, ay = f.fw * 1.35, r0 = Math.sqrt(0.9), R = Math.sqrt(1.2);
        const g = gm.createRadialGradient(0, 0, 0, 0, 0, R);
        for (let i = 0; i <= 8; i++) { const r = r0 + (R - r0) * i / 8; g.addColorStop(r / R, `rgba(0,0,0,${clamp((1.2 - r * r) / 0.3, 0, 1)})`); }
        g.addColorStop(0, 'rgba(0,0,0,1)');
        const m = matteImg();
        gm.clearRect(0, 0, 1080, 1920);
        if (m) { gm.globalCompositeOperation = 'source-over'; gm.drawImage(m, 0, 0, 1080, 1920); gm.globalCompositeOperation = 'destination-in'; }
        gm.save(); gm.translate(f.fx, f.fy); gm.scale(ax, ay); gm.fillStyle = g; gm.beginPath(); gm.arc(0, 0, R, 0, Math.PI * 2); gm.fill(); gm.restore();
        gm.globalCompositeOperation = 'source-over';
        ctx.save(); ctx.globalCompositeOperation = 'destination-out'; ctx.drawImage(GM, 0, 0); ctx.restore();
      }
      const layer = (P) => { const c = P.appendChild(canvas(1080, 1920)); c.style.cssText = 'position:absolute;left:0;top:0'; return c.getContext('2d'); };

      const W = 1080, H = 1920, d = e.end - e.start, YELLOW = [255, 214, 10];
      const col = rgbOpt(e.color, [232, 36, 52]), title = String(e.text || FX.name);
      const issue = e.issue || 'גיליון הבינה המלאכותית  ·  2026', lines = String(e.lines || '47 אפקטים|שאפשר לגנוב|בלי עורך וידאו').split('|');
      // grade(img, 'pop') mixed in at 0.6*k, as one exact colour matrix (the original luma weights), on the footage and the cut-out
      const id = `fx${e.i}-cvpop`;
      B.insertAdjacentHTML('beforeend', `<svg width="0" height="0" style="position:absolute"><filter id="${id}" x="0" y="0" width="1080" height="1920" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"/></filter></svg>`);
      const cm = B.querySelector(`#${id} feColorMatrix`), V = '#src, .matte', LUM = [0.299, 0.587, 0.114];
      const popMatrix = (w) => {
        const b = 1 + 0.12 * w, s = 1 + 0.512 * w, rows = [];
        for (let c = 0; c < 3; c++) rows.push(...LUM.map((l, j) => (j === c ? s : 0) + (b - s) * l), 0, -0.06 * w);
        return rows.concat([0, 0, 0, 1, 0]).map((v) => +v.toFixed(5)).join(' ');
      };
      function barcode() {
        let sd = 1; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647, pick = (a) => a[Math.floor(rnd() * a.length)];
        const bw = Math.floor(W * 0.16), bh = Math.floor(W * 0.09), c = canvas(bw, bh), x = c.getContext('2d');
        x.fillStyle = '#fff'; x.fillRect(0, 0, bw, bh); x.fillStyle = '#000';
        for (let px = 8; px < bw - 8;) { const w = pick([2, 2, 3, 5]); x.fillRect(px, 6, w, bh - 18 - 6 + 1); px += w + pick([2, 3, 4]); }
        return c;
      }
      const bc = layer(B), cc = layer(C);
      frame(e, (lt, f) => {
        const k = eo(lt / 0.35), al = clamp((d - lt) / 0.2, 0, 1);
        cm.setAttribute('values', popMatrix(0.6 * k));
        document.querySelectorAll(V).forEach((v) => { v.style.filter = `url(#${id})`; });
        bc.clearRect(0, 0, W, H); cc.clearRect(0, 0, W, H);
        const mast = cached('m', () => fitText(title, W * 0.92, 'bold', 600, col));
        const mh = Math.min(mast.height, H * 0.24);
        place(bc, mast, W / 2, H * 0.035 + mh / 2 - (1 - k) * mh, mh / mast.height, 0, al * k);
        place(bc, cached('i', () => textImg(issue, W * 0.042, 'line', [255, 255, 255], { shadow: 3 })), W / 2, H * 0.035, 1, 0, al * k);
        let y = Math.max(H * 0.6, f.fy + f.fw * 1.6);   // below the face, so nothing gets hidden
        lines.forEach((ln, j) => {
          const big = j === 0, im = cached('l' + j, () => textImg(ln, W * (big ? 0.095 : 0.055), big ? 'big' : 'line', big ? YELLOW : [255, 255, 255], { shadow: 5 }));
          const kj = eo((lt - 0.15 - 0.08 * j) / 0.3);
          comp(cc, im, W * 0.95 - im.width + (1 - kj) * 60, y, al * kj); y += im.height * 0.86;   // RTL: right-aligned
        });
        const b = cached('b', barcode);
        comp(cc, b, W * 0.05, H * 0.93 - b.height, al * k);
        guard(cc, f);
      });
      tl.set(V, { filter: 'none' }, e.end);
    },
