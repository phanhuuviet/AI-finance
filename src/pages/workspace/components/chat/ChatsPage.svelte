<script>
  import { fade } from "svelte/transition";
  import { onDestroy } from "svelte";
  import { navigate } from "../../../../stores/router.js";
  import {
    sessions,
    sessionStore,
    sessionPagination,
    sessionCurrentPage,
  } from "$lib/stores/session.store";
  import { sessionService } from "$lib/services/session.service";
  import { newChatModalOpen } from "../../../../stores/ui.js";
  import { formatRelativeDate } from "$lib/utils/date";
  import TextField from "$lib/components/common/TextField.svelte";
  import { t } from "$lib/i18n";

  let searchValue = "";
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let debounceTimer;

  function handleSearch() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => sessionService.search(searchValue || ""), 400);
  }

  /** @param {string} id */
  function openSession(id) {
    if (!id) return;
    // The app shell loads history + connects the websocket based on the URL.
    navigate(`/workspace/${id}`);
  }

  /** @param {{ updated_at?: string; created_at?: string }} session */
  function dateOf(session) {
    const value = session.updated_at || session.created_at;
    return value ? formatRelativeDate(value) : "-";
  }

  onDestroy(() => clearTimeout(debounceTimer));
</script>

<div class="mx-auto flex h-full w-full max-w-3xl flex-col px-4 sm:px-6">
  <div class="flex items-center justify-between gap-3 pt-1 sm:pt-2">
    <h1 class="text-[24px] sm:text-[26px] font-semibold tracking-[-0.02em] text-[var(--text-primary)]">
      {$t("header.chats")}
    </h1>
    <button
      class="press inline-flex items-center gap-1.5 rounded-full [background:var(--gradient-accent)] px-3.5 py-2 text-[13px] font-medium text-white shadow-[var(--shadow-soft)] transition-[opacity,transform] duration-150 hover:opacity-90"
      on:click={() => newChatModalOpen.set(true)}
      type="button"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4">
        <path d="M11.25 4.5a.75.75 0 011.5 0v6.75H19.5a.75.75 0 010 1.5h-6.75V19.5a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5z" />
      </svg>
      <span class="hidden sm:inline">{$t("header.newChat")}</span>
    </button>
  </div>

  <div class="relative mt-5">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[var(--text-muted)]">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
    <TextField
      bare
      unstyled
      type="text"
      bind:value={searchValue}
      placeholder={$t("chat.searchPlaceholder")}
      on:input={handleSearch}
      inputClass="w-full rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-card)] py-3 pl-11 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--chat-input-border-focus)] focus:bg-[var(--bg-card)] focus:[box-shadow:0_0_0_3px_var(--chat-focus-ring)]"
    />
  </div>

  <div class="mt-3 min-h-0 flex-1 overflow-y-auto pb-4" transition:fade={{ duration: 150 }}>
    {#each $sessions as session (session.id)}
      <button
        class="group flex w-full items-center justify-between gap-4 border-b border-[var(--border-subtle)] px-3 py-3.5 text-left transition-colors duration-150 hover:bg-[var(--bg-card-hover)]"
        on:click={() => session.id && openSession(session.id)}
        type="button"
      >
        <span class="min-w-0 flex-1 truncate text-[14px] font-medium text-[var(--text-primary)]">{session.title}</span>
        <span class="shrink-0 text-[12px] text-[var(--text-muted)]">{dateOf(session)}</span>
      </button>
    {:else}
      {#if $sessionStore.isLoadingSessions}
        <div class="space-y-2 py-2">
          {#each Array(6) as _}
            <div class="h-[52px] animate-pulse rounded-[10px] bg-[var(--bg-card-hover)]"></div>
          {/each}
        </div>
      {:else}
        <div class="flex flex-col items-center justify-center px-4 py-16 text-center">
          <p class="text-sm text-[var(--text-muted)]">{$t("chat.noConversations")}</p>
          <p class="mt-1 text-xs text-[var(--text-muted)] opacity-70">{$t("chat.noConversationsHint")}</p>
        </div>
      {/if}
    {/each}
  </div>

  {#if $sessionPagination && $sessionPagination.totalPages > 1}
    <div class="flex items-center justify-between border-t border-[var(--border-subtle)] px-1 py-2.5 text-xs text-[var(--text-muted)]">
      <button
        class="rounded-full px-2.5 py-1 transition-colors hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-40"
        disabled={$sessionCurrentPage === 1}
        on:click={() => sessionService.goToPage($sessionCurrentPage - 1)}
      >
        ← {$t("common.prev")}
      </button>
      <span>{$sessionCurrentPage} / {$sessionPagination.totalPages}</span>
      <button
        class="rounded-full px-2.5 py-1 transition-colors hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-40"
        disabled={$sessionCurrentPage === $sessionPagination.totalPages}
        on:click={() => sessionService.goToPage($sessionCurrentPage + 1)}
      >
        {$t("common.next")} →
      </button>
    </div>
  {/if}
</div>
