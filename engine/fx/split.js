    split(e, B, C, F) {
      // fx_split_headline: a headline card slides down and pushes the whole picture (and you) down
      const W = 1080, H = 1920, d = e.end - e.start, col = e.color || 'rgb(34,197,94)';
      const ch = H * (+e.height || 0.36), push = e.push != null ? +e.push : 0.72;
      const lines = split(e.text, 'קלוד|עורך לי|את הרילס.'), hl = e.hl || 'עורך';
      const cv = document.createElement('canvas').getContext('2d');
      const tw = (s, z) => { cv.font = `800 ${z}px Heebo`; return cv.measureText(s).width; };
      const card = mk(F, 'split-card', null, { height: ch });
      mk(card, 'split-bar', null, { height: Math.max(5, Math.floor(W / 180)) + 1, background: col });
      const rows = lines.map((ln) => {
        const row = mk(card, 'split-line'), hls = [];
        ln.split(' ').forEach((word, wi) => {
          if (wi) row.appendChild(document.createTextNode(' '));
          const tail = word.endsWith('.') ? '.' : '', core = tail ? word.slice(0, -1) : word;
          const w = mk(row, 'split-w');
          const r = core === hl ? mk(w, 'split-hl', null, { background: col }) : null;
          const c = mk(w, 'split-c', esc(core));
          if (tail) mk(w, 'split-t', tail, { color: col });
          if (r) hls.push([w, r, c, core]);
        });
        return [row, hls];
      });
      const pill = mk(F, 'split-pill', esc(e.pill || 'תוך שניות ↗'), { background: col });
      camRun(e, (lt) => {
        const k = eo(lt / 0.38) * clamp((d - lt) / 0.25, 0, 1);
        gsap.set('#cam', { transformOrigin: '0px 0px', scale: 1, x: 0, y: ch * push * k });   // the original shift(c, dy)
        const top = ch * k;
        gsap.set(card, { y: top - ch });
        let S = Math.floor(W * 0.135);   // lines_fit(lines, W*0.84, 'uib', W*0.135)
        while (S > 10 && Math.max(...lines.map((l) => tw(l, S))) > W * 0.84) S = Math.floor(S * 0.94);
        const y0 = ch * 0.13, pad = S * 0.12, hk = eo((lt - 0.42) / 0.22);
        rows.forEach(([row, hls], j) => {
          const kj = clamp((lt - 0.12 - 0.08 * j) / 0.18, 0, 1), y = y0 + j * S * 1.04 + (1 - eo(kj)) * S * 0.35;
          gsap.set(row, { top: y + 0.08 * S, right: W * 0.07, fontSize: S, lineHeight: S + 'px', height: S, opacity: kj });
          hls.forEach(([w, r, c, core]) => {
            w.style.marginLeft = S * 0.12 + 'px';
            gsap.set(r, { top: (0.02 - 0.08) * S, height: 1.08 * S, right: -pad, width: hk > 0 ? (tw(core, S) + 2 * pad) * hk : 0, borderRadius: S * 0.16 });
            c.style.color = hk > 0.55 ? '#fff' : 'rgb(20,20,22)';
          });
        });
        // pill = rrect(pt.width + W*0.02, pt.height*0.95) under the card's corner (mirrored for RTL: left corner)
        const fs = W * 0.034, pd = Math.floor(fs * 0.2) + 4, ph = (fs * 0.763 + 2 * pd) * 0.95;
        gsap.set(pill, { x: W * 0.07, y: top + ph * 0.95 - ph / 2, height: ph, fontSize: fs, lineHeight: ph + 'px', borderRadius: ph / 2,
          paddingLeft: W * 0.01 + pd, paddingRight: W * 0.01 + pd,
          scale: 0.6 + 0.4 * (lt > 0.62 ? eback((lt - 0.62) / 0.3) : 0), opacity: clamp((lt - 0.62) / 0.1, 0, 1) * k });
      });
    },
