# Project Instruction & Structure Guide

> Auto-generated from source code scan. Keep this file updated when making structural changes.

---

## 1. Project Overview

- **Project name**: frontend
- **Purpose**: A client-side AI document chat workspace with authentication, document ingestion (upload/crawl/paste), chat sessions, WebSocket streaming replies, studio output generation, token analytics, and profile settings.
- **Tech stack**: Svelte 5, Vite 8, JavaScript + TypeScript (mixed), Tailwind CSS v4 (via Vite plugin), Chart.js, custom fetch-based HTTP client with interceptors and optional mock fallback.
- **Language**: Bilingual Vietnamese and English (default `vi`) via internal i18n dictionaries.
- **Current version**: 0.0.0

---

## 2. Folder Structure

```text
src/
├── app.css                              # Global CSS entry; imports tokens, Tailwind, and light theme overrides
├── App.svelte                           # Root app shell; bootstraps auth/language/router and conditionally renders login/dashboard
├── main.js                              # Svelte mount entrypoint
├── assets/                              # Static images/icons used by UI
│   ├── hero.png
│   ├── svelte.svg
│   └── vite.svg
├── components/                          # Top-level feature component layer
│   ├── DashboardNotebookLM.svelte       # Main authenticated dashboard shell with sidebar/header/page switching
│   └── icons/
│       └── StudioToolIcon.svelte        # Generic SVG renderer for studio tool icons
├── lib/                                 # Reusable domain/application library modules
│   ├── Counter.svelte                   # Template/demo counter component
│   ├── api/                             # API access layer
│   │   ├── index.ts                     # Interceptor initialization + API exports
│   │   ├── base/                        # Base HTTP and interceptor plumbing
│   │   │   ├── http.ts                  # fetch wrapper with query/body/JSON parsing/error normalization/mock fallback
│   │   │   ├── interceptor.ts           # Request/response/error interceptor registration
│   │   │   ├── request.ts               # Request interceptor contracts and pipeline
│   │   │   └── response.ts              # Response/error interceptor contracts and pipeline
│   │   ├── mock/                        # Mock fallback registry and feature mock handlers
│   │   │   ├── auth.mock.ts
│   │   │   ├── chat.mock.ts
│   │   │   ├── dashboard.mock.ts
│   │   │   ├── mock.registry.ts
│   │   │   └── user.mock.ts
│   │   └── modules/                     # Feature API modules
│   │       ├── auth.api.ts
│   │       ├── chat.api.ts
│   │       ├── dashboard.api.ts
│   │       └── user.api.ts
│   ├── components/
│   │   └── common/                      # Shared form/feedback/overlay UI building blocks
│   │       ├── Button.svelte
│   │       ├── ErrorFallback.svelte
│   │       ├── LoadingBlock.svelte
│   │       ├── ModalDialog.svelte
│   │       ├── RangeSliderField.svelte
│   │       ├── SelectField.svelte
│   │       ├── Skeleton.svelte
│   │       ├── TextareaField.svelte
│   │       └── TextField.svelte
│   ├── i18n/                            # Localization config, store, translator, and locale dictionaries
│   │   ├── config.ts
│   │   ├── index.ts
│   │   ├── store.ts
│   │   ├── translator.ts
│   │   └── locales/
│   │       ├── en.json
│   │       └── vi.json
│   ├── models/                          # Type models for auth/chat/document/studio/analytics/user/ws/workspace
│   │   ├── auth.model.ts
│   │   ├── chat.model.ts
│   │   ├── common.model.ts
│   │   ├── document.model.ts
│   │   ├── index.ts
│   │   ├── studio.model.ts
│   │   ├── token-analytics.model.ts
│   │   ├── user.model.ts
│   │   ├── websocket.model.ts
│   │   └── workspace.model.ts
│   ├── services/                        # Service layer wrapping API modules and shaping payload calls
│   │   ├── auth.service.ts
│   │   ├── chat.service.ts
│   │   ├── dashboard.service.ts
│   │   └── websocket.service.ts
│   ├── stores/                          # Typed Svelte stores (currently minimal/parallel to root stores)
│   │   ├── auth.store.ts
│   │   ├── chat.store.ts
│   │   └── dashboard.store.ts
│   └── utils/                           # Utility helpers (errors/loading/response mapping)
│       ├── error.ts
│       ├── loading.js
│       └── mapper.ts
├── pages/                               # Page-level Svelte screens and workspace feature composition
│   ├── login/
│   │   └── Login.svelte
│   ├── settings/
│   │   └── Settings.svelte
│   ├── token-usage-chart/
│   │   └── TokenUsageChart.svelte
│   └── workspace/
│       ├── WorkspacePanel.svelte
│       └── components/
│           ├── chat/
│           │   ├── ChatHistory.svelte
│           │   └── ChatInterfaceSectioned.svelte
│           ├── document-upload/
│           │   └── DocumentUpload.svelte
│           ├── layout/
│           │   └── ResponsiveWorkspaceLayout.svelte
│           └── studio/
│               ├── StudioPanel.svelte
│               └── modal/
│                   ├── StudioModalAudioOverview.svelte
│                   ├── StudioModalData.svelte
│                   ├── StudioModalMindmap.svelte
│                   ├── StudioModalQuiz.svelte
│                   ├── StudioModalReport.svelte
│                   └── StudioModalVideoOverview.svelte
├── routes/
│   └── definitions.js                   # Client route definitions and route metadata (auth requirement/pattern/build)
├── stores/                              # Active app-level state stores/actions used by pages/components
│   ├── attachments.js
│   ├── auth.js
│   ├── chat.js
│   ├── dashboard.js
│   ├── router.js
│   ├── websocket.js
│   └── workspace.js
├── styles/
│   └── theme/
│       ├── light.css                    # Theme mapping overrides for utility classes + base appearance
│       └── tokens.css                   # Design token source of truth (colors, gradients, radii, shadows, aliases)
└── utils/
    ├── forwardEvents.js                 # Svelte event forwarding action helper
    ├── portal.js                        # DOM portal action
    └── studioIcons.js                   # Studio icon definition map
```

