******* Example 1
You are a senior frontend engineer implementing a new COMPOSITIONS feature in a Svelte project.

This covers THREE connected tasks:
  1. Replace the old video creation API with a new one (with ordered chunk selection UI)
  2. Add a new "Compositions" tab to the workspace with a list of compositions
  3. Add a composition detail page

Do NOT change any auth, chat, document, or unrelated features.

=====================
BACKEND API CONTRACT
=====================

Base URL: import.meta.env.VITE_API_BASE_URL

--- API 1: CREATE COMPOSITION (replaces old createVideo) ---
POST  /video-maker/compositions
Auth: Bearer token required
Body:
{
  "generation_id": string,
  "chunks": [
    { "chunk_id": string, "transition_name": "basic" }
  ],
  "chunk_ids": [string]
}
Notes:
  - "chunks" = ordered array of selected chunks, in selection ORDER (not index order)
  - "chunk_ids" = flat array of the same chunk ids
  - "transition_name" is always "basic" for now (hardcoded)
  - generation_id comes from $activeGeneration.id on the detail page

--- API 2: GET COMPOSITION LIST ---
GET  /video-maker/compositions?page={page}&limit=20
Auth: Bearer token required
Response data:
{
  "compositions": [
    {
      "id": string,
      "user_id": string,
      "session_id": string,
      "generation_id": string,
      "chunk_ids": string[],
      "chunk_count": number,
      "status": "pending" | "processing" | "completed" | "failed",
      "attempt_count": number,
      "output_s3_url": string | null,
      "presigned_s3_url": string | null,
      "error_message": string | null,
      "created_at": string,
      "updated_at": string
    }
  ],
  "count": number
}
Response pagination: { page, limit, total, totalPages }

--- API 3: GET COMPOSITION DETAIL ---
GET  /video-maker/compositions/{compositionId}
Auth: Bearer token required
Response data:
{
  "composition": { ...same fields as list item... },
  "chunks": [
    {
      "chunk_id": string,        // display label e.g. "chunk_001"
      "sequence": number,        // 1-based order
      "transition_name": string,
      "s3_url": string | null,
      "presigned_s3_url": string | null   // use this for video preview
    }
  ]
}

=====================
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 1 — REPLACE OLD VIDEO CREATION WITH NEW COMPOSITIONS API
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
=====================

STEP 1A — REMOVE OLD VIDEO CREATION

Find and DELETE:
  - Any function createVideo() in generation.service.ts
  - Any function createVideo() in generation.api.ts
  - The isCreatingVideo field from GenerationState in generation.store.ts
  - The isCreatingVideo derived store
  - Any import of createVideo in page components

STEP 1B — CREATE NEW COMPOSITION MODEL

Create: src/lib/models/composition.model.ts

```typescript
export type CompositionStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface CompositionChunkInput {
  chunk_id: string;
  transition_name: string;
}

export interface CreateCompositionRequest {
  generation_id: string;
  chunks: CompositionChunkInput[];
  chunk_ids: string[];
}

export interface Composition {
  id: string;
  user_id: string;
  session_id: string;
  generation_id: string;
  chunk_ids: string[];
  chunk_count: number;
  status: CompositionStatus;
  attempt_count: number;
  output_s3_url: string | null;
  presigned_s3_url: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompositionChunk {
  chunk_id: string;
  sequence: number;
  transition_name: string;
  s3_url: string | null;
  presigned_s3_url: string | null;
}

export interface CompositionListResponse {
  compositions: Composition[];
  count: number;
}

export interface CompositionDetailResponse {
  composition: Composition;
  chunks: CompositionChunk[];
}
```

STEP 1C — CREATE COMPOSITION API MODULE

Create: src/lib/api/modules/composition.api.ts

```typescript
import { http } from '../base/http';
import type {
  CreateCompositionRequest,
  CompositionListResponse,
  CompositionDetailResponse,
} from '$lib/models/composition.model';

export const compositionApi = {
  createComposition: (body: CreateCompositionRequest) =>
    http<Composition>('/video-maker/compositions', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getCompositions: (page: number = 1) => {
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    return http<CompositionListResponse>(`/video-maker/compositions?${params}`);
  },

  getCompositionDetail: (compositionId: string) =>
    http<CompositionDetailResponse>(`/video-maker/compositions/${compositionId}`),
};
```

STEP 1D — CREATE COMPOSITION STORE

Create: src/lib/stores/composition.store.ts

```typescript
import { writable, derived } from 'svelte/store';
import type { Composition, CompositionChunk } from '$lib/models/composition.model';
import type { PaginationMeta } from '$lib/models/api-response.model';

interface CompositionState {
  compositions: Composition[];
  pagination: PaginationMeta | null;
  currentPage: number;
  isLoadingList: boolean;
  isCreating: boolean;
  activeComposition: Composition | null;
  activeChunks: CompositionChunk[];
  isLoadingDetail: boolean;
  error: string | null;
}

export const compositionStore = writable<CompositionState>({
  compositions: [],
  pagination: null,
  currentPage: 1,
  isLoadingList: false,
  isCreating: false,
  activeComposition: null,
  activeChunks: [],
  isLoadingDetail: false,
  error: null,
});

export const compositions          = derived(compositionStore, ($s) => $s.compositions);
export const compositionPagination = derived(compositionStore, ($s) => $s.pagination);
export const compositionCurrentPage = derived(compositionStore, ($s) => $s.currentPage);
export const isCreatingComposition = derived(compositionStore, ($s) => $s.isCreating);
export const activeComposition     = derived(compositionStore, ($s) => $s.activeComposition);
export const activeCompositionChunks = derived(compositionStore, ($s) => $s.activeChunks);
export const isLoadingCompositionDetail = derived(compositionStore, ($s) => $s.isLoadingDetail);
```

