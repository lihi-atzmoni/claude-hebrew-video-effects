    // the-bill as in the original reel: a dark printer bar top-right, a white receipt with big typewriter lines prints down beside the head
    bill(e, B, C, F) {
      const lines = String(e.text || 'קלוד · כרטיס עריכה|רילס 1031 · 27.10.26||01 עוקב אחרי הפנים|02 מעגל|03 מכניס את כולם|04 שם את המילה|05 קלוד מאחוריי|06 מכבה את האור||חתום ✓').split('|');
      const d = e.end - e.start, h = head(e.start), right = h.x < 540;
      const pw = 560, lh = 62, pad = 34, ph = pad * 2 + lh * lines.length, x = right ? 1080 - pw - 30 : 30, top = 250;
      const bar = mk(B, 'bill-bar', '<i></i><i></i><i></i><span>CLAUDE</span>', { left: x - 40, top: top - 96, width: pw + 80 });
      const clip = mk(B, 'bill-clip', null, { left: x, top: top, width: pw, height: ph + 30 });
      const paper = mk(clip, 'bill-paper', lines.map((l) => `<div>${esc(l) || '&nbsp;'}</div>`).join(''), { width: pw, height: ph, padding: `${pad}px ${pad}px` });
      fadeIn(bar, e.start, 0.15);
      tl.fromTo(paper, { y: -ph - 30 }, { y: 0, duration: Math.min(1.8, d * 0.75), ease: 'power1.inOut' }, e.start + 0.1);
    },
