<script>
  import { createEventDispatcher } from "svelte";
  import ModalDialog from "$lib/components/common/ModalDialog.svelte";
  import Button from "$lib/components/common/Button.svelte";
  import { t } from "../../../../../lib/i18n";

  const dispatch = createEventDispatcher();

  export let isOpen = false;
  export let title = "";
  export let toolLabel = "";
  export let scripts = [];
  export let selectedScriptId = null;

  $: hasSelection = scripts.some((item) => item.id === selectedScriptId);

  function close() {
    dispatch("close");
  }

  function confirm() {
    dispatch("confirm");
  }

  function pickScript(id) {
    selectedScriptId = id;
  }

  function truncateText(text) {
    const plain = String(text || "").replace(/\s+/g, " ").trim();
    if (!plain) return "";
    if (plain.length <= 200) return plain;
    return `${plain.slice(0, 200)}...`;
  }
</script>

<ModalDialog
  isOpen={isOpen}
  title={title}
  description={$t("studio.scriptPicker.description", { tool: toolLabel })}
  accentGradient="var(--gradient-studio)"
  on:close={close}
>
  {#if scripts.length === 0}
    <div class="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-app)] p-4 text-sm text-[var(--color-text-secondary)]">
      {$t("studio.scriptPicker.empty")}
    </div>
  {:else}
    <div class="space-y-2">
      {#each scripts as script}
        <button
          class={`w-full rounded-xl border px-4 py-3 text-left transition min-h-11 ${
            selectedScriptId === script.id
              ? "border-[var(--color-border-accent)] bg-[var(--color-bg-hover)]"
              : "border-[var(--color-border-default)] bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-hover)]"
          }`}
          type="button"
          on:click={() => pickScript(script.id)}
        >
          <div class="text-xs text-[var(--color-text-muted)]">{$t("studio.scriptPicker.scriptLabel", { index: script.index })}</div>
          <div class="mt-1 text-sm text-[var(--color-text-primary)] leading-relaxed">{truncateText(script.content)}</div>
        </button>
      {/each}
    </div>
  {/if}

  <svelte:fragment slot="footer">
    <Button variant="secondary" rounded="rounded-xl" on:click={close} type="button">
      {$t("common.cancel")}
    </Button>
    <Button rounded="rounded-xl" on:click={confirm} disabled={!hasSelection} type="button">
      {$t("common.continue")}
    </Button>
  </svelte:fragment>
</ModalDialog>