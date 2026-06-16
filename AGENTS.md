# AI Agent Rules — AI-Finance Project

## How the Agent Must Read Documentation (MANDATORY)

Before doing **ANY** work, read in this exact order:

1. This file (`AGENTS.md`)
2. `frontend-structure.md` — Project directory structure & where to put new files
3. `frontend-best-practices.md` — Coding conventions & component patterns
4. `frontend-api-sync.md` — API client usage & backend communication
5. `codebase.md` — Naming conventions & data model overview

Quote relevant sections before starting any task.

## Project Overview

**AI-Finance** — A Svelte 5 SPA (Single Page Application) for AI-powered financial analysis.

| Item              | Technology                                          |
|-------------------|-----------------------------------------------------|
| Framework         | **Svelte 5** (runes mode)                           |
| Bundler           | **Vite 8**                                          |
| Styling           | **TailwindCSS v4** + CSS custom properties (tokens) |
| Backend           | **Python FastAPI** (separate repo, API only)        |
| API Client        | Custom `http` module (`src/lib/api/`)               |
| i18n              | Custom i18n store (`src/lib/i18n/`)                 |
| Routing           | Custom client-side router (`src/stores/router.js`)  |
| Charts            | **Chart.js**                                        |
| Markdown Render   | **marked**                                          |
| Rendering         | **CSR** (Client-Side Rendering only, no SSR)        |

## Key Constraints

- This is a **client-side SPA**, NOT a server-rendered app. There is no SSR, no SSG, no PPR.
- There is **no** Next.js, SvelteKit, or any meta-framework involved.
- Styling uses **TailwindCSS v4** utility classes combined with **CSS custom properties** defined in `src/styles/theme/`.
- The backend is **Python FastAPI** running on a separate server. Do NOT reference NestJS, Express, or any Node.js backend.
- API calls go through the custom `http` module in `src/lib/api/`, NOT Axios directly.

**All rules in the documentation files are mandatory.**

**This AGENTS.md is the single source of truth.**
