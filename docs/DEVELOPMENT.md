# Сборка и проверки

Проверенная среда: Windows, Rust/Cargo 1.98.1, Node.js 24.19.0, npm 11.17.0.
Для сборки Windows-окна нужны MSVC build tools и Windows SDK.
Для выполнения оконного приложения нужен WebView2 Runtime.

Для запуска без сборки см. [RUN_RU.md](RUN_RU.md).

## Установка и сборка

В корне проекта:

```powershell
python tools/locks.py
npm.cmd ci --prefix apps/frontend --ignore-scripts --no-audit --no-fund
npm.cmd run build --prefix apps/frontend
cargo build --workspace --locked
python tools/check_project.py
```

Сначала собирается frontend: его HTML, JS и CSS встраиваются в EXE.
Результат: `target/debug/war2-editor.exe` и `target/debug/war2-cli.exe`.
Для оптимизированной сборки используйте `cargo build --workspace --locked --release`.

## Ограничение 500 строк

Исходники и конфигурацию не минифицируем ради лимита — разделяем по ответственности.
Для машинных lock-файлов используются стандартные TOML inline tables и JSON.
Это сохраняет все версии, контрольные суммы и зависимости; данные не выбрасываются.
Cargo принимает компактный lock с `--locked`; npm читает компактный package-lock.

При изменении зависимостей:

```powershell
cargo generate-lockfile
python tools/locks.py
python tools/check_project.py
```

После изменения npm-зависимостей также запускается `python tools/locks.py`.
Tauri JSON-схемы приводятся к компактному стандартному JSON в build.rs.
Типы TypeScript генерируются отдельно для каждого DTO, не одним большим файлом.

Проверка охватывает собственные файлы проекта и схемы Tauri.
Она не считает внешние оригиналы из архива, установленные чужие зависимости,
скомпилированные артефакты target/dist и временные локальные результаты.
Это не исключения для исходников или lock-файлов программы.

## Контракт API

Источник истины — Rust DTO и аннотации OpenAPI.
После изменения контрактов:

```powershell
python tools/generate_types.py
npm.cmd run build --prefix apps/frontend
```

Схема находится в `schemas/api/openapi.json`.
Сгенерированные небольшие DTO — в `apps/frontend/src/shared/generated/`.
Запросы frontend сосредоточены в `shared/api.ts`.
Rust-крейты форматов не импортируют друг друга или storage/trigger-engine.
Центральный app-api вызывает их публичные traits из contracts.

## Проверки

```powershell
cargo fmt --all --check
cargo clippy --workspace --all-targets --locked --offline -- -D warnings
cargo test --workspace --locked --offline
python tools/check_project.py
npm.cmd test --prefix apps/frontend
```

Браузерные проверки запускают отдельный локальный сервер и установленный Edge
без видимого окна. Они не используют исходные карты для записи.
Снимки тестовых сеансов и скриншоты хранятся в `.local/`.

Тесты охватывают 14 реальных файлов, no-op roundtrip, точечное изменение,
метаданные имён, неверные длины, маркер внутри строки, неизвестные команды,
условия/циклы, бэкапы, конфликт внешней записи и восстановление сеанса.

## CLI

Для автоматизации запустите отдельный сеанс:

```powershell
$env:WAR2_SESSION_FILE = "$PWD/.local/runtime.json"
$env:WAR2_RECOVERY_DIR = "$PWD/.local/manual-recovery"
target/debug/war2-editor.exe --headless
```

Из другого терминала:

```powershell
target/debug/war2-cli.exe .local/runtime.json inspect "legacy-audit/source/tr/ex/1.w2tr"
target/debug/war2-cli.exe .local/runtime.json validate "legacy-audit/source/tr/ex/1.w2tr"
target/debug/war2-cli.exe .local/runtime.json roundtrip "legacy-audit/source/tr/ex/1.w2tr"
```

runtime.json содержит локальный ключ сеанса. Не публикуйте его.
Сервер завершится по Ctrl+C. Оконный сеанс завершается при закрытии окна.

## Исходный пакет и воспроизведение аудита

В репозитории есть все 14 двоичных примеров из `legacy-audit/source/tr`,
необходимые тестам. Старый EXE, GMK, оригинальные LANG и распакованные
zlib-потоки не нужны для обычной сборки и не включены в Git.
Каталог команд и переводы уже сгенерированы и включены в исходники.

Если у вас есть исходный архив, аудит можно воспроизвести:

```powershell
python audit_package.py "путь/к/Paket_Redaktor_triggerov_dlya_war2.zip"
python inspect_samples.py
python tools/extract_catalog.py
python tools/audit_editor_semantics.py
python tools/build_form_schema.py
```

Сторонние материалы исходного редактора связаны с Edo, а переводческие
каталоги в оригинале указывают Mistral. Они используются как образцы
совместимости и источники сведений, а не как архитектура нового приложения.
