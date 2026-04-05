<div class="typing-bubble">
  <span class="dot" style="animation-delay: 0ms;"></span>
  <span class="dot" style="animation-delay: 160ms;"></span>
  <span class="dot" style="animation-delay: 320ms;"></span>
</div>

<style>
  .typing-bubble {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 12px 16px;
    background: var(--bg-card, #ffffff);
    border: 1px solid var(--border-purple, #ddd6fe);
    border-radius: 0 12px 12px 12px;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--purple-400, #a78bfa);
    animation: bounce 1.2s ease-in-out infinite;
    display: inline-block;
  }

  @keyframes bounce {
    0%,
    60%,
    100% {
      transform: translateY(0);
      opacity: 0.4;
    }

    30% {
      transform: translateY(-6px);
      opacity: 1;
    }
  }
</style>