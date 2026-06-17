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
      "[background:var(--gradient-accent)] text-[var(--text-on-dark)] border-0 shadow-[0_2px_8px_rgba(99,102,241,0.3)] hover:opacity-90",
    secondary:
      "border border-[var(--border-default)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]",
    ghost:
      "text-[var(--indigo-500)] hover:bg-[var(--indigo-50)]",
    danger:
      "border border-[var(--border-rose)] bg-[var(--rose-50)] text-[var(--rose-600)] hover:bg-[var(--rose-100)] hover:border-[var(--rose-400)] hover:text-[var(--rose-800)] focus-visible:ring-[var(--rose-500)]"
  };

  const sizeClasses = {
    sm: "text-sm px-3 py-2 min-h-11",
    md: "text-sm px-4 py-2 min-h-11",
    lg: "text-base px-5 py-2.5 min-h-12"
  };

  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-[opacity,box-shadow,background-color,color,border-color] duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-app)] disabled:cursor-not-allowed disabled:opacity-60";

  $: buttonClass = [
    unstyled ? "" : baseClasses,
    unstyled ? "" : rounded,
    unstyled
      ? ""
      : variant === "danger"
        ? "focus-visible:ring-[var(--color-danger)]"
        : "focus-visible:ring-[var(--color-accent)]",
    unstyled ? "" : variantClasses[/** @type {keyof typeof variantClasses} */ (variant)] ?? variantClasses.primary,
    unstyled ? "" : sizeClasses[/** @type {keyof typeof sizeClasses} */ (size)] ?? sizeClasses.md,
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
