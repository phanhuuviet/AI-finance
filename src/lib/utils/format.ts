import { formatRelativeDate as baseFormatRelativeDate } from '$lib/utils/date';

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export function formatRelativeDate(isoString: string): string {
  return baseFormatRelativeDate(isoString);
}
