#!/usr/bin/env python3
"""Turn a talking-head video + an effects plan into a HyperFrames project (and optionally render it).

    python3 build.py <video> <plan.json> <project_dir> [--render out.mp4] [--snap 1.5,4.2]

plan.json: {"effects": [{"fx": "זרקור", "start": 1.0, "end": 3.5, "text": "קלוד"}, ...]}
Effect names can be Hebrew or English (see NAMES). Standard library only.
"""
import array, json, os, re, shutil, subprocess, sys
from pathlib import Path

ENGINE = Path(__file__).resolve().parent
HF = os.environ.get('HYPERFRAMES_BIN', 'npx --yes hyperframes@0.8.147').split()
# remove-background needs the optional 'sharp' module, which a plain npx install leaves out
HF_CUT = HF if 'HYPERFRAMES_BIN' in os.environ else ['npx', '--yes', '-p', 'hyperframes@0.8.147', '-p', 'sharp', 'hyperframes']
W, H = 1080, 1920

# Hebrew name -> effect id. English ids work too.
NAMES = {
    'זרקור': 'spotlight', 'כותרת': 'backdrop', 'מילה ענקית': 'backdrop', 'מילה': 'backdrop', 'נצנצים': 'glitter',
    'זום': 'zoom', 'נעילה': 'locked', 'דחיפה': 'push', "צ'קליסט": 'checklist', 'צקליסט': 'checklist',
    'תגובה': 'comment', 'עקבו': 'follow', 'עוקבים': 'follow', 'חותמת': 'stamp', 'ספירה': 'countdown',
    'ספירה לאחור': 'countdown', 'מגזין': 'cover', 'הודעות': 'messages', 'כותרת זום': 'headline', 'כותרת עם זום': 'headline', 'גרף': 'graph',
    'מתגים': 'toggles', 'שלט': 'led', 'שלט לד': 'led', 'צבע': 'grade', 'לפני אחרי': 'swipe',
    'לפני-אחרי': 'swipe', 'מעגל': 'orbit', 'מניפה': 'noise',
    'אריחים': 'lineup', 'קבלה': 'bill', 'מודי': 'moody', 'רשימת משימות': 'todo', 'רשימה': 'todo', 'משימות': 'todo', 'עצירה': 'pause', 'מחיקה': 'uninstall',
    'תצוגת אינסטגרם': 'film', 'אינסטגרם': 'film', 'מקשים': 'keys', 'מנהרה': 'tunnel', 'שרבוט': 'scribble', "ווידג'טים": 'widgets', 'ווידגטים': 'widgets',
    "וידג'טים": 'widgets', "קולאז'": 'collage', 'קולאז': 'collage', 'חצי מסך': 'split', 'חצי': 'split', 'פסטל': 'pastel',
    'כפתורים': 'pills', 'טיימליין': 'timeline', 'פרופיל': 'profile', 'דירוג': 'tier', 'הדגמה': 'broll', 'בירול': 'broll', 'טלפונים': 'phones',
    'נקודות': 'dots', 'קיר כותרות': 'wall', 'כותרות': 'wall',
    'פסיפס': 'mosaic', 'מוזאיקה': 'mosaic', 'מוזאיקת תמונות': 'mosaic',
    'דוקומנטרי': 'documentary', 'גרף צפיות': 'chart', 'צפיות': 'chart', 'סטודיו': 'studio', 'רינדור': 'studio',
}
ALL_FX = set(NAMES.values())


def run(cmd, **kw):
    return subprocess.run(cmd, check=True, **kw)


def probe_duration(path):
    out = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(path)],
                         capture_output=True, text=True, check=True).stdout
    return float(out.strip())


def speech_onsets(path):
    log = subprocess.run(['ffmpeg', '-i', str(path), '-af', 'silencedetect=noise=-30dB:d=0.15', '-f', 'null', '-'],
                         capture_output=True, text=True).stderr
    starts = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', log)]
    ends = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', log)]
    return ([0.0] if not starts or starts[0] > 0.3 else []) + ends


