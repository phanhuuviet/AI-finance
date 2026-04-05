<script>
  import { fade } from "svelte/transition";
  import { onMount } from "svelte";
  import { dashboardStore } from "../../../../stores/dashboard.js";
  import { documentService } from "$lib/services/document.service";
  import {
    documentStore,
    documents,
    documentPagination,
    currentPage,
    isCreatingDoc,
  } from "$lib/stores/document.store";
  import Button from "$lib/components/common/Button.svelte";
  import TextField from "$lib/components/common/TextField.svelte";
  import TextareaField from "$lib/components/common/TextareaField.svelte";
  import LoadingBlock from "$lib/components/common/LoadingBlock.svelte";
  import ErrorFallback from "$lib/components/common/ErrorFallback.svelte";
  import { t } from "../../../../lib/i18n";

  /** @type {FileList | null} */
  let file = null;
  let url = "";
  let activeInputMethod = "upload";
  let title = "";
  let pastedText = `Artificial intelligence (AI) is transforming industries worldwide.
From healthcare diagnostics to financial forecasting, AI systems are
enabling faster, more accurate decision-making. This document explores
key trends, challenges, and opportunities in enterprise AI adoption
through 2025 and beyond.`;
  let success = "";

  $: documentsState = $dashboardStore.documents;
  $: documentState = $documentStore;

  onMount(() => {
    documentService.loadDocuments(1);
  });

  async function fetchDocuments() {
    await documentService.loadDocuments($currentPage);
  }

  async function handleFileUpload() {
    if (!file) return;

    success = "";

    try {
      await dashboardStore.uploadDocument(file[0]);
      success = $t("documents.uploadedSuccess");
      file = null;
    } catch (err) {
      console.error(err);
    }
  }

  async function handleCrawl() {
    if (!url) return;

    success = "";

    try {
      await dashboardStore.crawlWebsite(url);
      success = $t("documents.crawlStarted");
      url = "";
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAddText() {
    if (!title.trim() || !pastedText.trim()) return;
    try {
      await documentService.createDocument(title.trim(), pastedText.trim());
      title = "";
      pastedText = "";
    } catch {
      // error is displayed from $documentStore.error
    }
  }

  function truncateContent(content) {
    if (!content) return "";
    return content.length > 80 ? `${content.slice(0, 80)}...` : content;
  }

  function formatDateTime(value) {
    const date = new Date(value);
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  }

  function statusLabel(status) {
    if (status === "processed") return "Ready";
    if (status === "processing") return "Processing";
    return "Error";
  }

  function statusDotClass(status) {
    if (status === "processed") return "bg-[var(--green-500,#10B981)]";
    if (status === "processing") return "bg-[var(--amber-500,#F59E0B)] animate-pulse";
    return "bg-[var(--rose-500,#F43F5E)]";
  }

  function sourceTypeClass(sourceType) {
    if (sourceType === "raw") return "bg-[var(--teal-50,#F0FDFA)] text-[var(--teal-600,#0D9488)]";
    if (sourceType === "url") return "bg-[var(--blue-50,#EFF6FF)] text-[var(--blue-600,#2563EB)]";
    return "bg-[var(--amber-50,#FFFBEB)] text-[var(--amber-600,#D97706)]";
  }
</script>

<div class="w-full max-w-5xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
  <div class="bg-[var(--color-bg-surface)] p-4 sm:p-6 rounded-xl border border-[var(--color-border-default)]">
    <h2 class="text-lg sm:text-xl font-semibold mb-4 text-[var(--color-text-primary)]">{$t("documents.addDocuments")}</h2>

    {#if success}
      <div class="p-3 mb-4 text-sm text-[var(--color-status-ready)] bg-[var(--color-status-ready-bg)] border border-[var(--color-status-ready-border)] rounded-md">
        {success}
      </div>
    {/if}

    <div class="mb-4 flex flex-wrap gap-2 rounded-lg bg-[var(--color-bg-app)] p-1">
      <Button
        unstyled
        type="button"
        className={`rounded-md border px-3 py-2 text-sm font-medium ${
          activeInputMethod === "upload"
            ? "bg-[var(--color-bg-elevated)] text-[var(--color-accent-text)] border-[var(--color-border-accent)]"
            : "bg-transparent text-[var(--color-text-secondary)] border-transparent hover:text-[var(--color-text-primary)]"
        }`}
        on:click={() => (activeInputMethod = "upload")}
      >
        {$t("documents.uploadFile")}
      </Button>
      <Button
        unstyled
        type="button"
        className={`rounded-md border px-3 py-2 text-sm font-medium ${
          activeInputMethod === "crawl"
            ? "bg-[var(--color-bg-elevated)] text-[var(--color-accent-text)] border-[var(--color-border-accent)]"
            : "bg-transparent text-[var(--color-text-secondary)] border-transparent hover:text-[var(--color-text-primary)]"
        }`}
        on:click={() => (activeInputMethod = "crawl")}
      >
        {$t("documents.crawlWebsite")}
      </Button>
      <Button
        unstyled
        type="button"
        className={`rounded-md border px-3 py-2 text-sm font-medium ${
          activeInputMethod === "paste"
            ? "bg-[var(--color-bg-elevated)] text-[var(--color-accent-text)] border-[var(--color-border-accent)]"
            : "bg-transparent text-[var(--color-text-secondary)] border-transparent hover:text-[var(--color-text-primary)]"
        }`}
        on:click={() => (activeInputMethod = "paste")}
      >
        Paste Text
      </Button>
    </div>

    {#if activeInputMethod === "upload"}
      <div class="border border-[var(--color-border-default)] rounded-xl p-3 sm:p-4 bg-[var(--color-bg-surface)]">
        <h3 class="font-medium mb-3 text-[var(--color-text-primary)]">{$t("documents.uploadFile")}</h3>
        <p class="text-xs text-[var(--color-text-secondary)] mb-4">
          {$t("documents.supportedFormats")}
        </p>

        <TextField
          bare
          unstyled
          type="file"
          bind:files={file}
          inputClass="block w-full text-sm text-[var(--color-text-secondary)] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-[var(--color-border-accent)] file:text-sm file:font-semibold file:bg-[var(--color-accent-light)] file:text-[var(--color-accent-text)] hover:file:bg-[var(--color-bg-active)] mb-4"
        />

        <Button
          block
          on:click={handleFileUpload}
          disabled={!file || documentsState.loading}
          rounded="rounded-md"
        >
          {documentsState.loading && file ? $t("documents.uploading") : $t("documents.uploadFile")}
        </Button>
      </div>
    {:else if activeInputMethod === "crawl"}
      <div class="border border-[var(--color-border-default)] rounded-xl p-3 sm:p-4 bg-[var(--color-bg-surface)]">
        <h3 class="font-medium mb-3 text-[var(--color-text-primary)]">{$t("documents.crawlWebsite")}</h3>
        <p class="text-xs text-[var(--color-text-secondary)] mb-4">
          {$t("documents.crawlHint")}
        </p>

        <TextField
          type="url"
          label=" "
          hideLabel={true}
          placeholder={$t("documents.crawlPlaceholder")}
          bind:value={url}
          containerClass="mb-4"
        />

        <Button
          block
          on:click={handleCrawl}
          disabled={!url || documentsState.loading}
          rounded="rounded-md"
        >
          {documentsState.loading && url ? $t("documents.crawling") : $t("documents.extractContent")}
        </Button>
      </div>
    {:else}
      <div class="border border-[var(--color-border-default)] rounded-xl p-3 sm:p-4 bg-[var(--color-bg-surface)]">
        <h3 class="font-medium mb-3 text-[var(--color-text-primary)]">Paste Text</h3>
        <p class="text-xs text-[var(--color-text-secondary)] mb-4">
          Paste or type raw content directly into the workspace.
        </p>

        <TextField
          bind:value={title}
          label="Title"
          placeholder="Enter document title..."
          required
          containerClass="mb-4"
        />

        <TextareaField
          id="pasted_text_document"
          label=" "
          hideLabel={true}
          bind:value={pastedText}
          rows={8}
          placeholder="Paste or type your content here..."
          textareaClass="mb-4 min-h-[160px] resize-y"
        />

        <Button
          block
          on:click={handleAddText}
          disabled={!title.trim() || !pastedText.trim() || $isCreatingDoc}
          rounded="rounded-md"
        >
          {$isCreatingDoc ? "Saving..." : "Add Text"}
        </Button>

        {#if documentState.error}
          <p class="mt-3 text-sm text-[var(--color-danger)]">{documentState.error}</p>
        {/if}
      </div>
    {/if}
  </div>

  <div class="bg-[var(--color-bg-surface)] p-4 sm:p-6 rounded-xl border border-[var(--color-border-default)]">
    <div class="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-4">
      <h2 class="text-lg sm:text-xl font-semibold text-[var(--color-text-primary)]">{$t("documents.yourDocuments")}</h2>
      <Button
        variant="ghost"
        size="sm"
        className="px-0 min-h-11 text-[var(--color-accent-text)] hover:text-[var(--color-accent)]"
        on:click={fetchDocuments}
      >
        {$t("common.refresh")}
      </Button>
    </div>

    {#if documentState.isLoading}
      <div class="overflow-x-auto" aria-live="polite">
        <div class="space-y-3 py-2">
          <LoadingBlock rows={1} rowHeight="h-8" active={documentState.isLoading} />
          <LoadingBlock rows={6} rowHeight="h-12" active={documentState.isLoading} />
        </div>
      </div>
    {:else if documentState.error}
      <ErrorFallback
        compact={true}
        message={documentState.error}
        retryLabel={$t("documents.retryDocuments")}
        on:retry={fetchDocuments}
      />
    {:else if $documents.length === 0}
      <p class="text-[var(--color-text-muted)] text-center py-4">{$t("documents.empty")}</p>
    {:else}
      <div class="overflow-x-auto" transition:fade={{ duration: 180 }}>
        <table class="w-full min-w-[680px] text-sm text-left text-[var(--color-text-secondary)]">
          <thead class="text-xs uppercase bg-[var(--color-bg-app)] text-[var(--color-text-muted)] border-b border-[var(--color-border-default)] tracking-[0.06em]">
            <tr>
              <th scope="col" class="px-3 sm:px-4 py-3">Title</th>
              <th scope="col" class="px-3 sm:px-4 py-3">Content</th>
              <th scope="col" class="px-3 sm:px-4 py-3">Source Type</th>
              <th scope="col" class="px-3 sm:px-4 py-3">Status</th>
              <th scope="col" class="px-3 sm:px-4 py-3">Created At</th>
            </tr>
          </thead>
          <tbody>
            {#each $documents as document}
              <tr class="bg-transparent border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-hover)]">
                <td
                  class="px-3 sm:px-4 py-4 font-medium text-[var(--color-text-primary)] truncate max-w-[140px] sm:max-w-[200px]"
                  title={document.title}
                >
                  {#if document.source_url}
                    <a
                      href={document.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-[var(--color-accent-text)] hover:underline"
                    >
                      {document.title}
                    </a>
                  {:else}
                    <span>{document.title}</span>
                  {/if}
                </td>

                <td class="px-3 sm:px-4 py-4 max-w-[320px] truncate" title={document.content}>
                  {truncateContent(document.content)}
                </td>

                <td class="px-3 sm:px-4 py-4">
                  <span class={`inline-flex rounded-md px-2 py-1 text-[11px] font-medium uppercase tracking-[0.04em] ${sourceTypeClass(document.source_type)}`}>
                    {document.source_type}
                  </span>
                </td>

                <td class="px-3 sm:px-4 py-4">
                  <span class="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-text-secondary)]">
                    <span class={`h-2 w-2 rounded-full ${statusDotClass(document.status)}`}></span>
                    {statusLabel(document.status)}
                  </span>
                </td>

                <td class="px-3 sm:px-4 py-4">
                  {formatDateTime(document.created_at)}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>

        {#if $documentPagination && $documentPagination.totalPages > 1}
          <div class="pagination">
            <span class="pagination-info">
              Showing {($currentPage - 1) * 20 + 1}-{Math.min($currentPage * 20, $documentPagination.total)} of {$documentPagination.total}
            </span>
            <div class="pagination-controls">
              <button
                disabled={$currentPage === 1}
                on:click={() => documentService.goToPage($currentPage - 1)}
              >
                &larr; Prev
              </button>

              {#each Array($documentPagination.totalPages) as _, i}
                <button
                  class:active={$currentPage === i + 1}
                  on:click={() => documentService.goToPage(i + 1)}
                >
                  {i + 1}
                </button>
              {/each}

              <button
                disabled={$currentPage === $documentPagination.totalPages}
                on:click={() => documentService.goToPage($currentPage + 1)}
              >
                Next &rarr;
              </button>
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
    border-top: 1px solid var(--border-subtle);
  }

  .pagination-info {
    font-size: 13px;
    color: var(--text-secondary);
  }

  .pagination-controls {
    display: flex;
    gap: 4px;
  }

  .pagination-controls button {
    min-width: 32px;
    height: 32px;
    padding: 0 8px;
    border-radius: var(--radius-sm, 6px);
    border: 1px solid var(--border-default);
    background: var(--bg-card);
    color: var(--text-primary);
    font-size: 13px;
    cursor: pointer;
  }

  .pagination-controls button:hover:not(:disabled) {
    background: var(--purple-50);
    border-color: var(--border-purple);
  }

  .pagination-controls button.active {
    background: var(--gradient-accent);
    color: #ffffff;
    border-color: transparent;
    font-weight: 600;
  }

  .pagination-controls button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
</style>
