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
  /** @type {ReturnType<typeof setTimeout> | undefined} */
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
  class="flex h-full flex-col rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-panel)]"
>
  <div class="p-3 sm:p-4">
    <h2 class="mb-3 text-[15px] font-semibold tracking-[-0.01em] text-[var(--text-primary)]">{$t("chat.history")}</h2>
    <div class="relative">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <TextField
        bare
        unstyled
        type="text"
        bind:value={searchValue}
        placeholder={$t("chat.searchPlaceholder")}
        on:input={handleSearch}
        inputClass="w-full min-h-0 rounded-full border border-[var(--border-default)] bg-[var(--bg-input)] py-2 pl-9 pr-3 text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--chat-input-border-focus)] focus:bg-[var(--bg-card)] focus:[box-shadow:0_0_0_3px_var(--chat-focus-ring)]"
      />
    </div>
  </div>

  <div class="flex-1 space-y-0.5 overflow-y-auto px-2 pb-2" transition:fade={{ duration: 180 }}>
    {#each $sessions as session (session.id)}
      <button
        class={`block w-full cursor-pointer rounded-[10px] px-3 py-2.5 text-left transition-colors duration-150 ${selectedSessionId === session.id ? "bg-[var(--color-bg-active)]" : "hover:bg-[var(--bg-card-hover)]"}`}
        on:click={() => session.id && selectSession(session.id)}
        type="button"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <span class="block truncate text-[13.5px] font-medium text-[var(--text-primary)]">{session.title}</span>
            <span class="mt-0.5 block truncate text-[12px] text-[var(--text-muted)]">{session.video_concept}</span>
          </div>
          <span class="shrink-0 text-[11px] text-[var(--text-muted)]">{formatDate(session)}</span>
        </div>
      </button>
    {:else}
      {#if $sessionStore.isLoadingSessions}
        <div class="space-y-1.5 p-1">
          {#each Array(5) as _}
            <div class="h-[52px] rounded-[10px] bg-[var(--bg-card-hover)] animate-pulse"></div>
          {/each}
        </div>
      {:else}
        <div class="flex flex-col items-center justify-center px-4 py-10 text-center">
          <p class="text-sm text-[var(--text-muted)]">{$t("chat.noConversations")}</p>
          <p class="mt-1 text-xs text-[var(--text-muted)] opacity-70">{$t("chat.noConversationsHint")}</p>
        </div>
      {/if}
    {/each}
  </div>

  {#if $sessionPagination && $sessionPagination.totalPages > 1}
    <div class="flex items-center justify-between border-t border-[var(--border-subtle)] px-3 py-2 text-xs text-[var(--text-muted)]">
      <button
        class="rounded-full px-2.5 py-1 transition-colors hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] disabled:opacity-40 disabled:cursor-not-allowed"
        disabled={$sessionCurrentPage === 1}
        on:click={() => sessionService.goToPage($sessionCurrentPage - 1)}
      >
        ← {$t("common.prev")}
      </button>

      <span>{$sessionCurrentPage} / {$sessionPagination.totalPages}</span>

      <button
        class="rounded-full px-2.5 py-1 transition-colors hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] disabled:opacity-40 disabled:cursor-not-allowed"
        disabled={$sessionCurrentPage === $sessionPagination.totalPages}
        on:click={() => sessionService.goToPage($sessionCurrentPage + 1)}
      >
        {$t("common.next")} →
      </button>
    </div>
  {/if}
</div>
