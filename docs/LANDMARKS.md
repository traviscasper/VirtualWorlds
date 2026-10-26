# Landmark buildings

Signature buildings in the map-based worlds are hand-modelled in `skyship-engine/js/landmarks.js`. Each one finds its own outline in the OpenStreetMap data by name, extrudes the **real footprint** for its base, and adds its signature parts in the footprint's own frame, so it sits exactly where the building is and lines up with the street grid. Any map pieces inside the footprint (unnamed building parts, enclosing complex outlines) are left out so they aren't drawn twice.

Review any of them close up in the building viewer: `tools/qa/gis_viewer.html?region=columbus-downtown&at=LeVeque%20Tower` (or `region=osu-campus`).

## What each model is based on

| Landmark | Modelled features | Source facts used | Approximate / not verified |
|---|---|---|---|
| **LeVeque Tower** (1927) | Cream terra cotta with vertical piers; 18-storey wings over the real footprint; square shaft at the site's south-west corner; three setbacks with sculpture at each; octagonal stage, observation gallery, lantern and dome; lit top; 169 m | 555 ft, 47 floors, cream "oak-bark" glazed terra cotta, 18-storey flanking wings, three sculpted setbacks, square → octagonal crown with observation gallery and dome, tower at the south-west corner (Wikipedia; SAH Archipedia) | Setback heights and shaft width; sculpture shapes are simple stand-ins |
| **Rhodes State Office Tower** (1974) | Red granite with dark glass in vertical strips; 44 m square office block; service cores on the north and east faces; low granite base; antenna mast with ring, helipad, red beacon; 192 m | 629 ft, 41 floors, 144 ft square floors, cores on the north and east, red "Carnelian" granite, dark grey glass, antennas, beacons, helipad (Wikipedia) | Core widths; antenna height |
| **Huntington Center** (1984) | Two imperial-red granite masses linked by bronze glass; two-storey glazed greenhouse crown; 156 m | 512 ft, 37 floors, imperial red granite and bronze glass, "two towers linked by bronze glass", two storeys of greenhouses at the top (Wikipedia; The Clio) | Exact crown shape; slab proportions |
| **Ohio Statehouse** (1861) | Columbus limestone, real 93 × 57 m footprint; Doric porticos with eight columns on both long fronts; windowed drum with a shallow conical roof | Greek Revival; the map footprint (93 × 57 m) matches its well-known 184 × 304 ft size | Cupola height (about 48 m, not checked against a source); column count and portico widths |
| **Nationwide Arena** (2000) | Brick with a stone base and tall arched glazing on the real outline; domed arena roof | "Brick and stone veneer" (Wikipedia) | Window pattern, roof profile and height |
| **Thompson Library** (1913, 1951, 2009) | Beaux-Arts stone front with round-arched windows facing the Oval; low red-tile roof on the original block; ten-storey book tower with glass east and west faces and stone ends; curved glass west atrium | 1913 Beaux-Arts building; 10-storey stacks tower (1951); 2009 renovation replaced the tower's east and west stone walls with glass and added a skylit atrium with a curved glass facade (Wikipedia; Architectural Record) | Tower height (about 53 m assumed: ten storeys above the base); roof material of the original block |
| **Ohio Union** (2010) | Four levels of reddish blended brick with limestone bands and large windows on the real outline; glazed formal entry with limestone frame on High Street | 4 levels; Glen-Gery Albany/Jamestown brick blend; limestone; formal High Street entry on axis with the Great Hall (Landscape Architect) | Entry pavilion size; window rhythm |
| **Orton Hall** (1893) | Romanesque, stone walls banded in stratigraphic order (darker below, lighter above) with round-arched windows; steep slate roof; bell tower with 24 columns at the top and a pyramid roof | Romanesque; Ohio building stones laid in stratigraphic order; bell tower (1915) with 24 columns carrying fossil-animal grotesques (Wikipedia; Orton Geological Museum) | **Tower position** (placed at the footprint corner nearest the Oval); stone colours; roof material |
| **University Hall** (1873, rebuilt 1976) | High Victorian Gothic red brick with stone trim and pointed windows; steep slate roofs; end pavilions; central clock tower over the entrance facing the Oval | High Victorian Gothic; brick exterior and clock tower; centre section with east and west wings (Wikipedia; Eleven Warriors) | Tower height; roof forms |

Also hand-modelled inside the worlds themselves: **Ohio Stadium** (fitted inside its real outline, rotunda at the north end), and in Columbus 2050 the imagined 2050 additions.

**Not modelled:** the William Green Building and COSI. No reliable description of their exteriors was found, so they keep the generic rules rather than an invented design.

## Adding a landmark

1. Add an entry to `LANDMARKS` in `landmarks.js` with a `match` regex for its OpenStreetMap name and a `build(b, F, B, A, M, out)` function. `F` is the footprint's oriented frame (`F.P(u, v)` → world point, `F.w`/`F.d` long/short sides, `F.rot` for boxes, `sideToward(F, dx, dz)` to find which side faces a direction).
2. Draw any new material in `DRAW` (a 512 px canvas, normally four bays × four floors).
3. Push colliders and set `out.at.<id>` = `{ x, z, top, h }` for anchors.
4. Add the id to the world's `buildLandmarks(...)` list and check it in the building viewer.
5. Record the references and what is approximate in this file.
