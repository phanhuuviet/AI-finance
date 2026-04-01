<script>
  import { createEventDispatcher } from "svelte";
  import ModalDialog from "../../../../../components/common/ModalDialog.svelte";
  import Button from "../../../../../components/common/Button.svelte";
  import SelectField from "../../../../../components/common/form/SelectField.svelte";
  import TextareaField from "../../../../../components/common/form/TextareaField.svelte";

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
  export let commonRequirements = "";

  const languageOptions = [
    { value: "vi", label: "Tiếng Việt" },
    { value: "en", label: "English" }
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
  description="Chỉnh sửa yêu cầu, sau đó bấm Tạo."
  on:close={close}
>
  <SelectField
    id="studio_lang_data"
    label="Ngôn ngữ"
    bind:value={commonLanguage}
    options={languageOptions}
  />

  <TextareaField
    id="studio_requirements_data"
    label="Yêu cầu"
    bind:value={commonRequirements}
    rows={6}
    textareaClass="min-h-[160px]"
  />

  <svelte:fragment slot="footer">
    <Button
      variant="secondary"
      rounded="rounded-xl"
      on:click={close}
      type="button"
    >
      Huỷ
    </Button>
    <Button
      rounded="rounded-xl"
      on:click={create}
      disabled={!sessionId}
      type="button"
    >
      Tạo
    </Button>
  </svelte:fragment>
</ModalDialog>
