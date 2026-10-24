# VirtualWorlds

Code-generated virtual worlds starring **ARCHIVE**, the small floating robot guide of Future Life Experiences. Every environment here is built from code (three.js / WebGL / GLSL), so the repo holds the worlds themselves, not heavy video files. Each project can be viewed live in a browser and rendered out to video, including 360° equirectangular video with VR/YouTube metadata.

## Projects

| Folder | What it is | 360° |
|---|---|---|
| [`skyship-360/`](skyship-360/) | **ARCHIVE Skyship: World Tour.** A 3-minute flight in an open-glass skyship: Columbus → Washington, DC → New York → Paris → London → orbit, with six cabin screens and a World Briefing panel. | Yes, 4K 360 MP4 |
| [`sci-fi-360/`](sci-fi-360/) | **ARCHIVE Skyship: Journey Through Science Fiction.** The same ship flies through Frankenstein (1818), R.U.R. (1920), Metropolis (1927) and an original sustainable orbital-habitat world, with a soundtrack. | Yes, 4K 360 MP4 |
| [`worlds-within-worlds/`](worlds-within-worlds/) | **ARCHIVE: Worlds Within Worlds.** The 90-minute, 10-chapter feature film engine and studio (raymarched GLSL worlds: Verdance, the Orrery, Ferrum, Thalassa, the Loom, the Lost Worlds, the Core). | Yes, 360 and VR stereo export modes |
| [`world-tour/`](world-tour/) | **ARCHIVE: World Tour.** Web player for the 3-minute landmark short (Columbus, Ohio State, CMH, DC, NYC, Paris, London), with the rendered draft video. | No, 16:9 |

## Quick start

- **Look around a skyship world:** open `skyship-360/skyship.html` or `sci-fi-360/skyship.html` through a local web server (the pages use ES modules, which browsers block from `file://`). On Windows, `sci-fi-360/preview_in_browser.bat` does this for you.
- **Render a 360 video:** follow the `README.txt` in `skyship-360/` or `sci-fi-360/`. You need Python, Playwright and FFmpeg; `render_test.bat` makes a short 1920×960 test and `render_full.bat` makes the full 3-minute 4K render.
- **Open the film studio:** open `worlds-within-worlds/ARCHIVE_Studio.html` in Chrome or Edge (on Windows, `Open Studio (OpenGL).bat`). Rendering steps are in `worlds-within-worlds/README.md`.

A computer with a dedicated graphics card is strongly recommended; on Windows, assign Chrome/Python to the "High performance" GPU in Graphics Settings.

## Rendered videos

Finished renders (hundreds of MB to several GB) are kept out of git. Publish them to YouTube as 360 video or attach them to a GitHub Release.

## Third-party code

- three.js (MIT) is vendored in `*/vendor/` with its license.
- Google's Spatial Media metadata tool (Apache 2.0) is vendored in `*/spatialmedia/` with its license.
