<script lang="ts">
  import type { GenerationChunk } from '$lib/models/generation.model';
  import StatusBadge from '$lib/components/common/StatusBadge.svelte';

  export let chunk: GenerationChunk;

  const sectionLabel: Record<string, string> = {
    hook: 'Hook',
    body: 'Body',
    proof: 'Proof',
    cta: 'Call to Action'
  };
</script>

<div class="flex gap-4 bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-purple-200 transition-colors duration-150">
  <div class="w-[40%] flex-shrink-0 bg-gray-900 flex items-center justify-center min-h-[160px]">
    {#if chunk.s3_url}
      <!-- svelte-ignore a11y-media-has-caption -->
      <video
        src={chunk.s3_url}
        controls
        playsinline
        class="w-full h-full object-contain max-h-64"
      ></video>
    {:else}
      <div class="flex flex-col items-center justify-center gap-2 text-gray-500 py-8">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
        </svg>
        <span class="text-xs text-gray-400">
          {#if chunk.status === 'pending'}Pending render{/if}
          {#if chunk.status === 'processing'}Rendering...{/if}
          {#if chunk.status === 'failed'}Render failed{/if}
        </span>
      </div>
    {/if}
  </div>

  <div class="flex-1 min-w-0 p-4 flex flex-col gap-3">
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <span class="text-xs font-mono font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
          {chunk.chunk_id}
        </span>
        <span class="text-xs text-gray-400 capitalize">
          {sectionLabel[chunk.section] ?? chunk.section}
        </span>
      </div>
      <StatusBadge status={chunk.status} />
    </div>

    <div class="flex items-center gap-1 text-xs text-gray-500">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <circle cx="12" cy="12" r="10" stroke-width="1.5"/>
        <path stroke-linecap="round" stroke-width="1.5" d="M12 6v6l4 2"/>
      </svg>
      <span>Target: <strong class="text-gray-700">{chunk.target_seconds}s</strong></span>
      <span class="ml-2 text-gray-400">~{chunk.estimated_syllables} syllables</span>
    </div>

    <div>
      <p class="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Narration</p>
      <p class="text-sm text-gray-700 leading-relaxed line-clamp-3">{chunk.narration}</p>
    </div>

    {#if chunk.status === 'failed' && chunk.error_message}
      <p class="text-xs text-rose-500 bg-rose-50 px-3 py-2 rounded-lg">⚠ {chunk.error_message}</p>
    {/if}

    <div class="flex items-center gap-3 text-[10px] text-gray-400 mt-auto pt-2 border-t border-gray-50">
      <span>v{chunk.current_version}</span>
      <span>{chunk.attempt_count} attempt(s)</span>
      {#if chunk.regenerate_count > 0}
        <span>{chunk.regenerate_count} regen(s)</span>
      {/if}
    </div>
  </div>
</div>
