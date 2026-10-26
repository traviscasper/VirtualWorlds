"""FLE Virtual Worlds - turn OpenStreetMap data into compact world layers.

    python tools/gis/osm_world.py fetch            # download raw OSM for every region (Overpass API)
    python tools/gis/osm_world.py build            # raw OSM -> data/gis/<region>.json
    python tools/gis/osm_world.py all              # both
    python tools/gis/osm_world.py all osu-campus   # only some regions
    python tools/gis/osm_world.py build --raw my_export.json --region osu-campus   # use a file you exported yourself

Raw downloads go to data/gis/raw/ (not committed). Built layers go to data/gis/<region>.json and are what the
world modules load. Coordinates are local metres around each region's origin: x = east, z = south, y = up,
the same axes as the skyship engine. Needs only the Python standard library.

Map data (c) OpenStreetMap contributors, available under the Open Database License (ODbL 1.0).
"""
import argparse, json, math, re, sys, time, urllib.error, urllib.parse, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "data/gis/raw"
OUT = ROOT / "data/gis"
MIRRORS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter",
           "https://overpass.private.coffee/api/interpreter", "https://maps.mail.ru/osm/tools/overpass/api/interpreter"]

# Each region: a south/west/north/east box and how to find its origin (0,0).
REGIONS = {
    "columbus-downtown": {
        "name": "Downtown Columbus, Ohio",
        "bbox": (39.9450, -83.0230, 39.9790, -82.9790),
        "origin": {"streets": ["High Street", "Broad Street"], "fallback": (39.96216, -82.99883),
                   "note": "High St & Broad St"},
    },
    "osu-campus": {
        "name": "The Ohio State University, Columbus campus",
        "bbox": (39.9890, -83.0360, 40.0130, -82.9980),
        "origin": {"area": "The Oval", "fallback": (39.99930, -83.01420), "note": "centre of the Oval"},
    },
}

QUERY = """[out:json][timeout:240];
(
  way["building"]({b}); relation["building"]({b});
  way["building:part"]({b});
  way["highway"]({b});
  way["railway"~"rail|light_rail|tram"]({b});
  way["waterway"~"river|stream|canal"]({b});
  way["natural"="water"]({b}); relation["natural"="water"]({b}); way["waterway"="riverbank"]({b});
  way["leisure"~"park|garden|pitch|stadium|track|playground|golf_course"]({b}); relation["leisure"~"park|garden|stadium|pitch|track"]({b});
  way["landuse"~"grass|recreation_ground|forest|meadow|cemetery"]({b});
  way["natural"~"wood|scrub|grassland"]({b});
  way["man_made"="bridge"]({b});
  way["amenity"="parking"]({b});
  node["natural"="tree"]({b});
  way["name"="The Oval"]({b});
);
out body; >; out skel qt;
(
  nwr["name"]["leisure"~"stadium|sports_centre|park"]({b});
  nwr["name"]["tourism"~"attraction|museum"]({b});
  nwr["name"]["historic"]({b});
);
out center tags;"""


# ------------------------------------------------------------------ fetch
def fetch(region):
    s, w, n, e = REGIONS[region]["bbox"]
    q = QUERY.replace("{b}", f"{s},{w},{n},{e}")
    data = urllib.parse.urlencode({"data": q}).encode()
    RAW.mkdir(parents=True, exist_ok=True)
    errors = []
    for attempt in range(3):
        for url in MIRRORS:
            host = url.split("/")[2]
            try:
                print(f"  {region}: asking {host} (attempt {attempt + 1}) ...", flush=True)
                req = urllib.request.Request(url, data=data, headers={"User-Agent": "FLE-VirtualWorlds/1.0 (osm_world.py; github.com/traviscasper/VirtualWorlds)"})
                with urllib.request.urlopen(req, timeout=300) as r:
                    body = r.read()
                j = json.loads(body)
                remark = j.get("remark", "")
                if "error" in remark.lower():          # Overpass reports timeouts/out-of-memory as HTTP 200 + remark,
                    raise RuntimeError(f"Overpass remark: {remark[:200]}")   # with partial data we must not use
                if not j.get("elements"):
                    raise RuntimeError("empty answer")
                (RAW / f"{region}.osm.json").write_bytes(body)
                print(f"  {region}: {len(j['elements'])} elements, {len(body) / 1e6:.1f} MB from {host}")
                return
            except urllib.error.HTTPError as ex:
                msg = f"{host}: HTTP {ex.code} {ex.reason} {ex.read()[:200]!r}"
                errors.append(msg); print(f"    failed: {msg}")
            except Exception as ex:   # timeouts, DNS, connection refused, bad JSON: try the next mirror
                msg = f"{host}: {type(ex).__name__}: {ex}"
                errors.append(msg); print(f"    failed: {msg}")
        time.sleep(15 * (attempt + 1))
    sys.exit(f"Could not download {region}. Errors:\n  " + "\n  ".join(errors))


