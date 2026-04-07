<script lang="ts">
  export let status: string;

  const config: Record<string, { label: string; cls: string }> = {
    pending: { label: 'Pending', cls: 'bg-gray-100 text-gray-600' },
    processing: { label: 'Processing', cls: 'bg-amber-50 text-amber-600' },
    completed: { label: 'Completed', cls: 'bg-green-50 text-green-600' },
    failed: { label: 'Failed', cls: 'bg-rose-50 text-rose-600' }
  };

  $: cfg = config[status] ?? { label: status, cls: 'bg-gray-100 text-gray-500' };
</script>

<span class={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
  {cfg.label}
</span>
