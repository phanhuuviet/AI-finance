<script>
  import { onMount, onDestroy } from "svelte";
  import { user } from "./stores/auth.js";
  import { authService } from "$lib/services/auth.service";
  import { sessionService } from "$lib/services/session.service";
  import { tokenStorage } from "$lib/utils/token";
  import { route } from "./stores/router.js";
  import { connectWebSocket, disconnectWebSocket } from "./lib/services/websocket.service";
  import { initLanguage, t } from "./lib/i18n";
  import DashboardNotebookLM from "./components/DashboardNotebookLM.svelte";
  import Login from "./pages/login/Login.svelte";
  import { initRouter } from "./stores/router.js";

  let loading = true;

  onMount(async () => {
    initLanguage();
    initRouter();
    try {
      await authService.rehydrate();

      if (tokenStorage.hasValidSession()) {
        await sessionService.loadSessions(1, '');
      }

      connectWebSocket();
    } catch {
      // ignore
    } finally {
      loading = false;
    }
  });

  onDestroy(() => {
    disconnectWebSocket();
  });

  $: if ($user) {
    connectWebSocket();
  } else {
    disconnectWebSocket();
  }
</script>

<main class="min-h-screen w-full overflow-x-hidden bg-[var(--bg-app)] text-[var(--text-primary)]">
  {#if loading}
    <div class="p-6 text-sm text-[var(--text-secondary)]">{$t("common.loading")}</div>
  {:else}
    {#if $route.page === "login"}
      <Login />
    {:else}
      <DashboardNotebookLM />
    {/if}
  {/if}
</main>

<style>
  :global(body) {
    font-family: inherit;
  }
</style>
