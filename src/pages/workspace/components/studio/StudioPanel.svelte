<script>
  import { fade } from "svelte/transition";
  import { goto } from "$app/navigation";
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
  import ErrorFallback from "$lib/components/common/ErrorFallback.svelte";
  import StatusBadge from "$lib/components/common/StatusBadge.svelte";
  import ChunkProgressBar from "$lib/components/common/ChunkProgressBar.svelte";
  import { chatStore } from "$lib/stores/chat.store";
  import {
    generations,
    generationPagination,
    generationCurrentPage,
    isLoadingList,
    generationStore
  } from "$lib/stores/generation.store";
  import { generationService } from "$lib/services/generation.service";
  import { formatDuration, formatRelativeDate } from "$lib/utils/format";
  import { showToast } from "$lib/utils/toast";
  import { CHAT_ROLE, MODAL_TOOL } from "$lib/constants/index.js";
  import { t } from "../../../../lib/i18n";

  let sessionId = null;
  $: sessionId = $workspaceStore.currentSessionId;

  const tools = /** @type {{ key: string; titleKey: string; subtitleKey: string; color: string }[]} */ ([
    {
      key: MODAL_TOOL.AUDIO_OVERVIEW,
      titleKey: "studio.tool.audio.title",
      subtitleKey: "studio.tool.audio.subtitle",
      color: "#4F8CFF"
    },
    {
      key: MODAL_TOOL.VIDEO_OVERVIEW,
      titleKey: "studio.tool.video.title",
      subtitleKey: "studio.tool.video.subtitle",
      color: "#FFB347"
    },
    {
      key: MODAL_TOOL.MINDMAP,
      titleKey: "studio.tool.mindmap.title",
      subtitleKey: "studio.tool.mindmap.subtitle",
      color: "#6DD47E"
    },
    {
      key: MODAL_TOOL.REPORT,
      titleKey: "studio.tool.report.title",
      subtitleKey: "studio.tool.report.subtitle",
      color: "#A259FF"
    },
    {
      key: MODAL_TOOL.QUIZ,
      titleKey: "studio.tool.quiz.title",
      subtitleKey: "studio.tool.quiz.subtitle",
      color: "#FF6B81"
    },
    {
      key: MODAL_TOOL.DATA,
      titleKey: "studio.tool.data.title",
      subtitleKey: "studio.tool.data.subtitle",
      color: "#00CFCF"
    }
  ]);

  let modalTool = null;
  let pendingTool = null;
  let isCreatingOutput = false;
  let creatingModalProps = {};
  $: creatingModalProps = { isCreating: isCreatingOutput };

  let isModalOpen = false;
  let isScriptPickerOpen = false;

  let commonLanguage = "vi";
  let commonRequirements = "";
  $: if (!commonRequirements) commonRequirements = $t("studio.defaultRequirements");
  let aspectRatio = "9:16";
  let targetPlatform = "tiktok";
  let visualStyle = "cinematic realistic";
  let videoDurationSeconds = 40;

  let selectableScripts = [];
  let selectedScriptId = null;
  let selectedScript = "";
  let loadedGenerationSessionId = null;

  $: currentSessionMessages =
    sessionId && $chatStore.activeSessionId === sessionId ? ($chatStore.messages || []) : [];

  $: selectableScripts = currentSessionMessages
    .filter((msg) => msg?.role === CHAT_ROLE.ASSISTANT && String(msg?.content || "").trim().length > 0)
    .slice()
    .sort((a, b) => new Date(String(b?.created_at || 0)).getTime() - new Date(String(a?.created_at || 0)).getTime())
    .map((msg, idx) => ({
      id: String(msg.id),
      content: String(msg.content || "").trim(),
      index: idx + 1
    }));

  $: if (!selectedScriptId && selectableScripts.length > 0) {
    selectedScriptId = selectableScripts[0].id;
  }

  $: selectedScript =
    selectableScripts.find((item) => item.id === selectedScriptId)?.content || "";

  $: listError = $generationStore.error;

  $: if (sessionId && sessionId !== loadedGenerationSessionId) {
    loadedGenerationSessionId = sessionId;
    generationService.loadGenerations(sessionId, 1);
  } else if (!sessionId) {
    loadedGenerationSessionId = null;
    generationStore.update((s) => ({
      ...s,
      generations: [],
      pagination: null,
      currentPage: 1,
      error: null
    }));
  }

  function durationToChunkCount(seconds) {
    return Math.max(1, Math.round(Number(seconds || 0) / 5));
  }

  function toolTitleKey(key) {
    return tools.find((item) => item.key === key)?.titleKey ?? "studio.title";
  }

  function openToolModal(toolKey) {
    if (!sessionId) {
      showToast($t("studio.selectSessionHint"), "warning");
      return;
    }
    pendingTool = toolKey;
    isScriptPickerOpen = true;
  }

  function closeScriptPicker() {
    isScriptPickerOpen = false;
  }

  function confirmScriptSelection() {
    if (!selectedScript.trim()) {
      showToast($t("studio.scriptPicker.empty"), "warning");
      return;
    }

    isScriptPickerOpen = false;
    modalTool = pendingTool;
    pendingTool = null;
    if (modalTool !== MODAL_TOOL.VIDEO_OVERVIEW) {
      commonRequirements = selectedScript;
    }
    isModalOpen = true;
  }

  function closeModal() {
    isModalOpen = false;
    modalTool = null;
  }

  async function createSelectedOutput(event) {
    if (!sessionId || !modalTool || isCreatingOutput) return;

    isCreatingOutput = true;

    try {
      if (modalTool === MODAL_TOOL.VIDEO_OVERVIEW) {
        const selectedVideoModel = String(event?.detail?.videoModel || "").trim();

        if (!selectedVideoModel) {
          showToast($t("studio.video.videoModelRequired"), "warning");
          return;
        }

        await dashboardStore.generateVideoScriptPrompts({
          chunk_count: durationToChunkCount(videoDurationSeconds),
          script: selectedScript,
          session_id: sessionId,
          video_prompt_input_values: {
            aspect_ratio: aspectRatio,
            target_platform: targetPlatform,
            video_model: selectedVideoModel,
            visual_style: visualStyle
          }
        });
        showToast($t("studio.video.generateSuccess"), "success");
        await generationService.loadGenerations(sessionId, 1);
      } else {
        await dashboardStore.createStudioOutput(sessionId, modalTool, {
          language: commonLanguage,
          requirements: commonRequirements
        });
        showToast($t("studio.createSuccess"), "success");
      }

      closeModal();
    } catch (e) {
      showToast(e?.message || $t("studio.createFailed"), "error");
    } finally {
      isCreatingOutput = false;
    }
  }

  function goToDetail(generation) {
    goto(`/workspace/${generation.session_id}/generations/${generation.id}`);
  }
