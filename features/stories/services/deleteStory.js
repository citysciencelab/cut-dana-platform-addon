import {backendUrl} from "../../../store/contantsDataNarrator";

export const deleteStory = async (toDeleteStoryId) => {
    return await fetch(`${backendUrl}/stories/${toDeleteStoryId}`, {
        method: "DELETE"
    });
}
