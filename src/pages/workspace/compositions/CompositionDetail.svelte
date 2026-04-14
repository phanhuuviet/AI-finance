<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '../../../app/stores.js';
  import { navigate } from '$lib/router/navigate';
  import { compositionService } from '$lib/services/composition.service';
  import {
    activeComposition,
    activeCompositionChunks,
    isLoadingCompositionDetail,
    compositionStore
  } from '$lib/stores/composition.store';
  import { workspaceStore } from '../../../stores/workspace.js';
  import StatusBadge from '$lib/components/common/StatusBadge.svelte';
  import ModalDialog from '$lib/components/common/ModalDialog.svelte';
  import { showToast } from '$lib/utils/toast';
  import { subService } from '$lib/services/sub.service';
  import { isCreatingSub } from '$lib/stores/sub.store';
  import { RENDER_JOB_STATUS } from '$lib/constants/index.js';

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

  let previewUrl: string | null = null;
  let previewChunkLabel = '';
  let showCreateSubConfirm = false;

  function goBack(): void {
    workspaceStore.setActiveSectionForCurrentSession('compositions');
    navigate(`/workspace/${sessionId}`);
  }

  function openChunkPreview(url: string, chunkId: string): void {
    previewUrl = url;
    previewChunkLabel = chunkId;
  }

  function preventAutoplay(event: Event): void {
    const video = event.currentTarget as HTMLVideoElement;
    video.pause();
  }

  function closeChunkPreview(): void {
    previewUrl = null;
    previewChunkLabel = '';
  }

  function openCreateSubConfirm(): void {
    showCreateSubConfirm = true;
  }

  function closeCreateSubConfirm(): void {
    showCreateSubConfirm = false;
  }

  async function confirmCreateSub(): Promise<void> {
    if (!$activeComposition) return;
    try {
      await subService.createSubJob($activeComposition.id);
      showToast('Sub job created successfully.', 'success');
      closeCreateSubConfirm();
    } catch (err) {
      showToast((err as Error)?.message || 'VIDEO_SUB_CREATE_FAILED', 'error');
    }
  }

  onMount(() => {
    compositionService.loadCompositionDetail(compositionId);
  });
</script>

<div class="px-3 sm:px-6 pt-4 sm:pt-6 pb-2">
  <button
    class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-purple-600 transition-colors"
    on:click={goBack}
    type="button"
  >
    ← Back to compositions
  </button>
</div>

{#if $isLoadingCompositionDetail}
  <div class="px-3 sm:px-6 space-y-4">
    <div class="h-8 w-1/2 bg-purple-50 rounded-lg animate-pulse"></div>
    <div class="h-80 bg-gray-50 rounded-xl animate-pulse"></div>
  </div>
{:else if $activeComposition}
  <div class="px-3 sm:px-6 py-4 border-b border-gray-100">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h1 class="text-lg font-semibold text-gray-800">
          Composition #{shortId($activeComposition.id)}
        </h1>
        <p class="text-sm text-gray-500 mt-0.5">Generation #{shortId($activeComposition.generation_id)}</p>
      </div>
      <div class="flex items-center gap-2">
        <StatusBadge status={$activeComposition.status} />
        {#if $activeComposition.status === RENDER_JOB_STATUS.COMPLETED}
          <button
            type="button"
            class="px-3 py-1.5 text-xs rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors font-medium"
            on:click={openCreateSubConfirm}
          >
            Tạo sub
          </button>
        {/if}
      </div>
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

  <div class="px-3 sm:px-6 py-4 grid grid-cols-1 lg:grid-cols-5 gap-4">
    <div class="lg:col-span-3">
      <div class="bg-gray-900 rounded-xl overflow-hidden aspect-video flex items-center justify-center">
        {#if $activeComposition.presigned_s3_url}
          <!-- svelte-ignore a11y-media-has-caption -->
          <video
            src={$activeComposition.presigned_s3_url}
            controls
            playsinline
            preload="metadata"
            on:loadedmetadata={preventAutoplay}
            class="w-full h-full object-contain"
          ></video>
        {:else}
          <div class="flex flex-col items-center gap-3 text-gray-400 py-16 px-4 text-center">
            {#if $activeComposition.status === RENDER_JOB_STATUS.PENDING || $activeComposition.status === RENDER_JOB_STATUS.PROCESSING}
              <p class="text-sm">Composition is queued for processing</p>
            {:else if $activeComposition.status === RENDER_JOB_STATUS.FAILED}
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

            <div class="group relative flex-shrink-0 w-20 h-14 bg-gray-900 rounded-lg overflow-hidden">
              {#if chunk.presigned_s3_url}
                <button
                  type="button"
                  class="w-full h-full block"
                  on:click={() => openChunkPreview(chunk.presigned_s3_url, chunk.chunk_id)}
                >
                  <!-- svelte-ignore a11y-media-has-caption -->
                  <video
                    src={chunk.presigned_s3_url}
                    muted
                    preload="metadata"
                    on:loadedmetadata={preventAutoplay}
                    class="w-full h-full object-contain"
                  ></video>
                  <div
                    class="absolute inset-0 bg-black/45 text-white text-[10px] font-semibold uppercase tracking-wide flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Preview
                  </div>
                </button>
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
  <div class="px-3 sm:px-6 py-8 text-sm text-rose-600">{$compositionStore.error}</div>
{/if}

<ModalDialog
  isOpen={showCreateSubConfirm}
  title="Tạo phụ đề cho composition"
  description="Bạn có chắc muốn tạo video-subber job cho composition này không?"
  on:close={closeCreateSubConfirm}
>
  <p class="text-sm text-[var(--color-text-secondary)]">
    Composition #{shortId($activeComposition?.id)} sẽ được gửi sang video-subber với style mặc định.
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

{#if previewUrl}
  <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
    <button
      type="button"
      class="absolute inset-0"
      aria-label="Close preview"
      on:click={closeChunkPreview}
    ></button>

    <div class="relative z-10 w-full max-w-6xl max-h-[92vh] bg-black rounded-xl overflow-hidden border border-white/20 shadow-2xl">
      <div class="flex items-center justify-between px-4 py-3 bg-black/80 text-white">
        <p class="text-sm font-medium">Chunk preview: {previewChunkLabel}</p>
        <button
          type="button"
          class="px-3 py-1.5 text-xs rounded-lg border border-white/30 hover:bg-white/10 transition-colors"
          on:click={closeChunkPreview}
        >
          Close
        </button>
      </div>

      <div class="w-full h-[80vh] flex items-center justify-center bg-black">
        <!-- svelte-ignore a11y-media-has-caption -->
        <video
          src={previewUrl}
          controls
          playsinline
          preload="metadata"
          on:loadedmetadata={preventAutoplay}
          class="w-full h-full object-contain"
        ></video>
      </div>
    </div>
  </div>
{/if}
