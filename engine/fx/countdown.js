    countdown(e, B) {
      // port of fx_countdown (countdown-flip): a 3, 2, 1 split-flap tile, behind you, above your head
      const FONTS = { bold: [900, 'Rubik'] };
      const fnt = (kind, size) => `${FONTS[kind][0]} ${Math.max(6, Math.floor(size))}px ${FONTS[kind][1]}`;
      const canvas = (w, h) => Object.assign(document.createElement('canvas'), { width: Math.max(1, Math.round(w)), height: Math.max(1, Math.round(h)) });
      document.fonts.load(fnt('bold', 100), '0123');
      const ready = () => document.fonts.check(fnt('bold', 100), '0123');
      const W = 1080, H = 1920, d = e.end - e.start;
      const n0 = Math.max(1, Math.round(+e.from || 3)), seg = d / n0;
      const tw = Math.floor(W * 0.3), th = Math.floor(W * 0.38), hh = Math.floor(th / 2);
      // half(num, top): rrect(tw, th, tw*0.1, (30,30,34)) with the number centred ('mm'), cropped to its top or bottom half
      function half(num, top) {
        const full = canvas(tw, th), x = full.getContext('2d');
        x.fillStyle = 'rgb(30,30,34)'; x.beginPath(); x.roundRect(0, 0, tw, th, tw * 0.1); x.fill();
        x.font = fnt('bold', th * 0.62); x.fillStyle = 'rgb(244,233,216)'; x.textAlign = 'center'; x.textBaseline = 'alphabetic';
        const m = x.measureText(String(num));
        x.fillText(String(num), tw / 2, th / 2 + (m.fontBoundingBoxAscent - m.fontBoundingBoxDescent) / 2);
        const c = canvas(tw, top ? hh : th - hh);
        c.getContext('2d').drawImage(full, 0, top ? 0 : hh, tw, c.height, 0, 0, tw, c.height);
        return c;
      }
      let hv = null;
      const halves = () => {
        if (hv) return hv;
        const o = {};
        for (let n = 0; n <= n0 + 1; n++) for (const t of [1, 0]) o[n + '' + t] = half(n, t);
        if (ready()) hv = o;
        return o;
      };
      const tile = canvas(tw, th), tx = tile.getContext('2d');
      const lay = B.appendChild(canvas(W, H)); lay.style.cssText = 'position:absolute;left:0;top:0';
      const ctx = lay.getContext('2d');
      frame(e, (lt, f) => {
        const hs = halves();
        const i = Math.min(n0 - 1, Math.floor(lt / seg)), cur = n0 - i, prev = n0 - i + 1;
        const fl = i > 0 ? clamp((lt - i * seg) / 0.3, 0, 1) : 1;
        tx.clearRect(0, 0, tw, th);
        tx.drawImage(hs[cur + '1'], 0, 0); tx.drawImage(hs[(fl < 1 ? prev : cur) + '0'], 0, hh);
        if (fl < 0.5) {         // the old top half folds down onto the hinge (PIL paste replaces the pixels)
          const h = Math.max(1, Math.floor(th / 2 * (1 - 2 * fl)));
          tx.clearRect(0, hh - h, tw, h); tx.drawImage(hs[prev + '1'], 0, hh - h, tw, h);
        } else if (fl < 1) {    // the new bottom half unfolds from the hinge
          const h = Math.max(1, Math.floor(th / 2 * (2 * fl - 1)));
          tx.clearRect(0, hh, tw, h); tx.drawImage(hs[cur + '0'], 0, hh, tw, h);
        }
        tx.fillStyle = '#000'; tx.fillRect(0, hh - 2, tw, 4);
        const y = Math.max(th / 2 + H * 0.05, f.fy - f.fw * 2.3), x = W / 2 * 0.6 + f.fx * 0.4;
        const sc = 0.7 + 0.3 * eback(lt / 0.3), al = clamp((d - lt) / 0.2, 0, 1);
        ctx.clearRect(0, 0, W, H);
        if (al <= 0) return;
        // place(shadowed(im, 16, 10, 120), ...): soft shadow (sigma 16, dy 10, alpha 120) scaled with the tile
        ctx.save(); ctx.globalAlpha = al; ctx.translate(x, y); ctx.scale(sc, sc);
        ctx.shadowColor = 'rgba(0,0,0,0.47)'; ctx.shadowBlur = 32 * sc; ctx.shadowOffsetY = 10 * sc;
        ctx.drawImage(tile, -tw / 2, -th / 2); ctx.restore();
      });
    },
