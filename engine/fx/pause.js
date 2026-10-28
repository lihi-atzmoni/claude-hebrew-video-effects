    // fx_pause_point: the frame freezes (e.freeze), a slow 6% face_cam push, a pause badge, and a hand-drawn arrow from a label to you
    pause(e, B, C, F) {
      e.cut = true;  // the original code cuts back to live, no fade
      const d = e.end - e.start, W = 1080, H = 1920, f0 = faceAt(e.start);   // the original frozen frame keeps its own face box
      const col = e.color || 'rgb(255,214,10)', lw = Math.max(6, Math.floor(W / 140));
      // the frozen frame sits over the live footage inside the camera, so the push zooms it; c.img * 0.92 + bw * 0.08
      mk(C, 'full pause-still', null, { backgroundImage: `url("${e.freeze}")`, filter: 'grayscale(0.08) contrast(1.02)' });
      // pause badge (fixed on screen): 0.1W rounded square at (0.05W, 0.06H), two white bars
      const bx = W * 0.05, by = H * 0.06, bs = W * 0.1;
      mk(F, 'pause-badge', null, { left: bx, top: by, width: bs, height: bs });
      for (const x of [0.075, 0.11]) mk(F, 'pause-bar', null, { left: W * x, top: by + W * 0.025, width: W * 0.017 + 1, height: W * 0.05 + 1 });
      const NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('class', 'pause-svg');
      const line = document.createElementNS(NS, 'polyline'), hd = document.createElementNS(NS, 'path');
      [line, hd].forEach((p) => { p.setAttribute('fill', 'none'); p.setAttribute('stroke', col); p.setAttribute('stroke-width', lw); p.setAttribute('stroke-linejoin', 'round'); svg.appendChild(p); });
      F.appendChild(svg);
      const lwrap = mk(F, 'full'), lpin = mk(lwrap, 'pin'), lab = mk(lpin, 'pause-label', esc(e.text || 'תסתכלו פה'), { color: col, fontSize: W * 0.07 });
      const labH = W * 0.07 * 0.95 + 2 * (Math.floor(W * 0.07 * 0.2 + 15) + 4);   // the original text_img height (ink + 2 * pad)
      const arrowPts = (x0, y0, x1, y1, bend = 0.25, n = 40) => {
        const mx = (x0 + x1) / 2 - (y1 - y0) * bend, my = (y0 + y1) / 2 + (x1 - x0) * bend, out = [];
        for (let k = 0; k < n; k++) { const t = k / (n - 1); out.push([(1 - t) ** 2 * x0 + 2 * (1 - t) * t * mx + t * t * x1, (1 - t) ** 2 * y0 + 2 * (1 - t) * t * my + t * t * y1]); }
        return out;
      };
      frame(e, (lt) => {
        // face_cam(c, 1 + 0.06 * ease_out(lt / d), 0.4) on the frozen face, then the original face coords in screen space
        let z = Math.min(1 + 0.06 * eo(lt / d), 2), fx = f0.fx, fy = f0.fy, fw = f0.fw;
        if (z > 1.002) {
          faceCam(f0, z, 0.4);
          const x0 = clamp(f0.x - 540 / z, 0, 1080 - 1080 / z), y0 = clamp(f0.y + (1920 / z) * 0.1 - 960 / z, 0, 1920 - 1920 / z);
          fx = (fx - x0) * z; fy = (fy - y0) * z; fw = fw * z;
        } else gsap.set('#cam', CAM0);
        const tx = W * (+e.label_x || 0.72), ty = fy - fw * 2.2;
        const pts = arrowPts(tx - W * 0.05, ty + W * 0.06, fx + fw * 0.75, fy - fw * 0.35, 0.3);
        const k = eo((lt - 0.15) / 0.4), n = Math.max(2, Math.floor(pts.length * clamp(k, 0, 1)));
        line.setAttribute('points', k > 0 ? pts.slice(0, n).map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ') : '');
        if (k >= 0.99) {
          const [xa, ya] = pts[pts.length - 4], [xb, yb] = pts[pts.length - 1], a = Math.atan2(yb - ya, xb - xa), s = W * 0.04;
          hd.setAttribute('d', [2.6, -2.6].map((q) => `M${xb},${yb} L${xb + s * Math.cos(a + q)},${yb + s * Math.sin(a + q)}`).join(' '));
        } else hd.setAttribute('d', '');
        gsap.set(lpin, { x: tx, y: ty - labH * 0.2, scale: 0.7 + 0.3 * eback(lt / 0.3), rotation: 6, opacity: clamp(lt / 0.1, 0, 1) });
        const g = `radial-gradient(ellipse ${fw * 0.95}px ${fw * 1.35}px at ${fx}px ${fy}px, rgba(0,0,0,0) 94.87%, rgba(0,0,0,.333) 100%, rgba(0,0,0,.667) 104.88%, #000 109.54%)`;
        lwrap.style.maskImage = g; lwrap.style.webkitMaskImage = g;   // guard=True
      });
      tl.set('#cam', CAM0, e.end);
    },
