<script lang="ts">
  import { onMount } from 'svelte';
  import StatusBadge from '$lib/components/common/StatusBadge.svelte';
  import { subService } from '$lib/services/sub.service';
  import {
    isLoadingSubs,
    subCurrentPage,
    subJobs,
    subPagination,
    subStore
  } from '$lib/stores/sub.store';

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

  function shortId(value: string | undefined): string {
    if (!value) return '--';
    return value.slice(-8);
  }

  onMount(() => {
    subService.loadSubJobs(1);
  });
</script>

<div class="h-full flex flex-col bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border-default)] overflow-hidden">
  <div class="px-4 sm:px-5 py-4 border-b border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
    <h2 class="text-base font-semibold text-[var(--color-text-primary)]">Video Subs</h2>
  </div>

  <div class="p-4 sm:p-5 overflow-y-auto flex-1 min-h-0">
    <div class="space-y-3">
      {#if $isLoadingSubs}
        {#each Array(3) as _}
          <div class="h-52 bg-purple-50 rounded-xl animate-pulse"></div>
        {/each}
      {:else if $subJobs.length === 0}
        <div class="text-center py-12 text-gray-400">
          <p class="text-sm">No subtitle jobs yet.</p>
          <p class="text-xs mt-1">Use "Tạo sub" from a completed composition to create one.</p>
        </div>
      {:else}
        {#each $subJobs as job (job.id)}
          <div class="w-full bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div class="w-full min-h-40 bg-gray-900 flex items-center justify-center">
              {#if job.presigned_s3_url}
                <!-- svelte-ignore a11y-media-has-caption -->
                <video
                  src={job.presigned_s3_url}
                  controls
                  playsinline
                  class="w-full rounded-t-xl max-h-60 bg-black object-contain"
                ></video>
              {:else}
                <div class="px-4 py-6 text-center text-gray-300 text-sm">Output video is not available yet.</div>
              {/if}
            </div>

            <div class="p-4 space-y-2">
              <div class="flex items-center justify-between gap-3">
                <p class="text-sm font-semibold text-gray-800">Sub Job #{shortId(job.id)}</p>
                <StatusBadge status={job.status} />
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
                <p>Composition: #{shortId(job.composition_id)}</p>
                <p>Generation: #{shortId(job.generation_id)}</p>
                <p>Attempts: {job.attempt_count}</p>
                <p>Created: {formatDateTime(job.created_at)}</p>
              </div>
              {#if job.error_message}
                <p class="text-xs text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">{job.error_message}</p>
              {/if}
            </div>
          </div>
        {/each}
      {/if}
    </div>

    {#if $subPagination && $subPagination.totalPages > 1}
      <div class="flex items-center justify-between pt-3 mt-3 border-t border-gray-100 text-xs text-gray-500">
        <button
          class="px-2 py-1 rounded hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed"
          disabled={$subCurrentPage === 1}
          on:click={() => subService.goToPage($subCurrentPage - 1)}
          type="button"
        >← Prev</button>
        <span>{$subCurrentPage} / {$subPagination.totalPages}</span>
        <button
          class="px-2 py-1 rounded hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed"
          disabled={$subCurrentPage === $subPagination.totalPages}
          on:click={() => subService.goToPage($subCurrentPage + 1)}
          type="button"
        >Next →</button>
      </div>
    {/if}

    {#if $subStore.error}
      <div class="mt-4 text-sm text-rose-600">{$subStore.error}</div>
    {/if}
  </div>
</div>
