<script lang="ts">
  export let summary: { pending: number; completed: number; failed: number };
  export let total: number;

  $: safeSummary = summary ?? { pending: 0, completed: 0, failed: 0 };
  $: pct = (n: number) => (total > 0 ? `${Math.round((n / total) * 100)}%` : '0%');
</script>

<div class="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden flex">
  <div class="bg-slate-300 h-full transition-all" style={`width: ${pct(safeSummary.pending)}`}></div>
  <div class="bg-green-400 h-full transition-all" style={`width: ${pct(safeSummary.completed)}`}></div>
  <div class="bg-rose-400 h-full transition-all" style={`width: ${pct(safeSummary.failed)}`}></div>
</div>
<div class="flex gap-3 mt-1 text-[10px] text-gray-400">
  <span>{safeSummary.pending} pending</span>
  <span>{safeSummary.completed} done</span>
  <span>{safeSummary.failed} failed</span>
</div>