STEP 1E — CREATE COMPOSITION SERVICE

Create: src/lib/services/composition.service.ts

```typescript
import { compositionApi } from '$lib/api/modules/composition.api';
import { compositionStore } from '$lib/stores/composition.store';
import { ApiError } from '$lib/api/base/http';
import type { CompositionChunkInput } from '$lib/models/composition.model';

export const compositionService = {

  async createComposition(
    generationId: string,
    orderedChunks: Array<{ id: string }>
  ): Promise<void> {
    compositionStore.update((s) => ({ ...s, isCreating: true, error: null }));
    try {
      const body = {
        generation_id: generationId,
        chunks: orderedChunks.map((c): CompositionChunkInput => ({
          chunk_id: c.id,
          transition_name: 'basic',
        })),
        chunk_ids: orderedChunks.map((c) => c.id),
      };
      await compositionApi.createComposition(body);
      compositionStore.update((s) => ({ ...s, isCreating: false }));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'COMPOSITION_CREATE_FAILED';
      compositionStore.update((s) => ({ ...s, error: message, isCreating: false }));
      throw err;
    }
  },

  async loadCompositions(page: number = 1): Promise<void> {
    compositionStore.update((s) => ({ ...s, isLoadingList: true, error: null, currentPage: page }));
    try {
      const { data, pagination } = await compositionApi.getCompositions(page);
      compositionStore.update((s) => ({
        ...s,
        compositions: data.compositions,
        pagination: pagination ?? null,
        isLoadingList: false,
      }));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'COMPOSITION_LOAD_FAILED';
      compositionStore.update((s) => ({ ...s, error: message, isLoadingList: false }));
    }
  },

  async loadCompositionDetail(compositionId: string): Promise<void> {
    compositionStore.update((s) => ({
      ...s,
      isLoadingDetail: true,
      activeComposition: null,
      activeChunks: [],
      error: null,
    }));
    try {
      const { data } = await compositionApi.getCompositionDetail(compositionId);
      compositionStore.update((s) => ({
        ...s,
        activeComposition: data.composition,
        activeChunks: [...data.chunks].sort((a, b) => a.sequence - b.sequence),
        isLoadingDetail: false,
      }));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'COMPOSITION_DETAIL_FAILED';
      compositionStore.update((s) => ({ ...s, error: message, isLoadingDetail: false }));
    }
  },

  goToPage(page: number): void {
    compositionService.loadCompositions(page);
  },
};
```

STEP 1F — UPDATE CHUNK SELECTION UI ON GENERATION DETAIL PAGE

The generation detail page currently has a checkbox-based multi-select with a "Tạo Video" button.

CHANGE 1 — Replace checkbox multi-select with ORDERED selection:

Old behavior: toggle checkboxes freely, order doesn't matter.
New behavior: clicking a chunk ADDS it to an ordered list. Clicking again REMOVES it.
The ORDER in which the user clicks determines the composition order.

New selection state (replace existing selectedChunkIds Set):
```typescript
// Ordered array — position = selection order
let selectedChunks: GenerationChunk[] = [];

$: isSelected = (id: string) => selectedChunks.some((c) => c.id === id);
$: selectionOrder = (id: string) => {
  const idx = selectedChunks.findIndex((c) => c.id === id);
  return idx === -1 ? null : idx + 1; // 1-based
};
$: allSelected = $generationChunks.length > 0 &&
                 selectedChunks.length === $generationChunks.length;

function toggleChunk(chunk: GenerationChunk) {
  const idx = selectedChunks.findIndex((c) => c.id === chunk.id);
  if (idx === -1) {
    selectedChunks = [...selectedChunks, chunk];
  } else {
    selectedChunks = selectedChunks.filter((c) => c.id !== chunk.id);
  }
}

function toggleAll() {
  if (allSelected) {
    selectedChunks = [];
  } else {
    // Add unselected chunks in index order (preserve current selection order first)
    const alreadySelected = new Set(selectedChunks.map((c) => c.id));
    const newOnes = $generationChunks.filter((c) => !alreadySelected.has(c.id));
    selectedChunks = [...selectedChunks, ...newOnes];
  }
}
```

CHANGE 2 — Show selection ORDER NUMBER badge on each selected chunk card:

Update ChunkCard.svelte to accept:
```svelte
export let selectionOrder: number | null = null;  // null = not selected
```

Replace the plain checkbox with an ORDER BADGE when selected, checkbox when not:

```svelte
<div class="absolute top-3 left-3 z-10">
  {#if selectionOrder !== null}
    <!-- Order badge — shows selection position -->
    <button
      class="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold
             flex items-center justify-center shadow-sm hover:bg-purple-700 transition-colors"
      on:click={() => onToggle(chunk)}
      aria-label="Deselect chunk {chunk.chunk_id}"
    >
      {selectionOrder}
    </button>
  {:else}
    <!-- Unselected: show empty circle -->
    <button
      class="w-6 h-6 rounded-full border-2 border-gray-300 bg-white
             hover:border-purple-400 hover:bg-purple-50 transition-colors"
      on:click={() => onToggle(chunk)}
      aria-label="Select chunk {chunk.chunk_id}"
    ></button>
  {/if}
</div>
```

Card border highlight when selected:
```svelte
<div class="..."
  class:border-purple-400={selectionOrder !== null}
  class:bg-purple-50={selectionOrder !== null}
>
```

Update ChunkCard usage in detail page:
```svelte
{#each $generationChunks as chunk (chunk.id)}
  <ChunkCard
    {chunk}
    selectionOrder={selectionOrder(chunk.id)}
    onToggle={toggleChunk}
  />
{/each}
```

