# Asphalt plant electrical map

Living documentation for the plant inventory: every panel, breaker, motor,
drive, process load, and where each piece physically lives.

## Ground rules

- **Source of truth is YAML.** `.md`, `.xlsx`, `.pdf`, and `.svg` files are
  generated from it so the formats can never drift.
- **Never fabricate nameplate data.** Missing values are written as blank or
  `TBD` and show up in `unknowns.md` until verified.
- **Verified vs assumed.** Every record has a `verified:` flag. Set it to
  `true` only when you've confirmed it in the field (photo of nameplate, eyes
  on the panel, etc.). `false` means assumed / unconfirmed and will be flagged.

## Layout

```
asphalt-plant/
├── panels/                 one folder per panel
│   └── <PANEL-NAME>/
│       ├── panel.yaml          (source)
│       ├── schedule.md
│       ├── schedule.xlsx
│       └── schedule.pdf
│   └── _panel.template.yaml    copy this when starting a new panel
├── equipment/
│   ├── equipment.yaml          motors + drives source
│   ├── equipment.md / .xlsx / .pdf
├── process/
│   ├── process.yaml            heaters, controllers, scales, transformers
│   ├── process.md / .xlsx / .pdf
├── layout/
│   ├── site-overview.yaml + .svg + .pdf + .md
│   ├── inside.yaml         + .svg + .pdf + .md
│   ├── outside.yaml        + .svg + .pdf + .md
├── inbox/                  raw photos and sketches
├── tools/                  build scripts
├── unknowns.md             auto-generated punch list of missing data
└── README.md
```

## Build commands

Run from inside `asphalt-plant/`:

```
# rebuild everything (panels, equipment, process, layouts, unknowns)
python3 tools/build_all.py

# rebuild one panel
python3 tools/build_panel.py panels/MCC-1
# or every panel
python3 tools/build_panel.py --all

# rebuild equipment list
python3 tools/build_equipment.py

# rebuild process list
python3 tools/build_process.py

# rebuild layouts
python3 tools/build_layout.py --all

# regenerate the unknowns punch list from current YAML state
python3 tools/build_unknowns.py
```

## Source schemas (cheat sheet)

### Panel — `panels/<NAME>/panel.yaml`

See `panels/_panel.template.yaml` for the fully-commented template.
Top-level: `name`, `manufacturer`, `model`, `voltage`, `phase`, `wire`,
`mains_amps`, `fed_from`, `location_room`, `location_zone`, `verified`,
`notes`. Then `breakers:` is a list, one entry per position with
`position`, `poles`, `trip_amps`, `frame`, `model`, `conductor`,
`load_served`, `status` (active/spare/removed/planned), `verified`, `notes`.

### Equipment — `equipment/equipment.yaml`

`items:` list. Per motor/drive: `tag`, `description`, `location_room`,
`location_zone`, `type`, `mfr`, `model`, `hp`, `fla`, `voltage`, `phase`,
`rpm`, `sf`, `code_letter`, `frame`, `drive_type`, `drive_tag`,
`source_panel`, `source_breaker`, `status`, `verified`, `notes`.

### Process — `process/process.yaml`

`items:` list. Per non-motor load: `tag`, `description`, `type`
(heater/controller/scale/transformer/other), `location_room`,
`location_zone`, `mfr`, `model`, `voltage`, `phase`, `kw`, `amps`,
`source_panel`, `source_breaker`, `status`, `verified`, `notes`.

### Layout — `layout/<map>.yaml`

`canvas` sets the SVG viewport. `rooms` are rect or poly outlines.
`items` are placed by `x,y` and reference equipment / panel tags so
the legend stays in sync with the rest of the docs.

## Workflow when new data comes in

1. Drop photos / sketches in `inbox/`.
2. Update the relevant YAML file(s).
3. Run `python3 tools/build_all.py`.
4. Commit. The generated `.md` / `.xlsx` / `.pdf` / `.svg` go in too so
   anyone can read them straight from GitHub or download for the field.
