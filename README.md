# SonicField Studio

**SonicField Studio** — стартовый Spec Kit-пакет для разработки веб-приложения, которое генерирует красивые звуковые/математические паттерны и экспортирует результат в **растр** и **вектор**.

Проект собран под workflow GitHub Spec Kit:

1. Constitution
2. Specify
3. Plan
4. Tasks
5. Implement

## Что внутри

```txt
.specify/
  memory/constitution.md
  templates/agent-context.md

specs/
  001-sonicfield-studio/
    spec.md
    plan.md
    tasks.md
    research.md
    data-model.md
    quickstart.md
    checklists/requirements.md
    contracts/preset.schema.json
    contracts/export.schema.json

docs/
  product-vision.md
  renderer-architecture.md
  export-rules.md

prompts/
  speckit-commands.md
  implementation-prompt.md

app/
src/
package.json
tailwind.config.ts
tsconfig.json
```

## Главная идея

Приложение должно иметь **один общий simulation engine**, который считает точки, линии, кривые и геометрию паттерна, и два независимых renderer/export слоя:

- **Raster mode** — realtime preview через WebGL/Three.js и экспорт PNG.
- **Vector mode** — нативная генерация SVG из геометрии, без трассировки растра.

## Быстрый старт для ИИ-агента

Открой проект в Cursor / Claude Code / Codex / Copilot и сначала дай агенту файл:

```txt
prompts/implementation-prompt.md
```

Затем попроси работать строго по:

```txt
.specify/memory/constitution.md
specs/001-sonicfield-studio/spec.md
specs/001-sonicfield-studio/plan.md
specs/001-sonicfield-studio/tasks.md
```

## Если используешь официальный Spec Kit CLI

Можно создать чистый проект через CLI, а затем перенести туда эти файлы:

```bash
specify init sonicfield-studio --integration copilot
cd sonicfield-studio
```

После этого скопируй содержимое этого архива в корень проекта.

Дальше в агенте:

```txt
/speckit.constitution
/speckit.specify
/speckit.plan
/speckit.tasks
/speckit.implement
```

В этом архиве эти документы уже подготовлены вручную, поэтому агент может сразу начать с анализа `tasks.md`.

## Старт Next.js

```bash
npm install
npm run dev
```

Открой:

```txt
http://localhost:3000
```

## Важное ограничение

Не нужно пытаться экспортировать 100 000 частиц в SVG как есть. Для vector mode обязательно использовать:

- лимит плотности;
- sampling;
- simplification;
- path/line/contour представление;
- предупреждение пользователю при слишком тяжёлом SVG.

## MVP

MVP считается готовым, когда пользователь может:

1. Открыть приложение.
2. Увидеть красивый дефолтный паттерн.
3. Менять amplitude, frequency, phase, speed, symmetry, noise, density.
4. Переключать pattern mode.
5. Включать oscillator или загрузить аудио.
6. Экспортировать PNG.
7. Экспортировать SVG.
8. Сохранить/загрузить JSON preset.
