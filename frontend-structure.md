# frontend-structure.md

## Project Directory Structure (Full Overview)

This is the **complete directory structure** for the AI-Finance Svelte 5 SPA.

```
AI-finance/
├── public/                         # Static assets (favicons, images, etc.)
├── src/
│   ├── main.js                     # App entry point (mounts Svelte app)
│   ├── App.svelte                  # Root component (routing, auth, layout)
│   ├── app.css                     # Global CSS imports (Tailwind, theme)
│   ├── app.d.ts                    # Global TypeScript declarations
│   │
│   ├── app/                        # App-level shims & navigation helpers
│   │   ├── navigation.ts           # Programmatic navigation helpers
│   │   └── stores.js               # Page/URL reactive store
│   │
│   ├── assets/                     # Static assets imported by components
│   │
│   ├── components/                 # Shared/reusable Svelte components
│   │   ├── DashboardNotebookLM.svelte
│   │   └── icons/                  # Icon components
│   │
│   ├── lib/                        # Core libraries & business logic
│   │   ├── api/                    # HTTP client & API modules
│   │   │   ├── base/               # HTTP base client, interceptors
│   │   │   ├── modules/            # Per-domain API modules (auth, chat, etc.)
│   │   │   ├── mock/               # Mock API data for development
│   │   │   └── index.ts            # API barrel export
│   │   ├── components/             # Lib-level reusable components
│   │   │   └── common/             # Common UI components (Toast, etc.)
│   │   ├── constants/              # App-wide constants & route definitions
│   │   ├── i18n/                   # Internationalization
│   │   │   ├── locales/            # Translation files (en.json, vi.json)
│   │   │   ├── config.ts           # i18n configuration
│   │   │   ├── store.ts            # Reactive locale store
│   │   │   ├── translator.ts       # Translation function logic
│   │   │   └── index.ts            # i18n barrel export (initLanguage, t)
│   │   ├── models/                 # TypeScript interfaces & types
│   │   ├── services/               # Business logic services
│   │   ├── stores/                 # Svelte stores (lib-level)
│   │   ├── router/                 # Router utilities
│   │   └── utils/                  # Utility functions
│   │
│   ├── pages/                      # Page-level components (one folder per page)
│   │   ├── login/
│   │   ├── not-found/
│   │   ├── settings/
│   │   ├── token-usage-chart/
│   │   └── workspace/
│   │
│   ├── routes/                     # Route definitions
│   │   └── definitions.js
│   │
│   ├── stores/                     # App-level Svelte stores
│   │   ├── auth.js
│   │   ├── chat.js
│   │   ├── dashboard.js
│   │   ├── router.js
│   │   ├── websocket.js
│   │   ├── workspace.js
│   │   └── attachments.js
│   │
│   ├── styles/                     # Theme & design tokens
│   │   └── theme/
│   │       ├── tokens.css          # CSS custom properties (design tokens)
│   │       └── light.css           # Light theme overrides
│   │
│   └── utils/                      # App-level utility functions
│
├── AGENTS.md                       # ← Main agent instruction file
├── frontend-structure.md           # ← This file
├── frontend-best-practices.md
├── frontend-api-sync.md
├── codebase.md
├── index.html                      # Vite HTML entry
├── vite.config.js                  # Vite + Svelte + Tailwind config
├── svelte.config.js                # Svelte compiler config
├── jsconfig.json                   # Path aliases & JS config
├── package.json
├── .env.example                    # Environment variable template
└── README.md
```

## Quick Reference: Where to Put New Files

| Type of file                  | Folder                                |
|-------------------------------|---------------------------------------|
| New page                      | `src/pages/<page-name>/`              |
| Shared/reusable component     | `src/components/`                     |
| Common UI component (Toast…)  | `src/lib/components/common/`          |
| Icon component                | `src/components/icons/`               |
| API module                    | `src/lib/api/modules/`                |
| Service (business logic)      | `src/lib/services/`                   |
| TypeScript model/interface    | `src/lib/models/`                     |
| Svelte store (app-level)      | `src/stores/`                         |
| Route definition              | `src/routes/definitions.js`           |
| Translation keys              | `src/lib/i18n/locales/en.json` & `vi.json` |
| CSS theme tokens              | `src/styles/theme/`                   |
| App constants                 | `src/lib/constants/`                  |
| Utility function              | `src/lib/utils/` or `src/utils/`      |
| Static assets                 | `public/` or `src/assets/`            |

## Path Aliases

Defined in `vite.config.js` and `jsconfig.json`:

| Alias              | Resolves to                        |
|--------------------|------------------------------------|
| `$lib`             | `./src/lib`                        |
| `$app/navigation`  | `./src/app/navigation.ts`          |
| `$app/stores`      | `./src/app/stores.js`              |

**This file is referenced by AGENTS.md.**
