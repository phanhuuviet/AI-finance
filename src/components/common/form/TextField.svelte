<script>
  import { createEventDispatcher } from "svelte";

  export let id = "";
  export let label = "";
  export let type = "text";
  export let value = "";
  export let placeholder = "";
  export let required = false;
  export let disabled = false;
  export let helperText = "";
  export let containerClass = "";
  export let labelClass = "";
  export let inputClass = "";
  export let hideLabel = false;

  const dispatch = createEventDispatcher();

  function handleInput(event) {
    dispatch("input", event);
  }

  function handleChange(event) {
    dispatch("change", event);
  }
</script>

<div class={`space-y-1 ${containerClass}`.trim()}>
  {#if label && !hideLabel}
    <label
      class={`block text-sm font-medium text-[var(--color-text-secondary)] ${labelClass}`.trim()}
      for={id || undefined}
    >
      {label}
    </label>
  {/if}

  <input
    {...$$restProps}
    id={id || undefined}
    type={type}
    bind:value
    placeholder={placeholder}
    required={required}
    disabled={disabled}
    class={`w-full px-3 py-2 rounded-md border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)] ${inputClass}`.trim()}
    on:input={handleInput}
    on:change={handleChange}
  />

  {#if helperText}
    <p class="text-xs text-[var(--color-text-muted)]">{helperText}</p>
  {/if}
</div>
