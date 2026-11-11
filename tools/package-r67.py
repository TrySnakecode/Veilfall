"""Build a light, verifiable Windows archive using only Python's standard library."""
from pathlib import Path
import hashlib
import json
import os
import shutil
import sys
import tempfile
import zipfile

root = Path(__file__).resolve().parents[1]
out = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else root.parent / "entrega_r67"
out.mkdir(parents=True, exist_ok=True)
archive = out / "VEILFALL_R67_CONSTELACAO_WINDOWS.zip"
standalone = out / "VEILFALL_R67.html"
runtime_roots = {"src", "assets", "shared", "server", "tests", "tools", "docs"}
root_files = {"index.html", "VEILFALL.html", "README.md", "LEIA_ME.txt", "package.json",
              "ABRIR_JOGO.bat", "INICIAR_SERVIDOR.bat", "qa-r67.html", "qa-layout-r67.html"}
entries = []
for p in sorted(root.rglob("*")):
    if not p.is_file():
        continue
    rel = p.relative_to(root)
    if any(part.startswith(".") or part in {"node_modules", "__pycache__", "var"} for part in rel.parts):
        continue
    if str(rel).startswith("assets/source/"):
        continue
    if rel.parts[0] in runtime_roots or str(rel) in root_files:
        target = rel
    elif len(rel.parts) == 1 and p.suffix in {".md", ".txt", ".json"}:
        target = Path("docs/history/previous-root") / rel
    else:
        continue
    entries.append((p, "VEILFALL_R67/" + target.as_posix()))

temp = archive.with_suffix(".zip.tmp")
with zipfile.ZipFile(temp, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as z:
    for source, name in entries:
        z.write(source, name)
with temp.open("rb") as f:
    os.fsync(f.fileno())
os.replace(temp, archive)
shutil.copyfile(root / "VEILFALL.html", standalone)

def digest(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None, "CRC failure"
    assert len(set(z.namelist())) == len(entries), "Duplicate archive path"
    assert all(not Path(n).is_absolute() and ".." not in Path(n).parts for n in z.namelist())
    assert z.read("VEILFALL_R67/VEILFALL.html") == standalone.read_bytes()
    with tempfile.TemporaryDirectory(prefix="veilfall-r67-") as tempdir:
        z.extractall(tempdir)
        for source, name in entries:
            assert digest(Path(tempdir) / name) == digest(source), name
        assert (Path(tempdir) / "VEILFALL_R67/ABRIR_JOGO.bat").is_file()

manifest = {
    "revision": 67,
    "entries": len(entries),
    "crc": "passed",
    "full_extraction_byte_comparison": "passed",
    "files": [{"filename": p.name, "bytes": p.stat().st_size, "sha256": digest(p)}
              for p in [archive, standalone]],
}
assert archive.stat().st_size < 45 * 1024 * 1024, "Unexpected archive size"
manifest_path = out / "R67_PRE_UPLOAD.json"
manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
print(json.dumps(manifest, indent=2))
