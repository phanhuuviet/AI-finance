<script>
  export let className = "";
  export let rounded = "rounded-md";
</script>

<div
  class={`relative overflow-hidden bg-gray-200 ${rounded} ${className}`}
  aria-hidden="true"
>
  <div class="absolute inset-0 skeleton-shimmer"></div>
</div>

<style>
  .skeleton-shimmer {
    transform: translateX(-100%);
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.55) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    animation: shimmer 1.1s ease-in-out infinite;
  }

  @keyframes shimmer {
    to {
      transform: translateX(100%);
    }
  }
</style>
