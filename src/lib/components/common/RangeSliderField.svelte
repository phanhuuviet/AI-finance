<script>
  export let id = "";
  export let label = "";
  export let value = 0;
  export let min = 0;
  export let max = 100;
  export let step = 1;
  export let displayValue = "";
  export let minLabel = "";
  export let maxLabel = "";
  export let containerClass = "";
  export let disabled = false;
</script>

<div class={`rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-app)] p-4 ${containerClass}`.trim()}>
  <div class="flex items-center justify-between gap-2">
    <div class="text-sm font-medium text-[var(--color-text-primary)]">{label}</div>
    <div class="text-sm font-semibold text-[var(--color-accent-text)]">{displayValue}</div>
  </div>

  <div class="mt-3">
    <input
      id={id || undefined}
      type="range"
      {min}
      {max}
      {step}
      bind:value
      {disabled}
      class="range-slider"
    />

    <div class="mt-2 flex items-center justify-between text-xs text-[var(--color-text-muted)]">
      <span>{minLabel}</span>
      <span>{maxLabel}</span>
    </div>
  </div>
</div>

<style>
  .range-slider {
    width: 100%;
    height: 6px;
    border-radius: 999px;
    background: var(--color-border-default);
    outline: none;
    appearance: none;
  }

  .range-slider::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 999px;
    background: var(--color-accent);
    border: 2px solid var(--color-bg-elevated);
    cursor: pointer;
  }

  .range-slider::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 999px;
    background: var(--color-accent);
    border: 2px solid var(--color-bg-elevated);
    cursor: pointer;
  }

  .range-slider::-moz-range-track {
    height: 6px;
    border-radius: 999px;
    background: var(--color-border-default);
  }
</style>
