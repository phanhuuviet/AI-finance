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
  class="flex flex-col h-full bg-[var(--color-bg-sidebar)] rounded-lg border border-[var(--color-border-default)]"
>
  <div class="p-3 sm:p-4 border-b border-[var(--color-border-default)]">
    <h2 class="text-base sm:text-lg font-semibold text-[var(--color-text-primary)] mb-3">{$t("chat.history")}</h2>
    <TextField
      bare
      unstyled
      type="text"
      bind:value={searchTerm}
      placeholder={$t("chat.searchPlaceholder")}
      inputClass="w-full px-3 py-2.5 min-h-11 border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] rounded-lg text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-border-accent)] focus:[box-shadow:0_0_0_3px_rgba(91,79,207,0.12)]"
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
      <div class="p-4 text-center text-[var(--color-text-muted)] text-sm">
        {$t("chat.noHistory")}
      </div>
    {:else if filteredSessions.length === 0}
      <div class="p-4 text-center text-[var(--color-text-muted)] text-sm">
        {$t("chat.noSearchMatches")}
      </div>
    {:else}
      <div transition:fade={{ duration: 180 }}>
        <ul class="divide-y divide-[var(--color-border-subtle)]">
          {#each filteredSessions as session}
            <li>
              <Button
                unstyled
                className={`w-full text-left block p-3 sm:p-4 min-h-11 cursor-pointer transition-colors border-l-[3px] ${selectedSessionId === session._id ? "bg-[var(--color-bg-active)] border-l-[var(--color-accent)]" : "border-l-transparent hover:bg-[var(--color-bg-hover)]"}`}
                on:click={() => selectSession(session._id)}
                type="button"
              >
                <div class="font-medium text-[var(--color-text-primary)] truncate">
                  {session.title}
                </div>
                <div class="text-xs text-[var(--color-text-muted)] mt-1">
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
