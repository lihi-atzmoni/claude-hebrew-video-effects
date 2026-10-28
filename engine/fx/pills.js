    pills(e, B, C, F) {
      // fx_check_pills: grid-paper room, two reel boards behind you, a cursor clicks blue pills one by one
      const W = 1080, H = 1920, d = e.end - e.start, looks = ['pop', 'bw', 'warm', 'cool', 'moody'];
      const cv = document.createElement('canvas').getContext('2d');
      const tw = (s, z) => { cv.font = `800 ${z}px Heebo`; return cv.measureText(s).width; };
      const room = mk(B, 'full pills-room');
      const bw = Math.floor(W * 0.44), bh = Math.floor(bw * 1.12), cell = Math.floor(bw * 0.28), gap = Math.floor(bw * 0.025), cellH = Math.floor(cell * 1.25);
      const board = (i, title) => {
        const b = mk(B, 'pills-board', null, { width: bw, height: bh, borderRadius: bw * 0.07 });
        mk(b, 'pills-dot', null, { right: bw * 0.06, top: bw * 0.055, width: bw * 0.09, height: bw * 0.09 });
        const fs = bw * 0.06;
        mk(b, 'pills-bt', `<bdi>${esc(title)}</bdi>`, { right: bw * 0.19, top: bw * 0.1 - 0.526 * fs, fontSize: fs, lineHeight: fs + 'px' });
        const gw = 3 * cell + 2 * gap, gx = Math.floor((bw - gw) / 2), gy = Math.floor(bw * 0.2);
        for (let k = 0; k < 9; k++) {
          const n = i * 3 + k;
          mk(b, 'pills-cell', null, { right: gx + (k % 3) * (cell + gap), top: gy + Math.floor(k / 3) * (cellH + gap), width: cell, height: cellH,
            borderRadius: Math.max(4, Math.floor(cell / 12)), backgroundImage: cardImg(n), filter: VARY[looks[n % 5]] });
        }
        return b;
      };
      const b1 = board(0, e.handle || FX.handle), b2 = board(1, e.board || 'רילס  ·  47 אפקטים');
      const names = split(e.text, 'הוק|כתוביות|קאטים|בי-רול');
      const spots = [[-0.95, 2.35], [0.55, 2.0], [-0.35, 2.95], [0.95, 2.75], [0.1, 3.45], [-1.1, 3.3]];
      const ph = W * 0.078, fs = ph * 0.42, pd = Math.floor(fs * 0.2) + 4, ts = ph * 0.33;
      const pills = names.map((n) => {
        const p = mk(C, 'pills-pill', `<span>${esc(n)}</span><svg width="${ts}" height="${ts}" style="left:${ph * 0.22}px;top:${ph * 0.33}px"><polyline points="0,${ts * 0.5} ${ts * 0.36},${ts * 0.85} ${ts},${ts * 0.1}" fill="none" stroke="#fff" stroke-width="${Math.max(3, Math.floor(ts / 5))}" stroke-linejoin="round"/></svg>`,
          { height: ph, borderRadius: ph / 2, fontSize: fs, lineHeight: ph + 'px', paddingRight: ph * 0.18 + pd });
        return [p, p.lastChild, n];
      });
      const s = W * 0.055, cp = [[3, 3], [3, s * 1.12], [s * 0.3, s * 0.87], [s * 0.5, s * 1.33], [s * 0.66, s * 1.26], [s * 0.46, s * 0.8], [s * 0.82, s * 0.8]];
      const cur = mk(F, 'pills-cur', `<svg width="${s * 0.95}" height="${s * 1.45}"><polygon points="${cp.map((p) => p.join(',')).join(' ')}" fill="#fff" stroke="#000" stroke-width="${Math.max(2, Math.floor(s / 14))}" stroke-linejoin="round"/></svg>`);
      const pop_ = (lt, t0, dur = 0.3) => (lt > t0 ? eback((lt - t0) / dur) : 0);
      frame(e, (lt, f) => {
        const k = clamp(lt / 0.15, 0, 1), al = clamp((d - lt) / 0.2, 0, 1);
        room.style.opacity = k;
        const by = Math.max(H * 0.17, f.fy - f.fw * 0.9);
        gsap.set(b1, { xPercent: -50, yPercent: -50, x: W * 0.25, y: by, rotation: -8, scale: 0.6 + 0.4 * pop_(lt, 0), opacity: al * clamp(lt / 0.1, 0, 1) });
        gsap.set(b2, { xPercent: -50, yPercent: -50, x: W * 0.76, y: by - W * 0.02, rotation: 8, scale: 0.6 + 0.4 * pop_(lt, 0.1), opacity: al * clamp((lt - 0.1) / 0.1, 0, 1) });
        const pos = [];
        pills.forEach(([p, tick, n], i) => {
          const tW = tw(n, fs) + 2 * pd;
          const [sx, sy] = spots[i % spots.length];
          const x = clamp(f.fx + sx * f.fw * 1.6, W * 0.16, W * 0.84), y = clamp(f.fy + sy * f.fw, H * 0.3, H * 0.9), t0 = 0.22 + 0.2 * i;
          pos.push([x, y, t0]);
          if (lt < t0) { p.style.opacity = 0; return; }
          const clicked = lt >= t0 + 0.12, sq = 1 - 0.1 * Math.sin(Math.PI * clamp((lt - t0 - 0.12) / 0.2, 0, 1));
          tick.style.display = clicked ? 'block' : 'none';
          gsap.set(p, { width: Math.floor(tW + ph * (clicked ? 0.75 : 0.35)), xPercent: -50, yPercent: -50, x, y, scale: (0.5 + 0.5 * pop_(lt, t0, 0.25)) * sq, opacity: al });
        });
        if (pos.length && lt > pos[0][2] - 0.1) {
          const seg = pos.filter((p) => p[2] <= lt + 0.1), [tx, ty, t0] = seg[seg.length - 1];
          const [px, py] = seg.length > 1 ? pos[seg.length - 2] : [W * 0.9, H * 0.95];
          const q = eio((lt - (t0 - 0.12)) / 0.2);
          gsap.set(cur, { x: px + (tx - px) * q + ph * 0.3 + 15, y: py + (ty - py) * q + ph * 0.1 + 15, opacity: al });
        } else cur.style.opacity = 0;
      });
    },
