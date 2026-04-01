export const LOADING_INDICATOR_DELAY_MS = 200;

/**
 * Delays visual loading indicators to prevent fast-request flicker.
 * @param {() => void} onReveal
 * @param {number} [delayMs]
 */
export function createLoadingGate(onReveal, delayMs = LOADING_INDICATOR_DELAY_MS) {
  let timer = null;

  return {
    start() {
      this.stop();
      timer = setTimeout(() => {
        timer = null;
        onReveal();
      }, delayMs);
    },
    stop() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    }
  };
}
