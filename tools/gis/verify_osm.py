"""Check the built map layers in data/gis/ before they are committed.

    python tools/gis/verify_osm.py            # both regions
    python tools/gis/verify_osm.py --summary summary.md   # also write a Markdown report (used by GitHub Actions)

Hard checks (exit code 1 if any fail): the file exists, it was built from a real download (raw file present with
OSM elements), at least 200 buildings, size between 0.1 and 8 MB. Expected size is about 0.3-3 MB; outside that
is reported as a warning. Missing landmarks are reported but do not fail: they tell you which names OSM uses.
"""
import argparse, json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
EXPECT = {
    "columbus-downtown": ["LeVeque Tower", "Ohio Statehouse", "Scioto River"],
    "osu-campus": ["Ohio Stadium", "The Oval", "Mirror Lake", "Olentangy River", "*Thompson*"],
}


def check(region):
    rows, hard, warn, missing = [], [], [], []
    f = ROOT / "data/gis" / f"{region}.json"
    raw = ROOT / "data/gis/raw" / f"{region}.osm.json"
    if not f.is_file():
        return {"region": region, "hard": [f"{f.relative_to(ROOT)} was not built"], "warn": [], "missing": EXPECT[region], "rows": []}
    d = json.loads(f.read_text()); mb = f.stat().st_size / 1e6; st = d.get("stats", {})
    if raw.is_file():
        n_el = len(json.loads(raw.read_text()).get("elements", []))
        rows.append(("raw OSM elements", f"{n_el:,}"))
        if n_el == 0:
            hard.append("raw download has no elements")
    else:
        hard.append("no raw download found (data/gis/raw/): the file was not built from a fresh OSM download")
    rows += [("origin", f"{d['origin']['lat']}, {d['origin']['lon']} ({d['origin']['how']}: {d['origin']['note']})"),
             ("buildings", f"{st.get('buildings', 0):,}"), ("height sources", json.dumps(st.get("heights", {}))),
             ("roads", f"{st.get('roads', 0):,}"), ("water areas", st.get("water", 0)), ("river lines", len(d.get("rivers", []))),
             ("green areas", st.get("green", 0)), ("mapped trees", st.get("trees", 0)), ("landmarks (named features)", st.get("landmarks", 0)),
             ("file size", f"{mb:.2f} MB")]
    if st.get("buildings", 0) < 200:
        hard.append(f"only {st.get('buildings', 0)} buildings (expected hundreds)")
    if not .1 <= mb <= 8:
        hard.append(f"file size {mb:.2f} MB is far outside the expected 0.3-3 MB")
    elif not .3 <= mb <= 3:
        warn.append(f"file size {mb:.2f} MB is outside the expected 0.3-3 MB")
    names = list(d.get("landmarks", {}))
    for want in EXPECT[region]:
        if want.startswith("*"):
            k = want.strip("*").lower(); hit = [n for n in names if k in n.lower()]
        else:
            hit = [n for n in names if n.lower() == want.lower()]
        rows.append((f"landmark: {want.strip('*') if not want.startswith('*') else 'name containing ' + want.strip('*')}", ", ".join(hit) if hit else "MISSING"))
        if not hit:
            near = [n for n in names if any(w.lower() in n.lower() for w in want.strip("*").split() if len(w) > 3)]
            missing.append(want + (f" (similar names: {', '.join(near[:5])})" if near else ""))
    return {"region": region, "hard": hard, "warn": warn, "missing": missing, "rows": rows}


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--summary"); a = ap.parse_args()
    results = [check(r) for r in EXPECT]
    md = ["# OpenStreetMap data check", ""]
    for r in results:
        print(f"\n== {r['region']} ==")
        md += [f"## {r['region']}", "", "| Check | Result |", "|---|---|"]
        for k, v in r["rows"]:
            print(f"  {k:28} {v}"); md.append(f"| {k} | {v} |")
        for x in r["hard"]:
            print(f"  FAIL: {x}"); md.append(f"\n**FAIL:** {x}")
        for x in r["warn"]:
            print(f"  WARNING: {x}"); md.append(f"\n**Warning:** {x}")
        print("  Missing landmarks: " + ("; ".join(r["missing"]) if r["missing"] else "none"))
        md += ["", "**Missing landmarks:** " + ("; ".join(r["missing"]) if r["missing"] else "none"), ""]
    if a.summary:
        Path(a.summary).write_text("\n".join(md) + "\n")
    bad = [x for r in results for x in r["hard"]]
    print("\nRESULT: " + ("FAILED - " + "; ".join(bad) if bad else "all hard checks passed"))
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
