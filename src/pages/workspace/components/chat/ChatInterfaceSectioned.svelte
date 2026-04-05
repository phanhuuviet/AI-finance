<script>
  import { afterUpdate } from "svelte";
  import { fade } from "svelte/transition";
  import { marked } from "marked";
  import { chatStore, chatMessages } from "$lib/stores/chat.store";
  import { chatService } from "$lib/services/chat.service";
  import { wsStore } from "../../../../stores/websocket.js";

  import { sendWebSocketMessage } from "../../../../lib/services/websocket.service";
  import { currentSessionSelectedDocIds } from "../../../../stores/attachments.js";
  import LoadingBlock from "$lib/components/common/LoadingBlock.svelte";
  import ErrorFallback from "$lib/components/common/ErrorFallback.svelte";
  import TextareaField from "$lib/components/common/TextareaField.svelte";
  import Button from "$lib/components/common/Button.svelte";
  import { t } from "../../../../lib/i18n";

  /** @typedef {import('../../../../lib/models').ChatMessage} ChatMessage */

  // Session-scoped: caller passes the sessionId belonging to a section
  /** @type {string | null} */
  export let sessionId = null;

  let messageInput = "";
  /** @type {HTMLDivElement | null} */
  let chatContainer = null;

  /** @type {ChatMessage[]} */
  $: messages = (sessionId && $chatStore.activeSessionId === sessionId
    ? $chatMessages
    : [])
    .slice()
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  $: isLoadingHistory = Boolean(sessionId) && $chatStore.isLoading;
  $: historyError = $chatStore.error;
  $: isConnected = $wsStore.status === "connected";
  $: selectedDocIds = $currentSessionSelectedDocIds;
  $: selectedCount = selectedDocIds?.length ?? 0;

  function renderMarkdown(content) {
    return /** @type {string} */ (marked.parse(content));
  }

  function formatTime(value) {
    return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  }

  function scrollToBottom() {
    if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  afterUpdate(scrollToBottom);

  function sendMessage() {
    if (!messageInput.trim() || !sessionId || !isConnected) return;
    sendWebSocketMessage(sessionId, messageInput, selectedDocIds);
    messageInput = "";
  }

  /** @param {KeyboardEvent} e */
  function handleKeydown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }
</script>

<div
  class="flex min-h-0 flex-col h-full bg-[var(--color-bg-surface)] rounded-lg border border-[var(--color-border-default)]"
