<script>
  import { login as loginStore, register as registerStore } from '../../stores/auth.js';
  
  let isLogin = true;
  let username = '';
  let email = '';
  let password = '';
  let error = '';
  let loading = false;

  async function handleSubmit() {
    error = '';
    loading = true;
    try {
      if (isLogin) {
        await loginStore(username, password);
      } else {
        await registerStore(username, email, password);
      }
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }
</script>

<div class="flex items-center justify-center min-h-screen bg-gray-100">
  <div class="px-8 py-6 mt-4 text-left bg-white shadow-lg w-96 rounded-lg">
    <h3 class="text-2xl font-bold text-center">{isLogin ? 'Login to your account' : 'Create an account'}</h3>
    
    {#if error}
      <div class="p-4 mt-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
        {error}
      </div>
    {/if}

    <form on:submit|preventDefault={handleSubmit} class="mt-4">
      <div class="mt-4">
        <label class="block" for="username">Username</label>
        <input type="text" placeholder="Username" bind:value={username} required
               class="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600">
      </div>
      
      {#if !isLogin}
        <div class="mt-4">
          <label class="block" for="email">Email</label>
          <input type="email" placeholder="Email" bind:value={email} required
                 class="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600">
        </div>
      {/if}

      <div class="mt-4">
        <label class="block" for="password">Password</label>
        <input type="password" placeholder="Password" bind:value={password} required
               class="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600">
      </div>

      <div class="flex items-baseline justify-between mt-6">
        <button class="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-900 disabled:opacity-50" disabled={loading}>
          {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
        </button>
        <!-- svelte-ignore a11y_missing_attribute -->
        <!-- svelte-ignore a11y_interactive_supports_focus -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <a class="text-sm text-blue-600 hover:underline cursor-pointer" on:click={() => isLogin = !isLogin}>
          {isLogin ? 'Need an account?' : 'Already have an account?'}
        </a>
      </div>
    </form>
  </div>
</div>
