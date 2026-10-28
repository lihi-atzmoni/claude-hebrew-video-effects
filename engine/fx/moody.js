    // fx_moody: blend in the original grade() over 0.35s (no fade-out), plus vignette(0.4k)
    moody(e, B, C, F) {
      const kind = e.grade || 'moody', id = `moody-g${e.i}`;
      // the original grade(img, kind) as an SVG filter, maths in sRGB like the original numpy code; lum = .299 R + .587 G + .114 B
      const Lw = [0.299, 0.587, 0.114], row = (a, off = 0) => a.concat([0, off]).join(' ');
      const sat = (s, m = 1, off = 0) => [0, 1, 2].map((c) => row(Lw.map((w, j) => m * ((1 - s) * w + (j === c ? s : 0))), off)).join(' ');
      const lumRow = (a, b) => row(Lw.map((w) => a * w), b);   // a * lum + b
      const A1 = ' 0 0 0 0 1', AP = ' 0 0 0 1 0';
      let body;
      if (kind === 'bw') body = `<feColorMatrix in="SourceGraphic" values="${[0, 1, 2].map(() => lumRow(1.25, -0.125)).join(' ')}${AP}" result="g"/>`;
      else if (kind === 'warm') body = `<feColorMatrix in="SourceGraphic" values="1.08 0 0 0 .02 0 1 0 0 .02 0 0 .86 0 .02${AP}" result="g"/>`;
      else if (kind === 'cool') body = `<feColorMatrix in="SourceGraphic" values=".9 0 0 0 0 0 1 0 0 0 0 0 1.1 0 0${AP}" result="g"/>`;
      else if (kind === 'pop') body = `<feColorMatrix in="SourceGraphic" values="${sat(1.35, 1.12, -0.06)}${AP}" result="g"/>`;
      else {
        // moody: o = lum + (img - lum) * .6; o = o^1.3 * .88; o += (1 - lum) * [-.03,.035,.065] + lum * [.05,.015,-.04]; o = (o - .42) * 1.12 + .42
        // (worked on opaque copies so the arithmetic is not premultiplied, alpha restored from the source at the end)
        const fn = (t) => ['R', 'G', 'B'].map((c) => `<feFunc${c} ${t}/>`).join('');
        body = `<feColorMatrix in="SourceGraphic" values="${sat(0.6)}${A1}" result="a"/>` +
          `<feComponentTransfer in="a" result="b">${fn('type="gamma" amplitude="0.88" exponent="1.3" offset="0"')}</feComponentTransfer>` +
          `<feColorMatrix in="SourceGraphic" values="${lumRow(0.05, 0)} ${lumRow(-0.02, 0.035)} ${lumRow(-0.065, 0.065)}${A1}" result="tp"/>` +
          `<feColorMatrix in="SourceGraphic" values="${lumRow(0.03, 0.97)} ${lumRow(0, 1)} ${lumRow(-0.04, 1)}${A1}" result="tn"/>` +   // 1 - negative part
          `<feComposite in="b" in2="tp" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="c"/>` +
          `<feComposite in="c" in2="tn" operator="arithmetic" k1="0" k2="1" k3="1" k4="-1" result="d"/>` +
          `<feComponentTransfer in="d" result="e">${fn('type="linear" slope="1.12" intercept="-0.0504"')}</feComponentTransfer>` +
          `<feComposite in="e" in2="SourceGraphic" operator="in" result="g"/>`;
      }
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '0'); svg.setAttribute('height', '0'); svg.style.position = 'absolute';
      svg.innerHTML = `<filter id="${id}" color-interpolation-filters="sRGB" x="0" y="0" width="1" height="1">${body}` +
        `<feComposite in="g" in2="SourceGraphic" operator="arithmetic" k1="0" k2="0" k3="1" k4="0"/></filter>`;
      document.body.appendChild(svg);
      const mix = svg.querySelector('filter > feComposite:last-child');
      // vignette: c.img *= 1 - 0.4k * clip(((x - W/2) / .75W)^2 + ((y - H/2) / .7H)^2, 0, 1)
      const vs = []; for (let j = 0; j <= 10; j++) vs.push(`rgba(0,0,0,${(0.4 * (j / 10) ** 2).toFixed(4)}) ${j * 10}%`);
      const vig = mk(F, 'full', null, { background: `radial-gradient(810px 1344px at 540px 960px, ${vs.join(', ')})`, opacity: '0' });
      const V = () => document.querySelectorAll('#src, .matte');
      frame(e, (lt) => {
        const k = ramp(lt, e.end - e.start, 0.35, 0);
        mix.setAttribute('k2', k); mix.setAttribute('k3', 1 - k);
        V().forEach((v) => { v.style.filter = `url(#${id})`; });
        vig.style.opacity = k;
      });
      tl.set('#src, .matte', { filter: 'none' }, e.end);
    },
