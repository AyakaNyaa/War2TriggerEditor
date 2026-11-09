"""Package the verified Windows binaries and a short local preview guide."""
from pathlib import Path
import hashlib
import json
import shutil
import zipfile

ROOT = Path(__file__).resolve().parents[1]


def main():
    destination = ROOT / "builds/War2TriggerEditor-preview"
    destination.mkdir(parents=True, exist_ok=True)
    for source, target in (("war2-editor.exe", "War2TriggerEditor.exe"), ("war2-cli.exe", "war2-cli.exe")):
        shutil.copy2(ROOT / "target/debug" / source, destination / target)
    shutil.copy2(ROOT / "docs/USER_GUIDE.md", destination / "USER_GUIDE.md")
    shutil.copy2(ROOT / "docs/RUN_RU.md", destination / "RUN_RU.md")
    text = """War2 Trigger Editor — тестовая сборка 0.3.0

Запуск: War2TriggerEditor.exe. Требуются Windows и WebView2 Runtime.
Интерфейс и локальный API встроены; Node.js для запуска не нужен.
Данные не отправляются во внешние сервисы.

Откройте PUD/W2TR или создайте новый сценарий. Выберите элемент каталога,
открыв «Каталог команд». Условие и действия настраиваются в широкой форме
справа; добавьте готовый триггер и сохраните.
Перед записью автоматически создаётся бэкап. Поиск находится сверху.
Подробности — в USER_GUIDE.md.

Технические тесты пройдены. Совместимость с конкретной сборкой War2Combat/
War2Mod ещё требует проверки в игре. Это не финальный релиз.
Часть продвинутых команд пока редактируется числовыми аргументами.
AI, ручной язык и полный редактор ландшафта в эту сборку не входят.
"""
    (destination / "README-RU.txt").write_text(text, encoding="utf-8-sig")
    manifest = [{"file": p.name, "sha256": hashlib.sha256(p.read_bytes()).hexdigest(), "size": p.stat().st_size}
                for p in sorted(destination.iterdir()) if p.is_file() and p.name != "manifest.json"]
    (destination / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    archive = ROOT / "builds/War2TriggerEditor-preview.zip"
    with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED) as output:
        for path in destination.iterdir():
            output.write(path, f"{destination.name}/{path.name}")
    print(f"Preview package: {archive.name} ({archive.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
