    // fx_uninstall: the frame glitches more and more (RGB split + torn rows), pixelates and darkens at the end, under an "Uninstalling..." bar
    uninstall(e, B, C, F) {
      const d = e.end - e.start, W = 1080, H = 1920, NB = 12, id = 'uninstall' + e.i;
      // SVG filters on the camera (the footage + everything under it): rgb split -> rows rolled sideways -> pixelate
      const NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('width', 0); svg.setAttribute('height', 0); svg.setAttribute('class', 'uninstall-defs');
      const bands = [];
      for (let j = 0; j < NB; j++) bands.push(`<feFlood result="b${j}" x="0" y="0" width="${W}" height="0" flood-color="rgb(128,128,128)"/>`);
      svg.innerHTML = `<defs>
        <filter id="${id}g" filterUnits="userSpaceOnUse" x="${-W}" y="0" width="${3 * W}" height="${H}" color-interpolation-filters="sRGB">
          <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r"/>
          <feOffset in="r" dx="0" x="0" y="0" width="${W}" height="${H}" result="ro"/>
          <feTile in="ro" result="rt"/>
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="gg"/>
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="bb"/>
          <feOffset in="bb" dx="0" x="0" y="0" width="${W}" height="${H}" result="bo"/>
          <feTile in="bo" result="bt"/>
          <feComposite in="rt" in2="gg" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" x="0" y="0" width="${W}" height="${H}" result="rg"/>
          <feComposite in="rg" in2="bt" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" x="0" y="0" width="${W}" height="${H}" result="split"/>
          <feTile in="split" result="wide"/>
          <feFlood result="m0" flood-color="rgb(128,128,128)"/>
          ${bands.join('')}
          <feMerge result="map"><feMergeNode in="m0"/>${bands.map((_, j) => `<feMergeNode in="b${j}"/>`).join('')}</feMerge>
          <feDisplacementMap in="wide" in2="map" scale="200" xChannelSelector="R" yChannelSelector="G" x="0" y="0" width="${W}" height="${H}"/>
        </filter>
        <filter id="${id}p" filterUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}" color-interpolation-filters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="bl"/>
          <feFlood x="0" y="0" width="1" height="1" flood-color="#fff"/>
          <feComposite width="2" height="2"/>
          <feTile result="dots"/>
          <feComposite in="bl" in2="dots" operator="in"/>
          <feMorphology operator="dilate" radius="0"/>
        </filter></defs>`;
      F.appendChild(svg);
      const G = svg.querySelector(`#${id}g`), P = svg.querySelector(`#${id}p`);
      const [, offR, , , offB] = G.querySelectorAll('feOffset, feColorMatrix'), floods = [...G.querySelectorAll('feFlood')].slice(1);
      const [pBlur, pDot, pCell, , , pDil] = P.children, cam = document.getElementById('cam');
      // a seeded stand-in for the original np.random.default_rng(int(c.t * 30)): same seed per video frame, new pattern every frame
      const rng = (s) => { let a = (s * 2654435761 + 1013904223) >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
      // the bar: 0.7W x 0.2W, radius 22, title, track + blue fill, percent (mirrored for Hebrew: text on the right, fills right to left)
      const bw = Math.floor(W * 0.7), bh = Math.floor(W * 0.2), pin = mk(F, 'pin', null, { left: W / 2, top: H * 0.16 });
      const bar = mk(pin, 'uninstall-bar', null, { left: -bw / 2, top: -bh / 2, width: bw, height: bh });
      mk(bar, 'uninstall-title', esc(e.text || 'מסיר התקנה...'), { right: bw * 0.06, top: bh * 0.28, fontSize: bh * 0.18 });
      const track = mk(bar, 'uninstall-track', null, { left: bw * 0.06, top: bh * 0.56, width: bw * 0.88, height: bh * 0.14 });
      const fill = mk(track, 'uninstall-fill'), pct = mk(bar, 'uninstall-pct', '0%', { left: bw * 0.06, top: bh * 0.85, fontSize: bh * 0.13 });
      frame(e, (lt) => {
        const p = clamp(lt / d, 0, 1), g = Math.pow(p, 1.6), r = rng(Math.floor((e.start + lt) * 30));
        const sh = Math.floor(g * W * 0.025);
        offR.setAttribute('dx', sh); offR.setAttribute('x', sh); offB.setAttribute('dx', -sh); offB.setAttribute('x', -sh);   // + feTile = np.roll (wraps)
        const nb = Math.floor(2 + g * 10);
        floods.forEach((fl, j) => {
          if (j >= nb) { fl.setAttribute('height', 0); return; }
          const y0 = Math.floor(r() * H), hh = Math.floor(8 + r() * 52), off = Math.trunc((r() * 2 - 1) * g * W * 0.08);
          fl.setAttribute('y', y0); fl.setAttribute('height', hh);
          fl.setAttribute('flood-color', `rgb(${Math.round(255 * (0.5 - off / 200))},128,128)`);   // samples x - off = np.roll by off
        });
        let flt = `url(#${id}g)`;
        if (p > 0.82) {
          const q = (p - 0.82) / 0.18, f = 1 + Math.floor(q * 40);
          if (f > 1) {
            const even = f % 2 === 0, s = even ? 2 : 1;
            pBlur.setAttribute('stdDeviation', f / 3);
            pDot.setAttribute('x', Math.floor((f - s) / 2)); pDot.setAttribute('y', Math.floor((f - s) / 2)); pDot.setAttribute('width', s); pDot.setAttribute('height', s);
            pCell.setAttribute('width', f); pCell.setAttribute('height', f);
            pDil.setAttribute('radius', (f - s) / 2);
            flt += ` url(#${id}p)`;
          }
          flt += ` brightness(${1 - 0.6 * q})`;
        }
        cam.style.filter = flt;
        const v = eio(p);
        fill.style.width = (bw * 0.88 * Math.max(0.03, v)) + 'px';
        pct.textContent = Math.floor(v * 100) + '%';
        gsap.set(bar, { scale: 0.8 + 0.2 * eback(lt / 0.3), opacity: clamp(lt / 0.1, 0, 1) });
      });
      tl.set('#cam', { filter: 'none' }, e.end);
    },
