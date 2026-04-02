<script>
  import { createEventDispatcher } from "svelte";
  import ModalDialog from "$lib/components/common/ModalDialog.svelte";
  import Button from "$lib/components/common/Button.svelte";
  import SelectField from "$lib/components/common/SelectField.svelte";
  import TextareaField from "$lib/components/common/TextareaField.svelte";
  import TextField from "$lib/components/common/TextField.svelte";
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
  export let videoFormat = "explainer";

  /** @type {string} */
  export let videoStyle = "auto";

  /** @type {string} */
  export let aspectRatio = "16:9";

  /** @type {string} */
  export let videoFocus = "";

  $: languageOptions = [
    { value: "vi", label: $t("studio.languageVietnamese") },
    { value: "en", label: $t("studio.languageEnglish") }
  ];

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
  on:close={close}
>
  <SelectField
    id="studio_lang_video"
    label={$t("common.language")}
    bind:value={commonLanguage}
    options={languageOptions}
  />

  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
    <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div class="text-sm font-medium text-gray-900">{$t("studio.video.format")}</div>
      <div class="mt-3 space-y-2">
        <label class="flex items-start gap-2">
          <TextField bare unstyled type="radio" name="format" value="explainer" bind:group={videoFormat} />
          <div>
            <div class="text-sm text-gray-900">{$t("studio.video.explainer")}</div>
            <div class="text-xs text-gray-500">{$t("studio.video.explainerHint")}</div>
          </div>
        </label>
        <label class="flex items-start gap-2">
          <TextField bare unstyled type="radio" name="format" value="summary" bind:group={videoFormat} />
          <div>
            <div class="text-sm text-gray-900">{$t("studio.video.summary")}</div>
            <div class="text-xs text-gray-500">{$t("studio.video.summaryHint")}</div>
          </div>
        </label>
      </div>
    </div>

    <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div class="text-sm font-medium text-gray-900">{$t("studio.video.moreOptions")}</div>

      <div class="block mt-3 text-xs font-medium text-gray-600">{$t("studio.video.imageStyle")}</div>
      <div class="mt-1 flex gap-2">
        <Button
          unstyled
          className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
            videoStyle === "auto"
              ? "border-blue-300 bg-blue-50 text-blue-700"
              : "border-gray-200 bg-white hover:bg-gray-50"
          }`}
          on:click={() => (videoStyle = "auto")}
          type="button"
        >
          {$t("studio.video.auto")}
        </Button>
        <Button
          unstyled
          className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
            videoStyle === "custom"
              ? "border-blue-300 bg-blue-50 text-blue-700"
              : "border-gray-200 bg-white hover:bg-gray-50"
          }`}
          on:click={() => (videoStyle = "custom")}
          type="button"
        >
          {$t("studio.video.custom")}
        </Button>
      </div>

      <div class="block mt-3 text-xs font-medium text-gray-600">{$t("studio.video.aspectRatio")}</div>
      <div class="mt-1 flex gap-2">
        <Button
          unstyled
          className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
            aspectRatio === "16:9"
              ? "border-blue-300 bg-blue-50 text-blue-700"
              : "border-gray-200 bg-white hover:bg-gray-50"
          }`}
          on:click={() => (aspectRatio = "16:9")}
          type="button"
        >
          16:9
        </Button>
        <Button
          unstyled
          className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
            aspectRatio === "3:2"
              ? "border-blue-300 bg-blue-50 text-blue-700"
              : "border-gray-200 bg-white hover:bg-gray-50"
          }`}
          on:click={() => (aspectRatio = "3:2")}
          type="button"
        >
          3:2
        </Button>
      </div>
    </div>
  </div>

  <TextareaField
    id="video_focus"
    label={$t("studio.video.focus")}
    bind:value={videoFocus}
    rows={6}
    textareaClass="min-h-[140px]"
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
      disabled={!sessionId}
      type="button"
    >
      {$t("common.create")}
    </Button>
  </svelte:fragment>
</ModalDialog>
