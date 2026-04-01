<script>
  import { createEventDispatcher } from 'svelte';

  export let message = 'Unable to load data.';
  export let retryLabel = 'Retry';
  export let compact = false;

  const dispatch = createEventDispatcher();

  function retry() {
    dispatch('retry');
  }
</script>

<div class={`rounded-md border border-red-200 bg-red-50 text-red-700 ${compact ? 'p-3 text-sm' : 'p-4 text-sm'}`}>
  <div>{message}</div>
  <button
    type="button"
    class="mt-2 inline-flex items-center rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
    on:click={retry}
  >
    {retryLabel}
  </button>
</div>
