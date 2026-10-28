    // fx_spotlight (default look): face_cam push, room darkened to a pool of light, you +4%, optional glowing serif word behind you
    spotlight(e, B, C, F) {
      const d = e.end - e.start, push = +e.push || 1, txt = e.text || '', col = e.color || '#ffb7a5';
      // the original pool: 1 - k * (1 - (0.2 + 0.45 * pool)), pool = clip(1 - r^2)^1.6  ->  black overlay alpha 0.8 - 0.45 * pool (times k)
      const stops = [];
      for (let j = 0; j <= 20; j++) { const r = j / 20; stops.push(`rgba(0,0,0,${(0.8 - 0.45 * Math.pow(Math.max(0, 1 - r * r), 1.6)).toFixed(4)}) ${r * 100}%`); }
      const dark = mk(B, 'full', null, { opacity: '0' });
      let wrap = null, grp = null, word = null, g1 = null, g2 = null, sz0 = 0;
      if (txt) {
        wrap = mk(B, 'full', null, { opacity: '0' });
        grp = mk(wrap, 'spotlight-word');
        g1 = mk(grp, 'spotlight-glow', esc(txt)); g2 = mk(grp, 'spotlight-glow', esc(txt)); word = mk(grp, 'spotlight-txt', esc(txt));
        [g1, g2].forEach((g) => { g.style.color = col; g.style.webkitTextStroke = `0px ${col}`; });
        word.style.color = col;
      }
      const fitSz = () => {   // the original fit_text(word, W * 0.9, 'serif', start=400): shrink by 0.92 until it fits
        if (sz0) return sz0;
        const cx = document.createElement('canvas').getContext('2d'); let s = 400;
        const w = (s) => { cx.font = `300 ${s}px Heebo`; return cx.measureText(txt).width; };
        while (s > 10 && w(s) > 1080 * 0.9) s = Math.floor(s * 0.92);
        if (document.fonts && document.fonts.check('300 40px Heebo')) sz0 = s;
        return s;
      };
      camRun(e, (lt, h) => {
        const z = Math.min(1 + (push - 1) * eio(lt / d), 2), fw = h.w * 0.8;
        faceCam(h, z);
        const x0 = clamp(h.x - 540 / z, 0, 1080 - 1080 / z), y0 = clamp(h.y + (1920 / z) * 0.1 - 960 / z, 0, 1920 - 1920 / z);
        const k = ramp(lt, d, 0.3, 0.25);
        // pool centre (fx, fy + 0.2H) and radii (0.5W, 0.46H) are in screen pixels -> raw (un-zoomed) coords inside the camera
        dark.style.background = `radial-gradient(${540 / z}px ${1920 * 0.46 / z}px at ${h.x}px ${h.y + 1920 * 0.2 / z}px, ${stops.join(', ')})`;
        dark.style.opacity = k;
        gsap.set('.matte', { filter: `brightness(${1 + 0.04 * k})` });
        if (txt) {
          // the original word is drawn in screen space (not zoomed): centre x = W/2, kept above the head with behind()
          const st = (h.top - y0) * z, b = behind({ top: st }, fitSz()), sw = Math.round(b.sz * 0.04) * 2;
          gsap.set(wrap, { x: x0, y: y0, scale: 1 / z, transformOrigin: '0px 0px', opacity: k });
          grp.style.top = b.top + 'px'; grp.style.fontSize = b.sz + 'px';
          [g1, g2].forEach((g) => { g.style.webkitTextStroke = `${sw}px ${col}`; });
        }
      });
      tl.set('.matte', { filter: 'none' }, e.end);
    },
