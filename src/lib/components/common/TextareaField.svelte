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
  export let maxHeight = 160;
  export let textareaRef = null;

  const dispatch = createEventDispatcher();

  function handleInput(event) {
    dispatch("input", event);
  }

  function handleChange(event) {
    dispatch("change", event);
  }

  function autoResize(node) {
    function resize() {
      node.style.height = "auto";
      node.style.height = `${Math.min(node.scrollHeight, maxHeight)}px`;
      node.style.overflowY = node.scrollHeight > maxHeight ? "auto" : "hidden";
    }

    node.addEventListener("input", resize);
    resize();

    return {
      update() {
        resize();
      },
      destroy() {
        node.removeEventListener("input", resize);
      }
    };
  }

  $: resolvedTextareaClass = [
    unstyled
      ? ""
      : "w-full min-h-11 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-input)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--indigo-400)] focus:[box-shadow:0_0_0_3px_rgba(99,102,241,0.15)]",
    textareaClass
  ]
    .filter(Boolean)
    .join(" ");
</script>

{#if bare}
  <textarea
    use:autoResize
    bind:this={textareaRef}
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
      use:autoResize
      bind:this={textareaRef}
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
