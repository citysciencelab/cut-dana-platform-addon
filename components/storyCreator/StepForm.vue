<script>
import {
    mdiBackspaceOutline, mdiCancel, mdiCheck, mdiClose, mdiPinOutline,
    mdiTrashCanOutline, mdiHelpCircleOutline, mdiPencilOutline
} from "@mdi/js";
import * as uuid from "uuid";
import {VueEditor} from "vue2-editor";
import {mapActions, mapGetters, mapMutations} from "vuex";


import fileImportGetters from "../../../../fileImportAddon/store/gettersFileImportAddon";
import actions from "../../store/actionsDataNarrator";
import * as constants from "../../store/constantsDataNarrator";
import getters from "../../store/gettersDataNarrator";
import mutations from "../../store/mutationsDataNarrator";

import getDataUrlFromFile from "../../utils/getDataUrlFromFile";
import getFileExtension from "../../utils/getFileExtension";

import axios from "axios";
import modelerGetters from "../../../../../src/modules/tools/modeler3D/store/gettersModeler3D";
import {getMimeTypeFromExtension} from "../../utils/fileDataType";

import LayerSelector from "./inputs/LayerSelector.vue";
import BackgroundMap from "./inputs/BackgroundMapSelect.vue";

import LayerUtilities from "../../mixins/LayerUtilities";
import ThreeDUtilities from "../../mixins/ThreeDUtilities";
import * as cesiumUtils from "../../utils/cesium";


