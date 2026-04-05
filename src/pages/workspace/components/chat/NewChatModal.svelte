<script lang="ts">
  import { onMount } from 'svelte';
  import { sessionService } from '$lib/services/session.service';
  import { sessionStore, videoConcepts, isCreating } from '$lib/stores/session.store';
  import TextField from '$lib/components/common/TextField.svelte';
  import Button from '$lib/components/common/Button.svelte';

  export let onClose: () => void = () => {};

  let title = '';
  let selectedConceptId = '';
  let promptValues: Record<string, string> = {};
  let previousConceptId = '';

  $: selectedConcept = $videoConcepts.find((c) => c.id === selectedConceptId) ?? null;

  $: if (selectedConceptId !== previousConceptId) {
    previousConceptId = selectedConceptId;
    promptValues = selectedConcept
      ? Object.fromEntries(selectedConcept.prompt_inputs.map((p) => [p.key, '']))
      : {};
  }

  $: isSubmitDisabled =
    !title.trim() ||
    !selectedConceptId ||
    (selectedConcept?.prompt_inputs ?? [])
      .filter((p) => p.required)
      .some((p) => !promptValues[p.key]?.trim()) ||
    $isCreating;

  onMount(() => {
    sessionService.loadVideoConcepts();
  });

  function resetForm(): void {
    title = '';
    selectedConceptId = '';
    promptValues = {};
    sessionStore.update((s) => ({ ...s, error: null }));
  }

  async function handleSubmit(): Promise<void> {
    try {
      await sessionService.createSession(title, selectedConceptId, promptValues);
      resetForm();
      onClose();
    } catch {
      // error is displayed from $sessionStore.error
    }
  }
</script>

<div class="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50" role="dialog" aria-modal="true">
  <div class="bg-[var(--color-bg-elevated)] rounded-xl w-full max-w-xl max-h-[90dvh] overflow-hidden border border-[var(--color-border-default)] shadow-[0_16px_40px_rgba(15,23,42,0.25)]">
    <div class="p-5 sm:p-6 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] flex items-center justify-between gap-3">
      <h3 class="text-lg sm:text-xl font-semibold text-[var(--color-text-primary)]">New Chat</h3>
      <Button
        unstyled
        type="button"
        className="p-2 min-h-11 min-w-11 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"
        on:click={onClose}
        aria-label="Close"
      >
        x
      </Button>
    </div>

    <div class="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-[calc(90dvh-154px)]">
      <TextField bind:value={title} label="Chat Title" placeholder="Enter chat title..." required />

      <div class="field">
        <div class="field-label">
          Video Concept <span class="required-mark">*</span>
        </div>

        <div class="concept-list" role="listbox" aria-label="Video Concept" aria-required="true">
        {#if $sessionStore.isLoadingConcepts}
          {#each Array(3) as _}
            <div class="concept-card concept-card--skeleton" aria-hidden="true"></div>
          {/each}
        {:else}
          {#each $videoConcepts as concept}
            <button
              type="button"
              class="concept-card"
              class:concept-card--selected={selectedConceptId === concept.id}
              on:click={() => (selectedConceptId = concept.id)}
              aria-pressed={selectedConceptId === concept.id}
            >
              <span class="concept-name">{concept.name}</span>
              <span class="concept-desc">{concept.description}</span>
            </button>
          {/each}
        {/if}
        </div>
      </div>

      {#if selectedConcept}
        <div class="space-y-3 pt-1">
          {#each selectedConcept.prompt_inputs as input}
            <TextField
              bind:value={promptValues[input.key]}
              label={input.label}
              placeholder={input.description}
              required={input.required}
            />
          {/each}
        </div>
      {/if}

      {#if $sessionStore.error}
        <p class="error text-sm text-[var(--color-danger)]">{$sessionStore.error}</p>
      {/if}
    </div>

    <div class="p-4 sm:p-5 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-app)] flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
      <Button
        unstyled
        type="button"
        on:click={onClose}
        className="w-full sm:w-auto px-4 py-2 min-h-11 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] rounded-lg border border-[var(--color-border-default)]"
      >
        Cancel
      </Button>

      <Button
        unstyled
        type="button"
        disabled={isSubmitDisabled}
        on:click={handleSubmit}
        className="w-full sm:w-auto px-4 py-2 min-h-11 text-sm font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {$isCreating ? 'Creating...' : 'Create Chat'}
      </Button>
    </div>
  </div>
</div>

<style>
  .field-label {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-primary, #1e1b4b);
    margin-bottom: 6px;
  }

  .required-mark {
    color: var(--rose-500, #f43f5e);
  }

  .concept-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 240px;
    overflow-y: auto;
    padding-right: 4px;
  }

  .concept-card {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
    text-align: left;
    padding: 12px 14px;
    border-radius: var(--radius-md, 8px);
    border: 1.5px solid var(--border-default, #e5e7eb);
    background: var(--bg-card, #ffffff);
    cursor: pointer;
    transition: border-color 0.15s ease, background 0.15s ease;
  }

  .concept-card:hover {
    border-color: var(--border-purple, #ddd6fe);
    background: var(--purple-50, #f5f3ff);
  }

  .concept-card--selected {
    border-color: var(--purple-600, #7c3aed);
    background: var(--purple-50, #f5f3ff);
    border-left: 3px solid var(--purple-600, #7c3aed);
  }

  .concept-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary, #1e1b4b);
    line-height: 1.4;
  }

  .concept-desc {
    font-size: 12px;
    color: var(--text-secondary, #6b7280);
    line-height: 1.5;
  }

  .concept-card--skeleton {
    height: 58px;
    background: linear-gradient(
      90deg,
      var(--bg-app, #f7f5ff) 25%,
      var(--purple-50, #f5f3ff) 50%,
      var(--bg-app, #f7f5ff) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.4s ease-in-out infinite;
    border: 1.5px solid var(--border-subtle, #f3f4f6);
    cursor: default;
  }

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }

    100% {
      background-position: -200% 0;
    }
  }
</style>