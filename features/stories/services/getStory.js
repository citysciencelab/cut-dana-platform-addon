import { backendUrl } from '../../../store/contantsDataNarrator';

export async function getStory(id) {
  const res  = await fetch(`${backendUrl}/stories/new/${id}`);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to load story ${id}: ${res.status} ${text}`);
  }
  return res.json();
}
