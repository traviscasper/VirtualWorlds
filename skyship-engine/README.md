# ARCHIVE Skyship Engine

One skyship, one guide (ARCHIVE), any set of worlds. A journey is chosen with a URL:

```
journey.html?journey=columbus-to-orbit            cinematic (guided, with music)
journey.html?journey=columbus-to-orbit&mode=explore   stops, hotspots, info cards
journey.html?journey=columbus-to-orbit&mode=learn     + lesson panel and questions
```

Journeys: `columbus-to-orbit` (90 s), `columbus-2050` (40 s), `orbital-habitat` (54 s), `scifi-classics` (the four Sci-Fi 360 worlds, 3:00).

## Preview locally

The page uses ES modules and `fetch`, so it must be served over HTTP, not opened as a file:

```
cd VirtualWorlds            # the repository root
python -m http.server 8000
```

Then open <http://localhost:8000/> for the portal, or <http://localhost:8000/skyship-engine/journey.html?journey=columbus-to-orbit>.

Controls: drag to look around, scroll or pinch to zoom, arrow keys, space to pause. Use the views (Cabin 360° / Outside / Chase) and **Capture 360° frame**. **Enter VR** appears in WebXR browsers (for example the Meta Quest browser).

## Render a video

```
pip install playwright imageio-ffmpeg
python -m playwright install chromium
cd skyship-engine
python render_journey.py --test                                   # 5 s, 1920×960 360 check
python render_journey.py --journey columbus-to-orbit              # 3840×1920 360 MP4 with music + 360 metadata
python render_journey.py --journey columbus-to-orbit --flat       # 1920×1080 16:9 from the cabin seat
python render_journey.py --journey scifi-classics --show-window   # a visible window often gets the GPU
```

On Windows the script asks Chrome for the high-performance GPU (`--force_high_performance_gpu --use-angle=d3d11`). If the log says `SwiftShader`, Chrome is drawing on the CPU: try `--show-window`, or set Python/Chrome to "High performance" in Windows Graphics Settings. Parts resume after an interruption; delete `parts/<journey>/` to start over.

## Re-make a soundtrack

Pre-rendered MP3s live in `../journeys/audio/`. Without one, the page composes the score from each world's `audio.score` settings in the manifest. After changing those settings or a journey's length, bake a new MP3:

```
python render_journey.py --journey columbus-to-orbit --bake-audio
```

## Files

* `journey.html`: the engine (a data-driven version of `../sci-fi-360/skyship.html`, which stays unchanged)
* `js/score.js`: procedural score composer
* `worlds/columbus2050.js`: Columbus 2050 (artistic scenario)
* `worlds/orbital_habitat.js`: expanded orbital habitat (wraps `../sci-fi-360/js/world_orbit.js`)
* `render_journey.py`: 360 / 16:9 renderer

See `../docs/ARCHITECTURE.md` and `../docs/WORLD_FORMAT.md`.
