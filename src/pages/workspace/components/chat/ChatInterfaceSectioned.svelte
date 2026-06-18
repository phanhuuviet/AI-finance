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

<!--
  Claude-like chat surface. Styled with TailwindCSS v4 utility classes and
  theme tokens (var(--chat-*) defined in src/styles/theme/tokens.css) per the
  project convention — no bespoke stylesheet, no hardcoded hex.
-->
<div class="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[var(--radius-lg)] bg-[var(--chat-bg)]">
  <!-- Floating status badge: absolute so it never shifts the message layout -->
  {#if $isConnecting || $wsError}
    <div class="pointer-events-none absolute inset-x-0 top-3 z-10 flex justify-center gap-2 px-4">
      {#if $isConnecting}
        <span class="inline-flex items-center gap-1.5 rounded-full border border-[var(--chat-separator)] bg-[var(--chat-bg)] px-2.5 py-1 text-[11px] font-medium text-[var(--amber-600)] shadow-[var(--shadow-soft)]">
          <span class="h-1.5 w-1.5 rounded-full bg-current [animation:blink_1.5s_ease-in-out_infinite]"></span>
          {$t('chat.connecting')}
        </span>
      {/if}
      {#if $wsError}
        <span class="inline-flex items-center rounded-full border border-[var(--rose-100)] bg-[var(--rose-50)] px-2.5 py-1 text-[11px] font-medium text-[var(--rose-600)] shadow-[var(--shadow-soft)]">{$wsError}</span>
      {/if}
    </div>
  {/if}

  <!-- Messages area -->
  <div bind:this={chatContainer} class="min-h-0 flex-1 overflow-y-auto py-6">
    {#if !sessionId}
      <div class="flex h-full flex-col items-center justify-center gap-3 text-[var(--chat-text-muted)]">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="h-12 w-12 opacity-40">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <p class="text-sm">{$t("chat.selectChatHint")}</p>
      </div>
    {:else if isLoadingHistory}
      <div class="space-y-4 px-6 sm:px-12" aria-live="polite">
        <LoadingBlock rows={2} rowHeight="h-5" className="max-w-[70%]" active={true} />
        <LoadingBlock rows={1} rowHeight="h-5" className="w-1/3" active={true} />
        <LoadingBlock rows={2} rowHeight="h-5" className="max-w-[60%]" active={true} />
      </div>
    {:else if historyError}
      <ErrorFallback
        compact={true}
        message={historyError}
        retryLabel={$t("chat.retryLoadingMessages")}
        on:retry={() => sessionId && chatService.loadHistory(sessionId)}
      />
    {:else if messages.length === 0}
      <div class="flex h-full flex-col items-center justify-center gap-3 text-[var(--chat-text-muted)]">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="h-12 w-12 opacity-40">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <p class="text-sm">{$t('chat.noMessages')}</p>
      </div>
    {:else}
      <div class="flex flex-col" transition:fade={{ duration: 180 }}>
        {#each messages as msg}
          {#if msg.role === CHAT_ROLE.ASSISTANT}
            <!-- Assistant message: clean text, no bubble -->
            <div class="group py-4">
              <div class="mx-auto max-w-[900px] px-6 sm:px-12">
                <div class="markdown-body text-[14.5px] leading-[1.7] text-[var(--chat-text)] break-words [&_a]:text-[var(--indigo-600)] [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-[var(--indigo-700)] [&_blockquote]:my-3 [&_blockquote]:border-l-[3px] [&_blockquote]:border-[var(--chat-text-muted)] [&_blockquote]:px-4 [&_blockquote]:text-[var(--chat-text-secondary)] [&_code]:rounded [&_code]:border [&_code]:border-[var(--chat-code-border)] [&_code]:bg-[var(--chat-code-bg)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.85em] [&_code]:text-[var(--chat-code-text)] [&_em]:italic [&_h1]:mt-5 [&_h1]:mb-2 [&_h1]:text-[1.3em] [&_h1]:font-semibold [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:text-[1.15em] [&_h2]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-[1.05em] [&_h3]:font-semibold [&_hr]:my-5 [&_hr]:border-[var(--chat-separator)] [&_li]:my-1 [&_ol]:my-2 [&_ol]:pl-6 [&_p]:m-0 [&_p+p]:mt-3 [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-[var(--chat-code-border)] [&_pre]:bg-[var(--chat-code-bg)] [&_pre]:p-4 [&_pre_code]:border-0 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[13px] [&_pre_code]:text-[var(--chat-text)] [&_strong]:font-semibold [&_table]:my-3 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-[var(--chat-code-border)] [&_td]:p-2 [&_td]:text-[13px] [&_th]:border [&_th]:border-[var(--chat-code-border)] [&_th]:bg-[var(--chat-code-bg)] [&_th]:p-2 [&_th]:text-[13px] [&_th]:font-semibold [&_ul]:my-2 [&_ul]:pl-6">{@html renderMarkdown(msg.content)}</div>
                <span class="mt-1 block text-[11px] text-[var(--chat-text-muted)] opacity-0 transition-opacity group-hover:opacity-100">{formatTime(msg.created_at)}</span>
              </div>
            </div>
          {:else}
            <!-- User message: subtle elevated pill, right-aligned -->
            <div class="group py-1">
              <div class="mx-auto flex max-w-[900px] flex-col items-end px-6 sm:px-12">
                <p class="m-0 inline-block max-w-[85%] whitespace-pre-wrap break-words rounded-[20px] rounded-br-md bg-[var(--chat-bg-user)] px-[18px] py-3 text-[14.5px] leading-[1.6] text-[var(--chat-text)]">{msg.content}</p>
                <span class="mt-1 block text-[11px] text-[var(--chat-text-muted)] opacity-0 transition-opacity group-hover:opacity-100">{formatTime(msg.created_at)}</span>
              </div>
            </div>
          {/if}
        {/each}

        <!-- Typing indicator -->
        {#if $isTyping}
          <div class="py-4">
            <div class="mx-auto max-w-[900px] px-6 sm:px-12">
              <TypingIndicator />
            </div>
          </div>
        {/if}

        <!-- Streaming content -->
        {#if $streamingContent && !$isTyping}
          <div class="py-4">
            <div class="mx-auto max-w-[900px] px-6 sm:px-12">
              <div class="markdown-body inline text-[14.5px] leading-[1.7] text-[var(--chat-text)] break-words [&_code]:rounded [&_code]:border [&_code]:border-[var(--chat-code-border)] [&_code]:bg-[var(--chat-code-bg)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.85em] [&_code]:text-[var(--chat-code-text)] [&_p]:m-0 [&_p+p]:mt-3 [&_strong]:font-semibold [&_ul]:my-2 [&_ul]:pl-6 [&_ol]:my-2 [&_ol]:pl-6">{@html renderMarkdown($streamingContent)}<span class="ml-0.5 inline-block text-[var(--chat-text-muted)] [animation:blink_1s_step-end_infinite]">|</span></div>
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Input area -->
  <div class="px-4 pb-4 sm:mx-auto sm:w-full sm:max-w-[860px] sm:px-6 sm:pb-5">
    <div class="flex items-end rounded-[22px] border border-[var(--chat-input-border)] bg-[var(--chat-bg-input)] py-1.5 pl-[18px] pr-1.5 transition-[border-color,background,box-shadow] duration-200 focus-within:border-[var(--chat-input-border-focus)] focus-within:bg-[var(--chat-bg-input-focus)] focus-within:[box-shadow:0_0_0_3px_var(--chat-focus-ring)]">
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
        textareaClass="min-h-9 max-h-40 flex-1 resize-none border-0 bg-transparent py-1.5 text-[14.5px] leading-normal text-[var(--chat-text)] outline-none placeholder:text-[var(--chat-text-muted)] disabled:cursor-not-allowed disabled:opacity-50"
      />

      <div class="flex shrink-0 items-center gap-1 pb-0.5">
        {#if $isGenerating || $isTyping}
          <button
            class="press flex h-9 w-9 items-center justify-center rounded-full border-0 bg-[var(--rose-500)] text-[var(--text-on-dark)] hover:bg-[var(--rose-600)]"
            on:click={handleStop}
            aria-label={$t('chat.stopGeneration')}
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          </button>
        {:else}
          <button
            class="press flex h-9 w-9 items-center justify-center rounded-full border-0 bg-[var(--chat-text)] text-[var(--chat-bg)] hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-25"
            disabled={!canSend}
            on:click={handleSend}
            aria-label={$t('chat.sendMessage')}
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </button>
        {/if}
      </div>
    </div>
  </div>
</div>
