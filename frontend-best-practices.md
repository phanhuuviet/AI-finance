# frontend-best-practices.md

## Best Practices

### Component Patterns

- Use **Svelte 5 runes** (`$state`, `$derived`, `$effect`) for reactivity in new components.
- Legacy `$:` reactive declarations are acceptable in existing code — do NOT refactor them unless explicitly asked.
- Keep components focused and single-responsibility.
- Page components go in `src/pages/<name>/`, shared components in `src/components/`.

### Styling

- Use **TailwindCSS v4** utility classes as the primary styling approach.
- Use **CSS custom properties** from `src/styles/theme/tokens.css` for design tokens (colors, spacing, etc.).
- Reference tokens via `var(--token-name)` in Tailwind arbitrary values, e.g. `bg-[var(--bg-app)]`.
- Do NOT hardcode color hex values — always use theme tokens for consistency.

### State Management

- Use **Svelte stores** (`writable`, `derived`) for shared state across components.
- App-level stores live in `src/stores/`.
- Lib-level stores live in `src/lib/stores/`.

### API Calls

- Always use the `http` module from `$lib/api` — never use raw `fetch` or import third-party HTTP clients directly.
- API modules are organized per domain in `src/lib/api/modules/`.
- Business logic that combines API calls should live in `src/lib/services/`.

### i18n

- All user-facing text must come from translation files (`src/lib/i18n/locales/en.json` & `vi.json`).
- Use the `t` function (imported from `$lib/i18n`) for translations: `$t("key.path")`.
- Call `initLanguage()` once on app mount (already done in `App.svelte`).

### TypeScript

- Define interfaces and types in `src/lib/models/`.
- Use descriptive model names: `auth.model.ts`, `chat.model.ts`, etc.
- Export all models from `src/lib/models/index.ts`.

### File Naming

- Components: **PascalCase** — `DashboardNotebookLM.svelte`
- Other files: **kebab-case** — `auth.service.ts`, `token-analytics.model.ts`
- Folders: **kebab-case** — `token-usage-chart/`

**This file is referenced by AGENTS.md.**
