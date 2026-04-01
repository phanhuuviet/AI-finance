<script>
  import { onDestroy, onMount } from "svelte";
  import { cubicOut } from "svelte/easing";
  import { fade, fly, scale } from "svelte/transition";
  import { workspaceStore } from "../../../../stores/workspace.js";
  import { dashboardStore } from "../../../../stores/dashboard.js";
  import StudioModalAudioOverview from "./modal/StudioModalAudioOverview.svelte";
  import StudioModalVideoOverview from "./modal/StudioModalVideoOverview.svelte";
  import StudioModalMindmap from "./modal/StudioModalMindmap.svelte";
  import StudioModalReport from "./modal/StudioModalReport.svelte";
  import StudioModalQuiz from "./modal/StudioModalQuiz.svelte";
  import StudioModalData from "./modal/StudioModalData.svelte";
  import StudioToolIcon from "../../../../components/icons/StudioToolIcon.svelte";
  import LoadingBlock from "../../../../lib/components/common/LoadingBlock.svelte";
  import ErrorFallback from "../../../../lib/components/common/ErrorFallback.svelte";
  import { t } from "../../../../lib/i18n";

  /** @typedef {import('../../../../lib/models').StudioOutput} StudioOutput */

  /** @type {string | null} */
  let sessionId = null;
  $: sessionId = $workspaceStore.currentSessionId;

  const tools = /** @type {{ key: string; titleKey: string; subtitleKey: string }[]} */ (
    [
      {
        key: "audio_overview",
        titleKey: "studio.tool.audio.title",
        subtitleKey: "studio.tool.audio.subtitle"
      },
      {
        key: "video_overview",
        titleKey: "studio.tool.video.title",
        subtitleKey: "studio.tool.video.subtitle"
      },
      { key: "mindmap", titleKey: "studio.tool.mindmap.title", subtitleKey: "studio.tool.mindmap.subtitle" },
      { key: "report", titleKey: "studio.tool.report.title", subtitleKey: "studio.tool.report.subtitle" },
      { key: "quiz", titleKey: "studio.tool.quiz.title", subtitleKey: "studio.tool.quiz.subtitle" },
      { key: "data", titleKey: "studio.tool.data.title", subtitleKey: "studio.tool.data.subtitle" }
    ]
  );

  /** @type {string} */
  let activeTool = "audio_overview";

  // Modal state
  let isModalOpen = false;
  /** @type {string | null} */
  let modalTool = null;

  // Tool requirements (minimal)
  let commonLanguage = "vi";
  let commonRequirements = "";
  $: if (!commonRequirements) {
    commonRequirements = $t("studio.defaultRequirements");
  }


  // Video-specific requirements
  let videoFormat = "explainer"; // explainer | summary
  let videoStyle = "auto"; // auto | custom
  let aspectRatio = "16:9"; // 16:9 | 3:2
  let videoFocus = commonRequirements;

  // List outputs
  /** @type {StudioOutput[]} */
  let outputs = [];
  let loadingOutputs = false;
  let outputsError = "";

  // Row menu
  /** @type {string | null} */
  let openMenuForId = null;

  /** @type {() => void} */
  let cleanupGlobalClick = () => {};

  onMount(() => {
    const onGlobalClick = (e) => {
      const el = /** @type {HTMLElement} */ (e.target);
      if (el?.closest?.("[data-studio-menu-root='true']")) return;
      openMenuForId = null;
    };
    document.addEventListener("click", onGlobalClick);
    cleanupGlobalClick = () => document.removeEventListener("click", onGlobalClick);

    void refreshOutputs();
  });

  onDestroy(() => cleanupGlobalClick());

  $: if (sessionId) {
    // When switching sessions, reload outputs.
    void refreshOutputs();
  } else {
    outputs = [];
  }

  $: rawStudioState = sessionId ? $dashboardStore.studioBySession?.[sessionId] : null;
  /** @type {{ data: StudioOutput[] | null; loading: boolean; showLoading: boolean; error: string | null }} */
  $: studioState = {
    data: Array.isArray(rawStudioState?.data)
      ? /** @type {StudioOutput[]} */ (rawStudioState.data)
      : null,
    loading: Boolean(rawStudioState?.loading),
    showLoading: Boolean(rawStudioState?.showLoading),
    error: rawStudioState?.error ? String(rawStudioState.error) : null
  };
  $: outputs = /** @type {StudioOutput[]} */ (studioState.data || []);
  $: loadingOutputs = studioState.showLoading;
  $: outputsError = studioState.error || "";

  function openToolModal(toolKey) {
    activeTool = toolKey;
    modalTool = toolKey;
    isModalOpen = true;
    openMenuForId = null;

    // Seed tool-specific requirements from common fields.
    if (toolKey === "video_overview") {
      videoFocus = commonRequirements;
    }
  }

  function closeModal() {
    isModalOpen = false;
    modalTool = null;
  }

  function toolTitleKey(key) {
    return tools.find((t) => t.key === key)?.titleKey ?? "studio.title";
  }

  function formatDate(iso) {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return String(iso ?? "");
    }
  }

  async function refreshOutputs() {
    if (!sessionId) return;
    await dashboardStore.fetchStudioOutputs(sessionId);
  }

  async function createStudioOutput() {
    if (!sessionId || !modalTool) return;

    /** @type {any} */
    let payload = {
      language: commonLanguage,
      requirements: commonRequirements
    };

    if (modalTool === "video_overview") {
      payload = {
        format: videoFormat,
        language: commonLanguage,
        style: videoStyle,
        aspect_ratio: aspectRatio,
        focus: videoFocus
      };
    }

    try {
      await dashboardStore.createStudioOutput(sessionId, modalTool, payload);

      closeModal();
    } catch (e) {
      alert(e?.message || $t("studio.createFailed"));
    }
  }

  async function renameOutput(item) {
    const nextTitle = prompt($t("studio.renamePrompt"), String(item?.title ?? ""));
    if (!nextTitle) return;
    try {
      await dashboardStore.renameStudioOutput(sessionId, item.id, nextTitle);
    } catch (e) {
      alert(e?.message || $t("studio.renameFailed"));
    }
  }

  async function deleteOutput(item) {
    if (!confirm($t("studio.confirmDelete"))) return;
    try {
      await dashboardStore.deleteStudioOutput(sessionId, item.id);
    } catch (e) {
      alert(e?.message || $t("studio.deleteFailed"));
    }
  }

  async function shareOutput(item) {
    try {
      const res = await dashboardStore.shareStudioOutput(item.id);
      const url = res?.share_url || res?.url;
      if (url && navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(String(url));
        alert($t("studio.copiedShareLink"));
      } else {
        alert(url ? $t("studio.shareLink", { url }) : $t("studio.shareUnavailable"));
      }
    } catch (e) {
      alert(e?.message || $t("studio.shareFailed"));
    }
  }

  async function downloadOutput(item) {
    try {
      const res = await dashboardStore.downloadStudioOutput(item.id);
      const url = res?.download_url || item?.result_url;
      if (url) window.open(String(url), "_blank", "noopener,noreferrer");
      else alert($t("studio.downloadUnavailable"));
    } catch (e) {
      alert(e?.message || $t("studio.downloadFailed"));
    }
  }
