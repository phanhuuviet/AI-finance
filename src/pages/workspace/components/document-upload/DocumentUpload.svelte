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
  <div class="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
    <h2 class="text-lg sm:text-xl font-semibold mb-4 text-gray-800">{$t("documents.addDocuments")}</h2>

    {#if success}
      <div class="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-md">
        {success}
      </div>
    {/if}

    <div class="mb-4 flex flex-wrap gap-2">
      <Button
        unstyled
        type="button"
        className={`rounded-md border px-3 py-2 text-sm font-medium ${
          activeInputMethod === "upload"
            ? "border-blue-300 bg-blue-50 text-blue-700"
            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
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
            ? "border-blue-300 bg-blue-50 text-blue-700"
            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
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
            ? "border-blue-300 bg-blue-50 text-blue-700"
            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
        }`}
        on:click={() => (activeInputMethod = "paste")}
      >
        Paste Text
      </Button>
    </div>

    {#if activeInputMethod === "upload"}
      <div class="border border-gray-200 rounded-lg p-3 sm:p-4">
        <h3 class="font-medium mb-3 text-gray-700">{$t("documents.uploadFile")}</h3>
        <p class="text-xs text-gray-500 mb-4">
          {$t("documents.supportedFormats")}
        </p>

        <TextField
          bare
          unstyled
          type="file"
          bind:files={file}
          inputClass="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-4"
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
      <div class="border border-gray-200 rounded-lg p-3 sm:p-4">
        <h3 class="font-medium mb-3 text-gray-700">{$t("documents.crawlWebsite")}</h3>
        <p class="text-xs text-gray-500 mb-4">
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
      <div class="border border-gray-200 rounded-lg p-3 sm:p-4">
        <h3 class="font-medium mb-3 text-gray-700">Paste Text</h3>
        <p class="text-xs text-gray-500 mb-4">
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

  <div class="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
    <div class="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-4">
      <h2 class="text-lg sm:text-xl font-semibold text-gray-800">{$t("documents.yourDocuments")}</h2>
      <Button
        variant="ghost"
        size="sm"
        className="px-0 min-h-11"
        on:click={fetchDocuments}
      >
        {$t("common.refresh")}
      </Button>
    </div>

    {#if !sessionId}
      <div
        class="p-4 rounded-md bg-gray-50 border border-gray-200 text-sm text-gray-600"
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
      <p class="text-gray-500 text-center py-4">{$t("documents.empty")}</p>
    {:else}
      <div class="overflow-x-auto" transition:fade={{ duration: 180 }}>
        <table class="w-full min-w-[680px] text-sm text-left text-gray-500">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50">
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
              <tr class="bg-white border-b hover:bg-gray-50">
                <td class="px-3 sm:px-4 py-4">
                  <TextField
                    bare
                    unstyled
                    type="checkbox"
                    checked={selectedSet.has(doc._id)}
                    disabled={!sessionId}
                    on:change={(e) => toggleAttach(doc._id, e)}
                    aria-label={$t("documents.attachToChat", { title: doc.title })}
                    inputClass="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                  />
                </td>
                <td
                  class="px-3 sm:px-4 py-4 font-medium text-gray-900 truncate max-w-[140px] sm:max-w-[200px]"
                  title={doc.title}
                >
                  {doc.title}
                </td>
                <td class="px-3 sm:px-4 py-4">
                  <span class="px-2 py-1 rounded text-xs bg-gray-100 uppercase"
                    >{doc.source_type}</span
                  >
                </td>
                <td class="px-3 sm:px-4 py-4">
                  {#if doc.status === "ready"}
                    <span class="text-green-600 flex items-center gap-1">
                      <span class="w-2 h-2 rounded-full bg-green-500"></span> {$t("documents.statusReady")}
                    </span>
                  {:else if doc.status === "processing"}
                    <span class="text-yellow-600 flex items-center gap-1">
                      <span
                        class="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"
                      ></span> {$t("documents.statusProcessing")}
                    </span>
                  {:else}
                    <span
                      class="text-red-600 flex items-center gap-1"
                      title={String(doc.error_message ?? "")}
                    >
                      <span class="w-2 h-2 rounded-full bg-red-500"></span> {$t("documents.statusFailed")}
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
                    className="px-0 py-0 hover:underline"
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
