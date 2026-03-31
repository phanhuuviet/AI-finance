<script>
  import DocumentUploadV2 from "./components/document-upload/DocumentUpload.svelte";
  import StudioPanel from "./components/studio/StudioPanel.svelte";
  import ChatInterface from "./components/chat/ChatInterfaceSectioned.svelte";
  import ChatHistory from "./components/chat/ChatHistory.svelte";

  import { fade } from "svelte/transition";

  import { workspaceStore } from "../../stores/workspace.js";

  /** @typedef {import('../../models/workspace').WorkspaceSection} WorkspaceSection */

  /** @type {string | null} */
  let sessionId = null;
  /** @type {WorkspaceSection} */
  let section = 'chat';

  $: sessionId = $workspaceStore.currentSessionId;
  $: section = sessionId
    ? ($workspaceStore.activeSectionBySession?.[sessionId] ?? "chat")
    : "chat";

  /** @param {WorkspaceSection} next */
  function setSection(next) {
    if (!sessionId) return;
    workspaceStore.setActiveSectionForCurrentSession(next);
  }
</script>

<div class="flex h-full gap-6">
  <div class="w-1/3 min-w-[300px] h-full">
    <ChatHistory />
  </div>

  <div class="flex-1 h-full flex flex-col gap-4">
    {#if !sessionId}
      <div
        class="h-full bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-center p-8"
      >
        <div class="max-w-md text-center">
          <div class="text-lg font-semibold text-gray-900">
            Chọn một cuộc trò chuyện
          </div>
          <div class="mt-2 text-sm text-gray-600">
            Bạn cần chọn 1 cuộc trò chuyện trước, sau đó mới hiển thị UI để chọn
            <span class="font-medium"> Documents / Chat / Studio</span>.
          </div>
        </div>
      </div>
    {:else}
      <div class="flex items-center justify-between">
        <div
          class="inline-flex rounded-xl border border-gray-200 bg-gray-50 p-1"
        >
          <button
            class={`px-3 py-1.5 rounded-lg text-sm ${section === "documents" ? "bg-white shadow-sm border border-gray-200 text-gray-900" : "text-gray-600 hover:text-gray-900"}`}
            on:click={() => setSection("documents")}
            type="button"
          >
            Documents
          </button>
          <button
            class={`px-3 py-1.5 rounded-lg text-sm ${section === "chat" ? "bg-white shadow-sm border border-gray-200 text-gray-900" : "text-gray-600 hover:text-gray-900"}`}
            on:click={() => setSection("chat")}
            type="button"
          >
            Chat
          </button>
          <button
            class={`px-3 py-1.5 rounded-lg text-sm ${section === "studio" ? "bg-white shadow-sm border border-gray-200 text-gray-900" : "text-gray-600 hover:text-gray-900"}`}
            on:click={() => setSection("studio")}
            type="button"
          >
            Studio
          </button>
        </div>

        <div class="text-xs text-gray-500">Session: {sessionId}</div>
      </div>

      {#if section === "documents"}
        <DocumentUploadV2 />
      {:else if section === "studio"}
        <div class="h-full" transition:fade={{ duration: 180 }}>
          <StudioPanel />
        </div>
      {:else}
        <ChatInterface {sessionId} />
      {/if}
    {/if}
  </div>
</div>
