<script>
  import { login as loginStore, register as registerStore } from '../../stores/auth.js';
  import { navigate } from '../../stores/router.js';
  import Button from '../../components/common/Button.svelte';
  import TextField from '../../components/common/form/TextField.svelte';
  import { t } from '../../lib/i18n';
  
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

      navigate('/workspace');
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  function toggleAuthMode() {
    isLogin = !isLogin;
  }

  function handleToggleKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleAuthMode();
    }
  }
</script>

<div class="flex items-center justify-center min-h-screen bg-gray-100 px-3 sm:px-4">
  <div class="w-full max-w-md px-4 sm:px-6 md:px-8 py-6 text-left bg-white shadow-lg rounded-lg">
    <h3 class="text-xl sm:text-2xl font-bold text-center">{isLogin ? $t('auth.loginTitle') : $t('auth.registerTitle')}</h3>
    
    {#if error}
      <div class="p-4 mt-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
        {error}
      </div>
    {/if}

    <form on:submit|preventDefault={handleSubmit} class="mt-4">
      <div class="mt-4">
        <TextField
          id="username"
          label={$t('auth.username')}
          placeholder={$t('auth.username')}
          bind:value={username}
          required
        />
      </div>
      
      {#if !isLogin}
        <div class="mt-4">
          <TextField
            id="email"
            type="email"
            label={$t('auth.email')}
            placeholder={$t('auth.email')}
            bind:value={email}
            required
          />
        </div>
      {/if}

      <div class="mt-4">
        <TextField
          id="password"
          type="password"
          label={$t('auth.password')}
          placeholder={$t('auth.password')}
          bind:value={password}
          required
        />
      </div>

      <div class="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between mt-6">
        <Button
          type="submit"
          rounded="rounded-lg"
          className="px-6 w-full sm:w-auto"
          disabled={loading}
        >
          {loading ? $t('common.processing') : (isLogin ? $t('auth.login') : $t('auth.register'))}
        </Button>
        <!-- svelte-ignore a11y_missing_attribute -->
        <!-- svelte-ignore a11y_interactive_supports_focus -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <a
          class="text-sm text-blue-600 hover:underline cursor-pointer"
          role="button"
          tabindex="0"
          on:click={toggleAuthMode}
          on:keydown={handleToggleKeydown}
        >
          {isLogin ? $t('auth.needAccount') : $t('auth.alreadyHaveAccount')}
        </a>
      </div>
    </form>
  </div>
</div>
