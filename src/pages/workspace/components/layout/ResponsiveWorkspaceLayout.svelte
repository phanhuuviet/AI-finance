<script>
  import { createEventDispatcher } from "svelte";
  import Button from "$lib/components/common/Button.svelte";
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

<div class="relative flex h-full min-h-0 overflow-hidden gap-4">
  {#if layoutMode === "desktop"}
    <div class="h-full min-h-0 w-[320px] shrink-0 overflow-hidden xl:w-[360px]">
      <slot name="list" {openDetailView} {layoutMode} />
    </div>
    <div class="h-full min-h-0 min-w-0 flex-1 flex flex-col gap-4 overflow-hidden">
      <slot name="detail-nav" {layoutMode} />
      <div class="min-h-0 flex-1 overflow-y-auto">
        <slot name="detail" {layoutMode} />
      </div>
    </div>
  {:else if layoutMode === "tablet"}
    <div class="min-w-0 flex-1 flex flex-col gap-4">
      <div class="flex items-center gap-2">
        <Button
          unstyled
          type="button"
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"
          on:click={toggleTabletList}
        >
          {tabletListOpen ? "Hide chats" : "Show chats"}
        </Button>
      </div>

      <slot name="detail-nav" {layoutMode} />

      <div class="min-h-0 flex-1">
        <slot name="detail" {layoutMode} />
      </div>
    </div>

    {#if tabletListOpen}
      <Button
        unstyled
        type="button"
        className="absolute inset-0 z-20 bg-black/50"
        aria-label={$t("common.close")}
        on:click={toggleTabletList}
      ></Button>

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
          <Button
            unstyled
            type="button"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"
            on:click={backToListView}
          >
            Back
          </Button>
        </div>

        <slot name="detail-nav" {layoutMode} />

        <div class="min-h-0 flex-1">
          <slot name="detail" {layoutMode} />
        </div>
      </div>
    {/if}
  {/if}
</div>
