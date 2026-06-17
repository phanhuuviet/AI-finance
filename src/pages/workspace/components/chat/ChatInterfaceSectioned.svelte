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
  import TextareaField from "$lib/components/common/TextareaField.svelte";
  import Button from "$lib/components/common/Button.svelte";
  import { t } from "../../../../lib/i18n";
  import { CHAT_ROLE } from "$lib/constants/index.js";
  import { user } from "../../../../stores/auth.js";

  $: userInitial = ($user?.full_name?.[0] || $user?.email?.[0] || "U").toUpperCase();

  /** @typedef {import('../../../../lib/models').ChatMessage} ChatMessage */

  // Session-scoped: caller passes the sessionId belonging to a section
  /** @type {string | null} */
  export let sessionId = null;

  let inputValue = "";
  /** @type {HTMLTextAreaElement | null} */
  let textareaEl = null;
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

  /** @param {string} content */
  function renderMarkdown(content) {
    return /** @type {string} */ (marked.parse(content));
  }

  /** @param {string | number | Date} value */
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
    if (textareaEl) {
      textareaEl.style.height = "auto";
    }
    wsService.sendMessage(content, []);
  }

  function handleStop() {
    wsService.stopGeneration();
  }

  /** @param {KeyboardEvent} e */
  function handleKeydown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) handleSend();
    }
  }
</script>

<div
  class="flex min-h-0 flex-col h-full bg-[var(--color-bg-surface)] rounded-lg border border-[var(--color-border-default)]"
