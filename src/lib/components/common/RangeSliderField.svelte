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
</script>

<div class={`rounded-xl border border-gray-200 bg-gray-50 p-4 ${containerClass}`.trim()}>
  <div class="flex items-center justify-between gap-2">
    <div class="text-sm font-medium text-gray-900">{label}</div>
    <div class="text-sm font-semibold text-blue-700">{displayValue}</div>
  </div>

  <div class="mt-3">
    <input
      id={id || undefined}
      type="range"
      {min}
      {max}
      {step}
      bind:value
      class="range-slider"
    />

    <div class="mt-2 flex items-center justify-between text-xs text-gray-500">
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
    background: var(--color-border-soft, #d1d5db);
    outline: none;
    appearance: none;
  }

  .range-slider::-webkit-slider-thumb {
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 999px;
    background: var(--color-accent, #2563eb);
    border: 2px solid #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    cursor: pointer;
  }

  .range-slider::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 999px;
    background: var(--color-accent, #2563eb);
    border: 2px solid #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    cursor: pointer;
  }

  .range-slider::-moz-range-track {
    height: 6px;
    border-radius: 999px;
    background: var(--color-border-soft, #d1d5db);
  }
</style>
