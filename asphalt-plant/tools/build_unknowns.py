"""Scan all YAML sources and regenerate unknowns.md.

An unknown = any field that is missing, blank, or literally "TBD",
or any record with verified != true.
"""
from __future__ import annotations

from pathlib import Path

from lib import REPO_ROOT, load_yaml, md_table, write_md

PANEL_FIELDS = ["manufacturer", "model", "voltage", "phase", "wire",
                "mains_amps", "fed_from", "location_room", "location_zone"]
BREAKER_FIELDS = ["poles", "trip_amps", "frame", "model", "conductor",
                  "load_served", "status"]
EQUIP_FIELDS = ["mfr", "model", "hp", "fla", "voltage", "phase", "rpm",
                "sf", "code_letter", "frame", "drive_type",
                "source_panel", "source_breaker", "location_room",
                "location_zone", "status"]
PROC_FIELDS = ["mfr", "model", "voltage", "phase", "kw", "amps",
               "source_panel", "source_breaker", "location_room",
               "location_zone", "status", "type"]


def _is_unknown(v) -> bool:
    if v is None:
        return True
    s = str(v).strip()
    return s == "" or s.upper() == "TBD"


def _missing(item: dict, fields: list[str]) -> list[str]:
    return [f for f in fields if _is_unknown(item.get(f))]


def _verified_warn(item: dict) -> str:
    return "" if item.get("verified") is True else "ASSUMED"


def collect() -> list[list[str]]:
    rows: list[list[str]] = []

    for panel_dir in sorted((REPO_ROOT / "panels").iterdir()) if (REPO_ROOT / "panels").exists() else []:
        if not panel_dir.is_dir():
            continue
        src = panel_dir / "panel.yaml"
        if not src.exists():
            continue
        data = load_yaml(src)
        panel_name = data.get("name") or panel_dir.name
        miss = _missing(data, PANEL_FIELDS)
        if miss or _verified_warn(data):
            rows.append([
                "panel",
                str(panel_name),
                "panel-level",
                ", ".join(miss) or "verified=false",
                _verified_warn(data),
                str(src.relative_to(REPO_ROOT)),
            ])
        for b in data.get("breakers") or []:
            bm = _missing(b, BREAKER_FIELDS)
            if bm or _verified_warn(b):
                rows.append([
                    "breaker",
                    str(panel_name),
                    f"pos {b.get('position', '?')} ({b.get('load_served', '?')})",
                    ", ".join(bm) or "verified=false",
                    _verified_warn(b),
                    str(src.relative_to(REPO_ROOT)),
                ])

    eq_src = REPO_ROOT / "equipment" / "equipment.yaml"
    if eq_src.exists():
        for it in (load_yaml(eq_src).get("items") or []):
            miss = _missing(it, EQUIP_FIELDS)
            if miss or _verified_warn(it):
                rows.append([
                    "equipment",
                    str(it.get("tag") or "?"),
                    str(it.get("description") or ""),
                    ", ".join(miss) or "verified=false",
                    _verified_warn(it),
                    str(eq_src.relative_to(REPO_ROOT)),
                ])

    proc_src = REPO_ROOT / "process" / "process.yaml"
    if proc_src.exists():
        for it in (load_yaml(proc_src).get("items") or []):
            miss = _missing(it, PROC_FIELDS)
            if miss or _verified_warn(it):
                rows.append([
                    "process",
                    str(it.get("tag") or "?"),
                    str(it.get("description") or ""),
                    ", ".join(miss) or "verified=false",
                    _verified_warn(it),
                    str(proc_src.relative_to(REPO_ROOT)),
                ])

    return rows


def main() -> None:
    rows = collect()
    out = REPO_ROOT / "unknowns.md"
    parts = ["# Open unknowns", "",
             f"_{len(rows)} item(s) need data or verification._", ""]
    if rows:
        parts.append(md_table(
            ["Scope", "Tag/Panel", "Detail", "Missing fields", "Flag", "Source file"],
            rows,
        ))
    else:
        parts.append("_nothing open right now_")
    write_md(out, "\n".join(parts))
    print(f"unknowns: {len(rows)} open -> {out}")


if __name__ == "__main__":
    main()
