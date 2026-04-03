<script>
  import { createEventDispatcher } from "svelte";

  export let id = "";
  export let label = "";
  export let type = "text";
  export let value = "";
  export let checked = false;
  export let group = undefined;
  export let files = undefined;
  export let placeholder = "";
  export let required = false;
  export let disabled = false;
  export let helperText = "";
  export let containerClass = "";
  export let labelClass = "";
  export let inputClass = "";
  export let hideLabel = false;
  // Added to allow replacing inline native inputs without introducing wrapper layout changes.
  export let bare = false;
  // Added to preserve original classes when replacing already-styled native inputs.
  export let unstyled = false;

  const dispatch = createEventDispatcher();

  function handleInput(event) {
    const target = /** @type {HTMLInputElement} */ (event.currentTarget);
    if (type === "file") {
      files = target.files;
    } else if (type === "checkbox" && group === undefined) {
      checked = target.checked;
    } else {
      value = target.value;
    }
    dispatch("input", event);
  }

  function handleChange(event) {
    dispatch("change", event);
  }

  $: resolvedInputClass = [
    unstyled
      ? ""
      : "w-full px-3 py-2.5 min-h-11 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-input)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--indigo-400)] focus:[box-shadow:0_0_0_3px_rgba(99,102,241,0.15)]",
    inputClass
  ]
    .filter(Boolean)
    .join(" ");
</script>

{#if bare}
  {#if type === "radio"}
    <input
      {...$$restProps}
      id={id || undefined}
      type="radio"
      bind:group
      value={value}
      required={required}
      disabled={disabled}
      class={resolvedInputClass}
      on:input={handleInput}
      on:change={handleChange}
    />
  {:else if type === "checkbox"}
    {#if group !== undefined}
      <input
        {...$$restProps}
        id={id || undefined}
        type="checkbox"
        bind:group
        value={value}
        required={required}
        disabled={disabled}
        class={resolvedInputClass}
        on:input={handleInput}
        on:change={handleChange}
      />
    {:else}
      <input
        {...$$restProps}
        id={id || undefined}
        type="checkbox"
        bind:checked
        required={required}
        disabled={disabled}
        class={resolvedInputClass}
        on:input={handleInput}
        on:change={handleChange}
      />
    {/if}
  {:else if type === "file"}
    <input
      {...$$restProps}
      id={id || undefined}
      type="file"
      bind:files
      required={required}
      disabled={disabled}
      class={resolvedInputClass}
      on:input={handleInput}
      on:change={handleChange}
    />
  {:else}
    <input
      {...$$restProps}
      id={id || undefined}
      type={type}
      value={value}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      class={resolvedInputClass}
      on:input={handleInput}
      on:change={handleChange}
    />
  {/if}
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

    {#if type === "radio"}
      <input
        {...$$restProps}
        id={id || undefined}
        type="radio"
        bind:group
        value={value}
        required={required}
        disabled={disabled}
        class={resolvedInputClass}
        on:input={handleInput}
        on:change={handleChange}
      />
    {:else if type === "checkbox"}
      {#if group !== undefined}
        <input
          {...$$restProps}
          id={id || undefined}
          type="checkbox"
          bind:group
          value={value}
          required={required}
          disabled={disabled}
          class={resolvedInputClass}
          on:input={handleInput}
          on:change={handleChange}
        />
      {:else}
        <input
          {...$$restProps}
          id={id || undefined}
          type="checkbox"
          bind:checked
          required={required}
          disabled={disabled}
          class={resolvedInputClass}
          on:input={handleInput}
          on:change={handleChange}
        />
      {/if}
    {:else if type === "file"}
      <input
        {...$$restProps}
        id={id || undefined}
        type="file"
        bind:files
        required={required}
        disabled={disabled}
        class={resolvedInputClass}
        on:input={handleInput}
        on:change={handleChange}
      />
    {:else}
      <input
        {...$$restProps}
        id={id || undefined}
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        class={resolvedInputClass}
        on:input={handleInput}
        on:change={handleChange}
      />
    {/if}

    {#if helperText}
      <p class="text-xs text-[var(--color-text-muted)]">{helperText}</p>
    {/if}
  </div>
{/if}
