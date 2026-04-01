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
      class={`block text-sm font-medium text-gray-700 ${labelClass}`.trim()}
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
    class={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${inputClass}`.trim()}
    on:input={handleInput}
    on:change={handleChange}
  />

  {#if helperText}
    <p class="text-xs text-gray-500">{helperText}</p>
  {/if}
</div>
