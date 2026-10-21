# WhaleReel · 鲸片

> One sentence. Six styles. A finished short.
> Give DeepSeek one sentence; it picks a style, **collects and checks sources**, writes the script, writes the scene code, renders the film.

**No video model. No GPU. No stock footage.** Every frame is drawn in code.

[中文 README](README.md) · [Gallery](site/index.html) · [Trailer](renders/00-trailer-v2.mp4) · [Four cases](examples/cases.md) · [Tanzhe Temple example](examples/tanzhe-temple.md)

---

## What it is

WhaleReel is a video skill for DeepSeek. You say:

> Make a 45-second explainer on Zhu Yuanzhang's governance, 16:9, in Dossier style, with narration and burned-in subtitles.

It will:

1. choose one of six styles (or use the one you name);
2. **search for sources first** and fill `sources.md` — no unsourced number goes on screen;
3. write a 5–7 beat script;
4. generate a self-contained HTML/CSS/JS scene;
5. render frames with Playwright, encode with ffmpeg;
6. run a QA checklist and output mp4 + script + project files.

**It is not a text-to-video model.** DeepSeek does not generate pixels; it writes rendering code. The trade-off: full control and reproducibility, but complex shots still need a human pass.

## Six styles

| Style | Best for | Visual | Needs before you start |
|---|---|---|---|
| [Redacted Dossier](styles/dossier/STYLE.md) | history, cases, institutions | paper file, redaction bars, a red seal | 3–6 sourced facts |
| [Pen & Wash](styles/pen-wash/STYLE.md) | emotion, hometown, city walks | line first, colour as an event | a place + a colour event |
| [White Model](styles/white-model/STYLE.md) | cities, regions, planning, data | white massing model, data as light | real footprints + heights + terrain |
| [Paper Diorama](styles/paper-diorama/STYLE.md) | scenic spots, heritage | warm light through 5–7 paper layers | sites, dates, one local saying |
| [Whiteboard](styles/whiteboard/STYLE.md) | concepts, processes, courses | one marker, drawn step by step | a structure you can draw |
| [Ink Wash](styles/ink-wash/STYLE.md) | landscapes, poetry, culture | negative space, ink, a red seal | one scene or one line of poetry |

**Ink Wash is a mood style, not an explainer.** Use it for landscapes, temples, poetry, tea, history, brand openers. Do not use it for data, specs, or fast explainers.

## Four cases

| Case | Style | Length | What it proves |
|---|---|---:|---|
| Zhu Yuanzhang | Dossier | 130s (3 parts) | redaction bars as content; a seal as punctuation |
| Luzhou Moon | Pen & Wash | 60s | no narration; colour follows one lantern |
| Beijing | White Model | 120s | 11,308 real building footprints, every number sourced |
| Tanzhe Temple | Paper Diorama | 45s | match strike → gate slides out → dusk → seal |

## Demos

- [30s trailer](renders/00-trailer-v2.mp4) — six styles in 30 seconds
- Case excerpts (720p, with sound): [Dossier](renders/cases/dossier.mp4) · [Pen & Wash](renders/cases/pen-wash.mp4) · [White Model](renders/cases/white-model.mp4)
- Tanzhe Temple, 45s with narration: [renders/01-tanzhe-45s.mp4](renders/01-tanzhe-45s.mp4)
- In-repo 8-second demos (silent): [Whiteboard](renders/02-whiteboard.mp4) · [Ink Wash](renders/04-ink-wash.mp4)

## Quick start

### Install in DeepSeek Harness (recommended)

```bash
git clone https://github.com/xiaoyao-tech/whalereel.git whalereel
cd whalereel
bash scripts/install-harness.sh
# -> ~/.dsh/skills/whalereel
```

Start a new Harness session and paste:

```
Use whalereel to make a 45-second scenic intro for Tanzhe Temple, 16:9, in Paper Diorama style.
Show me the script and sources first; write the scene after I confirm.
```

If it does not auto-load, type `/whalereel`. More prompts: [PROMPTS.md](PROMPTS.md).

If `~/.dsh/skills` is not picked up by your build, install to `~/.agents/skills` instead:

```bash
bash scripts/install-harness.sh ~/.agents/skills
```

> DSH only scans the direct child of a skill root: `<skills>/whalereel/SKILL.md`, not `whalereel/whalereel/SKILL.md`.

### Render locally

```bash
npm install
npm run render:demos     # three in-repo demos -> renders/
open site/index.html     # autoplay gallery
```

Render one scene:

```bash
node render/render.mjs scenes/01-paper-diorama.html renders/01.mp4 \
  --width 1280 --height 720 --duration 8 --fps 24 --channel chrome
```

Requirements: Node 18+, ffmpeg, local Chrome (or run `npx playwright install chromium` and drop `--channel chrome`).

## How it works

```
one sentence
  -> pick a style (styles/<slug>/STYLE.md)
  -> collect sources (templates/sources.md, FACTS.md)
  -> write a 5–7 beat script (templates/script.md)
  -> generate scene.html (window.__seek(t) is a pure function)
  -> 10-second test render
  -> Playwright: PNG frames -> ffmpeg: mp4
  -> QA checklist (templates/qa.md)
```

Each style is a contract: palette, camera, sound, beat sheet, prompt, forbidden list, QA checklist, **and the data it needs**. A style is not a filter; it is a small set of rules that makes the output reproducible.

## Status

v0.2.0. Six styles, four cases, a 30s trailer, a renderer, a gallery, and a validator. MIT.

Known limits: three in-repo demos are silent; case excerpts are cut from longer films; only 16:9; white-model needs real data. See [ROADMAP.md](ROADMAP.md).

## License

Code MIT. Docs CC BY 4.0. `pen-wash` and `white-model` are rewrites of Lemo-Opuscar styles (CC BY 4.0) — see [CREDITS.md](CREDITS.md). Fonts follow their own OFL licenses.
