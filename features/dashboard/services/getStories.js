import {backendUrl} from "../../../store/contantsDataNarrator";

export function getStories (mode) {
    return fetch(`${backendUrl}/stories/${mode}`);
}
