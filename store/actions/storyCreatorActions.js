import JSZip from "jszip";
import FileSaver from "file-saver";
import axios from "axios";
import {getHTMLContentReference, getStepReference} from "../../utils/getReference.js";
import getDataUrlFromFile from "../../utils/getDataUrlFromFile.js";

const uuid = require("uuid");

/**
 * Adds an HTML file to the temporary HTML contents state
 *
 * @param {Object} context actions context object.
 * @param {Number} parameters.chapterNumber the chapter number to identify the step the HTML content belongs to
 * @param {Number} parameters.stepNumber the step number to identify the step the HTML content belongs to
 * @param {String} parameters.htmlContent the HTML content
 * @param {Array} parameters.htmlContentImages the images in the HTML content
 * @param {String} parameters.previousHtmlReference the previous HTMl reference (for the case that it changed)
 * @returns {String} the HTML file name
 */
function saveHtmlContent (
    {state, commit},
    {
        chapterNumber,
        stepNumber,
        htmlContent,
        htmlContentImages,
        previousHtmlReference
    }
) {
    const htmlContents = {...state.htmlContents},
        htmlContentsImages = {...state.htmlContentsImages},
        htmlReference = getHTMLContentReference(chapterNumber, stepNumber);

    if (previousHtmlReference) {
        delete htmlContents[previousHtmlReference];
        delete htmlContentsImages[previousHtmlReference];
    }

    commit("setHtmlContents", {
        ...htmlContents,
        [htmlReference]: htmlContent
    });
    commit("setHtmlContentsImages", {
        ...htmlContentsImages,
        [htmlReference]: htmlContentImages
    });

    return `${htmlReference}.html`;
}

/**
 * Adds a chapter to the story
 *
 * @param {Object} context actions context object.
 * @param {Object} chapter the chapter to add
 * @param {Number} chapter.chapterNumber the number of the chapter to add
 * @param {String} chapter.chapterTitle the title of the chapter to add
 * @returns {void}
 */
function addStoryChapter ({state, commit}, chapter) {
    const chapters = state.storyConf.chapters,
        newStoryConf = {
            ...state.storyConf,
            chapters: [...chapters, chapter]
        };

    commit("setStoryConf", newStoryConf);
}

/**
 * Saves a step in the storyConf
 *
 * @param {Object} context actions context object.
 * @param {Object} parameters.step the step to update
 * @param {Object} parameters.previousStepReference the reference to the step in state (if already exists)
 * @returns {void}
 */
function saveStoryStep ({state, commit}, {previousStepReference, step}) {
    const steps = state.storyConf.steps.filter(
            ({associatedChapter, stepNumber}) => !previousStepReference ||
                previousStepReference !==
                getStepReference(associatedChapter, stepNumber)
        ),
        // Sort steps by chapter number then by step number
        sortedNewSteps = [...steps, step].sort(
            (stepA, stepB) => (stepA.associatedChapter > stepB.associatedChapter) -
                (stepA.associatedChapter < stepB.associatedChapter) ||
                (stepA.stepNumber > stepB.stepNumber) -
                (stepA.stepNumber < stepB.stepNumber)
        ),
        newStoryConf = {
            ...state.storyConf,
            steps: sortedNewSteps
        };

    commit("setStoryConf", newStoryConf);
}

/**
 * Deletes a step from the storyConf
 * Deletes the associated chapter if it's not used anymore
 *
 * @param {Object} context actions context object.
 * @param {Number} parameters.associatedChapter the chapter of the step to delete
 * @param {Number} parameters.stepNumber the number of the step to delete
 * @returns {void}
 */
function deleteStoryStep ({state, commit}, {associatedChapter, stepNumber}) {
    const newSteps = state.currentStory.steps.filter(
            step => associatedChapter !== step.associatedChapter ||
                stepNumber !== step.stepNumber
        ),
        chapterIsNotUsedAnymore = !newSteps.some(
            step => step.associatedChapter === associatedChapter
        ),
        newChapters = chapterIsNotUsedAnymore
            ? state.currentStory.chapters.filter(
                ({chapterNumber}) => chapterNumber !== associatedChapter
            )
            : state.currentStory.chapters;

    commit("setCurrentStory", {
        ...state.currentStory,
        chapters: newChapters,
        steps: newSteps
    });
}

