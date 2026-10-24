"""FLE Virtual Worlds - automated smoke tests.

Serves the repository root over HTTP, opens each experience in headless Chromium
(software WebGL, so it runs on machines without a graphics card), renders real
frames through each project's own render hooks, and checks that the frames are not
blank (so a stuck loading screen fails). Writes screenshots and a JSON report.

    python tools/qa/check_worlds.py                 # everything
    python tools/qa/check_worlds.py portal journey  # only some groups
    python tools/qa/check_worlds.py --out docs/qa   # where screenshots go

Groups: portal, scifi, skyship, studio, worldtour, journey, mobile
Needs: pip install playwright pillow && python -m playwright install chromium
"""
import argparse, base64, functools, http.server, io, json, socketserver, statistics, sys, threading, time
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
CHROME_ARGS = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist",
               "--disable-background-timer-throttling", "--disable-renderer-backgrounding"]
IGNORED = ("fonts.googleapis.com", "fonts.gstatic.com", "ERR_TUNNEL_CONNECTION_FAILED", "ERR_NAME_NOT_RESOLVED",
           "ERR_INTERNET_DISCONNECTED", "favicon.ico")


def serve():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
        extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map, ".js": "text/javascript", ".mjs": "text/javascript",
                          ".json": "application/json", ".glsl": "text/plain"}
    socketserver.TCPServer.allow_reuse_address = True
    srv = socketserver.ThreadingTCPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=str(ROOT)))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, f"http://127.0.0.1:{srv.server_address[1]}/"


