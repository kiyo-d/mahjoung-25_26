# Repository Guidelines

## Project Structure & Module Organization
House the Python package inside `src/mahjong_ai_const/`, grouped by domain: `features/` for tile encoders, `policy/` for decision helpers, `cli/` for entry points. Shared helpers belong in `src/mahjong_ai_const/utils/` to avoid circular imports. Mirror this layout in `tests/`, keeping fixtures in `tests/fixtures/` and sample workbooks under `tests/data/`. Persist derived constants or JSON tables in `assets/`; stash exploratory notebooks in `notebooks/` and keep raw workbooks in `data/private/` (gitignored). Place repeatable data-munging helpers in `scripts/` with executable permissions.

## Build, Test, and Development Commands
Bootstrap the environment with `python -m pip install -e .[dev]` once `pyproject.toml` is defined; prefer a fresh virtualenv per branch. Quick sanity check: `python -m mahjong_ai_const.cli --help`. Run unit tests via `pytest`, adding `-k fast` during iteration and `--cov=mahjong_ai_const --cov-report=term-missing` before pushing. Format with `ruff format` and lint using `ruff check --fix`; configure both in `pyproject.toml` (or `ruff.toml`) so CI reproduces local results. Optional static analysis: `mypy src/mahjong_ai_const`.

## Coding Style & Naming Conventions
Follow PEP 8 with 4-space indents and descriptive snake_case for functions and modules. Classes and dataclasses use PascalCase, while derived Mahjong constants are UPPER_SNAKE_CASE. Require type hints on all public functions and keep modules focused (<=300 lines). Document edge-case rules (e.g., kuikae, chombo) inline; reserve top-level comments for context that newcomers need to maintain constants safely.

## Testing Guidelines
Name files `test_<module>.py` and tests `test_<behavior>`. Parameterize scenarios covering every yaku, furiten handling, and rank tie-breaker. Use factories or fixtures to build hands; never embed raw workbook rows in tests. Target >=90% line coverage and add regression tests whenever constants or heuristics change. For notebooks, copy any validated calculations into `tests/` so CI protects future refactors.

## Commit & Pull Request Guidelines
Adopt Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`) so changelog tooling stays accurate. Keep commits small, including updated tests/data. PRs must list manual verification commands, link relevant issues, and summarize Mahjong rules touched. Attach terminal snippets or screenshots for CLI-facing changes. Secure review from another contributor before merge to prevent silent scoring regressions.

## Security & Configuration Tips
Do not commit personal game logs; store them under `data/private/` and reference sanitized examples in `assets/`. Keep API keys and spreadsheet paths in `.env`; provide a redacted `.env.example` and load values with `dotenv` or `os.environ`.
