<script lang="ts">
  import { goto } from '$app/navigation';
  import { generationService } from '$lib/services/generation.service';
  import {
    activeGeneration,
    generationChunks,
    isLoadingDetail,
    generationStore
  } from '$lib/stores/generation.store';
  import StatusBadge from '$lib/components/common/StatusBadge.svelte';
  import ChunkCard from './ChunkCard.svelte';
  import { formatDuration, formatRelativeDate } from '$lib/utils/format';

  export let sessionId: string;
  export let generationId: string;

  $: if (generationId) {
    generationService.loadGenerationDetail(generationId);
  }
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

  <div class="px-6 py-4 space-y-4">
    {#each $generationChunks as chunk (chunk.id)}
      <ChunkCard {chunk} />
    {/each}
  </div>
{:else if $generationStore.error}
  <div class="px-6 py-8 text-sm text-rose-600">{$generationStore.error}</div>
{/if}