export default {
    name: "StepForm",

    components: {
        VueEditor,
        LayerSelector,
        BackgroundMap
    },
    mixins: [LayerUtilities, ThreeDUtilities],
    props: {
        // The initial values for a step to edit
        editedStep: {
            type: Object,
            default: () => ({...constants.emptyStep})
        }
    },
    data () {
        return {
            constants,
            getFileExtension,
            visibleBackgroundMap: null,
            minStepWidth: 280,
            maxStepWidth: 1000,
            step: {_id: uuid.v4(), layers: [], layers3D: [], is3D: this.editedStep.is3D || false, ...this.editedStep},
            newChapterTitle: this.editedStep.chapterTitle || "",

            images: this.$store.state.Tools.DataNarrator.htmlContentsImages[this.editedStep?._id] || [],

            is3DLayerActive: false,

            backgroundMapId: this.editedStep?.backgroundMapId || constants.defaultMap,
            mapMovedPosition: {
                cameraPosition: [
                    null,
                    null,
                    null
                ],
                heading: null,
                pitch: null
            },
            icons: {
                mdiCancel,
                mdiTrashCanOutline,
                mdiCheck,
                mdiPinOutline,
                mdiBackspaceOutline,
                mdiClose,
                mdiHelpCircleOutline,
                mdiPencilOutline
            },
            rawDatasources: this.editedStep?.datasources || [],
            datasources: [],
            wmsLayers: this.editedStep?.wmsLayers || [],
            allWmsLayers: [],

            drawToolOpen: false,

            key: 0,
            cesiumEnabled: false
        };
    },
    computed: {
        ...mapGetters("Tools/DataNarrator", Object.keys(getters)),
        ...mapGetters("Tools/FileImportAddon", Object.keys(fileImportGetters)),
        ...mapGetters("Tools/Modeler3D", Object.keys(modelerGetters)),
        ...mapGetters(["mobile"]),


        /**
         * All chapter numbers
         * @returns {Object[]} all chapter numbers
         */
        newChapterNumber () {
            let chapters = this.currentStory.chapters || [];

            if (chapters.length === 0) {
                return 1;
            }

            chapters = chapters.map(({chapterNumber}) => chapterNumber);
            return Math.max(...chapters) + 1;
        },

        /**
         * @returns {Boolean} Can the step be submitted?
         */
        isValid () {
            return this.step.html?.length > 0;
        },

        /**
         * All step numbers of the selected chapter
         * @returns {Object[]} all step numbers
         */
        allStepNumbers () {
            let steps = this.currentStory.steps || [];

            if (steps.length === 0) {
                return [1];
            }
            steps = steps.filter(
                ({associatedChapter}) => associatedChapter === this.step.associatedChapter
            );
            return Array.from({length: steps.length + 1}, (v, i) => i + 1);
        },


        /**
         * The chapter options
         * @returns {Object[]} chapter options (value and text)
         */
        chapterOptions () {
            const chapters = this.currentStory.chapters || [],
                chapterOptions = chapters.map(chapter => ({
                    value: chapter.chapterNumber,
                    text: chapter.chapterNumber + " - " + chapter.chapterTitle
                })),
                newChapterOption = {
                    value: this.newChapterNumber,
                    text: this.$t(
                        "additional:modules.tools.dataNarrator.newChapter"
                    )
                };

            return [...chapterOptions, newChapterOption];
        },

        /**
         * The addon options
         * @returns {Object[]} available addons to activate
         */
        addonOptions () {
            const configuredAddons = this.$store.state.Tools.configuredTools;

            return configuredAddons
                .filter(addon => addon.key !== this.id)
                .map(addon => ({
                    value: addon.key,
                    text:
                        addon.component.name ||
                        addon.key
                }));
        },

        backgroundMaps () {
            const bgMaps = Radio.request("Parser", "getItemsByAttributes", {backgroundMap: true}),
                newBgMaps = [];

            for (const bgMap of bgMaps) {
                let foundBgMap = Radio.request("ModelList", "getModelByAttributes", {id: bgMap.id});

                if (!foundBgMap) {
                    Radio.trigger("ModelList", "addModelsByAttributes", bgMap);
                    foundBgMap = Radio.request("ModelList", "getModelByAttributes", {id: bgMap.id});
                }
                newBgMaps.push(foundBgMap);
            }

            return newBgMaps;
        }


    },
    watch: {

        "step.associatedChapter" () {
            // this.step.is3D = true;
        },


        "cesiumMap" (value) {
            this.cesiumEnabled = Boolean(value);
        },
        /**
         * Applies the step width to the tool window
         * @param {Number} newStepWidth the new step width
         * @returns {void}
         */
        "step.stepWidth" (newStepWidth) {
            this.setInitialWidth(newStepWidth);
        },

        "is3D" (newState) {
            this.step.navigation3D = this.get3DMapCenter();
            this.mapMovedPosition = this.step.navigation3D;
            this.step.is3D = newState;
        },

        /**
         * Toggles map layers according to the selection for the step
         * @param {Array} newSelectedLayerIds the selected layers
         * @returns {void}
         */
        "step.layers" (newSelectedLayerIds) {
            this.rebuildLayers(newSelectedLayerIds, "plainLayers");
            Radio.trigger("Menu", "rerender");
        },

        "step.is3D" (value) {
            this.step.is3D = value;
            this.activate3DMap(value);
        },

        /**
         * Toggles map 3D layers according to the selection for the step
         * @param {Array} newSelectedLayerIds the selected layers
         * @returns {void}
         */
        "step.layers3D" (newSelectedLayerIds) {

            if (!this.step.is3D && (newSelectedLayerIds.length !== 0 || (this.step.selectedModelIds && this.step.selectedModelIds.length !== 0))) {
                this.activate3DMap(true);
            }
            else if (this.step.is3D && newSelectedLayerIds.length === 0 && ((this.step.selectedModelIds && this.step.selectedModelIds.length === 0) || !this.step.selectedModelIds)) {
                this.activate3DMap(false);
            }

            this.rebuildLayers(newSelectedLayerIds, "layers3D");

            // this.is3DLayerActive = this.enabledLayers().filter(layer => {
            //     return this.layerTypes3DSpecific.includes(layer.attributes.typ);
            // }).length > 0;

        },

        /**
         * Toggles the addons according to the selection for the step
         * @param {Array} newSelectedAddonIds the new selected addons
         * @param {Array} oldSelectedAddonIds the previous selected addons
         * @returns {void}
         */
        "step.interactionAddons" (newSelectedAddonIds, oldSelectedAddonIds) {
            const configuredAddons = this.$store.state.Tools.configuredTools,

                // Hide unselected addons again
                unselectedAddons = oldSelectedAddonIds.filter(
                    addon => !newSelectedAddonIds.includes(addon)
                );

            unselectedAddons.forEach(addonId => {
                const addon = configuredAddons.find(
                    ({key}) => key === addonId
                );

                if (addon) {
                    const toolKey = addon.key.charAt(0).toUpperCase() + addon.key.slice(1);

                    this.$store.commit(
                        `Tools/${toolKey}/setActive`,
                        false
                    );
                }
            });

            // Show selected addons
            newSelectedAddonIds.forEach(addonId => {
                const addon = configuredAddons.find(
                    ({key}) => key === addonId
                );

                if (addon) {
                    const toolKey = addon.key.charAt(0).toUpperCase() + addon.key.slice(1);

                    this.$store.commit(
                        `Tools/${toolKey}/setActive`,
                        true
                    );
                }
            });
        },
        /**
         * Listens for the change of the new title
         * @param {string} newTitle the new title the chapter should become
         * @returns {void}
         */
        "newChapterTitle" (newTitle) {
            this.newChapterTitle = newTitle;
            this.step.chapterTitle = newTitle;
        }
    },
    async mounted () {
        this.loadStep();
    },

    beforeDestroy () {
        this.disableLayersByName(this.importedFileNames);
        this.disableStepLayers(this.step);


        this.$store.commit("Maps/setMode", "2D");
        this.$store.commit("Tools/Draw/setActive", false);
        this.switchBackgroundMap(this.visibleBackgroundMap);
    },
    methods: {
        ...mapActions("Tools/DataNarrator", Object.keys(actions)),
        ...mapMutations("Tools/DataNarrator", Object.keys(mutations)),
        ...mapActions("Tools/FileImportAddon", [
            "importKML",
            "setSelectedFiletype"
        ]),
        // These application wide getters and setters can be found in 'src/modules/map/store'
        ...mapGetters("Maps", ["center", "zoom"]),
        ...cesiumUtils,

        async toggle3DMode (value) {
            if (value) {
                await this.enable3D();
            }
            else {
                await this.disable3D();
            }

        },

        loadModelsFromFileForm () {
            this.disableAllEntities();
            for (const entityId of this.step.selectedModelIds) {
                this.enableEntityVisibility({entityId: entityId.modelId});
            }
        },

        switchBackgroundMap (value) {
            if (value) {
                this.backgroundMaps.forEach(model => {
                    if (model.get("id") === value) {
                        if (!model.get("isVisibleInMap") && !model.get("isSelected")) {
                            this.enableLayer(model);
                        }
                    }
                    else {
                        this.disableLayer(model);
                    }
                });
            }
        },

        /**
         * Converts the external rawDatasources to the internal datasources
         * @returns {Object[]} the internal datasources
         */
        existingDatasources () {
            for (const dataSource of this.rawDatasources) {
                // const response = this.ownDataSources(dataSource.key);
                if (this.importedFileNames.includes(dataSource.name)) {
                    this.enableLayerByName(dataSource.name);
                }
                else {
                    axios.get(this.backendConfig.url + "/datasources/" + this.currentStoryId + "/" + dataSource.key, {
                        responseType: "blob"
                    }).then((r) => {
                        const file = new File([r.data], dataSource.name, {
                            type: getMimeTypeFromExtension(dataSource.name.split(".").pop())
                        });

                        this.addFile([file]);
                        // this.datasources.push(file);
                    });
                }
            }
        },

        /**
         * Handles the file upload
         * @param {files} files - The files from the file input
         * @returns {void}
         */
        addFile (files) {
            Array.from(files).forEach(file => {
                const reader = new FileReader();

                reader.onload = f => {
                    const layerName = this.getLayerNameFromFile(file.name),
                        checkSameLayer = this.importedFileNames.filter(importedFileName => {
                            return this.getLayerNameFromFile(file.name) === this.getLayerNameFromFile(importedFileName);
                        });

                    this.importKML({raw: f.target.result, checkSameLayer: checkSameLayer, layerName: layerName, filename: file.name, pointImages: this.pointImages, textColors: this.textColors, textSizes: this.textSizes});
                };

                reader.readAsText(file);
            });
        },

        /**
         * Handles step width changes
         * @param {Event} event event fired by changing the input for stepWidth
         * @returns {void}
         */
        onChangeStepWidth (event) {
            this.step.stepWidth = Math.max(
                this.minStepWidth,
                Math.min(this.maxStepWidth, Number(event.target.value))
            );
        },

        /**
         * Handle the custom data upload
         * @param {Event} event - The file input change event
         * @returns {void}
         */
        onCustomDataUpload (event) {
            this.datasources = event.target.files;
            if (this.datasources !== undefined) {
                this.addFile(this.datasources);
            }
        },


        /**
         * Updates the selected capabilities of a WMS layer
         * @param {String[]} selectedCapabilities the selected capabilities
         * @param {String} layerUrl the url of the layer
         * @param {Object[]} allCapabilities all capabilities of the layer
         * @returns {void}
         */
        updateSelectedCapabilities (selectedCapabilities, layerUrl, allCapabilities) {
            const layer = this.wmsLayers.find(url => url.url === layerUrl),
                layerModels = selectedCapabilities.map(capability => {
                    const parsedModel = Radio.request("Parser", "getItemByAttributes", {layers: capability});
                    let models = [];

                    if (parsedModel) {

                        Radio.trigger("ModelList", "addModelsByAttributes", parsedModel);
                        models = Radio.request("ModelList", "getModelByAttributes", {id: parsedModel.id});
                    }
                    return models;
                }),
                allCapabilitiesModels = allCapabilities.map(capability => {
                    return Radio.request("ModelList", "getModelByAttributes", {id: capability.Title});
                });

            this.disableLayers(allCapabilitiesModels);

            layerModels.forEach(model => {
                if (model && layerModels.length > 0) {
                    if (selectedCapabilities.includes(model.get("layers"))) {
                        this.enableLayer(model);
                    }
                    else {
                        this.disableLayer(model);
                    }
                }

            });


            if (layer) {
                layer.selectedLayers = selectedCapabilities;
            }

        },


        /**
         * Handles the loading of threeDFiles in a step
         * @calls this.addEntity
         * @returns {void}
         */
        async loadThreeDFiles () {
            // Check if 3D map mode needed
            // Toggles 3D map mode


            this.disableAllEntities();


            if (this.currentStory.threeDFiles) {
                this.currentStory.threeDFiles.forEach((item) => {
                    const selectedIds = this.step.selectedModelIds.map(model => model.modelId);

                    if (!selectedIds.includes(item.id)) {
                        const uri = `${this.backendConfig.url}/files${this.currentStory.threeDFilesId}`,
                            modelData = this.step.selectedModelIds.find(model => {
                                return model.modelId === item.id;
                            });


                        if (modelData) {
                            this.addEntity({
                                ...item,
                                position: modelData.position,
                                scale: modelData.scale,
                                orientation: modelData.orientation
                            }, uri);
                        }
                    }

                });
            }

            this.loadModelsFromFileForm();
        },

        /**
         * Enables the visibility of all entities in the current step
         * @returns {void}
         */
        enableThreeDModels () {
            if (this.currentStory.threeDFiles) {
                this.currentStory.threeDFiles.forEach((item) => {
                    this.enableEntityVisibility(item);
                });
            }
        },

        /**
         * Actually adds the entity to the 3D map
         * @param {Object} item the item to add
         * @param {String} path the path to the item
         * @returns {void}
         */
        addEntity (item, path = "") {
            // the item is a file and not a folder
            // const hpr = new Cesium.HeadingPitchRoll(item.orientation.heading, item.orientation.pitch, item.orientation.roll),
            //     quaternion = Cesium.Transforms.headingPitchRollQuaternion(Cesium.Cartesian3.ZERO, hpr),
            // only load the file if the file is a gltf file

            if (item.file && item.file === "gltf") {
                const position = new Cesium.Cartesian3(item.position.x, item.position.y, item.position.z),
                    hpr = item.orientation ? new Cesium.HeadingPitchRoll(item.orientation.heading, item.orientation.pitch, item.orientation.roll) : new Cesium.HeadingPitchRoll(0, 0, 0),

                    orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);

                this.createEntity({
                    entityId: item.id,
                    file: item.file,
                    uri: `${path}/${item.name}`,
                    scale: item.scale,
                    position: position,
                    clampToGround: true,
                    show: false,
                    orientation: orientation
                });
                return;
            }
            if (item.children && item.children.length > 0) {
                item.children.forEach((child) => {
                    const newPath = item.name !== "files" ? `${path}/${item.name}` : path;

                    this.addEntity(child, `${newPath}`);
                });
            }

        },

        /**
         * Removes URL parameters from a URL since the function adds and handles those itself
         * @param {string} url the item to enable
         * @returns {string} the url without parameters
         */
        removeURLParameters (url) {
            const urlObj = new URL(url);

            return urlObj.origin + urlObj.pathname;
        },

        /**
         * Handles adding a WMS layer to the step
         * @returns {void}
         */
        async onWmsLayersAdd () {
            // Radio.trigger("Parser", "addWMSRemotely", document.querySelector("#own_wmsLayers").value);

            const url = this.removeURLParameters(document.querySelector("#own_wmsLayers").value),
                capabilites = await this.capabilityOptions(url),
                exists = this.wmsLayers.filter(layer => layer.url === url).length > 0;

            if (!exists) {

                this.wmsLayers.push({
                    url: url,
                    selectedLayers: []
                });

                this.allWmsLayers.push({
                    url: url,
                    selectedLayers: capabilites
                });

                this.importWMSLayers(url, capabilites);

            }
        },


        /**
         * Handles adding a capability to the WMS layers
         * @param {String} layerUrl the url where the layer should be
         * @param {String} capability the capability to add
         * @returns {void}
         */
        onWmsCapabilitiesUpdate (layerUrl, capability) {
            const layer = this.wmsLayers.find(url => url.url === layerUrl),
                allLayer = this.allWmsLayers.find(url => url.url === layerUrl);

            if (layer) {
                layer.selectedLayers.push(capability.Name);
            }

            if (allLayer) {
                allLayer.selectedLayers.push(capability);
            }
        },

        /**
         * Handles removing a capability from the WMS layers
         * @param {String} layerUrl the url where the layer should be
         * @param {String} capability the capability to remove
         * @returns {void}
         */
        onWmsCapabilitiesRemove (layerUrl, capability) {
            const layer = this.wmsLayers.find(url => url.url === layerUrl),
                allLayer = this.allWmsLayers.find(url => url.url === layerUrl);

            if (layer) {
                layer.selectedLayers = layer.selectedLayers.filter(cap => cap !== capability);
            }

            if (allLayer) {
                allLayer.selectedLayers = allLayer.selectedLayers.filter(cap => cap !== capability);
            }
        },


        /**
         * Handles removing a WMS layer from the step
         * @param {Object} layer The URL to remove
         * @returns {void}
         */
        onWmsLayerRemove (layer) {
            this.hideWmsLayer(layer.url);
            this.wmsLayers = this.wmsLayers.filter(l => l.url !== layer.url);
            this.allWmsLayers = this.allWmsLayers.filter(l => l.url !== layer.url);
        },

        /**
         * Handles adding an image to the HTML content images
         * @param {File} imageFile the image file to add
         * @param {Object} Editor the HTML editor instance
         * @param {number} cursorLocation the current cursor location in the HTML editor
         * @param {Function} resetUploader function to reset the uploader
         * @returns {void}
         */
        onAddImage (imageFile, Editor, cursorLocation, resetUploader) {
            const fileExtension = getFileExtension(imageFile);

            getDataUrlFromFile(imageFile).then(dataUrl => {
                this.images.push({dataUrl, fileExtension});
                // Add image to HTML content
                Editor.insertEmbed(cursorLocation, "image", dataUrl);
                resetUploader();
            }).catch((error) => {
                console.error(error);
                Radio.trigger("Alert", "alert", {
                    text: i18next.t(
                        "additional:modules.tools.dataNarrator.error.errorAddingImage"
                    ),
                    category: "Error",
                    kategorie: "alert-danger"
                });
            });
        },

        /**
         * Handles removing and image from the HTML content
         * @param {String} imageDataUrl the image data url to remove
         * @returns {void}
         */
        onRemoveImage (imageDataUrl) {
            this.images = this.images.filter(
                image => image.dataUrl !== imageDataUrl
            );
        },

        /**
         * Shows confirmation dialog
         * Deletes the step from the story if confirmed
         * @returns {void}
         */
        onDeleteStep () {
            /**
             * Constant that saves all the actions on confirm
             * @returns {void}
             */
            const deleteStep = () => {
                const {associatedChapter, stepNumber} =
                    this.editedStep || this.step;

                this.deleteStoryStep({step: this.step});
                this.adjustStepNumbers({associatedChapter, stepNumber});
                this.$emit("return");
            };

            this.$emit("confirm", "deleteStep", deleteStep);
        },

        /**
         * Adds the created step to the story
         * or saves the step changes when in editing mode
         * @returns {void}
         */
        async onSubmit () {
            if (this.step.associatedChapter === this.newChapterNumber) {
                // Add a new chapter to the story
                this.addStoryChapter({
                    chapterNumber: this.newChapterNumber,
                    chapterTitle: this.newChapterTitle
                });
            }
            const newDatasources = Array.from(this.datasources);

            for (const raw of this.rawDatasources) {
                newDatasources.push(raw);
            }

            this.saveStoryStep({step: this.step, images: this.images, datasources: newDatasources, wmsLayers: this.wmsLayers});

            for (const layer of this.wmsLayers) {
                this.hideWmsLayer(layer.url);
            }
            // Trigger submit action to return to story overview
            this.$emit("return");
        },

        /**
         * Transform a lon lat position to radians
         * @param {Object} cartesian3Pos a position defined by longitude, latitude, and height.
         * @returns {number} value in the resulting object will be in radians
         */
        toDegrees (cartesian3Pos) {
            const pos = Cesium.Cartographic.fromCartesian(cartesian3Pos);

            return [pos.longitude / Math.PI * 180, pos.latitude / Math.PI * 180, pos.height];
        },

        /**
         * 3D map center (should be implement in 3DMapRadioBridge)
         * @returns {Object} returns object in the format of the story attribute 'navigation3D'
         */
        get3DMapCenter () {
            const camera = this.cesiumCamera();

            return {
                "cameraPosition": this.toDegrees(camera.position),
                "heading": camera.heading,
                "pitch": camera.pitch
            };
        },

        /**
         * Sets the 3D map center
         * @returns {void}
         */
        set3DMapCenter () {
            if (this.step.navigation3D.cameraPosition[0] &&
                this.step.navigation3D.cameraPosition[1] &&
                this.step.navigation3D.cameraPosition[2] &&
                this.step.navigation3D.heading &&
                this.step.navigation3D.pitch) {
                const camera = this.cesiumScene().camera;

                camera.flyTo({
                    destination: Cesium.Cartesian3.fromDegrees(this.step.navigation3D.cameraPosition[0], this.step.navigation3D.cameraPosition[1], this.step.navigation3D.cameraPosition[2]),
                    orientation: {
                        heading: this.step.navigation3D.heading,
                        pitch: this.step.navigation3D.pitch,
                        roll: 0.0
                    }
                });
            }

        },

        /**
         * Toggles 3D map mode via checkbox
         * @param {boolean} checkboxValue the flag indicating if 3D map should be activated
         * @returns {void}
         */
        async activate3DMap (checkboxValue) {
            this.step.is3D = checkboxValue;

            const isMap3d = this.is3D; // Get this value from the ThreeDUtilities Mixin

            if (this.step.is3D && !isMap3d) {
                // Found in the ThreeDUtilities Mixin
                await this.enable3D();

                this.step.navigation3D = this.get3DMapCenter();
                this.mapMovedPosition = this.step.navigation3D;

                this.cesiumCamera().moveEnd.addEventListener(() => {
                    this.mapMovedHandler();
                });

                this.cesiumEnabled = true;

            }
            else if (!this.step.is3D && isMap3d) {
                // Found in the ThreeDUtilities Mixin
                await this.toggle3DMode(false);
            }

        },

        /**
         * Set new position of the camera after it stopped moving
         * @returns {void}
         */
        mapMovedHandler () {
            this.mapMovedPosition = this.get3DMapCenter();
        },

        /**
         * Complex check for the form warning of new camera position
         * @returns {void}
         */
        isCameraPositionDifferent () {

            return this.step.navigation3D.cameraPosition[0] && this.mapMovedPosition.cameraPosition[0]
                && (this.step.navigation3D.cameraPosition[0] !== this.mapMovedPosition.cameraPosition[0]
                    || this.step.navigation3D.cameraPosition[1] !== this.mapMovedPosition.cameraPosition[1]
                    || this.step.navigation3D.cameraPosition[2] !== this.mapMovedPosition.cameraPosition[2]);

        },

        setBackgroundMap (value) {
            this.step.backgroundMapId = value;
            this.backgroundMapId = value;
            this.switchBackgroundMap(value);
        },

        /**
         * Removes the layer from the list of layers
         * @param {Object} model The model of the layer to remove
         * @returns {void}
         */
        removeDatasource (model) {
            this.rawDatasources = this.rawDatasources.filter(datasource => datasource.key !== model.key);
        },

        /**
         * Enables the 3D mode and opens the file upload form
         * @returns {void}
         */
        async open3D () {


            await this.activate3DMap(true);
            this.cesiumCamera().moveEnd.addEventListener(this.mapMovedHandler);

            this.step.navigation3D = this.get3DMapCenter();
            this.$emit(
                "openFileForm",
                this.step
            );
        },

        toggleDrawTool () {
            this.drawToolOpen = !this.drawToolOpen;
            this.$store.commit("Tools/Draw/setActive", this.drawToolOpen);
        },

        /**
         * Handles all the loading of the step
         * @returns {void}
         */
        async loadStep () {
            if (this.step.is3D && !this.is3D) {
                this.activate3DMap(true);

                this.cesiumCamera().moveEnd.addEventListener(this.mapMovedHandler);
                this.set3DMapCenter();

                await this.loadThreeDFiles();
            }
            else if (!this.step.is3D && this.is3D) {

                this.activate3DMap(false);
            }
            else if (this.step.is3D && this.is3D) {
                this.cesiumEnabled = true;
                this.cesiumScene().camera.moveEnd.addEventListener(this.mapMovedHandler);
                this.set3DMapCenter();
                await this.loadThreeDFiles();
            }

            if (this.step.associatedChapter === null) {
                const diff = this.chapterOptions.length > 1 ? 2 : 1;

                this.step.associatedChapter = this.chapterOptions[this.chapterOptions.length - diff].value;
            }
            if (this.step.stepNumber === null) {
                this.step.stepNumber = this.allStepNumbers[this.allStepNumbers.length - 1];
            }
            if (this.step.stepWidth === null) {
                this.step.stepWidth = this.$store.state.Tools.DataNarrator.initialWidth;
            }

            const stepLayers = this.step.layers || [],
                stepLayers3D = this.step.layers3D || [];

            this.rebuildLayers(stepLayers.concat(stepLayers3D));

            this.visibleBackgroundMap = this.backgroundMaps.find(model => model.get("isVisibleInMap"))?.id;

            this.existingDatasources();

            if (this.step.wmsLayers) {
                this.step.wmsLayers.forEach(async (l) => {
                    const url = l.url,
                        capabilites = await this.capabilityOptions(url),
                        exists = this.allWmsLayers.filter(layer => layer.url === url).length > 0;


                    if (!exists) {
                        this.wmsLayers.push({
                            url: url,
                            selectedLayers: l.selectedLayers
                        });
                        this.allWmsLayers.push({
                            url: url,
                            selectedLayers: capabilites
                        });

                        this.key++;

                        this.importWMSLayers(url, capabilites);

                        this.updateSelectedCapabilities(l.selectedLayers, l.url, this.allWmsLayers);
                    }


                });
            }

            Radio.trigger("Menu", "rerender");
        }

    }
};
</script>

