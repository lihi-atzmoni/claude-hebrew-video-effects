    studio(e, B, C, F) {
      // render-studio look (from the original reel): a plum render window (checks, tracks, playhead, percent), optional title above it,
      // on the same cream panel as chart, with you in the rounded box below
      const W = 1080, d = e.end - e.start, h = head(e.start), PH = 960, Z = 1.3, pink = e.color || '#ef5f93';
      const still = e.freeze ? `url('${e.freeze}')` : cardImg(0);
      const hole = mk(F, 'pz-hole'), panel = mk(F, 'pz-panel', null, { height: PH });
      if (e.text) mk(panel, 'st-title', esc(e.text).replace(/\*([^*]+)\*/g, `<span style="color:${pink}">$1</span>`));   // optional title above the window
      const card = mk(panel, 'st-card', null, { top: e.text ? 130 : 70 });
      const at = (cls, html, st) => mk(card, cls, html, st);
      ['#f08a5d', '#ec3b8c', '#8a7f8c'].forEach((c, j) => at('st-dot', null, { right: 30 + j * 26, background: c }));
      at('st-head', esc(e.window || 'עריכה · רינדור'), { right: 120 });
      at('st-head st-fmt', '4K · 30FPS', { left: 30 });
      at('st-thumb', '<b>0:14 / 0:25</b>', { backgroundImage: still });
      const rows = split(e.rows, 'חיתוך:שקטים הוסרו|כתוביות:מילים מסונכרנות|צבע:ערב · הבהרת פנים|אפקטים:47 נטענו|סאונד:פופים עדינים')
        .map((r, j) => {
          const [a, b] = r.split(':');
          const row = at('st-row', null, { top: 92 + j * 54 });
          mk(row, 'st-k', esc(a)); const v = mk(row, 'st-v', esc(b || ''));
          return v;
        });
      const pbar = at('st-pbar', '<i></i>'), pfill = pbar.firstChild;
      const trk = split(e.tracks, 'טייק V1|כתוביות|צבע|SFX'), ty = [392, 460, 526, 592];
      trk.forEach((t, j) => at('st-tl', esc(t), { top: ty[j] + 12 }));
      for (let j = 0; j < 8; j++) at('st-frame', null, { top: ty[0], left: 30 + j * 99, backgroundImage: still });
      split(e.captions, 'קליפ אחד|47 אפקטים|אפס אפליקציות').forEach((c, j) =>
        at('st-clip', esc(c), { top: ty[1] + 6, right: 210 + j * 260, width: 240 }));
      at('st-clip st-g1', 'בסיס ערב', { top: ty[2] + 6, right: 210, width: 390 });
      at('st-clip', 'מודי · פנים', { top: ty[2] + 6, right: 615, width: 300 });
      let sd = 3; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
      for (let j = 0; j < 64; j++) { const hh = 8 + rnd() * 40; at('st-wave', null, { top: ty[3] + 26 - hh / 2, height: hh, left: 32 + j * 12.4 }); }
      const ph = at('st-play');
      const prog = at('st-prog', '<i></i>'), progFill = prog.firstChild, pct = at('st-pct', '');
      const dst = { x: 540 - h.x * Z, y: 1290 - h.y * Z };
      camRun(e, (lt) => {
        const k = eo(lt / 0.4) * clamp((d - lt) / 0.25, 0, 1);
        gsap.set('#cam', { transformOrigin: '0px 0px', scale: 1 + (Z - 1) * k, x: dst.x * k, y: dst.y * k });
        gsap.set(panel, { y: (k - 1) * PH });
        gsap.set(hole, { left: 24 * k, top: 960 * k, width: W - 48 * k, borderRadius: 40 * k });
        const p = clamp((lt - 0.3) / (d - 0.5), 0, 1);
        rows.forEach((v, j) => v.classList.toggle('done', p > 0.12 + 0.17 * j));
        pfill.style.width = 100 * Math.min(1, p * 1.25) + '%';
        progFill.style.width = 100 * p + '%';
        pct.textContent = Math.round(12 + 88 * p) + '%';
        gsap.set(ph, { left: 830 - 800 * p });   // RTL timeline: the playhead runs right to left
      });
    },
