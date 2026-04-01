<script>
  import { user, logout } from "../stores/auth.js";
  import TokenUsageChart from "../pages/token-usage-chart/TokenUsageChart.svelte";
  import Settings from "../pages/settings/Settings.svelte";

  import { chatStore } from "../stores/chat.js";
  import { workspaceStore } from "../stores/workspace.js";
  import WorkspacePanel from "../pages/workspace/WorkspacePanel.svelte";
  import { route, navigate } from "../stores/router.js";

  /** @typedef {import('../models/document').DocumentItem} DocumentItem */
  /** @typedef {import('../models/chat').ChatSession} ChatSession */

  let activeTab = "home"; // home | analytics | settings

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
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/documents`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.ok) availableDocs = /** @type {DocumentItem[]} */ (await res.json());
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
      alert("Failed to create chat: " + error.message);
    }
  }

  $: if (isNewChatModalOpen) fetchDocs();

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

<div class="flex h-screen bg-gray-50 overflow-hidden">
  <aside class="w-64 bg-white border-r border-gray-200 flex flex-col">
    <div class="p-4 border-b border-gray-200">
      <h1 class="text-xl font-bold text-blue-600 flex items-center gap-2">
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
        AI DocChat
      </h1>
    </div>

    <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
      <button
        class={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === "home" ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-100"}`}
        on:click={() => goToTab("home")}
      >
        Workspace
      </button>
      <button
        class={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === "analytics" ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-100"}`}
        on:click={() => goToTab("analytics")}
      >
        Analytics
      </button>
      <button
        class={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === "settings" ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-100"}`}
        on:click={() => goToTab("settings")}
      >
        Settings
      </button>
    </nav>

    <div class="p-4 border-t border-gray-200">
      <div class="flex items-center gap-3 mb-4">
        <div
          class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold"
        >
          {($user?.username?.[0] || "?").toUpperCase()}
        </div>
        <div class="overflow-hidden">
          <p class="text-sm font-medium text-gray-900 truncate">
            {$user?.username || "Guest"}
          </p>
          <p class="text-xs text-gray-500 truncate">{$user?.email}</p>
        </div>
      </div>
      <button
        on:click={logout}
        class="w-full px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
      >
        Sign Out
      </button>
    </div>
  </aside>

  <main class="flex-1 flex flex-col h-full overflow-hidden relative">
    {#if $route.page === "workspace"}
      <header
        class="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between gap-4 z-10"
      >
        <h2 class="text-xl font-semibold text-gray-900">Workspace</h2>

        <button
          on:click={() => (isNewChatModalOpen = true)}
          class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          + New Chat
        </button>
      </header>

      <div class="flex-1 overflow-auto p-6">
        <WorkspacePanel />
      </div>

      {#if isNewChatModalOpen}
        <div
          class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <div
            class="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div class="p-6 border-b border-gray-100">
              <h3 class="text-xl font-semibold text-gray-900">
                Start New Chat
              </h3>
            </div>

            <div class="p-6 space-y-4">
              <div>
                <label
                  for="title"
                  class="block text-sm font-medium text-gray-700 mb-1"
                  >Chat Title</label
                >
                <input
                  id="title"
                  type="text"
                  bind:value={newChatTitle}
                  placeholder="E.g., Financial Report Analysis"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <div class="block text-sm font-medium text-gray-700 mb-1">
                  Link Documents (Optional)
                </div>
                {#if availableDocs.length === 0}
                  <p class="text-sm text-gray-500 italic">
                    No documents available. Upload some first.
                  </p>
                {:else}
                  <div
                    class="max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2"
                  >
                    {#each availableDocs as doc}
                      <label
                        class="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded"
                      >
                        <input
                          type="checkbox"
                          bind:group={selectedDocs}
                          value={doc._id}
                          class="rounded text-blue-600"
                        />
                        <span class="text-sm truncate" title={doc.title}
                          >{doc.title}</span
                        >
                        <span
                          class="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 ml-auto"
                          >{doc.status}</span
                        >
                      </label>
                    {/each}
                  </div>
                {/if}
              </div>
            </div>

            <div
              class="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3"
            >
              <button
                on:click={() => (isNewChatModalOpen = false)}
                class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                on:click={handleNewChat}
                disabled={!newChatTitle.trim()}
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                Create Chat
              </button>
            </div>
          </div>
        </div>
      {/if}
    {:else if $route.page === "analytics"}
      <div class="flex-1 overflow-auto p-6">
        <TokenUsageChart />
      </div>
    {:else if $route.page === "settings"}
      <div class="flex-1 overflow-auto p-6">
        <Settings />
      </div>
    {/if}
  </main>
</div>
