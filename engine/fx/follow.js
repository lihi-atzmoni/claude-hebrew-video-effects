    // Instagram "suggested for you" card: profile photo with story ring, name, handle, blue מעקב -> grey במעקב on a tap
    follow(e, B, C, F) {
      const d = e.end - e.start, f0 = faceAt(e.start), A = 168, cw = 420, at = e.at != null ? +e.at : e.start + d * 0.55;
      const ks = (A * 0.95) / f0.fw, pic = (e.avatar || FX.avatar) ? `background-image:url('${e.avatar || FX.avatar}');background-size:cover;background-position:center 25%`
        : `background-image:url('${e.freeze}');background-size:${1080 * ks}px ${1920 * ks}px;background-position:${A / 2 - f0.fx * ks}px ${A / 2 - (f0.fy - f0.fw * 0.1) * ks}px`;
      const x = f0.x < 540 ? 1080 - cw - 50 : 50, y = clamp(f0.chin + 120, 900, 1920 - 640);
      const card = mk(F, 'ig-card', `<div class="ig-x">✕</div><div class="ig-ring"><div class="ig-pic" style="${pic}"></div></div>
        <div class="ig-name">${esc(FX.name)}</div><div class="ig-handle">${esc(FX.handle.replace('@', ''))}</div><div class="ig-sub">מוצע עבורך</div>
        <div class="ig-btn"><span class="ig-a">מעקב</span><span class="ig-b">במעקב</span></div>`, { left: x, top: y, width: cw });
      const a = card.querySelector('.ig-a'), b = card.querySelector('.ig-b'), btn = card.querySelector('.ig-btn');
      const tap = mk(card, 'ig-tap');
      tl.fromTo(card, { opacity: 0, scale: 0.92, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'power3.out' }, e.start);
      tl.set(b, { opacity: 0 }, e.start);
      tl.fromTo(tap, { opacity: 0, scale: 0.3 }, { opacity: 0.35, scale: 1, duration: 0.18, ease: 'power2.out' }, at - 0.1);
      tl.to(tap, { opacity: 0, duration: 0.2 }, at + 0.1);
      tl.fromTo(btn, { scale: 1 }, { scale: 0.95, duration: 0.08, yoyo: true, repeat: 1, immediateRender: false }, at - 0.04);
      tl.set(a, { opacity: 0 }, at); tl.set(b, { opacity: 1 }, at);
      tl.set(btn, { backgroundColor: '#efefef' }, at);
    },
