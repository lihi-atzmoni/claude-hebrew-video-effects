    // fx_todo: a cream checklist card beside your head (behind you), items tick + strike through at `ticks`
    todo(e, B, C, F) {
      const items = split(e.text, 'להכניס את הסרטון לקלוד|להתקין את הסקיל|לכתוב \u200e/effects'), n = items.length, d = e.end - e.start;
      const ticks = e.ticks ? String(e.ticks).split('|').map((t) => +t - e.start) : items.map((_, i) => (d * (i + 1)) / (n + 1));
      const cw = Math.floor(1080 * 0.5), lh = Math.floor(cw * 0.13), pad = Math.floor(cw * 0.07), ch = pad * 2 + lh * (n + 1), bx = lh * 0.42;
      const pin = mk(B, 'pin');
      const card = mk(pin, 'todo-card', null, { left: -cw / 2, top: -ch / 2, width: cw, height: ch, borderRadius: Math.floor(cw * 0.07) });
      mk(card, 'todo-title', esc(e.title || 'לעשות'), { right: pad, top: pad, fontSize: Math.floor(lh * 0.42) });
      const cnt = mk(card, 'todo-count', '', { left: pad, top: pad, fontSize: Math.floor(lh * 0.36) });
      const rows = items.map((it, i) => {
        const y = pad + lh * (i + 1);
        const box = mk(card, 'todo-box', '<svg viewBox="0 0 1 1"><polyline points=".22,.52 .42,.74 .8,.28"/></svg>', { right: pad, top: y + lh * 0.12, width: bx, height: bx });
        const tx = mk(card, 'todo-item', esc(it), { right: pad + bx * 1.5, top: y + lh * 0.1, fontSize: Math.floor(lh * 0.4) });
        const st = mk(card, 'todo-strike', null, { right: pad + bx * 1.5, top: y + lh * 0.36 - 1.5, width: 0 });
        return { box, tx, st };
      });
      frame(e, (lt, f) => {
        const done = ticks.filter((t) => lt >= t).length;
        cnt.textContent = `${done} מתוך ${n}`;
        rows.forEach((r, i) => {
          const on = lt >= ticks[i];
          r.box.classList.toggle('on', on);
          r.st.style.width = on ? r.tx.offsetWidth * eo((lt - ticks[i]) / 0.25) + 'px' : '0px';
        });
        const left = f.fx > 540, x = left ? 1080 * 0.05 + cw / 2 : 1080 * 0.95 - cw / 2;
        // shadowed(im, 14, 8, 90) keeps the card centred, so the centre is the original place() point
        gsap.set(pin, { x, y: Math.max(ch / 2 + 1920 * 0.06, f.fy - f.fw * 1.4), scale: 0.8 + 0.2 * eback(lt / 0.3),
          opacity: clamp(lt / 0.12, 0, 1) * clamp((d - lt) / 0.2, 0, 1) });
      });
    },