<template lang="html">
    <div
        id="tool-dataNarrator-creator-stepForm"
        class="mb-8"
    >
        <h4>
            {{
                $t("additional:modules.tools.dataNarrator.createStoryStep")
            }}
        </h4>

        <form @submit.prevent="onSubmit">
            <div class="form-group">
                <label
                    class="form-label required"
                    for="step-associate"
                >
                    {{
                        $t(
                            "additional:modules.tools.dataNarrator.label.chapter"
                        )
                    }}
                </label>

                <v-select
                    id="step-associate"
                    v-model="step.associatedChapter"
                    :items="chapterOptions"
                    required
                    dense
                    solo
                    hide-details
                />
            </div>

            <div
                v-if="step.associatedChapter === newChapterNumber"
                class="form-group"
            >
                <label
                    class="form-label required"
                    for="step-chapter-title"
                >
                    {{
                        $t(
                            "additional:modules.tools.dataNarrator.label.newChapterTitle"
                        )
                    }}
                </label>

                <input
                    id="step-chapter-title"
                    v-model="newChapterTitle"
                    class="form-control"
                    required
                >
            </div>

            <div class="form-group">
                <label
                    class="form-label required"
                    for="step-number"
                >
                    {{
                        $t(
                            "additional:modules.tools.dataNarrator.label.stepNumber"
                        )
                    }}
                </label>
                <v-select
                    id="step-number"
                    v-model="step.stepNumber"
                    :items="allStepNumbers"
                    required
                    dense
                    solo
                    hide-details
                />
            </div>

            <div class="form-group">
                <label
                    class="form-label required"
                    for="step-title"
                >
                    {{ $t("additional:modules.tools.dataNarrator.label.stepTitle") }}
                </label>

                <input
                    id="step-title"
                    v-model="step.title"
                    class="form-control"
                    required
                >
            </div>


            <div
                v-if="is3DLayerActive"
                class="form-group"
            >
                <label
                    class="form-label"
                    for="step-is3d"
                >
                    {{ $t( "additional:modules.tools.dataNarrator.label.is3D" ) }}
                </label>
                <input
                    id="step-is3d"
                    v-model="step.is3D"
                    class="checkbox"
                    type="checkbox"
                >
            </div>

            <div v-if="step.is3D">
                <div
                    class="form-group"
                >
                    <label
                        class="form-label"
                        for="step-3d-center"
                    >
                        {{ $t( "additional:modules.tools.dataNarrator.label.centerCoordinate3D" ) }}
                    </label>
                    <div
                        class="stepForm-inputs-centerCoordinate stepForm-inputs-3d-position"
                    >
                        <input
                            id="step-3d-center"
                            class="form-control"
                            :value="step.navigation3D.cameraPosition[0] || cesiumScene().camera.position[0]"
                            readonly
                        >
                        <input
                            class="form-control"
                            :value="step.navigation3D.cameraPosition[1] || cesiumScene().camera.position[1]"
                            readonly
                        >
                        <input
                            class="form-control"
                            :value="step.navigation3D.cameraPosition[2] || cesiumScene().camera.position[2]"
                            readonly
                        >

                        <div class="input-group">
                            <button
                                type="button"
                                class="btn"
                                @click="step.navigation3D.cameraPosition = get3DMapCenter()['cameraPosition']"
                            >
                                <v-icon>{{ icons.mdiPinOutline }}</v-icon>
                            </button>
                            <button
                                type="button"
                                class="btn"
                                @click="step.navigation3D.cameraPosition = null"
                            >
                                <v-icon>backspace</v-icon>
                            </button>
                        </div>
                    </div>
                    <p
                        v-if="isCameraPositionDifferent()"
                        class="text-warning"
                    >
                        <small>
                            {{ $t( "additional:modules.tools.dataNarrator.warning.mapMoved" ) }}
                        </small>
                    </p>
                </div>
                <div
                    class="form-group"
                >
                    <label
                        class="form-label"
                        for="step-3d-heading"
                    >
                        {{ $t( "additional:modules.tools.dataNarrator.label.heading" ) }}
                    </label>

                    <div
                        class="stepForm-inputs-centerCoordinate stepForm-3d-others"
                    >
                        <input
                            id="step-3d-heading"
                            class="form-control"
                            :value="step.navigation3D.heading"
                            readonly
                        >
                        <div class="input-group">
                            <button
                                type="button"
                                class="btn"
                                @click="step.navigation3D.heading = get3DMapCenter()['heading']"
                            >
                                <v-icon>{{ icons.mdiPinOutline }}</v-icon>
                            </button>
                            <button
                                type="button"
                                class="btn"
                                @click="step.navigation3D.heading = null"
                            >
                                <v-icon>backspace</v-icon>
                            </button>
                        </div>
                    </div>
                    <p
                        v-if="
                            mapMovedPosition.heading && step.navigation3D.heading && step.navigation3D.heading !== mapMovedPosition.heading "
                        class="text-warning"
                    >
                        <small>
                            {{ $t( "additional:modules.tools.dataNarrator.warning.mapMoved" ) }}
                        </small>
                    </p>
                </div>
                <div
                    class="form-group"
                >
                    <label
                        class="form-label"
                        for="step-3d-pitch"
                    >
                        {{ $t( "additional:modules.tools.dataNarrator.label.pitch" ) }}
                    </label>
                    <div
                        class="stepForm-inputs-centerCoordinate stepForm-3d-others"
                    >
                        <input
                            id="step-3d-pitch"
                            class="form-control"
                            :value="step.navigation3D.pitch"
                            readonly
                        >

                        <div class="input-group">
                            <button
                                type="button"
                                class="btn"
                                @click="step.navigation3D.pitch = get3DMapCenter()['pitch']"
                            >
                                <v-icon>add_circle</v-icon>
                            </button>
                            <button
                                type="button"
                                class="btn"
                                @click="step.navigation3D.pitch = null"
                            >
                                <v-icon>backspace</v-icon>
                            </button>
                        </div>
                    </div>
                    <p
                        v-if="mapMovedPosition.pitch && step.navigation3D.pitch &&
                            step.navigation3D.pitch !== mapMovedPosition.pitch"
                        class="text-warning"
                    >
                        <small>
                            {{ $t( "additional:modules.tools.dataNarrator.warning.mapMoved" ) }}
                        </small>
                    </p>
                </div>
            </div>

            <div
                v-else
            >
                <div
                    class="form-group"
                >
                    <label
                        class="form-label"
                        for="step-center"
                    >
                        {{ $t( "additional:modules.tools.dataNarrator.label.centerCoordinate" ) }}
                    </label>

                    <div class="stepForm-inputs-centerCoordinate">
                        <input
                            id="step-center"
                            :key="`centerCoordinatex${key}`"
                            class="form-control"
                            :value="step.centerCoordinate && step.centerCoordinate[0]"
                            readonly
                        >
                        <input
                            :key="`centerCoordinatey${key}`"
                            class="form-control"
                            :value="step.centerCoordinate && step.centerCoordinate[1]"
                            readonly
                        >

                        <div class="input-group d-flex justify-content-center">
                            <v-tooltip top>
                                <template #activator="{ on }">
                                    <v-icon
                                        class="ml-2 mr-1"
                                        v-on="on"
                                        @click="() => {key++;step.centerCoordinate = center()}"
                                    >
                                        {{ icons.mdiPinOutline }}
                                    </v-icon>
                                </template>
                                <span>
                                    {{ $t("additional:modules.tools.dataNarrator.label.centerCoordinate") }}
                                </span>
                            </v-tooltip>
                            <v-tooltip top>
                                <template #activator="{ on }">
                                    <v-icon
                                        class="ml-2 mr-1"
                                        v-on="on"
                                        @click="step.centerCoordinate = null"
                                    >
                                        {{ icons.mdiBackspaceOutline }}
                                    </v-icon>
                                </template>
                                <span>
                                    {{ $t("additional:modules.tools.dataNarrator.label.centerCoordinate") }}
                                </span>
                            </v-tooltip>
                        </div>
                    </div>
                    <p
                        v-if="step.centerCoordinate && step.centerCoordinate !== center() "
                        class="text-warning"
                    >
                        <small>
                            {{ $t( "additional:modules.tools.dataNarrator.warning.mapMoved" ) }}
                        </small>
                    </p>
                </div>

                <div
                    class="form-group"
                >
                    <label
                        class="form-label"
                        for="step-zoom"
                    >
                        {{ $t( "additional:modules.tools.dataNarrator.label.zoomLevel" ) }}
                    </label>

                    <div class="stepForm-inputs-zoomLevel">
                        <input
                            id="step-zoom"
                            :key="`zoom${key}`"
                            class="form-control"
                            :value="step.zoomLevel"
                            readonly
                        >

                        <div class="input-group d-flex justify-content-center">
                            <v-tooltip top>
                                <template #activator="{ on }">
                                    <v-icon
                                        class="ml-2 mr-1"
                                        v-on="on"
                                        @click="() => {key++;step.zoomLevel = zoom()}"
                                    >
                                        {{ icons.mdiPinOutline }}
                                    </v-icon>
                                </template>
                                <span>
                                    {{ $t("additional:modules.tools.dataNarrator.label.zoomLevel") }}
                                </span>
                            </v-tooltip>
                            <v-tooltip top>
                                <template #activator="{ on }">
                                    <v-icon
                                        class="ml-2 mr-1"
                                        v-on="on"
                                        @click="step.zoomLevel = null"
                                    >
                                        {{ icons.mdiBackspaceOutline }}
                                    </v-icon>
                                </template>
                                <span>
                                    {{ $t("additional:modules.tools.dataNarrator.label.zoomLevel") }}
                                </span>
                            </v-tooltip>
                        </div>
                    </div>
                    <p
                        v-if="step.zoomLevel !== null && step.zoomLevel !== zoom()"
                        class="text-warning"
                    >
                        <small>
                            {{ $t( "additional:modules.tools.dataNarrator.warning.mapZoomed" ) }}
                        </small>
                    </p>
                </div>
            </div>

            <BackgroundMap
                :selected-id="backgroundMapId"
                :background-maps="backgroundMaps"
                @update:background-map-id="setBackgroundMap"
            />

            <LayerSelector
                :items="allLayerOptions.plainLayers"
                :selected.sync="step.layers"
                legend="additional:modules.tools.dataNarrator.label.layers"
            />

            <LayerSelector
                :items="allLayerOptions.layers3D"
                :selected.sync="step.layers3D"
                legend="additional:modules.tools.dataNarrator.label.layers3D"
            />

            <div class="form-group">
                <v-tooltip top>
                    <template #activator="{ on }">
                        <label
                            class="form-label"
                            for="own_dataSource"
                            v-on="on"
                        >
                            {{ $t("additional:modules.tools.dataNarrator.label.ownDatasource") }}
                        </label>

                        <v-icon
                            dense
                            small
                            v-on="on"
                        >
                            {{ icons.mdiHelpCircleOutline }}
                        </v-icon>
                    </template>
                    <span>
                        {{ $t("additional:modules.tools.dataNarrator.dashboardView.description") }}
                    </span>
                </v-tooltip>
                <v-expansion-panels
                    id="step-layer"
                    class="expansion-panels"
                    dense
                    nav
                    elevation="1"
                >
                    <v-expansion-panel
                        v-for="(item) in rawDatasources"
                        :key="item.key"
                        color="primary"
                    >
                        <v-expansion-panel-header>
                            <v-list-item-title>{{ item.name }}</v-list-item-title>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <v-icon
                                color="grey lighten-1"
                                @click="removeDatasource(item)"
                            >
                                {{ icons.mdiClose }}
                            </v-icon>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-expansion-panels>
                <v-container>
                    <v-row no-gutters>
                        <v-col cols="11">
                            <label
                                class="form-label"
                                for="own_dataSource"
                            />
                            <input
                                id="own_dataSource"
                                ref="own_dataSource_input"
                                type="file"
                                name="ownDataSource"
                                class="form-control"
                                accept=".kml, .geojson, .json, .gpx"
                                multiple
                                @change="onCustomDataUpload"
                            >
                        </v-col>
                        <v-col cols="1">
                            <v-tooltip top>
                                <template #activator="{ on }">
                                    <v-icon
                                        class="ml-2 mr-1"
                                        v-on="on"
                                        @click="toggleDrawTool"
                                    >
                                        {{ icons.mdiPencilOutline }}
                                    </v-icon>
                                </template>
                                <span>
                                    {{ $t("additional:modules.tools.dataNarrator.label.openDrawTool") }}
                                </span>
                            </v-tooltip>
                        </v-col>
                    </v-row>
                </v-container>
            </div>

            <div class="form-group">
                <label
                    class="form-label"
                    for="own_wmsLayers"
                >
                    {{ $t("additional:modules.tools.dataNarrator.label.ownWmsLayers") }}
                </label>
                <v-expansion-panels
                    id="step-layer"
                    class="expansion-panels"
                    dense
                    nav
                    elevation="1"
                >
                    <v-expansion-panel
                        v-for="(item, index) in allWmsLayers"
                        :key="index"
                        color="primary"
                    >
                        <v-expansion-panel-header>
                            <v-list-item-title>{{ item.url }}</v-list-item-title>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <v-treeview
                                :key="`wmsLayers${index}${key}`"
                                :selected="wmsLayers.map(({url, selectedLayers}) => url === item.url ? selectedLayers : [])"
                                selectable
                                :items="item.selectedLayers"
                                item-key="Name"
                                item-text="Title"

                                @input="updateSelectedCapabilities($event, item.url, item.selectedLayers)"
                            />
                            <!-- <WmsCapabilitiesSelector
                                :items="capabilityOptions(item.url)"
                                :selected.sync="item.selectedLayers"
                            /> -->
                            <v-icon
                                color="grey lighten-1"
                                @click="onWmsLayerRemove(item)"
                            >
                                {{ icons.mdiClose }}
                            </v-icon>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-expansion-panels>
                <v-row>
                    <v-col>
                        <input
                            id="own_wmsLayers"
                            ref="own_wmsLayers_input"
                            type="text"
                            name="ownWms"
                            class="form-control"
                            @change="onWmsLayersAdd"
                        >
                    </v-col>
                </v-row>
            </div>

            <div class="form-group">
                <v-btn
                    color="primary"
                    @click="open3D"
                >
                    {{ $t( "additional:modules.tools.dataNarrator.label.threeDFiles" ) }}
                </v-btn>
            </div>

            <div class="form-group">
                <label
                    class="form-label required"
                    for="step-vue-editor"
                >
                    {{ $t( "additional:modules.tools.dataNarrator.label.htmlContent" ) }}
                </label>

                <div class="stepForm-inputs-htmlEditor">
                    <VueEditor
                        id="step-vue-editor"
                        v-model="step.html"
                        :editor-toolbar="constants.htmlEditorToolbar"
                        use-custom-image-handler
                        @image-added="onAddImage"
                        @image-removed="onRemoveImage"
                    />
                </div>
            </div>

            <v-expansion-panels
                id="advanced-options"
                class="expansion-panels"
                elevation="1"
            >
                <v-expansion-panel>
                    <v-expansion-panel-header>
                        {{
                            $t("additional:modules.tools.dataNarrator.label.advancedOptions")
                        }}
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <div class="form-group">
                            <label
                                class="form-label"
                                for="step-width"
                            >
                                {{ $t("additional:modules.tools.dataNarrator.label.stepWidth") }}
                            </label>

                            <input
                                id="step-width"
                                class="form-control"
                                type="number"
                                :value="step.stepWidth"
                                :min="minStepWidth"
                                :max="maxStepWidth"
                                step="10"
                                @change="onChangeStepWidth"
                            >
                        </div>
                        <div class="form-group">
                            <label
                                class="form-label"
                                for="step-addons"
                            >
                                {{ $t( "additional:modules.tools.dataNarrator.label.interactionAddons" ) }}
                            </label>
                            <v-select
                                id="step-addons"
                                v-model="step.interactionAddons"
                                :items="addonOptions"
                                multiple
                                dense
                                solo
                                hide-details
                            />
                        </div>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-expansion-panels>


            <v-footer
                class="tool-dataNarrator-creator-actions white"
                elevation="2"
                rounded
            >
                <v-card
                    v-if="!mobile"
                    flat
                    tile
                    width="100%"
                    class="lighten-1 text-center"
                >
                    <v-card-text>
                        <v-tooltip top>
                            <template #activator="{ on }">
                                <span
                                    id="cancel-button"
                                    class="mr-1"
                                    v-on="on"
                                >
                                    <v-btn
                                        class=""
                                        icon
                                        @click="$emit('return')"
                                    >
                                        <v-icon size="24px">{{ icons.mdiCancel }}</v-icon>
                                    </v-btn>
                                </span>
                            </template>
                            <span>
                                {{ $t("additional:modules.tools.dataNarrator.button.cancel") }}
                            </span>
                        </v-tooltip>
                        <v-tooltip top>
                            <template #activator="{ on }">
                                <span
                                    id="delete-button"
                                    class="mr-1"
                                    v-on="on"
                                >
                                    <v-btn
                                        class=""
                                        icon
                                        @click="onDeleteStep"
                                    >
                                        <v-icon size="24px">{{ icons.mdiTrashCanOutline }}</v-icon>
                                    </v-btn>
                                </span>
                            </template>
                            <span>
                                {{ $t("additional:modules.tools.dataNarrator.button.deleteStep") }}
                            </span>
                        </v-tooltip>
                        <v-tooltip top>
                            <template #activator="{ on }">
                                <span
                                    id="save-button"
                                    class="mr-1"
                                    v-on="on"
                                >
                                    <v-btn
                                        class=""
                                        icon
                                        :disabled="!isValid"
                                        @click="onSubmit"
                                    >

                                        <v-icon size="24px">{{ icons.mdiCheck }}</v-icon>
                                    </v-btn>
                                </span>
                            </template>
                            <span>
                                {{
                                    $t(editedStep
                                        ? "additional:modules.tools.dataNarrator.button.submitEditStep"
                                        : "additional:modules.tools.dataNarrator.button.submitAddStep")
                                }}
                            </span>
                        </v-tooltip>
                    </v-card-text>
                </v-card>
                <v-container
                    v-else
                    fluid
                    class="white"
                >
                    <v-row
                        class="mb-2"
                        no-gutters
                    >
                        <v-col>
                            <v-btn
                                class=""
                                small
                                color="red"
                                min-width="100%"
                                @click="$emit('return')"
                            >
                                <span>
                                    {{ $t("additional:modules.tools.dataNarrator.button.cancel") }}
                                </span>
                            </v-btn>
                        </v-col>
                        <v-col>
                            <v-btn
                                class=""
                                small
                                color="red"
                                min-width="100%"
                                @click="onDeleteStep"
                            >
                                <span>{{ $t("additional:modules.tools.dataNarrator.button.deleteStep") }}</span>
                            </v-btn>
                        </v-col>
                    </v-row>

                    <v-row
                        class="mb-2"
                        no-gutters
                    >
                        <v-btn
                            class=""
                            small
                            color="green"
                            :disabled="!isValid"
                            @click="onSubmit"
                        >
                            <span>
                                {{
                                    $t(editedStep
                                        ? "additional:modules.tools.dataNarrator.button.submitEditStep"
                                        : "additional:modules.tools.dataNarrator.button.submitAddStep")
                                }}
                            </span>
                        </v-btn>
                    </v-row>
                </v-container>
            </v-footer>

            <v-alert
                v-show="!isValid"
                id="tool-dataNarrator-creator-noHTML"
                type="info"
            >
                {{ $t("additional:modules.tools.dataNarrator.warning.sendNoHTML") }}
            </v-alert>
        </form>
    </div>
