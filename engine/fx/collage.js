    collage(e, B, C) {
      // port of fx_red_collage: black-and-white you on a darker black-and-white room, vignette, a giant glowing red word
      // behind your head, three lines that slam in on the left (the middle one red) and a blinking REC tag; text avoids the face
      const FONTS = { uib: [800, 'Heebo'], mono: [700, 'Rubik'] };
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
        const sh = o.shadow || 0, gl = o.glow, t = measure(s, kind, size), pad = Math.floor(size * 0.2 + sh * 2.5 + (gl ? gl[1] * 2.5 : 0)) + 4;
        const w = t.actualBoundingBoxLeft + t.actualBoundingBoxRight + 2 * pad, h = t.actualBoundingBoxAscent + t.actualBoundingBoxDescent + 2 * pad;
        const px = pad + t.actualBoundingBoxLeft, py = pad + t.actualBoundingBoxAscent, c = canvas(w, h), x = g2(c);
        const draw = (ctx, col, dy, sw = 0) => { ctx.font = fnt(kind, size); ctx.fillStyle = col; if (sw) { ctx.lineWidth = 2 * sw; ctx.lineJoin = 'round'; ctx.strokeStyle = col; ctx.strokeText(s, px, py + dy); } ctx.fillText(s, px, py + dy); };
        if (sh) { const l = canvas(w, h); draw(g2(l), 'rgba(0,0,0,0.627)', sh * 0.5); x.filter = `blur(${sh}px)`; x.drawImage(l, 0, 0); x.filter = 'none'; }
        // glow: the text in the glow colour with a size*0.04 outline, blurred by glow[1], laid on twice
        if (gl) { const l = canvas(w, h); draw(g2(l), rgbs(gl[0]), 0, Math.floor(size * 0.04)); x.filter = `blur(${gl[1]}px)`; x.drawImage(l, 0, 0); x.drawImage(l, 0, 0); x.filter = 'none'; }
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

      const W = 1080, H = 1920, d = e.end - e.start, WHITE = [255, 255, 255];
      const red = rgbOpt(e.color, [238, 34, 34]), word = String(e.text || 'עריכה').toUpperCase();
      const lines = String(e.lines || 'קליפ אחד|47 אפקטים|אפס אפליקציות').split('|'), tagTxt = e.tag || 'קולאז׳ אדום  ·  REC';
      // grade: out = bw*m + bw*0.62*(1-m), mixed in at k; then vignette(0.45k) on the whole frame. Exact SVG filters on
      // the footage (bw * 0.62) and the cut-out (bw), with the original luma weights and vignette map; the word/text are drawn after, unvignetted.
      const vm = canvas(270, 480), vx = vm.getContext('2d'), vd = vx.createImageData(270, 480);
      for (let j = 0; j < 480; j++) for (let i = 0; i < 270; i++) {
        const X = (i + 0.5) * 4, Y = (j + 0.5) * 4, v = clamp(((X - W / 2) / (W * 0.75)) ** 2 + ((Y - H / 2) / (H * 0.7)) ** 2, 0, 1) * 255, p = (j * 270 + i) * 4;
        vd.data[p] = vd.data[p + 1] = vd.data[p + 2] = v; vd.data[p + 3] = 255;
      }
      vx.putImageData(vd, 0, 0);
      const vurl = vm.toDataURL('image/png'), LUM = [0.299, 0.587, 0.114];
      const bwRow = LUM.map((l) => +(l * 1.25).toFixed(4)).join(' ') + ' 0 -0.125';
      const filt = (id, dim) => `<filter id="${id}" x="0" y="0" width="1080" height="1920" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feColorMatrix in="SourceGraphic" type="matrix" values="${bwRow} ${bwRow} ${bwRow} 0 0 0 1 0" result="bw"/>
        <feComponentTransfer in="bw" result="bwd"><feFuncR type="linear" slope="${dim}"/><feFuncG type="linear" slope="${dim}"/><feFuncB type="linear" slope="${dim}"/></feComponentTransfer>
        <feComposite class="mix" in="bwd" in2="SourceGraphic" operator="arithmetic" k1="0" k2="0" k3="1" k4="0" result="mix"/>
        <feImage href="${vurl}" x="0" y="0" width="1080" height="1920" preserveAspectRatio="none" result="vimg"/>
        <feComponentTransfer in="vimg" result="vig"><feFuncR class="v" type="linear" slope="0" intercept="1"/><feFuncG class="v" type="linear" slope="0" intercept="1"/><feFuncB class="v" type="linear" slope="0" intercept="1"/></feComponentTransfer>
        <feComposite in="mix" in2="vig" operator="arithmetic" k1="1" k2="0" k3="0" k4="0"/></filter>`;
      const fs = `fx${e.i}-rcs`, fm = `fx${e.i}-rcm`;
      B.insertAdjacentHTML('beforeend', `<svg width="0" height="0" style="position:absolute">${filt(fs, 0.62)}${filt(fm, 1)}</svg>`);
      const mixes = [...B.querySelectorAll('feComposite.mix')], vfs = [...B.querySelectorAll('.v')], V = '#src, .matte';
      const dotImg = (n) => { const c = canvas(n, n), x = c.getContext('2d'); x.fillStyle = rgbs(red); x.beginPath(); x.ellipse(n / 2, n / 2, n / 2, n / 2, 0, 0, Math.PI * 2); x.fill(); return c; };
      const bc = layer(B), cc = layer(C);
      frame(e, (lt, f) => {
        const k = clamp(lt / 0.15, 0, 1), al = clamp((d - lt) / 0.2, 0, 1);
        mixes.forEach((m) => { m.setAttribute('k2', k.toFixed(4)); m.setAttribute('k3', (1 - k).toFixed(4)); });
        vfs.forEach((v) => v.setAttribute('slope', (-0.45 * k).toFixed(4)));
        document.getElementById('src').style.filter = `url(#${fs})`;
        document.querySelectorAll('.matte').forEach((v) => { v.style.filter = `url(#${fm})`; });
        bc.clearRect(0, 0, W, H); cc.clearRect(0, 0, W, H);
        const w = cached('w', () => fitText(word, W * 0.98, 'uib', 700, red, { glow: [red, 34] }));
        const s = 1.12 - 0.12 * eo(lt / 0.4);
        place(bc, w, W / 2, Math.max(w.height * 0.42, f.top - w.height * 0.18), s, 0, clamp(lt / 0.12, 0, 1) * al);
        const size = cached('sz', () => { let z = Math.floor(W * 0.14); while (z > 10 && Math.max(...lines.map((l) => measure(l, 'uib', z).width)) > W * 0.8) z = Math.floor(z * 0.94); return { z }; }).z;
        let y = Math.max(H * 0.5, f.fy + f.fw * 1.55);
        lines.forEach((ln, j) => {
          const im = cached('l' + j, () => textImg(ln, size, 'uib', j === 1 ? red : WHITE, { shadow: 8 }));
          const kk = clamp((lt - 0.18 - 0.13 * j) / 0.16, 0, 1);
          if (kk > 0) place(cc, im, W * 0.95 - im.width / 2, y + im.height / 2, 1.4 - 0.4 * eo(kk), 0, kk * al);
          y += size * 1.0;
        });
        const tag = cached('tag', () => textImg(tagTxt, W * 0.027, 'mono', red)), dot = cached('dot', () => dotImg(Math.floor(tag.height * 0.4)));
        const blink = Math.floor(lt * 2.5) % 2 === 0 ? 1.0 : 0.35;
        place(cc, dot, W * 0.93, H * 0.93, 1, 0, al * k * blink);
        place(cc, tag, W * 0.93 - dot.width - tag.width / 2, H * 0.93, 1, 0, al * k);
        guard(cc, f);
      });
      tl.set(V, { filter: 'none' }, e.end);
    },
