import type { ApiResponse, PaginationMeta } from '../../models';
import type { RefreshResponse } from '../../models/auth.model';
import { tokenStorage } from '../../utils/token';
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
import { goto } from '$app/navigation';
import { ROUTES } from '$lib/constants';

const API_URL = import.meta.env.VITE_API_BASE_URL;

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

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
    if (error && typeof error === 'object') {
      const candidate = error as {
        statusCode?: number;
        message?: string;
        data?: unknown;
      };
      const detail = extractErrorDetail(candidate.data);
      if (typeof candidate.statusCode === 'number' || detail || candidate.message) {
        return new ApiError(
          candidate.statusCode ?? 500,
          // Always prefer `data.detail`; never the top-level `message` field.
          detail || 'INTERNAL_SERVER_ERROR',
          candidate.data
        );
      }
    }
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

function rejectRefreshQueue(error: ApiError): never {
  const pending = [...refreshQueue];
  refreshQueue = [];
  for (const resolve of pending) {
    resolve('');
  }
  throw error;
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

function extractErrorDetail(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const detail = (data as { detail?: unknown }).detail;
  return typeof detail === 'string' && detail.trim() ? detail : null;
}

export async function http<T>(
  endpoint: string,
  config: HttpRequestConfig = {}
): Promise<HttpResult<T>> {
  const requestContext = await applyRequestInterceptors({ endpoint, config });
  const resolvedEndpoint = withQuery(requestContext.endpoint, requestContext.config.query);
  const url = `${API_URL}${resolvedEndpoint}`;
  const method = (requestContext.config.method || 'GET').toUpperCase();

  const makeRequest = async (accessToken?: string | null): Promise<Response> => {
    const headers = buildHeaders(requestContext.config);
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    return fetch(url, {
      method: requestContext.config.method || 'GET',
      headers,
      body: toBody(requestContext.config.body),
      signal: requestContext.config.signal
    });
  };

  try {
    let response = await makeRequest(tokenStorage.getAccess());
    let rawPayload = await parseResponse(response);
    let envelope = toEnvelope<T>(rawPayload, response);

    // A 401 from the login/register/refresh endpoints means the submitted
    // credentials were rejected — not that an access token expired. Skip the
    // refresh flow so the real error detail (e.g. "Invalid email or password")
    // propagates instead of a generic "UNAUTHORIZED".
    const isAuthChallengeEndpoint =
      resolvedEndpoint.startsWith('/auth/refresh') ||
      resolvedEndpoint.startsWith('/auth/login') ||
      resolvedEndpoint.startsWith('/auth/register');

    if (response.status === 401 && !isAuthChallengeEndpoint) {
      const refreshToken = tokenStorage.getRefresh();

      if (!refreshToken) {
        tokenStorage.clearTokens();
        goto(ROUTES.LOGIN);
        throw new ApiError(401, 'UNAUTHORIZED', null);
      }

      if (isRefreshing) {
        const nextToken = await new Promise<string>((resolve) => {
          refreshQueue.push(resolve);
        });

        if (!nextToken) {
          throw new ApiError(401, 'SESSION_EXPIRED', null);
        }

        response = await makeRequest(nextToken);
        rawPayload = await parseResponse(response);
        envelope = toEnvelope<T>(rawPayload, response);
      } else {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken })
          });
          const refreshRaw = await parseResponse(refreshRes);
          const refreshEnvelope = toEnvelope<RefreshResponse>(refreshRaw, refreshRes);

          if (!refreshRes.ok || refreshEnvelope.statusCode >= 400 || !refreshEnvelope.data) {
            tokenStorage.clearTokens();
            goto(ROUTES.LOGIN);
            rejectRefreshQueue(new ApiError(401, 'SESSION_EXPIRED', null));
          }

          const { access_token, refresh_token } = refreshEnvelope.data;
          tokenStorage.setTokens(access_token, refresh_token);

          const pending = [...refreshQueue];
          refreshQueue = [];
          for (const resolve of pending) {
            resolve(access_token);
          }

          response = await makeRequest(access_token);
          rawPayload = await parseResponse(response);
          envelope = toEnvelope<T>(rawPayload, response);
        } finally {
          isRefreshing = false;
        }
      }
    }

    if (!response.ok || envelope.statusCode >= 400) {
      // Always surface the backend `data.detail`. The top-level `message`
      // field is never used for display — fall back to a generic code only
      // when `detail` is absent.
      const preferredMessage =
        extractErrorDetail(envelope.data) || 'REQUEST_FAILED';
      throw new ApiError(
        envelope.statusCode || response.status,
        preferredMessage,
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
