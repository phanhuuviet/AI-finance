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

  <textarea
    {...$$restProps}
    id={id || undefined}
    bind:value
    placeholder={placeholder}
    rows={rows}
    required={required}
    disabled={disabled}
    class={`w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${textareaClass}`.trim()}
    on:input={handleInput}
    on:change={handleChange}
  ></textarea>

  {#if helperText}
    <p class="text-xs text-gray-500">{helperText}</p>
  {/if}
</div>
