<script lang="ts">
  import { fade } from 'svelte/transition';
  import { toastStore } from '$lib/utils/toast';
</script>

{#if $toastStore.visible}
  <div class="fixed inset-x-4 top-4 z-[60] flex justify-end sm:left-auto" transition:fade={{ duration: 140 }}>
    <div
      class={`w-full sm:w-auto sm:min-w-[260px] max-w-[360px] rounded-xl border px-4 py-3 text-sm shadow-md ${
        $toastStore.type === 'success'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : $toastStore.type === 'error'
            ? 'border-rose-200 bg-rose-50 text-rose-700'
            : $toastStore.type === 'warning'
              ? 'border-amber-200 bg-amber-50 text-amber-700'
              : 'border-[var(--color-border-default)] bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]'
      }`}
      role="status"
      aria-live="polite"
    >
      {$toastStore.message}
    </div>
  </div>
{/if}
