    pastel(e, B, C, F) {
      // fx_pastel_word: lavender room, a giant word behind you, a profile card whose Follow gets clicked
      const W = 1080, H = 1920, d = e.end - e.start, PURPLE = 'rgb(124,92,255)', txt = e.text || 'רילס';
      const cv = document.createElement('canvas').getContext('2d');
      const tw = (s, z, wt = 800) => { cv.font = `${wt} ${z}px Heebo`; return cv.measureText(s).width; };
      // room: grad * (0.86 + 0.22 * lum) -> a white veil over the greyed room, multiplied by the original gradient
      const veil = mk(B, 'full pastel-veil'), grad = mk(B, 'full pastel-grad');
      const word = mk(B, 'word pastel-word', esc(txt));
      // profile card (the original layout, mirrored for RTL: avatar right, Follow left)
      const cw = W * 0.86, chh = W * 0.15, f0 = faceAt(e.start), r0 = f0.fw * 0.9, av = chh * 0.64, ks = av / (2 * r0);
      const card = mk(F, 'pastel-card', null, { left: W / 2 - cw / 2, top: 0, width: cw, height: chh, borderRadius: chh * 0.3 });
      mk(card, 'pastel-av', null, { right: chh * 0.18, top: (chh - av) / 2, width: av, height: av,
        ...(FX.avatar ? { backgroundImage: `url('${FX.avatar}')`, backgroundSize: 'cover', backgroundPosition: 'center 25%' } : {
        backgroundImage: e.freeze ? `url("${e.freeze}")` : cardImg(0), backgroundSize: `${W * ks}px ${H * ks}px`,
        backgroundPosition: `${-Math.max(0, f0.fx - r0) * ks}px ${-Math.max(0, f0.fy - r0 * 1.05) * ks}px` }) });
      const t1 = chh * 0.22, t2 = chh * 0.15, t3 = chh * 0.2;
      mk(card, 'pastel-name', esc(e.name || FX.name), { right: chh * 0.98, top: chh * 0.38 - 0.526 * t1, fontSize: t1, lineHeight: t1 + 'px' });
      mk(card, 'pastel-handle', `<bdi>${esc(e.handle || FX.handle)}</bdi>&nbsp;&nbsp;·&nbsp;&nbsp;<span style="color:${PURPLE}">${esc(e.role || 'יוצרת תוכן')}</span>`,
        { right: chh * 0.98, top: chh * 0.66 - 0.526 * t2, fontSize: t2, lineHeight: t2 + 'px' });
      const fol = mk(card, 'pastel-follow', 'מעקב', { left: chh * 0.22, top: chh / 2 - 0.526 * t3, fontSize: t3, lineHeight: t3 + 'px' });
      // the original cursor(W*0.06): white arrow, dark outline, soft shadow; tip at the image's top-left (+3px)
      const s = W * 0.06, pts = [[3, 3], [3, s * 1.12], [s * 0.3, s * 0.87], [s * 0.5, s * 1.33], [s * 0.66, s * 1.26], [s * 0.46, s * 0.8], [s * 0.82, s * 0.8]];
      const cur = mk(F, 'pastel-cur', `<svg width="${s * 0.95}" height="${s * 1.45}"><polygon points="${pts.map((p) => p.join(',')).join(' ')}" fill="#fff" stroke="#000" stroke-width="${Math.max(2, Math.floor(s / 14))}" stroke-linejoin="round"/></svg>`);
      const at = d * 0.6;
      frame(e, (lt, f) => {
        const k = clamp(lt / 0.2, 0, 1), al = clamp((d - lt) / 0.2, 0, 1);
        veil.style.opacity = k; grad.style.opacity = k;
        gsap.set('.matte', { filter: `brightness(${1 + 0.0333 * k}) contrast(${1 - 0.1 * k})` });   // you = img*0.93 + 0.05
        let sz = 700;   // fit_text(text, W*0.96, 'uib', 700)
        while (sz > 10 && tw(txt, sz) > W * 0.96) sz = Math.floor(sz * 0.92);
        const b = behind(f, sz), dk = eo(lt / 0.45);
        gsap.set(word, { top: b.top - (1 - dk) * H * 0.06, fontSize: b.sz, opacity: al * clamp(lt / 0.15, 0, 1) });
        const cy = H * 0.865 + (1 - eo((lt - 0.15) / 0.35)) * H * 0.2, on = lt >= at;
        const sq = on ? 1 - 0.06 * Math.sin(Math.PI * clamp((lt - at) / 0.25, 0, 1)) : 1;
        gsap.set(card, { y: cy - chh / 2, scale: sq, opacity: al * clamp((lt - 0.15) / 0.12, 0, 1) });
        fol.textContent = on ? 'במעקב' : 'מעקב'; fol.style.color = on ? 'rgb(140,140,150)' : PURPLE;
        const ck = eio((lt - 0.25) / Math.max(0.2, at - 0.3));
        const tx = W / 2 - cw / 2 + chh * 0.55, ty = cy + chh * 0.12, sx = W * 1.02, sy = H * 1.02;
        gsap.set(cur, { x: sx + (tx - sx) * ck + 15, y: sy + (ty - sy) * ck + 15, scale: on && lt - at < 0.15 ? 0.85 : 1, opacity: al * clamp((lt - 0.25) / 0.1, 0, 1) });
      });
      tl.set('.matte', { filter: 'none' }, e.end);
    },
