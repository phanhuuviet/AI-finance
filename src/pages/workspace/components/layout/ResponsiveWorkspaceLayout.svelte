<script>
  import { createEventDispatcher } from "svelte";
  import { t } from "../../../../lib/i18n";

  export let sessionId = null;

  const dispatch = createEventDispatcher();

  let viewportWidth = 0;
  let activeMobileView = "list";
  let tabletListOpen = true;
  let previousSessionId = null;
  let previousLayoutMode = "desktop";

  $: layoutMode =
    viewportWidth >= 1024
      ? "desktop"
      : viewportWidth >= 768
        ? "tablet"
        : "mobile";

  $: if (layoutMode !== previousLayoutMode) {
    if (layoutMode === "desktop") {
      tabletListOpen = true;
    }

    if (layoutMode === "mobile" && !sessionId) {
      activeMobileView = "list";
    }

    previousLayoutMode = layoutMode;
    dispatch("modechange", { mode: layoutMode });
  }

  $: if (sessionId !== previousSessionId) {
    if (layoutMode === "mobile") {
      if (sessionId) {
        activeMobileView = "chat";
      } else {
        activeMobileView = "list";
      }
    }
    previousSessionId = sessionId;
  }

  function openDetailView() {
    if (layoutMode === "mobile") {
      activeMobileView = "chat";
    }
  }

  function backToListView() {
    activeMobileView = "list";
  }

  function toggleTabletList() {
    tabletListOpen = !tabletListOpen;
  }
</script>

<svelte:window bind:innerWidth={viewportWidth} />

<div class="relative flex h-full min-h-0">
  {#if layoutMode === "desktop"}
    <div class="h-full w-[320px] shrink-0 xl:w-[360px]">
      <slot name="list" {openDetailView} {layoutMode} />
    </div>
    <div class="min-w-0 flex-1 flex flex-col gap-4">
      <slot name="detail-nav" {layoutMode} />
      <div class="min-h-0 flex-1">
        <slot name="detail" {layoutMode} />
      </div>
    </div>
  {:else if layoutMode === "tablet"}
    <div class="min-w-0 flex-1 flex flex-col gap-4">
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="inline-flex min-h-11 items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          on:click={toggleTabletList}
        >
          {tabletListOpen ? "Hide chats" : "Show chats"}
        </button>
      </div>

      <slot name="detail-nav" {layoutMode} />

      <div class="min-h-0 flex-1">
        <slot name="detail" {layoutMode} />
      </div>
    </div>

    {#if tabletListOpen}
      <button
        type="button"
        class="absolute inset-0 z-20 bg-black/50"
        aria-label={$t("common.close")}
        on:click={toggleTabletList}
      ></button>

      <div class="absolute inset-y-0 left-0 z-30 w-[340px] max-w-[75vw] p-2">
        <div class="h-full">
          <slot name="list" {openDetailView} {layoutMode} />
        </div>
      </div>
    {/if}
  {:else}
    {#if activeMobileView === "list"}
      <div class="h-full w-full min-h-0">
        <slot name="list" {openDetailView} {layoutMode} />
      </div>
    {:else}
      <div class="min-w-0 flex-1 flex flex-col gap-3">
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="inline-flex min-h-11 items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            on:click={backToListView}
          >
            Back
          </button>
        </div>

        <slot name="detail-nav" {layoutMode} />

        <div class="min-h-0 flex-1">
          <slot name="detail" {layoutMode} />
        </div>
      </div>
    {/if}
  {/if}
</div>
