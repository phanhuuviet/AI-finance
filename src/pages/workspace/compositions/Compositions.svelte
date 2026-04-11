<script lang="ts">
  import { onMount } from 'svelte';
  import { compositionService } from '$lib/services/composition.service';
  import {
    compositions,
    compositionCurrentPage,
    compositionPagination,
    isLoadingCompositions
  } from '$lib/stores/composition.store';
  import StatusBadge from '$lib/components/common/StatusBadge.svelte';
  import { navigate } from '$lib/router/navigate';
  import { RENDER_JOB_STATUS } from '$lib/constants/index.js';

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

  function openComposition(sessionId: string, compositionId: string): void {
    navigate(`/workspace/${sessionId}/compositions/${compositionId}`);
  }

  onMount(() => {
    compositionService.loadCompositions(1);
  });
</script>

<div class="h-full flex flex-col bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border-default)] overflow-hidden">
  <div class="px-4 sm:px-5 py-4 border-b border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
    <h2 class="text-base font-semibold text-[var(--color-text-primary)]">Compositions</h2>
  </div>

  <div class="p-4 sm:p-5 overflow-y-auto flex-1 min-h-0">
    <div class="space-y-3">
      {#if $isLoadingCompositions}
        {#each Array(3) as _}
          <div class="h-48 bg-purple-50 rounded-xl animate-pulse"></div>
        {/each}
      {:else if $compositions.length === 0}
        <div class="text-center py-12 text-gray-400">
          <p class="text-sm">No compositions yet.</p>
          <p class="text-xs mt-1">Select chunks on a generation and click 'Tạo Video'.</p>
        </div>
      {:else}
        {#each $compositions as composition (composition.id)}
          <button
            class="w-full text-left bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-purple-300 hover:shadow-sm transition-all duration-150 cursor-pointer"
            on:click={() => openComposition(composition.session_id, composition.id)}
            type="button"
          >
            {#if composition.presigned_s3_url}
              <!-- svelte-ignore a11y-media-has-caption -->
              <video
                src={composition.presigned_s3_url}
                controls
                playsinline
                class="w-full rounded-t-xl max-h-48 bg-black object-contain"
              ></video>
            {:else}
              <div class="w-full min-h-36 px-4 py-6 flex flex-col items-center justify-center gap-2 text-center
                {composition.status === RENDER_JOB_STATUS.PENDING ? 'bg-gray-50 text-gray-600' : ''}
                {composition.status === RENDER_JOB_STATUS.COMPLETED ? 'bg-green-50 text-green-700' : ''}
                {composition.status === RENDER_JOB_STATUS.FAILED ? 'bg-rose-50 text-rose-700' : ''}
              ">
                {#if composition.status === RENDER_JOB_STATUS.PENDING}
                  <p class="text-sm">Waiting to process</p>
                {:else if composition.status === RENDER_JOB_STATUS.COMPLETED}
                  <p class="text-sm">Ready</p>
                  <p class="text-xs">No preview URL available yet</p>
                {:else}
                  <p class="text-sm">Failed</p>
                  {#if composition.error_message}
                    <p class="text-xs">{composition.error_message}</p>
                  {/if}
                {/if}
              </div>
            {/if}

            <div class="p-3 flex items-center justify-between gap-2">
              <div class="min-w-0">
                <p class="text-sm font-semibold text-gray-800 truncate">Composition #{composition.id.slice(-8)}</p>
                <div class="flex items-center gap-2 mt-1 text-xs text-gray-500 flex-wrap">
                  <StatusBadge status={composition.status} />
                  <span>•</span>
                  <span>{composition.chunk_count} chunk(s)</span>
                  <span>•</span>
                  <span>{formatDateTime(composition.created_at)}</span>
                </div>
              </div>
            </div>
          </button>
        {/each}
      {/if}
    </div>

    {#if $compositionPagination && $compositionPagination.totalPages > 1}
      <div class="flex items-center justify-between pt-3 mt-3 border-t border-gray-100 text-xs text-gray-500">
        <button
          class="px-2 py-1 rounded hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed"
          disabled={$compositionCurrentPage === 1}
          on:click={() => compositionService.goToPage($compositionCurrentPage - 1)}
          type="button"
        >← Prev</button>
        <span>{$compositionCurrentPage} / {$compositionPagination.totalPages}</span>
        <button
          class="px-2 py-1 rounded hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed"
          disabled={$compositionCurrentPage === $compositionPagination.totalPages}
          on:click={() => compositionService.goToPage($compositionCurrentPage + 1)}
          type="button"
        >Next →</button>
      </div>
    {/if}
  </div>
</div>
