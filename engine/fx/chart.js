    chart(e, B, C, F) {
      // views chart (kallaway split, from the original reel): a cream panel slides down with a bar chart of your top reels, you sit in a rounded box below
      const W = 1080, H = 1920, d = e.end - e.start, h = head(e.start), red = e.color || '#cc4636';
      const vals = split(e.values, '197|140|124|83|49|39|36').map(Number), labels = split(e.labels, 'קלוד|נוטבוק|ג׳מיני|סקילים|אתר|קורס|פרומפטים');
      const avg = +e.avg || 96, top = +e.max || 200, PH = 960, Z = 1.3;
      const hole = mk(F, 'pz-hole'), panel = mk(F, 'pz-panel chart-panel', null, { height: PH });
      const [t1, t2] = split(e.text, '7 הרילס המובילים שלי|לפי *צפיות*');
      mk(panel, 'chart-t1', esc(t1));
      mk(panel, 'chart-t2', esc(t2).replace(/\*([^*]+)\*/g, `<span style="color:${red};border-bottom:5px solid ${red}">$1</span>`));
      const y0 = 830, y1 = 340, yv = (v) => y0 - (y0 - y1) * v / top;
      [0, 50, 100, 150, 200].forEach((v) => {
        const y = yv(v * top / 200);
        mk(panel, 'chart-grid', null, { top: y });
        mk(panel, 'chart-ax', `${Math.round(v * top / 200)}K`, { top: y - 17 });
      });
      mk(panel, 'chart-avg', null, { top: yv(avg), borderColor: red });
      mk(panel, 'chart-avgt', `ממוצע ${avg}K`, { top: yv(avg) - 40, color: red });
      const bw = 86, gap = (800 - 7 * bw) / 6;
      const bars = vals.slice(0, 7).map((v, j) => {
        const x = 920 - j * (bw + gap) - bw;   // RTL: the biggest bar on the right
        const bar = mk(panel, 'chart-bar', null, { left: x, width: bw, background: j ? red : '#f0c75e' });
        const num = mk(panel, 'chart-num', '', { left: x - 30, width: bw + 60 });
        mk(panel, 'chart-lab', esc(labels[j] || ''), { left: x - 30, width: bw + 60, top: y0 + 14 });
        return [bar, num, v];
      });
      const src = { x: 0, y: 0 }, dst = { x: 540 - h.x * Z, y: 1290 - h.y * Z };
      camRun(e, (lt) => {
        const k = eo(lt / 0.4) * clamp((d - lt) / 0.25, 0, 1);
        gsap.set('#cam', { transformOrigin: '0px 0px', scale: 1 + (Z - 1) * k, x: src.x + (dst.x - src.x) * k, y: src.y + (dst.y - src.y) * k });
        gsap.set(panel, { y: (k - 1) * PH });
        gsap.set(hole, { left: 24 * k, top: 960 * k, width: W - 48 * k, borderRadius: 40 * k });
        bars.forEach(([bar, num, v], j) => {
          const q = eo((lt - 0.35 - 0.07 * j) / 0.45), y = yv(v * q);
          gsap.set(bar, { top: y, height: y0 - y });
          num.textContent = q > 0 ? `${Math.round(v * q)}K` : '';
          gsap.set(num, { top: y - 56 });
        });
      });
    },
