<script>
  import { STUDIO_TOOL_ICON_DEFS } from "../../utils/studioIcons.js";

  /** @type {string} */
  export let name = "";

  /** @type {string} */
  export let className = "h-5 w-5";

  /** @type {number} */
  export let strokeWidth = 1.8;

  $: icon = STUDIO_TOOL_ICON_DEFS[name] ?? null;
</script>

{#if icon}
  <svg
    class={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width={strokeWidth}
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    {#each icon.rects ?? [] as r}
      <rect x={r.x} y={r.y} width={r.width} height={r.height} rx={r.rx ?? 0} />
    {/each}

    {#each icon.circles ?? [] as c}
      <circle cx={c.cx} cy={c.cy} r={c.r} />
    {/each}

    {#each icon.paths ?? [] as d}
      <path d={d} />
    {/each}
  </svg>
{/if}
