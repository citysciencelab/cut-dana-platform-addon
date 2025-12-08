import {backendUrl} from "../../../store/contantsDataNarrator";

export function createStory(story) {
    return fetch(`${backendUrl}/stories/new`, {
        method: "POST",
        body: JSON.stringify({
            ...story
        })
    });
}
