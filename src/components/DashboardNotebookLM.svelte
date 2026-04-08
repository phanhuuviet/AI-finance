<script>
  import { user, logout } from "../stores/auth.js";
  import TokenUsageChart from "../pages/token-usage-chart/TokenUsageChart.svelte";
  import Settings from "../pages/settings/Settings.svelte";

  import { workspaceStore } from "../stores/workspace.js";
  import WorkspacePanel from "../pages/workspace/WorkspacePanel.svelte";
  import NewChatModal from "../pages/workspace/components/chat/NewChatModal.svelte";
  import { route, navigate } from "../stores/router.js";
  import Button from "$lib/components/common/Button.svelte";
  import { language, setLanguage, t } from "../lib/i18n";
  import { LOCALE } from "$lib/constants/index.js";

  let activeTab = "home"; // home | analytics | settings
  let mobileNavOpen = false;

  /**
   * Route -> UI tab
    * @param {'workspace'|'analytics'|'settings'|'login'} page
   */
  function tabFromPage(page) {
    if (page === "analytics") return "analytics";
    if (page === "settings") return "settings";
    return "home";
  }

  /**
   * Tab -> route
   * @param {'home'|'analytics'|'settings'} tab
   */
  function goToTab(tab) {
    mobileNavOpen = false;
    if (tab === "analytics") return navigate("/analytics");
    if (tab === "settings") return navigate("/settings");

    return navigate("/workspace");
  }

  let isNewChatModalOpen = false;

  function pageTitle(page) {
    if (page === "analytics") return $t("header.analytics");
    if (page === "settings") return $t("header.settings");
    return $t("header.workspace");
  }

  $: if ($route.page) {
    mobileNavOpen = false;
  }

  // Keep UI tab synced with URL.
  $: activeTab = tabFromPage($route.page);

  // When URL is /workspace/:idchat, select that chat.
  let lastLoadedChatId = null;
  $: if ($route.page === "workspace") {
    const chatId = $route.chatId;
    if (!chatId) {
      if ($workspaceStore.currentSessionId) {
        workspaceStore.setCurrentSession(null);
      }
    }
    if (chatId && chatId !== $workspaceStore.currentSessionId) {
      workspaceStore.setCurrentSession(chatId);
      lastLoadedChatId = chatId;
    } else if (chatId && chatId === $workspaceStore.currentSessionId && lastLoadedChatId !== chatId) {
      // Direct URL load (or back/forward) where store already has chatId but messages not loaded in this session
      lastLoadedChatId = chatId;
    }
  }
</script>

