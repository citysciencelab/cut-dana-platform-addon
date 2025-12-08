import { backendUrl } from '../../../store/contantsDataNarrator';

export function toggleFeatured(storyId, featured) {
    return fetch(`${backendUrl}/stories/${storyId}/featured/${featured}`, {
        method: 'POST'
    });
}
