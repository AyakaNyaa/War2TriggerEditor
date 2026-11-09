"""Extract command lengths and labels with references to the audited GMK.

This is an evidence extraction tool, not a Game Maker interpreter.
Variable-length command rules are implemented and tested separately in Rust.
"""
from pathlib import Path
import json
import re
import struct

ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "legacy-audit"


def script(name):
    entries = json.loads((AUDIT / "script-index.json").read_text())
    entry = next(item for item in entries if item["name"] == name)
    raw = (AUDIT / "gmk-streams" / entry["stream"]).read_bytes()
    n = struct.unpack_from("<I", raw, 4)[0]
    return raw[24 + n:].decode("cp1251").replace("\r\n", "\n")


def main():
    text = script("trig")
    cases = {}
    depth, current = 0, None
    for line in text.splitlines():
        match = re.match(r"case (\d+):", line.strip())
        if depth == 1 and match:
            current = int(match[1])
            cases[current] = []
        if current is not None:
            cases[current].append(line)
        # The audited script's braces on these lines are structural.
        depth += line.count("{") - line.count("}")
    order = re.findall(r"^(\w+)\(0\)", script("INIT_LISTS"), flags=re.M)
    offset = 0
    for name in order:
        if name == "LTN":
            break
        match = re.search(r"LSZ=(\d+)", script(name))
        offset += int(match[1])
    labels = {}
    for locale, filename in (("en", "w2tedit_eng.lang"), ("ru", "w2tedit_rus.lang")):
        lines = (AUDIT / "source" / filename).read_bytes().decode("cp1251").splitlines()[1:]
        labels[locale] = lines[offset:offset + 141]
    catalog = []
    for opcode in range(128):
        code = "\n".join(cases.get(opcode, []))
        sizes = set(map(int, re.findall(r"^b=(\d+)\s*$", code, flags=re.M)))
        length = next(iter(sizes)) if len(sizes) == 1 else None
        if opcode == 0:
            length = 1
        if opcode in (6, 37, 120, 121, 122, 123):
            length = None
        catalog.append({"opcode": opcode, "length": length,
                        "name_key": f"command.{opcode}", "source": "GMK:trig"})
    dest = ROOT / "schemas/commands"
    dest.mkdir(parents=True, exist_ok=True)
    # One generated record per line, deliberately readable and below 500 lines.
    (dest / "legacy-1.6.1.json").write_text(
        "[\n" + ",\n".join(json.dumps(row) for row in catalog) + "\n]\n", encoding="utf-8")
    for locale in ("en", "ru"):
        dest = ROOT / f"apps/frontend/src/locales/{locale}"
        dest.mkdir(parents=True, exist_ok=True)
        data = {f"command.{i}": labels[locale][i] for i in range(128)}
        (dest / "commands.json").write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    groups = {"LU": "unit", "LP": "player", "LS": "comparison", "LR": "parameter",
              "LG": "stat", "LTU": "operation", "LPR": "resource", "LOR": "order", "LBL": "effect"}
    for locale, filename in (("en", "w2tedit_eng.lang"), ("ru", "w2tedit_rus.lang")):
        lines = (AUDIT / "source" / filename).read_bytes().decode("cp1251").splitlines()[1:]
        offset = 0
        for name in order:
            if name == "LCOL":
                continue
            size = int(re.search(r"LSZ=(\d+)", script(name))[1])
            if name in groups:
                group = groups[name]
                data = {f"{group}.{i}": lines[offset + i] for i in range(size)}
                target = ROOT / f"apps/frontend/src/locales/{locale}/{group}.json"
                target.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            offset += size
    print("Extracted 128 command records. Non-fixed lengths:",
          [row["opcode"] for row in catalog if row["length"] is None])


if __name__ == "__main__":
    main()
