# Project status

*Last updated: 25 October 2026 · branch `phase-3-columbus-osu` (built on `phase-2`) · neither is merged into `main` yet*

FLE Virtual Worlds is a static website of code-generated worlds guided by ARCHIVE. It is made of a portal, a shared Skyship Engine, three pilot worlds (two of them on real OpenStreetMap geography) and the four original projects, which are kept working as they were.

## At a glance

| Area | Status |
|---|---|
| Portal (`index.html`) | **Working.** Features the Today → 2050 → Orbit flight. Gallery of 18 worlds, theme filters (Sustainability green, Technology red, Space purple), Time · Place · Purpose filters, time axis, journey list, phone layout |
| Shared Skyship Engine (`skyship-engine/journey.html`) | **Working.** Data-driven; Cinematic, Explore and Learn modes; journey menu; 360 capture; WebXR entry |
| Columbus 2050 | **Pilot, on real geography.** Today's streets, buildings, river and parks from OpenStreetMap, with an imagined 2050 layer (green/solar roofs, transit lanes, bike lanes, riverbank forest, vertiport, timber towers on today's parking lots). 8 stops, 11 hotspots. Not an official plan. The original grid-based module is kept as `columbus2050.js` |
| Ohio State campus (today) | **Pilot, on real geography.** OpenStreetMap buildings, paths, the Olentangy, Mirror Lake and the Oval; hand-modelled Ohio Stadium (fitted to its real outline) and Orton Hall's tower. 8 stops, 8 sourced hotspots, Learn mode lesson |
| Map data pipeline (`tools/gis/`, `data/gis/`) | **Working.** `osm_world.py` downloads and builds the layers; a GitHub Actions workflow runs it on GitHub's servers, verifies it and commits the two data files |
| Orbital habitat (expanded) | **Pilot.** Original orbit world preserved, plus the Life Support Commons (farm, water, energy, air), 8 stops, 7 hotspots |
| Columbus 2050 → Orbit journey | **Working.** 90 s, cloud-climb transition, ARCHIVE cues, pre-rendered score |
| Today, 2050, Orbit journey | **Working.** 2½ min: OSU campus → Columbus 2050 → orbital habitat, two cloud transitions, combined lesson, pre-rendered score |
| Ohio State Campus journey | **Working.** 66 s, its own lesson and score |
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
- **Building heights:** most come from estimates. In OpenStreetMap only about 22% of downtown buildings and 27% of campus buildings have a height or number of floors, so the rest get a typical height for their type. Landmarks with tagged heights are right (LeVeque Tower 169 m, Rhodes Tower 192 m, Huntington Center 156 m). Calibrating heights from Ohio's statewide LiDAR would fix the skyline.
- **Hand-placed details:** Orton Hall's bell tower sits at the corner of its real footprint nearest the Oval (approximate). The Scioto Mile fountain uses an approximate position because Bicentennial Park isn't named in the map data.
- **Film worlds:** viewable in the film studio at each chapter; there are no interactive versions yet.

## Planned

See [TASKS.md](TASKS.md) and [RECOMMENDATIONS.md](RECOMMENDATIONS.md).

## Test results

Run on 25 October 2026 with `python tools/qa/check_worlds.py` (headless Chromium, software WebGL), on branch `phase-3-columbus-osu`. **129 of 129 checks pass** (7 min 22 s).

| Group | Checks | What is checked |
|---|---|---|
| data | 24/24 | Every world and journey manifest validates against its schema; launch links, previews, world modules and journey references exist; lesson objectives point at real hotspots |
| portal | 11/11 | Desktop and phone layouts, no sideways scrolling, all local links resolve, the three theme filters, manifest index |
| scifi | 6/6 | Original Sci-Fi 360 page: all four worlds render real frames, 360 frame capture, no errors |
| skyship | 4/4 | Original Skyship 360 page: Columbus and Paris frames, 360 capture, no errors |
| studio | 4/4 | Film studio: Verdance and Thalassa chapter frames, film 360 frame, no errors |
| worldtour | 3/3 | Video metadata loads, nine chapter buttons, no errors |
| journey | 42/42 | Columbus → orbit on real geography: flight path clears every structure by ≥15 m (closest 20.3 m), 60–90 s length, cabin/chase/outside frames from the river to the final message, 360 capture in both worlds; Explore mode for Columbus, the habitat and the Sci-Fi worlds; Learn mode lesson panel and questions |
| gis | 33/33 | Map data: ≈7,100 downtown and ≈5,600 campus buildings, 1.68 and 1.55 MB, all expected landmarks, OpenStreetMap attribution. OSU Campus journey and Today, 2050, Orbit journey: clearance in all three worlds (closest 20.3 m), lengths, every test shot renders, 360 capture on campus, OSU Learn mode (8 stops, 8 anchored hotspots, questions) |
| mobile | 2/2 | Journey page fits a phone screen, no errors |

Each frame check fails if the image is blank or flat (a stuck loading screen), and each page fails on any JavaScript error or missing file.

**Render tests** (`skyship-engine/render_journey.py`, CPU only):
- 360: a 5 s clip of `columbus-to-orbit`, 1920×960, 30 fps, H.264 + AAC music. Google's Spatial Media tool reads it back as `Spherical = true`, `ProjectionType = equirectangular`, so YouTube and headsets will treat it as 360.
- 16:9: a 3 s clip over Broad Street (22–25 s), 960×540, 30 fps, with music. About 2.9 s per frame on the CPU; a GPU machine is far faster (see the kit READMEs).
- Full-length renders (4K 360, 1080p 16:9) have not been run here.

**Not tested here:** real-GPU frame rates, iOS Safari and Android Chrome on real phones, a WebXR headset, full-length 4K renders, and any online deployment.

## Known limitations

- No GPU in the build environment: frame rate on phones, laptops and headsets is untested.
- Google Fonts can't be reached from the build environment; pages fall back to system fonts there and load the web fonts normally online.
- The hosted (online) version has not been tested because nothing is deployed yet.
- Columbus 2050 is a speculative scenario. Its disclaimer appears in the portal, in the ship, and on every Columbus info card.
- Map data © OpenStreetMap contributors (ODbL 1.0). The credit appears in the portal, in the world facts and on the journeys' final cards.
- The real-geography worlds are heavier than the pilot (about 7,000 extruded buildings each). They load in under a minute with software rendering here; real-device frame rates are untested.

## Deployment

The site is static, with relative paths and no build step. Serve the repository root:

```
python -m http.server 8000      # then open http://localhost:8000/
```

Hosting options (none chosen yet; the repository must stay private unless Travis decides otherwise):

- **GitHub Pages:** works from a private repo only on a paid GitHub plan. Settings → Pages → Deploy from a branch → `main` / root. `.nojekyll` is already in place.
- **Cloudflare Pages or Netlify:** free with private repos. No build command; output directory `/`.

After the first deploy, open the portal and the `columbus-to-orbit` journey in all three modes on a phone and a desktop before announcing the link.
