    // fx_headline_wall: 13 headline cards (4 looks) pop in one every 0.09s at fixed random spots behind your head,
    // then an orange "total views" pill pops in front of you, under your chin
    wall(e, B, C, F) {
      const W = 1080, H = 1920, d = e.end - e.start, handle = FX.handle || '@your.handle';
      const items = String(e.text == null || e.text === '' ? 'איך להגן על המידע האישי שלך עם מצב הסוכן של ChatGPT::197K צפיות|האתרים הכי קלים לאנימציית גלילה בלי קוד::124K צפיות|'
        + 'איך להפוך את קורות החיים שלך לכאלה שאי אפשר לדחות עם Claude::83K צפיות|אותו פרומפט: Claude Fable 5 מול ChatGPT 5.6 Sol::50K צפיות|'
        + 'Jev, מודל ה-AI החדש שמהיר וזול יותר מ-Claude::40K צפיות|לגרד נתונים מ-LinkedIn אוטומטית::38K צפיות|'
        + 'איך להגן על המידע האישי שלך באינטרנט::140K צפיות' : e.text).split('|').map((x) => x.split('::'));
      const looks = [['#ffffff', 'rgb(20,20,22)'], ['rgb(22,20,24)', '#ffffff'], ['rgb(246,238,226)', 'rgb(30,24,20)'], ['rgb(255,214,10)', 'rgb(20,20,22)']];
      // the original random.Random(i*7+1).uniform(0.2, 0.8), Random(i*7+2).uniform(0.07, 0.42), Random(i*7+3).uniform(-9, 9) for i = 0..29
      const POS = [[0.2806,0.4046,-4.717],[0.3360,0.2321,1.285],[0.7791,0.1965,0.396],[0.7749,0.3937,3.822],[0.5289,0.2587,-8.779],[0.3972,0.3087,2.511],
        [0.2231,0.2130,-4.106],[0.4985,0.1552,8.610],[0.2255,0.2733,-4.965],[0.4857,0.2152,-7.725],[0.3943,0.0957,-3.963],[0.6887,0.1209,-4.113],
        [0.3198,0.3470,-6.373],[0.4526,0.3893,0.842],[0.4424,0.1210,1.461],[0.6264,0.1563,-6.651],[0.2183,0.1543,7.126],[0.5090,0.1006,0.180],
        [0.2267,0.3990,1.550],[0.4905,0.3043,1.363],[0.5104,0.2739,7.315],[0.4421,0.0949,5.829],[0.5485,0.2407,2.010],[0.2322,0.2595,-7.284],
        [0.3533,0.3456,5.068],[0.2178,0.4087,8.075],[0.2648,0.1666,7.204],[0.2448,0.3357,-2.280],[0.5239,0.0885,-2.804],[0.4381,0.2220,-8.844]];
      let sd = 11; const rr = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
      const N = +e.count || 13, gap = e.gap != null && e.gap !== '' ? +e.gap : 0.09, cw = Math.floor(W * 0.5);
      // hcard(i): rrect(cw, chh, cw*0.04, bg); title lines (uib, cw*0.085, line step cw*0.1) from cw*0.07; red play mark + handle · meta at chh - cw*0.085
      const cards = [];
      for (let i = 0; i < N; i++) {
        const [title, meta] = (items[i % items.length].concat(['']));
        const [bg, fg] = looks[i % looks.length], s = cw * 0.04;
        const c = mk(B, 'wall-card', null, { width: cw, borderRadius: cw * 0.04, background: bg, color: fg, paddingTop: cw * 0.07 - (cw * 0.1 - cw * 0.085) / 2 });
        mk(c, 'wall-t', esc(title), { width: cw * 0.84, marginRight: cw * 0.08, fontSize: cw * 0.085, lineHeight: cw * 0.1 + 'px' });
        const m = mk(c, 'wall-m', null, { height: cw * 0.09, marginTop: cw * 0.1 + cw * 0.16 - (cw * 0.07 - (cw * 0.1 - cw * 0.085) / 2) - cw * 0.085 - cw * 0.045,
          marginBottom: cw * 0.085 - cw * 0.045, paddingRight: cw * 0.08, gap: s * 0.6 });
        mk(m, 'wall-play', null, { width: s * 0.9, height: s, background: 'rgb(255,48,64)' });
        mk(m, 'wall-meta', meta ? `<bdi>${esc(handle)}</bdi>  ·  <bdi>${esc(meta)}</bdi>` : `<bdi>${esc(handle)}</bdi>`, { fontSize: cw * 0.045, lineHeight: cw * 0.09 + 'px' });
        cards.push(c);
      }
      const pos = cards.map((_, i) => POS[i] || [0.2 + 0.6 * rr(), 0.07 + 0.35 * rr(), -9 + 18 * rr()]);
      // total pill: anton 96 number + uib 34 label on rrect(pw, ph, ph*0.28, (217,119,87,245)), shadowed(18, 8, 110)
      const pill = mk(C, 'wall-pill', `<b>${esc(e.total || '672K')}</b><span>${esc(e.label2 || 'צפיות מ-7 רילס')}</span>`);
      const t1 = N * gap + 0.1;
      frame(e, (lt, f) => {
        const al = clamp((d - lt) / 0.2, 0, 1);
        cards.forEach((c, i) => {
          const t0 = i * gap;
          if (lt < t0) { gsap.set(c, { opacity: 0 }); return; }
          const [x, y, r] = pos[i], kk = eback((lt - t0) / 0.22);
          gsap.set(c, { x: x * W, y: y * H, xPercent: -50, yPercent: -50, scale: 0.55 + 0.45 * kk, rotation: -r, opacity: al * clamp((lt - t0) / 0.06, 0, 1) });
        });
        if (lt > t1) {
          const pp = eback((lt - t1) / 0.3);
          gsap.set(pill, { x: W / 2, y: Math.max(f.fy + f.fw * 1.8, H * 0.6), xPercent: -50, yPercent: -50, scale: 0.6 + 0.4 * pp, rotation: 0,
            opacity: al * clamp((lt - t1) / 0.08, 0, 1) });
        } else gsap.set(pill, { opacity: 0 });
      });
    },
