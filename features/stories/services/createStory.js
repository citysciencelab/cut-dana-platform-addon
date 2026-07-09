import { backendUrl } from '../../../store/contantsDataNarrator';

export function createStory(story) {
  const {id, storyId, ...storyWithoutIds} = story ?? {};

  return fetch(`${backendUrl}/stories/new`, {
    method: 'POST',
    body: JSON.stringify({
      ...storyWithoutIds
    })
  });
}
