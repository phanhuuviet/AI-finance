# Master Project Instruction

## 1. Project Overview

This repository is a structured frontend application for AI-driven finance workflows. It supports authentication, dashboard analytics, chat-assisted workflows, workspace collaboration, document upload, and studio tools while keeping feature delivery maintainable over time.

Project purpose:
- Provide a modular frontend foundation for AI-finance product features.
- Keep feature development fast without sacrificing architecture quality.
- Enforce consistency across UI, data flow, styling, and i18n.

Primary tech stack:
- Svelte + Vite for UI composition and build tooling.
- TypeScript for API, model, and service layers.
- Store-based state management for cross-view synchronization.
- Centralized API client with interceptors.
- i18n dictionaries and translator utilities.
- Theme tokens and shared design primitives.

Architecture philosophy:
- Layered architecture with strict boundaries.
- Presentation in components/pages, orchestration in services, transport in API modules, contracts in models.
- Reuse-first design for components and styling.
- Small focused modules over large mixed-responsibility files.

Target maintainability goals:
- Predictable structure for all new features.
- Safe, incremental refactoring with low regression risk.
- Clear onboarding for new engineers and new AI sessions.
- Consistent patterns across routes, stores, services, and APIs.

## 2. Project Structure

Reference structure (actual repository includes these areas and feature variations):

```text
src/
├── App.svelte
├── main.js
├── app.css
├── assets/
├── components/
│   ├── DashboardNotebookLM.svelte
│   └── icons/
├── pages/
│   ├── login/
│   ├── settings/
│   ├── token-usage-chart/
│   └── workspace/
│       ├── WorkspacePanel.svelte
│       └── components/
│           ├── chat/
│           ├── document-upload/
│           ├── layout/
│           └── studio/
├── lib/
│   ├── api/
│   │   ├── base/
│   │   ├── mock/
│   │   └── modules/
│   ├── components/
│   │   └── common/
│   ├── i18n/
│   │   └── locales/
│   ├── models/
│   ├── services/
│   ├── stores/
│   └── utils/
├── routes/
├── stores/
├── styles/
│   └── theme/
└── utils/
```

Layer responsibilities (detailed):
- `src/pages/`: Route-level screens and feature composition points. Handles assembly of feature sections and page-local event wiring only.
- `src/pages/**/components/`: Feature-specific UI blocks used by one page domain. Keep logic minimal and focused on rendering/input events.
- `src/components/`: App-wide reusable components and icons outside domain-specific pages.
- `src/lib/components/common/`: Shared UI primitives and form controls (button, modal, skeleton, fields). Must stay generic and reusable.
- `src/lib/models/`: Domain contracts and type definitions for auth, chat, dashboard, user, workspace, studio, websocket, and shared entities.
- `src/lib/api/base/`: HTTP client core, request/response interceptors, and transport abstractions.
- `src/lib/api/modules/`: Domain API modules that call backend endpoints only. No business orchestration.
- `src/lib/api/mock/`: Mock implementations for local development/testing parity with module contracts.
- `src/lib/services/`: Business orchestration and use-case logic. Coordinates APIs, mapping, normalization, and high-level flow rules.
- `src/lib/stores/`: Domain-centric reactive state containers linked to service outputs.
- `src/stores/`: App-level stores tied to routing/session/workspace state and cross-feature wiring.
- `src/lib/i18n/` and `src/lib/i18n/locales/`: Translation setup, locale dictionaries, store integration, and translator utilities.
- `src/styles/theme/`: Design tokens and theme variables as the single source of visual truth.
- `src/routes/`: Route definitions and navigation mapping.
- `src/lib/utils/` and `src/utils/`: Shared helpers, adapters, and utility logic (prefer pure functions).

Boundary map:
- UI layers: `pages`, `components`, `lib/components`
- Domain contracts: `lib/models`
- Data transport: `lib/api`
- Business orchestration: `lib/services`
- State propagation: `lib/stores`, `stores`
- Cross-cutting support: `i18n`, `styles`, `utils`, `routes`

## 3. Architecture Principles

Mandatory architecture rules:
- Enforce strict separation of concerns by layer.
- Keep business rules out of presentational components.
- Use services for orchestration and decision flow.
- Keep API modules transport-only (request/response concerns only).
- Use models as explicit contracts between APIs, services, and stores.
- Prevent circular dependencies across layers.
- Prefer composition over inheritance-like coupling.
- Keep files focused on one responsibility.
- Add abstractions only when they reduce complexity, not to over-engineer.

Allowed dependency direction:
- `components/pages` -> `stores/services`
- `services` -> `api`, `models`, `utils`
- `api` -> `api/base`, `models`
- `stores` -> `services`, `models`

Disallowed patterns:
- `components` directly calling API modules.
- `api` importing UI/store modules.
- `models` containing side effects or network logic.

## 4. Component Conventions

Reusable component standards:
- Build generic, props-driven components.
- Keep shared components page-agnostic.
- Use explicit, descriptive names.
- Keep components small and composable.
- Emit events or callbacks for actions; avoid hidden side effects.
- Prefer controlled inputs via props/stores when feasible.

Atomic/shared component philosophy:
- Primitive components: low-level UI elements (buttons, inputs, skeletons, modal shell).
- Composite shared components: repeatable UI blocks composed from primitives.
- Feature components: page/domain-specific assemblies.
- Page components: route composition and integration points.

