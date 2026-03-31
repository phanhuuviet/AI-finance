<script>
  import { onDestroy, onMount } from "svelte";
  import { cubicOut } from "svelte/easing";
  import { fade, fly, scale } from "svelte/transition";
  import { workspaceStore } from "../../../../stores/workspace.js";
  import { fetchWithAuth } from "../../../../utils/api.js";
  import StudioModalAudioOverview from "./modal/StudioModalAudioOverview.svelte";
  import StudioModalVideoOverview from "./modal/StudioModalVideoOverview.svelte";
  import StudioModalMindmap from "./modal/StudioModalMindmap.svelte";
  import StudioModalReport from "./modal/StudioModalReport.svelte";
  import StudioModalQuiz from "./modal/StudioModalQuiz.svelte";
  import StudioModalData from "./modal/StudioModalData.svelte";

  /** @typedef {import('../../../../models/studio.js').StudioOutput} StudioOutput */

  /** @type {string | null} */
  let sessionId = null;
  $: sessionId = $workspaceStore.currentSessionId;

  const tools = /** @type {{ key: string; title: string; subtitle: string }[]} */ (
    [
      {
        key: "audio_overview",
        title: "Tổng quan bằng âm thanh",
        subtitle: "Chỉnh yêu cầu trước khi tạo"
      },
      {
        key: "video_overview",
        title: "Tổng quan bằng video",
        subtitle: "Chỉnh yêu cầu trước khi tạo"
      },
      { key: "mindmap", title: "Bản đồ tư duy", subtitle: "Chỉnh yêu cầu" },
      { key: "report", title: "Báo cáo", subtitle: "Chỉnh yêu cầu" },
      { key: "quiz", title: "Bài kiểm tra", subtitle: "Chỉnh yêu cầu" },
      { key: "data", title: "Bảng dữ liệu", subtitle: "Chỉnh yêu cầu" }
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
  let commonRequirements =
    "Sử dụng ví dụ đời thường để giải thích các khái niệm phức tạp.";

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

  function toolTitle(key) {
    return tools.find((t) => t.key === key)?.title ?? key;
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
    loadingOutputs = true;
    outputsError = "";
    try {
      const res = await fetchWithAuth(
        `/studio/outputs?session_id=${encodeURIComponent(sessionId)}`
      );
      outputs = Array.isArray(res?.items) ? res.items : [];
    } catch (e) {
      outputsError = e?.message || "Không thể tải danh sách studio outputs.";
      outputs = [];
    } finally {
      loadingOutputs = false;
    }
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
      const created = await fetchWithAuth("/studio/outputs", {
        method: "POST",
        body: JSON.stringify({
          session_id: sessionId,
          type: modalTool,
          payload
        })
      });

      // Optimistically prepend.
      if (created?.id) outputs = [created, ...outputs];
      closeModal();
      void refreshOutputs();
    } catch (e) {
      alert(e?.message || "Tạo studio output thất bại.");
    }
  }

  async function renameOutput(item) {
    const nextTitle = prompt("Đổi tên", String(item?.title ?? ""));
    if (!nextTitle) return;
    try {
      await fetchWithAuth(`/studio/outputs/${encodeURIComponent(item.id)}`, {
        method: "PATCH",
        body: JSON.stringify({ title: nextTitle })
      });
      void refreshOutputs();
    } catch (e) {
      alert(e?.message || "Đổi tên thất bại.");
    }
  }

  async function deleteOutput(item) {
    if (!confirm("Xoá studio output này?")) return;
    try {
      await fetchWithAuth(`/studio/outputs/${encodeURIComponent(item.id)}`, {
        method: "DELETE"
      });
      outputs = outputs.filter((o) => o.id !== item.id);
    } catch (e) {
      alert(e?.message || "Xoá thất bại.");
    }
  }

  async function shareOutput(item) {
    try {
      const res = await fetchWithAuth(
        `/studio/outputs/${encodeURIComponent(item.id)}/share`,
        { method: "POST" }
      );
      const url = res?.share_url || res?.url;
      if (url && navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(String(url));
        alert("Đã copy link chia sẻ vào clipboard.");
      } else {
        alert(url ? `Link chia sẻ: ${url}` : "Không có link chia sẻ.");
      }
    } catch (e) {
      alert(e?.message || "Chia sẻ thất bại.");
    }
  }

  async function downloadOutput(item) {
    try {
      const res = await fetchWithAuth(
        `/studio/outputs/${encodeURIComponent(item.id)}/download`
      );
      const url = res?.download_url || item?.result_url;
      if (url) window.open(String(url), "_blank", "noopener,noreferrer");
      else alert("Output chưa có file tải xuống.");
    } catch (e) {
      alert(e?.message || "Tải xuống thất bại.");
    }
  }
</script>

<div
  class="h-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
>
  <div class="px-5 py-4 border-b border-gray-200 bg-white">
    <div class="flex items-center justify-between">
      <h2 class="text-base font-semibold text-gray-900">Studio</h2>
      <div class="text-xs text-gray-500">Theo session chat</div>
    </div>
  </div>

  <div class="p-5">
    <!-- Tools grid -->
    <div class="grid grid-cols-2 lg:grid-cols-3 gap-3">
      {#each tools as t}
        <button
          class={`rounded-xl border px-4 py-3 text-left transition border-gray-200 hover:bg-gray-50 hover:border-blue-300 hover:bg-blue-50 hover:cursor-pointer`}
          on:click={() => openToolModal(t.key)}
          type="button"
        >
          <div class="text-sm font-medium text-gray-900">{t.title}</div>
          <div class="mt-1 text-xs text-gray-500">{t.subtitle}</div>
        </button>
      {/each}
    </div>

    <!-- Outputs list -->
    <div class="mt-6">
      <div class="flex items-center justify-between">
        <div class="text-sm font-semibold text-gray-900">
          Studio đã tạo trong chat này
        </div>
        <button
          class="text-sm text-blue-600 hover:underline disabled:opacity-50"
          on:click={refreshOutputs}
          disabled={!sessionId || loadingOutputs}
          type="button"
        >
          Refresh
        </button>
      </div>

      {#if !sessionId}
        <div
          class="mt-3 p-4 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-600"
          transition:fade={{ duration: 140 }}
        >
          Chọn một cuộc trò chuyện trước để xem/tạo Studio.
        </div>
      {:else if outputsError}
        <div
          class="mt-3 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700"
          transition:fade={{ duration: 140 }}
        >
          {outputsError}
        </div>
      {:else if loadingOutputs}
        <div
          class="mt-3 p-4 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-600"
          transition:fade={{ duration: 140 }}
        >
          Đang tải...
        </div>
      {:else if outputs.length === 0}
        <div
          class="mt-3 p-6 rounded-2xl border border-gray-200 bg-gray-50 text-sm text-gray-600"
          transition:fade={{ duration: 140 }}
        >
          Chưa có studio output nào cho session này.
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
                  {item.title || toolTitle(item.type)}
                </div>
                <div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                  <span class="capitalize">{String(item.type).replaceAll("_", " ")}</span>
                  <span>•</span>
                  <span>{formatDate(item.created_at)}</span>
                  <span>•</span>
                  {#if item.status === "ready"}
                    <span class="text-green-700">Ready</span>
                  {:else if item.status === "processing"}
                    <span class="text-yellow-700">Processing</span>
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
                    Mở
                  </button>
                {/if}

                <div class="relative">
                  <button
                    class="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm hover:bg-gray-50"
                    aria-haspopup="menu"
                    aria-expanded={openMenuForId === item.id}
                    on:click={() => (openMenuForId = openMenuForId === item.id ? null : item.id)}
                    type="button"
                    title="Menu"
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
                        Đổi tên
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
                        Tải xuống
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
                        Chia sẻ
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
                        Xoá
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

{#if isModalOpen && modalTool}
  {#if modalTool === "audio_overview"}
    <StudioModalAudioOverview
      title={toolTitle(modalTool)}
      sessionId={sessionId}
      bind:commonLanguage
      bind:commonRequirements
      on:close={closeModal}
      on:create={createStudioOutput}
    />
  {:else if modalTool === "video_overview"}
    <StudioModalVideoOverview
      title={toolTitle(modalTool)}
      sessionId={sessionId}
      bind:commonLanguage
      bind:videoFormat
      bind:videoStyle
      bind:aspectRatio
      bind:videoFocus
      on:close={closeModal}
      on:create={createStudioOutput}
    />
  {:else if modalTool === "mindmap"}
    <StudioModalMindmap
      title={toolTitle(modalTool)}
      sessionId={sessionId}
      bind:commonLanguage
      bind:commonRequirements
      on:close={closeModal}
      on:create={createStudioOutput}
    />
  {:else if modalTool === "report"}
    <StudioModalReport
      title={toolTitle(modalTool)}
      sessionId={sessionId}
      bind:commonLanguage
      bind:commonRequirements
      on:close={closeModal}
      on:create={createStudioOutput}
    />
  {:else if modalTool === "quiz"}
    <StudioModalQuiz
      title={toolTitle(modalTool)}
      sessionId={sessionId}
      bind:commonLanguage
      bind:commonRequirements
      on:close={closeModal}
      on:create={createStudioOutput}
    />
  {:else if modalTool === "data"}
    <StudioModalData
      title={toolTitle(modalTool)}
      sessionId={sessionId}
      bind:commonLanguage
      bind:commonRequirements
      on:close={closeModal}
      on:create={createStudioOutput}
    />
  {/if}
{/if}