>
  <div
    class="p-3 sm:p-4 border-b border-[var(--color-border-default)] flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center bg-[var(--color-bg-app)] rounded-t-lg"
  >
    <h2 class="text-base sm:text-lg font-semibold text-[var(--color-text-primary)]">
      {sessionId ? $t("chat.session") : $t("chat.selectChat")}
    </h2>
    <div class="flex items-center gap-2">
      <div
        class={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
      ></div>
      <span class="text-sm text-[var(--color-text-muted)]"
        >{isConnected ? $t("chat.connected") : $t("chat.disconnected")}</span
      >
    </div>
  </div>

  <div bind:this={chatContainer} class="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-4">
    {#if !sessionId}
      <div class="h-full flex items-center justify-center text-[var(--color-text-muted)]">
        {$t("chat.selectChatHint")}
      </div>
    {:else if isLoadingHistory}
      <div class="space-y-4" aria-live="polite">
        <LoadingBlock rows={2} rowHeight="h-10" className="max-w-[72%]" active={true} />
        <div class="flex justify-end">
          <LoadingBlock rows={1} rowHeight="h-10" className="w-[58%]" active={true} />
        </div>
        <LoadingBlock rows={2} rowHeight="h-10" className="max-w-[68%]" active={true} />
      </div>
    {:else if historyError}
      <ErrorFallback
        compact={true}
        message={historyError}
        retryLabel={$t("chat.retryLoadingMessages")}
        on:retry={() => sessionId && chatService.loadHistory(sessionId)}
      />
    {:else if messages.length === 0}
      <div class="h-full flex items-center justify-center text-[var(--color-text-muted)]">
        No messages yet. Start a conversation.
      </div>
    {:else}
      <div transition:fade={{ duration: 180 }}>
        {#each messages as msg}
          <div
            class={`mb-3 flex ${msg.role === "user_message" ? "justify-end" : "justify-start"}`}
          >
            <div class="max-w-[88%] sm:max-w-[75%]">
              {#if msg.role === "assistant"}
                <span class="mb-1 inline-flex rounded-full bg-[var(--purple-100)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-[var(--purple-700)]">
                  Assistant
                </span>
              {/if}

              <div
                class={`rounded-[12px] p-3 text-sm leading-relaxed ${
                  msg.role === "user_message"
                    ? "bg-[var(--gradient-accent)] text-white rounded-tr-none"
                    : "bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-purple)] rounded-tl-none"
                }`}
              >
                {#if msg.role === "assistant"}
                  <div class="markdown-body">{@html renderMarkdown(msg.content)}</div>
                {:else}
                  <p class="whitespace-pre-wrap">{msg.content}</p>
                {/if}
                <span class={`mt-2 block text-xs ${msg.role === "user_message" ? "text-white/80" : "text-[var(--text-muted)]"}`}>
                  {formatTime(msg.created_at)}
                </span>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <div class="p-3 sm:p-4 border-t border-[var(--color-border-default)] bg-[var(--color-bg-surface)] rounded-b-lg">
    <div class="relative flex items-center">
      <TextareaField
        bare
        unstyled
        bind:value={messageInput}
        onkeydown={handleKeydown}
        disabled={!sessionId || !isConnected}
        placeholder={!sessionId
          ? $t("chat.selectChatFirst")
          : $t("chat.typeMessage")}
        textareaClass="w-full pl-3 sm:pl-4 pr-24 py-2.5 min-h-11 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-border-accent)] focus:[box-shadow:0_0_0_3px_rgba(91,79,207,0.12)] resize-none h-12"
        rows={1}
      ></TextareaField>

      <!-- docs indicator (icon + badge) -->
      <div class="absolute right-12 flex items-center">
        <Button
          unstyled
          type="button"
          className="relative p-2 min-h-11 min-w-11 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
          aria-label={$t("chat.selectedDocuments")}
          title={$t("chat.selectedDocuments")}
          disabled
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="w-5 h-5"
          >
            <path
              d="M7.5 3.75A2.25 2.25 0 0 0 5.25 6v12A2.25 2.25 0 0 0 7.5 20.25h9A2.25 2.25 0 0 0 18.75 18V9.621a2.25 2.25 0 0 0-.659-1.591l-3.371-3.371A2.25 2.25 0 0 0 13.129 4H7.5z"
            />
          </svg>
          {#if selectedCount > 0}
            <span
              class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--color-accent)] text-white text-[10px] leading-[18px] text-center"
              aria-label={$t("chat.documentsSelected", { count: selectedCount })}
              >{selectedCount}</span
            >
          {/if}
        </Button>
      </div>

      <Button
        unstyled
        on:click={sendMessage}
        disabled={!messageInput.trim() || !sessionId || !isConnected}
        className="absolute right-1.5 sm:right-2 p-2 min-h-11 min-w-11 inline-flex items-center justify-center text-[var(--color-accent-text)] hover:text-[var(--color-accent)] disabled:text-[var(--color-text-muted)] disabled:cursor-not-allowed"
        aria-label={$t("chat.sendMessage")}
        title={$t("chat.send")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="w-6 h-6"
        >
          <path
            d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z"
          />
        </svg>
      </Button>
    </div>
  </div>
</div>

<style>
  .markdown-body :global(p) {
    margin: 0;
  }

  .markdown-body :global(p + p) {
    margin-top: 0.5rem;
  }

  .markdown-body :global(ul),
  .markdown-body :global(ol) {
    margin: 0.35rem 0 0 1rem;
    padding: 0;
  }

  .markdown-body :global(code) {
    font-size: 0.85em;
    background: rgba(99, 102, 241, 0.12);
    border-radius: 4px;
    padding: 0.1rem 0.25rem;
  }
</style>
