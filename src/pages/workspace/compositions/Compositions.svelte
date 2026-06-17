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
  import { subService } from '$lib/services/sub.service';
  import { showToast } from '$lib/utils/toast';
  import ModalDialog from '$lib/components/common/ModalDialog.svelte';
  import { isCreatingSub } from '$lib/stores/sub.store';
  import type { Composition } from '$lib/models/composition.model';

  const PROCESSING_RETRY_TIMEOUT_MS = 10 * 60 * 1000;

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

  function shortId(value: string | undefined): string {
    if (!value) return '--';
    return value.slice(-8);
  }

  function preventAutoplay(event: Event): void {
    const video = event.currentTarget as HTMLVideoElement;
    video.pause();
  }

  function isProcessingTimeoutExceeded(claimedAt: string | null | undefined): boolean {
    if (!claimedAt) return false;
    const claimedTime = new Date(claimedAt).getTime();
    if (Number.isNaN(claimedTime)) return false;
    return Date.now() - claimedTime > PROCESSING_RETRY_TIMEOUT_MS;
  }

  function canRetryComposition(composition: Composition): boolean {
    if (composition.status === RENDER_JOB_STATUS.FAILED) return true;
    if (composition.status === RENDER_JOB_STATUS.PROCESSING) {
      return isProcessingTimeoutExceeded(composition.claimed_at);
    }
    return false;
  }

  function canCreateSub(composition: Composition): boolean {
    return composition.status === RENDER_JOB_STATUS.COMPLETED;
  }

  function hasCompositionActions(composition: Composition): boolean {
    return canRetryComposition(composition) || canCreateSub(composition);
  }

  let showCreateSubConfirm = false;
  let selectedCompositionIdForSub: string | null = null;
  let showRetryCompositionConfirm = false;
  let selectedCompositionIdForRetry: string | null = null;
  let openMenuCompositionId: string | null = null;
  let retryingCompositionId: string | null = null;

  function toggleCompositionMenu(event: MouseEvent, compositionId: string): void {
    event.preventDefault();
    event.stopPropagation();
    openMenuCompositionId = openMenuCompositionId === compositionId ? null : compositionId;
  }

  function closeCompositionMenu(): void {
    openMenuCompositionId = null;
  }

  function openCreateSubConfirm(event: MouseEvent, compositionId: string): void {
    event.preventDefault();
    event.stopPropagation();
    if ($isCreatingSub) return;
    closeCompositionMenu();
    selectedCompositionIdForSub = compositionId;
    showCreateSubConfirm = true;
  }

  function closeCreateSubConfirm(): void {
    if ($isCreatingSub) return;
    showCreateSubConfirm = false;
    selectedCompositionIdForSub = null;
  }

  function openRetryCompositionConfirm(event: MouseEvent, compositionId: string): void {
    event.preventDefault();
    event.stopPropagation();
    if (retryingCompositionId) return;
    closeCompositionMenu();
    selectedCompositionIdForRetry = compositionId;
    showRetryCompositionConfirm = true;
  }

  function closeRetryCompositionConfirm(): void {
    if (retryingCompositionId) return;
    showRetryCompositionConfirm = false;
    selectedCompositionIdForRetry = null;
  }

  async function confirmRetryComposition(): Promise<void> {
    if (!selectedCompositionIdForRetry || retryingCompositionId) return;

    retryingCompositionId = selectedCompositionIdForRetry;
    try {
      await compositionService.retryComposition(selectedCompositionIdForRetry);
      showToast('Composition retry started.', 'success');
      closeRetryCompositionConfirm();
      await compositionService.loadCompositions($compositionCurrentPage);
    } catch (err) {
      showToast((err as Error)?.message || 'COMPOSITION_RETRY_FAILED', 'error');
    } finally {
      retryingCompositionId = null;
    }
  }

  async function confirmCreateSub(): Promise<void> {
    if (!selectedCompositionIdForSub) return;
    try {
      await subService.createSubJob(selectedCompositionIdForSub);
      showToast('Sub job created successfully.', 'success');
      closeCreateSubConfirm();
    } catch (err) {
      showToast((err as Error)?.message || 'VIDEO_SUB_CREATE_FAILED', 'error');
    }
  }

  function onCardKeydown(event: KeyboardEvent, sessionId: string, compositionId: string): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openComposition(sessionId, compositionId);
    }
  }

  function onWindowKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      closeCompositionMenu();
    }
  }

  onMount(() => {
    compositionService.loadCompositions(1);
  });
