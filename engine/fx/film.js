    // fx_reel_frame: the video shrinks (to 80%) into a rounded reel card over a blurred, darkened copy of itself, with IG reel icons + handle
    film(e, B, C, F) {
      const d = e.end - e.start, W = 1080, H = 1920, cam = document.getElementById('cam');
      // the blurred background: the original frame -> 1/16 size -> linear upscale -> gaussian 12 -> * (1 - 0.45k); a hole where the card is
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H; cv.className = 'film-bg'; F.appendChild(cv);
      const ctx = cv.getContext('2d'), sw = Math.floor(W / 16), sh = Math.floor(H / 16), p = 4;
      const sm = Object.assign(document.createElement('canvas'), { width: sw, height: sh }), sx = sm.getContext('2d');
      const pa = Object.assign(document.createElement('canvas'), { width: sw + 2 * p, height: sh + 2 * p }), px = pa.getContext('2d');
      const pb = Object.assign(document.createElement('canvas'), { width: sw + 2 * p, height: sh + 2 * p }), pbx = pb.getContext('2d');
      sx.imageSmoothingQuality = 'high';
      const source = () => {   // while rendering, HyperFrames shows each video frame as an <img> right after the <video>
        const v = document.getElementById('src'), im = v && v.nextElementSibling;
        if (im && im.tagName === 'IMG' && im.classList.contains('__render_frame__') && im.complete && im.naturalWidth) return im;
        return v && v.readyState >= 2 ? v : null;
      };
      const drawBg = (k) => {
        const src = source();
        if (src) {
          sx.drawImage(src, 0, 0, sw, sh);
          // pad by reflecting the edges (the original cv2 blur reflects at the border instead of fading to black)
          px.setTransform(1, 0, 0, 1, 0, 0); px.drawImage(sm, p, p);
          px.setTransform(-1, 0, 0, 1, p, 0); px.drawImage(sm, 0, 0, p, sh, 0, p, p, sh);
          px.setTransform(-1, 0, 0, 1, 2 * (p + sw), 0); px.drawImage(sm, sw - p, 0, p, sh, sw, p, p, sh);
          px.setTransform(1, 0, 0, 1, 0, 0);
          pbx.setTransform(1, 0, 0, 1, 0, 0); pbx.clearRect(0, 0, pb.width, pb.height); pbx.drawImage(pa, 0, 0);
          pbx.setTransform(1, 0, 0, -1, 0, 2 * p); pbx.drawImage(pa, 0, p, pa.width, p, 0, p, pa.width, p);
          pbx.setTransform(1, 0, 0, -1, 0, 2 * (p + sh)); pbx.drawImage(pa, 0, sh, pa.width, p, 0, sh, pa.width, p);
        }
        ctx.globalCompositeOperation = 'source-over'; ctx.clearRect(0, 0, W, H);
        ctx.filter = `blur(12px) brightness(${1 - 0.45 * k})`; ctx.imageSmoothingEnabled = true;
        ctx.drawImage(pb, -p * W / sw, -p * H / sh, (sw + 2 * p) * W / sw, (sh + 2 * p) * H / sh);
        ctx.filter = 'none';
      };
      // real Instagram reel chrome: outline action icons with counts on the right, profile row + caption + audio at the bottom
      const P = (dd) => `<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${dd}</svg>`;
      const icons = [
        [P('<path d="M16.8 3.6c-2 0-3.7 1.1-4.8 2.7-1.1-1.6-2.8-2.7-4.8-2.7C4 3.6 1.7 6.2 1.7 9.3c0 6 9.3 11.2 10.3 11.7 1-.5 10.3-5.7 10.3-11.7 0-3.1-2.3-5.7-5.5-5.7z"/>'), e.likes || '1,390'],
        [P('<path d="M20.6 16.9A9.6 9.6 0 1 0 17 20.4l4.6 1.3z"/>'), e.comments || '4'],
        [P('<path d="M18.5 7H7a3.5 3.5 0 0 0-3.5 3.5V12"/><path d="M15.5 3.8 18.7 7l-3.2 3.2"/><path d="M5.5 17H17a3.5 3.5 0 0 0 3.5-3.5V12"/><path d="M8.5 20.2 5.3 17l3.2-3.2"/>'), e.reposts || '67'],
        [P('<path d="M21.5 2.8 9.6 10.1"/><path d="M21.5 2.8 14.8 21l-5.2-10.9L2.4 6.6z"/>'), ''],
        [P('<path d="M19 21l-7-5-7 5V3.2h14z"/>'), ''],
        [P('<circle cx="5" cy="12" r="1.3" fill="#fff"/><circle cx="12" cy="12" r="1.3" fill="#fff"/><circle cx="19" cy="12" r="1.3" fill="#fff"/>'), ''],
      ];
      const ic = mk(F, 'film-icons', icons.map(([svg, n]) => `<div class="film-ic">${svg}${n ? `<span>${esc(n)}</span>` : ''}</div>`).join(''));
      const f0 = faceAt(e.start), ks = 70 / f0.fw;
      const av = (e.avatar || FX.avatar) ? `background-image:url('${e.avatar || FX.avatar}');background-size:cover;background-position:center 25%`
        : `background-image:url('${e.freeze}');background-size:${1080 * ks}px ${1920 * ks}px;background-position:${37 - f0.fx * ks}px ${37 - f0.fy * ks}px`;
      const hdl = mk(F, 'film-bottom', `<div class="film-row"><i style="${av}"></i><b>${esc((e.text || FX.handle || '@your.handle').replace('@', ''))}</b><span class="film-follow">מעקב</span></div>
        <div class="film-cap">${esc(e.caption || 'ככה עורכים רילס בעברית ✨')}</div><div class="film-audio">♫ ${esc(FX.handle.replace('@', ''))} · אודיו מקורי</div>`);
      frame(e, (lt) => {
        const k = eo(lt / 0.35) * clamp((d - lt) / 0.3, 0, 1);
        if (k <= 0) { gsap.set(cam, CAM0); cv.style.opacity = ic.style.opacity = hdl.style.opacity = '0'; return; }
        const sc = 1 - 0.2 * k, iw = Math.floor(W * sc), ih = Math.floor(H * sc), x0 = Math.floor((W - iw) / 2), y0 = Math.floor((H - ih) * 0.42);
        gsap.set(cam, { transformOrigin: '0px 0px', scaleX: iw / W, scaleY: ih / H, x: x0, y: y0 });
        drawBg(k);
        ctx.globalCompositeOperation = 'destination-out'; ctx.beginPath(); ctx.roundRect(x0, y0, iw, ih, W * 0.05 * k + 1); ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        cv.style.opacity = '1';
        gsap.set(ic, { left: x0 + iw - 100, top: y0 + ih * 0.46, opacity: k });
        gsap.set(hdl, { left: x0 + 34, top: y0 + ih - 250, width: iw - 170, opacity: k });
      });
      tl.set(cam, CAM0, e.end);
    },
