# Changelog

## Phase 2: Connected worlds (branch `phase-2`, October 2026)

### Added
- **Portal** (`index.html`, `portal/`): gallery of 17 worlds with real rendered previews; Sustainability (green), Technology (red) and Space (purple) themes; Time · Place · Purpose filters; a time axis from 1818 to tomorrow; journey list; light and dark themes; phone layout.
- **World manifests** (`worlds/*.json` + `schema.json`) and **journeys** (`journeys/*.json` + `schema.json`).
- **Skyship Engine** (`skyship-engine/`): a data-driven version of the Sci-Fi 360 page. Any set of worlds, Cinematic / Explore / Learn modes, stops, hotspots with sourced facts and questions, lesson panel, journey menu, disclaimers, test controls (`SKYSHIP.freeze/goto/step/state/clearance`).
- **Columbus 2050** (`skyship-engine/worlds/columbus2050.js`): Scioto River and urban forest, Scioto Mile, LeVeque Tower, Ohio Statehouse, Rhodes Tower, Huntington Center, COSI, green bridge, rapid transit on Broad and High, protected bike lanes with cyclists, autonomous pods, kayaks, rooftop vertiport with air taxis, mass-timber towers, green and solar roofs, wind turbines, solar canopy park, microgrid, people on the promenade, fountain. Marked as an artistic scenario.
- **Orbital habitat expansion** (`skyship-engine/worlds/orbital_habitat.js`): Life Support Commons with a vertical farm, water recycling loop, energy station (solar, flywheel, batteries) and algae photobioreactors, floating labels, and a new flight path. Wraps the original `world_orbit.js` unchanged.
- **Journeys**: `columbus-to-orbit` (90 s), `columbus-2050` (40 s), `orbital-habitat` (54 s), `scifi-classics` (3:00, the original four worlds).
- **Score composer** (`skyship-engine/js/score.js`) and pre-rendered soundtracks (`journeys/audio/`).
- **Renderer** (`skyship-engine/render_journey.py`): 360 and 16:9, resumable, Windows GPU flags, `--bake-audio`.
- **QA tools** (`tools/qa/check_worlds.py`, `tools/qa/make_previews.py`).
- **Docs**: PROJECT_STATUS, TASKS, ARCHITECTURE, WORLD_FORMAT, RECOMMENDATIONS, this changelog.

### Changed
- `worlds-within-worlds/src/app.js` (and the rebuilt `ARCHIVE_Studio.html`): `?chapter=N` and `?t=seconds` deep links. No other change; rebuilding with `build.py` reproduces the previous file byte for byte apart from these lines.
- Root `README.md` and `.gitignore`.

### Unchanged (verified)
- `sci-fi-360/`, `skyship-360/`, `world-tour/`, and the film engine's rendering code. Baseline tests pass before and after.

## Phase 1 (October 2026)
- Repository created with `skyship-360/`, `sci-fi-360/`, `worlds-within-worlds/`, `world-tour/`.
