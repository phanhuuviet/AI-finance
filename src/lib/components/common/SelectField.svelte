<script>
  import { createEventDispatcher } from "svelte";

  export let id = "";
  export let label = "";
  export let value = undefined;
  export let options = [];
  export let placeholder = "";
  export let required = false;
  export let disabled = false;
  export let helperText = "";
  export let containerClass = "";
  export let labelClass = "";
  export let selectClass = "";
  export let hideLabel = false;
  // Added to allow replacing inline native selects without wrapper layout changes.
  export let bare = false;
  // Added to preserve original classes when replacing already-styled native selects.
  export let unstyled = false;

  const dispatch = createEventDispatcher();

  function handleInput(event) {
    dispatch("input", event);
  }

  function handleChange(event) {
    dispatch("change", event);
  }

  $: resolvedSelectClass = [
    unstyled
      ? ""
      : "w-full px-3 py-2.5 min-h-11 border border-[var(--color-border-soft)] rounded-md bg-[var(--color-surface-muted)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] focus:border-[var(--color-accent)]",
    selectClass
  ]
    .filter(Boolean)
    .join(" ");
</script>

{#if bare}
  <select
    {...$$restProps}
    id={id || undefined}
    bind:value
    required={required}
    disabled={disabled}
    class={resolvedSelectClass}
    on:input={handleInput}
    on:change={handleChange}
  >
    {#if placeholder}
      <option value="" disabled>{placeholder}</option>
    {/if}

    {#if options?.length}
      {#each options as option (option.value)}
        <option value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      {/each}
    {:else}
      <slot />
    {/if}
  </select>
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

    <select
      {...$$restProps}
      id={id || undefined}
      bind:value
      required={required}
      disabled={disabled}
      class={resolvedSelectClass}
      on:input={handleInput}
      on:change={handleChange}
    >
      {#if placeholder}
        <option value="" disabled>{placeholder}</option>
      {/if}

      {#if options?.length}
        {#each options as option (option.value)}
          <option value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        {/each}
      {:else}
        <slot />
      {/if}
    </select>

    {#if helperText}
      <p class="text-xs text-[var(--color-text-muted)]">{helperText}</p>
    {/if}
  </div>
{/if}
