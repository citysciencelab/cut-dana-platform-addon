import { backendUrl } from '../../../store/contantsDataNarrator';

export function deleteMe() {
    return fetch(`${backendUrl}/me`, {
        method: 'DELETE'
    });
}
