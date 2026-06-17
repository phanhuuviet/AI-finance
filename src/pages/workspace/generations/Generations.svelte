<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '../../../app/stores.js';
  import { goto } from '$app/navigation';
  import { generationService } from '$lib/services/generation.service';
  import { compositionService } from '$lib/services/composition.service';
  import { isCreatingComposition } from '$lib/stores/composition.store';
  import type { GenerationChunk } from '$lib/models/generation.model';
  import {
    activeGeneration,
    generationChunks,
    isLoadingDetail,
    generationStore
  } from '$lib/stores/generation.store';
  import StatusBadge from '$lib/components/common/StatusBadge.svelte';
  import ChunkCard from './ChunkCard.svelte';
  import { formatDuration, formatRelativeDate } from '$lib/utils/format';
  import { t } from '$lib/i18n';

  $: sessionId = $page.params.sessionId;
  $: generationId = $page.params.generationId;

  let selectedChunks: GenerationChunk[] = [];
  let showSuccessToast = false;
  let checkboxEl: HTMLInputElement;

  const isSelected = (id: string): boolean => selectedChunks.some((c) => c.id === id);
  const selectionOrder = (id: string): number | null => {
    const idx = selectedChunks.findIndex((c) => c.id === id);
    return idx === -1 ? null : idx + 1;
  };

  $: allSelected = $generationChunks.length > 0 && selectedChunks.length === $generationChunks.length;
  $: someSelected = selectedChunks.length > 0 && !allSelected;
  $: if (checkboxEl) checkboxEl.indeterminate = someSelected;

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
      const alreadySelected = new Set(selectedChunks.map((c) => c.id));
      const newOnes = $generationChunks.filter((c) => !alreadySelected.has(c.id));
      selectedChunks = [...selectedChunks, ...newOnes];
    }
  }

  async function handleCreateComposition() {
    if (selectedChunks.length === 0 || !$activeGeneration) return;
    try {
      await compositionService.createComposition($activeGeneration.id, selectedChunks);
      showSuccessToast = true;
      selectedChunks = [];
      setTimeout(() => {
        showSuccessToast = false;
      }, 3000);
    } catch {
      // error state is handled by store
    }
  }

  onMount(() => {
    generationService.loadGenerationDetail(generationId);
  });
</script>

<div class="px-3 sm:px-6 pt-4 sm:pt-6 pb-2">
  <button
    class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-purple-600 transition-colors"
    on:click={() => goto(`/workspace/${sessionId}`)}
    type="button"
  >
    ← {$t('generations.backToList')}
  </button>
</div>

{#if $isLoadingDetail}
  <div class="px-3 sm:px-6 space-y-4">
    <div class="h-8 w-1/2 bg-purple-50 rounded-lg animate-pulse"></div>
    {#each Array(4) as _}
      <div class="h-40 bg-gray-50 rounded-xl animate-pulse"></div>
    {/each}
  </div>
{:else if $activeGeneration}
  <div class="px-3 sm:px-6 py-4 border-b border-gray-100">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-lg font-semibold text-gray-800">
          {$activeGeneration.resolved_prompt_values?.title ?? $t('generations.untitled')}
        </h1>
        <p class="text-sm text-gray-500 mt-0.5">{$activeGeneration.video_concept}</p>
      </div>
      <StatusBadge status={$activeGeneration.status} />
    </div>

    <div class="flex flex-wrap gap-2 mt-3">
      <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
        {$t('common.chunksCount', { count: $activeGeneration.total_chunks })}
      </span>
      <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
        ~{formatDuration($activeGeneration.estimated_total_duration_seconds)}
      </span>
      <span class="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded-md">
        {$activeGeneration.model}
      </span>
      <span class="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md">
        {formatRelativeDate($activeGeneration.created_at)}
      </span>
    </div>
  </div>

  <div
    class="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-100 px-3 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4"
  >
    <label class="flex items-center gap-2 cursor-pointer select-none">
      <input
        bind:this={checkboxEl}
        type="checkbox"
        checked={allSelected}
        on:change={toggleAll}
        class="w-4 h-4 rounded accent-purple-600 cursor-pointer"
      />
      <span class="text-sm text-gray-600">
        {#if selectedChunks.length > 0}
          {$t('generations.selectedInOrder', { count: selectedChunks.length, total: $generationChunks.length })}
        {:else}
          {$t('generations.selectAll')}
        {/if}
      </span>
    </label>

    <button
      class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
      style="background: var(--gradient-accent, linear-gradient(135deg, #6366F1, #8B5CF6));"
      disabled={selectedChunks.length === 0 || $isCreatingComposition}
      on:click={handleCreateComposition}
    >
      {#if $isCreatingComposition}
        <span
          class="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"
        ></span>
        {$t('common.creating')}
      {:else}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14 M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"
          />
        </svg>
        {$t('generations.createVideo')}
      {/if}
    </button>
  </div>

  <div class="px-3 sm:px-6 py-4 space-y-4">
    {#each $generationChunks as chunk, i (chunk.id)}
      <div class="animate-fade-in-up" style={`animation-delay:${i * 60}ms`}>
        <ChunkCard
          {...({
            chunk,
            selectionOrder: selectionOrder(chunk.id),
            onToggle: toggleChunk
          } as any)}
        />
      </div>
    {/each}
  </div>
{:else if $generationStore.error}
  <div class="px-3 sm:px-6 py-8 text-sm text-rose-600">{$generationStore.error}</div>
{/if}

{#if showSuccessToast}
  <div
    class="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-200"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
    </svg>
    <span class="text-sm font-medium">{$t('generations.compositionStarted')}</span>
  </div>
{/if}
