<script>
  import { createEventDispatcher } from "svelte";
  import { onDestroy } from "svelte";
  import { fade } from "svelte/transition";
  import { workspaceStore } from "../../../../stores/workspace.js";
  import { navigate } from "../../../../stores/router.js";
  import {
    sessionStore,
    sessions,
    sessionPagination,
    sessionCurrentPage,
  } from "$lib/stores/session.store";
  import { chatService } from "$lib/services/chat.service";
  import { sessionService } from "$lib/services/session.service";
  import { wsService } from "$lib/services/websocket.service";
  import TextField from "$lib/components/common/TextField.svelte";
  import { formatRelativeDate } from "$lib/utils/date";
  import { t } from "$lib/i18n";

  const dispatch = createEventDispatcher();

  let searchValue = "";
  let debounceTimer;

  $: selectedSessionId = $workspaceStore.currentSessionId;

  function handleSearch() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      sessionService.search(searchValue || "");
    }, 400);
  }

  /** @param {string} id */
  async function selectSession(id) {
    await chatService.loadHistory(id);
    wsService.connect(id);
    dispatch("select", { id });
    navigate(`/workspace/${id}`);
  }

  /** @param {{ updated_at?: string; created_at?: string }} session */
  function formatDate(session) {
    const value = session.updated_at || session.created_at;
    if (!value) return "-";
    return formatRelativeDate(value);
  }

  onDestroy(() => {
    clearTimeout(debounceTimer);
    wsService.disconnect();
  });
</script>

<div
  class="flex flex-col h-full bg-[var(--bg-chat-list)] rounded-lg border border-[var(--border-purple)]"
>
  <div class="p-3 sm:p-4 border-b border-[var(--border-purple)]">
    <h2 class="text-base sm:text-lg font-semibold text-[var(--text-primary)] mb-3">{$t("chat.history")}</h2>
    <TextField
      bare
      unstyled
      type="text"
      bind:value={searchValue}
      placeholder={$t("chat.searchPlaceholder")}
      on:input={handleSearch}
      inputClass="w-full px-3 py-2.5 min-h-11 bg-white border border-[var(--border-purple)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--indigo-400)] focus:[box-shadow:0_0_0_3px_rgba(99,102,241,0.15)]"
    />
  </div>

  <div class="flex-1 overflow-y-auto" transition:fade={{ duration: 180 }}>
    {#each $sessions as session (session.id)}
      <button
        class={`w-full text-left block p-3 sm:p-4 min-h-11 cursor-pointer transition-[background,border-color,color] duration-150 border-l-[3px] border-l-transparent hover:bg-[var(--purple-50)] hover:border-l-[var(--purple-400)] ${selectedSessionId === session.id ? "bg-[var(--purple-100)] border-l-[var(--purple-600)]" : ""}`}
        on:click={() => session.id && selectSession(session.id)}
        type="button"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <span class="block truncate text-[var(--text-primary)] font-semibold">{session.title}</span>
            <span class="block truncate text-xs text-[var(--text-muted)] mt-1">{session.video_concept}</span>
          </div>
          <span class="text-xs text-[var(--text-muted)] shrink-0">{formatDate(session)}</span>
        </div>
      </button>
    {:else}
      {#if $sessionStore.isLoadingSessions}
        <div class="p-3">
          {#each Array(4) as _}
            <div class="h-14 rounded-lg bg-purple-50 animate-pulse mx-2 mb-2"></div>
          {/each}
        </div>
      {:else}
        <div class="flex flex-col items-center justify-center py-10 text-center px-4">
          <p class="text-sm text-gray-400">No conversations yet.</p>
          <p class="text-xs text-gray-300 mt-1">Click "+ New Chat" to get started.</p>
        </div>
      {/if}
    {/each}
  </div>

  {#if $sessionPagination && $sessionPagination.totalPages > 1}
    <div class="flex items-center justify-between px-3 py-2 border-t border-gray-100 text-xs text-gray-500">
      <button
        class="px-2 py-1 rounded hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed"
        disabled={$sessionCurrentPage === 1}
        on:click={() => sessionService.goToPage($sessionCurrentPage - 1)}
      >
        ← Prev
      </button>

      <span>{$sessionCurrentPage} / {$sessionPagination.totalPages}</span>

      <button
        class="px-2 py-1 rounded hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed"
        disabled={$sessionCurrentPage === $sessionPagination.totalPages}
        on:click={() => sessionService.goToPage($sessionCurrentPage + 1)}
      >
        Next →
      </button>
    </div>
  {/if}
</div>
