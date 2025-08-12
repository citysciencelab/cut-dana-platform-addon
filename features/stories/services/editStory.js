import {backendUrl} from "../../../store/contantsDataNarrator";

export function editStory(storyId, story) {
    return fetch(`${backendUrl}/stories/new/${storyId}`, {
        method: "PUT",
        body: JSON.stringify({
            ...story
        })
    });
}
