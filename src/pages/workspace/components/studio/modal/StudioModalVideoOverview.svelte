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
  export let videoFormat = "explainer";

  /** @type {string} */
  export let videoStyle = "auto";

  /** @type {string} */
  export let aspectRatio = "16:9";

  /** @type {string} */
  export let videoFocus = "";

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
    id="studio_lang_video"
    label="Ngôn ngữ"
    bind:value={commonLanguage}
    options={languageOptions}
  />

  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
    <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div class="text-sm font-medium text-gray-900">Định dạng</div>
      <div class="mt-3 space-y-2">
        <label class="flex items-start gap-2">
          <input type="radio" name="format" value="explainer" bind:group={videoFormat} />
          <div>
            <div class="text-sm text-gray-900">Video giải thích</div>
            <div class="text-xs text-gray-500">Bản tổng quan có cấu trúc.</div>
          </div>
        </label>
        <label class="flex items-start gap-2">
          <input type="radio" name="format" value="summary" bind:group={videoFormat} />
          <div>
            <div class="text-sm text-gray-900">Tóm tắt</div>
            <div class="text-xs text-gray-500">Ngắn gọn.</div>
          </div>
        </label>
      </div>
    </div>

    <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div class="text-sm font-medium text-gray-900">Tuỳ chọn thêm</div>

      <div class="block mt-3 text-xs font-medium text-gray-600">Phong cách hình ảnh</div>
      <div class="mt-1 flex gap-2">
        <button
          class={`flex-1 rounded-lg border px-3 py-2 text-sm ${
            videoStyle === "auto"
              ? "border-blue-300 bg-blue-50 text-blue-700"
              : "border-gray-200 bg-white hover:bg-gray-50"
          }`}
          on:click={() => (videoStyle = "auto")}
          type="button"
        >
          Tự động
        </button>
        <button
          class={`flex-1 rounded-lg border px-3 py-2 text-sm ${
            videoStyle === "custom"
              ? "border-blue-300 bg-blue-50 text-blue-700"
              : "border-gray-200 bg-white hover:bg-gray-50"
          }`}
          on:click={() => (videoStyle = "custom")}
          type="button"
        >
          Tuỳ chỉnh
        </button>
      </div>

      <div class="block mt-3 text-xs font-medium text-gray-600">Tỷ lệ video</div>
      <div class="mt-1 flex gap-2">
        <button
          class={`flex-1 rounded-lg border px-3 py-2 text-sm ${
            aspectRatio === "16:9"
              ? "border-blue-300 bg-blue-50 text-blue-700"
              : "border-gray-200 bg-white hover:bg-gray-50"
          }`}
          on:click={() => (aspectRatio = "16:9")}
          type="button"
        >
          16:9
        </button>
        <button
          class={`flex-1 rounded-lg border px-3 py-2 text-sm ${
            aspectRatio === "3:2"
              ? "border-blue-300 bg-blue-50 text-blue-700"
              : "border-gray-200 bg-white hover:bg-gray-50"
          }`}
          on:click={() => (aspectRatio = "3:2")}
          type="button"
        >
          3:2
        </button>
      </div>
    </div>
  </div>

  <TextareaField
    id="video_focus"
    label="AI nên tập trung vào điều gì?"
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
