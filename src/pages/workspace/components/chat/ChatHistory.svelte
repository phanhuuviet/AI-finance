<script>
  import { createEventDispatcher } from "svelte";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { chatStore } from "../../../../stores/chat.js";
  import { workspaceStore } from "../../../../stores/workspace.js";
  import { navigate } from "../../../../stores/router.js";
  import LoadingBlock from "../../../../lib/components/common/LoadingBlock.svelte";
  import ErrorFallback from "../../../../lib/components/common/ErrorFallback.svelte";
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
  class="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200"
>
  <div class="p-3 sm:p-4 border-b border-gray-200">
    <h2 class="text-base sm:text-lg font-semibold text-gray-800 mb-3">{$t("chat.history")}</h2>
    <input
      type="text"
      bind:value={searchTerm}
      placeholder={$t("chat.searchPlaceholder")}
      class="w-full px-3 py-2.5 min-h-11 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
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
      <div class="p-4 text-center text-gray-500 text-sm">
        {$t("chat.noHistory")}
      </div>
    {:else if filteredSessions.length === 0}
      <div class="p-4 text-center text-gray-500 text-sm">
        {$t("chat.noSearchMatches")}
      </div>
    {:else}
      <div transition:fade={{ duration: 180 }}>
        <ul class="divide-y divide-gray-100">
          {#each filteredSessions as session}
            <li>
              <button
                class={`w-full text-left block p-3 sm:p-4 min-h-11 hover:bg-blue-50 cursor-pointer transition-colors ${selectedSessionId === session._id ? "bg-blue-50 border-l-4 border-blue-600" : "border-l-4 border-transparent"}`}
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
      </div>
    {/if}
  </div>
</div>