---

## 3. Architecture Overview

This is a Vite + Svelte SPA with manual client-side routing (`src/stores/router.js`) rather than SvelteKit file-based routing. Page and feature components mainly consume root stores in `src/stores`, and stores call service-layer methods in `src/lib/services`, which wrap API modules in `src/lib/api/modules`. HTTP requests go through `src/lib/api/base/http.ts`, which applies interceptors, normalizes API errors, and can route to in-memory mock handlers if enabled. WebSocket messages are handled separately in `websocket.service.ts`, then merged into chat state via store actions. Shared UI primitives are centralized in `src/lib/components/common`, while workspace-specific composition lives under `src/pages/workspace/components`.

```text
Page / Route Component
  ├── Root Store (src/stores/*.js)
  │     ├── Service (src/lib/services/*.ts)
  │     │     └── API Module (src/lib/api/modules/*.ts)
  │     │           └── Base HTTP Client (src/lib/api/base/http.ts + interceptors)
  │     └── WebSocket Service (src/lib/services/websocket.service.ts) -> chat store updates
  └── Common Components (src/lib/components/common/*.svelte)
```

---

## 4. Naming Conventions

| Item | Convention | Example |
|-----------------------|------------------------------|----------------------------------|
| Svelte components | PascalCase file names | `WorkspacePanel.svelte` |
| API module files | kebab-case + `.api.ts` suffix | `dashboard.api.ts` |
| Model files | kebab-case + `.model.ts` suffix | `token-analytics.model.ts` |
| Service files | kebab-case + `.service.ts` suffix | `auth.service.ts` |
| Root store files | kebab-case `.js` | `workspace.js` |
| Library store files | kebab-case + `.store.ts` suffix | `chat.store.ts` |
| Utility files | camelCase or single-word lowercase | `forwardEvents.js`, `portal.js` |
| Route definition file | noun-style lowercase JS file | `definitions.js` |
| Folder names | mostly kebab-case (feature folders) | `token-usage-chart/`, `document-upload/` |
| i18n keys | dot notation namespaces | `workspace.selectConversationHint` |
| Type aliases/interfaces | PascalCase types, camel/snake field names as API-shaped | `ChatSession`, `access_token` |
| CSS variable tokens | kebab-case custom properties | `--color-text-primary`, `--gradient-accent` |
| Environment variables | `VITE_` + UPPER_SNAKE_CASE | `VITE_API_URL` |

