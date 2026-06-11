"""Build the process equipment list from process/process.yaml.

Covers heaters, controllers, scales, transformers, and other non-motor loads.
"""
from __future__ import annotations

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

COLUMNS = [
    "Tag",
    "Description",
    "Type",
    "Location (room / zone)",
    "Mfr",
    "Model",
    "V",
    "Ph",
    "kW",
    "Amps",
    "Source panel",
    "Brkr",
    "Status",
    "Verified",
    "Notes",
]


def row(item: dict) -> list[str]:
    location = " / ".join(x for x in [fmt(item.get("location_room")), fmt(item.get("location_zone"))] if x and x != "TBD") or "TBD"
    return [
        fmt(item.get("tag")),
        fmt(item.get("description")),
        fmt(item.get("type")),
        location,
        fmt(item.get("mfr")),
        fmt(item.get("model")),
        fmt(item.get("voltage")),
        fmt(item.get("phase")),
        fmt(item.get("kw")),
        fmt(item.get("amps")),
        fmt(item.get("source_panel")),
        fmt(item.get("source_breaker")),
        fmt(item.get("status")),
        verified_tag(item.get("verified")),
        fmt(item.get("notes")),
    ]


def main() -> None:
    src = REPO_ROOT / "process" / "process.yaml"
    if not src.exists():
        print(f"no source yet: {src}")
        return
    data = load_yaml(src)
    items = data.get("items") or []
    rows = [row(it) for it in items]

    title = "Process equipment list"
    header_blocks: list[tuple[str, list[tuple[str, str]]]] = [
        ("Summary", [
            ("Items logged", str(len(items))),
            ("Verified", str(sum(1 for it in items if it.get("verified") is True))),
            ("Assumed / unverified", str(sum(1 for it in items if it.get("verified") is not True))),
        ]),
    ]

    out_md = REPO_ROOT / "process" / "process.md"
    out_xlsx = REPO_ROOT / "process" / "process.xlsx"
    out_pdf = REPO_ROOT / "process" / "process.pdf"

    md_parts = [f"# {title}", ""]
    for block_title, kvs in header_blocks:
        md_parts.append(md_kv_block(block_title, kvs))
    md_parts.append("## Items")
    md_parts.append("")
    md_parts.append(md_table(COLUMNS, rows) if rows else "_no process equipment logged yet_")
    write_md(out_md, "\n".join(md_parts))

    write_xlsx(out_xlsx, title, header_blocks, "Items", COLUMNS, rows)
    write_pdf(out_pdf, title, header_blocks, "Items", COLUMNS, rows, landscape_page=True)
    print(f"built process equipment list: {out_md}, {out_xlsx}, {out_pdf}")


if __name__ == "__main__":
    main()
