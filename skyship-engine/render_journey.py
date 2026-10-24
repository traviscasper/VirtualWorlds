"""
ARCHIVE Skyship Engine - video renderer
=======================================
Renders any journey in ../journeys/ as
  * a 360 video (equirectangular MP4, H.264 + AAC, with YouTube/VR 360 metadata), or
  * a conventional 16:9 video from the cabin seat (--flat).

Based on sci-fi-360/render_360.py (same resumable 10-second parts and the same page API),
but it serves the whole repository so a journey can use worlds from any project.

Setup (once):
    pip install playwright imageio-ffmpeg
    python -m playwright install chromium

Render (run from this folder):
    python render_journey.py --test                               # 5 s check at 1920x960
    python render_journey.py --journey columbus-to-orbit          # full journey, 3840x1920, 30 fps
    python render_journey.py --journey columbus-to-orbit --flat   # 16:9 1920x1080 from the cabin seat
    python render_journey.py --journey scifi-classics --width 5760
    python render_journey.py --journey columbus-2050 --audio song.mp3

Parts are saved in parts/<journey>/. If a render stops, run the same command again and it
resumes. Delete that folder to start over.
"""
import argparse, asyncio, base64, json, platform, shutil, subprocess, sys, time
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
ROUTE_HOST = "http://skyship.local/"
TYPES = {".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".mp3": "audio/mpeg", ".jpg": "image/jpeg", ".png": "image/png"}


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
    parts = HERE / "parts" / args.journey; parts.mkdir(parents=True, exist_ok=True)
    total_frames = int(round(args.duration * args.fps))
    part_frames = int(args.part_seconds * args.fps)
    n_parts = (total_frames + part_frames - 1) // part_frames
    kind = "flat" if args.flat else "360"
    tag = f"{kind}_{args.width}w_{args.fps}fps_s{args.start:g}_p{args.part_seconds:g}"

    launch_args = ["--ignore-gpu-blocklist", "--enable-gpu-rasterization", "--disable-background-timer-throttling",
                   "--disable-renderer-backgrounding", "--disable-backgrounding-occluded-windows"]
    if args.cpu: launch_args += ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"]
    elif platform.system() == "Windows": launch_args += ["--force_high_performance_gpu", "--use-angle=d3d11"]   # use the discrete GPU

    async with async_playwright() as p:
        kw = dict(headless=not args.show_window, args=launch_args)
        if args.chrome: kw["executable_path"] = args.chrome
        browser = await p.chromium.launch(**kw)
        vw, vh = (args.width, args.width * 9 // 16) if args.flat else (1280, 720)
        page = await browser.new_page(viewport={"width": vw, "height": vh})
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))

        async def route(r):
            url = r.request.url
            if url.startswith(ROUTE_HOST):
                rel = url[len(ROUTE_HOST):].split("?")[0] or "skyship-engine/journey.html"
                f = (ROOT / rel).resolve()
                if ROOT in f.parents and f.is_file():
                    await r.fulfill(path=str(f), content_type=TYPES.get(f.suffix, "application/octet-stream")); return
                await r.fulfill(status=404, body="not found"); return
            await r.continue_()   # Google Fonts load from the internet; the page falls back if offline
        await page.route("**/*", route)
        await page.add_init_script("window.__SKYSHIP_RENDER=true")
        await page.goto(ROUTE_HOST + f"skyship-engine/journey.html?journey={args.journey}&render")
        try:
            await page.wait_for_function("window.SKYSHIP && window.SKYSHIP.ready", timeout=300000)
        except Exception:
            print("The journey page did not load.", *errors, sep="\n"); await browser.close(); sys.exit(1)

        gpu = await page.evaluate("""(()=>{ const g=document.createElement('canvas').getContext('webgl2');
            const e=g&&g.getExtension('WEBGL_debug_renderer_info'); return e? g.getParameter(e.UNMASKED_RENDERER_WEBGL) : 'unknown'; })()""")
        print(f"Graphics: {gpu}")
        if "swiftshader" in gpu.lower() and not args.cpu:
            print("  Note: Chrome is drawing on the CPU (SwiftShader), which is slow.\n"
                  "  Try:  python render_journey.py --show-window   (a visible window usually gets the graphics card)")

        if args.bake_audio:   # compose the score in the page and save it as journeys/audio/<id>.mp3
            n = await page.evaluate("(async()=>{ return await SKYSHIP.soundtrackPrepare(0, SKYSHIP.DURATION, true); })()")
            wav = parts / "baked.wav"
            with open(wav, "wb") as fh:
                for i in range(n): fh.write(base64.b64decode(await page.evaluate(f"SKYSHIP.soundtrackChunk({i})")))
            mp3 = ROOT / "journeys" / "audio" / f"{args.journey}.mp3"; mp3.parent.mkdir(exist_ok=True)
            subprocess.run([ff, "-y", "-v", "error", "-i", str(wav), "-c:a", "libmp3lame", "-b:a", "128k", str(mp3)], check=True)
            print(f"Saved {mp3}. Point the journey at it with  \"audio\": {{\"file\": \"../journeys/audio/{args.journey}.mp3\"}}")
            await browser.close(); sys.exit(0)

        size = f"{args.width}x{args.width * 9 // 16}" if args.flat else f"{args.width}x{args.width // 2}"
        print(f"Rendering '{args.journey}' {kind}: {args.duration:g}s at {size}, {args.fps} fps = {total_frames} frames in {n_parts} parts")
        t_start = time.time(); done_new = 0
        for pi in range(n_parts):
            out = parts / f"part_{tag}_{pi:03d}.mp4"
            f0 = pi * part_frames; f1 = min(total_frames, f0 + part_frames)
            if out.exists() and out.stat().st_size > 0:
                continue
            tmp = out.with_suffix(".tmp.mp4")
            enc = subprocess.Popen([ff, "-y", "-v", "error", "-f", "image2pipe", "-framerate", str(args.fps), "-i", "-",
                                    "-c:v", "libx264", "-preset", "veryfast" if not args.best else "medium", "-crf", str(args.crf), "-pix_fmt", "yuv420p", str(tmp)],
                                   stdin=subprocess.PIPE)
            await page.evaluate(f"SKYSHIP.warm({args.start + f0 / args.fps})")
            for f in range(f0, f1):
                t = args.start + f / args.fps
                js = f"SKYSHIP.frameFlat({t},'cabin',{1/args.fps},0,{args.pitch})" if args.flat else f"SKYSHIP.frame360({t},{args.width})"
                url = await page.evaluate(js)
                enc.stdin.write(base64.b64decode(url.split(",", 1)[1]))
                done_new += 1
                if done_new % 15 == 0:
                    el = time.time() - t_start; rate = el / done_new
                    remaining = sum(1 for q in range(n_parts) if not (parts / f"part_{tag}_{q:03d}.mp4").exists()) * part_frames - (f - f0 + 1)
                    print(f"  part {pi+1}/{n_parts}  frame {f+1}/{total_frames}  {rate:.2f}s/frame  ~{fmt(max(0, remaining) * rate)} left", flush=True)
            enc.stdin.close(); enc.wait()
            tmp.replace(out)
        # soundtrack: the journey's pre-rendered file if it has one, otherwise composed by the page itself
        args.music_file = None
        if not args.audio and not args.no_music:
            wav = parts / f"music_s{args.start:g}_d{args.duration:g}.wav"
            pre = args.audio_file
            if not wav.exists() and pre and pre.exists() and not args.recompose:
                subprocess.run([ff, "-y", "-v", "error", "-ss", f"{args.start}", "-t", f"{args.duration}", "-i", str(pre), str(wav)], check=True)
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
    folder = part_files[0].parent
    lst = folder / "list.txt"
    lst.write_text("".join(f"file '{p.name}'\n" for p in part_files))
    joined = folder / "joined.mp4"
    subprocess.run([ff, "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", str(lst), "-c", "copy", str(joined)], check=True)
    src = joined
    music = args.audio or getattr(args, "music_file", None)
    if music:
        withaudio = folder / "with_audio.mp4"
        subprocess.run([ff, "-y", "-v", "error", "-i", str(joined), "-i", music, "-map", "0:v", "-map", "1:a",
                        "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-shortest", str(withaudio)], check=True)
        src = withaudio
    out = Path(args.out).resolve()
    if args.flat:
        shutil.copy(src, out)
    else:   # spherical metadata (Google's Spatial Media tool, vendored in sci-fi-360/) so YouTube, VLC and headsets play it as 360
        r = subprocess.run([sys.executable, "-m", "spatialmedia", "-i", str(src), str(out)], cwd=str(ROOT / "sci-fi-360"), capture_output=True, text=True)
        if r.returncode != 0 or not out.exists():
            print(r.stdout, r.stderr); shutil.copy(src, out); print("Could not add 360 metadata; saved the video without it.")
    print(f"\nDone: {out}")


