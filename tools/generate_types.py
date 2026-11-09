"""Generate small TypeScript DTO files from the Rust-owned OpenAPI contract."""
from pathlib import Path
import json
import subprocess

ROOT = Path(__file__).resolve().parents[1]


def ts_type(schema):
    if "$ref" in schema:
        return schema["$ref"].rsplit("/", 1)[-1]
    for keyword in ("anyOf", "oneOf", "allOf"):
        if keyword in schema:
            joiner = " & " if keyword == "allOf" else " | "
            return "(" + joiner.join(ts_type(s) for s in schema[keyword]) + ")"
    kind = schema.get("type")
    if isinstance(kind, list):
        return " | ".join(ts_type({**schema, "type": item}) for item in kind)
    if "enum" in schema:
        return " | ".join(json.dumps(value) for value in schema["enum"])
    if kind == "array":
        return f"Array<{ts_type(schema['items'])}>"
    if kind == "object":
        required = schema.get("required", [])
        fields = [f"  {json.dumps(key)}{'' if key in required else '?'}: {ts_type(value)};"
                  for key, value in schema.get("properties", {}).items()]
        return "{\n" + "\n".join(fields) + "\n}"
    return {"integer": "number", "number": "number", "string": "string",
            "boolean": "boolean", "null": "null"}.get(kind, "unknown")


def main():
    result = subprocess.run(["cargo", "run", "--quiet", "--locked", "--offline", "-p",
                             "app-api", "--example", "export_schema"], cwd=ROOT,
                            capture_output=True, text=True, encoding="utf-8", check=True)
    schema = json.loads(result.stdout)
    destination = ROOT / "schemas/api"
    destination.mkdir(parents=True, exist_ok=True)
    (destination / "openapi.json").write_text(json.dumps(schema, separators=(",", ":")) + "\n", encoding="utf-8")
    types = schema["components"]["schemas"]
    destination = ROOT / "apps/frontend/src/shared/generated"
    destination.mkdir(parents=True, exist_ok=True)
    for name, definition in types.items():
        text = ts_type(definition)
        refs = sorted({n for n in types if n != name and n in text.replace('"', '').split()})
        # Schema references can occur inside Array<...>, not just as separate words.
        import re
        refs = sorted(set(re.findall(r"\b(?:" + "|".join(types) + r")\b", text)) - {name})
        imports = "".join(f"import type {{ {ref} }} from './{ref}';\n" for ref in refs)
        output = f"// Generated from Rust OpenAPI. Run python tools/generate_types.py.\n{imports}export type {name} = {text};\n"
        assert len(output.splitlines()) <= 500
        (destination / f"{name}.ts").write_text(output, encoding="utf-8")
    (destination / "index.ts").write_text("".join(
        f"export type {{ {name} }} from './{name}';\n" for name in sorted(types)), encoding="utf-8")
    print(f"Generated {len(types)} DTOs from Rust OpenAPI.")


if __name__ == "__main__":
    main()
