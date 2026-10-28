---
name: claude-hebrew-video-effects
description: Hebrew video effects library. 47 effects for a talking-head video (זרקור, כותרת, צ'קליסט, נעילה, תגובה, שלט, הודעות, חותמת, מגזין, זום, גרף, מעגל, מתגים, ספירה, נצנצים, עקבו, כותרת זום, מניפה, דחיפה, לפני אחרי, צבע, אריחים, קבלה, מודי, רשימת משימות, עצירה, מחיקה, תצוגת אינסטגרם, מקשים, מנהרה, שרבוט, ווידג'טים, קולאז', חצי מסך, פסטל, כפתורים, טיימליין, פרופיל, דירוג, הדגמה, טלפונים, נקודות, קיר כותרות, פסיפס, דוקומנטרי, גרף צפיות, סטודיו). Effects follow the speaker's head and can sit behind them. Use when the user types /fx or /claude-hebrew-video-effects, writes one of the Hebrew effect names, or asks in Hebrew or English to add an effect, zoom, grade, sticker or animation to their video ("תשימי זרקור על המילה קלוד", "תוסיף צ'קליסט", "אפקט").
---

# אפקטים בעברית

The user is usually not technical and writes in Hebrew. Reply in short, friendly Hebrew, do the work, never ask them to run commands.
All paths are relative to this skill's folder.

## 1. Video + effect
- Video: they drag it in or give a path. Vertical phone video works best.
- Effect: match their Hebrew words to the table below (names, close synonyms, or a description). Unsure? Show them the table.
- Timing: "על המילה X" / "כשאני אומרת..." → transcribe first:
  `npx hyperframes transcribe <video> --model large-v3 --language he --json` and use those word times.
  No timing given → ask one short question, or pick 2–4 seconds where it fits. Short windows look best (2–4s).
- Starts snap to speech automatically: each effect begins when the speaker starts talking, if that's within about 0.6s after (or 0.3s before) the planned start. Add `"snap": false` to keep an exact start.
- Several effects may run one after another; avoid overlapping two effects that move the camera (זום, נעילה, דחיפה, כותרת זום, חצי מסך, הדגמה, גרף צפיות, סטודיו).

## 2. Plan → check → render
1. Write `<video-name>_fx/plan.json` next to the video:
   ```json
   {"effects": [
     {"fx": "זרקור", "start": 3.2, "end": 6.0, "text": "קלוד"},
     {"fx": "צ'קליסט", "start": 8.0, "end": 12.0, "text": "שלב אחד|שלב שתיים|שלב שלוש"}
   ]}
   ```
   Optional top-level: `"images": "<folder of reel covers/screenshots>"` (for מעגל, מניפה, כפתורים, פרופיל, הדגמה, טלפונים, פסיפס), `"handle"`, `"name"`, `"avatar": "<profile photo>"` (used wherever a profile picture appears: עקבו, תגובה, תצוגת אינסטגרם, ווידג'טים, פסטל, פרופיל).
2. Build + check frames: `python3 engine/build.py <video> <plan.json> <video-name>_fx --snap <mid-point of each effect, comma separated>`.
   The first run cuts the speaker out of the background (a few minutes for a minute of video). Look at the PNGs in `<video-name>_fx/snapshots/` yourself.
   Fix text, timing or options if anything covers the face, is cut off, or is hard to read.
3. Render: `python3 engine/build.py <video> <plan.json> <video-name>_fx --render <video-name>_fx.mp4`. Keeps the original audio, 1080×1920.
4. Tell them where the file is, and that they can open the project in Studio (`npx hyperframes preview` inside the folder) to tweak.

## The effects
| שם | `fx` id | מה זה עושה | אפשרויות |
|---|---|---|---|
| זרקור | spotlight | החדר נכבה, רק האדם בסרטון נשאר מואר, ומילה זוהרת מופיעה מאחורי הראש | `text`, `color` |
| כותרת | backdrop | מילה ענקית נופלת מלמעלה ונעצרת מאחורי הראש (גם: מילה ענקית) | `text`, `color`, `font` (`serif`) |
| נצנצים | glitter | קרני זהב מאחורי הראש, מילה מוזהבת וניצוצות | `text` |
| זום | zoom | זום מהיר פנימה על הפנים | `zoom` (ברירת מחדל 1.45, עד 2) |
| נעילה | locked | סוגריים לבנים ננעלים על הפנים ועוקבים אחריהן, עם זום איטי. הכי טוב 1.5–2 שניות | `text` (תווית קטנה מתחת, לא חובה), `zoom` |
| דחיפה | push | זום איטי וקולנועי, והרקע מיטשטש | `zoom` (1.6), `blur` |
| צ'קליסט | checklist | רשימת משימות של Claude מתחת לסנטר, כל שורה מסתובבת ואז מקבלת ✓ | `text` (שורות עם `\|`), `meta`, `title` |
| תגובה | comment | חלון תגובות של אינסטגרם מעל הראש: מילה מוקלדת, מתפרסמת ומקבלת לב ותשובה | `text` |
| עקבו | follow | כרטיס "מוצע עבורך" של אינסטגרם עם תמונת פרופיל, ולחיצה על מעקב | `avatar` (תמונת פרופיל), `at` (שנייה) |
| חותמת | stamp | חותמת גומי אדומה נוחתת על המסך | `text`, `color`, `angle`, `y` |
| ספירה | countdown | שעון ספירה לאחור 3, 2, 1 מעל הראש | `from` |
| מגזין | cover | הסרטון הופך לשער של מגזין, ושם המגזין מאחורי הראש | `text`, `lines`, `right` (שורות עם `\|`), `issue`, `color` |
| הודעות | messages | התראות הודעה נכנסות אחת אחרי השנייה | `text` (הודעות עם `\|`), `title`, `y` |
| כותרת זום | headline | זום פנימה וכותרת בשתי שורות, השנייה בתוך מלבן לבן (גם: כותרת עם זום) | `text` (2 שורות עם `\|`), `zoom` |
| גרף | graph | כרטיס זכוכית עם גרף שעולה ומספר שסופר | `text` (תווית), `from`, `to` (למשל `197K`), `color` |
| מתגים | toggles | כרטיס הגדרות של אייפון, המתגים נדלקים אחד אחרי השני | `text` (שורות עם `\|`), `ticks`, `title` |
| שלט | led | החדר נכבה ושלט לד מקליד את עצמו מאחורי הראש | `text` (שורות עם `\|`), `color` |
| מעגל | orbit | תמונות של רילס מסתובבות במעגל סביב הראש | `count`, `speed` (1.2), `size` + `images` בתוכנית |
| מניפה | noise | כרטיסי רילס ממוספרים נבנים למניפה של 3 שורות מאחורי הראש | `rows` (3), `per` (9 בכל שורה) + `images` בתוכנית |
| לפני אחרי | swipe | סליידר לפני/אחרי עובר על המסך | `grade` (הלוק של ה"אחרי") |
| צבע | grade | פילטר צבע על כל הסרטון | `grade`: `moody`, `bw`, `warm`, `cool`, `pop`, `film` |
| אריחים | lineup | אריחים ממוספרים נפרשים בקשת מעל הראש | `text` (שמות עם `\|`) |
| קבלה | bill | מדפסת של Claude מדפיסה קבלה ארוכה ליד הראש | `text` (שורות עם `\|`) |
| מודי | moody | צבעים כהים ומודיים עם שוליים כהים | `grade` (`moody`, `bw`, `warm`, `cool`, `pop`) |
| רשימת משימות | todo | רשימת משימות ליד הראש, השורות מסומנות אחת אחרי השנייה (גם: רשימה, משימות) | `text` (שורות עם `\|`), `ticks`, `title` |
| עצירה | pause | הפריים קופא וחצים בכתב יד מצביעים על האדם בסרטון | `text` (2 תוויות עם `\|`) |
| מחיקה | uninstall | אייקונים של אפליקציות רועדים ונמחקים, עם גליץ׳ | `text` (3 שמות עם `\|`) |
| תצוגת אינסטגרם | film | הסרטון מתכווץ למסך רילס של אינסטגרם, עם אייקונים, לייקים, פרופיל וכיתוב (גם: אינסטגרם) | `text` (handle), `caption`, `likes`, `comments`, `reposts` |
| מקשים | keys | מקשי מקלדת נופלים מאחורי הראש | `text` (מקשים עם `\|`), `count` |
| מנהרה | tunnel | הפריים נכנס לתוך עצמו שוב ושוב | `ratio`, `spin` |
| שרבוט | scribble | שחור-לבן, ומרקר מקיף את הפנים עם המילה "אני" | `text`, `color` |
| ווידג'טים | widgets | ווידג׳טים מזכוכית סביב הראש, ו"נערך ע״י Claude" למטה | `text` (המספר הגדול) |
| קולאז' | collage | שחור-לבן, מילה אדומה ענקית מאחורה ו-3 שורות שנוחתות | `text`, `lines` (עם `\|`), `color` |
| חצי מסך | split | כרטיס כותרת יורד מלמעלה ודוחף את הסרטון למטה | `text` (2 שורות), `hl` (מילה צבועה), `pill` |
| פסטל | pastel | חדר לילך, מילה ענקית מאחורה וכרטיס פרופיל עם מעקב | `text`, `color` |
| כפתורים | pills | חדר משבצות, לוחות רילס מאחורה וסמן שלוחץ על כפתורים כחולים | `text` (כפתורים עם `\|`) + `images` |
| טיימליין | timeline | לוק אדום, טיימליין עריכה, REC וטיים-קוד | `text` (כותרת), `sub` |
| פרופיל | profile | גריד של רילס על הקיר ומונה צפיות | `count` (במיליונים) + `images` |
| דירוג | tier | טבלת דירוג, ו-Claude עף לשורה S | `item`, `others` (שורות עם `\|`) |
| הדגמה | broll | סרטון של מה שמדברים עליו בחצי העליון, האדם בחצי התחתון, וכיתוב לבן (גם: בירול) | `text` (כיתוב), `video` (+ `video_start`), אחרת `card` + `images` |
| טלפונים | phones | טלפונים עם רילס נפרשים כמו קלפים | `text` (2 שורות) + `images` |
| נקודות | dots | הפריים נבנה מנקודות זוהרות ואז נחשף | — |
| קיר כותרות | wall | כותרות נערמות מאחורה, ואז סך הצפיות קופץ | `text` (כותרות עם `\|`), `total`, `label2` |
| פסיפס | mosaic | גריד של תמונות מהבהב מסביב, ו-3 מילים נבנות מעל הראש (גם: מוזאיקה) | `text` (3 מילים עם `\|`) + `images` |
| דוקומנטרי | documentary | שחור-לבן על רקע כהה, עיגול ורוד מאחורי הראש, כותרת ב-3 שורות, כפתור "עקבו" שנלחץ ושם למטה | `text` (3 שורות עם `\|`, `*מילה*` בוורוד), `series`, `color` |
| גרף צפיות | chart | פאנל עם גרף עמודות של הרילס הכי נצפים יורד מלמעלה, והסרטון בחלון מעוגל למטה | `text` (2 שורות), `values`, `labels` (עם `\|`), `avg`, `max` |
| סטודיו | studio | חלון הרינדור של Claude: שלבים שמסומנים, טראקים, סמן ואחוזים, והסרטון בחלון מעוגל למטה (גם: רינדור) | `rows` (`שם:סטטוס` עם `\|`), `captions`, `text` (כותרת, לא חובה) |

Names typed with ׳ (a phone keyboard's geresh) work too. Add `"label": "<name>"` to any effect to show "/name" at the bottom (for demo reels).

## Rules
- Never cover the face. Cards sit under the chin; words sit behind the head. If a check frame shows text on the face, change `y`, shorten the text, or move the effect.
- Zoom never goes past 2×.
- Visuals only: no sound effects, no captions unless asked.
- These are first versions. Show them a check frame before a long render.
