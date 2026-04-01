<script>
  import Skeleton from './Skeleton.svelte';

  export let rows = 4;
  export let rowHeight = 'h-4';
  export let gap = 'gap-3';
  export let className = '';
  export let rounded = 'rounded-md';
  export let active = true;

  $: normalizedRows = Math.max(1, Number(rows) || 1);
</script>

<div class={`flex flex-col ${gap} ${className}`} aria-hidden="true">
  {#each Array(normalizedRows) as _, index}
    <Skeleton
      className={`${rowHeight} ${index === normalizedRows - 1 ? 'w-2/3' : 'w-full'}`}
      {rounded}
      {active}
    />
  {/each}
</div>
