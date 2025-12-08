import {backendUrl} from "../../../store/contantsDataNarrator";

export const createChapter = (storyId, chapterData) => {
    return fetch(`${backendUrl}/stories/${storyId}/chapter`, {
        method: 'POST',
        body: JSON.stringify(chapterData)
    });
}