</script>

<div class="h-full flex flex-col bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border-default)] overflow-hidden">
  <div class="px-4 sm:px-5 py-4 border-b border-[var(--color-border-default)] bg-[var(--color-bg-surface)]">
    <div class="flex items-center justify-between gap-3">
      <h2 class="text-base font-semibold text-[var(--color-text-primary)]">{$t("studio.title")}</h2>
      <div class="text-xs text-[var(--color-text-muted)]">{$t("studio.perSession")}</div>
    </div>
  </div>

  <div class="p-4 sm:p-5 overflow-y-auto flex-1 min-h-0">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {#each tools as tool}
        <Button
          unstyled
          className="w-full group rounded-xl border px-4 py-3 min-h-11 text-left transition bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-hover)] hover:border-[var(--color-border-accent)] hover:cursor-pointer"
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

    <div class="mt-6">
      <div class="flex items-center justify-between mb-3">
        <div class="text-sm font-semibold text-[var(--color-text-primary)]">
          {$t("studio.createdInSession")}
        </div>
      </div>

      {#if !sessionId}
        <div class="p-6 rounded-2xl border border-[var(--color-border-default)] bg-[var(--color-bg-app)] text-sm text-[var(--color-text-secondary)]">
          {$t("studio.selectSessionHint")}
        </div>
      {:else if listError}
        <ErrorFallback
          compact={true}
          message={listError}
          retryLabel={$t("studio.retryOutputs")}
          on:retry={() => generationService.loadGenerations(sessionId, 1)}
        />
      {:else}
        <div class="space-y-3">
          {#each $generations as generation (generation.id)}
            <button
              class="w-full text-left bg-white border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:bg-purple-50 transition-all duration-150 cursor-pointer group"
              on:click={() => goToDetail(generation)}
              type="button"
            >
              <div class="flex items-start justify-between gap-3 mb-3">
                <div class="flex-1 min-w-0">
                  <h3 class="text-sm font-semibold text-gray-800 truncate">
                    {generation.resolved_prompt_values?.title ?? "Untitled"}
                  </h3>
                  <p class="text-xs text-gray-500 mt-0.5">{generation.video_concept}</p>
                </div>
                <StatusBadge status={generation.status} />
              </div>

              <div class="flex items-center gap-4 text-xs text-gray-500 mb-3">
                <span class="flex items-center gap-1">🎬 {generation.total_chunks} chunks</span>
                <span class="flex items-center gap-1">⏱ {formatDuration(generation.estimated_total_duration_seconds)}</span>
                <span class="flex items-center gap-1">🤖 {generation.model}</span>
              </div>

              <ChunkProgressBar summary={generation.summary} total={generation.total_chunks} />

              <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <span class="text-xs text-gray-400">{formatRelativeDate(generation.created_at)}</span>
                <span class="text-xs text-purple-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  View details →
                </span>
              </div>
            </button>
          {:else}
            {#if $isLoadingList}
              {#each Array(3) as _}
                <div class="h-32 bg-purple-50 rounded-xl animate-pulse"></div>
              {/each}
            {:else}
              <div class="text-center py-12 text-gray-400">
                <p class="text-sm">No generations yet.</p>
                <p class="text-xs mt-1">Generate a script from the chat to see outputs here.</p>
              </div>
            {/if}
          {/each}
        </div>

        {#if $generationPagination && $generationPagination.totalPages > 1}
          <div class="flex items-center justify-between pt-3 mt-3 border-t border-gray-100 text-xs text-gray-500">
            <button
              class="px-2 py-1 rounded hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={$generationCurrentPage === 1}
              on:click={() => generationService.goToPage(sessionId, $generationCurrentPage - 1)}
              type="button"
            >← Prev</button>
            <span>{$generationCurrentPage} / {$generationPagination.totalPages}</span>
            <button
              class="px-2 py-1 rounded hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={$generationCurrentPage === $generationPagination.totalPages}
              on:click={() => generationService.goToPage(sessionId, $generationCurrentPage + 1)}
              type="button"
            >Next →</button>
          </div>
        {/if}
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
  {...creatingModalProps}
  isOpen={isModalOpen && modalTool === MODAL_TOOL.AUDIO_OVERVIEW}
  title={$t(toolTitleKey(MODAL_TOOL.AUDIO_OVERVIEW))}
  sessionId={sessionId}
  bind:commonLanguage
  bind:commonRequirements
  on:close={closeModal}
  on:create={createSelectedOutput}
/>

<StudioModalVideoOverview
  {...creatingModalProps}
  isOpen={isModalOpen && modalTool === MODAL_TOOL.VIDEO_OVERVIEW}
  title={$t(toolTitleKey(MODAL_TOOL.VIDEO_OVERVIEW))}
  sessionId={sessionId}
  bind:commonLanguage
  bind:selectedScript
  bind:aspectRatio
  bind:targetPlatform
  bind:visualStyle
  bind:videoDurationSeconds
  on:close={closeModal}
  on:create={createSelectedOutput}
/>

<StudioModalMindmap
  {...creatingModalProps}
  isOpen={isModalOpen && modalTool === MODAL_TOOL.MINDMAP}
  title={$t(toolTitleKey(MODAL_TOOL.MINDMAP))}
  sessionId={sessionId}
  bind:commonLanguage
  bind:commonRequirements
  on:close={closeModal}
  on:create={createSelectedOutput}
/>

<StudioModalReport
  {...creatingModalProps}
  isOpen={isModalOpen && modalTool === MODAL_TOOL.REPORT}
  title={$t(toolTitleKey(MODAL_TOOL.REPORT))}
  sessionId={sessionId}
  bind:commonLanguage
  bind:commonRequirements
  on:close={closeModal}
  on:create={createSelectedOutput}
/>

<StudioModalQuiz
  {...creatingModalProps}
  isOpen={isModalOpen && modalTool === MODAL_TOOL.QUIZ}
  title={$t(toolTitleKey(MODAL_TOOL.QUIZ))}
  sessionId={sessionId}
  bind:commonLanguage
  bind:commonRequirements
  on:close={closeModal}
  on:create={createSelectedOutput}
/>

<StudioModalData
  {...creatingModalProps}
  isOpen={isModalOpen && modalTool === MODAL_TOOL.DATA}
  title={$t(toolTitleKey(MODAL_TOOL.DATA))}
  sessionId={sessionId}
  bind:commonLanguage
  bind:commonRequirements
  on:close={closeModal}
  on:create={createSelectedOutput}
/>
