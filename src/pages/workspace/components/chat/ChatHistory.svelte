<script>
  import { createEventDispatcher } from "svelte";
  import { onDestroy } from "svelte";
  import { fade } from "svelte/transition";
  import { workspaceStore } from "../../../../stores/workspace.js";
  import { navigate } from "../../../../stores/router.js";
  import { sessionStore, sessions } from "$lib/stores/session.store";
  import { chatService } from "$lib/services/chat.service";
  import { wsService } from "$lib/services/websocket.service";
  import LoadingBlock from "$lib/components/common/LoadingBlock.svelte";
  import TextField from "$lib/components/common/TextField.svelte";
  import Button from "$lib/components/common/Button.svelte";
  import { t } from "$lib/i18n";

  /** @typedef {{ id?: string; _id?: string; title: string; created_at?: string; updated_at?: string; }} ListSession */

  const dispatch = createEventDispatcher();

  let searchTerm = "";

  $: selectedSessionId = $workspaceStore.currentSessionId;
  $: sessionsState = $sessionStore;

  /** @type {ListSession[]} */
  $: filteredSessions = ($sessions || []).filter((session) =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /** @param {ListSession} session */
  function getSessionId(session) {
    return session.id || session._id || null;
  }

  /** @param {ListSession} session */
  function formatCreatedAt(session) {
    const value = session.created_at || session.updated_at;
    if (!value) return "-";
    return new Date(value).toLocaleDateString();
  }

  /** @param {string} id */
  async function selectSession(id) {
    await chatService.loadHistory(id);
    wsService.connect(id);
    dispatch("select", { id });
    navigate(`/workspace/${id}`);
  }

  onDestroy(() => {
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
      bind:value={searchTerm}
      placeholder={$t("chat.searchPlaceholder")}
      inputClass="w-full px-3 py-2.5 min-h-11 bg-white border border-[var(--border-purple)] rounded-[var(--radius-md)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--indigo-400)] focus:[box-shadow:0_0_0_3px_rgba(99,102,241,0.15)]"
    />
  </div>

  <div class="flex-1 overflow-y-auto">
    {#if sessionsState.isLoadingSessions}
      <div class="p-4 space-y-4">
        <LoadingBlock rows={1} rowHeight="h-10" className="mb-2" active={sessionsState.isLoadingSessions} />
        <LoadingBlock rows={6} rowHeight="h-14" active={sessionsState.isLoadingSessions} />
      </div>
    {:else if ($sessions || []).length === 0}
      <div class="p-4 text-center text-[var(--text-muted)] text-sm">
        No chats yet. Create one to get started.
      </div>
    {:else if filteredSessions.length === 0}
      <div class="p-4 text-center text-[var(--text-muted)] text-sm">
        {$t("chat.noSearchMatches")}
      </div>
    {:else}
      <div transition:fade={{ duration: 180 }}>
        <ul class="divide-y divide-[var(--border-subtle)]">
          {#each filteredSessions as session}
            <li>
              <Button
                unstyled
                className={`w-full text-left block p-3 sm:p-4 min-h-11 cursor-pointer transition-[background,border-color,color] duration-150 border-l-[3px] ${selectedSessionId === getSessionId(session) ? "bg-[var(--purple-100)] border-l-[var(--purple-600)]" : "border-l-transparent hover:bg-[var(--purple-50)] hover:border-l-[var(--purple-400)]"}`}
                on:click={() => getSessionId(session) && selectSession(getSessionId(session))}
                type="button"
              >
                <div class={`truncate ${selectedSessionId === getSessionId(session) ? "font-semibold text-[var(--purple-700)]" : "font-medium text-[var(--text-primary)]"}`}>
                  {session.title}
                </div>
                <div class="text-xs text-[var(--text-muted)] mt-1">
                  {formatCreatedAt(session)}
                </div>
              </Button>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </div>
</div>
