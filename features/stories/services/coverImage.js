import { backendUrl } from '../../../store/contantsDataNarrator';

export function uploadCoverImage(storyId, coverImage) {
  const formData = new FormData();
  formData.append('files', coverImage);

  return fetch(`${backendUrl}/stories/${storyId}/cover`, {
    method: 'POST',
    body: formData
  });
}

export function deleteCoverImage(storyId) {
  return fetch(`${backendUrl}/stories/${storyId}/cover`, {
    method: 'DELETE',
  });
}
