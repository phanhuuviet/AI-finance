<script lang="ts">
  import { RENDER_JOB_STATUS } from '$lib/constants/index.js';

  export let status: string;

  const config: Record<string, { label: string; cls: string }> = {
    [RENDER_JOB_STATUS.PENDING]: { label: 'Pending', cls: 'bg-gray-100 text-gray-600' },
    [RENDER_JOB_STATUS.PROCESSING]: { label: 'Processing', cls: 'bg-amber-50 text-amber-700' },
    [RENDER_JOB_STATUS.COMPLETED]: { label: 'Completed', cls: 'bg-green-50 text-green-600' },
    [RENDER_JOB_STATUS.FAILED]: { label: 'Failed', cls: 'bg-rose-50 text-rose-600' }
  };

  $: cfg = config[status] ?? { label: status, cls: 'bg-gray-100 text-gray-500' };
</script>

<span class={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
  {cfg.label}
</span>
