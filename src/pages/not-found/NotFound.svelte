<script>
  import { goto } from '$app/navigation';
  import { ROUTES } from '$lib/constants/index.js';
</script>

<div class="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
  <h1 class="text-6xl font-bold text-[var(--purple-600,#7C3AED)]">404</h1>
  <p class="text-xl font-medium text-[var(--text-primary)]">Page not found</p>
  <p class="max-w-sm text-sm text-[var(--text-secondary)]">
    The page you are looking for does not exist or you do not have access.
  </p>
  <button
    class="mt-4 rounded-lg bg-[var(--purple-600,#7C3AED)] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--purple-700,#6D28D9)]"
    on:click={() => goto(ROUTES.LOGIN)}
    type="button"
  >
    Go to Login
  </button>
</div>
