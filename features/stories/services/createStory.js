import { backendUrl } from '../../../store/contantsDataNarrator';

export function createStory(story) {
  const { id, storyId, ...storyWithoutIds } = story ?? {};
  // eslint-disable-next-line no-unused-vars
  void id;
  // eslint-disable-next-line no-unused-vars
  void storyId;

  return fetch(`${backendUrl}/stories/new`, {
    method: 'POST',
    body: JSON.stringify({
      ...storyWithoutIds
    })
  });
}
