"""Build a layout map (SVG + PDF + legend md) from a layout YAML.

Source format (one file per map, e.g. layout/inside.yaml):

    name: "Inside layout"
    canvas: { width: 1200, height: 800, units: "px" }
    background_image: null   # optional path to a sketch photo to underlay
    rooms:
      - id: office
        label: "Office"
        shape: rect
        x: 50
        y: 50
        w: 200
        h: 150
      - id: lab
        label: "Lab"
        shape: poly
        points: [[260,50],[460,50],[460,200],[260,200]]
    items:
      - id: P-MCC1
        label: "MCC-1"
        kind: panel
        x: 120
        y: 100
        ref: { panel: "MCC-1" }
      - id: M-DRYER
        label: "M-DRYER"
        kind: motor
        x: 800
        y: 600
        ref: { equipment_tag: "M-DRYER" }

Items render as colored circles by `kind`. The legend lists every
item with its tag, panel, and breaker (when set in equipment YAML).
"""
from __future__ import annotations

import sys
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.graphics import renderPDF
from svglib.svglib import svg2rlg

from lib import REPO_ROOT, fmt, load_yaml, md_kv_block, md_table, write_md

KIND_COLORS = {
    "panel": "#1F3864",
    "motor": "#C0504D",
    "drive": "#9B59B6",
    "process": "#2E7D32",
    "transformer": "#F39C12",
    "scale": "#16A085",
    "controller": "#7F8C8D",
    "other": "#444444",
}


def _equipment_index() -> dict[str, dict]:
    src = REPO_ROOT / "equipment" / "equipment.yaml"
    if not src.exists():
        return {}
    data = load_yaml(src)
    return {it.get("tag"): it for it in (data.get("items") or []) if it.get("tag")}


def _process_index() -> dict[str, dict]:
    src = REPO_ROOT / "process" / "process.yaml"
    if not src.exists():
        return {}
    data = load_yaml(src)
    return {it.get("tag"): it for it in (data.get("items") or []) if it.get("tag")}


def render_svg(data: dict) -> str:
    canvas = data.get("canvas") or {}
    w = int(canvas.get("width", 1200))
    h = int(canvas.get("height", 800))
    parts = [
        f'<?xml version="1.0" encoding="UTF-8"?>',
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">',
        '<style>',
        '.room{fill:#FAFAFA;stroke:#333;stroke-width:2}',
        '.room-label{font:bold 16px sans-serif;fill:#222}',
        '.item-label{font:11px sans-serif;fill:#111}',
        '.title{font:bold 22px sans-serif;fill:#111}',
        '.subtitle{font:12px sans-serif;fill:#555}',
        '</style>',
        f'<text x="20" y="30" class="title">{escape(str(data.get("name", "Layout")))}</text>',
        f'<text x="20" y="48" class="subtitle">canvas {w}x{h} {escape(str(canvas.get("units","px")))}</text>',
    ]

    bg = data.get("background_image")
    if bg:
        parts.append(f'<image href="{escape(str(bg))}" x="0" y="0" width="{w}" height="{h}" opacity="0.35"/>')

    for room in data.get("rooms") or []:
        label = escape(str(room.get("label", room.get("id", ""))))
        if room.get("shape") == "poly":
            pts = " ".join(f"{p[0]},{p[1]}" for p in (room.get("points") or []))
            parts.append(f'<polygon class="room" points="{pts}"/>')
            xs = [p[0] for p in room.get("points") or []]
            ys = [p[1] for p in room.get("points") or []]
            cx = sum(xs) / len(xs) if xs else 0
            cy = sum(ys) / len(ys) if ys else 0
            parts.append(f'<text x="{cx}" y="{cy}" text-anchor="middle" class="room-label">{label}</text>')
        else:
            x, y = room.get("x", 0), room.get("y", 0)
            rw, rh = room.get("w", 100), room.get("h", 100)
            parts.append(f'<rect class="room" x="{x}" y="{y}" width="{rw}" height="{rh}"/>')
            parts.append(f'<text x="{x + rw/2}" y="{y + 18}" text-anchor="middle" class="room-label">{label}</text>')

    for item in data.get("items") or []:
        kind = item.get("kind", "other")
        color = KIND_COLORS.get(kind, KIND_COLORS["other"])
        x, y = item.get("x", 0), item.get("y", 0)
        label = escape(str(item.get("label", item.get("id", ""))))
        parts.append(f'<circle cx="{x}" cy="{y}" r="9" fill="{color}" stroke="#000" stroke-width="1"/>')
        parts.append(f'<text x="{x + 12}" y="{y + 4}" class="item-label">{label}</text>')

    legend_x, legend_y = 20, h - 20 - 18 * len(KIND_COLORS)
    parts.append(f'<rect x="{legend_x - 6}" y="{legend_y - 16}" width="160" height="{18 * len(KIND_COLORS) + 12}" fill="#FFFFFFCC" stroke="#888"/>')
    parts.append(f'<text x="{legend_x}" y="{legend_y - 2}" class="subtitle">Legend</text>')
    for i, (k, c) in enumerate(KIND_COLORS.items()):
        cy = legend_y + 14 + i * 18
        parts.append(f'<circle cx="{legend_x + 6}" cy="{cy - 4}" r="6" fill="{c}" stroke="#000" stroke-width="0.5"/>')
        parts.append(f'<text x="{legend_x + 18}" y="{cy}" class="item-label">{k}</text>')

    parts.append('</svg>')
    return "\n".join(parts)


