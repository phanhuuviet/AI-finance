<script>
  import { afterUpdate } from "svelte";
  import { fade } from "svelte/transition";
  import { chatStore } from "../../../../stores/chat.js";
  import { wsStore } from "../../../../stores/websocket.js";

  import { sendWebSocketMessage } from "../../../../lib/services/websocket.service";
  import { currentSessionSelectedDocIds } from "../../../../stores/attachments.js";
  import LoadingBlock from "../../../../lib/components/common/LoadingBlock.svelte";
  import ErrorFallback from "../../../../lib/components/common/ErrorFallback.svelte";

  /** @typedef {import('../../../../lib/models').ChatMessage} ChatMessage */

  // Session-scoped: caller passes the sessionId belonging to a section
  /** @type {string | null} */
  export let sessionId = null;

  let messageInput = "";
  /** @type {HTMLDivElement | null} */
  let chatContainer = null;

  /** @type {ChatMessage[]} */
  $: messages = sessionId ? $chatStore.messages[sessionId] || [] : [];
  $: messageState = sessionId
    ? ($chatStore.messagesState?.[sessionId] || {
        data: null,
        loading: false,
        showLoading: false,
        error: null
      })
    : { data: null, loading: false, showLoading: false, error: null };
  $: isConnected = $wsStore.status === "connected";
  $: selectedDocIds = $currentSessionSelectedDocIds;
  $: selectedCount = selectedDocIds?.length ?? 0;

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
  class="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200"
>
  <div
    class="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg"
  >
    <h2 class="text-lg font-semibold text-gray-800">
      {sessionId ? "Chat Session" : "Select a Chat"}
    </h2>
    <div class="flex items-center gap-2">
      <div
        class={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
      ></div>
      <span class="text-sm text-gray-500"
        >{isConnected ? "Connected" : "Disconnected"}</span
      >
    </div>
  </div>

  <div bind:this={chatContainer} class="flex-1 overflow-y-auto p-4 space-y-4">
    {#if !sessionId}
      <div class="h-full flex items-center justify-center text-gray-400">
        Select a chat from history or start a new one
      </div>
    {:else if messageState.loading}
      <div class="space-y-4" aria-live="polite">
        <LoadingBlock rows={2} rowHeight="h-10" className="max-w-[75%]" active={messageState.showLoading} />
        <div class="flex justify-end">
          <LoadingBlock rows={1} rowHeight="h-10" className="w-[60%]" active={messageState.showLoading} />
        </div>
        <LoadingBlock rows={2} rowHeight="h-10" className="max-w-[70%]" active={messageState.showLoading} />
      </div>
    {:else if messageState.error}
      <ErrorFallback
        compact={true}
        message={messageState.error}
        retryLabel="Retry loading messages"
        on:retry={() => sessionId && chatStore.loadMessages(sessionId)}
      />
    {:else if messages.length === 0}
      <div class="h-full flex items-center justify-center text-gray-400">
        No messages yet. Send a message to start!
      </div>
    {:else}
      <div transition:fade={{ duration: 180 }}>
        {#each messages as msg}
          <div
            class={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              class={`max-w-[75%] rounded-lg p-3 ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-gray-100 text-gray-800 rounded-bl-none"
              }`}
            >
              <div class="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {msg.content}
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <div class="p-4 border-t border-gray-200 bg-white rounded-b-lg">
    <div class="relative flex items-center">
      <textarea
        bind:value={messageInput}
        on:keydown={handleKeydown}
        disabled={!sessionId || !isConnected}
        placeholder={!sessionId
          ? "Select a chat first..."
          : "Type your message..."}
        class="w-full pl-4 pr-20 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-14"
        rows="1"
      ></textarea>

      <!-- docs indicator (icon + badge) -->
      <div class="absolute right-11 flex items-center">
        <button
          type="button"
          class="relative p-2 text-gray-500 hover:text-gray-700"
          aria-label="Selected documents"
          title="Selected documents"
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
              class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-black text-[10px] leading-[18px] text-center"
              aria-label={`${selectedCount} documents selected`}
              >{selectedCount}</span
            >
          {/if}
        </button>
      </div>

      <button
        on:click={sendMessage}
        disabled={!messageInput.trim() || !sessionId || !isConnected}
        class="absolute right-2 p-2 text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed"
        aria-label="Send message"
        title="Send"
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
      </button>
    </div>
  </div>
</div>