<div class="relative flex h-[100dvh] bg-[var(--bg-app)] overflow-hidden">
  {#if mobileNavOpen}
    <Button
      unstyled
      type="button"
      className="fixed inset-0 z-30 bg-black/50 lg:hidden"
      aria-label={$t("common.close")}
      on:click={() => (mobileNavOpen = false)}
    ></Button>
  {/if}

  <aside
    class={`fixed inset-y-0 left-0 z-40 w-72 max-w-[85vw] bg-[var(--bg-sidebar)] flex flex-col transform transition-transform duration-200 lg:static lg:inset-auto lg:w-64 lg:max-w-none lg:translate-x-0 ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"}`}
  >
    <div class="p-4 border-b border-[rgba(199,210,254,0.16)]">
      <h1 class="text-xl font-bold text-[var(--text-on-dark)] flex items-center gap-2">
        <span class="h-2.5 w-2.5 rounded-full [background:var(--gradient-accent)]"></span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="w-6 h-6"
        >
          <path
            fill-rule="evenodd"
            d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z"
            clip-rule="evenodd"
          />
        </svg>
        {$t("header.brand")}
      </h1>
    </div>

    <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
      <Button
        unstyled
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-[background,color,box-shadow] duration-150 ${activeTab === "home" ? "bg-[var(--bg-sidebar-active)] text-[var(--text-on-dark)] font-semibold shadow-[inset_3px_0_0_var(--purple-400)]" : "text-[var(--text-on-dark-2)] hover:bg-[var(--bg-sidebar-hover)] hover:text-[var(--text-on-dark)]"}`}
        on:click={() => goToTab("home")}
      >
        {$t("header.workspace")}
      </Button>
      <Button
        unstyled
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-[background,color,box-shadow] duration-150 ${activeTab === "analytics" ? "bg-[var(--bg-sidebar-active)] text-[var(--text-on-dark)] font-semibold shadow-[inset_3px_0_0_var(--purple-400)]" : "text-[var(--text-on-dark-2)] hover:bg-[var(--bg-sidebar-hover)] hover:text-[var(--text-on-dark)]"}`}
        on:click={() => goToTab("analytics")}
      >
        {$t("header.analytics")}
      </Button>
      <Button
        unstyled
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-[background,color,box-shadow] duration-150 ${activeTab === "settings" ? "bg-[var(--bg-sidebar-active)] text-[var(--text-on-dark)] font-semibold shadow-[inset_3px_0_0_var(--purple-400)]" : "text-[var(--text-on-dark-2)] hover:bg-[var(--bg-sidebar-hover)] hover:text-[var(--text-on-dark)]"}`}
        on:click={() => goToTab("settings")}
      >
        {$t("header.settings")}
      </Button>
    </nav>

    <div class="p-4 border-t border-[rgba(199,210,254,0.16)]">
      <div class="flex items-center gap-3 mb-4">
        <div
          class="w-10 h-10 rounded-full [background:var(--gradient-accent)] flex items-center justify-center text-[var(--text-on-dark)] font-bold"
        >
          {($user?.full_name?.[0] || "?").toUpperCase()}
        </div>
        <div class="overflow-hidden">
          <p class="text-sm font-medium text-[var(--text-on-dark)] truncate">
            {$user?.full_name || $t("header.guest")}
          </p>
          <p class="text-xs text-[var(--text-on-dark-2)] truncate">{$user?.email}</p>
        </div>
      </div>
      <Button
        unstyled
        on:click={logout}
        className="w-full px-4 py-2 text-sm text-[var(--rose-400)] border border-[rgba(251,113,133,0.3)] rounded-lg bg-[rgba(251,113,133,0.08)] hover:bg-[rgba(251,113,133,0.18)] transition-colors"
      >
        {$t("header.signOut")}
      </Button>
    </div>
  </aside>

  <main class="min-w-0 flex-1 flex flex-col h-full overflow-hidden relative">
    <header
      class="bg-[var(--bg-panel)] border-b border-[var(--border-subtle)] px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 z-10"
    >
      <div class="flex min-w-0 items-center gap-2 sm:gap-3">
        <Button
          unstyled
          type="button"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--purple-50)] lg:hidden"
          aria-label={$t("header.workspace")}
          on:click={() => (mobileNavOpen = true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5">
            <path fill-rule="evenodd" d="M3.75 5.25A.75.75 0 014.5 4.5h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75zm0 6A.75.75 0 014.5 10.5h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75zm0 6a.75.75 0 01.75-.75h15a.75.75 0 010 1.5h-15a.75.75 0 01-.75-.75z" clip-rule="evenodd" />
          </svg>
        </Button>
        <h2 class="truncate text-base sm:text-lg lg:text-[20px] font-bold text-[var(--text-primary)]">{pageTitle($route.page)}</h2>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <div class="inline-flex items-center rounded-[var(--radius-md)] border border-[var(--border-purple)] bg-[var(--purple-50)] p-0.5" role="group" aria-label={$t("header.language")}>
          <Button
            unstyled
            type="button"
            className={`px-2.5 py-1 min-h-0 text-xs sm:text-sm rounded-[var(--radius-sm)] transition-all duration-150 ${$language === LOCALE.VI ? "bg-white text-[var(--purple-700,#6D28D9)] shadow-sm" : "bg-transparent text-[var(--text-secondary)]"}`}
            on:click={() => setLanguage(LOCALE.VI)}
            aria-pressed={$language === LOCALE.VI}
          >
            VI
          </Button>
          <span class="select-none text-[var(--text-muted)]">|</span>
          <Button
            unstyled
            type="button"
            className={`px-2.5 py-1 min-h-0 text-xs sm:text-sm rounded-[var(--radius-sm)] transition-all duration-150 ${$language === LOCALE.EN ? "bg-white text-[var(--purple-700,#6D28D9)] shadow-sm" : "bg-transparent text-[var(--text-secondary)]"}`}
            on:click={() => setLanguage(LOCALE.EN)}
            aria-pressed={$language === LOCALE.EN}
          >
            EN
          </Button>
        </div>

        {#if $route.page === "workspace"}
          <Button
            unstyled
            on:click={() => (isNewChatModalOpen = true)}
            className="px-3 sm:px-4 py-2 min-h-11 [background:var(--gradient-accent)] text-white text-xs sm:text-sm font-semibold rounded-[var(--radius-md)] border-none shadow-[0_2px_8px_rgba(99,102,241,0.35)] hover:opacity-90 hover:shadow-[0_4px_12px_rgba(99,102,241,0.45)] transition-[opacity,box-shadow] duration-150"
          >
            <span class="hidden sm:inline">{$t("chat.newChatButton")}</span>
            <span class="sm:hidden">+</span>
          </Button>
        {/if}
      </div>
    </header>

    {#if $route.page === "workspace"}
      <div class="flex-1 min-h-0 overflow-hidden px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6">
        <div class="h-full min-h-0 overflow-hidden">
          <WorkspacePanel />
        </div>
      </div>

      {#if isNewChatModalOpen}
        <NewChatModal onClose={() => (isNewChatModalOpen = false)} />
      {/if}
    {:else if $route.page === "analytics"}
      <div class="flex-1 overflow-auto px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6">
        <TokenUsageChart />
      </div>
    {:else if $route.page === "settings"}
      <div class="flex-1 overflow-auto px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6">
        <Settings />
      </div>
    {/if}
  </main>
</div>
