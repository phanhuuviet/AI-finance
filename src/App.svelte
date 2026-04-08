<script>
  import { onMount } from "svelte";
  import { authService } from "$lib/services/auth.service";
  import { sessionService } from "$lib/services/session.service";
  import { tokenStorage } from "$lib/utils/token";
  import { page } from "$app/stores";
  import { initLanguage, t } from "./lib/i18n";
  import { ROUTES } from "$lib/constants/index.js";
  import DashboardNotebookLM from "./components/DashboardNotebookLM.svelte";
  import Login from "./pages/login/Login.svelte";
  import NotFound from "./pages/not-found/NotFound.svelte";
  import { initRouter } from "./stores/router.js";

  let loading = true;
  $: pathname = $page?.url?.pathname ?? ROUTES.ROOT;
  $: isLoginPage = pathname === ROUTES.LOGIN;
  $: isNotFoundPage = pathname === ROUTES.NOT_FOUND;

  onMount(async () => {
    initLanguage();
    initRouter();
    try {
      await authService.rehydrate();

      if (tokenStorage.hasValidSession()) {
        await sessionService.loadSessions(1, '');
      }
    } catch {
      // ignore
    } finally {
      loading = false;
    }
  });
</script>

<main class="min-h-screen w-full overflow-x-hidden bg-[var(--bg-app)] text-[var(--text-primary)]">
  {#if loading}
    <div class="p-6 text-sm text-[var(--text-secondary)]">{$t("common.loading")}</div>
  {:else}
    <!-- Login-page shell check now uses $page pathname instead of custom route store. -->
    {#if isLoginPage}
      <Login />
    {:else if isNotFoundPage}
      <NotFound />
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