---

## 5. Component Guidelines

### 5.1 Common Components (src/lib/components/common/)

| Component | Purpose | Key Props |
|-------------------|--------------------------------|--------------------------------------|
| `Button.svelte` | Reusable button wrapper with variants, sizing, loading state, and event forwarding | `type`, `variant`, `size`, `loading`, `disabled`, `unstyled`, `block`, `className` |
| `TextField.svelte` | Unified input control for text/email/password/file/checkbox/radio with optional wrapper | `type`, `value`, `checked`, `group`, `files`, `label`, `bare`, `unstyled`, `inputClass` |
| `TextareaField.svelte` | Unified textarea control with optional wrapper and labeling | `value`, `rows`, `label`, `bare`, `unstyled`, `textareaClass` |
| `SelectField.svelte` | Unified select control with direct options or slotted options | `value`, `options`, `label`, `placeholder`, `bare`, `unstyled`, `selectClass` |
| `RangeSliderField.svelte` | Styled range slider with min/max labels and display value | `value`, `min`, `max`, `step`, `displayValue`, `minLabel`, `maxLabel` |
| `ModalDialog.svelte` | Portal-based modal shell with overlay, header/body/footer slots, transitions | `isOpen`, `title`, `description`, `accentGradient`, `portalTarget`, `showFooter` |
| `LoadingBlock.svelte` | Multi-row skeleton convenience wrapper | `rows`, `rowHeight`, `active`, `className` |
| `Skeleton.svelte` | Single shimmer placeholder block | `className`, `rounded`, `active` |
| `ErrorFallback.svelte` | Error state block with retry event | `message`, `retryLabel`, `compact` |

Rules for using common components:
- Prefer shared fields/actions (`Button`, `TextField`, `TextareaField`, `SelectField`, `ModalDialog`) in new UI to keep styling and behavior consistent. <!-- inferred -->
- Use `bare`/`unstyled` only when preserving existing layout/class behavior during migration from native elements.
- Keep color/theming references aligned to token variables in `src/styles/theme/tokens.css` and aliases defined there.

### 5.2 Page Components (src/pages/)

- `Login.svelte`, `Settings.svelte`, `TokenUsageChart.svelte`, and `WorkspacePanel.svelte` are full-screen or page-section orchestrators, not low-level reusable primitives.
- Pages primarily consume root stores (`src/stores`) and common components; direct API module imports were not found in page files.
- `WorkspacePanel.svelte` composes workspace subcomponents and switches section UI based on workspace store state.

### 5.3 Workspace Components (src/pages/workspace/components/)

- `chat/`: `ChatHistory.svelte` lists/selects sessions and searches history; `ChatInterfaceSectioned.svelte` renders session messages and sends WebSocket prompts.
- `document-upload/`: `DocumentUpload.svelte` handles file upload, website crawl, mock text paste flow, document table, and attach/delete actions.
- `layout/`: `ResponsiveWorkspaceLayout.svelte` controls desktop/tablet/mobile split behavior and emits mode changes.
- `studio/`: `StudioPanel.svelte` provides studio tool tiles, output list actions (open/rename/download/share/delete), and modal orchestration.
- `studio/modal/`: tool-specific modal forms for `audio_overview`, `video_overview`, `mindmap`, `report`, `quiz`, and `data` creation payloads.

---

## 6. State Management

State is managed with Svelte stores in two layers: active application stores in `src/stores/*.js` and a smaller typed parallel set in `src/lib/stores/*.ts` (currently not the primary app state entrypoints). Components subscribe via `$store` syntax and invoke store methods for async actions. Async loading/error/data patterns are standardized in several stores with `createAsyncState` and delayed loading indicators (`createLoadingGate`).

