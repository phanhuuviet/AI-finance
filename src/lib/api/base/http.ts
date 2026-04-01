import { ApiError, toApiError } from '../../utils/error';
import {
  applyRequestInterceptors,
  type HttpRequestConfig,
  type HttpRequestContext
} from './request';
import {
  applyErrorInterceptors,
  applyResponseInterceptors
} from './response';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function withQuery(
  endpoint: string,
  query?: HttpRequestConfig['query']
): string {
  if (!query) return endpoint;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${endpoint}?${qs}` : endpoint;
}

function toBody(body: HttpRequestConfig['body']): BodyInit | undefined {
  if (body === undefined || body === null) return undefined;
  if (body instanceof FormData || typeof body === 'string') return body;
  return JSON.stringify(body);
}

function buildHeaders(config: HttpRequestConfig): Record<string, string> {
  const headers = { ...(config.headers || {}) };
  if (!(config.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

async function parseResponse(response: Response): Promise<unknown> {
  if (response.status === 204) return null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

export async function http<T>(
  endpoint: string,
  config: HttpRequestConfig = {}
): Promise<T> {
  const requestContext = await applyRequestInterceptors({ endpoint, config });
  const url = `${API_URL}${withQuery(requestContext.endpoint, requestContext.config.query)}`;

  try {
    const response = await fetch(url, {
      method: requestContext.config.method || 'GET',
      headers: buildHeaders(requestContext.config),
      body: toBody(requestContext.config.body),
      signal: requestContext.config.signal
    });

    const data = await parseResponse(response);

    if (!response.ok) {
      const detail =
        typeof data === 'object' && data !== null && 'detail' in data
          ? (data as Record<string, unknown>).detail
          : undefined;
      throw new ApiError(String(detail || 'API request failed'), response.status, data);
    }

    const intercepted = await applyResponseInterceptors<T>({
      endpoint: requestContext.endpoint,
      response,
      data: data as T
    });

    return intercepted.data;
  } catch (error) {
    const normalized = toApiError(error);
    const interceptedError = await applyErrorInterceptors(normalized);
    throw interceptedError;
  }
}

export type { HttpRequestConfig, HttpRequestContext };
