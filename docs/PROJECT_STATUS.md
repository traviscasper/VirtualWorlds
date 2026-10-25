# Project status

*Last updated: 24 October 2026 · branch `phase-2` · not yet merged into `main`*

FLE Virtual Worlds is a static website of code-generated worlds guided by ARCHIVE. It is made of a portal, a shared Skyship Engine, two new pilot worlds and the four original projects, which are kept working as they were.

## At a glance

| Area | Status |
|---|---|
| Portal (`index.html`) | **Working.** Gallery of 17 worlds, theme filters (Sustainability green, Technology red, Space purple), Time · Place · Purpose filters, time axis, journey list, phone layout |
| Shared Skyship Engine (`skyship-engine/journey.html`) | **Working.** Data-driven; Cinematic, Explore and Learn modes; journey menu; 360 capture; WebXR entry |
| Columbus 2050 | **Pilot.** Artistic scenario on a simplified street grid, 8 stops, 11 hotspots. Not an official plan. Not yet on real GIS data |
| Orbital habitat (expanded) | **Pilot.** Original orbit world preserved, plus the Life Support Commons (farm, water, energy, air), 8 stops, 7 hotspots |
| Columbus 2050 → Orbit journey | **Working.** 90 s, cloud-climb transition, ARCHIVE cues, pre-rendered score |
| Journey video renderer (`render_journey.py`) | **Working** for short test renders here. Full-length 4K renders not yet run (needs a GPU machine) |
| Sci-Fi 360 (`sci-fi-360/`) | **Unchanged and working.** Its four worlds also run on the shared engine |
| Skyship 360 (`skyship-360/`) | **Unchanged and working.** Not yet ported to the shared engine |
| Worlds Within Worlds (`worlds-within-worlds/`) | **Working.** Only change: `?chapter=N` / `?t=` deep links for the portal. Its seven worlds are listed in the portal as film-only |
| World Tour (`world-tour/`) | **Player only.** Draft video; the source project is not in the repo |
| Hosting | **Not deployed.** Ready for static hosting; needs Travis's choice of host (repo stays private) |

## What works (verified by tests in this environment)

See *Test results* below. Everything was tested in headless Chromium with software WebGL (no GPU), so it proves the pages load and render real frames, not real-world frame rates.

## Partially implemented

- **VR:** "Enter VR" works through WebXR, but hotspot markers are page overlays and hide inside a headset, so Explore and Learn are desktop/phone only for now.
- **Narration:** ARCHIVE's lines appear as on-screen text with music; there is no recorded voice yet.
- **Columbus geography:** landmark positions and the river are approximate. The code keeps the street grid, river line and building lots in one place for a later swap to OpenStreetMap / Franklin County GIS data.
- **Film worlds:** viewable in the film studio at each chapter; there are no interactive versions yet.

## Planned

See [TASKS.md](TASKS.md) and [RECOMMENDATIONS.md](RECOMMENDATIONS.md).

## Test results

<!-- QA_RESULTS -->

## Known limitations

- No GPU in the build environment: frame rate on phones, laptops and headsets is untested.
- Google Fonts can't be reached from the build environment; pages fall back to system fonts there and load the web fonts normally online.
- The hosted (online) version has not been tested because nothing is deployed yet.
- Columbus 2050 is a speculative scenario. Its disclaimer appears in the portal, in the ship, and on every Columbus info card.

## Deployment

The site is static, with relative paths and no build step. Serve the repository root:

```
python -m http.server 8000      # then open http://localhost:8000/
```

Hosting options (none chosen yet; the repository must stay private unless Travis decides otherwise):

- **GitHub Pages:** works from a private repo only on a paid GitHub plan. Settings → Pages → Deploy from a branch → `main` / root. `.nojekyll` is already in place.
- **Cloudflare Pages or Netlify:** free with private repos. No build command; output directory `/`.

After the first deploy, open the portal and the `columbus-to-orbit` journey in all three modes on a phone and a desktop before announcing the link.
