"""
ARCHIVE Skyship - 360 video renderer
====================================
Renders the 3-minute journey through science fiction (Frankenstein, R.U.R.,
Metropolis, a sustainable future in orbit) as an equirectangular 360 video
(MP4, H.264 + AAC music) with YouTube/VR 360 metadata.

Setup (once):
    pip install playwright imageio-ffmpeg
    python -m playwright install chromium

Render:
    python render_360.py                    # full 3:00 journey, 3840x1920, 30 fps, with the built-in music
    python render_360.py --test             # 5-second check at 1920x960 (the creature scene)
    python render_360.py --width 5760       # 5.7K (sharper in VR, slower)
    python render_360.py --audio song.mp3   # use your own soundtrack instead
    python render_360.py --no-music         # silent video

The render is saved in 10-second parts inside the "parts" folder. If it stops
(sleep, crash, Ctrl+C), run the same command again and it picks up where it
left off. Delete the "parts" folder to start over.
"""
import argparse, asyncio, base64, os, shutil, subprocess, sys, time
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROUTE_HOST = "http://skyship.local/"

def ffmpeg_exe():
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        exe = shutil.which("ffmpeg")
        if exe: return exe
        sys.exit("ffmpeg not found. Run:  pip install imageio-ffmpeg")

def fmt(sec):
    sec = int(sec); return f"{sec//3600}:{sec%3600//60:02d}:{sec%60:02d}"

async def render(args):
    from playwright.async_api import async_playwright
    ff = ffmpeg_exe()
    parts = HERE / "parts"; parts.mkdir(exist_ok=True)
    total_frames = int(round(args.duration * args.fps))
    part_frames = int(args.part_seconds * args.fps)
    n_parts = (total_frames + part_frames - 1) // part_frames
    tag = f"{args.width}w_{args.fps}fps_s{args.start:g}_p{args.part_seconds:g}"

    launch_args = ["--ignore-gpu-blocklist", "--enable-gpu-rasterization", "--disable-background-timer-throttling",
                   "--disable-renderer-backgrounding", "--disable-backgrounding-occluded-windows"]
    if args.cpu: launch_args += ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"]

    async with async_playwright() as p:
        kw = dict(headless=not args.show_window and args.headless, args=launch_args)
        if args.chrome: kw["executable_path"] = args.chrome
        browser = await p.chromium.launch(**kw)
        page = await browser.new_page(viewport={"width": 1280, "height": 720})
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))

        async def route(r):
            url = r.request.url
            if url.startswith(ROUTE_HOST):
                rel = url[len(ROUTE_HOST):].split("?")[0] or "skyship.html"
                f = (HERE / rel).resolve()
                if HERE in f.parents and f.is_file():
                    ctype = {".html": "text/html", ".js": "text/javascript", ".mp3": "audio/mpeg"}.get(f.suffix, "application/octet-stream")
                    await r.fulfill(path=str(f), content_type=ctype); return
                await r.fulfill(status=404, body="not found"); return
            await r.continue_()   # Google Fonts load from the internet; the page falls back if offline
        await page.route("**/*", route)
        await page.add_init_script("window.__SKYSHIP_RENDER=true")
        await page.goto(ROUTE_HOST + "skyship.html")
        try:
            await page.wait_for_function("window.SKYSHIP && window.SKYSHIP.ready", timeout=180000)
        except Exception:
            print("The skyship page did not load.", *errors, sep="\n"); await browser.close(); sys.exit(1)

        gpu = await page.evaluate("""(()=>{ const g=document.createElement('canvas').getContext('webgl2');
            const e=g&&g.getExtension('WEBGL_debug_renderer_info'); return e? g.getParameter(e.UNMASKED_RENDERER_WEBGL) : 'unknown'; })()""")
        print(f"Graphics: {gpu}")
        if "swiftshader" in gpu.lower() and not args.cpu:
            print("  Note: Chrome is drawing on the CPU (SwiftShader), which is slow.\n"
                  "  Try:  python render_360.py --show-window   (a visible window usually gets the graphics card)")

        print(f"Rendering {args.duration:g}s at {args.width}x{args.width//2}, {args.fps} fps = {total_frames} frames in {n_parts} parts")
        t_start = time.time(); done_new = 0
        for pi in range(n_parts):
            out = parts / f"part_{tag}_{pi:03d}.mp4"
            f0 = pi * part_frames; f1 = min(total_frames, f0 + part_frames)
            if out.exists() and out.stat().st_size > 0:
                continue
            tmp = out.with_suffix(".tmp.mp4")
            enc = subprocess.Popen([ff, "-y", "-v", "error", "-f", "image2pipe", "-framerate", str(args.fps), "-i", "-",
                                    "-c:v", "libx264", "-preset", "medium", "-crf", str(args.crf), "-pix_fmt", "yuv420p", str(tmp)],
                                   stdin=subprocess.PIPE)
            t_first = args.start + f0 / args.fps
            await page.evaluate(f"SKYSHIP.warm({t_first})")
            for f in range(f0, f1):
                t = args.start + f / args.fps
                url = await page.evaluate(f"SKYSHIP.frame360({t},{args.width})")
                enc.stdin.write(base64.b64decode(url.split(",", 1)[1]))
                done_new += 1
                if done_new % 15 == 0:
                    el = time.time() - t_start; rate = el / done_new
                    remaining = sum(1 for q in range(n_parts) if not (parts / f"part_{tag}_{q:03d}.mp4").exists()) * part_frames - (f - f0 + 1)
                    print(f"  part {pi+1}/{n_parts}  frame {f+1}/{total_frames}  {rate:.2f}s/frame  ~{fmt(max(0,remaining)*rate)} left", flush=True)
            enc.stdin.close(); enc.wait()
            tmp.replace(out)
        # the procedural soundtrack, rendered by the page itself (same mix you hear in the browser)
        args.music_file = None
        if not args.audio and not args.no_music:
            wav = parts / f"music_s{args.start:g}_d{args.duration:g}.wav"
            pre = HERE / "audio" / "soundtrack.mp3"
            if not wav.exists() and pre.exists() and not args.recompose:
                subprocess.run([ffmpeg_exe(), "-y", "-v", "error", "-ss", f"{args.start}", "-t", f"{args.duration}", "-i", str(pre), str(wav)], check=True)
            if not wav.exists():
                print("Composing the soundtrack...")
                n = await page.evaluate(f"SKYSHIP.soundtrackPrepare({args.start},{args.duration})")
                with open(wav, "wb") as fh:
                    for i in range(n):
                        fh.write(base64.b64decode(await page.evaluate(f"SKYSHIP.soundtrackChunk({i})")))
            args.music_file = str(wav)
        await browser.close()
    return [parts / f"part_{tag}_{i:03d}.mp4" for i in range(n_parts)]

