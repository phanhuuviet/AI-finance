export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastStatePatch {
  message?: string;
  type?: ToastType;
  visible?: boolean;
}

export interface ToastController {
  show: (message: string, type?: ToastType) => void;
  clear: () => void;
}

export function createToastController(
  applyPatch: (patch: ToastStatePatch) => void,
  durationMs = 2800
): ToastController {
  let timer: ReturnType<typeof setTimeout> | null = null;

  function show(message: string, type: ToastType = 'info'): void {
    applyPatch({ message: String(message || ''), type, visible: true });

    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      applyPatch({ visible: false });
      timer = null;
    }, durationMs);
  }

  function clear(): void {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    applyPatch({ visible: false });
  }

  return { show, clear };
}