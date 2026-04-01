import { initializeApiInterceptors } from './base/interceptor';

initializeApiInterceptors();

export { http } from './base/http';
export { authApi } from './modules/auth.api';
export { userApi } from './modules/user.api';
export { chatApi } from './modules/chat.api';
export { dashboardApi } from './modules/dashboard.api';
