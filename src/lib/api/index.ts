import { initializeApiInterceptors } from './base/interceptor';

initializeApiInterceptors();

export { http } from './base/http';
export { authApi } from './modules/auth.api';
export { userApi } from './modules/user.api';
export { chatApi } from './modules/chat.api';
export { documentApi } from './modules/document.api';
export { dashboardApi } from './modules/dashboard.api';
export { generationApi } from './modules/generation.api';
export { compositionApi } from './modules/composition.api';
export { sessionApi } from './modules/session.api';
