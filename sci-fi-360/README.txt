ARCHIVE SKYSHIP · 360° JOURNEY THROUGH SCIENCE FICTION
=====================================================

What this is
  A 3-minute, 360° flight aboard ARCHIVE's skyship through four worlds, built on the
  original Skyship 360 Kit (same ship, same cabin, same ARCHIVE, same 360 camera).
  You can fly it interactively in a browser (desktop, phone, or a VR headset), and
  render it as a 4K 360 video (MP4) with music and YouTube/VR 360 metadata.

  Timeline
    0:00  FRANKENSTEIN (1818, Mary Shelley) · The Spark of Life
          A Gothic laboratory in an Alpine gorge during a thunderstorm. Fly under a stone
          viaduct, past a galvanic coil tower, and close by the creature on his lightning-rod
          platform. He flings his arms up when lightning hits the rods, then reaches for the ship.
    0:40  R.U.R. (1920, Karel Čapek) · Manufactured Life
          Rossum's factory at golden hour: glass production vats with humanlike robots growing
          inside, a conveyor of identical workers, catwalks overhead with workers marching in
          step, cranes, smokestacks, an elevated train, steam and sparks.
    1:20  METROPOLIS (1927, Fritz Lang · Thea von Harbou) · Technology and Society
          An Art Deco avenue canyon: stacked highways with traffic, flying cars, airships,
          searchlights, a machine hall with giant flywheels and marching shift workers, two
          colossal statues of labor, a sky bridge to fly under, and the central tower with
          its sunburst. The ship climbs past it into the sky.
    2:00  A SUSTAINABLE FUTURE · Life Beyond Earth
          Orbit above Earth: fly through a spinning ring habitat, alongside a giant biosphere
          dome with forest, lake and waterfall, past solar wings, transit tubes with capsules,
          shuttles and a wheel station. Final message at 2:46:
          "Creating Life Is Powerful. Sustaining Life Is Our Responsibility."

  In the cabin
    Title hologram       Each world's work, year, author and theme (first ~12 s of each world)
    Console readout      World, ARCHIVE's line, year, author, theme
    Telescope (left)     Live zoom on each landmark (the creature, the vats, the tower...)
    Timeline (right)     1818 → 1920 → 1927 → tomorrow, with the ship's progress
    Story file (left)    Rotating facts about each work
    Status + belly cam   Altitude, heading, engines, ARCHIVE's mood; live camera looking down
    The side screens now sit at console height, below eye level, so the whole horizon
    stays clear for looking outside.

  ARCHIVE
    Floats beside you (on the opposite side from each landmark, so you see his face),
    turns his head and body to look, points at landmarks, waves at the creature, jumps
    when lightning strikes, spins through the ring habitat, and opens his arms at the end.
    His eyes and glow change with his mood: curious, surprised, thoughtful, concerned,
    amazed, happy, excited.