CHANGE 3 — Update "Tạo Video" handler to use new compositionService:

```typescript
import { compositionService } from '$lib/services/composition.service';
import { isCreatingComposition } from '$lib/stores/composition.store';
import { navigate } from '$lib/router/navigate';

async function handleCreateComposition() {
  if (selectedChunks.length === 0 || !$activeGeneration) return;
  try {
    await compositionService.createComposition($activeGeneration.id, selectedChunks);
    showSuccessToast = true;
    selectedChunks = [];
    setTimeout(() => { showSuccessToast = false; }, 3000);
  } catch {
    // error shown from store
  }
}
```

Update button in toolbar to use $isCreatingComposition:
```svelte
disabled={selectedChunks.length === 0 || $isCreatingComposition}
```

Update toolbar counter to show ordered selection count:
```svelte
{selectedChunks.length} / {$generationChunks.length} selected (in order)
```

=====================
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 2 — ADD "COMPOSITIONS" TAB TO WORKSPACE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
=====================

STEP 2A — ADD TAB

Find the workspace tab bar component (currently has: Documents, Chat, Studio).
Add a 4th tab: "Compositions" (or "Videos" if that reads better in context).

The tab must:
  - Appear as the 4th item after Studio
  - Use the same styling as existing tabs (active/inactive states)
  - Set the active tab to 'compositions' when clicked

STEP 2B — COMPOSITIONS TAB CONTENT

When "Compositions" tab is active, call compositionService.loadCompositions(1) in a reactive block or onMount-equivalent (when tab first becomes visible).

Layout — vertical list of composition cards. Each card:

```
┌──────────────────────────────────────────────────────────────┐
│  [VIDEO PLAYER or PLACEHOLDER]                               │
│                                                              │
│  Composition #69da5f5b...                                    │
│  Status: ● Pending   •  1 chunk(s)   •  11/04/2026 14:48   │
└──────────────────────────────────────────────────────────────┘
```

Detailed card layout:

TOP SECTION — Video preview:
  - If presigned_s3_url is NOT null:
    Render <video controls playsinline class="w-full rounded-t-xl max-h-48 bg-black object-contain">
  - If presigned_s3_url IS null:
    Show placeholder panel with status-aware message:
    - "pending"    → gray bg + "⏳ Waiting to process"
    - "processing" → amber bg + "⚙️ Processing..." + spinner
    - "completed"  → green bg + "✅ Ready" (but no URL is unusual — show warning)
    - "failed"     → rose bg + "❌ Failed" + error_message if present

BOTTOM SECTION — Meta info:
  - Short composition ID (last 8 chars): `#${composition.id.slice(-8)}`
  - Status badge (use existing StatusBadge component)
  - chunk_count: "{n} chunk(s)"
  - created_at formatted as "DD/MM/YYYY HH:mm"
  - Clickable → navigate to /workspace/{session_id}/compositions/{composition.id}

Styling (Tailwind):
```svelte
<button
  class="w-full text-left bg-white border border-gray-200 rounded-xl overflow-hidden
         hover:border-purple-300 hover:shadow-sm transition-all duration-150 cursor-pointer"
  on:click={() => navigate(`/workspace/${composition.session_id}/compositions/${composition.id}`)}
>
  <!-- video / placeholder top -->
  <!-- meta bottom section: p-3 flex items-center justify-between gap-2 -->
</button>
```

LOADING STATE: 3 skeleton cards with animate-pulse while isLoadingList is true.
EMPTY STATE: "No compositions yet. Select chunks on a generation and click 'Tạo Video'."

PAGINATION below the list (same minimal Prev / X of Y / Next pattern as other lists, show only when totalPages > 1).

=====================
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 3 — COMPOSITION DETAIL PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
=====================

STEP 3A — ROUTE REGISTRATION

Add this route to src/lib/router/routes.ts inside the :sessionId children array:

```typescript
{
  path: 'compositions/:compositionId',
  private: true,
}
```

STEP 3B — CREATE ROUTE FILE

Create: src/routes/workspace/[sessionId]/compositions/[compositionId]/+page.svelte

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { navigate } from '$lib/router/navigate';
  import { compositionService } from '$lib/services/composition.service';
  import {
    activeComposition,
    activeCompositionChunks,
    isLoadingCompositionDetail,
    compositionStore,
  } from '$lib/stores/composition.store';
  import StatusBadge from '$lib/components/common/StatusBadge.svelte';
  import { formatRelativeDate, formatDuration } from '$lib/utils/format';

  $: sessionId      = $page.params.sessionId;
  $: compositionId  = $page.params.compositionId;

  onMount(() => {
    compositionService.loadCompositionDetail(compositionId);
  });