def quiet_time(path, t0, t1, fps=30):
    """The quietest video frame between t0 and t1 (mouth most likely closed)."""
    t0 = max(0.0, t0)
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(t0), '-t', str(t1 - t0), '-i', str(path), '-ac', '1', '-ar', '8000',
                          '-f', 's16le', '-'], capture_output=True, check=True).stdout
    a, n = array.array('h', raw), 8000 // fps
    rms = [sum(v * v for v in a[i:i + n]) / max(1, len(a[i:i + n])) for i in range(0, len(a), n)]
    return round(t0 + rms.index(min(rms)) / fps, 3) if rms else t0


def head_track(matte, fps=10, sw=108, sh=192):
    """Head position per frame from the cut-out's alpha: top of the head, centre x, head width (1080x1920 px)."""
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-c:v', 'libvpx-vp9', '-i', str(matte), '-vf',
                          f'fps={fps},alphaextract,scale={sw}:{sh}', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'],
                         capture_output=True, check=True).stdout
    n = len(raw) // (sw * sh)
    k = W / sw
    xs, tops, ws = [], [], []
    last = (W / 2, H * 0.2, W * 0.28)
    for f in range(n):
        fr = raw[f * sw * sh:(f + 1) * sw * sh]
        top = next((y for y in range(sh) if sum(1 for v in fr[y * sw:(y + 1) * sw] if v > 128) >= 2), None)
        if top is None:
            xs.append(last[0]); tops.append(last[1]); ws.append(last[2]); continue
        lo, hi = [], []
        for y in range(top + 5, min(sh, top + 14)):
            row = [x for x in range(sw) if fr[y * sw + x] > 128]
            if row: lo.append(row[0]); hi.append(row[-1])
        if not lo:
            xs.append(last[0]); tops.append(top * k); ws.append(last[2]); continue
        lo.sort(); hi.sort()
        a, b = lo[len(lo) // 2], hi[len(hi) // 2]
        last = ((a + b) / 2 * k, top * k, max(120.0, (b - a) * k))
        xs.append(last[0]); tops.append(last[1]); ws.append(last[2])

    def smooth(v, r=3):
        return [round(sum(v[max(0, i - r):i + r + 1]) / len(v[max(0, i - r):i + r + 1]), 1) for i in range(len(v))]
    return {'fps': fps, 'x': smooth(xs), 'top': smooth(tops), 'w': smooth(ws)}


def merge(windows, pad=0.05):
    out = []
    for s, e in sorted(windows):
        s, e = max(0, s - pad), e + pad
        if out and s <= out[-1][1]: out[-1][1] = max(out[-1][1], e)
        else: out.append([s, e])
    return out


def main():
    a = sys.argv[1:]
    if len(a) < 3: sys.exit(__doc__)
    video, plan_path, proj = Path(a[0]).resolve(), Path(a[1]).resolve(), Path(a[2]).resolve()
    render_to = a[a.index('--render') + 1] if '--render' in a else None
    snap = a[a.index('--snap') + 1] if '--snap' in a else None
    plan = json.loads(plan_path.read_text(encoding='utf-8'))
    fx = plan['effects']
    for e in fx:
        name = str(e['fx']).strip().replace('׳', "'").replace('״', '"')   # Hebrew geresh from a phone keyboard
        e['fx'] = NAMES.get(name, name)
        if e['fx'] not in ALL_FX: sys.exit(f'Unknown effect: {name}')

    assets = proj / 'assets'; assets.mkdir(parents=True, exist_ok=True)
    src = assets / 'source.mp4'
    if video != src.resolve():
        run(['ffmpeg', '-v', 'error', '-y', '-i', str(video), '-vf',
             f'scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps=30',
             '-c:v', 'libx264', '-crf', '16', '-preset', 'fast', '-g', '30', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', str(src)])
    dur = round(probe_duration(src), 3)
    onsets = speech_onsets(src)
    for e in fx:  # start on speech: move to an onset within -0.3s..+0.6s of the planned start
        st = float(e['start'])
        if e['fx'] == 'pause':  # a freeze looks best with the mouth closed: take the quietest frame nearby instead
            e['start'] = quiet_time(src, st - 0.3, min(st + 0.5, float(e['end']) - 0.8))
            continue
        after = [o for o in onsets if st <= o <= st + 0.6]
        before = [o for o in onsets if st - 0.3 <= o < st]
        o = after[0] if after else (before[-1] if before else None)
        if e.get('snap', True) and o is not None and o < float(e['end']) - 0.8:
            e['start'] = round(o, 3)

    matte = assets / 'matte.webm'
    if not matte.exists():
        print('Cutting the speaker out of the background (first run only)...', flush=True)
        run(HF_CUT + ['remove-background', str(src), '-o', str(matte), '--quality', 'best'], stdout=subprocess.DEVNULL)
        tmp = matte.with_name('matte-raw.webm'); matte.rename(tmp)   # dense keyframes, or the cut-out drifts out of lip sync
        run(['ffmpeg', '-v', 'error', '-y', '-c:v', 'libvpx-vp9', '-i', str(tmp), '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-b:v', '8M', '-g', '6', '-an', str(matte)])
        tmp.unlink()
    track_file = proj / 'track.json'
    if not track_file.exists() or track_file.stat().st_mtime < matte.stat().st_mtime:
        track_file.write_text(json.dumps(head_track(matte)))
    track = json.loads(track_file.read_text())

    cards = []   # reel covers for the card effects: the plan's "images" folder, or stills from the clip itself
    cdir = assets / 'cards'; cdir.mkdir(exist_ok=True)
    folder = plan.get('images')
    if folder and Path(folder).is_dir():
        for i, p in enumerate(sorted(q for q in Path(folder).iterdir() if q.suffix.lower() in ('.jpg', '.jpeg', '.png', '.webp'))[:12]):
            out = cdir / f'c{i}.jpg'
            run(['ffmpeg', '-v', 'error', '-y', '-i', str(p), '-vf', 'scale=360:640:force_original_aspect_ratio=increase,crop=360:640', str(out)])
            cards.append(f'assets/cards/{out.name}')
    else:
        for i in range(10):
            out = cdir / f'c{i}.jpg'
            if not out.exists():
                run(['ffmpeg', '-v', 'error', '-y', '-ss', str(dur * (i + 0.5) / 10), '-i', str(src), '-frames:v', '1',
                     '-vf', 'scale=360:640', str(out)])
            cards.append(f'assets/cards/{out.name}')

    shutil.copy(ENGINE / 'gsap.min.js', proj / 'gsap.min.js')
    avatar = ''   # the speaker's profile photo, used wherever a profile picture or a small photo of them appears
    if plan.get('avatar') and Path(plan['avatar']).is_file():
        av = assets / ('avatar' + Path(plan['avatar']).suffix.lower()); shutil.copy(plan['avatar'], av); avatar = f'assets/{av.name}'
    shutil.copytree(ENGINE / 'fonts', proj / 'fonts', dirs_exist_ok=True)
    if not (proj / 'hyperframes.json').exists():
        (proj / 'hyperframes.json').write_text(json.dumps({
            '$schema': 'https://hyperframes.heygen.com/schema/hyperframes.json',
            'paths': {'blocks': 'compositions', 'components': 'compositions/components', 'assets': 'assets'},
            'media': {'autoProxy': True}, 'authoringSkill': 'general-video'}, indent=2))
        (proj / 'package.json').write_text(json.dumps({'name': proj.name, 'private': True, 'type': 'module', 'scripts': {
            'dev': 'npx --yes hyperframes@0.8.147 preview', 'check': 'npx --yes hyperframes@0.8.147 check',
            'render': 'npx --yes hyperframes@0.8.147 render'}}, indent=2))
        (proj / 'meta.json').write_text(json.dumps({'id': proj.name, 'name': proj.name}))

    cam, front = [], []
    for i, e in enumerate(fx):
        s, d = round(float(e['start']), 3), round(float(e['end']) - float(e['start']), 3)
        t = 10 + i * 3
        cam.append((0, f'<div id="fx{i}-b" class="clip fxl fxb" data-start="{s}" data-duration="{d}" data-track-index="{t}"></div>'))
        for v in {'swipe': [''], 'tunnel': ['1', '2', '3', '4', '5', '6']}.get(e['fx'], []):
            cam.append((1, f'<video id="fx{i}-v{v}" class="clip fxv" src="assets/source.mp4" muted playsinline data-has-audio="false" '
                           f'data-media-start="{s}" data-start="{s}" data-duration="{d}" data-track-index="{t + 1}"></video>'))
        if e['fx'] in ('pause', 'pastel', 'profile', 'follow', 'film', 'studio'):
            still = assets / f'freeze_{i}.jpg'
            run(['ffmpeg', '-v', 'error', '-y', '-ss', str(s), '-i', str(src), '-frames:v', '1', '-q:v', '2', str(still)])
            e['freeze'] = f'assets/{still.name}'
        cam.append((2, f'<div id="fx{i}-c" class="clip fxl fxc" data-start="{s}" data-duration="{d}" data-track-index="{t + 1}"></div>'))
        if e['fx'] == 'broll' and e.get('video') and Path(e['video']).is_file():   # real b-roll footage for the top half
            bv = assets / f'broll_{i}.mp4'
            run(['ffmpeg', '-v', 'error', '-y', '-ss', str(e.get('video_start', 0)), '-t', str(d + 0.5), '-i', str(e['video']), '-an', '-vf',
                 'scale=1080:960:force_original_aspect_ratio=increase,crop=1080:960,fps=30', '-c:v', 'libx264', '-crf', '18', '-g', '30', '-pix_fmt', 'yuv420p', str(bv)])
            front.append(f'<video id="fx{i}-broll" class="clip fxbroll" src="assets/{bv.name}" muted playsinline data-has-audio="false" '
                         f'data-media-start="0" data-start="{s}" data-duration="{d}" data-track-index="{t + 1}"></video>')
        front.append(f'<div id="fx{i}-f" class="clip fxl fxf" data-start="{s}" data-duration="{d}" data-track-index="{t + 2}"></div>')
    mattes = [f'<video id="matte{j}" class="clip matte" src="assets/matte.webm" muted playsinline data-has-audio="false" '
              f'data-media-start="{round(s, 3)}" data-start="{round(s, 3)}" data-duration="{round(e - s, 3)}" data-track-index="1"></video>'
              for j, (s, e) in enumerate(merge([(float(x['start']), float(x['end'])) for x in fx]))]
    layers = [h for k, h in cam if k == 0] + [h for k, h in cam if k == 1] + mattes + [h for k, h in cam if k == 2]

    css = (ENGINE / 'effects.css').read_text(encoding='utf-8')
    parts = sorted((ENGINE / 'fx').glob('*.js'))
    js = (ENGINE / 'effects.js').read_text(encoding='utf-8').replace('    /*PARTS*/', '\n'.join(p.read_text(encoding='utf-8') for p in parts))
    css += ''.join(p.read_text(encoding='utf-8') for p in sorted((ENGINE / 'fx').glob('*.css')))
    data = json.dumps({'effects': fx, 'track': track, 'cards': cards, 'handle': plan.get('handle', '@your.handle'),
                       'name': plan.get('name', 'השם שלך'), 'avatar': avatar}, ensure_ascii=False)
    nl = '\n        '
    html = f'''<!doctype html>
<html lang="he">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width={W}, height={H}" />
    <script src="gsap.min.js"></script>
    <style>
{css}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{dur}" data-width="{W}" data-height="{H}">
      <div id="shake">
      <div id="cam">
        <video id="src" class="clip" src="assets/source.mp4" playsinline data-has-audio="true" data-start="0" data-duration="{dur}" data-track-index="0"></video>
        {nl.join(layers)}
      </div>
      <div id="front">
        {nl.join(front)}
      </div>
      </div>
    </div>
    <script>window.FX = {data};</script>
    <script>
{js}
    </script>
  </body>
</html>
'''
    (proj / 'index.html').write_text(html, encoding='utf-8')
    print(f'PROJECT {proj}  ({len(fx)} effects, {dur}s)')

    if snap:
        run(HF + ['snapshot', '--at', snap], cwd=proj)
    if render_to:
        run(HF + ['render', '-o', str(Path(render_to).resolve())], cwd=proj)
        print(f'RENDERED {render_to}')


if __name__ == '__main__':
    main()
