import { backendUrl } from '../../../store/contantsDataNarrator';

export async function copyStory(storyId) {
  const res = await fetch(`${backendUrl}/stories/new/${storyId}/copy`, {
    method: 'POST',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to copy story: ${res.status} ${text}`);
  }

  return res.json();
}
