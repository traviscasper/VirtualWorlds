ARCHIVE SKYSHIP - 360 VIDEO KIT
===============================

What this makes
  A 3:00 equirectangular 360 video (MP4) of the skyship world tour with ARCHIVE:
  Columbus -> Washington, DC -> New York -> Paris -> London -> orbit.
  The camera is your seat in the glass cabin. Forward is the centre of the frame.
  The file carries 360 metadata, so YouTube, VLC and VR headsets play it as 360.

  Timeline (video time)
    0:00  Arrive through the clouds over Columbus (LeVeque Tower on the right)
    0:30  Washington, DC (Washington Monument, the Mall, the Capitol)
    1:00  New York (towers overhead, Empire State Building)
    1:30  Paris at night (flying under the Eiffel Tower)
    2:00  London (Big Ben, the Thames, the London Eye)
    2:30  Climb to orbit (Earth through the glass floor, the Moon)

In the cabin (five screens + the glass floor ring)
    Telescope (front left)   live zoom camera on each landmark, with range and elevation
    Route map (front right)  the trip, the ship's position, and the current leg in miles
    Main readout (console)   where you are, altitude, speed, next stop, ARCHIVE's line
    City file (left side)    rotating facts about each city, time zone, sky
    Belly camera + status    live camera looking straight down; altitude graph, heading,
      (right side)           engines, cabin, ARCHIVE's battery and what he's looking at

ONE-TIME SETUP
  1. Install Python 3.10 or newer from python.org
     (Windows: tick "Add python.exe to PATH" in the installer).
  2. Open a terminal in this folder and run:
        pip install playwright imageio-ffmpeg
        python -m playwright install chromium

RENDER
  Windows: double-click  render_test.bat  first (5-second check), then  render_full.bat
  Mac:     double-click  render_test.command, then  render_full.command
           (first time: right-click > Open, or run  chmod +x *.command  in Terminal)
  Or in a terminal:
        python render_360.py --test      quick 5-second check  -> ARCHIVE_Skyship_360_test.mp4
        python render_360.py             full 3:00 in 4K 360   -> ARCHIVE_Skyship_360.mp4

  The terminal shows the graphics card in use, seconds per frame and time left.
  If it says "SwiftShader", Chrome is drawing on the CPU (slow). Run with
  --show-window so it opens a real window, which normally uses the graphics card.

  The full video is 5,400 frames. The render saves 10-second parts in the
  "parts" folder. If it stops, run the same command again and it continues.

OPTIONS
  --width 5760            5.7K 360 (sharper in a headset, about 2x slower)
  --width 2880            lighter 360 for quick previews
  --fps 60                smoother, twice the frames
  --audio song.mp3        add a soundtrack (trimmed to the video length)
  --start 87.5 --duration 30   render one section (here: Paris)
  --show-window           use a visible browser window
  --cpu                   no graphics card available (very slow)

UPLOADING TO YOUTUBE
  Upload ARCHIVE_Skyship_360.mp4 as-is. The 360 metadata is already in the file.
  YouTube can take an hour or more after upload before the 360 controls appear.
  If you edit the video in another program, re-add the metadata afterwards:
        python -m spatialmedia -i edited.mp4 edited_360.mp4

INTERACTIVE VERSION
  skyship.html is the same scene to fly around in. Browsers block it when it
  is opened straight from the folder, so serve it locally:
        python -m http.server 8000
  then open  http://localhost:8000/skyship.html

Credits: three.js (MIT, vendor/THREE_LICENSE.txt). 360 metadata uses Google's
spatial-media tool (Apache 2.0, spatialmedia/SPATIAL_MEDIA_LICENSE.txt).
