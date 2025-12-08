import { backendUrl } from '../../../store/contantsDataNarrator';


export function getMe(userId, token) {
    return fetch(`${backendUrl}/me`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}