def build(layout_yaml: Path) -> None:
    data = load_yaml(layout_yaml)
    name = fmt(data.get("name", layout_yaml.stem))
    out_dir = layout_yaml.parent
    stem = layout_yaml.stem

    svg_path = out_dir / f"{stem}.svg"
    pdf_path = out_dir / f"{stem}.pdf"
    md_path = out_dir / f"{stem}.md"

    svg = render_svg(data)
    svg_path.write_text(svg)

    drawing = svg2rlg(str(svg_path))
    if drawing is not None:
        renderPDF.drawToFile(drawing, str(pdf_path))

    eq = _equipment_index()
    proc = _process_index()
    legend_rows: list[list[str]] = []
    for item in data.get("items") or []:
        ref = item.get("ref") or {}
        eq_tag = ref.get("equipment_tag")
        proc_tag = ref.get("process_tag")
        panel = ref.get("panel")
        source_panel = ""
        source_breaker = ""
        if eq_tag and eq_tag in eq:
            source_panel = fmt(eq[eq_tag].get("source_panel"))
            source_breaker = fmt(eq[eq_tag].get("source_breaker"))
        elif proc_tag and proc_tag in proc:
            source_panel = fmt(proc[proc_tag].get("source_panel"))
            source_breaker = fmt(proc[proc_tag].get("source_breaker"))
        legend_rows.append([
            fmt(item.get("label", item.get("id"))),
            fmt(item.get("kind")),
            fmt(panel or eq_tag or proc_tag),
            source_panel or "TBD",
            source_breaker or "TBD",
        ])

    md_parts = [f"# {name}", "",
                md_kv_block("Map", [("Source", layout_yaml.name),
                                    ("SVG", svg_path.name),
                                    ("PDF", pdf_path.name)]),
                "## Legend / item index", ""]
    md_parts.append(md_table(["Label", "Kind", "Tag/Panel", "Source panel", "Breaker"], legend_rows)
                    if legend_rows else "_no items placed yet_")
    write_md(md_path, "\n".join(md_parts))

    print(f"built layout {name}: {svg_path.name}, {pdf_path.name}, {md_path.name}")


def main(argv: list[str]) -> None:
    layout_root = REPO_ROOT / "layout"
    if argv and argv[0] != "--all":
        for arg in argv:
            p = Path(arg)
            if not p.is_absolute():
                p = (REPO_ROOT / arg).resolve()
            build(p)
        return
    for f in sorted(layout_root.glob("*.yaml")):
        build(f)


if __name__ == "__main__":
    main(sys.argv[1:])
