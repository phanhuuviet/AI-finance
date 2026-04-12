<script lang="ts">
  import { onMount } from 'svelte';
  import StatusBadge from '$lib/components/common/StatusBadge.svelte';
  import ModalDialog from '$lib/components/common/ModalDialog.svelte';
  import { subService } from '$lib/services/sub.service';
  import { RENDER_JOB_STATUS } from '$lib/constants/index.js';
  import { showToast } from '$lib/utils/toast';
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

  function preventAutoplay(event: Event): void {
    const video = event.currentTarget as HTMLVideoElement;
    video.pause();
  }

  let openMenuSubId: string | null = null;
  let showRetrySubConfirm = false;
  let selectedSubIdForRetry: string | null = null;
  let retryingSubId: string | null = null;

  function toggleSubMenu(event: MouseEvent, subId: string): void {
    event.preventDefault();
    event.stopPropagation();
    openMenuSubId = openMenuSubId === subId ? null : subId;
  }

  function closeSubMenu(): void {
    openMenuSubId = null;
  }

  function openRetrySubConfirm(event: MouseEvent, subId: string): void {
    event.preventDefault();
    event.stopPropagation();
    if (retryingSubId) return;
    closeSubMenu();
    selectedSubIdForRetry = subId;
    showRetrySubConfirm = true;
  }

  function closeRetrySubConfirm(): void {
    if (retryingSubId) return;
    showRetrySubConfirm = false;
    selectedSubIdForRetry = null;
  }

  async function confirmRetrySubJob(): Promise<void> {
    if (!selectedSubIdForRetry || retryingSubId) return;

    retryingSubId = selectedSubIdForRetry;
    try {
      await subService.retrySubJob(selectedSubIdForRetry);
      showToast('Video sub retry started.', 'success');
      closeRetrySubConfirm();
      await subService.loadSubJobs($subCurrentPage);
    } catch (err) {
      showToast((err as Error)?.message || 'VIDEO_SUB_RETRY_FAILED', 'error');
    } finally {
      retryingSubId = null;
    }
  }

  function onWindowKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      closeSubMenu();
    }
  }

  onMount(() => {
    subService.loadSubJobs(1);
  });
</script>

<svelte:window on:click={closeSubMenu} on:keydown={onWindowKeydown} />

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
          <div class="w-full text-left">
            <div class="relative flex flex-col md:flex-row gap-0 md:gap-4 bg-white border rounded-xl overflow-hidden hover:border-purple-200 transition-colors duration-150 border-gray-200">
              <div class="md:w-[40%] md:flex-shrink-0 bg-gray-900 flex items-center justify-center min-h-[170px] border-b md:border-b-0 md:border-r border-gray-100">
                {#if job.presigned_s3_url}
                  <!-- svelte-ignore a11y-media-has-caption -->
                  <video
                    src={job.presigned_s3_url}
                    controls
                    playsinline
                    preload="metadata"
                    on:loadedmetadata={preventAutoplay}
                    class="w-full h-56 md:h-full object-contain max-h-64"
                  ></video>
                {:else}
                  <div class="w-full h-56 md:h-full px-4 py-6 flex flex-col items-center justify-center gap-2 text-center
                    {job.status === RENDER_JOB_STATUS.PENDING ? 'bg-gray-50 text-gray-600' : ''}
                    {job.status === RENDER_JOB_STATUS.COMPLETED ? 'bg-green-50 text-green-700' : ''}
                    {job.status === RENDER_JOB_STATUS.FAILED ? 'bg-rose-50 text-rose-700' : ''}
                  ">
                    {#if job.status === RENDER_JOB_STATUS.PENDING}
                      <p class="text-sm">Waiting to process</p>
                    {:else if job.status === RENDER_JOB_STATUS.COMPLETED}
                      <p class="text-sm">Ready</p>
                      <p class="text-xs">No preview URL available yet</p>
                    {:else}
                      <p class="text-sm">Failed</p>
                      {#if job.error_message}
                        <p class="text-xs">{job.error_message}</p>
                      {/if}
                    {/if}
                  </div>
                {/if}
              </div>

              <div class="flex-1 min-w-0 p-4 flex flex-col gap-3">
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="text-xs font-mono font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded truncate">
                      {shortId(job.id)}
                    </span>
                    <span class="text-xs text-gray-400 truncate">Generation #{shortId(job.generation_id)}</span>
                  </div>
                  <div class="relative flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={job.status} />
                    <button
                      type="button"
                      class="w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center"
                      aria-label="Video sub actions"
                      aria-expanded={openMenuSubId === job.id}
                      on:click|stopPropagation={(event) => toggleSubMenu(event, job.id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <circle cx="12" cy="5" r="1.75" fill="currentColor"></circle>
                        <circle cx="12" cy="12" r="1.75" fill="currentColor"></circle>
                        <circle cx="12" cy="19" r="1.75" fill="currentColor"></circle>
                      </svg>
                    </button>

                    {#if openMenuSubId === job.id}
                      <div class="absolute top-9 right-0 z-20 min-w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                        {#if job.status === RENDER_JOB_STATUS.FAILED}
                          <button
                            type="button"
                            class="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 disabled:text-gray-400 disabled:hover:bg-white"
                            on:click|stopPropagation={(event) => openRetrySubConfirm(event, job.id)}
                            disabled={retryingSubId === job.id}
                          >
                            {#if retryingSubId === job.id}Retrying...{:else}Retry{/if}
                          </button>
                        {/if}
                      </div>
                    {/if}
                  </div>
                </div>

                <p class="text-sm font-semibold text-gray-800 line-clamp-1">
                  Sub Job #{shortId(job.id)}
                </p>

                <div class="flex items-center gap-1 text-xs text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" stroke-width="1.5"></circle>
                    <path stroke-linecap="round" stroke-width="1.5" d="M12 6v6l4 2"></path>
                  </svg>
                  <span>Created: <strong class="text-gray-700">{formatDateTime(job.created_at)}</strong></span>
                </div>

                <div class="flex items-center gap-3 text-[11px] text-gray-400 mt-auto pt-2 border-t border-gray-50">
                  <span>Attempts {job.attempt_count}</span>
                  <span>Composition #{shortId(job.composition_id)}</span>
                  <span>ID #{shortId(job.id)}</span>
                </div>
              </div>
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

<ModalDialog
  isOpen={showRetrySubConfirm}
  title="Retry video sub"
  description="Bạn có chắc muốn retry video sub job này không?"
  on:close={closeRetrySubConfirm}
>
  <p class="text-sm text-[var(--color-text-secondary)]">
    Video sub job #{shortId(selectedSubIdForRetry || undefined)} sẽ được gửi retry lại.
  </p>

  <svelte:fragment slot="footer">
    <button
      type="button"
      class="px-3 py-2 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] text-sm"
      on:click={closeRetrySubConfirm}
      disabled={!!retryingSubId}
    >
      Hủy
    </button>
    <button
      type="button"
      class="px-3 py-2 rounded-lg border border-transparent bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
      on:click={confirmRetrySubJob}
      disabled={!!retryingSubId}
    >
      {#if !!retryingSubId}Retrying...{:else}Xác nhận retry{/if}
    </button>
  </svelte:fragment>
</ModalDialog>
