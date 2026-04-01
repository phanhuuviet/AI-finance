<script>
  import { createEventDispatcher } from "svelte";
  import { cubicOut } from "svelte/easing";
  import { fade, scale } from "svelte/transition";
  import { portal } from "../../utils/portal.js";

  /** Control modal visibility */
  export let isOpen = false;
  /** Primary modal heading */
  export let title = "";
  /** Optional helper text under the title */
  export let description = "";
  /** Extra classes to append to the outer overlay */
  export let overlayClass = "fixed inset-0 z-50 flex items-center justify-center";
  /** Additional classes for the dialog panel */
  export let panelClass = "";
  /** Additional classes for the body container */
  export let bodyClass = "p-5 space-y-4 bg-[var(--color-surface-elevated)]";
  /** Additional classes for the footer container */
  export let footerClass =
    "px-5 py-4 border-t border-[var(--color-border-soft)] bg-[var(--color-surface)] flex justify-end gap-2";
  /** Allows overriding the default panel styling */
  export let contentClass =
    "w-full max-w-2xl mx-4 rounded-2xl bg-[var(--color-surface-elevated)] border border-[var(--color-border-strong)] shadow-elevated overflow-hidden";
  /** Controls whether the footer wrapper is rendered */
  export let showFooter = true;
  /** Accessible label for the close actions */
  export let closeButtonAriaLabel = "Close dialog";
  /** Selector or element the dialog should portal into */
  export let portalTarget = "body";

  const dispatch = createEventDispatcher();

  function handleClose(event) {
    event?.stopPropagation?.();
    dispatch("close");
  }
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
      class="absolute inset-0 bg-black/40"
      aria-label={closeButtonAriaLabel}
      type="button"
      on:click={handleClose}
    ></button>

    <div
      class={`relative z-10 ${contentClass} ${panelClass}`}
      transition:scale={{ start: 0.94, duration: 220, easing: cubicOut }}
    >
      <div class="px-5 py-4 border-b border-[var(--color-border-soft)] bg-[var(--color-surface)] flex items-start justify-between gap-4">
        <div>
          <div class="text-sm font-semibold text-[var(--color-text-primary)]">{title}</div>
          {#if description}
            <div class="text-xs text-[var(--color-text-muted)] mt-1">{description}</div>
          {/if}
        </div>
        <button
          class="rounded-lg px-3 py-1.5 text-sm border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-highlight)]"
          type="button"
          title="Close"
          aria-label={closeButtonAriaLabel}
          on:click={handleClose}
        >
          ✕
        </button>
      </div>

      <div class={bodyClass}>
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
