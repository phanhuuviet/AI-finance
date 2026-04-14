<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  interface AutocompleteOption {
    id: string;
    name: string;
    description?: string;
  }

  export let options: AutocompleteOption[] = [];
  export let value: string = '';
  export let loading: boolean = false;
  export let placeholder: string = 'Select an option...';
  export let loadOptions: ((query: string) => Promise<AutocompleteOption[]>) | null = null;
  export let disabled: boolean = false;

  let isOpen = false;
  let query = '';
  let containerEl: HTMLElement;
  let triggerEl: HTMLButtonElement;
  let panelEl: HTMLDivElement;
  let panelStyle = '';
  let asyncOptions: AutocompleteOption[] = [];
  let isFetching = false;

  $: selectedOption = mergedOptions.find((o) => o.id === value) ?? null;
  $: mergedOptions = (loadOptions ? asyncOptions : options) || [];
  $: filteredOptions = query.trim()
    ? mergedOptions.filter((o) => {
        const haystack = `${o.name} ${o.description ?? ''}`.toLowerCase();
        return haystack.includes(query.toLowerCase());
      })
    : mergedOptions;

  async function fetchAsyncOptions(nextQuery: string): Promise<void> {
    if (!loadOptions) return;
    isFetching = true;
    try {
      asyncOptions = await loadOptions(nextQuery);
    } catch {
      asyncOptions = [];
    } finally {
      isFetching = false;
    }
  }

  function toggle(): void {
    if (disabled) return;
    isOpen = !isOpen;
    if (isOpen && loadOptions) {
      fetchAsyncOptions(query);
    }
    if (isOpen) {
      updatePanelPosition();
    }
  }

  function select(id: string): void {
    if (disabled) return;
    value = id;
    isOpen = false;
    query = '';
  }

  function handleInput(event: Event): void {
    if (disabled) return;
    const target = event.currentTarget as HTMLInputElement;
    query = target.value;
    if (loadOptions) {
      fetchAsyncOptions(query);
    }
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      isOpen = false;
    }
  }

  $: if (disabled && isOpen) {
    isOpen = false;
  }

  function handleClickOutside(event: MouseEvent): void {
    const target = event.target as Node;
    const clickedInsideTrigger = Boolean(containerEl && containerEl.contains(target));
    const clickedInsidePanel = Boolean(panelEl && panelEl.contains(target));
    if (!clickedInsideTrigger && !clickedInsidePanel) {
      isOpen = false;
    }
  }

  function updatePanelPosition(): void {
    if (!triggerEl) return;

    const rect = triggerEl.getBoundingClientRect();
    panelStyle = [
      'position: fixed',
      `top: ${rect.bottom + 4}px`,
      `left: ${rect.left}px`,
      `width: ${rect.width}px`,
      'z-index: 70'
    ].join('; ');
  }

  onMount(() => {
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', updatePanelPosition);
    window.addEventListener('scroll', updatePanelPosition, true);
  });

  onDestroy(() => {
    document.removeEventListener('mousedown', handleClickOutside);
    window.removeEventListener('resize', updatePanelPosition);
    window.removeEventListener('scroll', updatePanelPosition, true);
  });

  $: if (isOpen) {
    updatePanelPosition();
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="relative w-full" bind:this={containerEl}>
  <button
    type="button"
    bind:this={triggerEl}
    class="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg border border-[var(--border-default)] bg-white text-sm cursor-pointer text-left hover:border-[var(--purple-400)] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--purple-50)]"
    class:border-[var(--purple-400)]={isOpen}
    class:ring-2={isOpen}
    class:ring-[var(--purple-50)]={isOpen}
    class:cursor-not-allowed={disabled}
    class:opacity-60={disabled}
    on:click={toggle}
    aria-haspopup="listbox"
    aria-expanded={isOpen}
    disabled={disabled}
  >
    {#if loading || isFetching}
      <span class="text-[var(--text-muted)]">Loading options...</span>
    {:else if selectedOption}
      <span class="text-[var(--text-primary)] font-medium">{selectedOption.name}</span>
    {:else}
      <span class="text-[var(--text-muted)]">{placeholder}</span>
    {/if}

    <svg
      class="text-[var(--text-muted)] shrink-0 transition-transform duration-200"
      class:rotate-180={isOpen}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  </button>

  {#if isOpen}
    <div
      bind:this={panelEl}
      class="bg-white border border-[var(--border-default)] rounded-xl shadow-lg overflow-hidden"
      style={panelStyle}
    >
      <div class="p-2 border-b border-[var(--border-subtle)]">
        <input
          type="text"
          value={query}
          on:input={handleInput}
          placeholder="Search..."
          class="w-full px-3 py-2 text-sm border border-[var(--border-default)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--purple-50)]"
          disabled={disabled}
        />
      </div>

      <ul class="overflow-y-auto max-h-64 py-1 list-none m-0 p-0" role="listbox">
        {#if loading || isFetching}
          <li class="px-3.5 py-3 text-xs text-[var(--text-muted)]">Loading options...</li>
        {:else if filteredOptions.length === 0}
          <li class="px-3.5 py-3 text-xs text-[var(--text-muted)]">No options found.</li>
        {:else}
          {#each filteredOptions as option (option.id)}
            <li
              class="flex items-start justify-between gap-3 px-3.5 py-3 cursor-pointer hover:bg-[var(--purple-50)] transition-colors duration-100 focus:outline-none focus:bg-[var(--purple-50)] border-b border-[var(--border-subtle)] last:border-0"
              class:bg-[var(--purple-50)]={value === option.id}
              role="option"
              aria-selected={value === option.id}
              on:click={() => select(option.id)}
              on:keydown={(event) => event.key === 'Enter' && select(option.id)}
              tabindex="0"
            >
              <div class="flex flex-col gap-0.5 flex-1 min-w-0">
                <span class="text-sm font-semibold text-[var(--text-primary)] leading-snug">{option.name}</span>
                {#if option.description}
                  <span class="text-xs text-[var(--text-secondary)] leading-snug overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]">
                    {option.description}
                  </span>
                {/if}
              </div>

              {#if value === option.id}
                <svg class="text-[var(--purple-600)] shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              {/if}
            </li>
          {/each}
        {/if}
      </ul>
    </div>
  {/if}
</div>