| Store file | Manages |
|------------------------|---------------------------------|
| `src/stores/auth.js` | Auth user/token state plus login/register/fetch/update/logout actions |
| `src/stores/chat.js` | Chat sessions, current session id, per-session messages, session/message async states |
| `src/stores/dashboard.js` | Documents, token analytics, studio outputs per session, associated async states |
| `src/stores/router.js` | Parsed route state (`page`, `pathname`, `chatId`) and navigation/init logic |
| `src/stores/workspace.js` | Selected session and active workspace section per session |
| `src/stores/attachments.js` | Selected document ids per session (Set-based) and derived current session ids |
| `src/stores/websocket.js` | WebSocket connection status + error |
| `src/lib/stores/auth.store.ts` | Minimal typed auth user writable store |
| `src/lib/stores/chat.store.ts` | Minimal typed chat sessions writable store |
| `src/lib/stores/dashboard.store.ts` | Minimal typed dashboard documents/studio writable stores |

---

## 7. API Layer

### 7.1 Base HTTP Client

- Location: `src/lib/api/base/`
- `http.ts` wraps `fetch` with query serialization, body/header normalization, JSON/text response parsing, typed return values, and standardized `ApiError` conversion.
- Interceptor lifecycle is split into request (`request.ts`) and response/error (`response.ts`) pipelines.
- `interceptor.ts` currently injects bearer token from `localStorage`, leaves a pass-through response hook, and clears token on HTTP 401.

### 7.2 API Modules

| File | Feature | Key functions |
|--------------------|----------------|---------------------------------------|
| `auth.api.ts` | Authentication | `login()`, `register()`, `me()`, `updateMe()` |
| `chat.api.ts` | Chat sessions/messages | `getSessions()`, `createSession()`, `getSessionDetail()` |
| `dashboard.api.ts` | Documents, analytics, studio outputs | `getDocuments()`, `uploadDocument()`, `crawlWebsite()`, `deleteDocument()`, `getTokenUsage()`, `getStudioOutputs()`, `createStudioOutput()`, `renameStudioOutput()`, `deleteStudioOutput()`, `shareStudioOutput()`, `downloadStudioOutput()` |
| `user.api.ts` | User profile | `getProfile()`, `updateProfile()` |

Mock fallback layer:

| File | Purpose |
|--------------------|---------------------------------------|
| `mock.registry.ts` | Registers route regex handlers and resolves fallback payload by method/path |
| `auth.mock.ts` | Mock login/register payloads |
| `chat.mock.ts` | Mock chat sessions/details lifecycle |
| `dashboard.mock.ts` | Mock documents, analytics, studio outputs lifecycle |
| `user.mock.ts` | Mock profile read/update |

### 7.3 Rules

- UI components in this codebase call stores/services; direct imports from `src/lib/api/modules` were not found in scanned `.svelte` files.
- Services (`src/lib/services`) are thin wrappers around API modules and are used by root store action methods.
- API responses are typed via model exports from `src/lib/models` (with some `unknown` passthroughs where payload shape is flexible).

---

## 8. Data Models

| File | Exported types |
|-----------------------|-----------------------------------------|
| `common.model.ts` | `Id`, `ISODateString` |
| `auth.model.ts` | `AuthLoginRequest`, `AuthRegisterRequest`, `AuthLoginResponse` |
| `chat.model.ts` | `ChatRole`, `ChatMessage`, `ChatSession`, `ChatSessionDetail` |
| `document.model.ts` | `DocumentStatus`, `DocumentSourceType`, `DocumentItem` |
| `studio.model.ts` | `StudioOutputType`, `StudioOutputStatus`, `StudioOutput`, `StudioOutputListResponse`, `AttachDocumentsResponse` |
| `token-analytics.model.ts` | `TokenUsageSummary`, `TokenUsageDailyRow`, `TokenUsageAnalytics` |
| `user.model.ts` | `UserPreferences`, `User` |
| `websocket.model.ts` | `WebSocketStatus`, `WsStreamStart`, `WsStreamChunk`, `WsStreamEnd`, `WsMessage`, `WsError`, `WsInboundMessage`, `WsSendMessage` |
| `workspace.model.ts` | `WorkspaceSection`, `WorkspaceStateB`, `SelectedBySession` |
| `index.ts` | Re-exports all model modules plus `Id`/`ISODateString` |

---

## 9. Styling & Theming

