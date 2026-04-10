<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '../../../app/stores.js';
  import { goto } from '$app/navigation';
  import { generationService } from '$lib/services/generation.service';
  import {
    activeGeneration,
    generationChunks,
    isCreatingVideo,
    isLoadingDetail,
    generationStore
  } from '$lib/stores/generation.store';
  import StatusBadge from '$lib/components/common/StatusBadge.svelte';
  import ChunkCard from './ChunkCard.svelte';
  import { formatDuration, formatRelativeDate } from '$lib/utils/format';

  $: sessionId = $page.params.sessionId;
  $: generationId = $page.params.generationId;

  let selectedChunkIds = new Set<string>();
  let showVideoSuccessToast = false;
  let checkboxEl: HTMLInputElement;

  $: allSelected =
    $generationChunks.length > 0 && selectedChunkIds.size === $generationChunks.length;
  $: someSelected = selectedChunkIds.size > 0 && !allSelected;
  $: if (checkboxEl) checkboxEl.indeterminate = someSelected;

  function toggleChunk(id: string) {
    if (selectedChunkIds.has(id)) {
      selectedChunkIds.delete(id);
    } else {
      selectedChunkIds.add(id);
    }
    selectedChunkIds = selectedChunkIds;
  }

  function toggleAll() {
    if (allSelected) {
      selectedChunkIds = new Set();
    } else {
      selectedChunkIds = new Set($generationChunks.map((c) => c.id));
    }
  }

  async function handleCreateVideo() {
    if (selectedChunkIds.size === 0) return;
    const ids = Array.from(selectedChunkIds);
    await generationService.createVideo(ids);
    showVideoSuccessToast = true;
    selectedChunkIds = new Set();
    setTimeout(() => {
      showVideoSuccessToast = false;
    }, 3000);
  }

  onMount(() => {
    generationService.loadGenerationDetail(generationId);
  });
</script>

<div class="px-6 pt-6 pb-2">
  <button
    class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-purple-600 transition-colors"
    on:click={() => goto(`/workspace/${sessionId}`)}
    type="button"
  >
    ← Back to generations
  </button>
</div>

{#if $isLoadingDetail}
  <div class="px-6 space-y-4">
    <div class="h-8 w-1/2 bg-purple-50 rounded-lg animate-pulse"></div>
    {#each Array(4) as _}
      <div class="h-40 bg-gray-50 rounded-xl animate-pulse"></div>
    {/each}
  </div>
{:else if $activeGeneration}
  <div class="px-6 py-4 border-b border-gray-100">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-lg font-semibold text-gray-800">
          {$activeGeneration.resolved_prompt_values?.title ?? 'Untitled Generation'}
        </h1>
        <p class="text-sm text-gray-500 mt-0.5">{$activeGeneration.video_concept}</p>
      </div>
      <StatusBadge status={$activeGeneration.status} />
    </div>

    <div class="flex flex-wrap gap-2 mt-3">
      <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
        {$activeGeneration.total_chunks} chunks
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
    class="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-100 px-6 py-3 flex items-center justify-between gap-4"
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
        {#if selectedChunkIds.size > 0}
          {selectedChunkIds.size} / {$generationChunks.length} selected
        {:else}
          Select all
        {/if}
      </span>
    </label>

    <button
      class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
      style="background: var(--gradient-accent, linear-gradient(135deg, #6366F1, #8B5CF6));"
      disabled={selectedChunkIds.size === 0 || $isCreatingVideo}
      on:click={handleCreateVideo}
    >
      {#if $isCreatingVideo}
        <span
          class="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"
        ></span>
        Đang tạo...
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
        Tạo Video
      {/if}
    </button>
  </div>

  <div class="px-6 py-4 space-y-4">
    {#each $generationChunks as chunk (chunk.id)}
      <ChunkCard
        {...({
          chunk,
          selected: selectedChunkIds.has(chunk.id),
          onToggle: toggleChunk
        } as any)}
      />
    {/each}
  </div>
{:else if $generationStore.error}
  <div class="px-6 py-8 text-sm text-rose-600">{$generationStore.error}</div>
{/if}

{#if showVideoSuccessToast}
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
    <span class="text-sm font-medium">Video creation started successfully!</span>
  </div>
{/if}
