<script>
  import { onMount, onDestroy } from "svelte";
  import { user, fetchUser } from "./stores/auth.js";
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
      if (localStorage.getItem("token")) {
        await fetchUser();
        connectWebSocket();
      }
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

<main class="min-h-screen w-full overflow-x-hidden bg-[var(--color-bg-app)] text-[var(--color-text-primary)]">
  {#if loading}
    <div class="p-6 text-sm text-[var(--color-text-secondary)]">{$t("common.loading")}</div>
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
