<script>
  import { user } from '../../stores/auth.js';
  import { authService } from '../../lib/services/auth.service';
  import Button from '../../components/common/Button.svelte';
  import TextField from '../../components/common/form/TextField.svelte';
  import SelectField from '../../components/common/form/SelectField.svelte';

  /** @typedef {import('../../lib/models').User} User */
  /** @typedef {import('../../lib/models').UserPreferences} UserPreferences */
  
  let initialized = false;
  let username = '';
  let email = '';
  /** @type {UserPreferences} */
  let preferences = { model: 'gpt-3.5-turbo' };
  let saving = false;
  let message = '';
  let errorMessage = '';

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

  const modelOptions = [
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Fast, efficient)' },
    { value: 'gpt-4-turbo-preview', label: 'GPT-4 Turbo (More capable, higher cost)' }
  ];

  async function saveSettings() {
    saving = true;
    message = '';
    errorMessage = '';
    
    try {
      /** @type {User} */
      const updated = await authService.updateUser({
        username,
        email,
        preferences
      });

      user.set(updated);
      message = 'Settings saved successfully.';
      setTimeout(() => (message = ''), 3000);
    } catch (err) {
      errorMessage = err?.message || 'Failed to save settings.';
    } finally {
      saving = false;
    }
  }
</script>

<div class="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm border border-gray-200">
  <h2 class="text-xl font-semibold text-gray-800 mb-6">Account Settings</h2>

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

  <div class="space-y-6">
    <!-- Profile Info -->
    <div class="pb-6 border-b border-gray-200">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
      
      <div class="grid grid-cols-1 gap-4">
        <TextField id="username" label="Username" bind:value={username} />
        <TextField id="email" type="email" label="Email" bind:value={email} />
        <p class="text-xs text-gray-500">Changes are saved through the centralized API service layer.</p>
      </div>
    </div>

    <!-- AI Preferences -->
    <div>
      <h3 class="text-lg font-medium text-gray-900 mb-4">AI Preferences</h3>
      
      <div>
        <SelectField
          id="model"
          label="Default Model"
          bind:value={preferences.model}
          options={modelOptions}
        />
        <p class="mt-2 text-sm text-gray-500">Higher capacity models will consume more tokens.</p>
      </div>
    </div>

    <!-- Save Button -->
    <div class="pt-4 flex justify-end">
      <Button
        on:click={saveSettings}
        disabled={saving}
        rounded="rounded-lg"
        className="px-6"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  </div>
</div>
