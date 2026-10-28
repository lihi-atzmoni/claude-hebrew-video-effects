    // from the "THIS IS MY ART" reel: photo blocks flash over the whole frame, big stacked words appear one by one in the middle,
    // then the blocks clear one by one to reveal you and the words leave with them
    mosaic(e, B, C, F) {
      const d = e.end - e.start, cols = +e.cols || 3, rows = +e.rows || 6, cw = 1080 / cols, ch = 1920 / rows, n = Math.max(1, CARDS.length);
      let sd = 11; const R = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
      const cells = [];
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const el = mk(C, 'mos-cell', null, { left: c * cw, top: r * ch, width: cw + 1, height: ch + 1, opacity: '0' });
        cells.push({ el, on: R() * d * 0.22, off: d * (0.55 + R() * 0.33), flip: 0.1 + R() * 0.12, k: Math.floor(R() * n), last: -1 });
      }
      const words = split(e.text, 'זאת|האמנות|שלי');
      const sz = Math.round(Math.min(250, ...words.map((w) => (1080 * 0.8) / ([...w].length * 0.6))));
      const box = mk(F, 'mos-words', words.map((w) => `<div>${esc(w)}</div>`).join(''), { fontSize: sz, top: 1920 * 0.17 });
      [...box.children].forEach((w, j) => tl.fromTo(w, { opacity: 0 }, { opacity: 1, duration: 0.01 }, e.start + d * (0.06 + 0.12 * j)));
      tl.to(box, { opacity: 0, duration: 0.15 }, e.start + d * 0.86);
      frame(e, (lt) => {
        cells.forEach((q) => {
          const vis = lt >= q.on && lt < q.off;
          q.el.style.opacity = vis ? '1' : '0';
          if (!vis) return;
          const i = (q.k + Math.floor((lt - q.on) / q.flip)) % n;
          if (i !== q.last) { q.el.style.backgroundImage = cardImg(i); q.last = i; }
        });
      });
    },
