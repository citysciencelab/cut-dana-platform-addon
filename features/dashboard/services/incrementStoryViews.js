import { backendUrl } from '../../../store/contantsDataNarrator';

export function incrementStoryViews(storyId) {
  return fetch(`${backendUrl}/stories/${storyId}/play`, {
    method: 'POST'
  });
}
