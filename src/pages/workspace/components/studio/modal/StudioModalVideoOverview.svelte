<script>
  import { createEventDispatcher } from "svelte";
  import ModalDialog from "$lib/components/common/ModalDialog.svelte";
  import Button from "$lib/components/common/Button.svelte";
  import SelectField from "$lib/components/common/SelectField.svelte";
  import TextareaField from "$lib/components/common/TextareaField.svelte";
  import RangeSliderField from "$lib/components/common/RangeSliderField.svelte";
  import { t } from "../../../../../lib/i18n";

  const dispatch = createEventDispatcher();

  /** @type {string} */
  export let title = "";

  /** @type {boolean} */
  export let isOpen = false;

  /** @type {string | null} */
  export let sessionId = null;

  /** @type {string} */
  export let commonLanguage = "vi";

  /** @type {string} */
  export let selectedScript = "";

  /** @type {string} */
  export let aspectRatio = "9:16";

  /** @type {string} */
  export let targetPlatform = "tiktok";

  /** @type {string} */
  export let visualStyle = "cinematic realistic";

  export let videoDurationSeconds = 40;

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
      ? `${videoDurationSeconds}s (${estimatedChunks} chunks)`
      : `${Math.floor(videoDurationSeconds / 60)}m ${videoDurationSeconds % 60}s (${estimatedChunks} chunks)`;

  function close() {
    dispatch("close");
  }

  function create() {
    dispatch("create");
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
  />

  <TextareaField
    id="selected_script"
    label={$t("studio.video.selectedScript")}
    bind:value={selectedScript}
    rows={8}
    textareaClass="min-h-[180px]"
  />

  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
    <SelectField
      id="video_platform"
      label={$t("studio.video.targetPlatform")}
      bind:value={targetPlatform}
      options={platformOptions}
    />

    <SelectField
      id="video_aspect_ratio"
      label={$t("studio.video.aspectRatio")}
      bind:value={aspectRatio}
      options={aspectRatioOptions}
    />
  </div>

  <TextareaField
    id="video_visual_style"
    label={$t("studio.video.visualStyle")}
    bind:value={visualStyle}
    rows={3}
    textareaClass="min-h-[96px]"
  />

  <RangeSliderField
    id="video_duration_seconds"
    label={$t("studio.video.durationSeconds")}
    bind:value={videoDurationSeconds}
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
      type="button"
    >
      {$t("common.cancel")}
    </Button>
    <Button
      rounded="rounded-xl"
      on:click={create}
      disabled={!sessionId || !selectedScript.trim()}
      type="button"
    >
      {$t("common.create")}
    </Button>
  </svelte:fragment>
</ModalDialog>
