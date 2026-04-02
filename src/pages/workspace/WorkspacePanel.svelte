<script>
  import DocumentUploadV2 from "./components/document-upload/DocumentUpload.svelte";
  import StudioPanel from "./components/studio/StudioPanel.svelte";
  import ChatInterface from "./components/chat/ChatInterfaceSectioned.svelte";
  import ChatHistory from "./components/chat/ChatHistory.svelte";
  import ResponsiveWorkspaceLayout from "./components/layout/ResponsiveWorkspaceLayout.svelte";
  import Button from "$lib/components/common/Button.svelte";

  import { fade } from "svelte/transition";
  import { t } from "../../lib/i18n";

  import { workspaceStore } from "../../stores/workspace.js";

  /** @typedef {import('../../lib/models').WorkspaceSection} WorkspaceSection */

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

<ResponsiveWorkspaceLayout {sessionId}>
  <svelte:fragment slot="list" let:openDetailView>
    <div class="h-full min-h-0">
      <ChatHistory
        on:select={() => {
          openDetailView();
        }}
      />
    </div>
  </svelte:fragment>

  <svelte:fragment slot="detail-nav">
    {#if sessionId}
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          class="inline-flex max-w-full overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-1"
        >
          <Button
            unstyled
            className={`px-3 py-2 min-h-11 rounded-lg text-sm whitespace-nowrap ${section === "documents" ? "bg-white shadow-sm border border-gray-200 text-gray-900" : "text-gray-600 hover:text-gray-900"}`}
            on:click={() => setSection("documents")}
            type="button"
          >
            {$t("workspace.documents")}
          </Button>
          <Button
            unstyled
            className={`px-3 py-2 min-h-11 rounded-lg text-sm whitespace-nowrap ${section === "chat" ? "bg-white shadow-sm border border-gray-200 text-gray-900" : "text-gray-600 hover:text-gray-900"}`}
            on:click={() => setSection("chat")}
            type="button"
          >
            {$t("workspace.chat")}
          </Button>
          <Button
            unstyled
            className={`px-3 py-2 min-h-11 rounded-lg text-sm whitespace-nowrap ${section === "studio" ? "bg-white shadow-sm border border-gray-200 text-gray-900" : "text-gray-600 hover:text-gray-900"}`}
            on:click={() => setSection("studio")}
            type="button"
          >
            {$t("workspace.studio")}
          </Button>
        </div>

        <div class="text-xs text-gray-500 break-all">{$t("common.session")}: {sessionId}</div>
      </div>
    {/if}
  </svelte:fragment>

  <svelte:fragment slot="detail">
    {#if !sessionId}
      <div
        class="h-full bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-center p-5 sm:p-8"
      >
        <div class="max-w-md text-center">
          <div class="text-base sm:text-lg font-semibold text-gray-900">
            {$t("workspace.selectConversation")}
          </div>
          <div class="mt-2 text-sm text-gray-600">
            {$t("workspace.selectConversationHint")}
          </div>
        </div>
      </div>
    {:else if section === "documents"}
      <DocumentUploadV2 />
    {:else if section === "studio"}
      <div class="h-full" transition:fade={{ duration: 180 }}>
        <StudioPanel />
      </div>
    {:else}
      <ChatInterface {sessionId} />
    {/if}
  </svelte:fragment>
</ResponsiveWorkspaceLayout>
