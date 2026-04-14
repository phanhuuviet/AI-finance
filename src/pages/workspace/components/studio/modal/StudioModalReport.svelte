<script>
  import { createEventDispatcher } from "svelte";
  import ModalDialog from "$lib/components/common/ModalDialog.svelte";
  import Button from "$lib/components/common/Button.svelte";
  import SelectField from "$lib/components/common/SelectField.svelte";
  import TextareaField from "$lib/components/common/TextareaField.svelte";
  import { t } from "../../../../../lib/i18n";

  const dispatch = createEventDispatcher();

  /** @type {string} */
  export let title = "";

  /** @type {boolean} */
  export let isOpen = false;

  /** @type {string | null} */
  export let sessionId = null;

  /** @type {boolean} */
  export let isCreating = false;

  /** @type {string} */
  export let commonLanguage = "vi";

  /** @type {string} */
  export let commonRequirements = "";

  $: languageOptions = [
    { value: "vi", label: $t("studio.languageVietnamese") },
    { value: "en", label: $t("studio.languageEnglish") }
  ];

  function close() {
    if (isCreating) return;
    dispatch("close");
  }

  function create() {
    if (isCreating) return;
    dispatch("create");
  }
</script>

<ModalDialog
  isOpen={isOpen}
  title={title}
  description={$t("studio.modalDescription")}
  accentGradient="var(--gradient-success)"
  on:close={close}
>
  <SelectField
    id="studio_lang_report"
    label={$t("common.language")}
    bind:value={commonLanguage}
    options={languageOptions}
    disabled={isCreating}
  />

  <TextareaField
    id="studio_requirements_report"
    label={$t("studio.requirementLabel")}
    bind:value={commonRequirements}
    disabled={isCreating}
    rows={6}
    textareaClass="min-h-[160px]"
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
      disabled={isCreating || !sessionId}
      type="button"
    >
      {isCreating ? $t("common.processing") : $t("common.create")}
    </Button>
  </svelte:fragment>
</ModalDialog>
