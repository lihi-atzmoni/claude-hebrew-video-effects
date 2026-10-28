    // fx_swipe: slanted before/after line sweeps in from the right to 0.1W, then settles at 0.5W; graded "after" on the right
    swipe(e, B, C, F) {
      const kind = e.grade || 'moody', id = `swipe-g${e.i}`, d = e.end - e.start;
      // the original grade(img, kind) as an SVG filter (same maths as moody.js), applied to the extra footage copy #fx<i>-v
      const Lw = [0.299, 0.587, 0.114], row = (a, off = 0) => a.concat([0, off]).join(' ');
      const sat = (s, m = 1, off = 0) => [0, 1, 2].map((c) => row(Lw.map((w, j) => m * ((1 - s) * w + (j === c ? s : 0))), off)).join(' ');
      const lumRow = (a, b) => row(Lw.map((w) => a * w), b);
      const A1 = ' 0 0 0 0 1', AP = ' 0 0 0 1 0';
      let body;
      if (kind === 'bw') body = `<feColorMatrix in="SourceGraphic" values="${[0, 1, 2].map(() => lumRow(1.25, -0.125)).join(' ')}${AP}"/>`;
      else if (kind === 'warm') body = `<feColorMatrix in="SourceGraphic" values="1.08 0 0 0 .02 0 1 0 0 .02 0 0 .86 0 .02${AP}"/>`;
      else if (kind === 'cool') body = `<feColorMatrix in="SourceGraphic" values=".9 0 0 0 0 0 1 0 0 0 0 0 1.1 0 0${AP}"/>`;
      else if (kind === 'pop') body = `<feColorMatrix in="SourceGraphic" values="${sat(1.35, 1.12, -0.06)}${AP}"/>`;
      else {
        const fn = (t) => ['R', 'G', 'B'].map((c) => `<feFunc${c} ${t}/>`).join('');
        body = `<feColorMatrix in="SourceGraphic" values="${sat(0.6)}${A1}" result="a"/>` +
          `<feComponentTransfer in="a" result="b">${fn('type="gamma" amplitude="0.88" exponent="1.3" offset="0"')}</feComponentTransfer>` +
          `<feColorMatrix in="SourceGraphic" values="${lumRow(0.05, 0)} ${lumRow(-0.02, 0.035)} ${lumRow(-0.065, 0.065)}${A1}" result="tp"/>` +
          `<feColorMatrix in="SourceGraphic" values="${lumRow(0.03, 0.97)} ${lumRow(0, 1)} ${lumRow(-0.04, 1)}${A1}" result="tn"/>` +
          `<feComposite in="b" in2="tp" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="c"/>` +
          `<feComposite in="c" in2="tn" operator="arithmetic" k1="0" k2="1" k3="1" k4="-1" result="d"/>` +
          `<feComponentTransfer in="d">${fn('type="linear" slope="1.12" intercept="-0.0504"')}</feComponentTransfer>`;
      }
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '0'); svg.setAttribute('height', '0'); svg.style.position = 'absolute';
      svg.innerHTML = `<filter id="${id}" color-interpolation-filters="sRGB" x="0" y="0" width="1" height="1">${body}</filter>`;
      document.body.appendChild(svg);
      const v = document.getElementById(`fx${e.i}-v`);
      v.style.filter = `url(#${id})`;
      // white edge (|x - line| < 3.5, horizontal), slope dx/dy = 0.22; handle at 0.62H; labels at 0.88H
      const edge = mk(F, 'swipe-edge'), hnd = mk(F, 'swipe-knob', '&lt; &gt;');
      mk(F, 'swipe-tag', 'לפני', { left: 1080 * 0.14 }); mk(F, 'swipe-tag', 'אחרי', { left: 1080 * 0.86 });
      const M = () => document.querySelectorAll('.matte');
      frame(e, (lt) => {
        const p = lt / d, sp = p < 0.5 ? 1.05 - 0.95 * eio(p / 0.5) : 0.1 + 0.4 * eio((p - 0.5) / 0.4);
        const xT = sp * 1080 - 0.22 * 960, xB = sp * 1080 + 0.22 * 960;   // line x at y = 0 and y = H
        v.style.clipPath = `polygon(${xT}px 0px, 4000px 0px, 4000px 1920px, ${xB}px 1920px)`;            // after: right of the line
        M().forEach((m) => { m.style.clipPath = `polygon(-4000px 0px, ${xT}px 0px, ${xB}px 1920px, -4000px 1920px)`; });  // the cut-out only on the before side
        gsap.set(edge, { x: sp * 1080, rotation: -Math.atan(0.22) * 180 / Math.PI });
        const hy = 1920 * 0.62;
        gsap.set(hnd, { x: sp * 1080 + 0.22 * (hy - 960), y: hy });
      });
      tl.set('.matte', { clipPath: 'none' }, e.end);
    },
