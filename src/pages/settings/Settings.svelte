<script>
  import { fade } from 'svelte/transition';
  import { user, authState, updateProfile, fetchUser } from '../../stores/auth.js';
  import Button from '$lib/components/common/Button.svelte';
  import TextField from '$lib/components/common/TextField.svelte';
  import SelectField from '$lib/components/common/SelectField.svelte';
  import LoadingBlock from '$lib/components/common/LoadingBlock.svelte';
  import ErrorFallback from '$lib/components/common/ErrorFallback.svelte';
  import { t } from '../../lib/i18n';

  /** @typedef {import('../../lib/models').User} User */
  /** @typedef {import('../../lib/models').UserPreferences} UserPreferences */
  
  let initialized = false;
  let username = '';
  let email = '';
  /** @type {UserPreferences} */
  let preferences = { model: 'gpt-3.5-turbo' };
  let message = '';
  let errorMessage = '';

  $: profileState = $authState;

  $: if (!$user) {
    initialized = false;
  }

  $: if ($user && !initialized) {
    username = $user.username || '';
    email = $user.email || '';
    preferences = {
      model: $user.preferences?.model || 'gpt-3.5-turbo'
    };
    initialized = true;
  }

  $: modelOptions = [
    { value: 'gpt-3.5-turbo', label: $t('settings.modelFast') },
    { value: 'gpt-4-turbo-preview', label: $t('settings.modelCapable') }
  ];

  async function saveSettings() {
    message = '';
    errorMessage = '';
    
    try {
      /** @type {User} */
      const updated = await updateProfile({
        username,
        email,
        preferences
      });

      message = $t('settings.saved');
      setTimeout(() => (message = ''), 3000);
    } catch (err) {
      errorMessage = err?.message || $t('settings.saveFailed');
    }
  }
</script>

<div class="w-full max-w-3xl mx-auto bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
  <h2 class="text-lg sm:text-xl font-semibold text-gray-800 mb-6">{$t('settings.accountSettings')}</h2>

  {#if message}
    <div class="p-3 mb-6 text-sm text-green-700 bg-green-100 rounded-md transition-opacity">
      {message}
    </div>
  {/if}

  {#if errorMessage}
    <div class="p-3 mb-6 text-sm text-red-700 bg-red-100 rounded-md transition-opacity">
      {errorMessage}
    </div>
  {/if}

  {#if profileState.showLoading && !$user}
    <div class="space-y-6" aria-live="polite">
      <LoadingBlock rows={1} rowHeight="h-7" className="w-48" />
      <LoadingBlock rows={3} rowHeight="h-11" />
      <LoadingBlock rows={1} rowHeight="h-7" className="w-48" />
      <LoadingBlock rows={2} rowHeight="h-11" />
    </div>
  {:else if profileState.error && !$user}
    <ErrorFallback
      message={profileState.error}
      retryLabel={$t('settings.retryLoadingProfile')}
      on:retry={fetchUser}
    />
  {:else}
  <div class="space-y-6" transition:fade={{ duration: 180 }}>
    <!-- Profile Info -->
    <div class="pb-6 border-b border-gray-200">
      <h3 class="text-lg font-medium text-gray-900 mb-4">{$t('settings.profileInformation')}</h3>
      
      <div class="grid grid-cols-1 gap-4">
        <TextField id="username" label={$t('auth.username')} bind:value={username} />
        <TextField id="email" type="email" label={$t('auth.email')} bind:value={email} />
        <p class="text-xs text-gray-500">{$t('settings.apiLayerNote')}</p>
      </div>
    </div>

    <!-- AI Preferences -->
    <div>
      <h3 class="text-lg font-medium text-gray-900 mb-4">{$t('settings.aiPreferences')}</h3>
      
      <div>
        <SelectField
          id="model"
          label={$t('settings.defaultModel')}
          bind:value={preferences.model}
          options={modelOptions}
        />
        <p class="mt-2 text-sm text-gray-500">{$t('settings.modelHint')}</p>
      </div>
    </div>

    <!-- Save Button -->
    <div class="pt-4 flex justify-stretch sm:justify-end">
      <Button
        on:click={saveSettings}
        disabled={profileState.updating}
        rounded="rounded-lg"
        className="px-6 w-full sm:w-auto"
      >
        {profileState.updating ? $t('settings.saving') : $t('settings.saveChanges')}
      </Button>
    </div>
  </div>
  {/if}
</div>