- **Approach**: Global CSS + Tailwind utility classes + CSS variable tokens; component-level `<style>` blocks are used sparingly.
- **Design token file**: `src/styles/theme/tokens.css`
- Key token categories include base surfaces/backgrounds, gradients, palette scales (purple/indigo/teal/amber/green/rose/blue), text colors, border colors, radius sizes, semantic aliases (`--color-*`), overlay/shadow tokens, and status colors.
- `src/styles/theme/light.css` remaps many common utility color classes (`bg-gray-*`, `text-gray-*`, etc.) to token variables for consistent theme behavior.
- Global entry: `src/app.css` imports token file, Tailwind, and light theme, and defines base box model/layout utility scaffolding.

---

## 10. Internationalization (i18n)

- Location: `src/lib/i18n/`
- Supported languages: `vi`, `en` (from `SUPPORTED_LANGUAGES`); default language is `vi`.
- Translation dictionaries are nested JSON objects in `src/lib/i18n/locales/en.json` and `src/lib/i18n/locales/vi.json` and are resolved via dot-path keys.
- Language state is persisted to localStorage using key `app.language` and exposed through the `language` store.
- Components consume translations through derived store usage (`$t("namespace.key")`) after importing `t` from `src/lib/i18n`.

---

## 11. Environment Variables

No `.env` or `.env.example` file was found in the workspace scan; variables below are derived from source usage.

| Variable | Purpose | Required |
|-----------------------|--------------------------------|----------|
| `VITE_API_URL` | Base URL for REST HTTP requests in `http.ts` | No (defaults to `http://localhost:8000`) |
| `VITE_WS_URL` | Base URL for WebSocket connection in `websocket.service.ts` | No (defaults to `ws://localhost:8000/chat/ws`) |
| `VITE_USE_MOCK_FALLBACK` | Enables API mock fallback when HTTP calls fail | No (defaults to `true`) |

> ⚠️ Never commit real values. Use local environment files for overrides.

---

## 12. Scripts & Development

| Script | Command | Purpose |
|-----------------|----------------------|---------------------------------|
| `dev` | `vite` | Start local development server |
| `build` | `vite build` | Build production assets |
| `preview` | `vite preview` | Preview production build locally |

---

## 13. Key Conventions & Rules (Quick Reference)

- [ ] Use existing common components (`Button`, `TextField`, `TextareaField`, `SelectField`, `ModalDialog`) for new UI controls before adding raw element variants. <!-- inferred -->
- [ ] Keep route handling in `src/stores/router.js` (manual route parser + history API), not SvelteKit file routes.
- [ ] Route data flow through stores/services: component -> store action -> service -> API module.
- [ ] Keep auth token behavior centralized via API interceptors and auth store/service.
- [ ] Keep async UI state shape consistent (`data`, `loading`, `showLoading`, `error`) as used in chat/dashboard/auth stores.
- [ ] Add/extend domain contracts in `src/lib/models` and consume typed models in API/service layers.
- [ ] Keep translatable UI text in locale dictionaries; use `$t(...)` in components.
- [ ] Use token variables from `src/styles/theme/tokens.css` or aliases in `light.css` for theming consistency.
- [ ] Place new shared primitives under `src/lib/components/common` and feature-specific workspace UI under `src/pages/workspace/components`.

---

## 14. Glossary

| Term | Meaning |
|--------------|----------------------------------------------------------------|
| Workspace | Main authenticated area where chat sessions are selected and tools are used |
| Session / Chat Session | Conversation context identified by `chatId` and used to scope messages, attachments, and studio outputs |
| Studio | Toolset to generate session-scoped outputs (audio/video/mindmap/report/quiz/data) |
| Studio Output | Generated artifact record with type/status/result metadata |
| Documents | Ingested sources (file/website/pasted text flow) that can be attached to a session |
| Attachments | Per-session selected document ids used when sending chat prompts |
| Token Usage Analytics | Time-window summary and daily model usage totals shown in analytics chart/table |
| Mock Fallback | In-memory response fallback used when API requests fail and `VITE_USE_MOCK_FALLBACK` is enabled |
| Route | Parsed client route state (`workspace`, `analytics`, `settings`, `login`) managed by router store |

---

*Last updated: 2026-04-04*
*Generated by: Copilot source scan*

---
