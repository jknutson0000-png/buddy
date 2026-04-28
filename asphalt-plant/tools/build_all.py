"""Rebuild every output file from current YAML sources."""
from __future__ import annotations

import build_equipment
import build_layout
import build_panel
import build_process
import build_unknowns

if __name__ == "__main__":
    build_panel.main(["--all"])
    build_equipment.main()
    build_process.main()
    build_layout.main(["--all"])
    build_unknowns.main()
