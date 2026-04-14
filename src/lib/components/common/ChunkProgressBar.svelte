<script lang="ts">
  export let summary: { pending: number; processing?: number; completed: number; failed: number };
  export let total: number;

  $: safeSummary = summary ?? { pending: 0, processing: 0, completed: 0, failed: 0 };
  $: normalizedSummary = {
    pending: safeSummary.pending ?? 0,
    processing: safeSummary.processing ?? 0,
    completed: safeSummary.completed ?? 0,
    failed: safeSummary.failed ?? 0
  };
  $: pct = (n: number) => (total > 0 ? `${Math.round((n / total) * 100)}%` : '0%');
</script>

<div class="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden flex">
  <div class="bg-slate-300 h-full transition-all" style={`width: ${pct(normalizedSummary.pending)}`}></div>
  <div class="bg-amber-400 h-full transition-all" style={`width: ${pct(normalizedSummary.processing)}`}></div>
  <div class="bg-green-400 h-full transition-all" style={`width: ${pct(normalizedSummary.completed)}`}></div>
  <div class="bg-rose-400 h-full transition-all" style={`width: ${pct(normalizedSummary.failed)}`}></div>
</div>
<div class="flex gap-3 mt-1 text-[10px] text-gray-400">
  <span>{normalizedSummary.pending} pending</span>
  <span>{normalizedSummary.processing} processing</span>
  <span>{normalizedSummary.completed} done</span>
  <span>{normalizedSummary.failed} failed</span>
</div>