/**
 * Collects all files needed for the created story and downloads them as zip
 *
 * @param {Object} context actions context object.
 * @returns {void}
 */
function downloadStoryFiles ({state}) {
    const zip = new JSZip(),
        htmlContents = Object.entries(state.htmlContents),
        storyConf = {...state.storyConf};

    // Add all HTML files used in the story to the story folder
    if (htmlContents.length) {
        const htmlFolder = "story";

        // Create a folder for the html files
        zip.folder(htmlFolder);
        storyConf.htmlFolder = htmlFolder;

        for (const htmlContent of htmlContents) {
            const stepReference = htmlContent[0],
                images = state.htmlContentsImages[stepReference] || [],
                imageFolder = `${htmlFolder}/images`,
                [htmlAssociatedChapter, htmlStepNumber] = stepReference
                    .split(".")
                    .map(Number),
                htmlFilePath = `${htmlFolder}/${stepReference}.html`;
            let html = htmlContent[1];

            // Create a folder for the image files
            if (images.length) {
                zip.folder(imageFolder);
            }

            // Add image files
            for (const [imageIndex, image] of images.entries()) {
                const imageNumber = imageIndex + 1,
                    imageFilePath = `${htmlFolder}/images/${stepReference}_${imageNumber}.${image.fileExtension}`;

                zip.file(
                    imageFilePath,
                    image.dataUrl.replace(/data:.+?base64,/, ""),
                    {base64: true}
                );

                // Replace the image src in the HTML with a relative path to the image
                html = html.replace(image.dataUrl, `assets/${imageFilePath}`);
            }

            // Update HTML file name in the storyConf
            storyConf.steps = storyConf.steps.map(step => {
                if (
                    step.associatedChapter !== htmlAssociatedChapter ||
                    step.stepNumber !== htmlStepNumber
                ) {
                    return step;
                }

                return {step, htmlFile: htmlFilePath};
            });

            // Add HTML file
            zip.file(htmlFilePath, html);
        }
    }

    // Add the story.json file with the configuration for the story
    zip.file("story.json", JSON.stringify(storyConf));

    zip.generateAsync({type: "blob"}).then(content => {
        FileSaver.saveAs(content, "story.zip");
    });
}

/**
 * Parses a step reference to an array with the major and minor step
 * @param {String} stepReference the step reference to parse
 * @returns {String[]} array with major and minor step "step_1-2" => ["1", "2"]
 */
function parseStepReference (stepReference) {
    const step = stepReference.split("_")[1].split("-");

    return step;
}

/**
 * Posts the HTML content of a step to the backend
 * @param {String} backendUrl the url of the backend
 * @param {String} htmlContent the html content of the step
 * @param {Number} storyID the id of the story
 * @returns {void}
 */
function postStoryHtmlContent (backendUrl, htmlContent, storyID) {
    const step = parseStepReference(htmlContent[0]),
        query_url = backendUrl + "add/step/" + storyID + "/" + step[0] + "/" + step[1];

    // htmlContent[1] = htmlContent[1].replace(image.dataUrl, `FILE PATH TBD`);
    axios.post(query_url, {
        html: htmlContent[1]
    }).then(() => {
        // console.log(response);
    }).catch(function (error) {
        errorHandling(error);
    });
}

/**
 * Converts a base64 string to a file
 * @param {String} dataurl base64 string
 * @param {String} filename the name of the file
 * @returns {File} the file
 */
function dataURLtoFile (dataurl, filename) {
    const arr = dataurl.split(","),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]);
    let n = bstr.length;

    /* eslint-disable one-var */
    // It depends on previous code, so it's not possible to move it to the top
    const u8arr = new Uint8Array(n);
    /* eslint-enable */

    while (n) {
        u8arr[n - 1] = bstr.charCodeAt(n - 1);
        n -= 1; // to make eslint happy
    }
    return new File([u8arr], filename, {type: mime});
}

