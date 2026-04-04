<script>
  import { authService } from '$lib/services/auth.service';
  import { authError, authLoading } from '$lib/stores/auth.store';
  import Button from '$lib/components/common/Button.svelte';
  import TextField from '$lib/components/common/TextField.svelte';
  import { t } from '../../lib/i18n';
  
  let isLogin = true;
  let username = '';
  let email = '';
  let password = '';

  async function handleSubmit() {
    try {
      if (isLogin) {
        await authService.login({
          email: username,
          password
        });
      } else {
        await authService.register({
          email,
          full_name: username,
          password
        });
      }
    } catch {
      // Error state comes from authError store.
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


<div class="min-h-screen flex items-stretch justify-center bg-[var(--color-bg-app)]">
  <div class="flex flex-1 w-full min-h-screen flex-col md:flex-row">
    <!-- Left illustration/branding panel -->
    <div class="hidden md:flex flex-1 items-center justify-center bg-gradient-to-br from-indigo-400 to-purple-600">
      <div class="flex flex-col items-center justify-center w-full max-w-[420px] px-6 py-12 text-center text-white">
        <img src="/src/assets/hero.png" alt="Branding" class="w-44 max-w-[80vw] mb-10 rounded-2xl shadow-md bg-white object-contain" />
        <div class="text-3xl font-bold mb-2 tracking-tight">AI Finance</div>
        <div class="text-base font-normal opacity-90">Build your dream</div>
      </div>
    </div>

    <!-- Right login card panel -->
    <div class="flex flex-1 items-center justify-center bg-[var(--color-bg-surface)] px-4 py-8">
      <div class="w-full max-w-md bg-[var(--color-bg-card)] rounded-2xl shadow-md px-6 py-10 flex flex-col gap-6">
        <h3 class="text-2xl font-bold text-center text-[var(--color-text-primary)] mb-2 tracking-tight">{isLogin ? $t('auth.loginTitle') : $t('auth.registerTitle')}</h3>

        {#if $authError}
          <div class="p-4 mb-2 text-base text-[var(--color-danger)] bg-[var(--color-danger-muted)] rounded-md border border-[var(--color-danger-border)] text-left">
            {$authError}
          </div>
        {/if}

        <form on:submit|preventDefault={handleSubmit} class="flex flex-col gap-5 mt-2">
          <TextField
            id="username"
            label={$t('auth.username')}
            placeholder={$t('auth.username')}
            bind:value={username}
            required
          />

          {#if !isLogin}
            <TextField
              id="email"
              type="email"
              label={$t('auth.email')}
              placeholder={$t('auth.email')}
              bind:value={email}
              required
            />
          {/if}

          <TextField
            id="password"
            type="password"
            label={$t('auth.password')}
            placeholder={$t('auth.password')}
            bind:value={password}
            required
          />

          <div class="flex flex-col gap-4 mt-4">
            <Button
              type="submit"
              rounded="rounded-lg"
              className="w-full py-3 text-base font-semibold bg-[var(--color-accent)] text-[var(--color-accent-contrast)] rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-opacity-50 transition disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={$authLoading}
            >
              {$authLoading ? $t('common.processing') : (isLogin ? $t('auth.login') : $t('auth.register'))}
            </Button>
            <a
              class="text-base text-[var(--color-accent)] text-center underline cursor-pointer mt-1 hover:text-[var(--color-accent-hover)] transition"
              role="button"
              tabindex="0"
              href="234"
              on:click={toggleAuthMode}
              on:keydown={handleToggleKeydown}
            >
              {isLogin ? $t('auth.needAccount') : $t('auth.alreadyHaveAccount')}
            </a>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>