def main():
    ap = argparse.ArgumentParser(description="Render an ARCHIVE Skyship journey as a 360 or 16:9 video.")
    ap.add_argument("--journey", default="columbus-to-orbit", help="journey id (a file in ../journeys/)")
    ap.add_argument("--start", type=float, default=0, help="journey time to start at, seconds")
    ap.add_argument("--duration", type=float, help="length in seconds (default: the whole journey)")
    ap.add_argument("--width", type=int, help="video width (360 default 3840 → 3840x1920; --flat default 1920 → 1920x1080)")
    ap.add_argument("--flat", action="store_true", help="16:9 video from the cabin seat instead of 360")
    ap.add_argument("--pitch", type=float, default=-.12, help="--flat: camera pitch in radians (negative looks down)")
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--crf", type=int, default=17, help="quality, lower = better/larger")
    ap.add_argument("--best", action="store_true", help="slower x264 preset for the final master")
    ap.add_argument("--audio", help="your own soundtrack instead of the journey's music")
    ap.add_argument("--no-music", action="store_true")
    ap.add_argument("--recompose", action="store_true", help="re-synthesize the music in the page instead of using the journey's audio file")
    ap.add_argument("--bake-audio", action="store_true", help="compose the journey's score and save it to ../journeys/audio/<journey>.mp3")
    ap.add_argument("--out", help="output file (default ARCHIVE_<journey>_360.mp4 or _16x9.mp4)")
    ap.add_argument("--part-seconds", type=float, default=10)
    ap.add_argument("--test", action="store_true", help="quick 5-second check at 1920 wide")
    ap.add_argument("--show-window", action="store_true", help="open a visible browser window (helps Chrome use the graphics card)")
    ap.add_argument("--cpu", action="store_true", help="force software rendering (slow; for machines without a working GPU)")
    ap.add_argument("--chrome", help="path to a Chrome/Chromium executable to use instead of Playwright's")
    args = ap.parse_args()
    jf = ROOT / "journeys" / f"{args.journey}.json"
    if not jf.exists(): sys.exit(f"No journey file {jf}")
    J = json.loads(jf.read_text(encoding="utf-8"))
    af = (J.get("audio") or {}).get("file")
    args.audio_file = (HERE / af).resolve() if af else None
    if args.duration is None: args.duration = J["duration"] - args.start
    if args.width is None: args.width = 1920 if args.flat else 3840
    if args.test:
        args.start, args.duration, args.part_seconds = float(J.get("testStart", 24)), 5, 5
        args.width = 1280 if args.flat else 1920
    if not args.out: args.out = f"ARCHIVE_{args.journey}_{'16x9' if args.flat else '360'}{'_test' if args.test else ''}.mp4"
    files = asyncio.run(render(args))
    finish(args, files)


if __name__ == "__main__":
    main()
