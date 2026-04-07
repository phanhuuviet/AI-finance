declare module '$app/stores' {
  import type { Readable } from 'svelte/store';

  export const page: Readable<{
    params: Record<string, string>;
    url?: URL;
  }>;
}

declare module '$app/navigation' {
  export function goto(href: string, opts?: Record<string, unknown>): Promise<void>;
}
