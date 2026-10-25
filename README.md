# FLE Virtual Worlds

Code-generated virtual worlds from **Future Life Experiences**, guided by **ARCHIVE**, a small floating robot. Every environment is built from code (three.js, WebGL and GLSL), so the repository holds the worlds themselves rather than heavy video files. Worlds run in desktop and phone browsers and in WebXR headsets, and they render to 360° and 16:9 video.

**Start at the portal:** `index.html` (see *Run it locally*).

## What's here

| Folder | What it is |
|---|---|
| [`index.html`](index.html), [`portal/`](portal/) | **The portal**: a gallery of all worlds by theme (Sustainability, Technology, Space) and by Time · Place · Purpose |
| [`skyship-engine/`](skyship-engine/) | **Shared Skyship Engine**: one ship and one guide for any set of worlds, with Cinematic, Explore and Learn modes and a 360/16:9 renderer. Includes the new **Columbus 2050** and the expanded **Orbital Habitat** |
| [`worlds/`](worlds/) | One manifest per world (the shared world format) |
| [`journeys/`](journeys/) | Skyship journeys, e.g. **Columbus 2050 → Orbit** (90 s) |
| [`sci-fi-360/`](sci-fi-360/) | Original **Sci-Fi 360** kit: Frankenstein, R.U.R., Metropolis and an orbital future (unchanged; its worlds also run on the shared engine) |
| [`skyship-360/`](skyship-360/) | Original **Skyship 360 world tour**: Columbus → DC → NYC → Paris → London → orbit (unchanged) |
| [`worlds-within-worlds/`](worlds-within-worlds/) | **ARCHIVE: Worlds Within Worlds**, the 90-minute film engine and studio (separate GLSL raymarcher) |
| [`world-tour/`](world-tour/) | Player for the World Tour short (draft video) |
| [`tools/qa/`](tools/qa/) | Automated tests and preview rendering |
| [`docs/`](docs/) | [Status](docs/PROJECT_STATUS.md) · [Tasks](docs/TASKS.md) · [Architecture](docs/ARCHITECTURE.md) · [World format](docs/WORLD_FORMAT.md) · [Changelog](docs/CHANGELOG.md) · [Recommendations](docs/RECOMMENDATIONS.md) |

## Run it locally

The pages use ES modules and load JSON, so serve the folder over HTTP rather than double-clicking the files:

```
cd VirtualWorlds
python -m http.server 8000
```

Open <http://localhost:8000/>. The Columbus → orbit flight is at <http://localhost:8000/skyship-engine/journey.html?journey=columbus-to-orbit>; add `&mode=explore` or `&mode=learn` for the other modes. The original kits still open directly: `sci-fi-360/skyship.html`, `skyship-360/skyship.html`, `worlds-within-worlds/ARCHIVE_Studio.html`.

A computer with a dedicated graphics card is strongly recommended for smooth flight and for rendering. On Windows, set Chrome and Python to "High performance" in Graphics Settings.

## Render videos

| Project | Command (from its folder) |
|---|---|
| Shared engine journeys | `python render_journey.py --journey columbus-to-orbit` (360) · `--flat` (16:9) · `--test` |
| Sci-Fi 360 | `python render_360.py` (see its README.txt) |
| Skyship 360 | `python render_360.py` (see its README.txt) |
| Worlds Within Worlds | `node render/render.mjs --film --headed` (see its README.md) |

Finished renders are kept out of git (they are hundreds of MB to several GB). Publish them to YouTube as 360 video or attach them to a GitHub Release.

## Test

```
pip install playwright pillow jsonschema && python -m playwright install chromium
python tools/qa/check_worlds.py            # all groups: data portal scifi skyship studio worldtour journey mobile
python tools/qa/check_worlds.py data portal journey
```

The tests render real frames through each project's own render hooks and fail if a frame is blank, if a page throws an error or references a missing file, if a flight path passes within 15 m of a structure, or if a manifest breaks its schema.

## Deploy

The site is static, with no build step, and all paths are relative, so the repository root can be served from any host or sub-path.

* **GitHub Pages**: Settings → Pages → *Deploy from a branch* → `main` / root. Pages for a private repository needs a paid GitHub plan; the repository stays private unless you change it. `.nojekyll` makes Pages serve the files as-is.
* **Cloudflare Pages or Netlify**: connect the repository, leave the build command empty, and set the output directory to `/`. Both work with private repositories.

After deploying, open the portal and one journey in all three modes to confirm that they load.

## Third-party code

- three.js r160 (MIT), vendored in `sci-fi-360/vendor/` and `skyship-360/vendor/`.
- Google's Spatial Media metadata tool (Apache 2.0), vendored in `*/spatialmedia/`.
- Facts shown in the worlds cite their sources in the world manifests.
