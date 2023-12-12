import axios from "axios";
import * as uuid from "uuid";

import crs from "@masterportal/masterportalapi/src/crs";
import {intersects} from "ol/extent";
import {WMSCapabilities} from "ol/format.js";
import dataURLtoFile from "../../utils/dataURLtoFile.js";
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
function saveStoryStep ({state, commit}, {step, images, datasources, wmsLayers}) {


    // add datasources to step
    if (datasources) {
        step.datasources = datasources;
    }

    if (wmsLayers) {
        step.wmsLayers = wmsLayers;
    }


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
 * Uploads an image to the backend
 * @param {String} pathPrefix the url of the backend and story
 * @param {Object} image object with image data
 * @returns {Promise} returns a promise that resolves when the image is uploaded
 */
function postStoryImage (pathPrefix, image) {
    const query_url = `${pathPrefix}${image.associatedChapter}/${image.stepNumber}/${image.imageId}`,
        // generate file from base64 string
        file = dataURLtoFile(image.dataUrl, image.imageId),
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
 * Uploads a datasource to the backend
 * @param {String} pathPrefix the url of the backend and story
 * @param {Object} fileData object with file data
 * @returns {Promise} returns a promise that resolves when the image is uploaded
 */
function postStepDatasource (pathPrefix, fileData) {
    const query_url = `${pathPrefix}`,
        // generate file from base64 string
        // put file into form data
        fData = new FormData(),

        config = {
            headers: {"Content-Type": "multipart/form-data"}
        };

    fData.append("datasource", fileData, fileData.name);


    // return promise
    return axios.post(query_url, fData, config);
}

/**
 *
 * @param {string} pathPrefix the url of the backend and story
 * @param {object} fileData the form data
 * @returns {Promise} returns a promise that resolves when the threeDFiles are uploaded
 */
async function postStepThreeDFiles (pathPrefix, fileData) {
    const queryUrl = `${pathPrefix}`,
        // generate file from base64 string
        // put file into form data

        config = {
            headers: {"Content-Type": "multipart/form-data"}
        },

        // return promise
        response = await axios.post(queryUrl, fileData, config);

    return response;
}


/**
 * Prepare html and images inside for upload
 * @param {Object} story the story
 * @param {Array} images Array of images
 * @returns {Array} returns the updated steps
 */
function prepareHtml (story, images) {
    const imageArray = [],
        htmlArray = [],
        threeDFileArray = [];

    console.log(story.steps);

    story.steps = story.steps.map((step) => {
        let html = step.html;

        if (Object.hasOwn(images, step._id) && images[step._id]?.length > 0) {

            for (const image of images[step._id]) {
                const imageId = new Date().valueOf() + "_" + uuid.v4();

                imageArray.push({
                    ...image,
                    imageId: imageId,
                    associatedChapter: step.associatedChapter,
                    stepNumber: step.stepNumber
                });

                html = html.replaceAll(image.dataUrl, imageId);
            }
        }

        htmlArray.push({
            html: html,
            associatedChapter: step.associatedChapter,
            stepNumber: step.stepNumber
        });


        /**
         * Recursive function to process the tree and add files to FormData
         * @param {Array} node the tree to process
         * @param {FormData} formdata the FormData to append files to
         * @param {string} path the path of the current node
         * @returns {void}
         */
        function processNode (node, formdata, path = "") {
            if (node.file && node.obj) {
                // It's a file, append it to FormData
                const fullPath = path;

                formdata.append(fullPath, node.obj);
                console.log(node);
            }
            else if (node.children && Array.isArray(node.children) && node.children.length > 0) {
                // It's a folder, recurse into its children
                node.children.forEach(child => {
                    processNode(child, formdata, path ? `${path}/${node.name}` : node.name);
                });
            }
            else if (node.children && node.children.length === 0) {
                delete node.children;
            }
        }


        if (step.threeDFiles) {
            const formData = new FormData();

            step.threeDFiles.forEach(node => {
                processNode(node, formData, "");
            });

            threeDFileArray.push({
                threeDFiles: formData,
                stepNumber: step.stepNumber
            });
        }


        // console.log(threeDFileArray);

        delete step.html;
        delete step._id;
        return step;
    });


    return [story, imageArray, htmlArray, threeDFileArray];
}


/**
 * Collects all files needed for the created story and uploads them to the story backend
 *
 * @param {Object} context actions context object.
 * @returns {Promise} returns a promise that resolves when all files are uploaded
 */
function uploadStoryFiles ({state}) {
    const backendUrl = state.backendConfig.url,
        datasourcePathPrefix = `${backendUrl}/datasources/`,
        threeDFilesPathPrefix = `${backendUrl}/files/`,
        [story, imageArray, htmlArray, threeDFileArray] = prepareHtml({...state.currentStory}, state.htmlContentsImages),
        datasources = [];


    for (const step in story.steps) {
        // story.steps[step].datasources = undefined;
        if (story.steps[step].datasources) {
            story.steps[step].datasources = Array.from(story.steps[step].datasources).map(datasource => {
                if (datasource.key) {
                    return datasource;
                }
                const extension = datasource.name.split("."),

                    datasourceObj = {
                        name: datasource.name,
                        hash: new Date().valueOf() + "_" + uuid.v4() + "." + extension[extension.length - 1],
                        stepNumber: story.steps[step].stepNumber,
                        datasource: datasource
                    };

                datasources.push(datasourceObj);
                return {
                    name: datasourceObj.name,
                    key: datasourceObj.hash
                };
            });
        }

    }


    // If it's string, than it was uploaded previously and we have to keep it
    // otherwise, new titleImage should be uploaded
    if (typeof story.titleImage !== "string") {
        delete story.titleImage;
    }

    let storyId = state.currentStoryId,
        requestUrl = `${backendUrl}/stories`,
        imagePathPrefix = `${backendUrl}/images/`,
        storyFilePath = state.currentStory.threeDFilesUrl,
        axiosMethod = axios.post;

    if (storyId) {
        requestUrl += "/" + storyId;
        axiosMethod = axios.patch;
    }

    // Add story and get current storyID back from server
    return axiosMethod(requestUrl, story).then((response) => {
        // Save entire story
        storyId ||= response.data.storyId;
        storyFilePath ||= response.data.threeDFilesUrl;
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
        // upload and replace datasources in story step

        datasources.map((datasource) => {
            return postStepDatasource(datasourcePathPrefix + storyId + "/" + datasource.hash, datasource.datasource);
        });

    }).then(async () => {
        // upload and replace threeDFiles in story step
        const threeDFileUploads = [];


        for (const {stepNumber, threeDFiles, files} of threeDFileArray) {
            const url = threeDFilesPathPrefix + storyId + "/" + stepNumber;

            url.search = new URLSearchParams({storyFilesUrl: files});

            // eslint-disable-next-line
            const response = await fetch(url, {
                method: "POST",
                body: threeDFiles
            });


            threeDFileUploads.push(await response.json());

        }


        return threeDFileUploads;

    }).then((files) => {
        console.log(files);
        // Upload html parts
        const pathPrefix = `${backendUrl}/stories/`,
            threeDFUploads = threeDFileArray.map((element) => {
                const query_url = `${pathPrefix}${storyId}/files`;

                return axios.patch(query_url, {threeDFilesUrl: files[0].folder});
            });

        // loop over all the fields in the form
        for (const threeDFile of threeDFileArray) {
            for (const [key, value] of threeDFile.threeDFiles.entries()) {
                console.log(key, value);
            }
        }

        return Promise.all(threeDFUploads);
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


/**
 * Importing the external wms layers
 * @param {Object} context actions context object.
 * @param {String} layerUrl The layer url to import
 * @param {String[]} capabilities The capabilities of the layer
 * @fires Core.ModelList#RadioTriggerModelListRenderTree
 * @fires Core.ConfigLoader#RadioTriggerParserAddFolder
 * @returns {void}
 */
function importWMSLayers ({state}, layerUrl, capabilities) {
    const url = layerUrl;

    this.invalidUrl = false;
    if (url === "") {
        this.invalidUrl = true;
        return;
    }
    else if (url.includes("http:")) {
        this.$store.dispatch("Alerting/addSingleAlert", i18next.t("common:modules.tools.addWMS.errorHttpsMessage"));
        return;
    }

    // LoaderOverlay.show();
    axios({
        url: url + "?request=GetCapabilities&service=WMS"
    })
        .then(response => {
            return response.data;
        })
        .then((data) => {
            // LoaderOverlay.hide();
            try {
                const parser = new WMSCapabilities(),
                    uniqId = getAddWmsUniqueId(),
                    capability = parser.read(data),
                    version = capability?.version,
                    checkVersion = isVersionEnabled({}, version),
                    currentExtent = Radio.request("Parser", "getPortalConfig")?.mapView?.extent;


                let checkExtent = getIfInExtent({}, capability, currentExtent),
                    finalCapability = capability;

                if (!checkVersion) {
                    const reversedData = getReversedData({}, data);

                    finalCapability = parser.read(reversedData);
                    checkExtent = getIfInExtent({}, finalCapability, currentExtent);
                }


                if (!checkExtent) {
                    // this.$store.dispatch("Alerting/addSingleAlert", i18next.t("common:modules.tools.addWMS.ifInExtent"));
                    return;
                }


                if (Radio.request("Parser", "getItemByAttributes", {id: "ExternalLayer"}) === undefined) {
                    Radio.trigger("Parser", "addFolder", "Externe Fachdaten", "ExternalLayer", "tree", 0);
                    Radio.trigger("ModelList", "renderTree");
                    $("#Overlayer").parent().after($("#ExternalLayer").parent());
                }
                Radio.trigger("Parser", "addFolder", finalCapability.Service.Title, uniqId, "ExternalLayer", 0);
                finalCapability.Capability.Layer.Layer.forEach(layer => {
                    parseLayer({}, layer, uniqId, 1, capabilities, url, version);
                });
                Radio.trigger("ModelList", "closeAllExpandedFolder");

                // this.$store.dispatch("Alerting/addSingleAlert", i18next.t("common:modules.tools.addWMS.completeMessage"));

            }
            catch (e) {
                console.error(e);
                // this.displayErrorMessage();
            }
        }, () => {
            // LoaderOverlay.hide();
            // this.displayErrorMessage();
        });
}

/** Getter for parsed title without space and slash
 * It will be used as id later in template
 * @param {Object} context actions context object.
 * @param {String} title - the title of current layer
 * @returns {String} parsedTitle - The parsed title
 */
function getParsedTitle ({state}, title) {
    return String(title).replace(/\s+/g, "-").replace(/\//g, "-");
}

/**
 * Appending folders and layers to the menu based on the given layer object
 * @info recursive function
 * @param {Object} context actions context object.
 * @param {Object} object the ol layer to hang into the menu as new folder or new layer
 * @param {String} parentId the id of the parent object in the menu
 * @param {Number} level the depth of the recursion
 * @param {String[]} capabilities The capabilities of the layer
 * @param {String} wmsUrl the url of the layer
 * @param {String} version the version of the wms service
 * @fires Core.ConfigLoader#RadioTriggerParserAddFolder
 * @fires Core.ConfigLoader#RadioTriggerParserAddLayer
 * @return {void}
 */
function parseLayer ({state}, object, parentId, level, capabilities, wmsUrl, version) {
    if (Object.prototype.hasOwnProperty.call(object, "Layer")) {
        object.Layer.forEach(layer => {
            parseLayer({state}, layer, getParsedTitle({state}, object.Title), level + 1, capabilities);
        });
        Radio.trigger("Parser", "addFolder", object.Title, getParsedTitle({state}, object.Title), parentId, level, false, false, object.invertLayerOrder);
    }
    else {
        const datasets = [];

        if (object?.MetadataURL?.[0].OnlineResource) {
            datasets.push({
                customMetadata: true,
                csw_url: object.MetadataURL[0].OnlineResource,
                attributes: {}
            });
        }
        Radio.trigger("Parser", "addLayer", object.Title, getParsedTitle({state}, object.Title), parentId, level, object.Name, wmsUrl, version, {
            maxScale: object?.MaxScaleDenominator?.toString(),
            minScale: object?.MinScaleDenominator?.toString(),
            legendURL: object?.Style?.[0].LegendURL?.[0].OnlineResource?.toString(),
            datasets
        });
    }
}

/**
 * @returns {String} uniqueId - The unique id for addWMS
 */
function generateUUID () { // Public Domain/MIT
    let d = new Date().getTime(), // Timestamp
        d2 = ((typeof performance !== "undefined") && performance.now && (performance.now() * 1000)) || 0;// Time in microseconds since page-load or 0 if unsupported

    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        let r = Math.random() * 16;// random number between 0 and 16

        if (d > 0) { // Use timestamp until depleted
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        }
        else { // Use microseconds since page-load if supported
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c === "x" ? r : r & 0x3 | 0x8).toString(16);
    });
}

/**
 * Getter for addWMS UniqueId.
 * Counts the uniqueId 1 up.
 * @returns {String} uniqueId - The unique id for addWMS.
 */
function getAddWmsUniqueId () {
    return "external_" + generateUUID();
}

/**
 * Getter if the version is enabled and above 1.3.0
 * @param {Object} context actions context object.
 * @param {String} version the version of current external wms layer
 * @returns {Boolean} true or false
 */
function isVersionEnabled ({state}, version) {
    if (typeof version !== "string") {
        return false;
    }

    const parsedVersion = version.split(".");

    if (parseInt(parsedVersion[0], 10) < 1) {
        return false;
    }
    else if (parsedVersion.length >= 2 && parseInt(parsedVersion[0], 10) === 1 && parseInt(parsedVersion[1], 10) < 3) {
        return false;
    }

    return true;
}

/**
 * Getter for reversed data of old wms version
 * @param {Object} context actions context object.
 * @param {Object} data the response of the imported wms layer
 * @returns {xml} reversedData - The reversed data of the response of the imported wms layer
*/
function getReversedData ({state}, data) {
    let reversedData = new XMLSerializer().serializeToString(data);

    reversedData = reversedData.replace(/<SRS>/g, "<CRS>").replace(/<\/SRS>/g, "</CRS>").replace(/SRS=/g, "CRS=");
    reversedData = new DOMParser().parseFromString(reversedData, "text/xml");

    return reversedData;
}

/**
 * Getter if the imported wms layer in the extent of current map
 * @param {Object} context actions context object.
 * @param {Object} capability the response of the imported wms layer in parsed format
 * @param {Number[]} currentExtent the extent of current map view
 * @returns {Boolean} true or false
 */
function getIfInExtent ({state}, capability, currentExtent) {
    const layer = capability?.Capability?.Layer?.BoundingBox?.filter(bbox => {
        return bbox?.crs && bbox?.crs.includes("EPSG") && crs.getProjection(bbox?.crs) !== undefined && Array.isArray(bbox?.extent) && bbox?.extent.length === 4;
    });
    let layerExtent;

    // If there is no extent defined or the extent is not right defined, it will import the external wms layer(s).
    if (!Array.isArray(currentExtent) || currentExtent.length !== 4) {
        return true;
    }

    if (Array.isArray(layer) && layer.length) {
        let firstLayerExtent = [],
            secondLayerExtent = [];

        layer.forEach(singleLayer => {
            if (singleLayer.crs === this.projection.getCode()) {
                firstLayerExtent = [singleLayer.extent[0], singleLayer.extent[1]];
                secondLayerExtent = [singleLayer.extent[2], singleLayer.extent[3]];
            }
        });

        if (!firstLayerExtent.length && !secondLayerExtent.length) {
            firstLayerExtent = crs.transform(layer[0].crs, this.projection.getCode(), [layer[0].extent[0], layer[0].extent[1]]);
            secondLayerExtent = crs.transform(layer[0].crs, this.projection.getCode(), [layer[0].extent[2], layer[0].extent[3]]);
        }

        layerExtent = [firstLayerExtent[0], firstLayerExtent[1], secondLayerExtent[0], secondLayerExtent[1]];

        return intersects(currentExtent, layerExtent);
    }

    return true;
}

/**
 * The capabilites of the WMS layers
 * @param {Object} context actions context object.
 * @param {String} layerUrl the url of the layer
 * @returns {Promise<Object[]>} available background maps to select
 */
function capabilityOptions ({state}, layerUrl) {

    return axios({
        timeout: 4000,
        url: layerUrl + "?request=GetCapabilities&service=WMS"
    })
        .then(response => response.data)
        .then((data) => {
            // LoaderOverlay.hide();
            try {
                const parser = new WMSCapabilities(),
                    capability = parser.read(data);


                return capability.Capability.Layer.Layer;
            }
            catch (e) {
                // this.displayErrorMessage();
                console.error(e);
            }
            return [];
        });

}

/**
 *
 * @param {String} layerUrl the wms url
 * @returns {Promise} return nothing
 */
async function hideWmsLayer (layerUrl) {
    const capabilites = await capabilityOptions({}, layerUrl),
        allCapabilitiesModels = capabilites.map(capability => {
            return Radio.request("ModelList", "getModelByAttributes", {id: capability.Title});
        });


    allCapabilitiesModels.forEach(model => {
        if (model) {
            model.setIsVisibleInMap(false);
            model.set("isSelected", false);
        }
    });
}

export default {
    addStoryChapter,
    saveStoryStep,
    deleteStoryStep,
    adjustStepNumbers,
    uploadStoryFiles,
    prepareHtml,
    getDataUrlFromFile,
    postStoryImage,
    postStepDatasource,
    importWMSLayers,
    getParsedTitle,
    parseLayer,
    getAddWmsUniqueId,
    isVersionEnabled,
    getReversedData,
    getIfInExtent,
    capabilityOptions,
    generateUUID,
    hideWmsLayer
};
