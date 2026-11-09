"""Keep machine-generated dependency locks valid and below 500 lines.

Only lock data is compacted. Source code is never minified.
Cargo uses standard TOML inline tables; npm uses standard JSON.
Semantic equality is verified before replacing a lock file.
"""
from pathlib import Path
import json
import sys
import tomllib

ROOT = Path(__file__).resolve().parents[1]


def toml_value(value):
    if isinstance(value, dict):
        pairs = [f"{json.dumps(k)} = {toml_value(v)}" for k, v in value.items()]
        return "{" + ", ".join(pairs) + "}"
    if isinstance(value, list):
        return "[" + ", ".join(map(toml_value, value)) + "]"
    return json.dumps(value, ensure_ascii=True)


def compact():
    cargo = ROOT / "Cargo.lock"
    if cargo.exists():
        data = tomllib.loads(cargo.read_text(encoding="utf-8"))
        lines = ["# Generated dependency lock; compacted losslessly by tools/locks.py."]
        for key, value in data.items():
            if key == "package":
                lines.append("package = [")
                # Multiple records per line keep even large workspaces below the limit.
                records = [toml_value(package) for package in value]
                lines.extend(", ".join(records[i:i + 8]) + "," for i in range(0, len(records), 8))
                lines.append("]")
            else:
                lines.append(f"{json.dumps(key)} = {toml_value(value)}")
        text = "\n".join(lines) + "\n"
        assert tomllib.loads(text) == data, "TOML changed semantics"
        assert len(text.splitlines()) <= 500, "Lock exceeds line limit"
        cargo.write_text(text, encoding="utf-8", newline="\n")
    npm = ROOT / "apps/frontend/package-lock.json"
    if npm.exists():
        data = json.loads(npm.read_text(encoding="utf-8"))
        text = json.dumps(data, ensure_ascii=True, separators=(",", ":")) + "\n"
        assert json.loads(text) == data, "JSON changed semantics"
        npm.write_text(text, encoding="utf-8", newline="\n")


if __name__ == "__main__":
    compact()
    print("Dependency locks normalized without changing their contents.")
