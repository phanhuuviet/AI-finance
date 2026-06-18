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
    padding: 8px 4px;
  }

  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--chat-text-muted, var(--text-muted, #8a857e));
    animation: bounce 1.2s ease-in-out infinite;
    display: inline-block;
  }

  @keyframes bounce {
    0%,
    60%,
    100% {
      transform: translateY(0);
      opacity: 0.35;
    }

    30% {
      transform: translateY(-5px);
      opacity: 1;
    }
  }
</style>