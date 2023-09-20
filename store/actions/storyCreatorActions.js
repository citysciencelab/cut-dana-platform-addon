import JSZip from "jszip";
import FileSaver from "file-saver";
import axios from "axios";
import {getHTMLContentReference, getStepReference} from "../../utils/getReference.js";
import getDataUrlFromFile from "../../utils/getDataUrlFromFile.js";
import {request} from "backbone.radio";

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
    const chapters = state.currentStory.chapters,
        newStory = {
            ...state.currentStory,
            chapters: [...chapters, chapter]
        };

    commit("setCurrentStory", newStory);
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
    const steps = state.currentStory.steps.filter(
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
        newStory = {
            ...state.currentStory,
            steps: sortedNewSteps
        };

    commit("setCurrentStory", newStory);
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
 * @returns {Integer[]} array with major and minor step "step_1-2" => [1, 2]
 */
function parseStepReference (stepReference) {
    const step = stepReference.split("_")[1].split("-");

    return [parseInt(step[0], 10), parseInt(step[1], 10)];
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
        query_url = backendUrl + "images/" + storyID + "/" + step[0] + "/" + step[1] + "/" + imageID,
        // generate file from base64 string
        file = dataURLtoFile(image_dataURL),
        // put file into form data
        data = new FormData(),
        config = {
            headers: {"Content-Type": "multipart/form-data"}
        };

    data.append("image", file, file.name);

    // return promise
    return axios.post(query_url, data, config);
}

/**
 * Add html to specific step
 * @param {Array} steps Array of steps
 * @param {String} stepReference the step reference for the query url
 * @param {String} htmlContent the html content of the step
 * @returns {Array} returns the updated steps
 */
function copyHtml (steps, stepReference, htmlContent) {
    const [htmlAssociatedChapter, htmlStepNumber] = parseStepReference(stepReference);

    return steps.map((step) => {
        const newStep = {...step};

        if (
            step.associatedChapter === htmlAssociatedChapter &&
            step.stepNumber === htmlStepNumber
        ) {
            newStep.html = htmlContent;
        }
        return newStep;
    });
}


/**
 * Prepare html and images inside for upload
 * @param {Object} story the story
 * @param {Array} htmlContents Array of html contents
 * @param {Array} images Array of images
 * @returns {Array} returns the updated steps
 */
function prepareHtml (story, htmlContents, images) {
    const imageArray = [];

    Object.entries(htmlContents).forEach(([stepReference, htmlContent]) => {
        let html = htmlContent;

        if (Object.hasOwn(images, stepReference)) {
            for (const image of images[stepReference]) {
                const imageId = new Date().valueOf() + "_" + uuid.v4();

                image.imageId = imageId;
                image.stepRef = stepReference;
                imageArray.push(image);
                html = html.replaceAll(image.dataUrl, imageId);
            }
        }
        story.steps = copyHtml(story.steps, stepReference, html);
    });
    return [story, imageArray];
}


/**
 * Collects all files needed for the created story and uploads them to the story backend
 *
 * @param {Object} context actions context object.
 * @returns {Promise} returns a promise that resolves when all files are uploaded
 */
function uploadStoryFiles ({state}) {

    const backendUrl = state.backendConfig.url,
        requestConf = {url: backendUrl + "stories"},

        [story, imageArray] = prepareHtml({...state.currentStory}, state.htmlContents, state.htmlContentsImages);

    // If it's string, than it was uploaded previously and we have to keep it
    // otherwise, new titleImage should be uploaded
    if (typeof story.titleImage !== "string") {
        delete story.titleImage;
    }

    requestConf.data = story;
    let storyId = state.currentStoryId;

    if (storyId) {
        requestConf.url += "/" + storyId;
        requestConf.method = "patch";
    }
    else {
        requestConf.method = "post";
    }

    // Add story and get current storyID back from server
    return axios(requestConf).then((response) => {
        // Save entire story
        storyId ||= response.data.storyId;
    }).then(() => {
        // Upload and replace images in story
        const imageUploads = imageArray.map((image) => {
            // Images in steps
            return postStoryImage(backendUrl, image.dataUrl, image.stepRef, storyId, image.imageId);
        });

        if (state.currentStory.titleImage) {
            const imageId = new Date().valueOf() + "_" + uuid.v4();

            getDataUrlFromFile(state.currentStory.titleImage).then((dataUrl) => {
                imageUploads.push(postStoryImage(backendUrl, dataUrl, "step_0-0", storyId, imageId));
            });
        }
        return Promise.all(imageUploads);
    });
}

export default {
    saveHtmlContent,
    addStoryChapter,
    saveStoryStep,
    deleteStoryStep,
    downloadStoryFiles,
    uploadStoryFiles
};
