export interface HttpRequestConfig {
  method?: string;
  headers?: Record<string, string>;
  body?: BodyInit | object | null;
  query?: Record<string, string | number | boolean | null | undefined>;
  signal?: AbortSignal;
}

export interface HttpRequestContext {
  endpoint: string;
  config: HttpRequestConfig;
}

export type RequestInterceptor = (
  context: HttpRequestContext
) => HttpRequestContext | Promise<HttpRequestContext>;

const requestInterceptors: RequestInterceptor[] = [];

export function addRequestInterceptor(interceptor: RequestInterceptor): void {
  requestInterceptors.push(interceptor);
}

export async function applyRequestInterceptors(
  context: HttpRequestContext
): Promise<HttpRequestContext> {
  let current = context;
  for (const interceptor of requestInterceptors) {
    current = await interceptor(current);
  }
  return current;
}