# ------------------------------------------------------------------ helpers
def parse_len(v):
    """'45', '45 m', '150 ft', "150'" -> metres (float) or None."""
    if not v:
        return None
    v = v.strip().lower().replace(",", ".")
    m = re.match(r"^([0-9.]+)\s*(m|ft|feet|')?", v)
    if not m:
        return None
    x = float(m.group(1))
    return x * 0.3048 if m.group(2) in ("ft", "feet", "'") else x


def area(ring):
    return 0.5 * sum(ring[i][0] * ring[i - 1][1] - ring[i - 1][0] * ring[i][1] for i in range(len(ring)))


def centroid(ring):
    xs = [p[0] for p in ring]; zs = [p[1] for p in ring]
    return sum(xs) / len(xs), sum(zs) / len(zs)


def simplify(pts, tol):
    """Douglas-Peucker on [x, z] points."""
    if len(pts) < 3:
        return pts
    a, b = pts[0], pts[-1]
    dx, dz = b[0] - a[0], b[1] - a[1]; L = math.hypot(dx, dz) or 1e-9
    i, dmax = 0, -1
    for k in range(1, len(pts) - 1):
        d = abs(dz * pts[k][0] - dx * pts[k][1] + b[0] * a[1] - b[1] * a[0]) / L
        if d > dmax:
            i, dmax = k, d
    if dmax <= tol:
        return [a, b]
    return simplify(pts[:i + 1], tol)[:-1] + simplify(pts[i:], tol)


def simplify_ring(r, tol):
    """Simplify a closed ring (given without the repeated closing point): split it at the vertex farthest from the
    first one so neither half starts and ends at the same point, simplify both halves, and join them."""
    if len(r) < 5:
        return r
    k = max(range(len(r)), key=lambda i: (r[i][0] - r[0][0]) ** 2 + (r[i][1] - r[0][1]) ** 2)
    a = simplify(r[:k + 1], tol); b = simplify(r[k:] + [r[0]], tol)
    out = a[:-1] + b[:-1]
    return out if len(out) >= 3 else r


def flat(pts):
    """[[x, z], ...] -> [x, z, x, z, ...] in decimetres (ints) to keep files small."""
    return [int(round(c * 10)) for p in pts for c in p]


ROAD_W = {"motorway": 22, "trunk": 18, "primary": 16, "secondary": 14, "tertiary": 12, "unclassified": 9, "residential": 9,
          "living_street": 7, "service": 5, "pedestrian": 7, "footway": 3, "path": 3, "cycleway": 3, "steps": 3,
          "motorway_link": 8, "trunk_link": 8, "primary_link": 8, "secondary_link": 8, "tertiary_link": 7, "busway": 8}
GREEN = {"park", "garden", "pitch", "playground", "golf_course", "grass", "recreation_ground", "meadow", "cemetery",
         "forest", "wood", "scrub", "grassland", "track", "stadium"}


def bld_height(t):
    h = parse_len(t.get("height")) or parse_len(t.get("building:height"))
    if h:
        return h, "tag"
    lv = t.get("building:levels")
    try:
        lv = float(lv) if lv else None
    except ValueError:
        lv = None
    if lv:
        return lv * 3.5 + 1.5, "levels"
    kind = t.get("building", "yes")
    default = {"house": 8, "detached": 8, "residential": 11, "apartments": 14, "garage": 3.5, "garages": 3.5, "shed": 3,
               "roof": 5, "commercial": 12, "retail": 7, "university": 16, "college": 16, "school": 10, "church": 15,
               "parking": 13, "office": 18, "hotel": 30, "stadium": 30, "industrial": 9, "warehouse": 9}.get(kind, 10)
    return default, "default"