</script>

<svelte:window on:click={closeCompositionMenu} on:keydown={onWindowKeydown} />

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
        {#each $compositions as composition, i (composition.id)}
          <div
            class="w-full text-left animate-fade-in-up"
            style={`animation-delay:${i * 70}ms`}
            on:click={() => openComposition(composition.session_id, composition.id)}
            on:keydown={(event) => onCardKeydown(event, composition.session_id, composition.id)}
            role="button"
            tabindex="0"
          >
            <div class="hover-lift relative flex flex-col md:flex-row gap-0 md:gap-4 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl overflow-hidden shadow-[var(--shadow-soft)] hover:border-[var(--border-purple)]">
              <div class="md:w-[40%] md:flex-shrink-0 border-b md:border-b-0 md:border-r border-[var(--border-subtle)]">
                <div class="relative w-full aspect-video bg-[#0b0b0f]">
                  {#if composition.presigned_s3_url}
                    <!-- svelte-ignore a11y-media-has-caption -->
                    <video
                      src={composition.presigned_s3_url}
                      controls
                      playsinline
                      preload="metadata"
                      on:loadedmetadata={preventAutoplay}
                      class="absolute inset-0 h-full w-full object-contain"
                    ></video>
                  {:else}
                    <div class="absolute inset-0 px-4 py-6 flex flex-col items-center justify-center gap-2 text-center
                      {composition.status === RENDER_JOB_STATUS.PENDING ? 'bg-gray-50 text-gray-600' : ''}
                      {composition.status === RENDER_JOB_STATUS.PROCESSING ? 'bg-amber-50 text-amber-700' : ''}
                      {composition.status === RENDER_JOB_STATUS.COMPLETED ? 'bg-green-50 text-green-700' : ''}
                      {composition.status === RENDER_JOB_STATUS.FAILED ? 'bg-rose-50 text-rose-700' : ''}
                    ">
                      {#if composition.status === RENDER_JOB_STATUS.PENDING}
                        <p class="text-sm">Waiting to process</p>
                      {:else if composition.status === RENDER_JOB_STATUS.PROCESSING}
                        <p class="text-sm">Processing</p>
                      {:else if composition.status === RENDER_JOB_STATUS.COMPLETED}
                        <p class="text-sm">Ready</p>
                        <p class="text-xs">No preview URL available yet</p>
                      {:else}
                        <p class="text-sm">Failed</p>
                        {#if composition.error_message}
                          <p class="text-xs line-clamp-3">{composition.error_message}</p>
                        {/if}
                      {/if}
                    </div>
                  {/if}
                </div>
              </div>

              <div class="flex-1 min-w-0 p-4 flex flex-col gap-3">
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="text-xs font-mono font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded truncate">
                      {shortId(composition.id)}
                    </span>
                    <span class="text-xs text-gray-400 truncate">Generation #{shortId(composition.generation_id)}</span>
                  </div>
                  <div class="relative flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={composition.status} />
                    {#if hasCompositionActions(composition)}
                      <button
                        type="button"
                        class="w-8 h-8 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center"
                        aria-label="Composition actions"
                        aria-expanded={openMenuCompositionId === composition.id}
                        on:click|stopPropagation={(event) => toggleCompositionMenu(event, composition.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <circle cx="12" cy="5" r="1.75" fill="currentColor"></circle>
                          <circle cx="12" cy="12" r="1.75" fill="currentColor"></circle>
                          <circle cx="12" cy="19" r="1.75" fill="currentColor"></circle>
                        </svg>
                      </button>
                    {/if}

                    {#if hasCompositionActions(composition) && openMenuCompositionId === composition.id}
                      <div class="absolute top-9 right-0 z-20 min-w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                        {#if canRetryComposition(composition)}
                          <button
                            type="button"
                            class="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 disabled:text-gray-400 disabled:hover:bg-white"
                            on:click|stopPropagation={(event) => openRetryCompositionConfirm(event, composition.id)}
                            disabled={retryingCompositionId === composition.id}
                          >
                            {#if retryingCompositionId === composition.id}Retrying...{:else}Retry{/if}
                          </button>
                        {/if}
                        {#if canCreateSub(composition)}
                          <button
                            type="button"
                            class="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 disabled:text-gray-400 disabled:hover:bg-white"
                            on:click|stopPropagation={(event) => openCreateSubConfirm(event, composition.id)}
                            disabled={$isCreatingSub}
                          >
                            Tạo sub
                          </button>
                        {/if}
                      </div>
                    {/if}
                  </div>
                </div>

                <p class="text-sm font-semibold text-gray-800 line-clamp-1">
                  Composition #{shortId(composition.id)}
                </p>

                <div class="flex items-center gap-1 text-xs text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" stroke-width="1.5"></circle>
                    <path stroke-linecap="round" stroke-width="1.5" d="M12 6v6l4 2"></path>
                  </svg>
                  <span>Created: <strong class="text-gray-700">{formatDateTime(composition.created_at)}</strong></span>
                </div>

                <div class="flex items-center gap-3 text-[11px] text-gray-400 mt-auto pt-2 border-t border-gray-50">
                  <span>{composition.chunk_count} chunk(s)</span>
                  <span>Session #{shortId(composition.session_id)}</span>
                  <span>ID #{shortId(composition.id)}</span>
                </div>
              </div>
            </div>
          </div>
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

<ModalDialog
  isOpen={showCreateSubConfirm}
  title="Tạo phụ đề cho composition"
  description="Bạn có chắc muốn tạo video-subber job cho composition này không?"
  on:close={closeCreateSubConfirm}
>
  <p class="text-sm text-[var(--color-text-secondary)]">
    Composition #{shortId(selectedCompositionIdForSub || undefined)} sẽ được gửi sang video-subber với style mặc định.
  </p>

  <svelte:fragment slot="footer">
    <button
      type="button"
      class="px-3 py-2 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] text-sm"
      on:click={closeCreateSubConfirm}
      disabled={$isCreatingSub}
    >
      Hủy
    </button>
    <button
      type="button"
      class="px-3 py-2 rounded-lg border border-transparent bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
      on:click={confirmCreateSub}
      disabled={$isCreatingSub}
    >
      {#if $isCreatingSub}Đang tạo...{:else}Xác nhận tạo sub{/if}
    </button>
  </svelte:fragment>
</ModalDialog>

<ModalDialog
  isOpen={showRetryCompositionConfirm}
  title="Retry composition"
  description="Bạn có chắc muốn retry composition này không?"
  on:close={closeRetryCompositionConfirm}
>
  <p class="text-sm text-[var(--color-text-secondary)]">
    Composition #{shortId(selectedCompositionIdForRetry || undefined)} sẽ được gửi retry lại.
  </p>

  <svelte:fragment slot="footer">
    <button
      type="button"
      class="px-3 py-2 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] text-sm"
      on:click={closeRetryCompositionConfirm}
      disabled={!!retryingCompositionId}
    >
      Hủy
    </button>
    <button
      type="button"
      class="px-3 py-2 rounded-lg border border-transparent bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
      on:click={confirmRetryComposition}
      disabled={!!retryingCompositionId}
    >
      {#if !!retryingCompositionId}Retrying...{:else}Xác nhận retry{/if}
    </button>
  </svelte:fragment>
</ModalDialog>
