    // fx_shortcut_rain: keyboard keycaps fall behind you at their own speed, size and spin (same random numbers as the original Python)
    keys(e, B, C, F) {
      const d = e.end - e.start, W = 1080, H = 1920, ks = Math.floor(W * 0.1);
      const keys = split(e.text, 'cmd|/|C|V|Z|esc|tab|shift|enter|opt'), n = Math.floor(+e.count || 26);
      // Python's random.Random(seed).random() (Mersenne Twister, init_by_array), so x / t0 / speed / angle match hers exactly
      const pyrand = (seed) => {
        const m = new Uint32Array(624); m[0] = 19650218;
        for (let i = 1; i < 624; i++) m[i] = (Math.imul(1812433253, m[i - 1] ^ (m[i - 1] >>> 30)) + i) >>> 0;
        const key = [seed >>> 0]; let i = 1, j = 0;
        for (let k = 624; k; k--) {
          m[i] = ((m[i] ^ Math.imul(m[i - 1] ^ (m[i - 1] >>> 30), 1664525)) + key[j] + j) >>> 0;
          i++; j++; if (i >= 624) { m[0] = m[623]; i = 1; } if (j >= key.length) j = 0;
        }
        for (let k = 623; k; k--) {
          m[i] = ((m[i] ^ Math.imul(m[i - 1] ^ (m[i - 1] >>> 30), 1566083941)) - i) >>> 0;
          i++; if (i >= 624) { m[0] = m[623]; i = 1; }
        }
        m[0] = 0x80000000;
        let idx = 624;
        const next = () => {
          if (idx >= 624) {
            for (let q = 0; q < 624; q++) { const y = (m[q] & 0x80000000) | (m[(q + 1) % 624] & 0x7fffffff); m[q] = m[(q + 397) % 624] ^ (y >>> 1) ^ (y & 1 ? 0x9908b0df : 0); }
            idx = 0;
          }
          let y = m[idx++]; y ^= y >>> 11; y = (y ^ ((y << 7) & 0x9d2c5680)) >>> 0; y = (y ^ ((y << 15) & 0xefc60000)) >>> 0; y = (y ^ (y >>> 18)) >>> 0;
          return y;
        };
        return () => ((next() >>> 5) * 67108864 + (next() >>> 6)) / 9007199254740992;
      };
      const R = (s) => pyrand(s)(), U = (s, a, b) => a + (b - a) * R(s);
      // the original cap(k): grey base rrect (190,190,198) + lighter top (246,246,248) inset 4/3px, mono label at 0.44 height, shadowed(8, 6, 100)
      const capW = (k) => Math.max(ks, Math.floor([...k].length * 0.6 * ks * 0.36 + ks * 0.5));   // Space Mono advance = 0.6em
      const parts = [];
      for (let i = 0; i < n; i++) {
        const k = keys[i % keys.length], w = capW(k);
        const pin = mk(B, 'pin'), cap = mk(pin, 'keys-cap', `<i style="width:${w - 8}px;height:${ks - 14}px;border-radius:${ks * 0.16}px"></i><b style="top:${ks * 0.44}px;font-size:${ks * 0.36}px">${esc(k)}</b>`,
          { left: -w / 2, top: -ks / 2, width: w, height: ks, borderRadius: ks * 0.18 });
        parts.push({ pin, cap, x: R(i), t0: R(i + 99) * Math.max(0.1, d - 0.8), v: 0.45 + 0.4 * R(i + 7), r0: U(i + 3, -25, 25), w: U(i + 5, -60, 60) });
      }
      frame(e, (lt) => {
        const a = clamp((d - lt) / 0.2, 0, 1);
        for (const q of parts) {
          if (lt < q.t0) { q.pin.style.display = 'none'; continue; }
          q.pin.style.display = 'block';
          // PIL rotates counter-clockwise, CSS clockwise
          gsap.set(q.pin, { x: W * (0.04 + 0.92 * q.x), y: -ks + (lt - q.t0) * q.v * H, scale: 0.75 + 0.35 * q.v, rotation: -(q.r0 + q.w * (lt - q.t0)), opacity: a });
        }
      });
    },
