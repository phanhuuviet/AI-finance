<script lang="ts">
  import { onMount } from 'svelte';
  import { sessionService } from '$lib/services/session.service';
  import type { VideoConcept } from '$lib/models/session.model';
  import { sessionStore, videoConcepts, isCreating } from '$lib/stores/session.store';
  import Autocomplete from '$lib/components/common/Autocomplete.svelte';
  import TextField from '$lib/components/common/TextField.svelte';
  import Button from '$lib/components/common/Button.svelte';
  import { showToast } from '$lib/utils/toast';

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

  async function fetchConceptOptions(query: string): Promise<VideoConcept[]> {
    const keyword = query.trim().toLowerCase();
    const all = $videoConcepts ?? [];
    if (!keyword) return all;
    return all.filter((concept) =>
      `${concept.name} ${concept.description}`.toLowerCase().includes(keyword)
    );
  }

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
      showToast('Chat created successfully.', 'success');
      resetForm();
      onClose();
    } catch (err) {
      showToast((err as Error)?.message || $sessionStore.error || 'SESSION_CREATE_FAILED', 'error');
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

      <div class="mb-4">
        <div class="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
          Video Concept
          <span class="text-[var(--rose-500,#F43F5E)] ml-0.5">*</span>
        </div>

        <Autocomplete
          options={$videoConcepts}
          bind:value={selectedConceptId}
          loading={$sessionStore.isLoadingConcepts}
          placeholder="Select a video concept..."
          loadOptions={fetchConceptOptions}
        />
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
