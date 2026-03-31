<script>
  import { user } from '../../stores/auth.js';
  import { fetchWithAuth } from '../../utils/api.js';

  /** @typedef {import('../../models/user.js').User} User */
  /** @typedef {import('../../models/user.js').UserPreferences} UserPreferences */
  
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

  async function saveSettings() {
    saving = true;
    message = '';
    errorMessage = '';
    
    try {
      /** @type {User} */
      const updated = await fetchWithAuth('/auth/me', {
        method: 'PUT',
        body: JSON.stringify({
          username,
          email,
          preferences
        })
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
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input 
            id="username"
            type="text" 
            bind:value={username}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input 
            id="email"
            type="email" 
            bind:value={email}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <p class="text-xs text-gray-500">Changes are saved via a mocked API when backend is unavailable.</p>
      </div>
    </div>

    <!-- AI Preferences -->
    <div>
      <h3 class="text-lg font-medium text-gray-900 mb-4">AI Preferences</h3>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1" for="model">Default Model</label>
        <select 
          id="model"
          bind:value={preferences.model}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
        >
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Fast, efficient)</option>
          <option value="gpt-4-turbo-preview">GPT-4 Turbo (More capable, higher cost)</option>
        </select>
        <p class="mt-2 text-sm text-gray-500">Higher capacity models will consume more tokens.</p>
      </div>
    </div>

    <!-- Save Button -->
    <div class="pt-4 flex justify-end">
      <button 
        on:click={saveSettings}
        disabled={saving}
        class="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  </div>
</div>
