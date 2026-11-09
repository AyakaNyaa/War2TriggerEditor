"""Inspect the exact staged Git snapshot before a public upload.

Report file names and rule names only, never matching credential contents.
"""
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
PATTERNS = {
    "private_key": rb"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----",
    "github_token": rb"(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})",
    "openai_key": rb"sk-(?:proj-|svcacct-)[A-Za-z0-9_-]{20,}",
    "personal_home_path": rb"[A-Za-z]:[\\/]+Users[\\/]",
}


def git(*arguments):
    return subprocess.check_output(["git", *arguments], cwd=ROOT)


def main():
    files = [name for name in git("diff", "--cached", "--name-only", "--diff-filter=ACMRT", "-z").decode().split("\0") if name]
    # Read the staged blobs in one Git process rather than one process per file.
    batch = subprocess.check_output(["git", "cat-file", "--batch"], cwd=ROOT,
        input="".join(f":{name}\n" for name in files).encode())
    offset = 0
    findings = []
    for name in files:
        if name.startswith((".local/", "target/", "builds/", "legacy-audit/gmk-streams/")) or name.endswith(".exe"):
            findings.append((name, "local_only_file"))
        if name.startswith("legacy-audit/source/") and not name.startswith("legacy-audit/source/tr/"):
            findings.append((name, "excluded_original"))
        header_end = batch.index(b"\n", offset)
        header = batch[offset:header_end].split()
        if len(header) != 3 or header[1] != b"blob":
            raise RuntimeError(f"Staged blob is unavailable: {name}")
        size = int(header[2])
        data = batch[header_end + 1:header_end + 1 + size]
        offset = header_end + 1 + size + 1
        if b"\0" in data:
            continue
        if len(data.decode("utf-8-sig").splitlines()) > 500:
            findings.append((name, "over_500_lines"))
        for rule, pattern in PATTERNS.items():
            if re.search(pattern, data):
                findings.append((name, rule))
    print(f"Staged files checked: {len(files)}; findings: {len(findings)}")
    for name, rule in findings:
        print(f"{name}: {rule}")
    return bool(findings)


if __name__ == "__main__":
    raise SystemExit(main())
