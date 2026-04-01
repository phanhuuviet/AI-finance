<script>
  import { onMount, onDestroy } from "svelte";
  import { user, fetchUser } from "./stores/auth.js";
  import { route } from "./stores/router.js";
  import { connectWebSocket, disconnectWebSocket } from "./utils/websocket2.js";
  import DashboardNotebookLM from "./components/DashboardNotebookLM.svelte";
  import Login from "./pages/login/Login.svelte";
  import { initRouter } from "./stores/router.js";

  let loading = true;

  onMount(async () => {
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

<main class="min-h-screen bg-gray-50 text-gray-900">
  {#if loading}
    <div class="p-6 text-sm text-gray-600">Loading...</div>
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
