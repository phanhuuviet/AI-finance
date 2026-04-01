import { ApiError } from '../../utils/error';
import { addRequestInterceptor } from './request';
import { addErrorInterceptor, addResponseInterceptor } from './response';

let initialized = false;

export function initializeApiInterceptors(): void {
  if (initialized) return;

  // Inject auth token for all HTTP requests.
  addRequestInterceptor((context) => {
    const token = localStorage.getItem('token');
    return {
      ...context,
      config: {
        ...context.config,
        headers: {
          ...(context.config.headers || {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      }
    };
  });

  // Reserved for global response transformations.
  addResponseInterceptor((context) => context);

  // Centralize auth failure behavior.
  addErrorInterceptor((error) => {
    if (error.status === 401) {
      localStorage.removeItem('token');
    }
    return error instanceof ApiError ? error : new ApiError(error.message, error.status, error.details);
  });

  initialized = true;
}
