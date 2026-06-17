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
  import { t } from '$lib/i18n';

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

  function openChunkPreview(url: string | null, chunkId: string): void {
    if (!url) return;
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
      showToast($t('compositions.subCreated'), 'success');
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
    class="group inline-flex items-center gap-1.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-card)] px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] hover:border-[var(--border-purple)] hover:text-[var(--purple-700)] hover:bg-[var(--purple-50)]"
    on:click={goBack}
    type="button"
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5">
      <path fill-rule="evenodd" d="M15.53 4.47a.75.75 0 010 1.06L9.06 12l6.47 6.47a.75.75 0 11-1.06 1.06l-7-7a.75.75 0 010-1.06l7-7a.75.75 0 011.06 0z" clip-rule="evenodd" />
    </svg>
    {$t('compositions.backToList')}
  </button>
</div>

{#if $isLoadingCompositionDetail}
  <div class="px-3 sm:px-6 space-y-4">
    <div class="h-24 w-full rounded-2xl bg-gradient-to-r from-[var(--purple-50)] via-[var(--bg-card-hover)] to-[var(--purple-50)] animate-shimmer"></div>
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <div class="lg:col-span-3 aspect-video rounded-2xl bg-gradient-to-r from-[var(--bg-card-hover)] via-[var(--border-subtle)] to-[var(--bg-card-hover)] animate-shimmer"></div>
      <div class="lg:col-span-2 space-y-2">
        {#each Array(3) as _, i}
          <div class="h-20 rounded-xl bg-gradient-to-r from-[var(--bg-card-hover)] via-[var(--border-subtle)] to-[var(--bg-card-hover)] animate-shimmer" style={`animation-delay:${i * 120}ms`}></div>
        {/each}
      </div>
    </div>
  </div>
{:else if $activeComposition}
  <!-- Hero header -->
  <div class="px-3 sm:px-6 py-4">
    <div class="animate-fade-in-up relative overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-4 sm:p-5 shadow-[var(--shadow-soft)]">
      <div class="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full [background:var(--gradient-accent)] opacity-[0.08] blur-2xl"></div>

      <div class="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div class="flex min-w-0 items-start gap-3.5">
          <div class="grid h-12 w-12 shrink-0 place-items-center rounded-xl [background:var(--gradient-accent)] text-white shadow-[0_6px_16px_rgba(99,102,241,0.35)]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-6 w-6">
              <path d="M4.5 5.25A2.25 2.25 0 016.75 3h7.5a2.25 2.25 0 012.25 2.25v.69l3.06-1.53A.75.75 0 0120.75 5v14a.75.75 0 01-1.19.61L16.5 18.06v.69A2.25 2.25 0 0114.25 21h-7.5A2.25 2.25 0 014.5 18.75V5.25z" />
            </svg>
          </div>
          <div class="min-w-0">
            <h1 class="truncate text-lg sm:text-xl font-bold text-[var(--text-primary)]">
              {$t('compositions.composition')} <span class="gradient-text">#{shortId($activeComposition.id)}</span>
            </h1>
            <p class="mt-0.5 text-sm text-[var(--text-muted)]">{$t('compositions.renderedFrom', { id: shortId($activeComposition.generation_id) })}</p>
          </div>
        </div>

        <div class="flex shrink-0 items-center gap-2">
          <StatusBadge status={$activeComposition.status} />
          {#if $activeComposition.status === RENDER_JOB_STATUS.COMPLETED}
            <button
              type="button"
              class="press inline-flex items-center gap-1.5 rounded-lg [background:var(--gradient-accent)] px-3.5 py-2 text-xs font-semibold text-white shadow-[0_2px_10px_rgba(99,102,241,0.3)] hover:opacity-90 hover:shadow-[0_4px_14px_rgba(99,102,241,0.45)]"
              on:click={openCreateSubConfirm}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4">
                <path d="M3.75 4.5A2.25 2.25 0 016 2.25h12A2.25 2.25 0 0120.25 4.5v15a.75.75 0 01-1.2.6L12 14.69 4.95 20.1a.75.75 0 01-1.2-.6v-15z" />
              </svg>
              {$t('compositions.createSub')}
            </button>
          {/if}
        </div>
      </div>

      <div class="relative mt-4 flex flex-wrap gap-2">
        <span class="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-app)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-3.5 w-3.5 text-[var(--purple-500)]"><path d="M3.75 6A2.25 2.25 0 016 3.75h3A2.25 2.25 0 0111.25 6v3A2.25 2.25 0 019 11.25H6A2.25 2.25 0 013.75 9V6zm9 0A2.25 2.25 0 0115 3.75h3A2.25 2.25 0 0120.25 6v3A2.25 2.25 0 0118 11.25h-3A2.25 2.25 0 0112.75 9V6zm-9 9A2.25 2.25 0 016 12.75h3A2.25 2.25 0 0111.25 15v3A2.25 2.25 0 019 20.25H6A2.25 2.25 0 013.75 18v-3zm9 0A2.25 2.25 0 0115 12.75h3A2.25 2.25 0 0120.25 15v3A2.25 2.25 0 0118 20.25h-3A2.25 2.25 0 0112.75 18v-3z" /></svg>
          {$t('common.chunksCount', { count: $activeComposition.chunk_count })}
        </span>
        <span class="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-app)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-3.5 w-3.5 text-[var(--purple-500)]"><path fill-rule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3a.75.75 0 011.5 0v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zM4.5 11.25v8.25a1.5 1.5 0 001.5 1.5h12a1.5 1.5 0 001.5-1.5v-8.25H4.5z" clip-rule="evenodd" /></svg>
          {formatDateTime($activeComposition.created_at)}
        </span>
        <span class="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-purple)] bg-[var(--purple-50)] px-2.5 py-1 text-xs font-medium text-[var(--purple-700)]">
          {$t('common.genShort', { id: shortId($activeComposition.generation_id) })}
        </span>
      </div>
    </div>
  </div>

  <div class="px-3 sm:px-6 pb-6 grid grid-cols-1 lg:grid-cols-5 gap-4">
    <div class="lg:col-span-3 animate-fade-in-up" style="animation-delay:80ms">
      <div class="relative overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[#0b0b0f] shadow-[var(--shadow-medium)] aspect-video flex items-center justify-center">
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
          <div class="flex flex-col items-center gap-3 px-4 py-16 text-center">
            {#if $activeComposition.status === RENDER_JOB_STATUS.PENDING || $activeComposition.status === RENDER_JOB_STATUS.PROCESSING}
              <span class="relative grid h-14 w-14 place-items-center rounded-full bg-white/10">
                <span class="absolute inset-0 rounded-full border-2 border-[var(--purple-400)]/40 border-t-[var(--purple-400)] animate-spin"></span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-6 w-6 text-[var(--purple-200)]"><path d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653z" /></svg>
              </span>
              <p class="text-sm font-medium text-white/90">{$t('compositions.rendering')}</p>
              <p class="text-xs text-white/50">{$t('compositions.renderingHint')}</p>
            {:else if $activeComposition.status === RENDER_JOB_STATUS.FAILED}
              <span class="grid h-14 w-14 place-items-center rounded-full bg-[var(--rose-500)]/15">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-7 w-7 text-[var(--rose-400)]"><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.9.9 0 100-1.8.9.9 0 000 1.8z" clip-rule="evenodd" /></svg>
              </span>
              <p class="text-sm font-semibold text-[var(--rose-400)]">{$t('compositions.failed')}</p>
              {#if $activeComposition.error_message}
                <p class="max-w-md text-xs text-white/50">{$activeComposition.error_message}</p>
              {/if}
            {:else}
              <span class="grid h-14 w-14 place-items-center rounded-full bg-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-7 w-7 text-white/60"><path d="M4.5 5.25A2.25 2.25 0 016.75 3h7.5a2.25 2.25 0 012.25 2.25v.69l3.06-1.53A.75.75 0 0120.75 5v14a.75.75 0 01-1.19.61L16.5 18.06v.69A2.25 2.25 0 0114.25 21h-7.5A2.25 2.25 0 014.5 18.75V5.25z" /></svg>
              </span>
              <p class="text-sm text-white/70">{$t('compositions.videoUnavailable')}</p>
            {/if}
          </div>
        {/if}
      </div>
    </div>

    <div class="lg:col-span-2 animate-fade-in-up" style="animation-delay:160ms">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-sm font-bold uppercase tracking-[0.05em] text-[var(--text-secondary)]">{$t('compositions.chunks')}</h2>
        <span class="inline-flex items-center rounded-full bg-[var(--purple-100)] px-2 py-0.5 text-xs font-semibold text-[var(--purple-700)]">
          {$activeCompositionChunks.length}
        </span>
      </div>

      <div class="space-y-2.5">
        {#each $activeCompositionChunks as chunk, i (chunk.chunk_id + '-' + chunk.sequence)}
          <div
            class="hover-lift animate-fade-in-up flex gap-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-3 shadow-[var(--shadow-soft)]"
            style={`animation-delay:${200 + i * 60}ms`}
          >
            <div class="grid h-7 w-7 shrink-0 place-items-center rounded-full [background:var(--gradient-accent)] text-xs font-bold text-white shadow-[0_2px_6px_rgba(99,102,241,0.35)]">
              {chunk.sequence}
            </div>

            <div class="group relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-[#0b0b0f] ring-1 ring-[var(--border-default)]">
              {#if chunk.presigned_s3_url}
                <button
                  type="button"
                  class="block h-full w-full"
                  on:click={() => openChunkPreview(chunk.presigned_s3_url, chunk.chunk_id)}
                >
                  <!-- svelte-ignore a11y-media-has-caption -->
                  <video
                    src={chunk.presigned_s3_url}
                    muted
                    preload="metadata"
                    on:loadedmetadata={preventAutoplay}
                    class="h-full w-full object-contain"
                  ></video>
                  <div class="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <span class="grid h-7 w-7 place-items-center rounded-full bg-white/90 text-[var(--purple-700)]">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="ml-0.5 h-4 w-4"><path d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653z" /></svg>
                    </span>
                  </div>
                </button>
              {:else}
                <div class="flex h-full w-full items-center justify-center text-[10px] text-white/50">{$t('compositions.noVideo')}</div>
              {/if}
            </div>

            <div class="min-w-0 flex-1">
              <p class="truncate text-xs font-semibold text-[var(--text-primary)]">{chunk.chunk_id}</p>
              <p class="mt-1 inline-flex items-center gap-1 rounded-md bg-[var(--bg-app)] px-1.5 py-0.5 text-[11px] text-[var(--text-muted)]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-3 w-3 text-[var(--purple-400)]"><path fill-rule="evenodd" d="M15.97 2.47a.75.75 0 011.06 0l4.5 4.5a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 11-1.06-1.06l3.22-3.22H3a.75.75 0 010-1.5h16.19l-3.22-3.22a.75.75 0 010-1.06z" clip-rule="evenodd" /></svg>
                {chunk.transition_name}
              </p>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
{:else if $compositionStore.error}
  <div class="px-3 sm:px-6 py-8">
    <div class="flex items-center gap-3 rounded-xl border border-[var(--border-rose)] bg-[var(--rose-50)] px-4 py-3 text-sm text-[var(--rose-600)]">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5 shrink-0"><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.9.9 0 100-1.8.9.9 0 000 1.8z" clip-rule="evenodd" /></svg>
      {$compositionStore.error}
    </div>
  </div>
{/if}

<ModalDialog
  isOpen={showCreateSubConfirm}
  title={$t('compositions.createSubTitle')}
  description={$t('compositions.createSubConfirm')}
  on:close={closeCreateSubConfirm}
>
  <p class="text-sm text-[var(--color-text-secondary)]">
    {$t('compositions.createSubBody', { id: shortId($activeComposition?.id) })}
  </p>

  <svelte:fragment slot="footer">
    <button
      type="button"
      class="px-3 py-2 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] text-sm"
      on:click={closeCreateSubConfirm}
      disabled={$isCreatingSub}
    >
      {$t('common.cancel')}
    </button>
    <button
      type="button"
      class="px-3 py-2 rounded-lg border border-transparent bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
      on:click={confirmCreateSub}
      disabled={$isCreatingSub}
    >
      {#if $isCreatingSub}{$t('common.creating')}{:else}{$t('compositions.confirmCreateSub')}{/if}
    </button>
  </svelte:fragment>
</ModalDialog>

{#if previewUrl}
  <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
    <button
      type="button"
      class="absolute inset-0"
      aria-label={$t('common.close')}
      on:click={closeChunkPreview}
    ></button>

    <div class="animate-pop relative z-10 w-full max-w-6xl max-h-[92vh] bg-black rounded-2xl overflow-hidden border border-white/15 shadow-2xl">
      <div class="flex items-center justify-between px-4 py-3 text-white [background:linear-gradient(90deg,rgba(99,102,241,0.25),rgba(139,92,246,0.18))]">
        <p class="inline-flex items-center gap-2 text-sm font-medium">
          <span class="h-1.5 w-1.5 rounded-full bg-[var(--purple-400)]"></span>
          {$t('compositions.chunkPreview', { label: previewChunkLabel })}
        </p>
        <button
          type="button"
          class="inline-flex items-center gap-1 rounded-lg border border-white/30 px-3 py-1.5 text-xs hover:bg-white/10"
          on:click={closeChunkPreview}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-3.5 w-3.5"><path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clip-rule="evenodd" /></svg>
          {$t('common.close')}
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
