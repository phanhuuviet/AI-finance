import { navigate as routeNavigate } from '../../stores/router.js';

export function navigate(path: string): void {
  routeNavigate(path);
}
