    // fx_dot_reveal: the whole frame is rebuilt from a grid of dots (one per cell, radius from the cell's brightness),
    // tinted orange and sparkling, switching on in random order; the dots take the real colours, then cross-fade to the picture.
    // Pixel work on a canvas: each frame the footage is read, averaged per cell (the original INTER_AREA resize) and redrawn as dots.
    dots(e, B, C, F) {
      const W = 1080, H = 1920, d = e.end - e.start;
      const cell = Math.max(6, Math.floor(W * (+e.cell || 0.017))), gh = Math.floor(H / cell) + 1, gw = Math.floor(W / cell) + 1;
      const PW = gw * cell, PH = gh * cell, N = gw * gh;
      const hex = (v, def) => { if (!v) return def; const s = String(v).replace('#', ''); return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16)); };
      const col = hex(e.color, [255, 128, 80]).map((v) => v / 255), bgc = hex(e.bg, [20, 20, 22]).map((v) => v / 255);
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H; cv.className = 'dots-cv'; F.appendChild(cv);
      const ctx = cv.getContext('2d');
      const pc = document.createElement('canvas'); pc.width = PW; pc.height = PH;
      const px = pc.getContext('2d', { willReadFrequently: true });
      // the original thresholds: np.random.default_rng(5).random((gh, gw)) -> same idea, our own seeded generator
      let sd = 5; const rr = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
      for (let i = 0; i < 10; i++) rr();
      const thr = new Float32Array(N); for (let i = 0; i < N; i++) thr[i] = rr();
      const sums = new Float32Array(N * 3);
      const source = () => {
        const v = document.getElementById('src'), im = v && v.nextElementSibling;
        if (im && im.classList.contains('__render_frame__') && im.style.visibility !== 'hidden' && im.complete && im.naturalWidth) return im;
        return v && v.readyState >= 2 ? v : null;
      };
      const draw = (lt) => {
        const p = clamp(lt / d, 0, 1), src = source();
        sums.fill(0);
        if (src) {
          px.drawImage(src, 0, 0, W, H);
          px.drawImage(pc, W - 1, 0, 1, H, W, 0, PW - W, H);       // np.pad(..., mode='edge')
          px.drawImage(pc, 0, H - 1, PW, 1, 0, H, PW, PH - H);
          const a = px.getImageData(0, 0, PW, PH).data;
          for (let y = 0; y < PH; y++) {
            const rb = Math.floor(y / cell) * gw;
            for (let x = 0, o = y * PW * 4; x < PW; x++, o += 4) {
              const k = (rb + Math.floor(x / cell)) * 3;
              sums[k] += a[o]; sums[k + 1] += a[o + 1]; sums[k + 2] += a[o + 2];
            }
          }
        }
        const nrm = 1 / (cell * cell * 255), q2 = clamp((p - 0.3) / 0.35, 0, 1);
        ctx.globalAlpha = 1;
        ctx.fillStyle = `rgb(${bgc[0] * 255},${bgc[1] * 255},${bgc[2] * 255})`;
        ctx.fillRect(0, 0, W, H);
        for (let gy = 0; gy < gh; gy++) for (let gx = 0; gx < gw; gx++) {
          const i = gy * gw + gx, on = clamp((p * 1.7 - thr[i] * 0.95) / 0.3, 0, 1);
          if (on <= 0) continue;
          const r0 = sums[i * 3] * nrm, g0 = sums[i * 3 + 1] * nrm, b0 = sums[i * 3 + 2] * nrm;
          const lum = r0 * 0.299 + g0 * 0.587 + b0 * 0.114;
          const sparkle = 0.75 + 0.25 * Math.sin(thr[i] * 40 + lt * 18);
          const R = (0.18 + 0.32 * Math.sqrt(clamp(lum, 0, 1))) * cell * on;
          if (R <= 0.01) continue;
          const t = (0.55 + 0.6 * lum) * sparkle * (1 - q2);
          const c3 = [r0, g0, b0].map((s, j) => Math.round(255 * clamp(col[j] * t + clamp(s * 1.15, 0, 1) * q2, 0, 1)));
          ctx.fillStyle = `rgb(${c3[0]},${c3[1]},${c3[2]})`;
          ctx.beginPath(); ctx.arc(gx * cell + cell / 2, gy * cell + cell / 2, R, 0, Math.PI * 2); ctx.fill();
        }
        cv.style.opacity = String(1 - eio((p - 0.6) / 0.4));   // c.img = dots * (1 - q) + c.img * q
      };
      // the renderer swaps in the real video frame after the timeline seek; redraw from it then (and in preview, on every frame)
      const live = () => { const t = tl.time(); return t >= e.start && t <= e.end; };
      const redraw = () => { if (live()) draw(tl.time() - e.start); };
      const hook = () => {
        const g = window.__hf && window.__hf.colorGrading;
        if (g && typeof g.redraw === 'function' && !g.redraw.__dots) {
          const o = g.redraw, w = function () { const r = o.apply(this, arguments); (window.__dotsRedraw || []).forEach((f) => f()); return r; };
          w.__dots = 1; g.redraw = w;
        }
        if (typeof window.__hfReseekGpu === 'function' && !window.__hfReseekGpu.__dots) {
          const o = window.__hfReseekGpu, w = function (t) { const r = o(t); (window.__dotsRedraw || []).forEach((f) => f()); return r; };
          w.__dots = 1; window.__hfReseekGpu = w;
        }
      };
      (window.__dotsRedraw = window.__dotsRedraw || []).push(redraw);
      frame(e, (lt) => { hook(); draw(lt); });
    },
