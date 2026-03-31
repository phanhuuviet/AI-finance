<script>
  import { user } from '../stores/auth.js';
  
  // Local state initialized from store
  let preferences = $user?.preferences || { model: 'gpt-3.5-turbo' };
  let saving = false;
  let message = '';

  async function saveSettings() {
    saving = true;
    message = '';
    
    // In a real app, you would have a settings/update endpoint
    // For now, we simulate success
    setTimeout(() => {
      message = 'Settings saved successfully.';
      saving = false;
      
      // Clear message after 3 seconds
      setTimeout(() => message = '', 3000);
    }, 800);
  }
</script>

<div class="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm border border-gray-200">
  <h2 class="text-xl font-semibold text-gray-800 mb-6">Account Settings</h2>

  {#if message}
    <div class="p-3 mb-6 text-sm text-green-700 bg-green-100 rounded-md transition-opacity">
      {message}
    </div>
  {/if}

  <div class="space-y-6">
    <!-- Profile Info -->
    <div class="pb-6 border-b border-gray-200">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
      
      <div class="grid grid-cols-1 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input 
            type="text" 
            value={$user?.username} 
            disabled
            class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input 
            type="email" 
            value={$user?.email} 
            disabled
            class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
          />
        </div>
        <p class="text-xs text-gray-500">Profile information cannot be changed currently.</p>
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
