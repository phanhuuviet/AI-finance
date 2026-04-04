import type { ApiResponse, PaginationMeta } from '../../models';
import {
  resolveMockFallback,
  USE_MOCK_FALLBACK
} from '../mock/mock.registry';
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

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public override message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static fromUnknown(error: unknown): ApiError {
    if (error instanceof ApiError) return error;
    if (error instanceof Error) {
      return new ApiError(500, error.message || 'INTERNAL_SERVER_ERROR', error);
    }
    return new ApiError(500, 'INTERNAL_SERVER_ERROR', error);
  }
}

export interface HttpResult<T> {
  data: T;
  pagination?: PaginationMeta;
}

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

function isApiResponse<T>(payload: unknown): payload is ApiResponse<T> {
  if (!payload || typeof payload !== 'object') return false;
  const candidate = payload as Partial<ApiResponse<T>>;
  return typeof candidate.statusCode === 'number' && typeof candidate.message === 'string';
}

function toEnvelope<T>(payload: unknown, response: Response): ApiResponse<T> {
  if (isApiResponse<T>(payload)) {
    return payload;
  }

  return {
    statusCode: response.status,
    message: response.ok ? 'SUCCESS' : 'REQUEST_FAILED',
    data: payload as T
  };
}

export async function http<T>(
  endpoint: string,
  config: HttpRequestConfig = {}
): Promise<HttpResult<T>> {
  const requestContext = await applyRequestInterceptors({ endpoint, config });
  const resolvedEndpoint = withQuery(requestContext.endpoint, requestContext.config.query);
  const url = `${API_URL}${resolvedEndpoint}`;
  const method = (requestContext.config.method || 'GET').toUpperCase();

  try {
    const response = await fetch(url, {
      method: requestContext.config.method || 'GET',
      headers: buildHeaders(requestContext.config),
      body: toBody(requestContext.config.body),
      signal: requestContext.config.signal
    });

    const rawPayload = await parseResponse(response);
    const envelope = toEnvelope<T>(rawPayload, response);

    if (!response.ok || envelope.statusCode >= 400) {
      throw new ApiError(
        envelope.statusCode || response.status,
        envelope.message || 'REQUEST_FAILED',
        envelope.data
      );
    }

    const intercepted = await applyResponseInterceptors<HttpResult<T>>({
      endpoint: requestContext.endpoint,
      response,
      data: {
        data: envelope.data as T,
        pagination: envelope.pagination
      }
    });

    return intercepted.data;
  } catch (error) {
    const normalized = ApiError.fromUnknown(error);

    if (USE_MOCK_FALLBACK) {
      const mocked = await resolveMockFallback<T>(
        method,
        resolvedEndpoint,
        requestContext.config,
        normalized
      );
      if (mocked !== undefined) {
        return { data: mocked };
      }
    }

    const interceptedError = await applyErrorInterceptors(normalized);
    throw interceptedError;
  }
}

export type { HttpRequestConfig, HttpRequestContext };
