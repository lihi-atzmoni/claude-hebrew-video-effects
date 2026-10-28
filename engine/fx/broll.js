    // fx_broll_split: the picture (and you) slides down so your face sits at 72% height, a b-roll still wipes down over the
    // top half with a 6px white seam, and a white price-tag sticker pops in just above the seam
    broll(e, B, C, F) {
      const W = 1080, H = 1920, d = e.end - e.start, txt = e.text || '4 שעות  ←  4 דקות';
      const panel = mk(F, 'broll-panel'), img = mk(panel, 'broll-img', null, { backgroundImage: cardImg(+e.pick || 0) });
      mk(panel, 'broll-shade');   // soft gradient so the white caption reads over bright footage
      const seam = mk(F, 'broll-seam'), bv = document.getElementById(`fx${e.i}-broll`);   // real b-roll video, when the plan gives one
      // tag: text_img(text, W*0.06, 'uib', (16,16,18)); tw = tag.width + W*0.11, th = tag.height * 1.25, n = th / 2
      const ts = W * 0.06, tp = Math.floor(ts * 0.2) + 4, th = (ts * 0.72 + 2 * tp) * 1.25, n = th * 0.5;
      const cx = document.createElement('canvas').getContext('2d');
      const pin = mk(F, 'broll-tagwrap', null, { height: th });
      // plain white text instead of the original price-tag sticker (no boxes behind text)
      const shape = mk(pin, 'broll-plain', null, { height: th });
      const lab = mk(shape, 'broll-txt', esc(txt), { left: 0, right: 0, height: th, lineHeight: th + 'px', fontSize: ts * 1.15, color: '#fff', textAlign: 'center' });
      camRun(e, (lt, h) => {
        const k = eo(lt / 0.3) * clamp((d - lt) / 0.2, 0, 1), al = clamp((d - lt) / 0.2, 0, 1);
        gsap.set('#cam', { transformOrigin: '0px 0px', scale: 1, x: 0, y: (H * 0.72 - h.y) * k });   // shift(c, (H*0.72 - fy) * k)
        const sh = Math.floor(H * 0.5 * k);
        if (sh > 2) {
          // b-roll cover-cropped to W x H/2 at zoom z (crop top at 35% of the spare height); its bottom edge rides the seam
          const z = 1 + 0.06 * clamp(lt / d, 0, 1), tw = Math.floor(W * z), thh = Math.floor(H * 0.5 * z);
          const s = Math.max(tw / 360, thh / 640), iw = Math.floor(360 * s) + 1, ih = Math.floor(640 * s) + 1;
          const l = Math.floor((iw - W) / 2), t = Math.floor((ih - H * 0.5) * 0.35);
          panel.style.display = 'block'; panel.style.height = sh + 'px';
          if (bv) { img.style.display = 'none'; bv.style.clipPath = `inset(0px 0px ${Math.max(0, H * 0.5 - sh)}px 0px)`; bv.style.opacity = '1'; }
          img.style.top = (sh - H * 0.5) + 'px'; img.style.backgroundSize = `${iw}px ${ih}px`; img.style.backgroundPosition = `${-l}px ${-t}px`;
          seam.style.display = 'block'; seam.style.top = Math.max(0, sh - 3) + 'px'; seam.style.height = (sh + 3 - Math.max(0, sh - 3)) + 'px';
        } else { panel.style.display = 'none'; seam.style.display = 'none'; if (bv) bv.style.opacity = '0'; }
        cx.font = `800 ${ts}px Heebo`;
        const tw = W * 0.9;
        pin.style.width = tw + 'px'; shape.style.width = tw + 'px';
        const pp = lt > 0.3 ? eback((lt - 0.3) / 0.3) : 0;
        gsap.set(pin, { x: W / 2, y: H * 0.42 * k, xPercent: -50, yPercent: -50, scale: 1, rotation: 0,
          opacity: al * clamp((lt - 0.3) / 0.08, 0, 1) });
      });
    },
