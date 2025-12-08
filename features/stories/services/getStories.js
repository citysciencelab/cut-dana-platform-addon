import { backendUrl } from '../../../store/contantsDataNarrator';


export function getStories() {
    return fetch(`${backendUrl}/stories`);
}
