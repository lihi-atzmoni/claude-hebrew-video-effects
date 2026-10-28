    documentary(e, B, C, F) {
      // documentary look (from the original reel): the room goes dark plum, you in black and white, a pink circle behind your head,
      // a series line on top, a 3-line headline above your head, a Follow button that gets clicked, your name at the bottom
      const W = 1080, H = 1920, d = e.end - e.start, h = head(e.start), pink = e.color || '#ec3b8c';
      const lines = split(e.text, 'קליפ *אחד*|47 אפקטים|*אפס* אפליקציות');
      const bg = mk(B, 'full doc-bg');
      const r = h.w * 1.02, cx = h.x - h.w * 0.08, cy = h.y - h.w * 0.15;
      const disc = mk(B, 'doc-disc', null, { left: cx - r, top: cy - r, width: 2 * r, height: 2 * r });
      const ring = mk(B, 'doc-ring', null, { left: cx - r * 1.22, top: cy - r * 1.22, width: 2.44 * r, height: 2.44 * r });
      const ghost = mk(B, 'doc-ghost', esc(e.ghost || 'יומי'), { fontSize: 420 });
      const eyebrow = mk(F, 'doc-eyebrow', esc(e.series || 'סדרת AI לא טכנית · יומי'), { fontSize: 30 });
      const sz = Math.min(96, (h.top - 120) / (lines.length * 1.0));
      const rows = lines.map((ln, j) => mk(F, 'doc-line', esc(ln).replace(/\*([^*]+)\*/g, `<span style="color:${pink}">$1</span>`),
        { top: 104 + j * sz * 1.0, fontSize: sz, lineHeight: sz + 'px' }));
      const btn = mk(F, 'doc-btn', 'עקבו', { left: W * 0.62, top: h.chin + h.w * 0.35 });
      const cur = mk(F, 'doc-cursor', '<svg viewBox="0 0 24 24"><path d="M4 2 L4 19 L8.5 14.8 L11.6 21.6 L14.6 20.3 L11.6 13.6 L17.6 13.6 Z" fill="#fff" stroke="#000" stroke-width="1.4" stroke-linejoin="round"/></svg>');
      const name = mk(F, 'doc-name', esc(e.name || FX.name || 'השם שלך'), { color: pink });
      const handle = mk(F, 'doc-handle', esc(e.handle || FX.handle || '@your.handle'));
      const tClick = Math.min(1.35, d * 0.55);
      frame(e, (lt) => {
        const al = clamp((d - lt) / 0.2, 0, 1), k = eo(lt / 0.3);
        document.querySelectorAll('.matte').forEach((v) => { v.style.filter = `grayscale(${k}) contrast(${1 + 0.25 * k}) brightness(${1 + 0.04 * k})`; });
        bg.style.opacity = k * al; ghost.style.opacity = 0.9 * k * al;
        const kd = eo((lt - 0.08) / 0.35);
        gsap.set(disc, { scale: 0.6 + 0.4 * kd, opacity: kd * al }); gsap.set(ring, { scale: 0.8 + 0.2 * kd, opacity: kd * al });
        eyebrow.style.opacity = clamp((lt - 0.1) / 0.2, 0, 1) * al;
        rows.forEach((row, j) => {   // each line lands from big and blurred, then sits still
          const q = eo((lt - 0.22 - 0.2 * j) / 0.28);
          gsap.set(row, { scale: 1.35 - 0.35 * q, opacity: q * al, filter: `blur(${(1 - q) * 14}px)` });
        });
        const kb = eo((lt - 0.4) / 0.25), on = lt >= tClick;
        gsap.set(btn, { opacity: kb * al, scale: on && lt < tClick + 0.1 ? 0.95 : 1 });
        btn.textContent = on ? 'במעקב' : 'עקבו'; btn.classList.toggle('on', on);
        const km = eo((lt - 0.55) / (tClick - 0.6));   // the cursor glides in from the bottom right and taps the button
        const bx = W * 0.62 + 120, by = h.chin + h.w * 0.35 + 50;
        gsap.set(cur, { x: bx + (1 - km) * 260, y: by + (1 - km) * 300, opacity: clamp((lt - 0.55) / 0.15, 0, 1) * al });
        const kn = eo((lt - 0.3) / 0.3);
        gsap.set([name, handle], { opacity: kn * al, x: (1 - kn) * 40 });
      });
      tl.set('.matte', { filter: 'none' }, e.end);
    },
