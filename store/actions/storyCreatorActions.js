import JSZip from "jszip";
import FileSaver from "file-saver";
import axios from "axios";
import uuid from "uuid";

import {getHTMLContentReference} from "../../utils/getReference.js";
import getDataUrlFromFile from "../../utils/getDataUrlFromFile.js";


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
function saveStoryStep ({state, commit}, {step, images}) {
    // remove old step if it exists
    let steps = state.currentStory.steps.filter(({_id}) => _id !== step._id);

    const newImages = {...state.htmlContentsImages},
        duplicatedStepNumber = steps.find(candidate => candidate.associatedChapter === step.associatedChapter &&
            candidate.stepNumber === step.stepNumber
        );

    // Check if the step with same number and chapter already exists
    if (duplicatedStepNumber) {
        // move the step numbers of the following steps up
        steps = steps.map(candidate => {
            if (candidate.associatedChapter === step.associatedChapter && candidate.stepNumber >= step.stepNumber) {
                return {...candidate, stepNumber: candidate.stepNumber + 1};
            }
            return candidate;
        });
    }
    // sort all steps by chapter and step number
    steps = [...steps, step].sort(
        (stepA, stepB) => (stepA.associatedChapter > stepB.associatedChapter) -
            (stepA.associatedChapter < stepB.associatedChapter) ||
            (stepA.stepNumber > stepB.stepNumber) -
            (stepA.stepNumber < stepB.stepNumber)
    );

    newImages[step._id] = images;

    commit("setCurrentStory", {...state.currentStory, steps: steps});
    commit("setHtmlContentsImages", newImages);
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
function deleteStoryStep ({state, commit}, {step}) {
    const newSteps = state.currentStory.steps.filter(
            current => current.associatedChapter !== step.associatedChapter ||
                        current.stepNumber !== step.stepNumber
        ),
        chapterIsNotUsedAnymore = !newSteps.some(
            current => step.associatedChapter === current.associatedChapter
        ),
        newChapters = chapterIsNotUsedAnymore
            ? state.currentStory.chapters.filter(
                ({chapterNumber}) => chapterNumber !== step.associatedChapter
            )
            : state.currentStory.chapters;

    if (state.htmlContentsImages[step._id]) {
        const newHtmlContentsImages = {...state.htmlContentsImages};

        delete newHtmlContentsImages[step._id];
        commit("setHtmlContentsImages", newHtmlContentsImages);
    }

    commit("setCurrentStory", {
        ...state.currentStory,
        chapters: newChapters,
        steps: newSteps
    });
}

/**
 * Adjust step numbers after deleting a step
 *
 * @param {Object} context actions context object.
 * @param {Number} parameters.associatedChapter the chapter of the step to delete
 * @param {Number} parameters.stepNumber the number of the step to delete
 * @returns {void}
 */
function adjustStepNumbers ({state, commit}, {associatedChapter, stepNumber}) {
    const newSteps = state.currentStory.steps.map(step => {
        if (associatedChapter === step.associatedChapter && stepNumber < step.stepNumber) {
            return {...step, stepNumber: step.stepNumber - 1};
        }
        return step;
    });

    commit("setCurrentStory", {...state.currentStory, steps: newSteps});
}

/**
 * Collects all files needed for the created story and downloads them as zip
 *
 * @param {Object} context actions context object.
 * @returns {void}
 */
function downloadStoryFiles ({state}) {
    const zip = new JSZip(),
        // Compatability with old stories
        storyConf = {...state.currentStory},
        htmlContents = state.currentStory.steps.reduce(function (result, step) {
            const reference = getHTMLContentReference(step.associatedChapter, step.stepNumber);

            result[reference] = step.html;
            return result;
        }, {});


    // Add all HTML files used in the story to the story folder
    if (Object.keys(htmlContents).length > 0) {
        const htmlFolder = "story";


        // Create a folder for the html files
        zip.folder(htmlFolder);
        storyConf.htmlFolder = htmlFolder;

        for (const [stepReference, htmlContent] of Object.entries(htmlContents)) {
            const images = state.htmlContentsImages[stepReference] || [],
                imageFolder = `${htmlFolder}/images`,
                [htmlAssociatedChapter, htmlStepNumber] = stepReference
                    .split(".")
                    .map(Number),
                htmlFilePath = `${htmlFolder}/${stepReference}.html`;
            let html = htmlContent;

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
 * Prepare html and images inside for upload
 * @param {Object} story the story
 * @param {Array} images Array of images
 * @returns {Array} returns the updated steps
 */
function prepareHtml (story, images) {
    const imageArray = [];

    story.steps = story.steps.map((step) => {
        let html = step.html;

        if (Object.hasOwn(images, step._id) && images[step._id]?.length > 0) {
            const stepRef = getHTMLContentReference(step.associatedChapter, step.stepNumber);

            for (const image of images[step._id]) {
                const imageId = new Date().valueOf() + "_" + uuid.v4();

                image.imageId = imageId;
                image.stepRef = stepRef;
                imageArray.push(image);
                html = html.replaceAll(image.dataUrl, imageId);
            }
        }
        step.html = html;
        delete step._id;
        return step;
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

        [story, imageArray] = prepareHtml({...state.currentStory}, state.htmlContentsImages);

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

        if (state.currentStory.titleImage && typeof state.currentStory.titleImage !== "string") {
            const imageId = new Date().valueOf() + "_" + uuid.v4();

            getDataUrlFromFile(state.currentStory.titleImage).then((dataUrl) => {
                imageUploads.push(postStoryImage(backendUrl, dataUrl, "step_0-0", storyId, imageId));
            });
        }
        return Promise.all(imageUploads);
    });
}

export default {
    addStoryChapter,
    saveStoryStep,
    deleteStoryStep,
    adjustStepNumbers,
    downloadStoryFiles,
    uploadStoryFiles
};
