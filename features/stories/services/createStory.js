import {backendUrl} from "../../../store/contantsDataNarrator";


const createStory = (story) => {
    return fetch(`${backendUrl}/stories`, {
        method: "POST",
        body: JSON.stringify({
            ...story
        })
    });
}
