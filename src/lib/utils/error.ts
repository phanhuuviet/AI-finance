import { ApiError } from '../api/base/http';

export { ApiError };

export function toApiError(error: unknown): ApiError {
  return ApiError.fromUnknown(error);
}
