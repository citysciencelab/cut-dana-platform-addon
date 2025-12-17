import { backendUrl } from '../../../store/contantsDataNarrator';

// TODO Probably not needed anymore
export function getMe(token) {
  return fetch(`${backendUrl}/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
}
