"""Read legacy inputs as data; never executes the legacy application."""
from pathlib import Path
import hashlib
import json
import struct
import zipfile
import zlib
import argparse

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "legacy-audit"
SOURCE = OUT / "source"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archive", type=Path, help="Path to the original War2 Trigger Edit ZIP")
    args = parser.parse_args()
    SOURCE.mkdir(parents=True, exist_ok=True)
    manifest = []
    with zipfile.ZipFile(args.archive) as archive:
        for entry in archive.infolist():
            if entry.is_dir():
                continue
            parts = entry.filename.replace("\\", "/").split("/")[1:]
            if not parts or any(part in ("..", "") for part in parts):
                raise ValueError("Unsafe archive path")
            target = SOURCE.joinpath(*parts)
            target.parent.mkdir(parents=True, exist_ok=True)
            data = archive.read(entry)
            target.write_bytes(data)
            manifest.append({"file": "/".join(parts), "size": len(data),
                             "sha256": hashlib.sha256(data).hexdigest()})
    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    report = []
    for path in sorted(SOURCE.rglob("*")):
        if not path.is_file():
            continue
        data = path.read_bytes()
        report.append(f"\nFILE {path.relative_to(SOURCE)} size={len(data)}")
        if path.suffix == ".pud":
            offset = 0
            while offset + 8 <= len(data):
                tag = data[offset:offset + 4]
                length = struct.unpack_from("<I", data, offset + 4)[0]
                if offset + 8 + length > len(data):
                    report.append(f"INVALID CHUNK at {offset}: {tag!r} size={length}")
                    break
                report.append(f"{offset:6} {tag!r} size={length}")
                offset += 8 + length
            report.append(f"parsed={offset} total={len(data)} remaining={len(data)-offset}")
        elif path.suffix in (".w2tr", ".gmk"):
            report.append(f"head={data[:80].hex(' ')}")
        if path.suffix == ".gmk":
            found = []
            for offset in range(len(data) - 2):
                if data[offset] != 0x78 or data[offset + 1] not in (0x01, 0x9c, 0xda, 0x5e):
                    continue
                try:
                    dec = zlib.decompressobj()
                    raw = dec.decompress(data[offset:], 16_000_000)
                    if not dec.eof:
                        continue
                    consumed = len(data) - offset - len(dec.unused_data)
                    found.append({"offset": offset, "compressed": consumed, "raw": len(raw)})
                    dest = OUT / "gmk-streams" / f"{offset:08d}.bin"
                    dest.parent.mkdir(exist_ok=True)
                    dest.write_bytes(raw)
                except zlib.error:
                    continue
            report.append(f"zlib_streams={len(found)}")
            (OUT / "gmk-streams.json").write_text(json.dumps(found), encoding="utf-8")
    (OUT / "binary-report.txt").write_text("\n".join(report), encoding="utf-8")
    print("\n".join(report))
    scripts = OUT / "evidence"
    scripts.mkdir(exist_ok=True)
    index = []
    for stream in sorted((OUT / "gmk-streams").glob("*.bin")):
        data = stream.read_bytes()
        if len(data) < 28 or data[:4] != b"\x01\0\0\0":
            continue
        name_size = struct.unpack_from("<I", data, 4)[0]
        if name_size > 128 or 24 + name_size > len(data):
            continue
        if struct.unpack_from("<I", data, 16 + name_size)[0] != 800:
            continue
        code_size = struct.unpack_from("<I", data, 20 + name_size)[0]
        if 24 + name_size + code_size != len(data):
            continue
        name = data[8:8 + name_size].decode("ascii")
        code = data[24 + name_size:].decode("cp1251").replace("\r\n", "\n")
        index.append({"name": name, "stream": stream.name, "lines": len(code.splitlines())})
        if name in ("load", "save", "load_tr", "save_tr"):
            (scripts / f"{name}.gml").write_text(code, encoding="utf-8")
        else:
            for number, start in enumerate(range(0, len(code.splitlines()), 450), 1):
                part = code.splitlines()[start:start + 450]
                (scripts / f"{name}.part{number}.gml").write_text("\n".join(part), encoding="utf-8")
    (OUT / "script-index.json").write_text(json.dumps(index, indent=2), encoding="utf-8")
    print("SCRIPTS:", json.dumps(index))


if __name__ == "__main__":
    main()
