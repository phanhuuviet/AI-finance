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

<div class="h-full min-h-0 overflow-hidden">
  <ResponsiveWorkspaceLayout {sessionId}>
    <svelte:fragment slot="list" let:openDetailView>
      <div class="h-full min-h-0 overflow-hidden">
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
            class="inline-flex max-w-full overflow-x-auto rounded-[var(--radius-md)] border border-[var(--border-purple)] bg-[var(--purple-50)] p-1"
          >
            <Button
              unstyled
              className={`px-3 py-2 min-h-11 rounded-[var(--radius-sm)] text-sm whitespace-nowrap transition-all duration-200 ${section === "documents" ? "[background:var(--gradient-accent)] text-[var(--text-on-dark)] font-semibold shadow-[0_1px_6px_rgba(99,102,241,0.3)]" : "bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
              on:click={() => setSection("documents")}
              type="button"
            >
              {$t("workspace.documents")}
            </Button>
            <Button
              unstyled
              className={`px-3 py-2 min-h-11 rounded-[var(--radius-sm)] text-sm whitespace-nowrap transition-all duration-200 ${section === "chat" ? "[background:var(--gradient-accent)] text-[var(--text-on-dark)] font-semibold shadow-[0_1px_6px_rgba(99,102,241,0.3)]" : "bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
              on:click={() => setSection("chat")}
              type="button"
            >
              {$t("workspace.chat")}
            </Button>
            <Button
              unstyled
              className={`px-3 py-2 min-h-11 rounded-[var(--radius-sm)] text-sm whitespace-nowrap transition-all duration-200 ${section === "studio" ? "[background:var(--gradient-accent)] text-[var(--text-on-dark)] font-semibold shadow-[0_1px_6px_rgba(99,102,241,0.3)]" : "bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
              on:click={() => setSection("studio")}
              type="button"
            >
              {$t("workspace.studio")}
            </Button>
          </div>

          <div class="text-xs text-[var(--text-muted)] break-all">{$t("common.session")}: {sessionId}</div>
        </div>
      {/if}
    </svelte:fragment>

    <svelte:fragment slot="detail">
      {#if !sessionId}
        <div
          class="h-full bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border-default)] flex items-center justify-center p-5 sm:p-8"
        >
          <div class="max-w-md text-center">
            <div class="text-base sm:text-lg font-semibold text-[var(--color-text-primary)]">
              {$t("workspace.selectConversation")}
            </div>
            <div class="mt-2 text-sm text-[var(--color-text-secondary)]">
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
</div>