def finish(args, part_files):
    ff = ffmpeg_exe()
    lst = HERE / "parts" / "list.txt"
    lst.write_text("".join(f"file '{p.name}'\n" for p in part_files))
    joined = HERE / "parts" / "joined.mp4"
    subprocess.run([ff, "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", str(lst), "-c", "copy", str(joined)], check=True)
    src = joined
    music = args.audio or getattr(args, "music_file", None)
    if music:
        withaudio = HERE / "parts" / "with_audio.mp4"
        subprocess.run([ff, "-y", "-v", "error", "-i", str(joined), "-i", music, "-map", "0:v", "-map", "1:a",
                        "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-shortest", str(withaudio)], check=True)
        src = withaudio
    out = Path(args.out).resolve()
    # write the 360 (spherical, equirectangular) metadata so YouTube, VLC and headsets play it as 360
    r = subprocess.run([sys.executable, "-m", "spatialmedia", "-i", str(src), str(out)], cwd=str(HERE), capture_output=True, text=True)
    if r.returncode != 0 or not out.exists():
        print(r.stdout, r.stderr); shutil.copy(src, out); print("Could not add 360 metadata; saved the video without it.")
    print(f"\nDone: {out}")

def main():
    ap = argparse.ArgumentParser(description="Render ARCHIVE's journey through science fiction as a 360 video.")
    ap.add_argument("--start", type=float, default=0, help="journey time to start at, seconds (default 0)")
    ap.add_argument("--duration", type=float, default=180, help="length in seconds (default 180 = the full 3:00 journey)")
    ap.add_argument("--width", type=int, default=3840, help="video width; height is half (3840 = 4K 360, 5760 = 5.7K)")
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--crf", type=int, default=17, help="quality, lower = better/larger (default 17)")
    ap.add_argument("--audio", help="your own soundtrack file instead of the built-in music (mp3, wav, m4a)")
    ap.add_argument("--no-music", action="store_true", help="leave the video silent")
    ap.add_argument("--recompose", action="store_true", help="re-synthesize the music in the page instead of using audio/soundtrack.mp3")
    ap.add_argument("--out", default="ARCHIVE_SciFi_Journey_360.mp4")
    ap.add_argument("--part-seconds", type=float, default=10)
    ap.add_argument("--test", action="store_true", help="quick 5-second check at 1920x960")
    ap.add_argument("--show-window", action="store_true", help="open a visible browser window (helps Chrome use the graphics card)")
    ap.add_argument("--headless", action="store_true", default=True)
    ap.add_argument("--cpu", action="store_true", help="force software rendering (slow; for machines without a working GPU)")
    ap.add_argument("--chrome", help="path to a Chrome/Chromium executable to use instead of Playwright's")
    args = ap.parse_args()
    if args.test:
        args.start, args.duration, args.width, args.out = 22.0, 5, 1920, "ARCHIVE_Skyship_360_test.mp4"
        args.part_seconds = 5
    files = asyncio.run(render(args))
    finish(args, files)

if __name__ == "__main__":
    main()
