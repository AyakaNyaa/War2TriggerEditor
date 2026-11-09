"""Collect envelope observations, without claiming instruction-level validation."""
from pathlib import Path
import json
import struct

ROOT = Path(__file__).resolve().parent / "legacy-audit"
SOURCE = ROOT / "source"


def main():
    report = {"w2tr": [], "pud": [], "languages": []}
    for path in sorted(SOURCE.rglob("*.w2tr")):
        data = path.read_bytes()
        candidates = []
        for marker in (bytes.fromhex("fe ff 00 fd"), bytes.fromhex("fe ed 00 fd")):
            start = 0
            while (pos := data.find(marker, start)) >= 0:
                offset = pos + 4
                names = []
                valid = True
                while offset < len(data):
                    if offset + 3 > len(data):
                        valid = False
                        break
                    var_id, length = struct.unpack_from("<HB", data, offset)
                    offset += 3
                    if offset + length > len(data):
                        valid = False
                        break
                    raw = data[offset:offset + length]
                    names.append({"id": var_id, "length": length, "hex": raw.hex(),
                                  "ascii": raw.decode("ascii", errors="replace")})
                    offset += length
                candidates.append({"offset": pos, "marker": marker.hex(" "),
                                   "metadata_complete": valid, "names": names})
                start = pos + 1
        report["w2tr"].append({"file": path.relative_to(SOURCE).as_posix(),
                               "size": len(data), "candidates": candidates})
    for path in sorted(SOURCE.rglob("*.pud")):
        data = path.read_bytes()
        offset = 0
        chunks = []
        while offset + 8 <= len(data):
            tag, size = struct.unpack_from("<4sI", data, offset)
            payload = data[offset + 8:offset + 8 + size]
            chunks.append({"tag": tag.decode("ascii"), "size": size, "offset": offset})
            if tag == b"OILM":
                oil = payload
            if tag == b"DIM ":
                dims = struct.unpack("<HH", payload)
            offset += 8 + size
        stem = path.stem.rsplit(" v", 1)[0]
        paired = SOURCE / "tr" / f"{stem}.w2tr"
        paired_bytes = paired.read_bytes()
        candidates = [c for row in report["w2tr"] if row["file"] == paired.relative_to(SOURCE).as_posix()
                      for c in row["candidates"] if c["metadata_complete"]]
        comparisons = []
        for candidate in candidates:
            program = paired_bytes[:candidate["offset"] + 2]
            comparisons.append({"marker_offset": candidate["offset"],
                                "program_bytes": len(program),
                                "oil_prefix_equal": oil.startswith(program)})
        report["pud"].append({"file": path.relative_to(SOURCE).as_posix(),
                              "dimensions": dims, "chunks": chunks,
                              "oil_head": oil[:16].hex(" "), "paired_comparison": comparisons})
    for path in sorted(SOURCE.glob("*.lang")):
        data = path.read_bytes()
        try:
            data.decode("utf-8")
            utf8 = True
        except UnicodeDecodeError:
            utf8 = False
        lines = data.decode("cp1251").splitlines()
        report["languages"].append({"file": path.name, "lines": len(lines),
                                    "valid_utf8": utf8, "header_cp1251": lines[0]})
    (ROOT / "sample-observations.json").write_text(json.dumps(report, ensure_ascii=False), encoding="utf-8")
    for row in report["w2tr"]:
        print(row["file"], row["size"], [(c["offset"], c["marker"], c["metadata_complete"], len(c["names"]))
                                                   for c in row["candidates"]])
    for row in report["pud"]:
        print(row["file"], row["dimensions"], row["oil_head"], row["paired_comparison"])
    print(report["languages"])


if __name__ == "__main__":
    main()
