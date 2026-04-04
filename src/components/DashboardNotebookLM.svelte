<script>
  import { user, logout } from "../stores/auth.js";
  import TokenUsageChart from "../pages/token-usage-chart/TokenUsageChart.svelte";
  import Settings from "../pages/settings/Settings.svelte";

  import { chatStore } from "../stores/chat.js";
  import { workspaceStore } from "../stores/workspace.js";
  import WorkspacePanel from "../pages/workspace/WorkspacePanel.svelte";
  import { route, navigate } from "../stores/router.js";
  import { dashboardService } from "../lib/services/dashboard.service";
  import Button from "$lib/components/common/Button.svelte";
  import TextField from "$lib/components/common/TextField.svelte";
  import { language, setLanguage, t } from "../lib/i18n";

  /** @typedef {import('../lib/models').DocumentItem} DocumentItem */
  /** @typedef {import('../lib/models').ChatSession} ChatSession */

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
  let newChatTitle = "";
  /** @type {string[]} */
  let selectedDocs = [];
  /** @type {DocumentItem[]} */
  let availableDocs = [];

  async function fetchDocs() {
    try {
      availableDocs = /** @type {DocumentItem[]} */ (await dashboardService.getDocuments());
    } catch (e) {
      console.error("Failed to fetch docs", e);
    }
  }

  async function handleNewChat() {
    if (!newChatTitle.trim()) return;
    try {
      /** @type {ChatSession} */
      const created = await chatStore.createSession(newChatTitle, selectedDocs);
      isNewChatModalOpen = false;
      newChatTitle = "";
      selectedDocs = [];

      // Route reflects the newly created chat
      navigate(`/workspace/${created?._id}`);
    } catch (error) {
      alert($t("chat.createFailed", { message: error.message }));
    }
  }

  function pageTitle(page) {
    if (page === "analytics") return $t("header.analytics");
    if (page === "settings") return $t("header.settings");
    return $t("header.workspace");
  }

  $: if (isNewChatModalOpen) fetchDocs();

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
        chatStore.setCurrentSession(null);
      }
    }
    if (chatId && chatId !== $workspaceStore.currentSessionId) {
      workspaceStore.setCurrentSession(chatId);
      chatStore.setCurrentSession(chatId);
      lastLoadedChatId = chatId;
      chatStore.loadMessages(chatId);
    } else if (chatId && chatId === $workspaceStore.currentSessionId && lastLoadedChatId !== chatId) {
      // Direct URL load (or back/forward) where store already has chatId but messages not loaded in this session
      lastLoadedChatId = chatId;
      chatStore.setCurrentSession(chatId);
      chatStore.loadMessages(chatId);
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
        <div class="inline-flex items-center rounded-[var(--radius-md)] border border-[var(--border-purple)] bg-[var(--purple-50)] p-1" role="group" aria-label={$t("header.language")}>
          <Button
            unstyled
            type="button"
            className={`px-2 sm:px-3 py-2 min-h-11 text-xs sm:text-sm rounded-[var(--radius-sm)] ${$language === "vi" ? "[background:var(--gradient-accent)] text-[var(--text-on-dark)] font-medium" : "bg-transparent text-[var(--text-secondary)]"}`}
            on:click={() => setLanguage("vi")}
            aria-pressed={$language === "vi"}
          >
            🇻🇳 VI
          </Button>
          <Button
            unstyled
            type="button"
            className={`px-2 sm:px-3 py-2 min-h-11 text-xs sm:text-sm rounded-[var(--radius-sm)] ${$language === "en" ? "[background:var(--gradient-accent)] text-[var(--text-on-dark)] font-medium" : "bg-transparent text-[var(--text-secondary)]"}`}
            on:click={() => setLanguage("en")}
            aria-pressed={$language === "en"}
          >
            🇺🇸 EN
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
        <div
          class="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50"
        >
          <div
            class="bg-[var(--color-bg-elevated)] rounded-xl w-full max-w-md max-h-[90dvh] overflow-hidden border border-[var(--color-border-default)]"
          >
            <div class="p-6 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]">
              <h3 class="text-xl font-semibold text-[var(--color-text-primary)]">
                {$t("chat.startNew")}
              </h3>
            </div>

            <div class="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[calc(90dvh-140px)]">
              <div>
                <label
                  for="title"
                  class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1"
                  >{$t("chat.chatTitle")}</label
                >
                <TextField
                  bare
                  unstyled
                  id="title"
                  type="text"
                  bind:value={newChatTitle}
                  placeholder={$t("chat.chatTitlePlaceholder")}
                  inputClass="w-full px-4 py-2 border border-[var(--color-border-default)] rounded-lg bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-border-accent)] focus:[box-shadow:0_0_0_3px_rgba(91,79,207,0.12)]"
                />
              </div>

              <div>
                <div class="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
                  {$t("chat.linkDocumentsOptional")}
                </div>
                {#if availableDocs.length === 0}
                  <p class="text-sm text-[var(--color-text-muted)] italic">
                    {$t("chat.noDocumentsAvailable")}
                  </p>
                {:else}
                  <div
                    class="max-h-40 overflow-y-auto border border-[var(--color-border-default)] rounded-md p-2 bg-[var(--color-bg-surface)]"
                  >
                    {#each availableDocs as doc}
                      <label
                        class="flex items-center space-x-2 p-1 hover:bg-[var(--color-bg-hover)] rounded"
                      >
                        <TextField
                          bare
                          unstyled
                          type="checkbox"
                          bind:group={selectedDocs}
                          value={doc._id}
                          inputClass="rounded border-[var(--color-border-default)] text-[var(--color-accent)]"
                        />
                        <span class="text-sm truncate" title={doc.title}
                          >{doc.title}</span
                        >
                        <span
                          class="text-xs px-2 py-0.5 rounded-full bg-[var(--color-status-ready-bg)] text-[var(--color-status-ready)] border border-[var(--color-status-ready-border)] ml-auto"
                          >{doc.status}</span
                        >
                      </label>
                    {/each}
                  </div>
                {/if}
              </div>
            </div>

            <div
              class="p-4 bg-[var(--color-bg-app)] border-t border-[var(--color-border-subtle)] flex flex-col-reverse sm:flex-row sm:justify-end gap-3"
            >
              <Button
                unstyled
                on:click={() => (isNewChatModalOpen = false)}
                className="w-full sm:w-auto px-4 py-2 min-h-11 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] rounded-lg transition-colors border border-[var(--color-border-default)]"
              >
                {$t("common.cancel")}
              </Button>
              <Button
                unstyled
                on:click={handleNewChat}
                disabled={!newChatTitle.trim()}
                className="w-full sm:w-auto px-4 py-2 min-h-11 text-sm font-medium text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {$t("chat.createChat")}
              </Button>
            </div>
          </div>
        </div>
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