>
  <div
    class="p-3 sm:p-4 border-b border-[var(--color-border-default)] flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center bg-[var(--bg-panel)] rounded-t-lg"
  >
    <h2 class="text-base sm:text-lg font-semibold text-[var(--color-text-primary)]">
      {sessionId ? $t("chat.session") : $t("chat.selectChat")}
    </h2>
    <div class="flex items-center gap-3">
      {#if $isConnecting}
        <span class="inline-flex items-center gap-1.5 rounded-full bg-[var(--amber-50)] px-2.5 py-1 text-xs font-medium text-[var(--amber-600)]">
          <span class="h-1.5 w-1.5 rounded-full bg-[var(--amber-500)] [animation:blink_1s_step-end_infinite]"></span>
          {$t('chat.connecting')}
        </span>
      {:else if $activeSessionId}
        <span class="inline-flex items-center gap-1.5 rounded-full bg-[var(--green-50)] px-2.5 py-1 text-xs font-medium text-[var(--green-600)]">
          <span class="h-1.5 w-1.5 rounded-full bg-[var(--green-500)]"></span>
          {$t('chat.live')}
        </span>
      {/if}

      {#if $wsError}
        <span class="inline-flex items-center rounded-full bg-[var(--rose-50)] px-2.5 py-1 text-xs font-medium text-[var(--rose-600)]">{$wsError}</span>
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
        {$t('chat.noMessages')}
      </div>
    {:else}
      <div transition:fade={{ duration: 180 }}>
        {#each messages as msg}
          {#if msg.role === CHAT_ROLE.ASSISTANT}
            <div class="mb-5 flex items-start gap-2.5 justify-start">
              <div class="mt-0.5 h-8 w-8 shrink-0 rounded-full [background:var(--gradient-accent)] flex items-center justify-center text-white shadow-[var(--shadow-soft)]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4">
                  <path d="M12 2l1.9 4.7L18.6 8 14 10.1 12 15l-2-4.9L5.4 8l4.7-1.3L12 2zm6.5 9l.95 2.35L21.8 14l-2.35.95L18.5 17l-.95-2.05L15.2 14l2.35-.65L18.5 11zM6 14l.8 2L9 16.8l-2.2.8L6 20l-.8-2.4L3 16.8 5.2 16 6 14z" />
                </svg>
              </div>
              <div class="min-w-0 max-w-[88%] sm:max-w-[78%]">
                <span class="mb-1 ml-0.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--purple-700)]">
                  {$t('chat.assistant')}
                </span>
                <div class="rounded-2xl rounded-tl-md border border-[var(--border-default)] bg-[var(--bg-card)] p-3.5 text-sm leading-relaxed text-[var(--text-primary)] shadow-[var(--shadow-soft)]">
                  <div class="markdown-body [&>p]:m-0 [&>p+p]:mt-2 [&_ul]:mt-1 [&_ul]:ml-4 [&_ol]:mt-1 [&_ol]:ml-4 [&_code]:rounded [&_code]:bg-[rgba(99,102,241,0.12)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.85em]">{@html renderMarkdown(msg.content)}</div>
                </div>
                <span class="mt-1 ml-0.5 block text-[11px] text-[var(--text-muted)]">{formatTime(msg.created_at)}</span>
              </div>
            </div>
          {:else}
            <div class="mb-5 flex items-start gap-2.5 justify-end">
              <div class="flex min-w-0 max-w-[88%] flex-col items-end sm:max-w-[78%]">
                <div class="rounded-2xl rounded-tr-md [background:var(--gradient-accent)] p-3.5 text-sm leading-relaxed text-white shadow-[0_2px_10px_rgba(99,102,241,0.28)]">
                  <p class="whitespace-pre-wrap">{msg.content}</p>
                </div>
                <span class="mt-1 mr-0.5 block text-[11px] text-[var(--text-muted)]">{formatTime(msg.created_at)}</span>
              </div>
              <div class="mt-0.5 h-8 w-8 shrink-0 rounded-full bg-[var(--bg-sidebar-active)] flex items-center justify-center text-xs font-semibold text-white">
                {userInitial}
              </div>
            </div>
          {/if}
        {/each}

        {#if $isTyping}
          <div class="mb-5 flex items-start gap-2.5 justify-start">
            <div class="mt-0.5 h-8 w-8 shrink-0 rounded-full [background:var(--gradient-accent)] flex items-center justify-center text-white shadow-[var(--shadow-soft)]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4">
                <path d="M12 2l1.9 4.7L18.6 8 14 10.1 12 15l-2-4.9L5.4 8l4.7-1.3L12 2zm6.5 9l.95 2.35L21.8 14l-2.35.95L18.5 17l-.95-2.05L15.2 14l2.35-.65L18.5 11zM6 14l.8 2L9 16.8l-2.2.8L6 20l-.8-2.4L3 16.8 5.2 16 6 14z" />
              </svg>
            </div>
            <div class="rounded-2xl rounded-tl-md border border-[var(--border-default)] bg-[var(--bg-card)] px-3.5 py-3 shadow-[var(--shadow-soft)]">
              <TypingIndicator />
            </div>
          </div>
        {/if}

        {#if $streamingContent && !$isTyping}
          <div class="mb-5 flex items-start gap-2.5 justify-start">
            <div class="mt-0.5 h-8 w-8 shrink-0 rounded-full [background:var(--gradient-accent)] flex items-center justify-center text-white shadow-[var(--shadow-soft)]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4">
                <path d="M12 2l1.9 4.7L18.6 8 14 10.1 12 15l-2-4.9L5.4 8l4.7-1.3L12 2zm6.5 9l.95 2.35L21.8 14l-2.35.95L18.5 17l-.95-2.05L15.2 14l2.35-.65L18.5 11zM6 14l.8 2L9 16.8l-2.2.8L6 20l-.8-2.4L3 16.8 5.2 16 6 14z" />
              </svg>
            </div>
            <div class="min-w-0 max-w-[88%] sm:max-w-[78%]">
              <span class="mb-1 ml-0.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--purple-700)]">{$t('chat.assistant')}</span>
              <div class="rounded-2xl rounded-tl-md border border-[var(--border-default)] bg-[var(--bg-card)] p-3.5 text-sm leading-relaxed text-[var(--text-primary)] shadow-[var(--shadow-soft)]">
                <div class="markdown-body inline [&>p]:m-0 [&>p+p]:mt-2 [&_ul]:mt-1 [&_ul]:ml-4 [&_ol]:mt-1 [&_ol]:ml-4 [&_code]:rounded [&_code]:bg-[rgba(99,102,241,0.12)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.85em]">{@html renderMarkdown($streamingContent)}</div><span class="inline-block ml-0.5 text-[var(--purple-400)] [animation:blink_1s_step-end_infinite]">|</span>
              </div>
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <div class="flex gap-2 items-end p-3 border-t border-[var(--border-subtle)] bg-[var(--color-bg-surface)] rounded-b-lg">
    <TextareaField
      bare
      unstyled
      bind:textareaRef={textareaEl}
      bind:value={inputValue}
      maxHeight={160}
      rows={1}
      placeholder={$t('chat.typeMessageHint')}
      disabled={$isGenerating || $isTyping || !sessionId || $isConnecting}
      onkeydown={handleKeydown}
      textareaClass="chat-textarea w-full resize-none overflow-y-auto px-3 sm:px-4 py-2.5 min-h-11 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] leading-relaxed placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-accent)] focus:[box-shadow:0_0_0_3px_rgba(91,79,207,0.12)]"
    />

    {#if $isGenerating || $isTyping}
      <button
        class="shrink-0 flex items-center gap-1.5 px-5 py-2.5 rounded-[var(--radius-md)] border-[1.5px] border-[var(--rose-400)] bg-[var(--rose-50)] text-[var(--rose-600)] font-semibold text-sm whitespace-nowrap hover:bg-[var(--rose-100)]"
        on:click={handleStop}
        aria-label={$t('chat.stopGeneration')}
        type="button"
      >
        <span class="text-[10px]">■</span>
        {$t('chat.stop')}
      </button>
    {:else}
      <button
        class="press shrink-0 px-5 py-2.5 rounded-[var(--radius-md)] border-0 [background:var(--gradient-accent)] text-white font-semibold text-sm whitespace-nowrap shadow-[0_2px_10px_rgba(99,102,241,0.3)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        disabled={!canSend}
        on:click={handleSend}
        aria-label={$t('chat.sendMessage')}
        type="button"
      >
        {$t('chat.send')}
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
