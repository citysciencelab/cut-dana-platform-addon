import { backendUrl } from '../../../store/contantsDataNarrator';

export function publishStory(storyId, isDraft) {
    return fetch(`${backendUrl}/stories/new/${storyId}/publish-state`, {
        method: 'PUT',
        body: JSON.stringify({ isDraft }),
    });
}