/**
 * Uploads an image to the backend
 * @param {String} backendUrl the url of the backend
 * @param {String} image_dataURL the image as base64 string
 * @param {String} stepReference the step reference for the query url
 * @param {Number} storyID the id of the story
 * @param {String} imageID the id of the image
 * @returns {Promise} returns a promise that resolves when the image is uploaded
 */
function postStoryImage (backendUrl, image_dataURL, stepReference, storyID, imageID) {
    const step = parseStepReference(stepReference),
        query_url = backendUrl + "add/step/" + storyID + "/" + step[0] + "/" + step[1] + "/" + imageID + "/image",
        // generate file from base64 string
        file = dataURLtoFile(image_dataURL),
        // put file into form data
        data = new FormData(),
        config = {
            headers: {"Content-Type": "multipart/form-data"}
        };

    data.append("image", file, file.name);

    // now upload
    axios.post(query_url, data, config).then(response => {
        return response;
    });
}

function prepareImageArray (htmlContents) {

}


/**
 * Collects all files needed for the created story and uploads them to the story backend
 *
 * @param {Object} context actions context object.
 * @returns {Promise} returns a promise that resolves when all files are uploaded
 */
async function uploadStoryFiles ({state, commit}) {

    const htmlContents = Object.entries(state.htmlContents),
        images = state.htmlContentsImages,
        storyConf = {...state.storyConf},
        imageArray = [],
        backendUrl = state.backendConfig.url;


    for (const htmlContent of htmlContents) {
        if (Object.hasOwn(images, htmlContent[0])) {
            for (const image of images[htmlContent[0]]) {
                const imageID = new Date().valueOf() + "_" + uuid.v4();

                image.imageId = imageID;
                image.stepRef = htmlContent[0];
                htmlContent[1] = htmlContent[1].replaceAll(image.dataUrl, imageID);
                imageArray.push(image);
            }
        }
    }

    // Add title image to image array
    if (state.storyConf.titleImage) {
        const imageID = new Date().valueOf() + "_" + uuid.v4(),
            titleImage = {},
            dataUrl = await getDataUrlFromFile(state.storyConf.titleImage);

        titleImage.imageId = imageID;
        titleImage.fileExtension = state.storyConf.titleImage.type;
        titleImage.stepRef = "step_0-0";
        titleImage.dataUrl = dataUrl;
        imageArray.push(titleImage);
        storyConf.titleImage = imageID;
    }


    // Just to be sure
    storyConf.storyID = null;

    let storyID;

    // Add story and get current storyID back from server
    return axios.post(backendUrl + "story", storyConf).then((response) => {
        // store story ID to state
        commit("setStoryConf", {
            ...state.storyConf,
            storyID: response.data.storyID
        });
        storyID = response.data.storyID;
    }).then(() => {
        // Step 2 - upload each step's html content
        for (const htmlContent of htmlContents) {
            postStoryHtmlContent(backendUrl, htmlContent, storyID);
        }
    }).then(() => {
        for (const image of imageArray) {
            postStoryImage(backendUrl, image.dataUrl, image.stepRef, storyID, image.imageId);
        }
    }).then(() => {
        return "storyID";
    }).catch(function (error) {
        errorHandling(error);
        return error;
    });
}

/**
 * Defines how to handle and log errors
 *
 * @param {Object} error error object.
 * @returns {void}
 */
function errorHandling (error) {
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error(error.response.data);
        console.error(error.response.status);
        console.error(error.response.headers);
    }
    else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.error(error.request);
    }
    else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error", error.message);
    }
    console.error(error.config);
}

export default {
    saveHtmlContent,
    addStoryChapter,
    saveStoryStep,
    deleteStoryStep,
    downloadStoryFiles,
    uploadStoryFiles
};
