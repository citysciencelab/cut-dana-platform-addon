import JSZip from "jszip";
import FileSaver from "file-saver";
import axios from "axios";
import uuid from "uuid";

import {getHTMLContentReference} from "../../utils/getReference.js";
import getDataUrlFromFile from "../../utils/getDataUrlFromFile.js";
import dataURLtoFile from "../../utils/dataURLtoFile.js";


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
                html = html.replace(image.dataUrl, imageFilePath);
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
 * Uploads an image to the backend
 * @param {String} pathPrefix the url of the backend and story
 * @param {Object} image object with image data
 * @returns {Promise} returns a promise that resolves when the image is uploaded
 */
function postStoryImage (pathPrefix, image) {
    const query_url = `${pathPrefix}${image.associatedChapter}/${image.stepNumber}/${image.imageId}`,
        // generate file from base64 string
        file = dataURLtoFile(image.dataUrl),
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
    const imageArray = [],
        htmlArray = [];

    story.steps = story.steps.map((step) => {
        const html = step.html;

        if (Object.hasOwn(images, step._id) && images[step._id]?.length > 0) {

            for (const image of images[step._id]) {
                const imageId = new Date().valueOf() + "_" + uuid.v4();

                imageArray.push({
                    ...image,
                    imageId: imageId,
                    associatedChapter: step.associatedChapter,
                    stepNumber: step.stepNumber
                });

                htmlArray.push({
                    html: html.replaceAll(image.dataUrl, imageId),
                    associatedChapter: step.associatedChapter,
                    stepNumber: step.stepNumber
                });
            }
        }
        delete step.html;
        delete step._id;
        return step;
    });
    return [story, imageArray, htmlArray];
}


/**
 * Collects all files needed for the created story and uploads them to the story backend
 *
 * @param {Object} context actions context object.
 * @returns {Promise} returns a promise that resolves when all files are uploaded
 */
function uploadStoryFiles ({state}) {

    const backendUrl = state.backendConfig.url,
        requestConf = {url: backendUrl + "/stories"},

        [story, imageArray, htmlArray] = prepareHtml({...state.currentStory}, state.htmlContentsImages);

    // If it's string, than it was uploaded previously and we have to keep it
    // otherwise, new titleImage should be uploaded
    if (typeof story.titleImage !== "string") {
        delete story.titleImage;
    }

    requestConf.data = story;
    let storyId = state.currentStoryId,
        imagePathPrefix = `${backendUrl}/images/`;

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
        imagePathPrefix += storyId + "/";
    }).then(() => {
        // Upload and replace images in story
        const imageUploads = imageArray.map((image) => {
            return postStoryImage(imagePathPrefix, image);
        });

        if (state.currentStory.titleImage && typeof state.currentStory.titleImage !== "string") {
            const imageId = new Date().valueOf() + "_" + uuid.v4();

            getDataUrlFromFile(state.currentStory.titleImage).then((dataUrl) => {
                const image = {
                    dataUrl: dataUrl,
                    imageId: imageId,
                    associatedChapter: 0,
                    stepNumber: 0
                };

                imageUploads.push(postStoryImage(imagePathPrefix, image));
            });
        }
        return Promise.all(imageUploads);
    }).then(() => {
        // Upload html parts
        const pathPrefix = `${backendUrl}/stories/${storyId}/`,
            htmlUploads = htmlArray.map((element) => {
                const query_url = `${pathPrefix}${element.associatedChapter}/${element.stepNumber}/html`;

                return axios.patch(query_url, {html: element.html});
            });

        return Promise.all(htmlUploads);
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