# ------------------------------------------------------------------ build
def build(region, raw_path=None):
    cfg = REGIONS[region]
    raw_path = Path(raw_path) if raw_path else RAW / f"{region}.osm.json"
    if not raw_path.is_file():
        sys.exit(f"No raw data for {region} at {raw_path}. Run: python tools/gis/osm_world.py fetch {region}")
    els = json.loads(raw_path.read_text())["elements"]
    nodes = {e["id"]: (e["lat"], e["lon"]) for e in els if e["type"] == "node" and "lat" in e}
    ways = {e["id"]: e for e in els if e["type"] == "way" and "nodes" in e}
    rels = [e for e in els if e["type"] == "relation" and "members" in e]
    # named places from the second query part ("out center tags"): a centre point and tags only. They give names
    # to things whose outline is unnamed or tagged in a way the layers above don't read (e.g. Ohio Stadium).
    named_pts = [e for e in els if e.get("tags", {}).get("name") and ("center" in e or (e["type"] == "node" and "lat" in e))]

    # origin
    o = cfg["origin"]; lat0, lon0 = o["fallback"]; how = "fallback"
    if "streets" in o:
        a, b = o["streets"]
        na = {n for w in ways.values() if a in w.get("tags", {}).get("name", "") and "highway" in w.get("tags", {}) for n in w["nodes"]}
        nb = {n for w in ways.values() if b in w.get("tags", {}).get("name", "") and "highway" in w.get("tags", {}) for n in w["nodes"]}
        common = [nodes[n] for n in na & nb if n in nodes]
        if common:
            lat0 = sum(p[0] for p in common) / len(common); lon0 = sum(p[1] for p in common) / len(common); how = "intersection"
    elif "area" in o:
        for w in ways.values():
            if w.get("tags", {}).get("name") == o["area"]:
                pts = [nodes[n] for n in w["nodes"] if n in nodes]
                if pts:
                    lat0 = sum(p[0] for p in pts) / len(pts); lon0 = sum(p[1] for p in pts) / len(pts); how = "area"
                break
    kx = 111320 * math.cos(math.radians(lat0)); kz = 110574

    def P(nid):
        la, lo = nodes[nid]
        return [(lo - lon0) * kx, -(la - lat0) * kz]

    def ring(w):
        pts = [P(n) for n in w["nodes"] if n in nodes]
        if len(pts) > 2 and pts[0] == pts[-1]:
            pts = pts[:-1]
        return pts

    out = {"region": region, "name": cfg["name"],
           "origin": {"lat": round(lat0, 6), "lon": round(lon0, 6), "how": how, "note": o["note"]},
           "axes": "metres; x = east, z = south, y = up. Coordinate arrays are flat [x, z, ...] in decimetres.",
           "bbox": cfg["bbox"], "attribution": "Map data (c) OpenStreetMap contributors, ODbL 1.0",
           "generated": time.strftime("%Y-%m-%d"),
           "buildings": [], "roads": [], "rail": [], "water": [], "rivers": [], "green": [], "parking": [], "trees": [],
           "landmarks": {}}
    stats = {"tag": 0, "levels": 0, "default": 0}

    def add_building(rings_out, t, holes=()):
        h, src = bld_height(t)
        minh = parse_len(t.get("min_height")) or ((float(t["building:min_level"]) * 3.5) if t.get("building:min_level", "").replace(".", "").isdigit() else 0)
        stats[src] += 1
        r = simplify_ring(rings_out, .35)
        if len(r) < 3 or abs(area(r)) < 12:
            return
        b = {"p": flat(r), "h": round(h, 1)}
        if minh:
            b["m"] = round(minh, 1)
        if src == "default":
            b["e"] = 1          # height estimated
        if holes:
            b["holes"] = [flat(x) for x in holes if len(x) > 2]
        kind = t.get("building") or ("part" if "building:part" in t else "yes")
        if kind not in ("yes", "part"):
            b["k"] = kind
        if t.get("building:part"):
            b["part"] = 1
        nm = t.get("name")
        if nm:
            b["n"] = nm
            cx, cz = centroid(r)
            out["landmarks"].setdefault(nm, {"x": round(cx, 1), "z": round(cz, 1), "h": round(h, 1),
                                             "r": round(math.sqrt(abs(area(r)) / math.pi), 1)})
        col = t.get("building:colour") or t.get("roof:colour")
        if col:
            b["c"] = col
        mat = t.get("building:material")
        if mat:
            b["mat"] = mat
        out["buildings"].append(b)

    for w in ways.values():
        t = w.get("tags", {})
        if not t:
            continue
        if "building" in t or "building:part" in t:
            r = ring(w)
            if len(r) > 2:
                add_building(r, t)
        elif "highway" in t:
            if t.get("tunnel") in ("yes", "building_passage") or t["highway"] in ("proposed", "construction", "platform", "elevator", "corridor"):
                continue
            pts = simplify([P(n) for n in w["nodes"] if n in nodes], .5)
            if len(pts) < 2:
                continue
            cls = t["highway"]; wdt = ROAD_W.get(cls, 6)
            lanes = t.get("lanes")
            if lanes and lanes.isdigit() and cls in ("primary", "secondary", "tertiary", "trunk", "residential", "unclassified"):
                wdt = max(wdt, int(lanes) * 3.4 + 3)
            rd = {"p": flat(pts), "c": cls, "w": round(wdt, 1)}
            if t.get("name"):
                rd["n"] = t["name"]
            if t.get("bridge") in ("yes", "viaduct"):
                rd["b"] = int(t.get("layer", "1")) if t.get("layer", "1").lstrip("-").isdigit() else 1
            if t.get("oneway") == "yes":
                rd["o"] = 1
            if t.get("cycleway") or t.get("cycleway:both") or t.get("cycleway:right") or t.get("cycleway:left"):
                rd["bike"] = 1
            out["roads"].append(rd)
        elif "railway" in t:
            pts = simplify([P(n) for n in w["nodes"] if n in nodes], .5)
            if len(pts) > 1:
                out["rail"].append({"p": flat(pts), "b": 1 if t.get("bridge") == "yes" else 0})
        elif t.get("waterway") in ("river", "stream", "canal"):
            pts = simplify([P(n) for n in w["nodes"] if n in nodes], 1)
            if len(pts) > 1:
                out["rivers"].append({"p": flat(pts), "n": t.get("name", ""), "c": t["waterway"]})
        elif t.get("natural") == "water" or t.get("waterway") == "riverbank":
            r = ring(w)
            if len(r) > 2:
                out["water"].append({"p": flat(simplify_ring(r, .8)), "n": t.get("name", "")})
        elif t.get("leisure") in GREEN or t.get("landuse") in GREEN or t.get("natural") in GREEN or t.get("name") == "The Oval":
            r = ring(w)
            if len(r) > 2:
                k = t.get("leisure") or t.get("landuse") or t.get("natural") or "park"
                g = {"p": flat(simplify_ring(r, .8)), "k": k}
                if t.get("name"):
                    g["n"] = t["name"]
                out["green"].append(g)
        elif t.get("amenity") == "parking" and t.get("parking") not in ("multi-storey", "underground"):
            r = ring(w)
            if len(r) > 2:
                out["parking"].append({"p": flat(simplify_ring(r, .8))})

    # multipolygon relations (buildings and water) - stitch outer and inner members into rings
    for rel in rels:
        t = rel.get("tags", {})
        outers, inners = [], []
        for m in rel.get("members", []):
            if m["type"] == "way" and m["ref"] in ways:
                (inners if m.get("role") == "inner" else outers).append([n for n in ways[m["ref"]]["nodes"] if n in nodes])
        def stitch(segs):
            segs = [s for s in segs if len(s) > 1]; rings_ = []
            while segs:
                cur = segs.pop(0)
                while cur[0] != cur[-1]:
                    for i, s in enumerate(segs):
                        if s[0] == cur[-1]: cur += s[1:]
                        elif s[-1] == cur[-1]: cur += s[::-1][1:]
                        elif s[-1] == cur[0]: cur = s[:-1] + cur
                        elif s[0] == cur[0]: cur = s[::-1][:-1] + cur
                        else: continue
                        segs.pop(i); break
                    else:
                        break
                pts = [P(n) for n in cur]
                if len(pts) > 3:
                    rings_.append(pts[:-1] if pts[0] == pts[-1] else pts)
            return rings_
        o_r, i_r = stitch(outers), stitch(inners)
        if "building" in t:
            for r in o_r:
                add_building(r, t, holes=[h for h in i_r if abs(area(h)) < abs(area(r))])
        elif t.get("natural") == "water":
            for r in o_r:
                out["water"].append({"p": flat(simplify_ring(r, .8)), "n": t.get("name", ""),
                                     "holes": [flat(h) for h in i_r]})
        elif t.get("leisure") in GREEN:
            for r in o_r:
                out["green"].append({"p": flat(simplify_ring(r, .8)), "k": t["leisure"], "n": t.get("name", "")})

    # named water and green areas are landmarks too (Mirror Lake, the Oval, parks)
    for layer in ("water", "green"):
        for f in out[layer]:
            if f.get("n"):
                xs = f["p"][0::2]; zs = f["p"][1::2]
                out["landmarks"].setdefault(f["n"], {"x": round(sum(xs) / len(xs) / 10, 1), "z": round(sum(zs) / len(zs) / 10, 1), "h": 0,
                                                     "r": round(math.sqrt(abs(area([[xs[i] / 10, zs[i] / 10] for i in range(len(xs))])) / math.pi), 1)})
    # named river centerlines are landmarks too: OSM riverbank polygons are often unnamed, so without this the
    # Scioto and Olentangy would be missing. The point is the part of the river nearest the region's origin.
    by_name = {}
    for f in out["rivers"]:
        if f.get("n"):
            by_name.setdefault(f["n"], []).extend(zip(f["p"][0::2], f["p"][1::2]))
    for nm, pts in by_name.items():
        x, z = min(pts, key=lambda q: q[0] * q[0] + q[1] * q[1])
        span = max(math.hypot((a[0] - b[0]) / 10, (a[1] - b[1]) / 10) for a, b in ((pts[0], q) for q in pts))
        if nm not in out["landmarks"]:
            out["landmarks"][nm] = {"x": round(x / 10, 1), "z": round(z / 10, 1), "h": 0, "r": round(span / 2, 1), "line": 1}
    for e in named_pts:
        nm = e["tags"]["name"]
        if nm in out["landmarks"]:
            continue
        la, lo = (e["center"]["lat"], e["center"]["lon"]) if "center" in e else (e["lat"], e["lon"])
        out["landmarks"][nm] = {"x": round((lo - lon0) * kx, 1), "z": round(-(la - lat0) * kz, 1), "h": 0, "r": 0, "point": 1,
                                "tag": next((f"{k}={e['tags'][k]}" for k in ("leisure", "tourism", "historic") if k in e["tags"]), "")}
    for e in els:
        if e["type"] == "node" and e.get("tags", {}).get("natural") == "tree" and e["id"] in nodes:
            x, z = P(e["id"]); out["trees"] += [int(round(x * 10)), int(round(z * 10))]

    out["stats"] = {"buildings": len(out["buildings"]), "heights": stats, "roads": len(out["roads"]), "water": len(out["water"]),
                    "green": len(out["green"]), "trees": len(out["trees"]) // 2, "landmarks": len(out["landmarks"])}
    OUT.mkdir(parents=True, exist_ok=True)
    dest = OUT / f"{region}.json"
    dest.write_text(json.dumps(out, separators=(",", ":")))
    print(f"  {region}: {out['stats']} -> {dest.relative_to(ROOT)} ({dest.stat().st_size / 1e6:.2f} MB), origin by {how}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("step", choices=["fetch", "build", "all"])
    ap.add_argument("regions", nargs="*", help=", ".join(REGIONS))
    ap.add_argument("--raw", help="build from this raw Overpass JSON file (needs exactly one --region)")
    ap.add_argument("--region")
    a = ap.parse_args()
    if a.raw:
        if not a.region:
            sys.exit("--raw needs --region")
        build(a.region, a.raw); return
    regions = a.regions or list(REGIONS)
    for r in regions:
        if r not in REGIONS:
            sys.exit(f"Unknown region {r}. Choose from: {', '.join(REGIONS)}")
    for r in regions:
        if a.step in ("fetch", "all"):
            fetch(r)
        if a.step in ("build", "all"):
            build(r)


if __name__ == "__main__":
    main()
