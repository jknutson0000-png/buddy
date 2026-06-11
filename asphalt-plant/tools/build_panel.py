"""Build a panel schedule's md/xlsx/pdf from its panel.yaml.

Usage:
    python3 tools/build_panel.py panels/<panel-dir>
    python3 tools/build_panel.py --all
"""
from __future__ import annotations

import sys
from pathlib import Path

from lib import (
    REPO_ROOT,
    fmt,
    load_yaml,
    md_kv_block,
    md_table,
    verified_tag,
    write_md,
    write_pdf,
    write_xlsx,
)

BREAKER_COLUMNS = [
    "Pos",
    "Poles",
    "Trip (A)",
    "Frame/Model",
    "Conductor",
    "Load served",
    "Status",
    "Verified",
    "Notes",
]


def breaker_row(b: dict) -> list[str]:
    return [
        fmt(b.get("position")),
        fmt(b.get("poles")),
        fmt(b.get("trip_amps")),
        " / ".join(x for x in [fmt(b.get("frame")), fmt(b.get("model"))] if x and x != "TBD") or "TBD",
        fmt(b.get("conductor")),
        fmt(b.get("load_served")),
        fmt(b.get("status")),
        verified_tag(b.get("verified")),
        fmt(b.get("notes")),
    ]


def build(panel_dir: Path) -> None:
    src = panel_dir / "panel.yaml"
    if not src.exists():
        raise SystemExit(f"missing {src}")
    data = load_yaml(src)

    name = fmt(data.get("name"))
    title = f"Panel schedule — {name}"

    header_blocks = [
        ("Panel identity", [
            ("Name", fmt(data.get("name"))),
            ("Manufacturer", fmt(data.get("manufacturer"))),
            ("Model", fmt(data.get("model"))),
            ("Voltage", fmt(data.get("voltage"))),
            ("Phase", fmt(data.get("phase"))),
            ("Wire", fmt(data.get("wire"))),
            ("Mains rating (A)", fmt(data.get("mains_amps"))),
            ("Fed from", fmt(data.get("fed_from"))),
            ("Verified", verified_tag(data.get("verified"))),
        ]),
        ("Location", [
            ("Room", fmt(data.get("location_room"))),
            ("Zone", fmt(data.get("location_zone"))),
        ]),
        ("Notes", [
            ("Notes", fmt(data.get("notes"))),
        ]),
    ]

    breakers = data.get("breakers") or []
    rows = [breaker_row(b) for b in breakers]

    out_md = panel_dir / "schedule.md"
    out_xlsx = panel_dir / "schedule.xlsx"
    out_pdf = panel_dir / "schedule.pdf"

    md_parts = [f"# {title}", ""]
    for block_title, kvs in header_blocks:
        md_parts.append(md_kv_block(block_title, kvs))
    md_parts.append("## Breakers")
    md_parts.append("")
    md_parts.append(md_table(BREAKER_COLUMNS, rows) if rows else "_no breakers logged yet_")
    write_md(out_md, "\n".join(md_parts))

    write_xlsx(out_xlsx, title, header_blocks, "Breakers", BREAKER_COLUMNS, rows)
    write_pdf(out_pdf, title, header_blocks, "Breakers", BREAKER_COLUMNS, rows, landscape_page=True)

    print(f"built {name}: {out_md}, {out_xlsx}, {out_pdf}")


def main(argv: list[str]) -> None:
    if not argv:
        print(__doc__)
        raise SystemExit(2)
    if argv[0] == "--all":
        panels_root = REPO_ROOT / "panels"
        for d in sorted(panels_root.iterdir()):
            if d.is_dir() and (d / "panel.yaml").exists():
                build(d)
        return
    for arg in argv:
        path = Path(arg)
        if not path.is_absolute():
            path = (REPO_ROOT / arg).resolve()
        build(path)


if __name__ == "__main__":
    main(sys.argv[1:])
