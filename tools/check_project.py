"""Enforce line limits and the allowed star-shaped workspace dependencies."""
from pathlib import Path
import sys
import tomllib
import os

ROOT = Path(__file__).resolve().parents[1]
BUILD_DIRS = {"target", "node_modules", "dist", ".git", ".local", "__pycache__"}


def main():
    problems = []
    checked = 0
    paths = []
    for directory, subdirectories, files in os.walk(ROOT):
        relative_directory = Path(directory).relative_to(ROOT)
        subdirectories[:] = [name for name in subdirectories if name not in BUILD_DIRS]
        if relative_directory.parts in (("legacy-audit", "source"), ("legacy-audit", "gmk-streams")):
            subdirectories.clear()
            continue
        paths.extend(Path(directory) / name for name in files)
    for path in paths:
        relative = path.relative_to(ROOT)
        if any(part in BUILD_DIRS for part in relative.parts):
            continue
        raw = path.read_bytes()
        if b"\x00" in raw:
            continue
        try:
            lines = len(raw.decode("utf-8-sig").splitlines())
        except UnicodeDecodeError:
            problems.append(f"Unknown text encoding: {relative}")
            continue
        checked += 1
        if lines > 500:
            problems.append(f"{relative}: {lines} lines (maximum 500)")
    manifests = list((ROOT / "crates").glob("*/Cargo.toml"))
    packages = {tomllib.loads(p.read_text())["package"]["name"] for p in manifests}
    for path in manifests:
        data = tomllib.loads(path.read_text())
        name = data["package"]["name"]
        for section in ("dependencies", "build-dependencies", "dev-dependencies"):
            internal = set(data.get(section, {})) & packages
            allowed = packages - {name} if name == "app-api" else {"contracts"}
            for dependency in internal - allowed:
                problems.append(f"Forbidden direct dependency: {name} -> {dependency}")
    print(f"Checked {checked} project text files; {len(problems)} violations.")
    for problem in problems:
        print(problem)
    return bool(problems)


if __name__ == "__main__":
    sys.exit(main())
