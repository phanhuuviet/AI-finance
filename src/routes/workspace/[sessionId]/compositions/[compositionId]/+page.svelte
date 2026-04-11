<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { navigate } from '$lib/router/navigate';
  import { compositionService } from '$lib/services/composition.service';
  import {
    activeComposition,
    activeCompositionChunks,
    isLoadingCompositionDetail,
    compositionStore
  } from '$lib/stores/composition.store';
  import StatusBadge from '$lib/components/common/StatusBadge.svelte';

  function shortId(value: string | undefined): string {
    if (!value) return '';
    return value.slice(-8);
  }

  function formatDateTime(iso: string): string {
    const dt = new Date(iso);
    if (Number.isNaN(dt.getTime())) return '--';
    const date = dt.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const time = dt.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    return `${date} ${time}`;
  }

  $: sessionId = $page.params.sessionId;
  $: compositionId = $page.params.compositionId;

  onMount(() => {
    compositionService.loadCompositionDetail(compositionId);
  });
</script>

<div class="px-6 pt-6 pb-2">
  <button
    class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-purple-600 transition-colors"
    on:click={() => navigate(`/workspace/${sessionId}`)}
    type="button"
  >
    ← Back to compositions
  </button>
</div>

{#if $isLoadingCompositionDetail}
  <div class="px-6 space-y-4">
    <div class="h-8 w-1/2 bg-purple-50 rounded-lg animate-pulse"></div>
    <div class="h-80 bg-gray-50 rounded-xl animate-pulse"></div>
  </div>
{:else if $activeComposition}
  <div class="px-6 py-4 border-b border-gray-100">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-lg font-semibold text-gray-800">
          Composition #{shortId($activeComposition.id)}
        </h1>
        <p class="text-sm text-gray-500 mt-0.5">Generation #{shortId($activeComposition.generation_id)}</p>
      </div>
      <StatusBadge status={$activeComposition.status} />
    </div>

    <div class="flex flex-wrap gap-2 mt-3">
      <span class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
        {$activeComposition.chunk_count} chunks
      </span>
      <span class="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md">
        {formatDateTime($activeComposition.created_at)}
      </span>
      <span class="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded-md">
        Gen #{shortId($activeComposition.generation_id)}
      </span>
    </div>
  </div>

  <div class="px-6 py-4 grid grid-cols-1 lg:grid-cols-5 gap-4">
    <div class="lg:col-span-3">
      <div class="bg-gray-900 rounded-xl overflow-hidden aspect-video flex items-center justify-center">
        {#if $activeComposition.presigned_s3_url}
          <!-- svelte-ignore a11y-media-has-caption -->
          <video
            src={$activeComposition.presigned_s3_url}
            controls
            playsinline
            class="w-full h-full object-contain"
          ></video>
        {:else}
          <div class="flex flex-col items-center gap-3 text-gray-400 py-16 px-4 text-center">
            {#if $activeComposition.status === 'pending'}
              <p class="text-sm">Composition is queued for processing</p>
            {:else if $activeComposition.status === 'processing'}
              <div class="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full"></div>
              <p class="text-sm text-amber-400">Processing composition...</p>
            {:else if $activeComposition.status === 'failed'}
              <p class="text-sm text-rose-400">Composition failed</p>
              {#if $activeComposition.error_message}
                <p class="text-xs text-rose-300">{$activeComposition.error_message}</p>
              {/if}
            {:else}
              <p class="text-sm">Video not yet available</p>
            {/if}
          </div>
        {/if}
      </div>
    </div>

    <div class="lg:col-span-2">
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-sm font-semibold text-gray-700">Chunks ({$activeCompositionChunks.length})</h2>
      </div>

      <div class="space-y-2">
        {#each $activeCompositionChunks as chunk (chunk.chunk_id + '-' + chunk.sequence)}
          <div class="flex gap-3 p-3 bg-white border border-gray-100 rounded-xl">
            <div class="flex-shrink-0 w-7 h-7 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">
              {chunk.sequence}
            </div>

            <div class="flex-shrink-0 w-20 h-14 bg-gray-900 rounded-lg overflow-hidden">
              {#if chunk.presigned_s3_url}
                <!-- svelte-ignore a11y-media-has-caption -->
                <video
                  src={chunk.presigned_s3_url}
                  playsinline
                  muted
                  loop
                  autoplay
                  class="w-full h-full object-contain"
                ></video>
              {:else}
                <div class="w-full h-full flex items-center justify-center text-gray-600 text-xs">No video</div>
              {/if}
            </div>

            <div class="flex-1 min-w-0">
              <p class="text-xs font-semibold text-gray-700">{chunk.chunk_id}</p>
              <p class="text-xs text-gray-400 mt-0.5">Transition: {chunk.transition_name}</p>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
{:else if $compositionStore.error}
  <div class="px-6 py-8 text-sm text-rose-600">{$compositionStore.error}</div>
{/if}
