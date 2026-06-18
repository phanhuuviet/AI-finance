<script>
  import { route, navigate } from "../stores/router.js";
  import { sessions, sessionStore } from "$lib/stores/session.store";
  import { t } from "$lib/i18n";

  $: activeId = $route.page === "workspace" ? $route.chatId : null;

  /** @param {string} id */
  function selectSession(id) {
    if (!id) return;
    // The app shell loads history + connects the websocket based on the URL.
    navigate(`/workspace/${id}`);
  }
</script>

<div class="flex min-h-0 flex-1 flex-col">
  <div class="px-3 pb-1 pt-3">
    <span class="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">
      {$t("header.recents")}
    </span>
  </div>

  <div class="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-2 pb-2">
    {#each $sessions as session (session.id)}
      <button
        class={`block w-full truncate rounded-[8px] px-2.5 py-2 text-left text-[13px] transition-colors duration-150 ${activeId === session.id ? "bg-[var(--color-bg-active)] font-medium text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg-sidebar-hover)] hover:text-[var(--text-primary)]"}`}
        on:click={() => session.id && selectSession(session.id)}
        title={session.title}
        type="button"
      >
        {session.title}
      </button>
    {:else}
      {#if $sessionStore.isLoadingSessions}
        <div class="space-y-1 px-1 py-1">
          {#each Array(6) as _}
            <div class="h-8 animate-pulse rounded-[8px] bg-[var(--bg-sidebar-hover)]"></div>
          {/each}
        </div>
      {:else}
        <p class="px-2.5 py-2 text-[12px] text-[var(--text-muted)]">{$t("chat.noConversations")}</p>
      {/if}
    {/each}
  </div>
</div>
