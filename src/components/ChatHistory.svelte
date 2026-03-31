<script>
  import { onMount } from "svelte";
  import { chatStore } from "../stores/chat.js";

  /** @typedef {import('../models/chat').ChatSession} ChatSession */

  let searchTerm = "";

  onMount(() => {
    chatStore.fetchSessions();
  });

  /** @type {ChatSession[]} */
  $: filteredSessions = $chatStore.sessions.filter((session) =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /** @param {string} id */
  async function selectSession(id) {
    chatStore.setCurrentSession(id);
    await chatStore.loadMessages(id);
  }
</script>

<div
  class="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200"
>
  <div class="p-4 border-b border-gray-200">
    <h2 class="text-lg font-semibold text-gray-800 mb-4">Chat History</h2>
    <input
      type="text"
      bind:value={searchTerm}
      placeholder="Search chats..."
      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
    />
  </div>

  <div class="flex-1 overflow-y-auto">
    {#if $chatStore.sessions.length === 0}
      <div class="p-4 text-center text-gray-500 text-sm">
        No chat history found.
      </div>
    {:else if filteredSessions.length === 0}
      <div class="p-4 text-center text-gray-500 text-sm">
        No chats match your search.
      </div>
    {:else}
      <ul class="divide-y divide-gray-100">
        {#each filteredSessions as session}
          <li>
            <button
              class={`w-full text-left block p-4 hover:bg-blue-50 cursor-pointer transition-colors ${$chatStore.currentSessionId === session._id ? "bg-blue-50 border-l-4 border-blue-600" : "border-l-4 border-transparent"}`}
              on:click={() => selectSession(session._id)}
              type="button"
            >
              <div class="font-medium text-gray-900 truncate">
                {session.title}
              </div>
              <div class="text-xs text-gray-500 mt-1">
                {new Date(session.updated_at).toLocaleDateString()}
              </div>
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>