Rules for shared libraries:
- No page-specific data fetching in shared components.
- No embedded domain orchestration in primitives.
- Keep visual and behavior defaults predictable.

## 5. API and Data Flow Rules

Canonical flow:

`Component -> Store/Service -> API Module -> Backend -> API Module -> Service -> Store -> Component`

Implementation rules:
- No `fetch` or raw HTTP calls inside components/pages.
- All network communication goes through centralized API base client.
- Use interceptors for auth headers, refresh handling, and response normalization where needed.
- API modules should be deterministic and transport-focused.
- Services own orchestration, fallback strategies, and mapping to UI-friendly models.
- Stores consume service outputs and expose reactive state to UI.
- Every boundary crossing should use typed models/interfaces.
- Handle user-facing error mapping outside presentational components.

Data contract expectations:
- Request/response payloads must be typed.
- Service output shapes should be stable and explicit.
- Mapping logic belongs in services or dedicated mappers, not components.

## 6. Styling and Theme Convention

Styling standards:
- Use design tokens as source of truth for color, spacing, radius, typography, and elevation.
- Do not hardcode visual values in feature components unless unavoidable.
- Keep global theme values centralized in `src/styles/theme/`.
- Prefer reusable class patterns or shared style utilities over one-off styling.
- Keep styles scoped when component-specific; keep tokens/global variables centralized.
- Preserve consistency across pages before introducing custom variants.

Theme behavior:
- Token changes should propagate without refactoring component logic.
- New UI elements should consume existing token categories first.
- Visual exceptions must be documented and intentional.

## 7. Coding Conventions

Naming rules:
- Components: `PascalCase.svelte`
- Services/API/models: descriptive domain naming (e.g., `chat.service.ts`, `chat.api.ts`, `chat.model.ts`)
- Functions/variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE` only for immutable global-style constants
- Folders: lowercase, domain/feature oriented

TypeScript rules:
- Use explicit types/interfaces at architecture boundaries.
- Avoid `any`; if unavoidable, isolate and document it.
- Keep model definitions authoritative and reused across layers.

Import ordering:
- External packages.
- Internal alias-based modules.
- Relative modules.
- Side-effect imports last unless framework requires otherwise.

File responsibility boundaries:
- One file, one core responsibility.
- Do not mix rendering, transport, and orchestration in one module.
- Extract repeated logic into utilities/services/components before duplication spreads.
- Keep public exports minimal and intentional.

## 8. Refactoring Rules for AI

When an AI modifies this repository, it must:
- Not redesign UI unless explicitly asked.
- Not change business behavior unless required by the task.
- Prefer targeted refactor over full rewrites.
- Preserve backward-compatible behavior by default.
- Keep interface contracts stable unless change is requested.
- Update imports, symbol references, and related type usage after edits.
- Minimize diff scope and avoid unrelated churn.
- Respect existing architecture and folder boundaries.
- Add/adjust tests when behavior changes are introduced.

Refactor strategy order:
1. Understand current flow end-to-end.
2. Isolate smallest safe change set.
3. Apply structural cleanup.
4. Verify no cross-layer violations were introduced.

## 9. Prompting Guidelines

Future AI sessions must interpret prompts using this policy:

If user asks for refactor:
- Scan relevant feature, service, API, model, and store files first.
- Identify architecture violations and duplicate logic.
- Apply minimal-risk structural improvements.

If user asks for UI improvement:
- Prioritize token usage, shared component reuse, and consistency.
- Do not redesign layout unless explicitly requested.
- Avoid introducing one-off visual rules that bypass theme.

If user asks for migration:
- Define source and target architecture boundaries.
- Remove legacy pathways in the migrated scope unless phased migration is explicitly requested.
- Ensure imports/contracts are fully updated.

If user asks for bug fix:
- Trace flow from UI to store/service to API and back.
- Fix root cause, not only symptoms.
- Preserve existing contracts unless bug requires contract change.

If user asks for new feature:
- Integrate into existing structure first.
- Add new modules only where responsibility clearly belongs.
- Keep API/service/store/component boundaries explicit.

Global AI behavior expectations:
- Do not perform broad rewrites for narrow requests.
- Keep edits auditable and architecture-compliant.
- Prefer consistency with repository conventions over personal preference.

## 10. Session Context Template

Use this block at the beginning of a new AI session:

```text
You are working inside a structured frontend project.
Follow .github/example.instruction.md strictly.
Respect architecture boundaries across pages/components/services/apis/models/stores.
Do not place business logic in UI components.
Use Component -> Service -> API -> Backend data flow.
Use typed contracts and centralized theme tokens.
Prefer minimal-risk refactoring over rewrites.
Preserve backward behavior unless explicitly asked to change it.
Act as a senior refactoring engineer focused on maintainability.
```

## 11. Maintainability Goals

Long-term repository goals:
- Scalability: add new features/domains without architectural drift.
- Readability: keep modules clear, focused, and easy to review.
- Predictable structure: enforce stable layering and naming conventions.
- Easy onboarding: allow new engineers/AI sessions to understand flow quickly.
- Refactor safety: enable iterative cleanup with low regression risk.
- Operational consistency: keep data flow, styling, and component patterns uniform.
- Sustainable velocity: ship changes quickly while protecting quality boundaries.
