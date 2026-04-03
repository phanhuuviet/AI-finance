<script>
  import { createEventDispatcher } from "svelte";
  import { cubicOut } from "svelte/easing";
  import { fade, scale } from "svelte/transition";
  import { portal } from "../../../utils/portal.js";
  import { t } from "../../i18n";

  /** Control modal visibility */
  export let isOpen = false;
  /** Primary modal heading */
  export let title = "";
  /** Optional helper text under the title */
  export let description = "";
  /** Extra classes to append to the outer overlay */
  export let overlayClass = "fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4";
  /** Additional classes for the dialog panel */
  export let panelClass = "";
  /** Additional classes for the body container */
  export let bodyClass = "p-5 space-y-4 bg-[var(--color-bg-surface)]";
  /** Additional classes for the footer container */
  export let footerClass =
    "px-4 sm:px-5 py-4 border-t border-[var(--color-border-default)] bg-[var(--color-bg-app)] flex flex-col-reverse sm:flex-row sm:justify-end gap-2";
  /** Allows overriding the default panel styling */
  export let contentClass =
    "w-full max-w-2xl rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] overflow-hidden max-h-[90dvh]";
  /** Controls whether the footer wrapper is rendered */
  export let showFooter = true;
  /** Accessible label for the close actions */
  export let closeButtonAriaLabel = "";
  /** Selector or element the dialog should portal into */
  export let portalTarget = "body";
  /** Optional gradient accent strip shown at top of modal content */
  export let accentGradient = "";

  const dispatch = createEventDispatcher();

  function handleClose(event) {
    event?.stopPropagation?.();
    dispatch("close");
  }

  $: resolvedCloseButtonAriaLabel = closeButtonAriaLabel || $t("modal.closeDialog");
</script>

{#if isOpen}
  <div
    use:portal={portalTarget}
    class={overlayClass}
    role="dialog"
    aria-modal="true"
    transition:fade={{ duration: 180, easing: cubicOut }}
  >
    <button
      class="absolute inset-0 bg-[var(--color-overlay)]"
      aria-label={resolvedCloseButtonAriaLabel}
      type="button"
      on:click={handleClose}
    ></button>

    <div
      class={`relative z-10 ${contentClass} ${panelClass}`}
      transition:scale={{ start: 0.94, duration: 220, easing: cubicOut }}
    >
      {#if accentGradient}
        <div class="h-1" style={`background: ${accentGradient};`}></div>
      {/if}

      <div class="px-5 py-4 border-b border-[var(--color-border-default)] bg-[var(--color-bg-surface)] flex items-start justify-between gap-4">
        <div>
          <div class="text-sm font-semibold text-[var(--color-text-primary)]">{title}</div>
          {#if description}
            <div class="text-xs text-[var(--color-text-secondary)] mt-1">{description}</div>
          {/if}
        </div>
        <button
          class="rounded-lg px-3 py-1.5 text-sm border border-[var(--color-border-default)] bg-[var(--color-bg-app)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"
          type="button"
          title={$t("common.close")}
          aria-label={resolvedCloseButtonAriaLabel}
          on:click={handleClose}
        >
          ✕
        </button>
      </div>

      <div class={`${bodyClass} overflow-y-auto max-h-[calc(90dvh-140px)]`}>
        <slot />
      </div>

      {#if showFooter}
        <div class={footerClass}>
          <slot name="footer" />
        </div>
      {/if}
    </div>
  </div>
{/if}
