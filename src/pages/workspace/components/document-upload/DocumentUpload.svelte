<script>
  import { dashboardService } from "../../../../lib/services/dashboard.service";
  import { onMount } from "svelte";
  import { workspaceStore } from "../../../../stores/workspace.js";
  import { attachmentsStore } from "../../../../stores/attachments.js";
  import Button from "../../../../components/common/Button.svelte";
  import TextField from "../../../../components/common/form/TextField.svelte";

  /** @typedef {import('../../../../lib/models').DocumentItem} DocumentItem */

  /** @type {FileList | null} */
  let file = null;
  let url = "";
  let uploading = false;
  let error = "";
  let success = "";
  /** @type {DocumentItem[]} */
  let documents = [
  ];

  /** @type {string | null} */
  let sessionId = null;
  /** @type {Set<string>} */
  let selectedSet = new Set();

  $: sessionId = $workspaceStore.currentSessionId;
  $: selectedSet = sessionId
    ? ($attachmentsStore[sessionId] ?? new Set())
    : new Set();

  onMount(fetchDocuments);

  async function fetchDocuments() {
    try {
      documents = /** @type {DocumentItem[]} */ (await dashboardService.getDocuments());
    } catch (e) {
      console.error("Failed to fetch documents", e);
    }
  }

  async function handleFileUpload() {
    if (!file) return;

    uploading = true;
    error = "";
    success = "";

    try {
      await dashboardService.uploadDocument(file[0]);
      success = "Document uploaded successfully and is being processed.";
      file = null;
      await fetchDocuments();
    } catch (err) {
      error = err.message || "Failed to upload document";
    } finally {
      uploading = false;
    }
  }

  async function handleCrawl() {
    if (!url) return;

    uploading = true;
    error = "";
    success = "";

    try {
      await dashboardService.crawlWebsite(url);
      success = "Website crawling started.";
      url = "";
      await fetchDocuments();
    } catch (err) {
      error = err.message || "Failed to crawl website";
    } finally {
      uploading = false;
    }
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
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      await dashboardService.deleteDocument(id);
      await fetchDocuments();
    } catch (err) {
      alert("Failed to delete document: " + err.message);
    }
  }
</script>

<div class="max-w-4xl mx-auto space-y-8">
  <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <h2 class="text-xl font-semibold mb-4 text-gray-800">Add Documents</h2>

    {#if error}
      <div class="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-md">
        {error}
      </div>
    {/if}
    {#if success}
      <div class="p-3 mb-4 text-sm text-green-700 bg-green-100 rounded-md">
        {success}
      </div>
    {/if}

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="border border-gray-200 rounded-lg p-4">
        <h3 class="font-medium mb-3 text-gray-700">Upload File</h3>
        <p class="text-xs text-gray-500 mb-4">
          Supported: PDF, TXT, CSV, JSON (Max 50MB)
        </p>

        <input
          type="file"
          bind:files={file}
          class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-4"
        />

        <Button
          block
          on:click={handleFileUpload}
          disabled={!file || uploading}
          rounded="rounded-md"
        >
          {uploading && file ? "Uploading..." : "Upload File"}
        </Button>
      </div>

      <div class="border border-gray-200 rounded-lg p-4">
        <h3 class="font-medium mb-3 text-gray-700">Crawl Website</h3>
        <p class="text-xs text-gray-500 mb-4">
          Enter a valid URL to extract content
        </p>

        <TextField
          type="url"
          label=" "
          hideLabel={true}
          placeholder="https://example.com"
          bind:value={url}
          containerClass="mb-4"
        />

        <Button
          block
          on:click={handleCrawl}
          disabled={!url || uploading}
          rounded="rounded-md"
        >
          {uploading && url ? "Crawling..." : "Extract Content"}
        </Button>
      </div>
    </div>
  </div>

  <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold text-gray-800">Your Documents</h2>
      <Button
        variant="ghost"
        size="sm"
        className="px-0"
        on:click={fetchDocuments}
      >
        Refresh
      </Button>
    </div>

    {#if !sessionId}
      <div
        class="p-4 rounded-md bg-gray-50 border border-gray-200 text-sm text-gray-600"
      >
        Chọn một cuộc trò chuyện trước để bật lựa chọn “đính kèm vào chat”.
      </div>
    {/if}

    {#if documents.length === 0}
      <p class="text-gray-500 text-center py-4">No documents added yet.</p>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left text-gray-500">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3">Attach</th>
              <th scope="col" class="px-6 py-3">Title</th>
              <th scope="col" class="px-6 py-3">Source</th>
              <th scope="col" class="px-6 py-3">Status</th>
              <th scope="col" class="px-6 py-3">Date Added</th>
              <th scope="col" class="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each documents as doc}
              <tr class="bg-white border-b hover:bg-gray-50">
                <td class="px-6 py-4">
                  <input
                    type="checkbox"
                    disabled={!sessionId}
                    checked={selectedSet.has(doc._id)}
                    on:change={(e) => toggleAttach(doc._id, e)}
                    aria-label={`Attach ${doc.title} to chat`}
                    class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                  />
                </td>
                <td
                  class="px-6 py-4 font-medium text-gray-900 truncate max-w-[200px]"
                  title={doc.title}
                >
                  {doc.title}
                </td>
                <td class="px-6 py-4">
                  <span class="px-2 py-1 rounded text-xs bg-gray-100 uppercase"
                    >{doc.source_type}</span
                  >
                </td>
                <td class="px-6 py-4">
                  {#if doc.status === "ready"}
                    <span class="text-green-600 flex items-center gap-1">
                      <span class="w-2 h-2 rounded-full bg-green-500"></span> Ready
                    </span>
                  {:else if doc.status === "processing"}
                    <span class="text-yellow-600 flex items-center gap-1">
                      <span
                        class="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"
                      ></span> Processing
                    </span>
                  {:else}
                    <span
                      class="text-red-600 flex items-center gap-1"
                      title={String(doc.error_message ?? "")}
                    >
                      <span class="w-2 h-2 rounded-full bg-red-500"></span> Failed
                    </span>
                  {/if}
                </td>
                <td class="px-6 py-4"
                  >{new Date(doc.created_at).toLocaleDateString()}</td
                >
                <td class="px-6 py-4 text-right">
                  <Button
                    variant="danger"
                    size="sm"
                    className="px-0 py-0 hover:underline"
                    on:click={() => deleteDocument(doc._id)}
                  >
                    Delete
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
