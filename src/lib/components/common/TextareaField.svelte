<script>
  import { createEventDispatcher } from "svelte";

  export let id = "";
  export let label = "";
  export let value = "";
  export let placeholder = "";
  export let rows = 4;
  export let required = false;
  export let disabled = false;
  export let helperText = "";
  export let containerClass = "";
  export let labelClass = "";
  export let textareaClass = "";
  export let hideLabel = false;
  // Added to allow replacing inline native textareas without wrapper layout changes.
  export let bare = false;
  // Added to preserve original classes when replacing already-styled native textareas.
  export let unstyled = false;

  const dispatch = createEventDispatcher();

  function handleInput(event) {
    dispatch("input", event);
  }

  function handleChange(event) {
    dispatch("change", event);
  }

  $: resolvedTextareaClass = [
    unstyled
      ? ""
      : "w-full min-h-11 rounded-xl border border-[var(--color-border-soft)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]",
    textareaClass
  ]
    .filter(Boolean)
    .join(" ");
</script>

{#if bare}
  <textarea
    {...$$restProps}
    id={id || undefined}
    bind:value
    placeholder={placeholder}
    rows={rows}
    required={required}
    disabled={disabled}
    class={resolvedTextareaClass}
    on:input={handleInput}
    on:change={handleChange}
  ></textarea>
{:else}
  <div class={`space-y-1 ${containerClass}`.trim()}>
    {#if label && !hideLabel}
      <label
        class={`block text-sm font-medium text-[var(--color-text-secondary)] ${labelClass}`.trim()}
        for={id || undefined}
      >
        {label}
      </label>
    {/if}

    <textarea
      {...$$restProps}
      id={id || undefined}
      bind:value
      placeholder={placeholder}
      rows={rows}
      required={required}
      disabled={disabled}
      class={resolvedTextareaClass}
      on:input={handleInput}
      on:change={handleChange}
    ></textarea>

    {#if helperText}
      <p class="text-xs text-[var(--color-text-muted)]">{helperText}</p>
    {/if}
  </div>
{/if}
