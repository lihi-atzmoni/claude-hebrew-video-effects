    scribble(e, B, C) {
      // port of fx_scribble: a yellow marker ring draws itself round your face, then an arrow from the label, then three + sparks
      const FONTS = { hand: [400, 'Gveret'] };
      const fnt = (kind, size) => `${FONTS[kind][0]} ${Math.max(6, Math.floor(size))}px ${FONTS[kind][1]}`;
      const canvas = (w, h) => Object.assign(document.createElement('canvas'), { width: Math.max(1, Math.round(w)), height: Math.max(1, Math.round(h)) });
      const g2 = (c) => { const x = c.getContext('2d'); x.direction = 'rtl'; return x; };
      document.fonts.load(fnt('hand', 80), 'אני');
      // text_img(s, size, kind, fill, shadow): ink box + pad, soft drop shadow (black 160, dy shadow/2, blur shadow)
      function textImg(s, size, kind, fill, o = {}) {
        const sh = o.shadow || 0, mx = g2(canvas(1, 1)); mx.font = fnt(kind, size); mx.textAlign = 'left';
        const t = mx.measureText(s), pad = Math.floor(size * 0.2 + sh * 2.5) + 4;
        const w = t.actualBoundingBoxLeft + t.actualBoundingBoxRight + 2 * pad, h = t.actualBoundingBoxAscent + t.actualBoundingBoxDescent + 2 * pad;
        const px = pad + t.actualBoundingBoxLeft, py = pad + t.actualBoundingBoxAscent, c = canvas(w, h), x = g2(c);
        const draw = (ctx, col, dy) => { ctx.font = fnt(kind, size); ctx.textAlign = 'left'; ctx.fillStyle = col; ctx.fillText(s, px, py + dy); };
        if (sh) { const l = canvas(w, h); draw(g2(l), 'rgba(0,0,0,0.627)', sh * 0.5); x.filter = `blur(${sh}px)`; x.drawImage(l, 0, 0); x.filter = 'none'; }
        draw(x, `rgb(${fill.join(',')})`, 0);
        return c;
      }
      function place(ctx, im, cx, cy, sc = 1, rot = 0, al = 1) {
        if (sc <= 0.01 || al <= 0) return;
        ctx.save(); ctx.globalAlpha = Math.min(1, al); ctx.translate(cx, cy); ctx.rotate(-rot * Math.PI / 180); ctx.scale(sc, sc);
        ctx.drawImage(im, -im.width / 2, -im.height / 2); ctx.restore();
      }
      const W = 1080, H = 1920, d = e.end - e.start;
      const hex = String(e.color || '').replace('#', ''), col = hex.length === 6 ? [0, 2, 4].map((k) => parseInt(hex.slice(k, k + 2), 16)) : [255, 214, 10];
      const css = `rgb(${col.join(',')})`, wd = Math.max(6, Math.floor(W / 130)), txt = e.text || 'אני!';
      const lay = C.appendChild(canvas(W, H)); lay.style.cssText = 'position:absolute;left:0;top:0';
      const ctx = lay.getContext('2d'), L = canvas(W, H), d2 = L.getContext('2d');
      const line = (pts) => { d2.beginPath(); pts.forEach(([x, y], k) => (k ? d2.lineTo(x, y) : d2.moveTo(x, y))); d2.stroke(); };
      const handPath = (pts, frac) => { const n = Math.max(2, Math.floor(pts.length * clamp(frac, 0, 1))); if (frac > 0) line(pts.slice(0, n)); };
      const arrowPts = (x0, y0, x1, y1, bend = 0.25, n = 40) => {
        const mx = (x0 + x1) / 2 - (y1 - y0) * bend, my = (y0 + y1) / 2 + (x1 - x0) * bend;
        return Array.from({ length: n }, (_, i) => { const t = i / (n - 1); return [(1 - t) ** 2 * x0 + 2 * (1 - t) * t * mx + t * t * x1, (1 - t) ** 2 * y0 + 2 * (1 - t) * t * my + t * t * y1]; });
      };
      const arrowHead = (pts, size) => {
        const [xa, ya] = pts[pts.length - 4], [xb, yb] = pts[pts.length - 1], a = Math.atan2(yb - ya, xb - xa);
        for (const s of [2.6, -2.6]) line([[xb, yb], [xb + size * Math.cos(a + s), yb + size * Math.sin(a + s)]]);
      };
      let lab = null;
      frame(e, (lt, f) => {
        d2.clearRect(0, 0, W, H); ctx.clearRect(0, 0, W, H);
        Object.assign(d2, { strokeStyle: css, lineWidth: wd, lineJoin: 'round', lineCap: 'butt' });
        const rx = f.fw * 1.0, ry = f.fw * 1.3, ring = [];
        for (let i = 0; i < 70; i++) {
          const a = -1.9 + (2 * Math.PI * 1.08) * i / 69;
          ring.push([f.fx + rx * (1 + 0.04 * Math.sin(3 * a)) * Math.cos(a), f.fy + ry * (1 + 0.04 * Math.cos(2 * a)) * Math.sin(a)]);
        }
        handPath(ring, eio(lt / 0.5));
        const lx = clamp(f.fx + f.fw * 2.3, W * 0.2, W * 0.8), ly = Math.max(H * 0.08, f.fy - f.fw * 2.4);
        const pts = arrowPts(lx - f.fw * 0.3, ly + f.fw * 0.5, f.fx + rx * 0.85, f.fy - ry * 0.75, -0.3);
        const k2 = eo((lt - 0.45) / 0.35);
        if (k2 > 0) handPath(pts, k2);
        if (k2 >= 0.99) arrowHead(pts, W * 0.035);
        [[f.fx - f.fw * 1.9, f.fy - f.fw * 1.2], [f.fx - f.fw * 1.5, f.fy + f.fw * 0.6], [f.fx + f.fw * 1.6, f.fy + f.fw * 0.3]].forEach(([sx, sy], j) => {
          const ks = eback((lt - 0.8 - 0.1 * j) / 0.25) * f.fw * 0.28;
          if (ks > 0) { line([[sx - ks, sy], [sx + ks, sy]]); line([[sx, sy - ks], [sx, sy + ks]]); }
        });
        const al = clamp((d - lt) / 0.2, 0, 1);
        ctx.globalAlpha = al; ctx.drawImage(L, 0, 0); ctx.globalAlpha = 1;
        if (lt > 0.7) {
          if (!lab || !lab.ok) { lab = textImg(txt, W * 0.075, 'hand', col, { shadow: 6 }); lab.ok = document.fonts.check(fnt('hand', 80), 'אני'); }
          place(ctx, lab, lx, ly - lab.height * 0.15, 0.7 + 0.3 * eback((lt - 0.7) / 0.3), 8, al);
        }
      });
    },
