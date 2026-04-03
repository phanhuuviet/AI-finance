<script>
  import { createEventDispatcher } from "svelte";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { chatStore } from "../../../../stores/chat.js";
  import { workspaceStore } from "../../../../stores/workspace.js";
  import { navigate } from "../../../../stores/router.js";
  import LoadingBlock from "$lib/components/common/LoadingBlock.svelte";
  import ErrorFallback from "$lib/components/common/ErrorFallback.svelte";
  import TextField from "$lib/components/common/TextField.svelte";
  import Button from "$lib/components/common/Button.svelte";
  import { t } from "../../../../lib/i18n";

  /** @typedef {import('../../../../lib/models').ChatSession} ChatSession */

  const dispatch = createEventDispatcher();

  let searchTerm = "";

  onMount(() => {
    chatStore.fetchSessions();
  });

  $: selectedSessionId = $workspaceStore.currentSessionId;
  $: sessionsState = $chatStore.sessionsState;

  /** @type {ChatSession[]} */
  $: filteredSessions = ($chatStore.sessions || []).filter((session) =>
    session.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /** @param {string} id */
  async function selectSession(id) {
    dispatch("select", { id });
    navigate(`/workspace/${id}`);
  }
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
    {#if sessionsState.loading}
      <div class="p-4 space-y-4">
        <LoadingBlock rows={1} rowHeight="h-10" className="mb-2" active={sessionsState.showLoading} />
        <LoadingBlock rows={6} rowHeight="h-14" active={sessionsState.showLoading} />
      </div>
    {:else if sessionsState.error}
      <div class="p-4">
        <ErrorFallback
          compact={true}
          message={sessionsState.error}
          retryLabel={$t("chat.retryLoadingChats")}
          on:retry={() => chatStore.fetchSessions()}
        />
      </div>
    {:else if $chatStore.sessions.length === 0}
      <div class="p-4 text-center text-[var(--text-muted)] text-sm">
        {$t("chat.noHistory")}
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
                className={`w-full text-left block p-3 sm:p-4 min-h-11 cursor-pointer transition-[background,border-color,color] duration-150 border-l-[3px] ${selectedSessionId === session._id ? "bg-[var(--purple-100)] border-l-[var(--purple-600)]" : "border-l-transparent hover:bg-[var(--purple-50)] hover:border-l-[var(--purple-400)]"}`}
                on:click={() => selectSession(session._id)}
                type="button"
              >
                <div class={`truncate ${selectedSessionId === session._id ? "font-semibold text-[var(--purple-700)]" : "font-medium text-[var(--text-primary)]"}`}>
                  {session.title}
                </div>
                <div class="text-xs text-[var(--text-muted)] mt-1">
                  {new Date(session.updated_at).toLocaleDateString()}
                </div>
              </Button>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </div>
</div>
