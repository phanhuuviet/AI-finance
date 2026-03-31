<script>
  import { onMount, afterUpdate } from "svelte";
  import { chatStore } from "../stores/chat.js";
  import { wsStore } from "../stores/websocket.js";
  import { sendWebSocketMessage } from "../utils/websocket.js";

  /** @typedef {import('../models/chat').ChatMessage} ChatMessage */

  let messageInput = "";
  /** @type {HTMLDivElement | null} */
  let chatContainer = null;

  $: currentSessionId = $chatStore.currentSessionId;
  /** @type {ChatMessage[]} */
  $: messages = currentSessionId
    ? $chatStore.messages[currentSessionId] || []
    : [];
  $: isConnected = $wsStore.status === "connected";

  function scrollToBottom() {
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  afterUpdate(() => {
    scrollToBottom();
  });

  function sendMessage() {
    if (!messageInput.trim() || !currentSessionId || !isConnected) return;

    sendWebSocketMessage(currentSessionId, messageInput);
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
  <!-- Chat Header -->
  <div
    class="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg"
  >
    <h2 class="text-lg font-semibold text-gray-800">
      {currentSessionId ? "Chat Session" : "Select a Chat"}
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

  <!-- Messages Area -->
  <div bind:this={chatContainer} class="flex-1 overflow-y-auto p-4 space-y-4">
    {#if !currentSessionId}
      <div class="h-full flex items-center justify-center text-gray-400">
        Select a chat from history or start a new one
      </div>
    {:else if messages.length === 0}
      <div class="h-full flex items-center justify-center text-gray-400">
        No messages yet. Send a message to start!
      </div>
    {:else}
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
    {/if}
  </div>

  <!-- Input Area -->
  <div class="p-4 border-t border-gray-200 bg-white rounded-b-lg">
    <div class="relative flex items-center">
      <textarea
        bind:value={messageInput}
        on:keydown={handleKeydown}
        disabled={!currentSessionId || !isConnected}
        placeholder={!currentSessionId
          ? "Select a chat first..."
          : "Type your message..."}
        class="w-full pl-4 pr-12 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-14"
        rows="1"
      ></textarea>
      <button
        on:click={sendMessage}
        disabled={!messageInput.trim() || !currentSessionId || !isConnected}
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
