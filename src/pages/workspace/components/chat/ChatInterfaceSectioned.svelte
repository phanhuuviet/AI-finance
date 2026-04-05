<script>
  import { afterUpdate } from "svelte";
  import { fade } from "svelte/transition";
  import { marked } from "marked";
  import {
    chatStore,
    chatMessages,
    isGenerating,
    isTyping,
    isConnecting,
    streamingContent,
    wsError,
    activeSessionId,
  } from "$lib/stores/chat.store";
  import { chatService } from "$lib/services/chat.service";
  import { wsService } from "$lib/services/websocket.service";

  import LoadingBlock from "$lib/components/common/LoadingBlock.svelte";
  import ErrorFallback from "$lib/components/common/ErrorFallback.svelte";
  import TypingIndicator from "$lib/components/common/TypingIndicator.svelte";
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
  $: canSend = inputValue.trim().length > 0 && !$isGenerating && !$isTyping && !$isConnecting;

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
        <span class="text-xs font-medium text-[var(--amber-500)]">Connecting...</span>
      {:else if $activeSessionId}
        <span class="text-xs font-medium text-[var(--green-500)]">● Live</span>
      {/if}

      {#if $wsError}
        <span class="text-xs font-medium text-[var(--rose-500)]">{$wsError}</span>
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
            class={`mb-3 flex ${msg.role === "assistant" ? "justify-start" : "justify-end"}`}
          >
            <div class="max-w-[88%] sm:max-w-[75%]">
              {#if msg.role === "assistant"}
                <span class="mb-1 inline-flex rounded-full bg-[var(--purple-100)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-[var(--purple-700)]">
                  Assistant
                </span>
              {/if}

              <div
                class={`rounded-[12px] p-3 text-sm leading-relaxed ${
                  msg.role === "assistant"
                    ? "bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-purple)] rounded-tl-none"
                    : "bg-[var(--indigo-600,#4F46E5)] text-white border-0 rounded-[12px_0_12px_12px]"
                }`}
              >
                {#if msg.role === "assistant"}
                  <div class="markdown-body [&>p]:m-0 [&>p+p]:mt-2 [&_ul]:mt-1 [&_ul]:ml-4 [&_ol]:mt-1 [&_ol]:ml-4 [&_code]:rounded [&_code]:bg-[rgba(99,102,241,0.12)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.85em]">{@html renderMarkdown(msg.content)}</div>
                {:else}
                  <p class="whitespace-pre-wrap text-white">{msg.content}</p>
                {/if}
                <span class={`mt-2 block text-xs ${msg.role === "assistant" ? "text-[var(--text-muted)]" : "text-white/80"}`}>
                  {formatTime(msg.created_at)}
                </span>
              </div>
            </div>
          </div>
        {/each}

        {#if $isTyping}
          <div class="mb-3 flex justify-start">
            <div class="max-w-[88%] sm:max-w-[75%]">
              <span class="mb-1 inline-flex rounded-full bg-[var(--purple-100)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-[var(--purple-700)]">
                AI
              </span>
              <TypingIndicator />
            </div>
          </div>
        {/if}

        {#if $streamingContent && !$isTyping}
          <div class="mb-3 flex justify-start">
            <div class="max-w-[88%] sm:max-w-[75%]">
              <span class="mb-1 inline-flex rounded-full bg-[var(--purple-100)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-[var(--purple-700)]">
                AI
              </span>
              <div class="rounded-[12px] rounded-tl-none border border-[var(--border-purple)] bg-[var(--purple-50)] p-3 text-sm leading-relaxed text-[var(--text-primary)]">
                <div class="markdown-body inline [&>p]:m-0 [&>p+p]:mt-2 [&_ul]:mt-1 [&_ul]:ml-4 [&_ol]:mt-1 [&_ol]:ml-4 [&_code]:rounded [&_code]:bg-[rgba(99,102,241,0.12)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.85em]">{@html renderMarkdown($streamingContent)}</div><span class="inline-block ml-0.5 text-[var(--purple-400)] [animation:blink_1s_step-end_infinite]">|</span>
              </div>
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <div class="flex gap-2 items-end p-3 border-t border-[var(--border-subtle)] bg-[var(--color-bg-surface)] rounded-b-lg">
    <TextField
      bare
      unstyled
      bind:value={inputValue}
      placeholder="Type your message..."
      disabled={$isGenerating || $isTyping || !sessionId || $isConnecting}
      onkeydown={handleKeydown}
      inputClass="w-full px-3 sm:px-4 py-2.5 min-h-11 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-border-accent)] focus:[box-shadow:0_0_0_3px_rgba(91,79,207,0.12)]"
    />

    {#if $isGenerating || $isTyping}
      <button
        class="shrink-0 flex items-center gap-1.5 px-5 py-2.5 rounded-[var(--radius-md)] border-[1.5px] border-[var(--rose-400)] bg-[var(--rose-50)] text-[var(--rose-600)] font-semibold text-sm whitespace-nowrap hover:bg-[var(--rose-100)]"
        on:click={handleStop}
        aria-label="Stop generation"
        type="button"
      >
        <span class="text-[10px]">■</span>
        Stop
      </button>
    {:else}
      <button
        class="shrink-0 px-5 py-2.5 rounded-[var(--radius-md)] border-0 [background:var(--gradient-accent)] text-white font-semibold text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!canSend}
        on:click={handleSend}
        aria-label="Send message"
        type="button"
      >
        Send
      </button>
    {/if}
  </div>
</div>

<style>
  @keyframes blink {
    0%,
    100% {
      opacity: 1;
    }

    50% {
      opacity: 0;
    }
  }
</style>
