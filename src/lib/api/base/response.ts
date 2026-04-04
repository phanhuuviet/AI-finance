import type { ApiError } from './http';

export interface HttpResponseContext<T = unknown> {
  endpoint: string;
  response: Response;
  data: T;
}

export type ResponseInterceptor = <T>(
  context: HttpResponseContext<T>
) => HttpResponseContext<T> | Promise<HttpResponseContext<T>>;

export type ErrorInterceptor = (
  error: ApiError
) => ApiError | Promise<ApiError>;

const responseInterceptors: ResponseInterceptor[] = [];
const errorInterceptors: ErrorInterceptor[] = [];

export function addResponseInterceptor(interceptor: ResponseInterceptor): void {
  responseInterceptors.push(interceptor);
}

export function addErrorInterceptor(interceptor: ErrorInterceptor): void {
  errorInterceptors.push(interceptor);
}

export async function applyResponseInterceptors<T>(
  context: HttpResponseContext<T>
): Promise<HttpResponseContext<T>> {
  let current = context;
  for (const interceptor of responseInterceptors) {
    current = await interceptor(current);
  }
  return current;
}

export async function applyErrorInterceptors(error: ApiError): Promise<ApiError> {
  let current = error;
  for (const interceptor of errorInterceptors) {
    current = await interceptor(current);
  }
  return current;
}
