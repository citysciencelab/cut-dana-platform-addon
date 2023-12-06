
import {
    mdiCodeJson, mdiFileDocumentOutline, mdiFileExcel, mdiFileImage, mdiFilePdf, mdiLanguageHtml5, mdiLanguageMarkdown,
    mdiNodejs
} from "@mdi/js";

const fileTypes = {
    "html": mdiLanguageHtml5,
    "js": mdiNodejs,
    "json": mdiCodeJson,
    "md": mdiLanguageMarkdown,
    "pdf": mdiFilePdf,
    "png": mdiFileImage,
    "txt": mdiFileDocumentOutline,
    "xls": mdiFileExcel
};


export {
    fileTypes
};

