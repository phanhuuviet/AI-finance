<script lang="ts">
  import { RENDER_JOB_STATUS } from '$lib/constants/index.js';
  import { t } from '$lib/i18n';

  export let status: string;

  const config: Record<string, { labelKey: string; cls: string }> = {
    [RENDER_JOB_STATUS.PENDING]: { labelKey: 'status.pending', cls: 'bg-gray-100 text-gray-600' },
    [RENDER_JOB_STATUS.PROCESSING]: { labelKey: 'status.processing', cls: 'bg-amber-50 text-amber-700' },
    [RENDER_JOB_STATUS.COMPLETED]: { labelKey: 'status.completed', cls: 'bg-green-50 text-green-600' },
    [RENDER_JOB_STATUS.FAILED]: { labelKey: 'status.failed', cls: 'bg-rose-50 text-rose-600' }
  };

  $: cfg = config[status] ?? { labelKey: '', cls: 'bg-gray-100 text-gray-500' };
</script>

<span class={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.cls}`}>
  {cfg.labelKey ? $t(cfg.labelKey) : status}
</span>
