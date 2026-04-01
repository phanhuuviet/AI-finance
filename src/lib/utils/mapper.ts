export function mapResponse<T>(value: unknown): T {
  return value as T;
}

export function mapArrayResponse<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}
