<script>
  import { afterUpdate } from "svelte";
  import { fade } from "svelte/transition";
  import { marked } from "marked";
  import {
    chatStore,
    chatMessages,
    isGenerating,
    isConnecting,
    streamingContent,
    wsError,
    activeSessionId,
  } from "$lib/stores/chat.store";
  import { chatService } from "$lib/services/chat.service";
  import { wsService } from "$lib/services/websocket.service";

  import LoadingBlock from "$lib/components/common/LoadingBlock.svelte";
  import ErrorFallback from "$lib/components/common/ErrorFallback.svelte";
  import TextField from "$lib/components/common/TextField.svelte";
  import Button from "$lib/components/common/Button.svelte";
  import { t } from "../../../../lib/i18n";

  /** @typedef {import('../../../../lib/models').ChatMessage} ChatMessage */

  // Session-scoped: caller passes the sessionId belonging to a section
  /** @type {string | null} */
  export let sessionId = null;

  let inputValue = "";
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
  $: canSend = inputValue.trim().length > 0 && !$isGenerating && !$isConnecting;

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

  function handleSend() {
    if (!canSend) return;
    const content = inputValue.trim();
    inputValue = "";
    wsService.sendMessage(content, []);
  }

  function handleStop() {
    wsService.stopGeneration();
  }

  function handleKeydown(e) {
    if (e.key === "Enter" && !e.shiftKey && canSend) {
      e.preventDefault();
      handleSend();
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
    <div class="flex items-center gap-3">
      {#if $isConnecting}
        <span class="ws-status ws-status--connecting">Connecting...</span>
      {:else if $activeSessionId}
        <span class="ws-status ws-status--connected">● Live</span>
      {/if}

      {#if $wsError}
        <span class="ws-status ws-status--error">{$wsError}</span>
      {/if}
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
            class={`mb-3 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div class="max-w-[88%] sm:max-w-[75%]">
              {#if msg.role === "assistant"}
                <span class="mb-1 inline-flex rounded-full bg-[var(--purple-100)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-[var(--purple-700)]">
                  Assistant
                </span>
              {/if}

              <div
                class={`rounded-[12px] p-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-[var(--gradient-accent)] text-white rounded-tr-none"
                    : "bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-purple)] rounded-tl-none"
                }`}
              >
                {#if msg.role === "assistant"}
                  <div class="markdown-body">{@html renderMarkdown(msg.content)}</div>
                {:else}
                  <p class="whitespace-pre-wrap">{msg.content}</p>
                {/if}
                <span class={`mt-2 block text-xs ${msg.role === "user" ? "text-white/80" : "text-[var(--text-muted)]"}`}>
                  {formatTime(msg.created_at)}
                </span>
              </div>
            </div>
          </div>
        {/each}

        {#if $streamingContent}
          <div class="mb-3 flex justify-start">
            <div class="max-w-[88%] sm:max-w-[75%]">
              <span class="mb-1 inline-flex rounded-full bg-[var(--purple-100)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-[var(--purple-700)]">
                AI
              </span>
              <div class="bubble--streaming rounded-[12px] rounded-tl-none border p-3 text-sm leading-relaxed text-[var(--text-primary)]">
                <div class="markdown-body inline">{@html renderMarkdown($streamingContent)}</div><span class="cursor-blink">|</span>
              </div>
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <div class="chat-input-row bg-[var(--color-bg-surface)] rounded-b-lg">
    <TextField
      bare
      unstyled
      bind:value={inputValue}
      placeholder="Type your message..."
      disabled={$isGenerating || !sessionId || $isConnecting}
      on:keydown={handleKeydown}
      inputClass="w-full px-3 sm:px-4 py-2.5 min-h-11 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-border-accent)] focus:[box-shadow:0_0_0_3px_rgba(91,79,207,0.12)]"
    />

    {#if $isGenerating}
      <button class="btn-stop" on:click={handleStop} aria-label="Stop generation" type="button">
        <span class="stop-icon">■</span>
        Stop
      </button>
    {:else}
      <button class="btn-send" disabled={!canSend} on:click={handleSend} aria-label="Send message" type="button">
        Send
      </button>
    {/if}
  </div>
</div>

<style>
  .chat-input-row {
    display: flex;
    gap: 8px;
    align-items: flex-end;
    padding: 12px;
    border-top: 1px solid var(--border-subtle);
  }

  .btn-send {
    flex-shrink: 0;
    padding: 10px 20px;
    border-radius: var(--radius-md);
    border: none;
    background: var(--gradient-accent);
    color: #ffffff;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    white-space: nowrap;
  }

  .btn-send:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-stop {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 20px;
    border-radius: var(--radius-md);
    border: 1.5px solid var(--rose-400);
    background: var(--rose-50);
    color: var(--rose-600);
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    white-space: nowrap;
  }

  .btn-stop:hover {
    background: var(--rose-100);
  }

  .stop-icon {
    font-size: 10px;
  }

  .ws-status {
    font-size: 12px;
    font-weight: 500;
  }

  .ws-status--connecting {
    color: var(--amber-500);
  }

  .ws-status--connected {
    color: var(--green-500);
  }

  .ws-status--error {
    color: var(--rose-500);
  }

  .cursor-blink {
    display: inline-block;
    animation: blink 1s step-end infinite;
    color: var(--purple-400);
    margin-left: 2px;
  }

  @keyframes blink {
    0%,
    100% {
      opacity: 1;
    }

    50% {
      opacity: 0;
    }
  }

  .bubble--streaming {
    border-color: var(--border-purple);
    background: var(--purple-50);
  }

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
