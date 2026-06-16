# frontend-api-sync.md

## Backend Communication

### Architecture

- The backend is a **Python FastAPI** application running separately (default: `http://127.0.0.1:8000`).
- The base URL is configured via the `VITE_API_BASE_URL` environment variable (see `.env.example`).
- This frontend is a **standalone SPA** — it communicates with the backend exclusively via HTTP REST API and WebSocket.

### API Client Structure

```
src/lib/api/
├── base/               # HTTP client setup & interceptors
│   ├── http.ts         # Base HTTP client (wraps fetch/XMLHttpRequest)
│   └── interceptor.ts  # Request/response interceptors (auth tokens, error handling)
├── modules/            # Per-domain API modules
│   ├── auth.api.ts
│   ├── chat.api.ts
│   ├── dashboard.api.ts
│   ├── document.api.ts
│   ├── generation.api.ts
│   ├── composition.api.ts
│   ├── session.api.ts
│   ├── sub.api.ts
│   └── user.api.ts
├── mock/               # Mock data for development/testing
└── index.ts            # Barrel export (http, authApi, chatApi, etc.)
```

### Rules

1. **Always** import API modules from `$lib/api` (barrel export) — never import from `base/` directly.
2. **Never** use raw `fetch()` or install third-party HTTP libraries (e.g. Axios). Use the project's `http` client.
3. When adding a new API domain, create a new file in `src/lib/api/modules/` and export it from `index.ts`.
4. Interceptors handle auth token injection and error handling automatically — do NOT manually attach auth headers in API modules.

### Service Layer

Business logic that orchestrates multiple API calls or transforms data lives in `src/lib/services/`:

| Service                    | Responsibility                         |
|----------------------------|----------------------------------------|
| `auth.service.ts`          | Login, logout, token refresh           |
| `session.service.ts`       | Session CRUD & management              |
| `chat.service.ts`          | Chat message handling                  |
| `dashboard.service.ts`     | Dashboard data aggregation             |
| `document.service.ts`      | Document upload & processing           |
| `generation.service.ts`    | AI content generation                  |
| `composition.service.ts`   | Composition workflows                  |
| `sub.service.ts`           | Subscription management                |
| `websocket.service.ts`     | WebSocket connection & message handling|

### Adding a New API Endpoint

1. Add the endpoint method to the relevant module in `src/lib/api/modules/`.
2. Define request/response types in `src/lib/models/`.
3. If complex orchestration is needed, add a method to the relevant service in `src/lib/services/`.
4. Export from barrel files (`index.ts`).

**This file is referenced by AGENTS.md.**
