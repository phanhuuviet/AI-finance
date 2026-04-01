<script>
  import { forwardEventsBuilder } from "../../utils/forwardEvents.js";

  export let type = "button";
  export let variant = "primary";
  export let size = "md";
  export let loading = false;
  export let disabled = false;
  export let className = "";
  export let rounded = "rounded-lg";
  export let block = false;

  const forwardEvents = forwardEventsBuilder();

  const variantClasses = {
    primary:
      "bg-[var(--color-accent)] text-[var(--color-accent-contrast)] hover:bg-[var(--color-accent-strong)]",
    secondary:
      "border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-elevated)]",
    ghost:
      "text-[var(--color-accent)] hover:bg-[var(--color-accent-muted)]",
    danger:
      "bg-[var(--color-danger)] text-[var(--color-accent-contrast)] hover:bg-[var(--color-danger-strong)] focus-visible:ring-[var(--color-danger)]"
  };

  const sizeClasses = {
    sm: "text-sm px-3 py-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-base px-5 py-2.5"
  };

  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-app)] disabled:cursor-not-allowed disabled:opacity-60";

  $: buttonClass = [
    baseClasses,
    rounded,
    variant === "danger"
      ? "focus-visible:ring-[var(--color-danger)]"
      : "focus-visible:ring-[var(--color-accent)]",
    variantClasses[variant] ?? variantClasses.primary,
    sizeClasses[size] ?? sizeClasses.md,
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
    <slot name="loading">Loading...</slot>
  {:else}
    <slot />
  {/if}
</button>