INTERACTIVE VERSION
  Double-click  preview_in_browser.bat  (Windows) or  preview_in_browser.command  (Mac).
  It starts a small local web server and opens the page. Or do it by hand:
  browsers block pages opened straight from a folder, so serve it locally:
        python -m http.server 8000
  then open  http://localhost:8000/skyship.html
  Drag to look around, scroll/pinch to zoom. Buttons: jump to a world, Cabin/Outside/Chase
  views, Pause, Sound on (the music), Capture a 360° frame, and the time scrubber.
  Space bar = pause. Arrow keys = look around.

  VR (Meta Quest and other WebXR headsets)
    An "Enter VR" button appears when the browser supports WebXR. Browsers only allow VR on
    https:// pages or on http://localhost, so on a Quest either:
      - host the folder on any https web host (GitHub Pages, Netlify, etc.), or
      - use the rendered 360 MP4 instead (works in the Quest's video player and on YouTube VR).

360 VIDEO (MP4)
  One-time setup
    1. Install Python 3.10 or newer from python.org
       (Windows: tick "Add python.exe to PATH" in the installer).
    2. Open a terminal in this folder and run:
          pip install playwright imageio-ffmpeg
          python -m playwright install chromium

  Render
    Windows: double-click  render_test.bat  first (5-second check), then  render_full.bat
    Mac:     double-click  render_test.command, then  render_full.command
             (first time: right-click > Open, or run  chmod +x *.command  in Terminal)
    Or in a terminal:
          python render_360.py --test      5-second check (the creature scene) -> ARCHIVE_Skyship_360_test.mp4
          python render_360.py             full 3:00 in 4K 360 with music    -> ARCHIVE_SciFi_Journey_360.mp4

  The terminal shows the graphics card in use, seconds per frame and time left.
  If it says "SwiftShader", Chrome is drawing on the CPU (slow). Run with
  --show-window so it opens a real window, which normally uses the graphics card.
  The full video is 5,400 frames, saved in 10-second parts in the "parts" folder.
  If it stops, run the same command again and it continues.

  Options
    --width 5760              5.7K 360 (sharper in a headset, about 2x slower)
    --width 2880              lighter 360 for quick previews
    --fps 60                  smoother, twice the frames
    --start 80 --duration 40  render one world (here: Metropolis)
    --audio song.mp3          use your own soundtrack instead of the built-in music
    --no-music                silent video
    --recompose               re-synthesize the music in the page (it is procedural; the
                              shipped audio/soundtrack.mp3 is the same mix, pre-rendered)
    --show-window             use a visible browser window
    --cpu                     no graphics card available (very slow)

  The 360 video keeps the horizon level and follows the ship's heading: forward is always
  the centre of the frame, with no camera roll, for comfortable viewing in a headset.

UPLOADING TO YOUTUBE
  Upload the MP4 as-is; the 360 metadata is already in the file. YouTube can take an hour
  or more after upload before the 360 controls appear. If you edit the video elsewhere,
  re-add the metadata afterwards:
        python -m spatialmedia -i edited.mp4 edited_360.mp4

FILES
  skyship.html                      the experience (open through a local server)
  preview_in_browser.bat/.command   one-click local server + browser
  js/lib.js                         shared helpers: flight paths, geometry merging, facade
                                    textures, 360-safe sprites (clouds, smoke, rain), animated
                                    instanced people, vehicles, lightning
  js/world_frankenstein.js          world 1      js/world_rur.js         world 2
  js/world_metropolis.js            world 3      js/world_orbit.js       world 4
  js/audio.js                       the procedural soundtrack (Web Audio), thunder synced to lightning
  audio/soundtrack.mp3              the same soundtrack, pre-rendered (loads instantly)
  render_360.py + .bat/.command     360 video renderer
  vendor/                           three.js r160 (local, no internet needed)
  spatialmedia/                     360 metadata tool
  skyship_world_tour_original.html  the original city world tour, kept unchanged

WHAT CHANGED FROM THE ORIGINAL KIT
  - Kept: the skyship model, glass cabin, ARCHIVE's body and head, the five screens, the
    cube-camera equirectangular capture, the render pipeline and its resume-by-parts system.
  - The city "conveyor" (the ground sliding under a fixed ship) is replaced by four real 3D
    worlds. The ship now flies smooth time-keyed paths through each one; scenes swap inside
    3-second cloud crossings, so nothing pops.
  - New sky shader: storm clouds, lightning flashes, moon, stars.
  - ARCHIVE got new eyes (open, happy arcs, brows, sparkle), pointing/waving arms, mood
    colours and per-scene cues.
  - Screens show the timeline, story facts and title holograms instead of the city tour.
  - Added: music and ambience, VR button, scrubber, the final message, fade in/out.
  - render_360.py now adds the music automatically and starts at 0:00.

NOTES ON THE DESIGN
  The creature follows Mary Shelley's novel (about eight feet tall, yellowish stitched
  skin, long black hair, dark coat), not any film studio's makeup design. He is shown
  larger than eight feet so he reads clearly from the passing ship.
  Metropolis' city, statues and tower are original Art Deco designs inspired by the film's
  world, not copies of specific shots.

Credits: three.js (MIT, vendor/THREE_LICENSE.txt). 360 metadata uses Google's
spatial-media tool (Apache 2.0, spatialmedia/SPATIAL_MEDIA_LICENSE.txt).
Music: generated procedurally by js/audio.js for this project.
