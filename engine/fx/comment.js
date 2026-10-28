    // fx_comment_box -> comment_sheet (default look): a dark Instagram Comments sheet above your head (your hair in front).
    // The word types in, posts, gets a heart, then your reply drops in with a yellow link chip. Mirrored for RTL.
    comment(e, B, C, F) {
      const d = e.end - e.start, word = e.text || 'אפקטים', handle = (e.handle || FX.handle || 'your.handle').replace('@', '');
      const reply = e.reply || 'שלחתי לך את החבילה', chip = e.chip || '47 אפקטים', ini = esc([...String(e.name || FX.name || 'ל')][0]);
      const sw = 740, sh = 450, N = [...word].length;
      const tPost = 0.3 + 0.06 * N + 0.1, tHeart = tPost + 0.25, tRep = tPost + 0.4;
      const pin = mk(B, 'pin'), sheet = mk(pin, 'comment-sheet', null, { left: -sw / 2, top: -sh / 2, width: sw, height: sh });
      const at = (cls, html, st) => mk(sheet, cls, html, st);
      const av = (sz) => `<div class="comment-av" style="width:${sz}px;height:${sz}px;font-size:${sz * 0.5}px;line-height:${sz}px">${ini}</div>`;
      at('comment-grab', null, { left: sw / 2 - 32, top: 14 });
      at('comment-t mm uib', 'תגובות', { left: sw / 2, top: 50, fontSize: 26 });
      at('comment-hr', null, { top: 79 });
      const empty = at('comment-t mm uim grey', 'התחילו את השיחה.', { left: sw / 2, top: 190, fontSize: 21 });
      // your comment (after Post)
      const cg = at('comment-g', null, { opacity: '0' });
      mk(cg, 'comment-abs', av(46), { right: 26, top: 100 });
      mk(cg, 'comment-t lm uib', `את<span class="uim grey" style="font-size:18px;margin-right:${0.28 * 19 + 4}px">עכשיו</span>`, { right: 88, top: 108, fontSize: 19 });
      mk(cg, 'comment-t la uib', esc(word), { right: 86, top: 128, fontSize: 50 });
      mk(cg, 'comment-t lm uim grey', 'להגיב', { right: 88, top: 196, fontSize: 17 });
      const hp = [];
      for (let j = 0; j < 60; j++) {   // the original heart(): 60 points of the classic heart curve
        const t = (2 * Math.PI * j) / 59, s = 1;
        hp.push(`${(s / 2 + s * 0.48 * (16 * Math.sin(t) ** 3) / 16).toFixed(4)},${(s * 0.46 - (s * 0.46 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))) / 16).toFixed(4)}`);
      }
      const heart = at('comment-heart', `<svg viewBox="0 0 1 1"><polygon points="${hp.join(' ')}"/></svg>`, { left: 46, top: 130 });
      // your reply (the author)
      const rx = 88, rg = at('comment-g', null, { opacity: '0' });
      const face = mk(rg, 'comment-face', '<canvas width="68" height="68"></canvas>', { right: rx, top: 226 });
      const cv = face.firstChild, g2d = cv.getContext('2d');
      if (FX.avatar) Object.assign(face.style, { backgroundImage: `url('${FX.avatar}')`, backgroundSize: 'cover', backgroundPosition: 'center 25%' });
      mk(rg, 'comment-t lm uib', `${esc(handle)}<span class="uim grey" style="font-size:16px;margin-right:10px">יוצרת</span>`, { right: rx + 46, top: 226 + 8, fontSize: 18 });
      mk(rg, 'comment-t lm uim', `${esc(reply)}<span class="comment-emo" style="font-size:24px;margin-right:6px">🎁</span>`, { right: rx + 46, top: 226 + 36, fontSize: 22 });
      const chipEl = at('comment-chip', `<span class="comment-emo">🔗</span><span>${esc(chip)}</span>`, { right: rx + 46, top: 226 + 56, opacity: '0' });
      // reactions row + input row
      ['❤️', '🙌', '🔥', '👏', '😢', '😍', '😮', '😂'].forEach((ch, j) => at('comment-emo comment-abs', ch, { right: 36 + (j * (sw - 72 - 36)) / 7, top: sh - 140, fontSize: 36 }));
      const iy = sh - 78;
      mk(sheet, 'comment-abs', av(48), { right: 22, top: iy });
      at('comment-field', null, { right: 82, left: 22, top: iy, height: 48 });
      const typedEl = at('comment-t lm uib', '', { right: 104, top: iy + 24, fontSize: 26 });
      const caret = mk(typedEl, 'comment-caret');
      const typedTx = typedEl.insertBefore(document.createElement('span'), caret);
      const ph = at('comment-t lm uim grey', `הוספת תגובה עבור ${esc(handle)}`, { right: 104, top: iy + 24, fontSize: 20 });
      const post = at('comment-t rm uib', 'פרסום', { left: 44, top: iy + 24, fontSize: 23 });
      const src = document.getElementById('src');
      frame(e, (lt, f) => {
        const al = clamp((d - lt) / 0.2, 0, 1);
        const typed = lt < tPost ? [...word].slice(0, Math.floor(clamp((lt - 0.3) / (0.06 * N), 0, 1) * N + 1e-3)).join('') : '';
        empty.style.display = lt < tPost ? '' : 'none';
        if (lt >= tPost) {
          const q = eo((lt - tPost) / 0.25);
          gsap.set(cg, { y: (1 - q) * -20, opacity: clamp(q * 1.5, 0, 1) });
        } else cg.style.opacity = '0';
        const hk = eback((lt - tHeart) / 0.3);
        gsap.set(heart, { scale: hk, opacity: hk > 0 ? 1 : 0 });
        const rk = eo((lt - tRep) / 0.25);
        if (rk > 0) {
          gsap.set(rg, { y: (1 - rk) * 16, opacity: clamp(rk * 1.5, 0, 1) });
          // the original face_chip(): a round crop of your face, r = 0.9 fw around (fx, fy - 0.05r)
          const r = f.fw * 0.9, x0 = Math.max(0, f.fx - r), y0 = Math.max(0, f.fy - r * 1.05), vw = src.videoWidth || 1080, k = vw / 1080;
          if (!FX.avatar) try { g2d.drawImage(src, x0 * k, y0 * k, 2 * r * k, 2 * r * k, 0, 0, 68, 68); } catch (err) { /* no frame yet */ }
        } else rg.style.opacity = '0';
        const ck = eback((lt - tRep - 0.12) / 0.3);
        gsap.set(chipEl, { scale: 0.6 + 0.4 * ck, opacity: ck > 0 ? 1 : 0, transformOrigin: '100% 0%' });
        typedTx.textContent = typed;
        typedEl.style.display = typed ? '' : 'none'; ph.style.display = typed ? 'none' : '';
        caret.style.display = Math.floor(lt * 4) % 2 ? '' : 'none';
        const pressed = lt >= tPost - 0.08 && lt < tPost;
        post.style.color = pressed ? 'rgb(140,200,255)' : typed ? 'rgb(0,149,246)' : 'rgb(70,110,160)';
        // shadowed(sheet, 22, 10, 120) -> 848 x 558 image; bottom at fy - fw/2; shrink (>= 0.6) if the top would leave the frame
        const SH = sh + 108, bottom = f.fy - f.fw * 0.5;
        const s = bottom - SH < 1920 * 0.02 ? Math.max(0.6, (bottom - 1920 * 0.02) / SH) : 1;
        const cy = bottom - (SH * s) / 2;
        gsap.set(pin, { x: 540 * 0.5 + f.fx * 0.5, y: cy, scale: s * (0.85 + 0.15 * eback(lt / 0.3)), rotation: 0, opacity: al * clamp(lt / 0.1, 0, 1) });
      });
    },
