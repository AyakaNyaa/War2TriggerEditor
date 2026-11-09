"""Recover source-backed command forms and menu grouping, without executing GMK."""
from pathlib import Path
import json
import re
import struct
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
from extract_catalog import script


def cases(text):
    result, depth, current = {}, 0, None
    for line in text.splitlines():
        match = re.match(r"case (\d+):", line.strip())
        if depth == 1 and match:
            current = int(match[1])
            result[current] = []
        if current is not None:
            result[current].append(line)
        depth += line.count("{") - line.count("}")
    return {key: "\n".join(lines) for key, lines in result.items()}


def main():
    destination = ROOT / "legacy-audit/semantics"
    destination.mkdir(exist_ok=True)
    resources = []
    for path in sorted((ROOT / "legacy-audit/gmk-streams").glob("*.bin")):
        raw = path.read_bytes()
        if len(raw) < 12 or raw[:4] != b"\1\0\0\0":
            continue
        length = struct.unpack_from("<I", raw, 4)[0]
        if not 0 < length < 100:
            continue
        try:
            name = raw[8:8 + length].decode("ascii")
        except UnicodeDecodeError:
            continue
        if not re.fullmatch(r"\w+", name):
            continue
        resources.append({"name": name, "stream": path.name})
        if name.startswith("smsmenu") or name == "drawer":
            chunks = [text.decode("ascii") for text in re.findall(rb"[\t\r\n\x20-\x7e]{24,}", raw)
                      if any(term in text for term in (b"ds_list", b"mmi[", b"global.ret", b"global.DS"))]
            lines = "\n\n".join(chunks).replace("\r\n", "\n").splitlines()
            for number, start in enumerate(range(0, len(lines), 450), 1):
                (destination / f"{name}.{number}.gml").write_text("\n".join(lines[start:start + 450]), encoding="utf-8")
    (destination / "resources.json").write_text("[\n" + ",\n".join(json.dumps(item) for item in resources) + "\n]\n", encoding="utf-8")
    forms = []
    for opcode, code in cases(script("creator")).items():
        fields = []
        for block in re.split(r"o=instance_create\([^\n]+,field\)\s*", code)[1:]:
            props = dict(re.findall(r"^o\.(\w+)=([^\r\n]+)", block, flags=re.M))
            if props:
                fields.append(props)
        forms.append({"opcode": opcode, "fields": fields, "source": "GMK:creator"})
    target = ROOT / "schemas/commands/legacy-forms.json"
    target.write_text("[\n" + ",\n".join(json.dumps(item) for item in forms) + "\n]\n", encoding="utf-8")
    menu = (destination / "smsmenu_trig.1.gml").read_text(encoding="utf-8")
    groups = {}
    for group, opcode in re.findall(r"smi\[(\d+),\d+\]\s*=\s*ds_list_find_value\(drawerO.ltn,(\d+)\)", menu):
        groups.setdefault(int(group), []).append(int(opcode))
    preload = list(map(int, re.findall(r"ds_list_add\(DS,(\d+)\)", (destination / "drawer.1.gml").read_text())))
    metadata = {"groups": groups, "preload": preload, "source": "GMK:smsmenu_trig + drawer.Create"}
    (ROOT / "schemas/commands/legacy-groups.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    print(f"Recovered {len(resources)} named resources and {len(forms)} command forms.")
    print("Menus:", [item["name"] for item in resources if item["name"].startswith("smsmenu")])


if __name__ == "__main__":
    main()
