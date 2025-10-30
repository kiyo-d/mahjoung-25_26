from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import List

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
SRC_PATH = PROJECT_ROOT / "src"
if str(SRC_PATH) not in sys.path:
    sys.path.insert(0, str(SRC_PATH))

from mahjong_ai_const.analytics import build_summary


def _discover_workbooks(target: Path) -> List[Path]:
    if target.is_file() and target.suffix.lower() in {".xlsx", ".xlsm", ".xls"}:
        return [target]
    if target.is_dir():
        return sorted(p for p in target.glob("*.xls*") if p.is_file())
    return []


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Collect Mahjong season statistics from Excel workbooks and emit JSON."
    )
    parser.add_argument(
        "input",
        nargs="?",
        default="data",
        help="Excel file or directory containing workbooks (default: data).",
    )
    parser.add_argument(
        "--output",
        "-o",
        type=Path,
        default=Path("dist/data/summary.json"),
        help="Destination JSON path (default: dist/data/summary.json).",
    )
    parser.add_argument(
        "--indent",
        type=int,
        default=2,
        help="Indent level for pretty printed JSON (default: 2).",
    )

    args = parser.parse_args()
    target = Path(args.input)
    workbooks = _discover_workbooks(target)
    if not workbooks:
        raise SystemExit(f"No Excel workbooks found in {target}.")

    seasons = []
    for workbook in workbooks:
        print(f"[info] processing {workbook}")
        seasons.append(build_summary(workbook))

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source": str(target),
        "seasons": seasons,
    }

    output_path = args.output
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=args.indent),
        encoding="utf-8",
    )
    print(f"[info] wrote {output_path.resolve()}")


if __name__ == "__main__":
    main()
