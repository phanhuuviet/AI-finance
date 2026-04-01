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
    primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50",
    secondary: "border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 disabled:opacity-60",
    ghost: "text-blue-600 hover:underline disabled:opacity-50",
    danger: "text-red-600 hover:text-red-700 disabled:opacity-50"
  };

  const sizeClasses = {
    sm: "text-sm px-3 py-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-base px-5 py-2.5"
  };

  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed";

  $: buttonClass = [
    baseClasses,
    rounded,
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
