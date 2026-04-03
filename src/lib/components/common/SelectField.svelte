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
      : "w-full px-3 py-2.5 min-h-11 border border-[var(--color-border-default)] rounded-lg bg-[var(--color-bg-elevated)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-border-accent)] focus:[box-shadow:0_0_0_3px_rgba(91,79,207,0.12)]",
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