</template>

<style lang="scss" scoped>

#heroicon {
    width: 1.5rem;
    height: 1.5rem;
}
#tool-dataNarrator-creator-stepForm {
    max-width: 460px;
    position: relative;

    #tool-dataNarrator-creator-noHTML {
        margin-top: 10px;
    }

    #advanced-options {
        margin-bottom: 10px;
    }

    .expansion-panels {
        z-index: 1;
        margin-bottom: 10px;
    }

    .tool-dataNarrator-creator-actions {
        z-index:2;
        position: sticky;
        bottom:0;
    }

    &::v-deep {
        .v-text-field.v-text-field--enclosed:not(.v-text-field--rounded)
        > .v-input__control
        > .v-input__slot {
            margin: 0;
            padding: 0 0 0 0.3125rem;
        }

        .v-text-field.v-text-field--solo:not(.v-text-field--solo-flat)
        > .v-input__control
        > .v-input__slot {
            height: 34px;
            height: 34px;
            font-size: 14px;
            border: 1px solid #ccc;
            border-radius: 0;
            box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
        }

        .v-text-field.v-text-field--solo.v-input--is-focused:not(.v-text-field--solo-flat)
        > .v-input__control
        > .v-input__slot {
            border-color: #66afe9;
            outline: 0;
            box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.08),
            0 0 8px rgba(102, 175, 233, 0.6);
        }
    }

    label.required:after { content: '*';color:red; }

    .stepForm-inputs-centerCoordinate {
        display: grid;
        grid-template-columns: 1fr 1fr 100px;
        grid-gap: 5px;
        align-items: end;
    }

    .stepForm-3d-others {
        grid-template-columns: 1fr 1fr !important;
    }

    .stepForm-inputs-3d-position {
        grid-template-columns: 1fr 1fr 1fr 1fr !important;
    }

    .stepForm-inputs-zoomLevel {
        display: grid;
        grid-template-columns: 1fr 100px;
        grid-gap: 5px;
        align-items: end;
    }

    .stepForm-inputs-htmlEditor {
        background-color: "#ffffff";
    }
}
</style>
