import { navigate } from '../stores/router.js';

export async function goto(path: string): Promise<void> {
  navigate(path);
}
