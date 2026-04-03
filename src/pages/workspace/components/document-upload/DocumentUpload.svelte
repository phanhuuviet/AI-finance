<script>
  import { fade } from "svelte/transition";
  import { onMount } from "svelte";
  import { dashboardStore } from "../../../../stores/dashboard.js";
  import { workspaceStore } from "../../../../stores/workspace.js";
  import { attachmentsStore } from "../../../../stores/attachments.js";
  import Button from "$lib/components/common/Button.svelte";
  import TextField from "$lib/components/common/TextField.svelte";
  import TextareaField from "$lib/components/common/TextareaField.svelte";
  import LoadingBlock from "$lib/components/common/LoadingBlock.svelte";
  import ErrorFallback from "$lib/components/common/ErrorFallback.svelte";
  import { t } from "../../../../lib/i18n";

  /** @typedef {import('../../../../lib/models').DocumentItem} DocumentItem */

  /** @type {FileList | null} */
  let file = null;
  let url = "";
  let activeInputMethod = "upload";
  let pastedText = `Artificial intelligence (AI) is transforming industries worldwide.
From healthcare diagnostics to financial forecasting, AI systems are
enabling faster, more accurate decision-making. This document explores
key trends, challenges, and opportunities in enterprise AI adoption
through 2025 and beyond.`;
  let success = "";

  /** @type {string | null} */
  let sessionId = null;
  /** @type {Set<string>} */
  let selectedSet = new Set();

  $: sessionId = $workspaceStore.currentSessionId;
  $: documentsState = $dashboardStore.documents;
  /** @type {DocumentItem[]} */
  $: documents = documentsState.data || [];
  $: selectedSet = sessionId
    ? ($attachmentsStore[sessionId] ?? new Set())
    : new Set();

  onMount(() => {
    dashboardStore.fetchDocuments();
  });

  async function fetchDocuments() {
    await dashboardStore.fetchDocuments();
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

  function handleAddText() {
    if (!pastedText.trim()) return;

    // Mock action only: this lets QA verify the pasted content payload quickly.
    console.log("Pasted text content:", pastedText);
    success = "Text added successfully.";
  }

  /**
   * @param {string} docId
   * @param {Event} e
   */
  function toggleAttach(docId, e) {
    const target = /** @type {HTMLInputElement} */ (e.currentTarget);
    attachmentsStore.toggleDocument(sessionId, docId, target.checked);
  }

  async function deleteDocument(id) {
    if (!confirm($t("documents.confirmDelete"))) return;

    try {
      await dashboardStore.deleteDocument(id);
    } catch (err) {
      alert($t("documents.deleteFailed", { message: err.message }));
    }
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
          disabled={!pastedText.trim()}
          rounded="rounded-md"
        >
          Add Text
        </Button>
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

    {#if !sessionId}
      <div
        class="p-4 rounded-md bg-[var(--color-bg-app)] border border-[var(--color-border-default)] text-sm text-[var(--color-text-secondary)]"
      >
        {$t("documents.selectSessionHint")}
      </div>
    {/if}

    {#if documentsState.loading}
      <div class="overflow-x-auto" aria-live="polite">
        <div class="space-y-3 py-2">
          <LoadingBlock rows={1} rowHeight="h-8" active={documentsState.showLoading} />
          <LoadingBlock rows={6} rowHeight="h-12" active={documentsState.showLoading} />
        </div>
      </div>
    {:else if documentsState.error}
      <ErrorFallback
        compact={true}
        message={documentsState.error}
        retryLabel={$t("documents.retryDocuments")}
        on:retry={fetchDocuments}
      />
    {:else if documents.length === 0}
      <p class="text-[var(--color-text-muted)] text-center py-4">{$t("documents.empty")}</p>
    {:else}
      <div class="overflow-x-auto" transition:fade={{ duration: 180 }}>
        <table class="w-full min-w-[680px] text-sm text-left text-[var(--color-text-secondary)]">
          <thead class="text-xs uppercase bg-[var(--color-bg-app)] text-[var(--color-text-muted)] border-b border-[var(--color-border-default)] tracking-[0.06em]">
            <tr>
              <th scope="col" class="px-3 sm:px-4 py-3">{$t("documents.attach")}</th>
              <th scope="col" class="px-3 sm:px-4 py-3">{$t("documents.title")}</th>
              <th scope="col" class="px-3 sm:px-4 py-3">{$t("documents.source")}</th>
              <th scope="col" class="px-3 sm:px-4 py-3">{$t("common.status")}</th>
              <th scope="col" class="px-3 sm:px-4 py-3">{$t("documents.dateAdded")}</th>
              <th scope="col" class="px-3 sm:px-4 py-3 text-right">{$t("common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {#each documents as doc}
              <tr class="bg-transparent border-b border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-hover)]">
                <td class="px-3 sm:px-4 py-4">
                  <TextField
                    bare
                    unstyled
                    type="checkbox"
                    checked={selectedSet.has(doc._id)}
                    disabled={!sessionId}
                    on:change={(e) => toggleAttach(doc._id, e)}
                    aria-label={$t("documents.attachToChat", { title: doc.title })}
                    inputClass="h-4 w-4 rounded border-[var(--color-border-default)] text-[var(--color-accent)] focus:[box-shadow:0_0_0_3px_rgba(91,79,207,0.12)] disabled:opacity-50 accent-[var(--color-accent)]"
                  />
                </td>
                <td
                  class="px-3 sm:px-4 py-4 font-medium text-[var(--color-text-primary)] truncate max-w-[140px] sm:max-w-[200px]"
                  title={doc.title}
                >
                  {doc.title}
                </td>
                <td class="px-3 sm:px-4 py-4">
                  <span class="px-2 py-1 rounded-md text-[11px] font-medium uppercase tracking-[0.04em] bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] border border-[var(--color-border-default)]"
                    >{doc.source_type}</span
                  >
                </td>
                <td class="px-3 sm:px-4 py-4">
                  {#if doc.status === "ready"}
                    <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-[var(--color-status-ready-border)] bg-[var(--color-status-ready-bg)] text-[var(--color-status-ready)] text-xs font-medium">
                      <span class="w-2 h-2 rounded-full bg-[var(--color-status-ready)]"></span> {$t("documents.statusReady")}
                    </span>
                  {:else if doc.status === "processing"}
                    <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-[var(--color-status-processing-border)] bg-[var(--color-status-processing-bg)] text-[var(--color-status-processing)] text-xs font-medium">
                      <span
                        class="w-2 h-2 rounded-full bg-[var(--color-status-processing)]"
                      ></span> {$t("documents.statusProcessing")}
                    </span>
                  {:else}
                    <span
                      class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-[var(--color-danger-light)] bg-[var(--color-status-error-bg)] text-[var(--color-status-error)] text-xs font-medium"
                      title={String(doc.error_message ?? "")}
                    >
                      <span class="w-2 h-2 rounded-full bg-[var(--color-status-error)]"></span> {$t("documents.statusFailed")}
                    </span>
                  {/if}
                </td>
                <td class="px-3 sm:px-4 py-4"
                  >{new Date(doc.created_at).toLocaleDateString()}</td
                >
                <td class="px-3 sm:px-4 py-4 text-right">
                  <Button
                    variant="danger"
                    size="sm"
                    className="px-3 py-1.5 rounded-md"
                    on:click={() => deleteDocument(doc._id)}
                  >
                    {$t("common.delete")}
                  </Button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>
