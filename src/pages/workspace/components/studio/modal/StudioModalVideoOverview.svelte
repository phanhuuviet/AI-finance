<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import ModalDialog from "$lib/components/common/ModalDialog.svelte";
  import Button from "$lib/components/common/Button.svelte";
  import Autocomplete from "$lib/components/common/Autocomplete.svelte";
  import { dashboardService } from "$lib/services/dashboard.service";
  import SelectField from "$lib/components/common/SelectField.svelte";
  import TextareaField from "$lib/components/common/TextareaField.svelte";
  import RangeSliderField from "$lib/components/common/RangeSliderField.svelte";
  import { showToast } from "$lib/utils/toast";
  import { t } from "../../../../../lib/i18n";

  const dispatch = createEventDispatcher();

  export let title = "";

  export let isOpen = false;

  /** @type {string | null} */
  export let sessionId = null;

  export let isCreating = false;

  export let commonLanguage = "vi";

  export let selectedScript = "";

  export let aspectRatio = "9:16";

  export let targetPlatform = "tiktok";

  export let visualStyle = "cinematic realistic";

  type VideoModelOption = {
    id: string;
    name: string;
    description?: string;
  };

  let videoModel = "";
  let videoModelOptions: VideoModelOption[] = [];
  let isLoadingVideoModels = false;

  export let videoDurationSeconds = 40;

  async function loadVideoModels(): Promise<void> {
    if (isLoadingVideoModels) return;

    isLoadingVideoModels = true;
    try {
      const models = await dashboardService.getVideoModels();
      videoModelOptions = (models || []).map((item) => ({
        id: item.model,
        name: item.display_name || item.model,
        description: item.integration_type
      }));

      const defaultModel = (models || []).find((item) => item.is_default)?.model;
      if (!videoModel && defaultModel) {
        videoModel = defaultModel;
      }
    } catch (error) {
      showToast((error as Error)?.message || $t("studio.video.loadModelsFailed"), "error");
    } finally {
      isLoadingVideoModels = false;
    }
  }

  async function fetchVideoModelOptions(query: string): Promise<VideoModelOption[]> {
    const keyword = String(query || "").trim().toLowerCase();
    if (!keyword) return videoModelOptions;

    return videoModelOptions.filter((item) =>
      `${item.name} ${item.description ?? ""}`.toLowerCase().includes(keyword)
    );
  }

  $: languageOptions = [
    { value: "vi", label: $t("studio.languageVietnamese") },
    { value: "en", label: $t("studio.languageEnglish") }
  ];

  $: aspectRatioOptions = [
    { value: "9:16", label: "9:16" },
    { value: "16:9", label: "16:9" },
    { value: "1:1", label: "1:1" }
  ];

  $: platformOptions = [
    { value: "tiktok", label: "TikTok" },
    { value: "youtube_shorts", label: "YouTube Shorts" },
    { value: "reels", label: "Instagram Reels" },
    { value: "youtube", label: "YouTube" }
  ];

  $: estimatedChunks = Math.max(1, Math.round(Number(videoDurationSeconds || 0) / 5));

  $: formattedDuration =
    videoDurationSeconds < 60
      ? `${videoDurationSeconds}s (${$t("common.chunksCount", { count: estimatedChunks })})`
      : `${Math.floor(videoDurationSeconds / 60)}m ${videoDurationSeconds % 60}s (${$t("common.chunksCount", { count: estimatedChunks })})`;

  $: if (isOpen && videoModelOptions.length === 0) {
    loadVideoModels();
  }

  function close() {
    if (isCreating) return;
    dispatch("close");
  }

  function create() {
    if (isCreating) return;
    dispatch("create", { videoModel });
  }
</script>

<ModalDialog
  isOpen={isOpen}
  title={title}
  description={$t("studio.modalDescription")}
  accentGradient="var(--gradient-studio)"
  on:close={close}
>
  <SelectField
    id="studio_lang_video"
    label={$t("common.language")}
    bind:value={commonLanguage}
    options={languageOptions}
    disabled={isCreating}
  />

  <TextareaField
    id="selected_script"
    label={$t("studio.video.selectedScript")}
    bind:value={selectedScript}
    disabled={isCreating}
    rows={8}
    textareaClass="min-h-[180px]"
  />

  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
    <SelectField
      id="video_platform"
      label={$t("studio.video.targetPlatform")}
      bind:value={targetPlatform}
      options={platformOptions}
      disabled={isCreating}
    />

    <SelectField
      id="video_aspect_ratio"
      label={$t("studio.video.aspectRatio")}
      bind:value={aspectRatio}
      options={aspectRatioOptions}
      disabled={isCreating}
    />
  </div>

  <div>
    <div class="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
      {$t("studio.video.videoModel")}
      <span class="text-[var(--rose-500,#F43F5E)] ml-0.5">*</span>
    </div>

    <Autocomplete
      options={videoModelOptions}
      bind:value={videoModel}
      loading={isLoadingVideoModels}
      placeholder={$t("studio.video.videoModelPlaceholder")}
      loadOptions={fetchVideoModelOptions}
      disabled={isCreating}
    />
  </div>

  <TextareaField
    id="video_visual_style"
    label={$t("studio.video.visualStyle")}
    bind:value={visualStyle}
    disabled={isCreating}
    rows={3}
    textareaClass="min-h-[96px]"
  />

  <RangeSliderField
    id="video_duration_seconds"
    label={$t("studio.video.durationSeconds")}
    bind:value={videoDurationSeconds}
    disabled={isCreating}
    min={40}
    max={480}
    step={10}
    displayValue={formattedDuration}
    minLabel="40s"
    maxLabel="8m"
  />

  <svelte:fragment slot="footer">
    <Button
      variant="secondary"
      rounded="rounded-xl"
      on:click={close}
      disabled={isCreating}
      type="button"
    >
      {$t("common.cancel")}
    </Button>
    <Button
      rounded="rounded-xl"
      on:click={create}
      disabled={isCreating || !sessionId || !selectedScript.trim() || !videoModel.trim()}
      type="button"
    >
      {isCreating ? $t("common.processing") : $t("common.create")}
    </Button>
  </svelte:fragment>
</ModalDialog>
