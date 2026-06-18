<script>
  import DocumentUploadV2 from "./components/document-upload/DocumentUpload.svelte";
  import StudioPanel from "./components/studio/StudioPanel.svelte";
  import Generations from "./generations/Generations.svelte";
  import Compositions from "./compositions/Compositions.svelte";
  import Subs from "./subs/Subs.svelte";
  import CompositionDetail from "./compositions/CompositionDetail.svelte";
  import ChatInterface from "./components/chat/ChatInterfaceSectioned.svelte";
  import ChatsPage from "./components/chat/ChatsPage.svelte";
  import Button from "$lib/components/common/Button.svelte";
  import { route, navigate } from "../../stores/router.js";

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
  $: generationId = $route.page === "workspace" ? /** @type {any} */ ($route).generationId : null;
  $: compositionId = $route.page === "workspace" ? /** @type {any} */ ($route).compositionId : null;

  /** @type {{ key: WorkspaceSection; label: string }[]} */
  $: sectionTabs = [
    { key: "documents", label: $t("workspace.documents") },
    { key: "chat", label: $t("workspace.chat") },
    { key: "studio", label: $t("workspace.studio") },
    { key: "compositions", label: $t("compositions.title") },
    { key: "subs", label: $t("workspace.subs") },
  ];

  /** @param {WorkspaceSection} next */
  function setSection(next) {
    if (!sessionId) return;
    workspaceStore.setActiveSectionForCurrentSession(next);

    if (generationId || compositionId) {
      navigate(`/workspace/${sessionId}`);
    }
  }
</script>

<div class="h-full min-h-0 overflow-hidden">
  {#if !sessionId}
    <!-- No conversation selected → full Chats list with search (Claude-style) -->
    <ChatsPage />
  {:else if generationId}
    <Generations />
  {:else if compositionId}
    <CompositionDetail />
  {:else}
    <div class="flex h-full min-h-0 flex-col gap-3">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="inline-flex max-w-full overflow-x-auto rounded-full border border-[var(--border-subtle)] bg-[var(--bg-app)] p-1">
          {#each sectionTabs as tab (tab.key)}
            <Button
              unstyled
              className={`px-3.5 py-1.5 min-h-0 rounded-full text-[13px] whitespace-nowrap transition-colors duration-150 ${section === tab.key ? "bg-[var(--bg-card)] text-[var(--text-primary)] font-medium shadow-[var(--shadow-soft)]" : "bg-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
              on:click={() => setSection(tab.key)}
              type="button"
            >
              {tab.label}
            </Button>
          {/each}
        </div>

        <div class="hidden text-xs text-[var(--text-muted)] break-all sm:block">{$t("common.session")}: {sessionId}</div>
      </div>

      <div class="min-h-0 flex-1">
        {#if section === "documents"}
          <DocumentUploadV2 />
        {:else if section === "studio"}
          <div class="h-full" transition:fade={{ duration: 180 }}>
            <StudioPanel />
          </div>
        {:else if section === "compositions"}
          <Compositions />
        {:else if section === "subs"}
          <Subs />
        {:else}
          <ChatInterface {sessionId} />
        {/if}
      </div>
    </div>
  {/if}
</div>
