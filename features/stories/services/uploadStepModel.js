import { backendUrl } from '../../../store/contantsDataNarrator';

export async function uploadStepModel(storyId, stepId, file, entityId = null) {
  const form = new FormData();
  form.append('files', file);

  const url = entityId
    ? `${backendUrl}/stories/${storyId}/steps/${stepId}/model?entityId=${encodeURIComponent(entityId)}`
    : `${backendUrl}/stories/${storyId}/steps/${stepId}/model`;

  const resp = await fetch(url, {
    method: 'POST',
    body: form,
    headers: { 'Content-Type': null }, // removes interceptor's application/json so browser sets correct multipart boundary
  });

  const bodyText = await resp.text();

  if (!resp.ok) {
    throw new Error(bodyText);
  }
  return JSON.parse(bodyText);
}
