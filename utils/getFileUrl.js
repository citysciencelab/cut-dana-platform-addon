import {backendUrl} from "../store/contantsDataNarrator";

export function getFileUrl(titleImage) {
    return `${backendUrl}/files/${titleImage.fileContext}/${titleImage.filename}`;
}
