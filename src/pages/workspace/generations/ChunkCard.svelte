<script lang="ts">
  import type { GenerationChunk } from '$lib/models/generation.model';
  import StatusBadge from '$lib/components/common/StatusBadge.svelte';
  import { generationService } from '$lib/services/generation.service';
  import { CHUNK_SECTION, RENDER_JOB_STATUS } from '$lib/constants/index.js';
  import { slide } from 'svelte/transition';

  export let chunk: GenerationChunk;
  export let selectionOrder: number | null = null;
  export let onToggle = (_chunk: GenerationChunk): void => {};

  let showFeedback = false;
  let feedbackText = '';
  let isRegenerating = false;
  let regenerateError = '';
  $: canRegenerate = chunk.status === RENDER_JOB_STATUS.COMPLETED;

  const sectionLabel: Record<string, string> = {
    [CHUNK_SECTION.HOOK]: 'Hook',
    [CHUNK_SECTION.BODY]: 'Body',
    [CHUNK_SECTION.PROOF]: 'Proof',
    [CHUNK_SECTION.CTA]: 'Call to Action'
  };

  function openFeedback() {
    if (!canRegenerate) return;
    showFeedback = true;
    regenerateError = '';
  }

  function cancelFeedback() {
    showFeedback = false;
    feedbackText = '';
    regenerateError = '';
  }

  async function handleRegenerate() {
    isRegenerating = true;
    regenerateError = '';
    try {
      await generationService.regenerateChunk(chunk.generation_id, chunk.id, feedbackText);
      showFeedback = false;
      feedbackText = '';
    } catch (err) {
      regenerateError = err instanceof Error ? err.message : 'REGENERATE_FAILED';
    } finally {
      isRegenerating = false;
    }
  }
</script>

<div
  class="hover-lift relative flex flex-col md:flex-row gap-0 md:gap-4 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl overflow-hidden shadow-[var(--shadow-soft)] hover:border-[var(--border-purple)]"
  class:border-purple-400={selectionOrder !== null}
  class:bg-purple-50={selectionOrder !== null}
  class:border-gray-200={selectionOrder === null}
>
  <div class="absolute top-3 left-3 z-10">
    {#if selectionOrder !== null}
      <button
        class="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center shadow-sm hover:bg-purple-700 transition-colors"
        on:click={() => onToggle(chunk)}
        aria-label={`Deselect chunk ${chunk.chunk_id}`}
        type="button"
      >
        {selectionOrder}
      </button>
    {:else}
      <button
        class="w-6 h-6 rounded-full border-2 border-gray-300 bg-white hover:border-purple-400 hover:bg-purple-50 transition-colors"
        on:click={() => onToggle(chunk)}
        aria-label={`Select chunk ${chunk.chunk_id}`}
        type="button"
      ></button>
    {/if}
  </div>

  <div class="w-full md:w-[40%] md:flex-shrink-0 border-b md:border-b-0 md:border-r border-[var(--border-subtle)]">
    <div class="relative w-full aspect-video bg-[#0b0b0f]">
      {#if chunk.presigned_s3_url}
        <!-- svelte-ignore a11y-media-has-caption -->
        <video
          src={chunk.presigned_s3_url}
          controls
          playsinline
          preload="metadata"
          class="absolute inset-0 h-full w-full object-contain"
        ></video>
      {:else}
        <div class="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/50 py-8">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
          </svg>
          <span class="text-xs text-white/60">
            {#if chunk.status === RENDER_JOB_STATUS.PENDING}Pending render{/if}
            {#if chunk.status === RENDER_JOB_STATUS.PROCESSING}Rendering{/if}
            {#if chunk.status === RENDER_JOB_STATUS.COMPLETED}Rendered{/if}
            {#if chunk.status === RENDER_JOB_STATUS.FAILED}Render failed{/if}
          </span>
        </div>
      {/if}
    </div>
  </div>

  <div class="flex-1 min-w-0 p-4 flex flex-col gap-3">
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <span class="text-xs font-mono font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
          {chunk.chunk_id}
        </span>
        <span class="text-xs text-gray-400 capitalize">
          {sectionLabel[chunk.section] ?? chunk.section}
        </span>
      </div>
      <StatusBadge status={chunk.status} />
    </div>

    <div class="flex items-center gap-1 text-xs text-gray-500">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="12" r="10" stroke-width="1.5"/>
        <path stroke-linecap="round" stroke-width="1.5" d="M12 6v6l4 2"/>
      </svg>
      <span>Target: <strong class="text-gray-700">{chunk.target_seconds}s</strong></span>
      <span class="ml-2 text-gray-400">~{chunk.estimated_syllables} syllables</span>
    </div>

    <div>
      <p class="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Narration</p>
      <p class="text-sm text-gray-700 leading-relaxed line-clamp-3">{chunk.narration}</p>
    </div>

    {#if chunk.status === RENDER_JOB_STATUS.FAILED && chunk.error_message}
      <p class="text-xs text-rose-500 bg-rose-50 px-3 py-2 rounded-lg">⚠ {chunk.error_message}</p>
    {/if}

    <div class="flex items-center gap-3 text-[10px] text-gray-400 mt-auto pt-2 border-t border-gray-50">
      <span>v{chunk.current_version}</span>
      <span>{chunk.attempt_count} attempt(s)</span>
      {#if chunk.regenerate_count > 0}
        <span>{chunk.regenerate_count} regen(s)</span>
      {/if}
    </div>

    {#if canRegenerate && !showFeedback}
      <div class="flex justify-end mt-3">
        <button
          type="button"
          class="text-xs text-purple-600 border border-purple-200 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors"
          on:click={openFeedback}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M4 4v5h.582M20 20v-5h-.581m0 0A8.003 8.003 0 004.582 9m14.837 6a8.003 8.003 0 01-14.837 0"
            />
          </svg>
          Regenerate
        </button>
      </div>
    {:else if canRegenerate}
      <div in:slide={{ duration: 180 }} out:slide={{ duration: 140 }} class="border-t border-gray-100 mt-3 pt-3">
        <p class="text-xs font-medium text-gray-500 mb-1">Feedback (optional)</p>
        <textarea
          rows="3"
          bind:value={feedbackText}
          placeholder="Describe what to improve or change in this chunk..."
          class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300"
        ></textarea>

        <div class="flex items-center justify-end gap-2 mt-2">
          <button
            type="button"
            class="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50"
            on:click={cancelFeedback}
          >
            Cancel
          </button>
          <button
            type="button"
            class="text-xs text-white bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isRegenerating}
            on:click={handleRegenerate}
          >
            {#if isRegenerating}Regenerating...{:else}Regenerate{/if}
          </button>
        </div>

        {#if regenerateError}
          <p class="text-xs text-rose-600 mt-2">{regenerateError}</p>
        {/if}
      </div>
    {/if}
  </div>
</div>
