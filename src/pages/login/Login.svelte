<script>
  import heroImage from '../../assets/hero.png';
  import { authService } from '$lib/services/auth.service';
  import { authError, authLoading } from '$lib/stores/auth.store';
  import Button from '$lib/components/common/Button.svelte';
  import TextField from '$lib/components/common/TextField.svelte';
  import { showToast } from '$lib/utils/toast';
  import { t } from '../../lib/i18n';
  
  let isLogin = true;
  let username = '';
  let email = '';
  let password = '';
  let lastAuthError = '';

 // @ts-ignore
   $: if ($authError && $authError !== lastAuthError) {
    lastAuthError = $authError;
    showToast($authError, 'error');
  }

 // @ts-ignore
   $: if (!$authError) {
    lastAuthError = '';
  }

  function resetForm() {
    username = '';
    email = '';
    password = '';
  }

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
        resetForm();
        isLogin = true;
        showToast('Register successful. Please sign in.', 'success');
      }
    } catch {
      // Error state comes from authError store.
    }
  }

  function toggleAuthMode() {
    if ($authLoading) return;
    isLogin = !isLogin;
  }

  /** @param {KeyboardEvent} event */
  function handleToggleKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleAuthMode();
    }
  }
</script>

<div class="login-shell">
  <div class="ambient ambient-a" aria-hidden="true"></div>
  <div class="ambient ambient-b" aria-hidden="true"></div>
  <div class="ambient ambient-c" aria-hidden="true"></div>
  <div class="bubble-field" aria-hidden="true">
    <span class="bubble b1"></span>
    <span class="bubble b2"></span>
    <span class="bubble b3"></span>
    <span class="bubble b4"></span>
    <span class="bubble b5"></span>
    <span class="bubble b6"></span>
    <span class="bubble b7"></span>
    <span class="bubble b8"></span>
  </div>

  <div class="login-layout">
    <section class="brand-pane" aria-label="Brand">
      <div class="brand-content">
        <p class="brand-kicker">AI Finance Studio</p>
        <h1 class="brand-title">Analyze smarter. Trade with confidence.</h1>
        <p class="brand-subtitle">Một workspace duy nhất để theo dõi thị trường, chat với AI và tối ưu chiến lược tài chính của bạn.</p>

        <div class="brand-pills">
          <span>Real-time insights</span>
          <span>AI assistant</span>
          <span>Portfolio automation</span>
        </div>

        <div class="brand-preview">
          <img src={heroImage} alt="AI Finance preview" />
        </div>
      </div>
    </section>

    <section class="form-pane">
      <div class="login-card">
        <div class="card-glow" aria-hidden="true"></div>
        <p class="card-overline">Welcome back</p>
        <h2>{isLogin ? $t('auth.loginTitle') : $t('auth.registerTitle')}</h2>
        <p class="card-caption">{isLogin ? 'Đăng nhập để tiếp tục với không gian làm việc của bạn.' : 'Tạo tài khoản mới để bắt đầu sử dụng AI Finance.'}</p>

        {#if $authError}
          <div class="auth-error">
            {$authError}
          </div>
        {/if}

        <form on:submit|preventDefault={handleSubmit} class="auth-form">
          {#key isLogin}
            <div class="form-fields">
              <TextField
                id="username"
                label={$t('auth.username')}
                placeholder={$t('auth.username')}
                bind:value={username}
                required
                disabled={$authLoading}
              />

              {#if !isLogin}
                <TextField
                  id="email"
                  type="email"
                  label={$t('auth.email')}
                  placeholder={$t('auth.email')}
                  bind:value={email}
                  required
                  disabled={$authLoading}
                />
              {/if}

              <TextField
                id="password"
                type="password"
                label={$t('auth.password')}
                placeholder={$t('auth.password')}
                bind:value={password}
                required
                disabled={$authLoading}
              />
            </div>
          {/key}

          <div class="action-stack">
            <Button
              type="submit"
              rounded="rounded-xl"
              className="submit-btn"
              disabled={$authLoading}
            >
              {$authLoading ? $t('common.processing') : (isLogin ? $t('auth.login') : $t('auth.register'))}
            </Button>

            <a
              class="switch-link"
              role="button"
              tabindex="0"
              href="/login"
              on:click|preventDefault={toggleAuthMode}
              on:keydown={handleToggleKeydown}
              aria-disabled={$authLoading}
            >
              {isLogin ? $t('auth.needAccount') : $t('auth.alreadyHaveAccount')}
            </a>
          </div>
        </form>
      </div>
    </section>
  </div>
</div>

<style>
  .login-shell {
    --pane-radius: 28px;
    position: relative;
    height: 100dvh;
    min-height: 100dvh;
    overflow: hidden;
    background:
      radial-gradient(circle at 15% 20%, rgba(99, 102, 241, 0.12), transparent 40%),
      radial-gradient(circle at 85% 85%, rgba(139, 92, 246, 0.1), transparent 45%),
      linear-gradient(145deg, #fafafa 0%, #f4f4f5 50%, #f6f7f9 100%);
  }

  .ambient {
    position: absolute;
    border-radius: 9999px;
    filter: blur(4px);
    opacity: 0.8;
    pointer-events: none;
    animation: floatOrb 10s ease-in-out infinite;
  }

  .ambient-a {
    width: 280px;
    height: 280px;
    top: -80px;
    right: -90px;
    background: linear-gradient(140deg, rgba(99, 102, 241, 0.22), rgba(139, 92, 246, 0.18));
  }

  .ambient-b {
    width: 220px;
    height: 220px;
    bottom: 8%;
    left: -70px;
    background: linear-gradient(160deg, rgba(124, 58, 237, 0.18), rgba(99, 102, 241, 0.16));
    animation-delay: -3.5s;
  }

  .ambient-c {
    width: 160px;
    height: 160px;
    top: 48%;
    right: 42%;
    background: linear-gradient(120deg, rgba(129, 140, 248, 0.16), rgba(167, 139, 250, 0.18));
    animation-delay: -6s;
  }

  .bubble-field {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: 1;
  }

  .bubble {
    position: absolute;
    display: block;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.45);
    background:
      radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.52), rgba(255, 255, 255, 0.08) 45%, transparent 72%),
      radial-gradient(circle at 60% 70%, rgba(139, 92, 246, 0.2), rgba(99, 102, 241, 0.06) 65%, transparent 100%);
    box-shadow:
      inset 0 0 20px rgba(255, 255, 255, 0.18),
      0 0 24px rgba(139, 92, 246, 0.12);
    filter: blur(2px);
    opacity: 0.58;
    animation: bubbleRise 11s linear infinite, bubblePulse 4.8s ease-in-out infinite;
  }

  .b1 {
    width: 180px;
    height: 180px;
    left: -3%;
    bottom: -120px;
    animation-duration: 12s, 5.3s;
    animation-delay: -7s, -2s;
  }

  .b2 {
    width: 120px;
    height: 120px;
    left: 12%;
    bottom: -160px;
    animation-duration: 10.2s, 4.9s;
    animation-delay: -4s, -1.3s;
  }

  .b3 {
    width: 210px;
    height: 210px;
    left: 34%;
    bottom: -170px;
    animation-duration: 13.5s, 6s;
    animation-delay: -9s, -3s;
  }

  .b4 {
    width: 88px;
    height: 88px;
    left: 50%;
    bottom: -120px;
    animation-duration: 9.3s, 4.6s;
    animation-delay: -2.5s, -4s;
  }

  .b5 {
    width: 150px;
    height: 150px;
    left: 64%;
    bottom: -150px;
    animation-duration: 11.4s, 5.4s;
    animation-delay: -11s, -2s;
  }

  .b6 {
    width: 110px;
    height: 110px;
    left: 78%;
    bottom: -105px;
    animation-duration: 10.6s, 4.8s;
    animation-delay: -5s, -0.8s;
  }

  .b7 {
    width: 230px;
    height: 230px;
    right: -6%;
    bottom: -180px;
    animation-duration: 14.8s, 6.3s;
    animation-delay: -13s, -6s;
  }

  .b8 {
    width: 95px;
    height: 95px;
    right: 22%;
    bottom: -130px;
    animation-duration: 9.8s, 4.7s;
    animation-delay: -8s, -2.4s;
  }

  .login-layout {
    position: relative;
    z-index: 2;
    height: 100%;
    min-height: 100%;
    max-width: 1160px;
    margin: 0 auto;
    padding: clamp(10px, 2vh, 24px) 16px;
    display: grid;
    gap: 18px;
    grid-template-columns: 1fr;
  }

  .brand-pane,
  .form-pane {
    border-radius: var(--pane-radius);
    backdrop-filter: blur(10px);
  }

  .brand-pane {
    display: none;
    background: linear-gradient(155deg, rgba(24, 24, 27, 0.96), rgba(76, 29, 149, 0.92));
    color: #f8fafc;
    border: 1px solid rgba(255, 255, 255, 0.14);
    box-shadow: 0 24px 42px rgba(15, 23, 42, 0.28);
    overflow: hidden;
    position: relative;
  }

  .brand-pane::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(110deg, transparent 20%, rgba(255, 255, 255, 0.08) 38%, transparent 56%);
    transform: translateX(-120%);
    animation: sheen 6.5s ease-in-out infinite;
  }

  .brand-content {
    position: relative;
    z-index: 1;
    padding: 42px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
  }

  .brand-kicker {
    margin: 0 0 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(226, 232, 240, 0.95);
    font-size: 0.78rem;
  }

  .brand-title {
    margin: 0;
    font-size: clamp(1.9rem, 3.3vw, 2.65rem);
    line-height: 1.12;
    letter-spacing: -0.02em;
  }

  .brand-subtitle {
    margin: 16px 0 0;
    color: rgba(226, 232, 240, 0.9);
    max-width: 520px;
    line-height: 1.6;
    font-size: 0.98rem;
  }

  .brand-pills {
    margin-top: 24px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .brand-pills span {
    padding: 8px 12px;
    border: 1px solid rgba(255, 255, 255, 0.22);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    font-size: 0.8rem;
    color: rgba(248, 250, 252, 0.95);
  }

  .brand-preview {
    margin-top: 32px;
    width: min(86%, 420px);
    border-radius: 20px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.24);
    padding: 12px;
    box-shadow: 0 18px 30px rgba(0, 0, 0, 0.24);
    animation: previewFloat 7s ease-in-out infinite;
  }

  .brand-preview img {
    display: block;
    width: 100%;
    object-fit: contain;
  }

  .form-pane {
    display: grid;
    place-items: center;
    padding: 6px;
  }

  .login-card {
    position: relative;
    width: min(100%, 460px);
    border-radius: 24px;
    border: 1px solid rgba(148, 163, 184, 0.28);
    background: rgba(255, 255, 255, 0.8);
    box-shadow: 0 20px 35px rgba(15, 23, 42, 0.15);
    backdrop-filter: blur(12px);
    padding: 28px 22px;
    animation: cardEnter 700ms cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .card-glow {
    position: absolute;
    width: 42%;
    height: 18px;
    border-radius: 999px;
    left: 50%;
    top: 0;
    transform: translate(-50%, -50%);
    background: linear-gradient(90deg, rgba(99, 102, 241, 0.85), rgba(139, 92, 246, 0.82));
    filter: blur(8px);
    opacity: 0.9;
  }

  .card-overline {
    margin: 0;
    text-transform: uppercase;
    font-size: 0.72rem;
    letter-spacing: 0.12em;
    color: #6d28d9;
    font-weight: 700;
  }

  h2 {
    margin: 8px 0 0;
    font-size: clamp(1.5rem, 2.8vw, 2rem);
    color: #0f172a;
    letter-spacing: -0.02em;
  }

  .card-caption {
    margin: 10px 0 0;
    color: #334155;
    line-height: 1.5;
    font-size: 0.93rem;
  }

  .auth-error {
    margin-top: 16px;
    padding: 10px 12px;
    border-radius: 12px;
    border: 1px solid var(--color-danger-border);
    color: var(--color-danger);
    background: color-mix(in srgb, var(--color-danger-muted) 86%, white 14%);
    font-size: 0.92rem;
  }

  .auth-form {
    margin-top: 18px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .form-fields {
    display: flex;
    flex-direction: column;
    gap: 14px;
    animation: fieldsSwap 280ms ease;
  }

  .action-stack {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 2px;
  }

  :global(.submit-btn) {
    width: 100%;
    min-height: 48px;
    font-size: 0.97rem;
    font-weight: 700;
    letter-spacing: 0.01em;
    background: linear-gradient(120deg, #6366f1, #8b5cf6) !important;
    color: #fafafa !important;
    border: none !important;
    box-shadow: 0 12px 22px rgba(99, 102, 241, 0.3) !important;
    transition: transform 180ms ease, box-shadow 180ms ease, filter 180ms ease;
  }

  :global(.submit-btn:hover) {
    transform: translateY(-1px);
    box-shadow: 0 16px 28px rgba(139, 92, 246, 0.3) !important;
    filter: saturate(1.08);
  }

  .switch-link {
    text-align: center;
    color: #4f46e5;
    font-size: 0.93rem;
    font-weight: 600;
    text-decoration: none;
    transition: color 150ms ease;
  }

  .switch-link:hover,
  .switch-link:focus-visible {
    color: #6d28d9;
  }

  .switch-link:focus-visible {
    outline: 2px solid rgba(99, 102, 241, 0.45);
    outline-offset: 3px;
    border-radius: 8px;
  }

  @media (min-width: 860px) {
    .login-layout {
      grid-template-columns: 1.15fr 0.95fr;
      align-items: stretch;
      padding: clamp(12px, 2.4vh, 26px) 20px;
    }

    .brand-pane {
      display: block;
    }

    .login-card {
      padding: 32px 28px;
    }
  }

  @media (max-width: 500px) {
    .login-layout {
      padding: 10px 12px;
    }

    .login-card {
      border-radius: 20px;
      padding: 24px 16px;
    }

    h2 {
      font-size: 1.45rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ambient,
    .bubble,
    .brand-pane::after,
    .brand-preview,
    .login-card,
    .form-fields {
      animation: none !important;
    }

    :global(.submit-btn) {
      transition: none;
    }
  }

  @keyframes floatOrb {
    0%,
    100% {
      transform: translateY(0) scale(1);
    }
    50% {
      transform: translateY(-18px) scale(1.04);
    }
  }

  @keyframes previewFloat {
    0%,
    100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-8px);
    }
  }

  @keyframes bubbleRise {
    0% {
      transform: translate3d(0, 0, 0) scale(0.9);
    }
    20% {
      transform: translate3d(-14px, -20vh, 0) scale(0.98);
    }
    45% {
      transform: translate3d(18px, -44vh, 0) scale(1.04);
    }
    75% {
      transform: translate3d(-16px, -78vh, 0) scale(1.02);
    }
    100% {
      transform: translate3d(22px, -128vh, 0) scale(0.94);
    }
  }

  @keyframes bubblePulse {
    0%,
    100% {
      opacity: 0.46;
      filter: blur(2px);
    }
    50% {
      opacity: 0.72;
      filter: blur(1px);
    }
  }

  @keyframes cardEnter {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes fieldsSwap {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes sheen {
    0%,
    100% {
      transform: translateX(-120%);
    }
    48%,
    60% {
      transform: translateX(120%);
    }
  }
</style>