def img_stats(data):
    """Return (std-dev of luminance, distinct-colour estimate) for an image (bytes)."""
    im = Image.open(io.BytesIO(data)).convert("L").resize((96, 54))
    px = list(im.get_flattened_data()) if hasattr(im, "get_flattened_data") else list(im.getdata())
    return round(statistics.pstdev(px), 1), len(set(p // 8 for p in px))


def save_data_url(url, path):
    raw = base64.b64decode(url.split(",", 1)[1]); path.write_bytes(raw); return raw


class Run:
    def __init__(self, out):
        self.out = out; self.results = []

    def record(self, group, name, ok, detail="", shot=None):
        self.results.append({"group": group, "test": name, "ok": bool(ok), "detail": detail, "screenshot": shot})
        print(f"[{'PASS' if ok else 'FAIL'}] {group}: {name} {detail}", flush=True)

    def frame(self, group, name, raw, fname, min_std=6):
        sd, colours = img_stats(raw)
        self.record(group, name, sd >= min_std and colours >= 4, f"(luminance std {sd}, {colours} tones)", fname)


def new_page(browser, run, group, w=1280, h=720, mobile=False):
    ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=1, is_mobile=mobile, has_touch=mobile)
    page = ctx.new_page(); errs = []
    page.on("pageerror", lambda e: errs.append(f"pageerror: {e}"))
    page.on("console", lambda m: errs.append(f"console: {m.text}") if m.type == "error" else None)
    page.on("requestfailed", lambda r: errs.append(f"requestfailed: {r.url} {r.failure}"))
    page.on("response", lambda r: errs.append(f"http {r.status}: {r.url}") if r.status >= 400 else None)
    return page, errs


def freeze(page):
    """stop the live loop (software rendering takes seconds per frame) and skip the loading fade"""
    page.evaluate("SKYSHIP.freeze(); document.getElementById('loading').style.transition='none'")


def report_errors(run, group, name, errs):
    real = [e for e in errs if not any(s in e for s in IGNORED)]
    run.record(group, f"{name}: no JavaScript errors or missing files", not real, "; ".join(real[:4])[:400])


# ---------------------------------------------------------------- groups
def t_scifi(b, run, base):
    page, errs = new_page(b, run, "scifi")
    page.add_init_script("window.__SKYSHIP_RENDER=true")
    page.goto(base + "sci-fi-360/skyship.html"); page.wait_for_function("window.SKYSHIP&&SKYSHIP.ready", timeout=240000)
    for t, label in [(22, "frankenstein"), (60, "rur"), (100, "metropolis"), (140, "orbit")]:
        page.evaluate(f"SKYSHIP.warm({t})")
        raw = save_data_url(page.evaluate(f"SKYSHIP.frameFlat({t},'cabin')"), run.out / f"scifi_{label}.jpg")
        run.frame("scifi", f"cabin frame renders at {t}s ({label})", raw, f"scifi_{label}.jpg")
    raw = save_data_url(page.evaluate("SKYSHIP.frame360(140,1024)"), run.out / "scifi_360_orbit.jpg")
    w, h = Image.open(io.BytesIO(raw)).size
    run.frame("scifi", f"360 equirectangular capture ({w}x{h}, 2:1)", raw if w == 2 * h else b"", "scifi_360_orbit.jpg")
    report_errors(run, "scifi", "sci-fi-360", errs); page.context.close()


def t_skyship(b, run, base):
    page, errs = new_page(b, run, "skyship")
    page.add_init_script("window.__SKYSHIP_RENDER=true")
    page.goto(base + "skyship-360/skyship.html"); page.wait_for_function("window.SKYSHIP&&SKYSHIP.ready", timeout=240000)
    for t, label in [(12, "columbus"), (95, "paris")]:
        raw = save_data_url(page.evaluate(f"SKYSHIP.frameFlat({t},'cabin')"), run.out / f"skyship_{label}.jpg")
        run.frame("skyship", f"cabin frame renders at {t}s ({label})", raw, f"skyship_{label}.jpg")
    raw = save_data_url(page.evaluate("SKYSHIP.frame360(12,1024)"), run.out / "skyship_360.jpg")
    run.frame("skyship", "360 equirectangular capture", raw, "skyship_360.jpg")
    report_errors(run, "skyship", "skyship-360", errs); page.context.close()


def t_studio(b, run, base):
    page, errs = new_page(b, run, "studio")
    page.goto(base + "worlds-within-worlds/ARCHIVE_Studio.html?render=1", wait_until="commit")
    page.wait_for_function("window.__ready", timeout=600000, polling=1000)
    for t, label in [(700, "ch2_verdance"), (2500, "ch5_thalassa")]:
        raw = save_data_url(page.evaluate(f"window.__renderFrame({t},0.5,480,270)"), run.out / f"studio_{label}.jpg")
        run.frame("studio", f"film frame renders at {t}s ({label})", raw, f"studio_{label}.jpg")
    raw = save_data_url(page.evaluate("window.__renderFrame(700,0.5,512,256,{equirect:true})"), run.out / "studio_360.jpg")
    run.frame("studio", "film 360 equirectangular frame", raw, "studio_360.jpg")
    report_errors(run, "studio", "worlds-within-worlds", errs); page.context.close()


def t_worldtour(b, run, base):
    page, errs = new_page(b, run, "worldtour")
    page.goto(base + "world-tour/index.html")
    dur = page.evaluate("new Promise(r=>{const v=document.getElementById('film'); if(v.readyState>=1) r(v.duration); v.onloadedmetadata=()=>r(v.duration); v.onerror=()=>r(-1); setTimeout(()=>r(-2),20000);})")
    run.record("worldtour", "video loads its metadata", dur and dur > 100, f"(duration {dur:.1f}s)" if dur else "")
    n = page.locator("#stops button").count(); run.record("worldtour", "chapter stop buttons present", n == 9, f"({n})")
    page.screenshot(path=str(run.out / "worldtour.jpg"), type="jpeg", quality=80)
    report_errors(run, "worldtour", "world-tour", errs); page.context.close()


def t_portal(b, run, base):
    for w, h, mobile, label in [(1440, 900, False, "desktop"), (390, 844, True, "mobile")]:
        page, errs = new_page(b, run, "portal", w, h, mobile)
        page.goto(base + "index.html"); page.wait_for_selector(".card", timeout=20000)
        cards = page.locator(".card").count(); run.record("portal", f"{label}: gallery shows world cards", cards >= 6, f"({cards})")
        overflow = page.evaluate("document.documentElement.scrollWidth - innerWidth")
        run.record("portal", f"{label}: no horizontal scrolling", overflow <= 1, f"(overflow {overflow}px)")
        page.screenshot(path=str(run.out / f"portal_{label}.jpg"), type="jpeg", quality=82, full_page=False)
        if label == "desktop":
            links = page.evaluate("[...document.querySelectorAll('a[href]')].map(a=>a.href).filter(h=>h.startsWith(location.origin))")
            bad = []
            for href in sorted(set(links)):
                r = page.request.get(href.split("#")[0]); bad += [f"{r.status} {href}"] if r.status >= 400 else []
            run.record("portal", f"all {len(set(links))} local links resolve", not bad, "; ".join(bad))
            for cat in ["sustainability", "technology", "space"]:
                page.click(f"[data-filter='{cat}']"); time.sleep(.2)
                vis = page.evaluate("[...document.querySelectorAll('.card')].filter(c=>!c.hidden).map(c=>c.dataset.categories)")
                run.record("portal", f"filter '{cat}' shows only matching worlds", vis and all(cat in v for v in vis), f"({len(vis)} cards)")
            page.click("[data-filter='all']")
            ok = page.evaluate("fetch('worlds/index.json').then(r=>r.json()).then(j=>j.worlds.length)")
            run.record("portal", "world manifest index loads", ok >= 6, f"({ok} manifests)")
        report_errors(run, "portal", f"portal {label}", errs); page.context.close()


def t_journey(b, run, base):
    page, errs = new_page(b, run, "journey")
    page.add_init_script("window.__SKYSHIP_RENDER=true")
    page.goto(base + "skyship-engine/journey.html?journey=columbus-to-orbit"); page.wait_for_function("window.SKYSHIP&&SKYSHIP.ready", timeout=300000)
    for c in page.evaluate("SKYSHIP.clearance()"):
        run.record("journey", f"flight path clears every building/structure in {c['world']}", c["d"] >= 15, f"(closest {c['d']} m at {c['t']}s: {c.get('box', '')})")
    dur = page.evaluate("SKYSHIP.DURATION"); run.record("journey", "Columbus 2050 → orbit journey length is 60–90 s", 60 <= dur <= 90, f"({dur}s)")
    shots = page.evaluate("SKYSHIP.SHOTS")
    for t, label, view, y, p in shots:
        page.evaluate(f"SKYSHIP.warm({t})")
        raw = save_data_url(page.evaluate(f"SKYSHIP.frameFlat({t},'{view}',1/30,{y},{p})"), run.out / f"journey_{label}.jpg")
        run.frame("journey", f"{label} renders ({view} view, {t}s)", raw, f"journey_{label}.jpg")
    raw = save_data_url(page.evaluate("SKYSHIP.frame360(20,1024)"), run.out / "journey_360_columbus.jpg")
    run.frame("journey", "360 capture works in Columbus 2050", raw, "journey_360_columbus.jpg")
    raw = save_data_url(page.evaluate(f"SKYSHIP.frame360({dur-15},1024)"), run.out / "journey_360_orbit.jpg")
    run.frame("journey", "360 capture works in the orbital habitat", raw, "journey_360_orbit.jpg")
    report_errors(run, "journey", "journey render mode", errs); page.context.close()

    # interactive mode: menus, stations, info cards, educational overlay
    for jid, label in [("columbus-2050", "Columbus 2050 alone"), ("orbital-habitat", "Orbital habitat alone"), ("scifi-classics", "Sci-Fi worlds on the shared engine")]:
        page, errs = new_page(b, run, "journey")
        page.goto(base + f"skyship-engine/journey.html?journey={jid}&mode=explore")
        page.wait_for_function("window.SKYSHIP&&SKYSHIP.ready", timeout=300000); freeze(page)
        stops = page.locator("#stops button").count() - 1   # minus the "Next stop" button
        run.record("journey", f"{label}: loads in exploration mode with stops", stops >= 1, f"({stops} stops)")
        if stops:
            page.locator("#stops button").nth(min(1, stops - 1)).click()
            page.evaluate("SKYSHIP.goto(SKYSHIP.state().target); SKYSHIP.step(1)")
        bad = page.evaluate("SKYSHIP.hotspots().filter(h=>!h.ok).map(h=>h.id)"); hs = page.evaluate("SKYSHIP.hotspots().length")
        run.record("journey", f"{label}: every hotspot has a 3D anchor", not bad, ", ".join(bad))
        if hs:
            page.evaluate("SKYSHIP.openHotspot(0); SKYSHIP.step(2,.4)")
            run.record("journey", f"{label}: info card opens from a hotspot", page.locator("#card:not([hidden])").count() == 1, f"({hs} hotspots)")
        page.screenshot(path=str(run.out / f"explore_{jid}.jpg"), type="jpeg", quality=80, timeout=240000)
        sd, _ = img_stats((run.out / f"explore_{jid}.jpg").read_bytes())
        run.record("journey", f"{label}: live view is not a blank or loading screen", sd > 6, f"(std {sd})", f"explore_{jid}.jpg")
        report_errors(run, "journey", label, errs); page.context.close()

    page, errs = new_page(b, run, "journey")
    page.goto(base + "skyship-engine/journey.html?journey=columbus-to-orbit&mode=learn")
    page.wait_for_function("window.SKYSHIP&&SKYSHIP.ready", timeout=300000); freeze(page)
    run.record("journey", "educational mode shows the lesson panel", page.locator("#lesson:not([hidden])").count() == 1)
    page.evaluate("SKYSHIP.flyToStop(12); SKYSHIP.goto(SKYSHIP.state().target); SKYSHIP.step(1)")
    page.evaluate("SKYSHIP.openHotspot(SKYSHIP.hotspots().findIndex(h=>h.id==='water')); SKYSHIP.step(2,.4)")
    q = page.locator("#card .q button"); run.record("journey", "learn mode asks a question on the info card", q.count() >= 2, f"({q.count()} answers)")
    if q.count(): q.nth(2).click(); run.record("journey", "a correct answer is marked and explained", page.locator("#card .q button.right").count() == 1 and page.locator("#card .why:not([hidden])").count() == 1)
    page.screenshot(path=str(run.out / "learn_mode.jpg"), type="jpeg", quality=80, timeout=240000)
    report_errors(run, "journey", "educational mode", errs); page.context.close()


def t_mobile(b, run, base):
    page, errs = new_page(b, run, "mobile", 390, 844, True)
    page.goto(base + "skyship-engine/journey.html?journey=columbus-to-orbit&mode=explore")
    page.wait_for_function("window.SKYSHIP&&SKYSHIP.ready", timeout=300000); freeze(page); page.evaluate("SKYSHIP.flyToStop(3); SKYSHIP.goto(SKYSHIP.state().target); SKYSHIP.openHotspot(3); SKYSHIP.step(2,.4)")
    overflow = page.evaluate("document.documentElement.scrollWidth - innerWidth")
    run.record("mobile", "journey page fits a phone screen", overflow <= 1, f"(overflow {overflow}px)")
    page.screenshot(path=str(run.out / "journey_mobile.jpg"), type="jpeg", quality=80, timeout=240000)
    report_errors(run, "mobile", "journey on phone", errs); page.context.close()


def t_data(b, run, base):
    """manifests match their schemas; launch links, previews, modules and journey references exist"""
    try: import jsonschema
    except ImportError: jsonschema = None; run.record("data", "jsonschema installed (pip install jsonschema)", False)
    for folder in ["worlds", "journeys"]:
        sch = json.loads((ROOT / folder / "schema.json").read_text())
        for f in sorted((ROOT / folder).glob("*.json")):
            if f.name in ("schema.json", "index.json"): continue
            m = json.loads(f.read_text()); probs = []
            if jsonschema:
                try: jsonschema.validate(m, sch)
                except jsonschema.ValidationError as e: probs.append(f"schema: {e.message[:120]}")
            for l in m.get("launch", []):
                if not (ROOT / l["href"].split("?")[0]).is_file(): probs.append(f"missing {l['href']}")
            if m.get("preview") and not (ROOT / m["preview"]).is_file(): probs.append(f"missing preview {m['preview']}")
            if (m.get("engine") or {}).get("module") and not (ROOT / m["engine"]["module"]).is_file(): probs.append("missing module")
            for w in m.get("worlds", []):
                if not (ROOT / "worlds" / f"{w['world']}.json").is_file(): probs.append(f"unknown world {w['world']}")
            if folder == "journeys":
                hs = [h["id"] for w in m["worlds"] for h in json.loads((ROOT / "worlds" / f"{w['world']}.json").read_text()).get("hotspots", [])]
                if len(hs) != len(set(hs)): probs.append("duplicate hotspot ids")
                for o in (m.get("lesson") or {}).get("objectives", []):
                    probs += [f"lesson refers to unknown hotspot {h}" for h in o.get("hotspots", []) if h not in hs]
            run.record("data", f"{folder}/{f.name} is valid and complete", not probs, "; ".join(probs))


GROUPS = {"data": t_data, "portal": t_portal, "scifi": t_scifi, "skyship": t_skyship, "studio": t_studio, "worldtour": t_worldtour, "journey": t_journey, "mobile": t_mobile}


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("groups", nargs="*"); ap.add_argument("--out", default=str(ROOT / "tools/qa/out"))
    a = ap.parse_args(); out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    srv, base = serve(); run = Run(out); t0 = time.time()
    with sync_playwright() as p:
        b = p.chromium.launch(args=CHROME_ARGS)
        for g in a.groups or GROUPS:
            try: GROUPS[g](b, run, base)
            except Exception as e: run.record(g, "group finished without an exception", False, str(e)[:300])
        b.close()
    srv.shutdown()
    fails = [r for r in run.results if not r["ok"]]
    summary = {"when": time.strftime("%Y-%m-%d %H:%M"), "seconds": round(time.time() - t0), "passed": len(run.results) - len(fails), "failed": len(fails), "results": run.results}
    (out / "report.json").write_text(json.dumps(summary, indent=1))
    print(f"\n{summary['passed']} passed, {summary['failed']} failed in {summary['seconds']}s")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
