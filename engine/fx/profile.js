    profile(e, B, C, F) {
      // fx_profile_wall: your profile grid fills the wall behind you, a glass card counts the views up
      const W = 1080, H = 1920, d = e.end - e.start;
      // the wall: rrect(W*.92, H*.36) dark, tabs, 4x2 reel grid (no looks)
      const pw = Math.floor(W * 0.92), ph = Math.floor(H * 0.36), ft = W * 0.032;
      const wall = mk(B, 'profile-wall', null, { left: W / 2 - pw / 2, top: H * 0.04 + 50, width: pw, height: ph, borderRadius: W * 0.035 });
      ['פוסטים', 'רילס', 'תיוגים'].forEach((tb, j) => {
        const x = pw * (0.8 - 0.3 * j);   // the original tabs left to right, mirrored for RTL
        mk(wall, 'profile-tab', esc(tb), { left: x - 150, top: ph * 0.06 - 0.526 * ft, fontSize: ft, lineHeight: ft + 'px', color: j === 1 ? '#fff' : 'rgb(130,130,136)' });
        if (j === 1) mk(wall, 'profile-ul', null, { left: x - pw * 0.08, top: ph * 0.1, width: pw * 0.16 + 1, height: 5 });
      });
      const cell = Math.floor(pw * 0.225), gap = Math.floor(pw * 0.012), cellH = Math.floor(cell * 1.25), gx = Math.floor((pw - (4 * cell + 3 * gap)) / 2);
      for (let k = 0; k < 8; k++) mk(wall, 'profile-cell', null, { right: gx + (k % 4) * (cell + gap), top: Math.floor(ph * 0.14) + Math.floor(k / 4) * (cellH + gap),
        width: cell, height: cellH, borderRadius: Math.max(4, Math.floor(cell / 12)), backgroundImage: cardImg(k) });
      // the glass card (the original liquid glass, amt .5, dark tint): layout mirrored for RTL (avatar right, Follow left)
      const cw = W * 0.76, chh = W * 0.25, card = mk(F, 'profile-glass', null, { left: W / 2 - cw / 2, top: 0, width: cw, height: chh, borderRadius: chh * 0.18 });
      const fn = chh * 0.3, num = mk(card, 'profile-num', '0', { top: chh * 0.33 - 0.526 * fn, fontSize: fn, lineHeight: fn + 'px' });
      const lab = mk(card, 'profile-num', esc(e.label2 || 'צפיות'), { top: chh * 0.33 - 0.526 * fn, fontSize: fn, lineHeight: fn + 'px' });
      const f0 = faceAt(e.start), r0 = f0.fw * 0.9, av = chh * 0.3, ks = av / (2 * r0);
      mk(card, 'profile-av', null, { right: chh * 0.14, top: chh * 0.58, width: av, height: av,
        ...(FX.avatar ? { backgroundImage: `url('${FX.avatar}')`, backgroundSize: 'cover', backgroundPosition: 'center 25%' } : {
        backgroundImage: e.freeze ? `url("${e.freeze}")` : cardImg(0), backgroundSize: `${W * ks}px ${H * ks}px`,
        backgroundPosition: `${-Math.max(0, f0.fx - r0) * ks}px ${-Math.max(0, f0.fy - r0 * 1.05) * ks}px` }) });
      const f1 = chh * 0.09, f2 = chh * 0.075, f3 = chh * 0.08;
      mk(card, 'profile-name', esc(e.name || String(FX.handle).replace('@', '')), { right: chh * 0.52, top: chh * 0.68 - 0.526 * f1, fontSize: f1, lineHeight: f1 + 'px' });
      mk(card, 'profile-sub', esc(e.sub || 'הרילס המוביל'), { right: chh * 0.52, top: chh * 0.8 - 0.526 * f2, fontSize: f2, lineHeight: f2 + 'px' });
      const btn = mk(card, 'profile-btn', 'מעקב', { left: chh * 0.14, top: chh * 0.62, width: chh * 0.81, height: chh * 0.24, borderRadius: chh * 0.12,
        fontSize: f3, lineHeight: chh * 0.24 + 'px' });
      const target = +e.count || 197000;
      frame(e, (lt, f) => {
        const al = clamp((d - lt) / 0.2, 0, 1);
        gsap.set(wall, { scale: 0.94 + 0.06 * eo(lt / 0.35), opacity: al * clamp(lt / 0.15, 0, 1) });
        const cy = Math.min(H * 0.86, f.fy + f.fw * 2.6), swap = clamp((lt - 1.15) / 0.2, 0, 1);
        num.textContent = Math.floor(target * eo((lt - 0.2) / 0.8)).toLocaleString('en-US');
        num.style.opacity = 1 - swap; lab.style.opacity = swap;
        const on = lt >= d * 0.7;
        btn.textContent = on ? 'במעקב' : 'מעקב'; btn.style.background = on ? 'rgb(60,60,66)' : '#fff'; btn.style.color = on ? '#fff' : 'rgb(16,16,18)';
        gsap.set(card, { y: cy + (1 - eo((lt - 0.05) / 0.3)) * H * 0.1 - chh / 2, opacity: al * clamp((lt - 0.05) / 0.12, 0, 1) });
      });
    },
