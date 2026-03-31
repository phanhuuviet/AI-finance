<script>
  import { createEventDispatcher } from "svelte";
  import { cubicOut } from "svelte/easing";
  import { fade, scale } from "svelte/transition";

  const dispatch = createEventDispatcher();

  /** @type {string} */
  export let title = "";

  /** @type {string | null} */
  export let sessionId = null;

  /** @type {string} */
  export let commonLanguage = "vi";

  /** @type {string} */
  export let commonRequirements = "";

  function close() {
    dispatch("close");
  }

  function create() {
    dispatch("create");
  }
</script>

<div
  class="fixed inset-0 z-50 flex items-center justify-center"
  role="dialog"
  aria-modal="true"
  transition:fade={{ duration: 180 }}
>
  <button
    class="absolute inset-0 bg-black/40"
    on:click={close}
    type="button"
    aria-label="Close"
  ></button>

  <div
    class="relative w-full max-w-2xl mx-4 rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden"
    transition:scale={{ start: 0.94, duration: 220, easing: cubicOut }}
  >
    <div
      class="px-5 py-4 border-b border-gray-200 bg-white flex items-start justify-between gap-4"
    >
      <div>
        <div class="text-sm font-semibold text-gray-900">{title}</div>
        <div class="text-xs text-gray-500 mt-1">
          Chỉnh sửa yêu cầu, sau đó bấm Tạo.
        </div>
      </div>
      <button
        class="rounded-lg px-3 py-1.5 text-sm border border-gray-200 bg-white hover:bg-gray-50"
        on:click={close}
        type="button"
        title="Close"
      >
        ✕
      </button>
    </div>

    <div class="p-5 space-y-4">
      <div>
        <label for="studio_lang_data" class="block text-xs font-medium text-gray-600"
          >Ngôn ngữ</label
        >
        <select
          id="studio_lang_data"
          bind:value={commonLanguage}
          class="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
        >
          <option value="vi">Tiếng Việt</option>
          <option value="en">English</option>
        </select>
      </div>

      <div>
        <label
          for="studio_requirements_data"
          class="block text-sm font-medium text-gray-900">Yêu cầu</label
        >
        <textarea
          id="studio_requirements_data"
          bind:value={commonRequirements}
          class="mt-2 w-full min-h-[160px] rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
      </div>
    </div>

    <div class="px-5 py-4 border-t border-gray-200 bg-white flex justify-end gap-2">
      <button
        class="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm hover:bg-gray-50"
        on:click={close}
        type="button"
      >
        Huỷ
      </button>
      <button
        class="rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        on:click={create}
        disabled={!sessionId}
        type="button"
      >
        Tạo
      </button>
    </div>
  </div>
</div>
