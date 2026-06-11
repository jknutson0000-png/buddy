"""Build the motor / drive equipment list from equipment/equipment.yaml."""
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
    "Location (room / zone)",
    "Type",
    "Mfr",
    "Model",
    "HP",
    "FLA",
    "V",
    "Ph",
    "RPM",
    "SF",
    "Code",
    "Frame",
    "Drive",
    "Drive tag",
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
        location,
        fmt(item.get("type")),
        fmt(item.get("mfr")),
        fmt(item.get("model")),
        fmt(item.get("hp")),
        fmt(item.get("fla")),
        fmt(item.get("voltage")),
        fmt(item.get("phase")),
        fmt(item.get("rpm")),
        fmt(item.get("sf")),
        fmt(item.get("code_letter")),
        fmt(item.get("frame")),
        fmt(item.get("drive_type")),
        fmt(item.get("drive_tag")),
        fmt(item.get("source_panel")),
        fmt(item.get("source_breaker")),
        fmt(item.get("status")),
        verified_tag(item.get("verified")),
        fmt(item.get("notes")),
    ]


def main() -> None:
    src = REPO_ROOT / "equipment" / "equipment.yaml"
    if not src.exists():
        print(f"no source yet: {src}")
        return
    data = load_yaml(src)
    items = data.get("items") or []
    rows = [row(it) for it in items]

    title = "Motor & drive equipment list"
    header_blocks: list[tuple[str, list[tuple[str, str]]]] = [
        ("Summary", [
            ("Items logged", str(len(items))),
            ("Verified", str(sum(1 for it in items if it.get("verified") is True))),
            ("Assumed / unverified", str(sum(1 for it in items if it.get("verified") is not True))),
        ]),
    ]

    out_md = REPO_ROOT / "equipment" / "equipment.md"
    out_xlsx = REPO_ROOT / "equipment" / "equipment.xlsx"
    out_pdf = REPO_ROOT / "equipment" / "equipment.pdf"

    md_parts = [f"# {title}", ""]
    for block_title, kvs in header_blocks:
        md_parts.append(md_kv_block(block_title, kvs))
    md_parts.append("## Items")
    md_parts.append("")
    md_parts.append(md_table(COLUMNS, rows) if rows else "_no equipment logged yet_")
    write_md(out_md, "\n".join(md_parts))

    write_xlsx(out_xlsx, title, header_blocks, "Items", COLUMNS, rows)
    write_pdf(out_pdf, title, header_blocks, "Items", COLUMNS, rows, landscape_page=True)
    print(f"built equipment list: {out_md}, {out_xlsx}, {out_pdf}")


if __name__ == "__main__":
    main()
