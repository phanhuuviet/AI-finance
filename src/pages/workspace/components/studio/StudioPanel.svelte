<script>
  import { onDestroy, onMount } from "svelte";
  import { cubicOut } from "svelte/easing";
  import { fade, fly, scale } from "svelte/transition";
  import { workspaceStore } from "../../../../stores/workspace.js";
  import { dashboardStore } from "../../../../stores/dashboard.js";
  import StudioModalAudioOverview from "./modal/StudioModalAudioOverview.svelte";
  import StudioModalVideoOverview from "./modal/StudioModalVideoOverview.svelte";
  import StudioModalScriptPicker from "./modal/StudioModalScriptPicker.svelte";
  import StudioModalMindmap from "./modal/StudioModalMindmap.svelte";
  import StudioModalReport from "./modal/StudioModalReport.svelte";
  import StudioModalQuiz from "./modal/StudioModalQuiz.svelte";
  import StudioModalData from "./modal/StudioModalData.svelte";
  import StudioToolIcon from "../../../../components/icons/StudioToolIcon.svelte";
  import Button from "$lib/components/common/Button.svelte";
  import LoadingBlock from "$lib/components/common/LoadingBlock.svelte";
  import ErrorFallback from "$lib/components/common/ErrorFallback.svelte";
  import { chatStore } from "$lib/stores/chat.store";
  import { t } from "../../../../lib/i18n";

  /** @typedef {import('../../../../lib/models').StudioOutput} StudioOutput */

  /** @type {string | null} */
  let sessionId = null;
  $: sessionId = $workspaceStore.currentSessionId;

  const tools = /** @type {{ key: string; titleKey: string; subtitleKey: string; color: string }[]} */ ([
    {
      key: "audio_overview",
      titleKey: "studio.tool.audio.title",
      subtitleKey: "studio.tool.audio.subtitle",
      color: "#4F8CFF" // blue
    },
    {
      key: "video_overview",
      titleKey: "studio.tool.video.title",
      subtitleKey: "studio.tool.video.subtitle",
      color: "#FFB347" // orange
    },
    {
      key: "mindmap",
      titleKey: "studio.tool.mindmap.title",
      subtitleKey: "studio.tool.mindmap.subtitle",
      color: "#6DD47E" // green
    },
    {
      key: "report",
      titleKey: "studio.tool.report.title",
      subtitleKey: "studio.tool.report.subtitle",
      color: "#A259FF" // purple
    },
    {
      key: "quiz",
      titleKey: "studio.tool.quiz.title",
      subtitleKey: "studio.tool.quiz.subtitle",
      color: "#FF6B81" // red
    },
    {
      key: "data",
      titleKey: "studio.tool.data.title",
      subtitleKey: "studio.tool.data.subtitle",
      color: "#00CFCF" // teal
    }
  ]);

  /** @type {string} */
  let activeTool = "audio_overview";

  // Modal state
  let isModalOpen = false;
  let isScriptPickerOpen = false;
  /** @type {string | null} */
  let modalTool = null;
  /** @type {string | null} */
  let pendingTool = null;

  // Tool requirements (minimal)
  let commonLanguage = "vi";
  let commonRequirements = "";
  $: if (!commonRequirements) {
    commonRequirements = $t("studio.defaultRequirements");
  }


  // Video-specific requirements
  let aspectRatio = "9:16";
  let targetPlatform = "tiktok";
  let visualStyle = "cinematic realistic";
  let chunkCount = 8;

  /** @type {{ id: string; content: string; index: number }[]} */
  let selectableScripts = [];
  /** @type {string | null} */
  let selectedScriptId = null;
  let selectedScript = "";

  $: currentSessionMessages =
    sessionId && $chatStore.activeSessionId === sessionId ? ($chatStore.messages || []) : [];

  $: selectableScripts = currentSessionMessages
    .filter((msg) => msg?.role === "assistant" && String(msg?.content || "").trim().length > 0)
    .map((msg, idx) => ({
      id: String(msg.id),
      content: String(msg.content || "").trim(),
      index: idx + 1
    }));

  $: {
    if (!selectedScriptId && selectableScripts.length > 0) {
      selectedScriptId = selectableScripts[selectableScripts.length - 1].id;
    }
  }

  $: selectedScript =
    selectableScripts.find((item) => item.id === selectedScriptId)?.content || "";

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
    if (!sessionId) {
      alert($t("studio.selectSessionHint"));
      return;
    }

    activeTool = toolKey;
    pendingTool = toolKey;
    isScriptPickerOpen = true;
    openMenuForId = null;
  }

  function closeScriptPicker() {
    isScriptPickerOpen = false;
    pendingTool = null;
  }

  function confirmScriptSelection() {
    if (!selectedScript.trim()) {
      alert($t("studio.scriptPicker.empty"));
      return;
    }

    isScriptPickerOpen = false;
    modalTool = pendingTool;
    isModalOpen = true;
    pendingTool = null;

    if (modalTool !== "video_overview") {
      commonRequirements = selectedScript;
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

    try {
      if (modalTool === "video_overview") {
        await dashboardStore.generateVideoScriptPrompts({
          chunk_count: Number(chunkCount) || 8,
          script: selectedScript,
          session_id: sessionId,
          video_prompt_input_values: {
            aspect_ratio: aspectRatio,
            target_platform: targetPlatform,
            visual_style: visualStyle
          }
        });
        alert($t("studio.video.generateSuccess"));
      } else {
        payload = {
          language: commonLanguage,
          requirements: commonRequirements
        };
        await dashboardStore.createStudioOutput(sessionId, modalTool, payload);
      }

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
  class="h-full flex flex-col bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border-default)] overflow-hidden"
>
  <div class="px-4 sm:px-5 py-4 border-b border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
    <div class="flex items-center justify-between">
      <h2 class="text-base font-semibold text-[var(--color-text-primary)]">{$t("studio.title")}</h2>
      <div class="text-xs text-[var(--color-text-muted)]">{$t("studio.perSession")}</div>
    </div>
  </div>

  <div class="p-4 sm:p-5 overflow-y-auto flex-1 min-h-0">
    <!-- Tools grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {#each tools as tool}
        <Button
          unstyled
          className={`group rounded-xl border px-4 py-3 min-h-11 text-left transition bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-hover)] hover:border-[var(--color-border-accent)] hover:cursor-pointer`}
          style={`border-left: 6px solid ${tool.color}; border-color: var(--color-border-default);`}
          on:click={() => openToolModal(tool.key)}
          type="button"
        >
          <div class="flex items-start gap-3">
            <div class="mt-0.5 shrink-0" style={`color: ${tool.color}`}> 
              <StudioToolIcon name={tool.key} className="h-5 w-5" />
            </div>

            <div class="min-w-0">
              <div class="text-sm font-medium text-[var(--color-text-primary)]">{$t(tool.titleKey)}</div>
              <div class="mt-1 text-xs text-[var(--color-text-secondary)]">{$t(tool.subtitleKey)}</div>
            </div>
          </div>
        </Button>
      {/each}
    </div>

    <!-- Outputs list -->
    <div class="mt-6">
      <div class="flex items-center justify-between">
        <div class="text-sm font-semibold text-[var(--color-text-primary)]">
          {$t("studio.createdInSession")}
        </div>
        <Button
          unstyled
          className="text-sm text-[var(--color-accent-text)] min-h-11 px-2 rounded-md hover:text-[var(--color-accent)] disabled:opacity-50"
          on:click={refreshOutputs}
          disabled={!sessionId || loadingOutputs}
          type="button"
        >
          {$t("common.refresh")}
        </Button>
      </div>

      {#if !sessionId}
        <div
          class="mt-3 p-4 rounded-xl bg-[var(--color-bg-app)] border border-[var(--color-border-default)] text-sm text-[var(--color-text-secondary)]"
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
          class="mt-3 p-4 rounded-xl bg-[var(--color-bg-app)] border border-[var(--color-border-default)] text-sm text-[var(--color-text-secondary)]"
          transition:fade={{ duration: 140 }}
        >
          <LoadingBlock rows={4} rowHeight="h-10" active={studioState.showLoading} />
        </div>
      {:else if outputs.length === 0}
        <div
          class="mt-3 p-6 rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-app)] text-sm text-[var(--color-text-secondary)]"
          transition:fade={{ duration: 140 }}
        >
          {$t("studio.empty")}
        </div>
      {:else}
        <div class="mt-3 space-y-2">
          {#each outputs as item (item.id)}
            <div
              class="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-3 sm:px-4 py-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"
              transition:fly={{ y: 8, duration: 180, easing: cubicOut }}
            >
              <div class="min-w-0">
                <div class="text-sm font-medium text-[var(--color-text-primary)] truncate">
                  {item.title || $t(toolTitleKey(item.type))}
                </div>
                <div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--color-text-muted)]">
                  <span class="capitalize">{String(item.type).replaceAll("_", " ")}</span>
                  <span>•</span>
                  <span>{formatDate(item.created_at)}</span>
                  <span>•</span>
                  {#if item.status === "ready"}
                    <span class="text-[var(--color-status-ready)]">{$t("studio.statusReady")}</span>
                  {:else if item.status === "processing"}
                    <span class="text-[var(--color-status-processing)]">{$t("studio.statusProcessing")}</span>
                  {:else}
                    <span class="text-[var(--color-status-error)]">{String(item.status)}</span>
                  {/if}
                </div>
              </div>

              <div class="shrink-0 flex items-center gap-2 self-end sm:self-auto" data-studio-menu-root="true">
                {#if item.result_url}
                  <Button
                    unstyled
                    className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-3 py-2 min-h-11 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"
                    on:click={() => window.open(String(item.result_url), "_blank", "noopener,noreferrer")}
                    type="button"
                  >
                    {$t("common.open")}
                  </Button>
                {/if}

                <div class="relative">
                  <Button
                    unstyled
                    className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-2.5 py-2 min-h-11 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"
                    aria-haspopup="menu"
                    aria-expanded={openMenuForId === item.id}
                    on:click={() => (openMenuForId = openMenuForId === item.id ? null : item.id)}
                    type="button"
                    title={$t("studio.menu")}
                  >
                    ⋮
                  </Button>

                  {#if openMenuForId === item.id}
                    <div
                      class="absolute right-0 mt-2 w-44 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] overflow-hidden z-10 origin-top-right"
                      role="menu"
                      transition:scale={{ start: 0.96, duration: 140, easing: cubicOut }}
                    >
                      <Button
                        unstyled
                        className="w-full text-left px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"
                        on:click={() => {
                          openMenuForId = null;
                          renameOutput(item);
                        }}
                        type="button"
                        role="menuitem"
                      >
                        {$t("common.rename")}
                      </Button>
                      <Button
                        unstyled
                        className="w-full text-left px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"
                        on:click={() => {
                          openMenuForId = null;
                          downloadOutput(item);
                        }}
                        type="button"
                        role="menuitem"
                      >
                        {$t("common.download")}
                      </Button>
                      <Button
                        unstyled
                        className="w-full text-left px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"
                        on:click={() => {
                          openMenuForId = null;
                          shareOutput(item);
                        }}
                        type="button"
                        role="menuitem"
                      >
                        {$t("common.share")}
                      </Button>
                      <Button
                        unstyled
                        className="w-full text-left px-3 py-2 text-sm text-[var(--color-danger)] hover:bg-[var(--color-danger-light)]"
                        on:click={() => {
                          openMenuForId = null;
                          deleteOutput(item);
                        }}
                        type="button"
                        role="menuitem"
                      >
                        {$t("common.delete")}
                      </Button>
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

<StudioModalScriptPicker
  isOpen={isScriptPickerOpen}
  title={$t("studio.scriptPicker.title")}
  toolLabel={pendingTool ? $t(toolTitleKey(pendingTool)) : ""}
  scripts={selectableScripts}
  bind:selectedScriptId
  on:close={closeScriptPicker}
  on:confirm={confirmScriptSelection}
/>

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
  bind:selectedScript
  bind:aspectRatio
  bind:targetPlatform
  bind:visualStyle
  bind:chunkCount
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