</script>

<div
  class="h-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
>
  <div class="px-5 py-4 border-b border-gray-200 bg-white">
    <div class="flex items-center justify-between">
      <h2 class="text-base font-semibold text-gray-900">{$t("studio.title")}</h2>
      <div class="text-xs text-gray-500">{$t("studio.perSession")}</div>
    </div>
  </div>

  <div class="p-5">
    <!-- Tools grid -->
    <div class="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {#each tools as tool}
        <button
          class={`group rounded-xl border px-4 py-3 text-left transition border-gray-200 hover:bg-gray-50 hover:border-blue-300 hover:bg-blue-50 hover:cursor-pointer`}
          on:click={() => openToolModal(tool.key)}
          type="button"
        >
          <div class="flex items-start gap-3">
            <div class="mt-0.5 shrink-0 text-gray-500">
              <StudioToolIcon name={tool.key} className="h-5 w-5" />
            </div>

            <div class="min-w-0">
              <div class="text-sm font-medium text-gray-900">{$t(tool.titleKey)}</div>
              <div class="mt-1 text-xs text-gray-500">{$t(tool.subtitleKey)}</div>
            </div>
          </div>
        </button>
      {/each}
    </div>

    <!-- Outputs list -->
    <div class="mt-6">
      <div class="flex items-center justify-between">
        <div class="text-sm font-semibold text-gray-900">
          {$t("studio.createdInSession")}
        </div>
        <button
          class="text-sm text-blue-600 hover:underline disabled:opacity-50"
          on:click={refreshOutputs}
          disabled={!sessionId || loadingOutputs}
          type="button"
        >
          {$t("common.refresh")}
        </button>
      </div>

      {#if !sessionId}
        <div
          class="mt-3 p-4 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-600"
          transition:fade={{ duration: 140 }}
        >
          {$t("studio.selectSessionHint")}
        </div>
      {:else if outputsError}
        <div class="mt-3" transition:fade={{ duration: 140 }}>
          <ErrorFallback
            compact={true}
            message={outputsError}
            retryLabel={$t("studio.retryOutputs")}
            on:retry={refreshOutputs}
          />
        </div>
      {:else if studioState.loading}
        <div
          class="mt-3 p-4 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-600"
          transition:fade={{ duration: 140 }}
        >
          <LoadingBlock rows={4} rowHeight="h-10" active={studioState.showLoading} />
        </div>
      {:else if outputs.length === 0}
        <div
          class="mt-3 p-6 rounded-2xl border border-gray-200 bg-gray-50 text-sm text-gray-600"
          transition:fade={{ duration: 140 }}
        >
          {$t("studio.empty")}
        </div>
      {:else}
        <div class="mt-3 space-y-2">
          {#each outputs as item (item.id)}
            <div
              class="rounded-xl border border-gray-200 bg-white px-4 py-3 flex items-start justify-between gap-3"
              transition:fly={{ y: 8, duration: 180, easing: cubicOut }}
            >
              <div class="min-w-0">
                <div class="text-sm font-medium text-gray-900 truncate">
                  {item.title || $t(toolTitleKey(item.type))}
                </div>
                <div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                  <span class="capitalize">{String(item.type).replaceAll("_", " ")}</span>
                  <span>•</span>
                  <span>{formatDate(item.created_at)}</span>
                  <span>•</span>
                  {#if item.status === "ready"}
                    <span class="text-green-700">{$t("studio.statusReady")}</span>
                  {:else if item.status === "processing"}
                    <span class="text-yellow-700">{$t("studio.statusProcessing")}</span>
                  {:else}
                    <span class="text-red-700">{String(item.status)}</span>
                  {/if}
                </div>
              </div>

              <div class="shrink-0 flex items-center gap-2" data-studio-menu-root="true">
                {#if item.result_url}
                  <button
                    class="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
                    on:click={() => window.open(String(item.result_url), "_blank", "noopener,noreferrer")}
                    type="button"
                  >
                    {$t("common.open")}
                  </button>
                {/if}

                <div class="relative">
                  <button
                    class="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm hover:bg-gray-50"
                    aria-haspopup="menu"
                    aria-expanded={openMenuForId === item.id}
                    on:click={() => (openMenuForId = openMenuForId === item.id ? null : item.id)}
                    type="button"
                    title={$t("studio.menu")}
                  >
                    ⋮
                  </button>

                  {#if openMenuForId === item.id}
                    <div
                      class="absolute right-0 mt-2 w-44 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden z-10 origin-top-right"
                      role="menu"
                      transition:scale={{ start: 0.96, duration: 140, easing: cubicOut }}
                    >
                      <button
                        class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                        on:click={() => {
                          openMenuForId = null;
                          renameOutput(item);
                        }}
                        type="button"
                        role="menuitem"
                      >
                        {$t("common.rename")}
                      </button>
                      <button
                        class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                        on:click={() => {
                          openMenuForId = null;
                          downloadOutput(item);
                        }}
                        type="button"
                        role="menuitem"
                      >
                        {$t("common.download")}
                      </button>
                      <button
                        class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                        on:click={() => {
                          openMenuForId = null;
                          shareOutput(item);
                        }}
                        type="button"
                        role="menuitem"
                      >
                        {$t("common.share")}
                      </button>
                      <button
                        class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        on:click={() => {
                          openMenuForId = null;
                          deleteOutput(item);
                        }}
                        type="button"
                        role="menuitem"
                      >
                        {$t("common.delete")}
                      </button>
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>

<StudioModalAudioOverview
  isOpen={isModalOpen && modalTool === "audio_overview"}
  title={$t(toolTitleKey("audio_overview"))}
  sessionId={sessionId}
  bind:commonLanguage
  bind:commonRequirements
  on:close={closeModal}
  on:create={createStudioOutput}
/>

<StudioModalVideoOverview
  isOpen={isModalOpen && modalTool === "video_overview"}
  title={$t(toolTitleKey("video_overview"))}
  sessionId={sessionId}
  bind:commonLanguage
  bind:videoFormat
  bind:videoStyle
  bind:aspectRatio
  bind:videoFocus
  on:close={closeModal}
  on:create={createStudioOutput}
/>

<StudioModalMindmap
  isOpen={isModalOpen && modalTool === "mindmap"}
  title={$t(toolTitleKey("mindmap"))}
  sessionId={sessionId}
  bind:commonLanguage
  bind:commonRequirements
  on:close={closeModal}
  on:create={createStudioOutput}
/>

<StudioModalReport
  isOpen={isModalOpen && modalTool === "report"}
  title={$t(toolTitleKey("report"))}
  sessionId={sessionId}
  bind:commonLanguage
  bind:commonRequirements
  on:close={closeModal}
  on:create={createStudioOutput}
/>

<StudioModalQuiz
  isOpen={isModalOpen && modalTool === "quiz"}
  title={$t(toolTitleKey("quiz"))}
  sessionId={sessionId}
  bind:commonLanguage
  bind:commonRequirements
  on:close={closeModal}
  on:create={createStudioOutput}
/>

<StudioModalData
  isOpen={isModalOpen && modalTool === "data"}
  title={$t(toolTitleKey("data"))}
  sessionId={sessionId}
  bind:commonLanguage
  bind:commonRequirements
  on:close={closeModal}
  on:create={createStudioOutput}
/>
