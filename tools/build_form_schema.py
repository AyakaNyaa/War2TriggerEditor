"""Translate audited GMK field declarations into bounded, typed form metadata."""
from pathlib import Path
import ast
import json
import operator
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
from extract_catalog import script

TYPES = {
    0: (None, 1), 2: ("player", 15), 3: ("unit", 110), 4: ("stat", 151),
    5: ("comparison", 5), 6: ("parameter", 59), 7: ("resourceChange", 5),
    8: ("spell", 18), 9: ("upgrade", 6), 10: ("buff", 4), 11: ("player", 7),
    12: ("playerLocal", 8), 13: ("unit", 104), 14: ("unit", 106),
    15: ("resourceKind", 2), 16: ("rune", 8), 17: ("operation", 27),
    18: (None, 4294967295), 20: ("restrictionKind", 3), 21: ("allowedUnit", 31),
    22: ("allowedUpgrade", 31), 23: ("allowedSpell", 31), 24: ("stat", 151),
    25: ("movement", 3), 26: ("order", 60), 27: ("resource", 2),
    28: ("terrain", 2), 33: ("controller", 2),
}


def number(expression):
    node = ast.parse(expression.split("//")[0].strip(), mode="eval").body
    def evaluate(item):
        if isinstance(item, ast.Constant) and type(item.value) is int:
            return item.value
        if isinstance(item, ast.BinOp) and type(item.op) in (ast.Add, ast.Sub, ast.Mult):
            return {ast.Add: operator.add, ast.Sub: operator.sub, ast.Mult: operator.mul}[type(item.op)](
                evaluate(item.left), evaluate(item.right))
        raise ValueError("Not a literal arithmetic declaration")
    return evaluate(node)


def main():
    forms = json.loads((ROOT / "schemas/commands/legacy-forms.json").read_text())
    output = []
    for form in forms:
        fields = []
        for field in form["fields"]:
            try:
                kind = number(field["T"])
                if kind not in TYPES and kind != 1:
                    continue
                group, maximum = TYPES.get(kind, (None, number(field.get("mx", "255"))))
                width = number(field.get("bb", "4" if kind == 18 else "1"))
                offset = number(field["b"])
                if kind != 1 and kind != 18:
                    width = 1
                label = field.get("tu", "")
                match = re.fullmatch(r"lstr\((\d+)\)", label)
                key = f"legacy.{match[1]}" if match else "argument"
                if label.strip('"\'') in ("X", "Y", "X1", "Y1", "X2", "Y2"):
                    key = label.strip('"\'').lower().replace("1", "")
                if group == "player": key = "player"
                if group == "unit": key = "unit"
                if match and match[1] == "28": key = "flag"
                if match and match[1] == "9": key = "variable"
                fields.append({"offset": offset, "width": width, "min": number(field.get("mn", "0")),
                               "max": maximum, "key": key, "group": group})
            except (KeyError, ValueError, SyntaxError):
                continue
        output.append({"opcode": form["opcode"], "fields": fields})
    (ROOT / "schemas/commands/form-fields.json").write_text(
        "[\n" + ",\n".join(json.dumps(item) for item in output) + "\n]\n", encoding="utf-8")
    order = re.findall(r"^(\w+)\(0\)", script("INIT_LISTS"), flags=re.M)
    segments, offset = {}, 0
    for name in order:
        if name == "LCOL": continue
        size = int(re.search(r"LSZ=(\d+)", script(name))[1])
        segments[name] = (offset, size)
        offset += size
    for locale, filename in (("ru", "w2tedit_rus.lang"), ("en", "w2tedit_eng.lang")):
        lines = (ROOT / "legacy-audit/source" / filename).read_bytes().decode("cp1251").splitlines()[1:]
        data = {f"legacy.{i}": text for i, text in enumerate(lines[offset:])}
        for group, segment in {"resourceChange": "LJ", "spell": "LM", "upgrade": "LD", "buff": "LB",
                               "rune": "LTR", "restrictionKind": "LAT", "allowedUnit": "LATU",
                               "allowedUpgrade": "LATP", "movement": "LMT", "terrain": "LTT", "controller": "LCONT"}.items():
            start, size = segments[segment]
            data.update({f"{group}.{i}": value for i, value in enumerate(lines[start:start + size])})
        start, _ = segments["LJ"]
        data.update({f"resourceKind.{i}": lines[start + i] for i in range(3)})
        start, _ = segments["LP"]
        data.update({f"playerLocal.{i}": lines[start + (16 if i == 8 else i)] for i in range(9)})
        data.update({f"allowedSpell.{i}": f"{i + 1}" for i in range(32)})
        # Separate files keep every catalogue below 500 lines without minifying source.
        for name, records in (("legacy-labels", {k: v for k, v in data.items() if k.startswith("legacy.")}),
                              ("legacy-options", {k: v for k, v in data.items() if not k.startswith("legacy.")})):
            (ROOT / f"apps/frontend/src/locales/{locale}/{name}.json").write_text(
                json.dumps(records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Converted {len(output)} source-backed forms; detail-label base: {offset}.")


if __name__ == "__main__":
    main()
