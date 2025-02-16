import {backendUrl} from "../../../store/contantsDataNarrator";


export function uploadCoverImage(storyId, token, coverImage) {
    const formData = new FormData();
    formData.append("files", coverImage);

    return fetch(`${backendUrl}/stories/${storyId}/cover`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
        },
        body: formData
    });
}
