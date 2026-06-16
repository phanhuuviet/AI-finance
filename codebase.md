# codebase.md

## Naming Conventions

| Item                  | Convention          | Example                              |
|-----------------------|---------------------|--------------------------------------|
| Components (Svelte)   | PascalCase          | `DashboardNotebookLM.svelte`         |
| Pages (folder)        | kebab-case          | `src/pages/token-usage-chart/`       |
| Services              | kebab-case          | `auth.service.ts`                    |
| API modules           | kebab-case          | `dashboard.api.ts`                   |
| Models / Types        | kebab-case file, PascalCase interface | `auth.model.ts` → `LoginRequest` |
| Stores                | camelCase           | `auth.js`, `dashboard.js`           |
| Utility files         | camelCase           | `forwardEvents.js`                   |
| Constants             | UPPER_SNAKE_CASE    | `VITE_API_BASE_URL`                  |

## Important Codebase Rules

1. Use the custom `http` client from `$lib/api` for all API calls — never raw `fetch`.
2. All TypeScript models/interfaces belong in `$lib/models/`.
3. All user-facing text must use the i18n `t()` function — no hardcoded strings.
4. Theme colors are defined as CSS custom properties in `src/styles/theme/` — reference them via `var(--token-name)`.
5. Svelte stores are the primary state management pattern — no external state libraries.

## Data Models Overview

Models are defined in `src/lib/models/` and exported from `index.ts`:

| Model file                  | Domain                                |
|-----------------------------|---------------------------------------|
| `api-response.model.ts`     | Generic API response wrapper          |
| `auth.model.ts`             | Authentication (login, register)      |
| `chat.model.ts`             | Chat messages & conversations         |
| `session.model.ts`          | User sessions                         |
| `document.model.ts`         | Document management                   |
| `generation.model.ts`       | AI generation requests/responses      |
| `composition.model.ts`      | Composition workflows                 |
| `sub.model.ts`              | Subscriptions                         |
| `workspace.model.ts`        | Workspace configuration               |
| `user.model.ts`             | User profile                          |
| `token-analytics.model.ts`  | Token usage analytics                 |
| `websocket.model.ts`        | WebSocket message types               |
| `studio.model.ts`           | Studio features                       |
| `common.model.ts`           | Shared/common types                   |

**This file is referenced by AGENTS.md.**
