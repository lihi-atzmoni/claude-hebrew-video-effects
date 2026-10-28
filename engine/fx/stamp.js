    // fx_reject_stamp: a grainy red rubber stamp (word in a rounded box) slams down from 2.3x, the footage shakes, then it holds
    stamp(e, B, C, F) {
      const d = e.end - e.start, W = 1080, H = 1920, cam = document.getElementById('cam');
      const word = String(e.text || 'נדחה').toUpperCase(), col = e.color || 'rgb(214,40,40)';
      const wrap = mk(F, 'full'), pin = mk(wrap, 'pin'), cv = document.createElement('canvas');
      cv.className = 'stamp-cv'; pin.appendChild(cv);
      let built = false;
      const build = () => {   // the original build(): fit_text(word, 0.62W, 'bold', 200) + rounded outline + alpha * clip(uniform(0.55, 1.6))
        if (!document.fonts.check('900 200px Rubik')) { document.fonts.load('900 200px Rubik'); return false; }
        const x = cv.getContext('2d'), font = (s) => `900 ${s}px Rubik`;
        let sz = 200; x.font = font(sz);
        while (sz > 10 && x.measureText(word).width > W * 0.62) { sz = Math.floor(sz * 0.92); x.font = font(sz); }
        x.direction = 'rtl'; x.textAlign = 'left';
        const m = x.measureText(word), pad = Math.floor(sz * 0.2) + 4;
        const bl = m.actualBoundingBoxLeft, br = m.actualBoundingBoxRight, ba = m.actualBoundingBoxAscent, bd = m.actualBoundingBoxDescent;
        const tw = Math.ceil(bl + br) + 2 * pad, th = Math.ceil(ba + bd) + 2 * pad, p2 = Math.floor(th * 0.12);
        cv.width = tw + 4 * p2; cv.height = th + 2 * p2;
        const c = cv.getContext('2d'), lw = Math.max(6, Math.floor(p2 / 2));
        c.strokeStyle = col; c.lineWidth = lw; c.beginPath();
        c.roundRect(3 + lw / 2, 3 + lw / 2, cv.width - 7 - lw, cv.height - 7 - lw, 18 - lw / 2); c.stroke();   // PIL draws the outline inward
        c.font = font(sz); c.direction = 'rtl'; c.textAlign = 'left'; c.fillStyle = col; c.textBaseline = 'alphabetic';
        c.fillText(word, 2 * p2 + pad + bl, p2 + pad + ba);
        const img = c.getImageData(0, 0, cv.width, cv.height), a = img.data;
        let sd = 3;   // seeded stand-in for np.random.default_rng(3).uniform(0.55, 1.6) per pixel
        const r = () => { sd = (sd + 0x6D2B79F5) >>> 0; let t = Math.imul(sd ^ (sd >>> 15), 1 | sd); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
        for (let i = 3; i < a.length; i += 4) a[i] = Math.floor(a[i] * Math.min(1, 0.55 + 1.05 * r()));
        c.putImageData(img, 0, 0);
        cv.style.left = -cv.width / 2 + 'px'; cv.style.top = -cv.height / 2 + 'px';
        return true;
      };
      const rnd = (s) => { let a = (s * 2654435761 + 1013904223) >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
      frame(e, (lt, f) => {
        if (!built) built = build();
        const k = clamp(lt / 0.16, 0, 1), sc = 2.3 - 1.3 * k * k;
        // the footage (not the stamp) shakes from 0.16s to 0.45s, a new random offset every video frame
        if (lt > 0.16 && lt < 0.45) {
          const amp = (0.45 - lt) / 0.29 * W * 0.012, r = rnd(Math.floor((e.start + lt) * 30));
          gsap.set(cam, { x: (r() * 2 - 1) * amp, y: (r() * 2 - 1) * amp });
        } else gsap.set(cam, { x: 0, y: 0 });
        const y = clamp(e.y != null && e.y !== '' ? +e.y * H : f.fy + f.fw * 2.7, 0, H * 0.85);
        gsap.set(pin, { x: W / 2, y, scale: sc, rotation: -(e.angle != null && e.angle !== '' ? +e.angle : 12), opacity: built ? k * clamp((d - lt) / 0.2, 0, 1) : 0 });
        const g = `radial-gradient(ellipse ${f.fw * 0.95}px ${f.fw * 1.35}px at ${f.fx}px ${f.fy}px, rgba(0,0,0,0) 94.87%, rgba(0,0,0,.333) 100%, rgba(0,0,0,.667) 104.88%, #000 109.54%)`;
        wrap.style.maskImage = g; wrap.style.webkitMaskImage = g;   // guard=True
      });
      tl.set(cam, { x: 0, y: 0 }, e.end);
    },
