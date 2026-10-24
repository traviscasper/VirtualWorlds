# ARCHIVE: Worlds Within Worlds — production package

Engine 0.3.0 · ARCHIVE character design 1.0

Future Life Experiences · 90-minute code-generated animated feature · 1920×1080 · 30 fps

## What's here
- `ARCHIVE_Studio.html` — the playable studio. Open it in Chrome or Edge. It has the 90-minute timeline, chapter jumps, play/pause/scrub, expression previews and the synthesized score. All ten chapters (0:00–90:00) are animated.
- `render/render.mjs` — the offline renderer. It renders frame-exact, resumable segments, writes the audio stems and joins everything into a verified MP4.
- `src/` — engine, audio, app and shader sources; `src/scenes/` holds per-chapter scene data and `src/worlds/` holds per-world shader modules. Run `python3 build.py` after editing to rebuild `ARCHIVE_Studio.html`.
- `docs/PRODUCTION_PLAN.md` — story treatment, mystery, chapter outline, chunking strategy and next milestones. This is the checkpoint file.
- `archive_manifest.json` — the scene and asset manifest.
- `experimental/raster_engine/` — a faster rasterized engine prototype (triangle meshes instead of raymarching). It's not wired into the studio yet; it's a candidate for later chapters if render speed becomes the bottleneck.

## Setup (once)
1. Install Node 18 or newer, plus FFmpeg (it must be on your PATH).
2. In this folder, run:
   npm i playwright
   npx playwright install chromium

## Rendering
Use a machine with a real GPU and add `--headed`. It opens a visible Chromium window so the graphics card does the rendering; leave that window open while it works. Leave out `--swiftshader`, which is only for computers without a GPU and is very slow.

- Whole film (GPU):   node render/render.mjs --film --headed
- Opening 2 minutes:  node render/render.mjs --from 0 --to 120 --headed
- New Ch 1 footage:   node render/render.mjs --from 120 --to 540
- Chapter 2:          node render/render.mjs --chapter 2
- Chapter 3:          node render/render.mjs --chapter 3
- Chapter 4:          node render/render.mjs --chapter 4
- Chapter 5:          node render/render.mjs --chapter 5
- Chapter 6:          node render/render.mjs --chapter 6
- Chapter 7:          node render/render.mjs --chapter 7
- Chapter 8:          node render/render.mjs --chapter 8
- Chapter 9:          node render/render.mjs --chapter 9
- Chapter 10:         node render/render.mjs --chapter 10
- Chapter 1:          node render/render.mjs --chapter 1
- Whole film:         node render/render.mjs --film
- Join only:          node render/render.mjs --film --assemble-only

How it works:
- Video renders in 5-minute segments. If a render stops, run the same command again and finished segments are skipped.
- The audio is one continuous function of film time, so music never restarts at a seam.
- Output goes to `render/out/`, which also holds `progress.json`.
- On a GPU-less cloud box, add `--swiftshader --width 960 --height 540 --quality 0` for drafts.

## Handing this project to another person or AI
Everything needed is in this folder; nothing depends on the original chat.
- `ARCHIVE_Studio.html` is self-contained. It plays and records in Chrome or Edge with no install and no internet.
- `render/render.mjs` needs three things this folder doesn't include: Node 18+, FFmpeg on the PATH, and Playwright's Chromium (the `npm i playwright` and `npx playwright install chromium` steps above).
- To change anything, edit the files in `src/`, then run `python3 build.py` to rebuild `ARCHIVE_Studio.html`. `render.mjs` always renders from that HTML file.
- `docs/PRODUCTION_PLAN.md` explains the story, every chapter's beats, which file holds what, and how the renderer splits and joins segments.
- Quick test before a long render: `node render/render.mjs --from 0 --to 10 --headed` should produce a verified 10-second MP4 in `render/out/`.
- `experimental/` holds an unused alternative engine prototype. It can be ignored.

## 360° version
The same film can be watched or rendered in 360°. **The front is always the film camera's forward direction**, so if a viewer doesn't turn their head, they see the film as directed. Turning their head shows the rest of the world around that shot. The horizon is kept level, with the camera's roll removed, for comfort in headsets.

- **Studio:** in the side panel, use **360°**:
  - **Look around:** drag to look around while the film plays, and double-click or press **Face front** to snap back.
  - **360 frame:** shows the full equirectangular image.
- **Quick 360 download from the studio:** turn on 360° (either option), choose a time range and press **Record video**. It records in real time at 2560×1280 and saves `…_360.mp4` (or `.webm`). It's good for clips; for the full film use the renderer.
- **Render:** `node render/render.mjs --film --headed --360` renders 3840×1920 equirectangular video. Titles, captions and readouts sit in a window straight ahead; hologram labels stay attached to the objects they describe.
- **VR 3D (stereoscopic 360):** each eye gets its own view, rendered with omni-directional stereo, so the worlds have real depth in a headset. Choose **VR 3D 360** in the studio's 360° menu to preview it or record clips (2560×2560), or render with `node render/render.mjs --film --headed --vr` (3840×3840; the left eye is the top half, the right eye the bottom). Tag it as spherical **and** stereoscopic top/bottom: in the Spatial Media Metadata Injector tick both boxes, or add `-XMP-GSpherical:StereoMode=top-bottom` to the exiftool command below. VR 3D takes about twice as long to render as 360.
- **For YouTube and headsets:** the MP4 must be tagged as 360. Use Google's free *Spatial Media Metadata Injector* (tick "My video is spherical (360)"), or run `exiftool -XMP-GSpherical:Spherical=true -XMP-GSpherical:Stitched=true -XMP-GSpherical:ProjectionType=equirectangular <file>.mp4`. Untagged, the video plays as a flat stretched image.
- **Cost:** 360 has about four times the pixels of 1080p, so it renders about four times slower. Use `--width 5760 --height 2880` for an even sharper 6K version if you have the time.
- **Tiny-planet shots:** these play as normal 360 views in this mode.
