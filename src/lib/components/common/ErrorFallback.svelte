<script>
  import { createEventDispatcher } from 'svelte';
  import { t } from '../../i18n';

  export let message = '';
  export let retryLabel = '';
  export let compact = false;

  const dispatch = createEventDispatcher();

  function retry() {
    dispatch('retry');
  }

  $: resolvedMessage = message || $t('errors.unableLoadData');
  $: resolvedRetryLabel = retryLabel || $t('common.retry');
</script>

<div class={`rounded-md border border-red-200 bg-red-50 text-red-700 ${compact ? 'p-3 text-sm' : 'p-4 text-sm'}`}>
  <div>{resolvedMessage}</div>
  <button
    type="button"
    class="mt-2 inline-flex items-center rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
    on:click={retry}
  >
    {resolvedRetryLabel}
  </button>
</div>
