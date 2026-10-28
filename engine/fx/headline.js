    headline(e, B, C, F) {
      // fx_headline_box: a punch-in (face_cam, head at 45%) with a two-line headline, the last line in a white box
      const W = 1080, H = 1920, d = e.end - e.start, Z = +e.zoom || 1.2;
      const lines = split(e.text, 'איך גרמתי ל-Claude|לערוך לי את הרילס.'), n = lines.length;
      const cv = document.createElement('canvas').getContext('2d');
      const tw = (s, z) => { cv.font = `800 ${z}px Heebo`; return cv.measureText(s).width; };
      const els = lines.map((ln, j) => {
        const boxed = j === n - 1;
        return [boxed ? mk(F, 'headline-box') : null, mk(F, 'headline-t' + (boxed ? ' boxed' : ''), esc(ln))];
      });
      camRun(e, (lt, h) => {
        const al = clamp((d - lt) / 0.2, 0, 1), z = Math.min(1 + (Z - 1) * eo(lt / 0.22), 2);
        faceCam(h, z, 0.45);
        // the original camera() moves c.fy / c.fw into the zoomed frame
        const zz = z <= 1.002 ? 1 : z, y0 = zz === 1 ? 0 : clamp(h.y + (H / zz) * (0.5 - 0.45) - H / zz / 2, 0, H - H / zz);
        const fy = (h.y - y0) * zz, fw = h.w * 0.8 * zz;
        let S = Math.floor(W * 0.085);   // lines_fit(lines, W*0.84, 'uib', W*0.085)
        while (S > 10 && Math.max(...lines.map((l) => tw(l, S))) > W * 0.84) S = Math.floor(S * 0.94);
        let y = Math.max(H * 0.06, fy - fw * 1.3 - S * 1.3 * n);
        els.forEach(([box, t], j) => {
          const kj = clamp((lt - 0.1 - 0.12 * j) / 0.18, 0, 1);
          if (kj <= 0) { t.style.opacity = 0; if (box) box.style.opacity = 0; y += S * 1.3; return; }
          if (box) {   // rrect(t.width - S*.15, S*1.22), revealed from the reading side
            const bw = tw(lines[j], S) + 2 * (Math.floor(S * 0.2) + 4) - S * 0.15, wk = eo(kj);
            gsap.set(box, { left: W / 2 - bw / 2, top: y, width: bw, height: S * 1.22, borderRadius: S * 0.08, opacity: al,
              clipPath: `inset(0px 0px 0px ${bw - Math.max(1, Math.floor(bw * wk))}px)` });
          }
          gsap.set(t, { top: y + S * 0.6 - 0.526 * S, fontSize: S, lineHeight: S + 'px', scale: 0.92 + 0.08 * eo(kj), opacity: al * kj });
          y += S * 1.3;
        });
      });
    },