</script>
```

STEP 3C — PAGE LAYOUT

HEADER:
  - Back button → navigate(`/workspace/${sessionId}`) and switch to Compositions tab
  - Title: "Composition #{id.slice(-8)}"
  - Status badge
  - Meta chips: chunk_count, created_at, generation_id (short)

MAIN CONTENT — two-column layout on large screens, single column on mobile:

LEFT COLUMN (60%) — Full composition video (output):
  ```svelte
  <div class="bg-gray-900 rounded-xl overflow-hidden aspect-video flex items-center justify-center">
    {#if $activeComposition?.presigned_s3_url}
      <video
        src={$activeComposition.presigned_s3_url}
        controls
        playsinline
        class="w-full h-full object-contain"
      ></video>
    {:else}
      <div class="flex flex-col items-center gap-3 text-gray-400 py-16">
        <!-- Status-aware placeholder -->
        {#if $activeComposition?.status === 'pending'}
          <p class="text-sm">⏳ Composition is queued for processing</p>
        {:else if $activeComposition?.status === 'processing'}
          <div class="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full"></div>
          <p class="text-sm text-amber-400">Processing composition...</p>
        {:else if $activeComposition?.status === 'failed'}
          <p class="text-sm text-rose-400">❌ Composition failed</p>
          {#if $activeComposition?.error_message}
            <p class="text-xs text-rose-300">{$activeComposition.error_message}</p>
          {/if}
        {:else}
          <p class="text-sm">Video not yet available</p>
        {/if}
      </div>
    {/if}
  </div>
  ```

RIGHT COLUMN (40%) — Chunk sequence list:
  Title: "Chunks ({$activeCompositionChunks.length})"

  Each chunk item in the sequence:
  ```svelte
  {#each $activeCompositionChunks as chunk (chunk.chunk_id)}
    <div class="flex gap-3 p-3 bg-white border border-gray-100 rounded-xl">
      <!-- Sequence badge -->
      <div class="flex-shrink-0 w-7 h-7 rounded-full bg-purple-600 text-white
                  text-xs font-bold flex items-center justify-center">
        {chunk.sequence}
      </div>

      <!-- Chunk video preview (small) -->
      <div class="flex-shrink-0 w-20 h-14 bg-gray-900 rounded-lg overflow-hidden">
        {#if chunk.presigned_s3_url}
          <video
            src={chunk.presigned_s3_url}
            playsinline
            muted
            loop
            autoplay
            class="w-full h-full object-contain"
          ></video>
        {:else}
          <div class="w-full h-full flex items-center justify-center text-gray-600 text-xs">
            No video
          </div>
        {/if}
      </div>

      <!-- Chunk info -->
      <div class="flex-1 min-w-0">
        <p class="text-xs font-semibold text-gray-700">{chunk.chunk_id}</p>
        <p class="text-xs text-gray-400 mt-0.5">Transition: {chunk.transition_name}</p>
      </div>
    </div>
  {/each}
  ```

Video note for chunk previews: use `autoplay muted loop` for tiny previews (silent looping is fine).
Use `controls` for the main composition video (NOT autoplay).

LOADING STATE: full-page skeleton while isLoadingDetail is true.

=====================
CRITICAL RULES
=====================

1. Selection order is preserved in the `selectedChunks` array — index 0 = first selected, shown as "1".
2. compositionService.createComposition() receives `selectedChunks` (ordered array), NOT a Set.
3. "chunks" in POST body = orderedChunks.map with transition_name "basic". "chunk_ids" = same ids flat.
4. generation_id in POST body comes from $activeGeneration.id — read from generation store.
5. Remove ALL references to old createVideo from generation.service.ts and generation.api.ts.
6. presigned_s3_url is used for video src — NEVER use s3_url or output_s3_url directly.
7. Chunk sequence in detail page is sorted by `sequence` ascending (done in service).
8. The composition detail route must be added to routes.ts (private: true).
9. compositionService and compositionApi are the ONLY source for composition operations.
10. Do NOT autoplay the main composition video — only tiny chunk previews autoplay (muted).

=====================
STRICTLY FORBIDDEN
=====================

- Do NOT keep createVideo() in generation.service.ts or generation.api.ts after this migration
- Do NOT use output_s3_url or s3_url for video src — presigned_s3_url only
- Do NOT autoplay the main composition video player
- Do NOT call compositionApi directly from page components
- Do NOT change chat, document, or generation features

=====================
OUTPUT EXPECTATION
=====================

1. ✅ Old createVideo() removed from generation.service.ts and generation.api.ts.
2. ✅ New compositionService.createComposition() sends ordered chunks with generation_id and transition_name "basic".
3. ✅ Chunk selection on generation detail page shows order number badge (1, 2, 3...) instead of checkbox.
4. ✅ Compositions tab added to workspace — loads from GET /video-maker/compositions.
5. ✅ Each composition card shows video preview (if available), status badge, chunk count, date.
6. ✅ Clicking a composition navigates to /workspace/:sessionId/compositions/:compositionId.
7. ✅ Composition detail page shows: main video player (left), ordered chunk sequence list (right).
8. ✅ presigned_s3_url used for all video elements (main and chunk previews).
9. ✅ Route /workspace/:sessionId/compositions/:compositionId registered in routes.ts as private.

******* Example 2
You are a senior frontend engineer implementing TWO new features on the generation detail page in a Svelte project.

Do NOT change any other page, service, store, or API module outside what is described.
Implement ONLY what is described below, precisely and cleanly.

=====================
BACKEND API CONTRACT
=====================

Base URL: import.meta.env.VITE_API_BASE_URL

--- API 1: REGENERATE CHUNK ---
POST  /video-script-generator/generations/{generationId}/chunks/{chunkId}/regenerate
Auth: Bearer token required
Body: { "feedback": string }
Response: standard envelope — statusCode 200 on success

--- API 2: CREATE VIDEO ---
POST  /video-script-generator/videos
Auth: Bearer token required
Body: [chunkId, chunkId, ...]   ← array of chunk id strings (NOT chunk_id field, use id field)
Status: ⚠️ THIS API IS NOT READY YET
  - Always call the real endpoint.
  - If it fails or returns non-2xx, fall back to a mock success response:
    { statusCode: 200, message: "VIDEO_CREATION_STARTED", data: { queued: true } }
  - Show a success toast/message regardless of real API result for now.

=====================
CONTEXT
=====================

The generation detail page is at:
  /workspace/:sessionId/generations/:generationId

It already shows a list of GenerationChunk cards (from previous implementation).
Each card has: video player (left), chunk_id, target_seconds, narration, status (right).

Both new features are added to this existing page and chunk card component.

The chunk data model already has these fields (do NOT redefine):
  - id: string           ← use this as chunkId in API calls
  - chunk_id: string     ← display label only (e.g. "chunk_001")
  - generation_id: string
  - status: GenerationStatus

=====================
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEATURE 1 — REGENERATE CHUNK WITH FEEDBACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
=====================

STEP 1A — MODEL UPDATE

In src/lib/models/generation.model.ts, add:

```typescript
export interface RegenerateChunkRequest {
  feedback: string;
}
```

STEP 1B — API MODULE UPDATE

In src/lib/api/modules/generation.api.ts, add:

```typescript
regenerateChunk: (generationId: string, chunkId: string, feedback: string) =>
  http<unknown>(
    `/video-script-generator/generations/${generationId}/chunks/${chunkId}/regenerate`,
    {
      method: 'POST',
      body: JSON.stringify({ feedback }),
    }
  ),
```

STEP 1C — SERVICE UPDATE

In src/lib/services/generation.service.ts, add:

```typescript
async regenerateChunk(
  generationId: string,
  chunkId: string,
  feedback: string
): Promise<void> {
  try {
    await generationApi.regenerateChunk(generationId, chunkId, feedback);
    // Refresh the detail page data after regeneration
    await generationService.loadGenerationDetail(generationId);
  } catch (err) {
    const message = err instanceof ApiError ? err.message : 'REGENERATE_FAILED';
    generationStore.update((s) => ({ ...s, error: message }));
    throw err;
  }
}
```

STEP 1D — UI: ADD REGENERATE BUTTON AND FEEDBACK INPUT TO CHUNK CARD

On each ChunkCard (src/pages/workspace/components/studio/ChunkCard.svelte or equivalent):

Add a local state for the feedback panel:
- `showFeedback: boolean` — toggles the feedback input area
- `feedbackText: string` — the feedback content
- `isRegenerating: boolean` — loading state for this specific chunk

Layout addition (place at the BOTTOM of the right info panel, below existing content):

COLLAPSED STATE (default):
  Show a small "Regenerate" button aligned to the bottom-right of the card:
  - Outlined style, small size
  - Icon: refresh/reload icon (SVG) + label "Regenerate"
  - On click: set showFeedback = true (expands the feedback area)

EXPANDED STATE (when showFeedback = true):
  Reveal a feedback input area with smooth expand transition:

  ```
  ┌─────────────────────────────────────────┐
  │ Feedback (optional)                     │
  │ ┌─────────────────────────────────────┐ │
  │ │ Describe what to improve...         │ │
  │ │                                     │ │
  │ └─────────────────────────────────────┘ │
  │                   [Cancel]  [Regenerate] │
  └─────────────────────────────────────────┘
  ```

  - Label: "Feedback (optional)" — feedback is not required
  - Textarea: placeholder "Describe what to improve or change in this chunk..."
  - Rows: 3, no auto-resize needed here
  - Cancel button: outlined gray → sets showFeedback = false, clears feedbackText
  - Regenerate button: accent/purple style
    - Disabled when isRegenerating = true
    - Label: "Regenerating..." when loading, "Regenerate" when idle
    - On click: call generationService.regenerateChunk(generation_id, chunk.id, feedbackText)
    - On success: close the feedback panel, clear feedbackText
    - On error: show error message inline below the button

IMPORTANT UX RULES:
  - The feedback panel state (showFeedback, feedbackText) is LOCAL to each ChunkCard — NOT in the store
  - Only one chunk's feedback panel can be open at a time is NOT required (each card is independent)
  - The Regenerate button in the feedback panel calls the API with feedback (can be empty string)
  - After successful regeneration, reload the full generation detail to reflect updated chunk status

STYLING (Tailwind):
  - "Regenerate" trigger button:
    `text-xs text-purple-600 border border-purple-200 bg-purple-50 hover:bg-purple-100
     px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors`
  - Feedback label: `text-xs font-medium text-gray-500 mb-1`
  - Feedback textarea:
    `w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none
     placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200
     focus:border-purple-300`
  - Cancel button: `text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50`
  - Regenerate (submit) button:
    `text-xs text-white bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded-lg
     font-medium disabled:opacity-50 disabled:cursor-not-allowed`
  - Feedback expand container: `border-t border-gray-100 mt-3 pt-3`

=====================
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEATURE 2 — SELECT CHUNKS AND CREATE VIDEO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
=====================

STEP 2A — MODEL UPDATE

In src/lib/models/generation.model.ts, add:

```typescript
export interface CreateVideoResponse {
  queued: boolean;
}
```

STEP 2B — API MODULE UPDATE

In src/lib/api/modules/generation.api.ts, add:

```typescript
createVideo: (chunkIds: string[]) =>
  http<CreateVideoResponse>('/video-script-generator/videos', {
    method: 'POST',
    body: JSON.stringify(chunkIds),
  }),
```

STEP 2C — SERVICE UPDATE

In src/lib/services/generation.service.ts, add:

```typescript
async createVideo(chunkIds: string[]): Promise<void> {
  generationStore.update((s) => ({ ...s, isCreatingVideo: true, error: null }));
  try {
    await generationApi.createVideo(chunkIds);
    generationStore.update((s) => ({ ...s, isCreatingVideo: false }));
  } catch {
    // API not ready — mock success silently
    console.warn('[createVideo] API not ready, using mock success');
    generationStore.update((s) => ({ ...s, isCreatingVideo: false }));
  }
  // Always treat as success for now (API not ready)
}
```

STEP 2D — STORE UPDATE

In src/lib/stores/generation.store.ts, add to GenerationState:

```typescript
isCreatingVideo: boolean;
```

Initial value: `isCreatingVideo: false`

Add derived store:
```typescript
export const isCreatingVideo = derived(generationStore, ($s) => $s.isCreatingVideo);
```

STEP 2E — UI: SELECTION AND "TẠO VIDEO" BUTTON ON DETAIL PAGE

This UI lives on the generation detail PAGE (not inside ChunkCard).

SELECTION STATE (local to the detail page, NOT in store):
```svelte
let selectedChunkIds = new Set<string>();

$: allSelected = $generationChunks.length > 0 &&
                 selectedChunkIds.size === $generationChunks.length;
$: someSelected = selectedChunkIds.size > 0 && !allSelected;

function toggleChunk(id: string) {
  if (selectedChunkIds.has(id)) {
    selectedChunkIds.delete(id);
  } else {
    selectedChunkIds.add(id);
  }
  selectedChunkIds = selectedChunkIds; // trigger reactivity
}

function toggleAll() {
  if (allSelected) {
    selectedChunkIds = new Set();
  } else {
    selectedChunkIds = new Set($generationChunks.map((c) => c.id));
  }
}
```

TOOLBAR — add a sticky action bar ABOVE the chunk list:

Layout:
```
┌──────────────────────────────────────────────────────────┐
│ ☐ Select all  (3 / 8 selected)         [Tạo Video 🎬]   │
└──────────────────────────────────────────────────────────┘
```

Implementation:
```svelte
<div class="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-100
            px-6 py-3 flex items-center justify-between gap-4">

  <!-- Left: select all checkbox + count -->
  <label class="flex items-center gap-2 cursor-pointer select-none">
    <input
      type="checkbox"
      checked={allSelected}
      indeterminate={someSelected}
      on:change={toggleAll}
      class="w-4 h-4 rounded accent-purple-600 cursor-pointer"
    />
    <span class="text-sm text-gray-600">
      {#if selectedChunkIds.size > 0}
        {selectedChunkIds.size} / {$generationChunks.length} selected
      {:else}
        Select all
      {/if}
    </span>
  </label>

  <!-- Right: Tạo Video button -->
  <button
    class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
           text-white transition-all duration-150
           disabled:opacity-40 disabled:cursor-not-allowed"
    style="background: var(--gradient-accent, linear-gradient(135deg, #6366F1, #8B5CF6));"
    disabled={selectedChunkIds.size === 0 || $isCreatingVideo}
    on:click={handleCreateVideo}
  >
    {#if $isCreatingVideo}
      <span class="animate-spin inline-block w-3.5 h-3.5 border-2 border-white
                   border-t-transparent rounded-full"></span>
      Đang tạo...
    {:else}
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none"
           viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round"
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14
                 M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
      </svg>
      Tạo Video
    {/if}
  </button>
</div>
```

CREATE VIDEO HANDLER:
```typescript
async function handleCreateVideo() {
  if (selectedChunkIds.size === 0) return;
  const ids = Array.from(selectedChunkIds);
  await generationService.createVideo(ids);
  // Show success feedback
  showVideoSuccessToast = true;
  selectedChunkIds = new Set(); // clear selection after success
  setTimeout(() => { showVideoSuccessToast = false; }, 3000);
}
```

SUCCESS TOAST (local state):
```svelte
let showVideoSuccessToast = false;

{#if showVideoSuccessToast}
  <div class="fixed bottom-6 right-6 z-50 flex items-center gap-3
              bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg
              animate-in fade-in slide-in-from-bottom-4 duration-200">
    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none"
         viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
    </svg>
    <span class="text-sm font-medium">Video creation started successfully!</span>
  </div>
{/if}
```

STEP 2F — ADD CHECKBOX TO EACH CHUNK CARD

Update ChunkCard.svelte to accept and emit a selection prop:

```svelte
<script>
  export let chunk: GenerationChunk;
  export let selected: boolean = false;    // ← ADD
  export let onToggle: (id: string) => void = () => {};  // ← ADD
</script>
```

Add a checkbox overlay in the TOP-LEFT corner of the card:

```svelte
<div class="relative ...existing card classes...">
  <!-- Checkbox — top-left overlay -->
  <div class="absolute top-3 left-3 z-10">
    <input
      type="checkbox"
      checked={selected}
      on:change={() => onToggle(chunk.id)}
      class="w-4 h-4 rounded accent-purple-600 cursor-pointer
             shadow-sm bg-white border border-gray-300"
    />
  </div>

  <!-- Highlight selected card -->
  <!-- existing card content unchanged -->
</div>
```

Add a visual selected state to the card border:
```svelte
<div class="... border"
  class:border-purple-400={selected}
  class:bg-purple-50={selected}
  class:border-gray-200={!selected}
>
```

Usage in the detail page — pass props to each ChunkCard:
```svelte
{#each $generationChunks as chunk (chunk.id)}
  <ChunkCard
    {chunk}
    selected={selectedChunkIds.has(chunk.id)}
    onToggle={toggleChunk}
  />
{/each}
```

=====================
CRITICAL RULES
=====================

1. selectedChunkIds is LOCAL to the detail page — NOT in the store. It resets on page unmount.
2. The Regenerate feedback state (showFeedback, feedbackText) is LOCAL to each ChunkCard — NOT shared.
3. createVideo always treats its result as success (API not ready) — never show an error for this call.
4. After regenerateChunk succeeds, call loadGenerationDetail() to refresh chunk statuses.
5. chunk.id (MongoDB ObjectId) is used in API calls — NOT chunk.chunk_id (display label).
6. The "Tạo Video" toolbar must be sticky so it stays visible when scrolling through many chunks.
7. The indeterminate checkbox state (someSelected but not all) must be set via the DOM property,
   not via HTML attribute — use bind:this and set node.indeterminate directly in a reactive block:
   ```svelte
   let checkboxEl: HTMLInputElement;
   $: if (checkboxEl) checkboxEl.indeterminate = someSelected;
   ```
8. Deselect all chunks after successful video creation.

=====================
STRICTLY FORBIDDEN
=====================

- Do NOT store selectedChunkIds in the Svelte store or service
- Do NOT show an error toast when createVideo API fails (mock success instead)
- Do NOT change the ChunkCard layout — only add the checkbox overlay and border highlight
- Do NOT change the generation list page — only the generation DETAIL page
- Do NOT call generationApi directly from the page — use generationService

=====================
OUTPUT EXPECTATION
=====================

1. ✅ Each chunk card has a "Regenerate" button that expands a feedback textarea inline.
2. ✅ Submitting feedback calls POST /generations/{id}/chunks/{chunkId}/regenerate and refreshes the detail.
3. ✅ Each chunk card has a checkbox in the top-left corner.
4. ✅ Sticky toolbar shows "Select all" checkbox with count and "Tạo Video" button.
5. ✅ "Tạo Video" is disabled when no chunks selected or isCreatingVideo is true.
6. ✅ Clicking "Tạo Video" calls POST /video-script-generator/videos with selected chunk ids.
7. ✅ Success toast shown for 3 seconds after video creation, selection cleared.
8. ✅ createVideo never shows an error (mock success while API is not ready).

******* Example 3
You are a senior frontend engineer implementing a new SUBS feature and status standardization in a Svelte project.

This covers THREE connected tasks:
  1. Create a shared status enum with exactly 3 states: pending, completed, failed
  2. Add a "Create Sub" action for completed compositions (with confirmation modal + API call)
  3. Add a new "Subs" tab in Workspace and show video-subber jobs list

Do NOT change auth, chat, document upload, websocket, or unrelated features.

=====================
BACKEND API CONTRACT
=====================

Base URL: import.meta.env.VITE_API_BASE_URL

--- API 1: CREATE SUB JOB ---
POST  /video-subber/jobs
Auth: Bearer token required
Body:
{
  "composition_id": string,
  "style": {
    "fontsize": 70,
    "color": "yellow",
    "stroke_color": "black",
    "stroke_width": 3,
    "font": "Arial-Bold",
    "method": "caption",
    "sub_x_position": 0,
    "sub_y_position": 0
  }
}
Notes:
  - style is hardcoded EXACTLY as above
  - composition_id is the selected composition id
  - Do NOT call fetch directly from component; use api + service layer

--- API 2: GET SUB JOB LIST ---
GET  /video-subber/jobs?page={page}&limit=20
Auth: Bearer token required

Response envelope:
{
  "statusCode": 200,
  "message": "VIDEO_SUB_JOB_LISTED",
  "data": {
    "jobs": [  {
        "user_id": "69d1363ea26355d1e2b54299",
        "session_id": "69d90c977babe430fd319497",
        "generation_id": "69d90d0d7babe430fd31949a",
        "composition_id": "69da7089975264d8e9de71c9",
        "style": {
          "fontsize": 70,
          "color": "yellow",
          "stroke_color": "black",
          "stroke_width": 3,
          "font": "Arial-Bold",
          "method": "caption",
          "sub_x_position": 0,
          "sub_y_position": 0
        },
        "status": "pending",
        "attempt_count": 0,
        "claimed_by": null,
        "claimed_at": null,
        "completed_at": null,
        "failed_at": null,
        "error_message": null,
        "source_s3_bucket": "dev-s3-bucket",
        "source_s3_key": "video-generations/69d44084ad184ab7d0fc86a1/chunk_001.mp4",
        "source_s3_url": "https://s3.cloudfly.vn/dev-s3-bucket/video-generations/69d44084ad184ab7d0fc86a1/chunk_001.mp4",
        "output_s3_bucket": null,
        "output_s3_key": null,
        "output_s3_url": null,
        "agent_metadata": {},
        "created_at": "2026-04-11T16:13:10.406000",
        "updated_at": "2026-04-11T16:13:10.406000",
        "id": "69da73166a12ecd0f90d155f",
        "source_presigned_s3_url": "https://s3.cloudfly.vn/dev-s3-bucket/video-generations/69d44084ad184ab7d0fc86a1/chunk_001.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=VXMH3343SI67G5BZO7XK%2F20260411%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260411T161354Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=bf3741c3320f1f358d84649aec1c678a1f510668dae9d6073de8d19ec4d2ab11",
        "presigned_s3_url": null
      } ],
    "count": number
  },
  "pagination": { page, limit, total, totalPages }
}

Important:
  - Use presigned_s3_url for output video preview
  - source_presigned_s3_url can be used as fallback preview if presigned_s3_url is null
  - Never use raw s3_url directly for player src

=====================
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 1 - SHARED STATUS ENUM (pending/completed/failed)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
=====================

STEP 1A - CREATE SHARED ENUM MODEL

Create a dedicated status model file (example: src/lib/models/status.model.ts) with:

```typescript
export enum JobStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export type UnifiedStatus = JobStatus;
```

STEP 1B - APPLY ENUM TO MODELS

Update all related models to use shared enum type:
  - generation model (generation status, chunk status)
  - composition model (composition status)
  - new sub model (job status)

Remove scattered status string unions in these models and replace them with the shared enum type.

STEP 1C - NORMALIZE BACKEND STATUS TO ENUM DOMAIN

Because backend may still return values outside the 3-state enum (for example: processing),
add a status normalizer utility:

```typescript
normalizeStatus(rawStatus) => JobStatus
```

Mapping rules:
  - completed -> completed
  - failed -> failed
  - anything else -> pending

Use this normalizer in services before writing to store/UI for:
  - generations/chunks
  - compositions
  - subs

STEP 1D - UPDATE UI ELEMENTS TO USE ENUM

Refactor status comparisons in components to use shared enum constants instead of raw strings.
At minimum update:
  - StatusBadge component
  - generations chunk card/detail status conditions
  - compositions list/detail status conditions
  - sub list status conditions (new)

=====================
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 2 - CREATE SUB ACTION FOR COMPLETED COMPOSITIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
=====================

STEP 2A - CREATE SUB MODEL

Create model file: src/lib/models/sub.model.ts

Include:
  - SubStyle interface
  - CreateSubJobRequest interface
  - SubJob interface (based on API response fields)
  - SubJobListResponse interface ({ jobs, count })

Use shared status enum for SubJob.status.

STEP 2B - CREATE SUB API MODULE

Create: src/lib/api/modules/sub.api.ts

Add:
  - createSubJob(compositionId: string)
    - POST /video-subber/jobs
    - Body uses fixed hardcoded style EXACTLY as contract
  - getSubJobs(page = 1)
    - GET /video-subber/jobs?page={page}&limit=20

Register export in api index file if needed.

STEP 2C - CREATE SUB STORE

Create: src/lib/stores/sub.store.ts

State:
  - jobs
  - pagination
  - currentPage
  - isLoadingList
  - isCreating
  - error

Add derived stores for jobs, pagination, loading, creating.

STEP 2D - CREATE SUB SERVICE

Create: src/lib/services/sub.service.ts

Add:
  - createSubJob(compositionId: string)
  - loadSubJobs(page = 1)
  - goToPage(page)

Rules:
  - call subApi only inside service
  - normalize status with normalizeStatus before storing
  - handle API errors with existing ApiError pattern
  - preserve existing architecture style of composition/generation services

STEP 2E - ADD CREATE SUB BUTTON TO COMPLETED COMPOSITIONS

In compositions UI:
  - show button "Create Sub" only when composition.status is completed
  - button appears on each completed composition card
  - optional: add on detail header if desired
  - clicking button opens confirmation modal

On confirm:
  - call subService.createSubJob(composition.id)
  - show success feedback
  - keep user on current screen
  - disable button during creating state

Use existing common modal if available (reuse, do not duplicate).
If no reusable modal exists, create one common modal component and use it.

Confirmation modal content:
  - Title: Create subtitle job?
  - Description: This will create a video-subber job for Composition #{shortId}
  - Buttons: Cancel / Confirm

=====================
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK 3 - ADD SUBS TAB + LIST SCREEN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
=====================

STEP 3A - EXTEND WORKSPACE SECTION TYPE

Update workspace section type/store to include subs:
  - add 'subs' to WorkspaceSection union
  - ensure session-based active section supports subs

STEP 3B - ADD SUBS TAB TO WORKSPACE NAV

In WorkspacePanel tab row:
  - add a new tab "Subs"
  - place next to existing top tabs (documents/chat/studio/compositions)
  - keep same active/inactive styling and behavior
  - clicking sets section to subs
  - do not break existing generation/composition detail routing behavior

STEP 3C - CREATE SUBS PAGE COMPONENT

Create page component, example:
  - src/pages/workspace/subs/Subs.svelte

Behavior:
  - load sub jobs on mount: subService.loadSubJobs(1)
  - render list cards
  - loading skeletons when isLoadingList
  - empty state when no jobs
  - pagination (Prev / page of total / Next) when totalPages > 1

Card display (choose practical fields):
  - job short id
  - status badge
  - composition_id short
  - generation_id short
  - created_at formatted
  - attempt_count
  - error_message when failed

Video preview rules:
  - video src priority:
    1) presigned_s3_url
    2) source_presigned_s3_url
    3) placeholder
  - for available video url:
    - render video with controls playsinline
  - for missing url:
    - render status-aware placeholder panel

Use StatusBadge with shared enum status.

=====================
CRITICAL RULES
=====================

1. Shared enum must contain exactly: pending, completed, failed.
2. All status checks in generations/chunks/compositions/subs must use shared enum, not ad-hoc strings.
3. Any backend status outside enum domain must be normalized to pending.
4. Create Sub button appears only for completed compositions.
5. Create Sub API body style is hardcoded exactly as provided.
6. No direct API calls in page components; use service layer only.
7. Subs tab must be integrated into existing workspace section system.
8. Use presigned URLs for video playback, never raw S3 URL.
9. Keep existing unrelated features unchanged.

=====================
STRICTLY FORBIDDEN
=====================

- Do NOT modify auth/chat/document/websocket flows
- Do NOT add status value processing into the shared enum
- Do NOT call sub API directly from Svelte page components
- Do NOT use output_s3_url or source_s3_url directly as video src
- Do NOT break existing compositions and generation detail navigation

=====================
OUTPUT EXPECTATION
=====================

1. Shared status enum (pending/completed/failed) created and applied across chunk/generation/composition/sub.
2. Existing UI status elements refactored to use enum-based checks.
3. Completed composition cards have Create Sub action with confirmation modal.
4. Confirming Create Sub triggers POST /video-subber/jobs with fixed style body.
5. New Subs tab added in workspace and fully functional.
6. Subs list loads from GET /video-subber/jobs?page=1&limit=20 with loading/empty/pagination states.
7. Subs list renders video preview from presigned URL fields.
8. No unrelated modules/features changed.
