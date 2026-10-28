    // fx_tier_list: yellow serif question behind your head, a dark S..F tier board bounces up under your chin,
    // then an orange "Claude" tile flies in from beside your face and lands in the S row
    tier(e, B, C, F) {
      const W = 1080, H = 1920, d = e.end - e.start;
      const title = e.title || 'הדרך הכי טובה לערוך רילס?', item = e.item || 'Claude';
      const others = String(e.others == null || e.others === '' ? 'תבניות|טיימליין|אפליקציות|לעשות הכל ידנית' : e.others).split('|');
      const fill = {}; ['B', 'C', 'D', 'F'].forEach((k, j) => { if (j < others.length) fill[k] = others[j]; });   // zip('BCDF', others)
      const tiers = [['S', '#ff7f7f'], ['A', '#ffbf7f'], ['B', '#ffdf7f'], ['C', '#bfff7f'], ['D', '#7fbfff'], ['F', '#bf7fff']];
      const cw = Math.floor(W * 0.66), rh = Math.floor(W * 0.082), pad = Math.floor(W * 0.015), chh = pad * 2 + rh * 6 + pad * 5;
      // title: fit_text(title, W*0.88, 'serif', int(W*0.11), fill=YELLOW, shadow=8)
      const ttl = mk(B, 'tier-title', esc(title));
      const cx = document.createElement('canvas').getContext('2d'); let tsz0 = 0;
      const fitT = () => {
        if (tsz0) return tsz0;
        let s = Math.floor(W * 0.11);
        const w = (s) => { cx.font = `300 ${s}px Heebo`; return cx.measureText(title).width; };
        while (s > 10 && w(s) > W * 0.88) s = Math.floor(s * 0.92);
        if (document.fonts && document.fonts.check('300 40px Heebo')) tsz0 = s;
        return s;
      };
      // board: rrect(cw, chh, W*0.025, (22,22,26,240)) + 6 rows; shadowed(18, 10, 120) pads it by 46px each side
      const board = mk(C, 'tier-board', null, { width: cw, height: chh, borderRadius: W * 0.025 });
      tiers.forEach(([lab, col], i) => {
        const y = pad + i * (rh + pad);
        mk(board, 'tier-lab', lab, { right: pad, top: y, width: rh, height: rh, borderRadius: rh * 0.14, background: col, fontSize: rh * 0.5, lineHeight: rh + 'px' });
        mk(board, 'tier-bar', null, { left: pad, top: y, width: cw - pad - (pad * 2 + rh), height: rh, borderRadius: rh * 0.14 });
        if (lab in fill) {
          mk(board, 'tier-chip', esc(fill[lab]), { right: pad * 3 + rh, top: y + rh * 0.15, height: rh * 0.7, borderRadius: rh * 0.12,
            padding: `0 ${rh * 0.2}px`, fontSize: rh * 0.3, lineHeight: rh * 0.7 + 'px' });
        }
      });
      const bdW = cw + 2 * 46, bdH = chh + 2 * 46;
      // tile: shadowed(rrect(int(rh*2.6), int(rh*0.8), rh*0.16, ORANGE), 8, 4, 100) with the item text (uib, rh*0.36) centred, 3px up
      const tw0 = Math.floor(rh * 2.6), th0 = Math.floor(rh * 0.8), tileW = tw0 + 2 * 20;
      const tile = mk(C, 'tier-tile', `<span>${esc(item)}</span>`, { width: tw0, height: th0, borderRadius: rh * 0.16, fontSize: rh * 0.36, lineHeight: (th0 - 6) + 'px' });
      frame(e, (lt, f) => {
        const al = clamp((d - lt) / 0.2, 0, 1);
        const ts = fitT(), pd = Math.floor(ts * 0.2 + 8 * 2.5) + 4, ttlH = ts * 0.75 + 2 * pd;
        ttl.style.fontSize = ts + 'px';
        gsap.set(ttl, { x: W / 2, y: Math.max(ttlH * 0.6, f.fy - f.fw * 1.65), xPercent: -50, yPercent: -50,
          scale: 0.9 + 0.1 * eo(lt / 0.3), opacity: al * clamp(lt / 0.15, 0, 1) });
        const top = Math.min(H * 0.95 - bdH, Math.max(f.fy + f.fw * 1.4, H * 0.45));
        const k = eback(lt / 0.35), bx = W / 2, by = top + bdH / 2 + (1 - k) * H * 0.04;
        gsap.set(board, { x: bx, y: by, xPercent: -50, yPercent: -50, opacity: al * clamp(lt / 0.12, 0, 1) });
        const sx = W * 0.14, sy = f.fy + f.fw * 0.4;
        // land inside the S row, right next to the S letter (RTL)
        const ex = bx + cw / 2 - (pad * 3 + rh) - tw0 / 2, ey = by - chh / 2 + pad + rh / 2;
        const q = eback((lt - 0.45) / 0.4), qc = clamp(q, 0, 1);
        if (lt > 0.4) gsap.set(tile, { x: sx + (ex - sx) * q, y: sy + (ey - sy) * q, xPercent: -50, yPercent: -50,
          scale: 1.25 - 0.25 * qc, rotation: 0, opacity: al });
        else gsap.set(tile, { opacity: 0 });
      });
    },
