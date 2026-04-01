<script>
  import { createEventDispatcher } from "svelte";

  export let id = "";
  export let label = "";
  export let value = "";
  export let options = [];
  export let placeholder = "";
  export let required = false;
  export let disabled = false;
  export let helperText = "";
  export let containerClass = "";
  export let labelClass = "";
  export let selectClass = "";
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
      class={`block text-sm font-medium text-gray-700 ${labelClass}`.trim()}
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
    class={`w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm ${selectClass}`.trim()}
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
    <p class="text-xs text-gray-500">{helperText}</p>
  {/if}
</div>
