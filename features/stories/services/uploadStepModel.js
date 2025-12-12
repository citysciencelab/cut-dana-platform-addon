import { backendUrl } from '../../../store/contantsDataNarrator';

export async function uploadStepModel(storyId, stepId, file) {
    const form = new FormData();
    form.append('files', file);

    const resp = await fetch(
        `${backendUrl}/stories/${storyId}/steps/${stepId}/model`, {
            method: 'POST',
            body: form,
            headers: {
                'Content-Type': null,
            },
        });
    if (!resp.ok) {
        throw new Error(await resp.text());
    }
    return resp.json();
}
