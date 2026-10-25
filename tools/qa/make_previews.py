"""Render the portal's preview images (portal/img/<world-id>.jpg) from the worlds themselves.

    python tools/qa/make_previews.py            # all
    python tools/qa/make_previews.py film       # only film worlds (slow without a GPU)

Uses each project's own render hooks, so previews always match what the worlds really look like.
"""
import base64, io, shutil, sys
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright
sys.path.insert(0, str(Path(__file__).parent))
from check_worlds import serve, CHROME_ARGS, ROOT

OUT = ROOT / "portal" / "img"; OUT.mkdir(parents=True, exist_ok=True)
W, H = 960, 540

def save(url, name):
    im = Image.open(io.BytesIO(base64.b64decode(url.split(",", 1)[1]))).convert("RGB").resize((W, H), Image.LANCZOS)
    im.save(OUT / f"{name}.jpg", quality=80, optimize=True, progressive=True); print("wrote", name)

# [world id, journey, time, view, yaw, pitch]
ENGINE = [("columbus-2050", "columbus-to-orbit", 27.5, "chase", 0, 0), ("orbital-habitat", "columbus-to-orbit", 69.5, "cabin", 1.2, -.05),
          ("scifi-frankenstein", "scifi-classics", 24, "cabin", .5, 0), ("scifi-rur", "scifi-classics", 52, "cabin", -.3, -.05),
          ("scifi-metropolis", "scifi-classics", 96, "cabin", 0, .1), ("scifi-orbit", "scifi-classics", 135, "cabin", 0, 0),
          ("scifi-journey", "scifi-classics", 23, "chase", 0, 0)]
FILM = [("worlds-within-worlds", 0, 330), ("film-verdance", 1, 200), ("film-orrery", 2, 200), ("film-ferrum", 3, 200), ("film-thalassa", 4, 200),
        ("film-loom", 5, 200), ("film-lost-worlds", 6, 200), ("film-cosmic-core", 7, 200)]

def main(which):
    srv, base = serve()
    with sync_playwright() as p:
        b = p.chromium.launch(args=CHROME_ARGS)
        if "engine" in which:
            pages = {}
            for wid, jid, t, view, y, pitch in ENGINE:
                if jid not in pages:
                    pg = b.new_page(viewport={"width": W, "height": H}); pg.add_init_script("window.__SKYSHIP_RENDER=true")
                    pg.goto(base + f"skyship-engine/journey.html?journey={jid}"); pg.wait_for_function("window.SKYSHIP&&SKYSHIP.ready", timeout=300000); pages[jid] = pg
                pg = pages[jid]; pg.evaluate(f"SKYSHIP.warm({t})"); save(pg.evaluate(f"SKYSHIP.frameFlat({t},'{view}',1/30,{y},{pitch})"), wid)
            pg = b.new_page(viewport={"width": W, "height": H}); pg.add_init_script("window.__SKYSHIP_RENDER=true")
            pg.goto(base + "skyship-360/skyship.html"); pg.wait_for_function("window.SKYSHIP&&SKYSHIP.ready", timeout=300000)
            pg.evaluate("SKYSHIP.warm(95)"); save(pg.evaluate("SKYSHIP.frameFlat(95,'chase')"), "skyship-world-tour")
            shutil.copy(ROOT / "world-tour" / "poster.jpg", OUT / "world-tour-film.jpg"); print("wrote world-tour-film (poster)")
        if "film" in which:
            pg = b.new_page(viewport={"width": W, "height": H})
            pg.goto(base + "worlds-within-worlds/ARCHIVE_Studio.html?render=1", wait_until="commit"); pg.wait_for_function("window.__ready", timeout=600000, polling=1000)
            for wid, ch, off in FILM:
                t = pg.evaluate(f"(ARCHIVE.storyToOut({ch * 540 + off})||{{t:{ch * 540 + off}}}).t")
                save(pg.evaluate(f"window.__renderFrame({t},0.6,{W},{H})"), wid)
        b.close()
    srv.shutdown()

if __name__ == "__main__":
    main(sys.argv[1:] or ["engine", "film"])
