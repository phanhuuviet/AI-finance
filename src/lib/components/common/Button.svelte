<script>
  import { forwardEventsBuilder } from "../../../utils/forwardEvents.js";
  import { t } from "../../i18n";

  export let type = "button";
  export let variant = "primary";
  export let size = "md";
  export let loading = false;
  export let disabled = false;
  export let className = "";
  export let rounded = "rounded-lg";
  export let block = false;
  // Added to preserve legacy button visuals when replacing raw buttons.
  export let unstyled = false;

  const forwardEvents = forwardEventsBuilder();

  const variantClasses = {
    primary:
      "bg-[var(--color-accent)] text-[var(--color-bg-elevated)] hover:bg-[var(--color-accent-hover)] border-0",
    secondary:
      "border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]",
    ghost:
      "text-[var(--color-accent-text)] hover:bg-[var(--color-accent-light)]",
    danger:
      "border border-[var(--color-danger-light)] bg-transparent text-[var(--color-danger)] hover:bg-[var(--color-danger-light)] hover:border-[var(--color-danger)] focus-visible:ring-[var(--color-danger)]"
  };

  const sizeClasses = {
    sm: "text-sm px-3 py-2 min-h-11",
    md: "text-sm px-4 py-2 min-h-11",
    lg: "text-base px-5 py-2.5 min-h-12"
  };

  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-app)] disabled:cursor-not-allowed disabled:opacity-60";

  $: buttonClass = [
    unstyled ? "" : baseClasses,
    unstyled ? "" : rounded,
    unstyled
      ? ""
      : variant === "danger"
        ? "focus-visible:ring-[var(--color-danger)]"
        : "focus-visible:ring-[var(--color-accent)]",
    unstyled ? "" : variantClasses[variant] ?? variantClasses.primary,
    unstyled ? "" : sizeClasses[size] ?? sizeClasses.md,
    block ? "w-full" : "",
    className
  ]
    .filter(Boolean)
    .join(" ");
</script>

<button
  use:forwardEvents
  {...$$restProps}
  type={type}
  class={buttonClass}
  disabled={disabled || loading}
>
  {#if loading}
    <slot name="loading">{$t("common.loading")}</slot>
  {:else}
    <slot />
  {/if}
</button>
