    // fx_phone_fan: a two-line headline above your head (last line dark on a white box), then four phones showing your
    // reels fan out under your chin like a hand of cards
    phones(e, B, C, F) {
      const W = 1080, H = 1920, d = e.end - e.start;
      const lines = String(e.text == null || e.text === '' ? '47 אפקטים|אפס אפליקציות עריכה' : e.text).split('|');
      const cx = document.createElement('canvas').getContext('2d');
      const mw = (s, S) => { cx.font = `800 ${S}px Heebo`; return cx.measureText(s).width; };
      let S0 = 0;
      const fitS = () => {   // lines_fit(lines, W*0.84, 'uib', int(W*0.08)): shrink by 0.94
        if (S0) return S0;
        let s = Math.floor(W * 0.08);
        while (s > 10 && Math.max(...lines.map((l) => mw(l, s))) > W * 0.84) s = Math.floor(s * 0.94);
        if (document.fonts && document.fonts.check('800 40px Heebo')) S0 = s;
        return s;
      };
      const rows = lines.map((ln, j) => {
        const last = j === lines.length - 1;
        return { last: false, ln, box: null, t: mk(C, 'phones-line', esc(ln)) };   // no white box behind text (design rule)
      });
      const pw = Math.floor(W * 0.23), ph = Math.floor(pw * 2.0), sw = pw - 10, shh = Math.floor(sw * 16 / 9);
      const looks = ['pop', 'bw', 'warm', 'cool', 'moody'], cblur = Math.max(6, Math.floor(sw / 16)), cdy = Math.floor(sw / 22), cpad = 2 * cblur + cdy;
      // phone(i): rrect(pw, ph, pw*0.16, (14,14,16)) + card(vary(img), pw-10) cropped into it (card top sits 5+38px down) + notch; shadowed(14, 8, 120)
      const phones = [0, 1, 2, 3].map((i) => {
        const p = mk(C, 'phones-phone', null, { width: pw, height: ph, borderRadius: pw * 0.16 });
        mk(p, 'phones-scr', null, { left: 5, top: 5 + cpad - (Math.floor((shh + 2 * cpad - (ph - 10)) / 2) - 6),
          width: sw, height: shh, borderRadius: sw * 0.07, backgroundImage: cardImg(i), filter: VARY[looks[i % 5]],
          boxShadow: `0 ${cdy}px ${2 * cblur}px rgba(0,0,0,.59)` });
        mk(p, 'phones-notch', null, { left: pw * 0.36, top: ph * 0.025, width: pw * 0.28, height: ph * 0.02, borderRadius: pw * 0.03 });
        return p;
      });
      frame(e, (lt, f) => {
        const al = clamp((d - lt) / 0.2, 0, 1), S = fitS();
        let y = Math.max(H * 0.06, f.fy - f.fw * 1.3 - S * 1.3 * lines.length);
        rows.forEach((r, j) => {
          const kj = clamp((lt - 0.05 - 0.1 * j) / 0.18, 0, 1), pad = Math.floor(S * 0.2 + (r.last ? 0 : 9) * 2.5) + 4, tw = mw(r.ln, S) + 2 * pad;
          r.t.style.fontSize = S + 'px';
          if (r.last) gsap.set(r.box, { x: W / 2 - (tw - S * 0.15) / 2, y, width: tw - S * 0.15, height: S * 1.22, borderRadius: S * 0.08, opacity: al * kj });
          gsap.set(r.t, { x: W / 2, y: y + S * 0.6, xPercent: -50, yPercent: -50, opacity: al * kj });
          y += S * 1.3;
        });
        let cy = Math.max(f.fy + f.fw * 1.1 + ph / 2, H * 0.62);
        cy = Math.min(cy, H - ph * 0.42);
        const pcx = (W / 2) * 0.5 + f.fx * 0.5;
        [-1.5, -0.5, 0.5, 1.5].forEach((o, i) => {
          const q = eback((lt - 0.2 - 0.06 * i) / 0.4);
          gsap.set(phones[i], { x: pcx + o * W * 0.19 * q, y: cy + o * o * W * 0.025 * q, xPercent: -50, yPercent: -50, scale: 0.9,
            rotation: o * 11 * q, opacity: al * clamp((lt - 0.2) / 0.1, 0, 1) });
        });
      });
    },
