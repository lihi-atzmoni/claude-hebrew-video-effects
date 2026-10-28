    timeline(e, B, C, F) {
      // fx_timeline -> red_timeline: dark red grade, REC timecode, AUTO-EDIT title and a timeline with a glowing playhead
      const W = 1080, H = 1920, d = e.end - e.start, red = e.color || 'rgb(255,52,44)', id = `timeline${e.i}`;
      // the original grade as exact colour matrices: room = lum * [1.05, .3, .27] * .85, you = img * [1.04, .86, .82]
      const L = [0.299, 0.587, 0.114], room = [1.05 * 0.85, 0.3 * 0.85, 0.27 * 0.85], you = [1.04, 0.86, 0.82];
      mk(B, null, `<svg width="0" height="0" style="position:absolute"><filter id="${id}-bg" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=""/></filter><filter id="${id}-you" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=""/></filter></svg>`);
      const mBg = document.querySelector(`#${id}-bg feColorMatrix`), mYou = document.querySelector(`#${id}-you feColorMatrix`);
      const mat = (k, M) => [0, 1, 2].map((r) => [0, 1, 2].map((c) => (r === c ? 1 - k : 0) + k * M(r, c)).join(' ') + ' 0 0').join(' ') + ' 0 0 0 1 0';
      // vignette(c, .5k): darken by .5 * d, d = ((x-W/2)/.75W)^2 + ((y-H/2)/.7H)^2
      const vig = mk(C, 'full', null, { background: `radial-gradient(ellipse ${W * 0.75}px ${H * 0.7}px at ${W / 2}px ${H / 2}px, ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((j) => `rgba(0,0,0,${(0.5 * (j / 10) ** 2).toFixed(4)}) ${j * 10}%`).join(', ')})` });
      // text block (the original top-left stack, mirrored for RTL to the top-right)
      const fr = W * 0.032, dot = Math.floor((fr * 0.7 + 2 * (Math.floor(fr * 0.2) + 4)) * 0.36), recH = fr * 0.7 + 2 * (Math.floor(fr * 0.2) + 4);
      const recDot = mk(F, 'timeline-dot', null, { width: dot, height: dot, background: red });
      const rec = mk(F, 'timeline-rec', null, { fontSize: fr, lineHeight: fr + 'px', color: red });
      const ft = W * 0.13, fsu = W * 0.037;
      const ti = mk(F, 'timeline-ti', esc(e.text || 'אוטו-עריכה'), { fontSize: ft, lineHeight: ft + 'px' });
      const su = mk(F, 'timeline-su', esc(e.sub || 'טיימליין של Claude'), { fontSize: fsu, lineHeight: fsu + 'px', color: red });
      // the timeline panel: glow (blurred, under the panel), panel, time labels, clips, playhead
      const pw = Math.floor(W * 0.9), phh = Math.floor(H * 0.19);
      const panel = mk(F, 'timeline-panel', null, { left: (W - pw) / 2, width: pw, height: phh });
      const glowBox = mk(panel, 'timeline-glowbox', null, { width: pw, height: phh }), glow = mk(glowBox, 'timeline-glow', null, { filter: `blur(${Math.floor(W / 90)}px)` });
      mk(panel, 'timeline-fill', null, { width: pw, height: phh, borderRadius: W * 0.03 });
      const fm = W * 0.022;
      for (let j = 0; j < 4; j++) mk(panel, 'timeline-tc', `00:0${j}`, { left: pw * (0.05 + 0.3 * j), top: phh * 0.12 - fm / 2, fontSize: fm, lineHeight: fm + 'px' });
      const segs = [[[0.04, 0.24], [0.26, 0.5], [0.53, 0.76], [0.79, 0.96]], [[0.04, 0.3], [0.33, 0.45], [0.48, 0.7]], [[0.04, 0.55], [0.6, 0.96]]];
      const clips = [];
      segs.forEach((row, r) => row.forEach(([a, b]) => {
        const st = { left: pw * a, top: phh * (0.27 + 0.235 * r), width: pw * (b - a), height: phh * 0.17, borderRadius: phh * 0.04 };
        clips.push([pw * a, mk(panel, 'timeline-clip', null, st), mk(glow, 'timeline-clip', null, Object.assign({ background: red, opacity: '0.784' }, st))]);
      }));
      const lw = Math.max(3, Math.floor(W / 300)), gw = Math.max(8, Math.floor(W / 100));
      const line = mk(panel, 'timeline-line', null, { top: phh * 0.2, height: phh * 0.77, width: lw });
      const gline = mk(glow, 'timeline-line', null, { top: phh * 0.2, height: phh * 0.77, width: gw });
      frame(e, (lt) => {
        const k = clamp(lt / 0.2, 0, 1), al = clamp((d - lt) / 0.2, 0, 1);
        mBg.setAttribute('values', mat(k, (r, c) => room[r] * L[c]));
        mYou.setAttribute('values', mat(k, (r, c) => (r === c ? you[r] : 0)));
        gsap.set('#src', { filter: `url(#${id}-bg)` }); gsap.set('.matte', { filter: `url(#${id}-you)` });
        vig.style.opacity = k;
        const sl = (1 - eo(lt / 0.35)) * W * 0.08, tb = clamp(lt / 0.15, 0, 1) * al, top = H * 0.075;
        rec.textContent = `${e.tc || 'REC'} 00:${String(21 + Math.floor(lt * 3)).padStart(2, '0')}`;
        gsap.set(recDot, { x: W - W * 0.065 - dot + sl, y: top + (recH - dot) / 2, opacity: tb * (Math.floor(lt * 2.5) % 2 === 0 ? 1 : 0.35) });
        gsap.set(rec, { right: W * 0.065 + dot * 1.4 + Math.floor(fr * 0.2) + 4 - sl, top: top + recH / 2 - fr / 2, opacity: tb });
        const tiTop = top + recH * 0.85, tiH = ft * 0.75 + 2 * (Math.floor(ft * 0.2 + 25) + 4);
        gsap.set(ti, { right: W * 0.055 + Math.floor(ft * 0.2 + 25) + 4 - sl, top: tiTop + tiH / 2 - 0.526 * ft, opacity: tb });
        const suTop = tiTop + tiH * 0.88, sp = Math.floor(fsu * 0.2) + 4;
        gsap.set(su, { right: W * 0.065 + sp - sl, top: suTop + sp - 0.225 * fsu + 0.969 * fsu - 0.8135 * fsu, opacity: tb });
        const py = H * 0.755 + (1 - eo((lt - 0.1) / 0.35)) * H * 0.3, phx = pw * (0.04 + 0.92 * clamp(lt / (d * 0.95), 0, 1));
        gsap.set(panel, { y: py, opacity: al });
        clips.forEach(([x0, c, g]) => { const on = x0 < phx; c.style.background = on ? red : 'rgb(120,30,28)'; g.style.display = on ? 'block' : 'none'; });
        gsap.set(line, { left: phx - lw / 2 }); gsap.set(gline, { left: phx - gw / 2 });
      });
      tl.set('#src, .matte', { filter: 'none' }, e.end);
    },
