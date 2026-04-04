import { ApiError } from './http';
import { addRequestInterceptor } from './request';
import { addErrorInterceptor, addResponseInterceptor } from './response';

let initialized = false;

export function initializeApiInterceptors(): void {
  if (initialized) return;

  addRequestInterceptor((context) => context);

  // Reserved for global response transformations.
  addResponseInterceptor((context) => context);

  addErrorInterceptor((error) => {
    return error instanceof ApiError ? error : ApiError.fromUnknown(error);
  });

  initialized = true;
}
