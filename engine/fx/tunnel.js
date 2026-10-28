    tunnel(e) {
      // port of fx_rabbit_hole: the frame tunnels into itself around your face, spinning; you stay in front.
      // level 0 = the footage; levels 1..6 = copies of the frame scaled by ratio^(lev - z*k) and turned (lev - z)*spin*k degrees
      // about the face, each with a white 9px frame, drawn at alpha k. One video copy per level (#fx<i>-v1..v6, as many as exist).
      const W = 1080, d = e.end - e.start, r = +e.ratio || 0.62, speed = +e.speed || 0.8, spin = +e.spin || 10;
      const t = Math.max(4, Math.floor(W / 120));
      const vs = [1, 2, 3, 4, 5, 6].map((k) => document.getElementById(`fx${e.i}-v${k}`)).filter(Boolean);
      // white frame: the renderer swaps each video for an <img> and copies border (not outline), so use a border-box border
      // and undo the 1% the border shrinks the picture by (object-fit: cover into 1062x1902)
      vs.forEach((v) => { Object.assign(v.style, { boxSizing: 'border-box', border: `${t}px solid #fff`, filter: 'opacity(0)' }); });
      const fix = 1 / Math.max((W - 2 * t) / W, (1920 - 2 * t) / 1920);
      const mattes = [...document.querySelectorAll('.matte')];
      frame(e, (lt, f) => {
        const k = eo(lt / 0.4) * clamp((d - lt) / 0.3, 0, 1), z = (lt * speed) % 1.0;
        vs.forEach((v, j) => {
          const lev = j + 1, s = Math.pow(r, lev - z * k), ang = (lev - z) * spin * k;
          const on = k > 0 && s >= 0.03;
          // opacity on a clip is forced to 1 by the framework, so alpha goes through filter: opacity()
          gsap.set(v, { transformOrigin: `${f.fx}px ${f.fy}px`, scale: s * fix, rotation: -ang, filter: `opacity(${on ? k : 0})` });
        });
        // c.img = out * (1 - m*k) + src * m: the cut-out sits on top at alpha k
        mattes.forEach((m) => { m.style.filter = k > 0 ? `opacity(${k})` : ''; });
      });
    },
