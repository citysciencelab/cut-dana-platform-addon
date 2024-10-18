<script>
import {
    mdiCancel,
    mdiCheck,
    mdiClose,
    mdiHelpCircleOutline,
    mdiHomePlusOutline,
    mdiMapMarkerPlusOutline,
    mdiPencilOutline,
    mdiPinOutline,
    mdiTrashCanOutline
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
import modelerGetters from "../../../../../src/modules/modeler3D/store/gettersModeler3D.js";
import {getMimeTypeFromExtension} from "../../utils/fileDataType";

import BackgroundMap from "./inputs/BackgroundMapSelect.vue";

import LayerUtilities from "../../mixins/LayerUtilities";
import ThreeDUtilities from "../../mixins/ThreeDUtilities";

import RenderUtilities from "../../mixins/RenderUtilities";
import * as cesiumUtils from "../../utils/cesium";
import LayerSelectedPreview from "./inputs/LayerSelectedPreview.vue";


export default {
    name: "StepForm",
    components: {
        LayerSelectedPreview,
        VueEditor,
        BackgroundMap
    },
    mixins: [LayerUtilities, ThreeDUtilities, RenderUtilities],
    props: {
        // The initial values for a step to edit
        editedStep: {
            type: Object,
            default: () => ({...constants.emptyStep})
        },
        addToChapter: {
            type: Number,
            default: -1
        }
    },
    data () {
        return {
            constants,
            getFileExtension,
            visibleBackgroundMap: null,
            preventDestroyActions: false,
            minStepWidth: 280,
            maxStepWidth: 1000,
            step: {_id: uuid.v4(), layers: [], layers3D: [], is3D: this.editedStep.is3D || false, ...this.editedStep},
            images: this.$store.state.Tools.DataNarrator.htmlContentsImages[this.editedStep?._id] || [],
            is3DLayerActive: false,

            backgroundMapId: this.editedStep?.backgroundMapId || constants.defaultMap,
            stepNameRules: [
                value => Boolean(value) || this.$t("additional:modules.tools.dataNarrator.warning.requiredFields"),
                value => (value && value.length >= 5) || this.$t("additional:modules.tools.dataNarrator.warning.requiredFieldMinCharacters")
            ],
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
                mdiClose,
                mdiHelpCircleOutline,
                mdiPencilOutline,
                mdiMapMarkerPlusOutline,
                mdiHomePlusOutline
            },
            rawDatasources: this.editedStep?.datasources || [],
            datasources: [],
            wmsLayers: this.editedStep?.wmsLayers || [],
            allWmsLayers: [],
            drawToolOpen: false,

            key: 0,
            cesiumEnabled: false,
            temp: {
                is3D: this.editedStep.is3D || false
            },
            colors: ["#236051", "#413FAB", "#893D05", "#584560"]
        };
    },
    computed: {
        ...mapGetters("Tools/DataNarrator", Object.keys(getters)),
        ...mapGetters("Tools/FileImportAddon", Object.keys(fileImportGetters)),
        ...mapGetters("Tools/Modeler3D", Object.keys(modelerGetters)),
        ...mapGetters(["isMobile",
            "layerConfigsByAttributes"]),
        ...mapActions("Maps", ["addLayer"]),


        /**
         * New chapter number
         * @returns {Number} the new chapter number
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
            const bgMaps = this.layerConfigsByAttributes({
                    baselayer: true,
                    showInLayerTree: true
                }),
                newBgMaps = [];

            for (const bgMap of bgMaps) {
                const foundBgMap = this.layerConfigsByAttributes({id: bgMap.id});

                if (!foundBgMap) {
                    this.addLayer(foundBgMap);
                }
                newBgMaps.push(foundBgMap);
            }

            return newBgMaps;
        }


    },
    watch: {
        /**
         * Toggles map 3D layers according to the selection for the step
         * @param {Array} newSelectedLayerIds the selected layers
         * @returns {void}
         */
        "step.layers3D" (newSelectedLayerIds) {
            this.watchStepLayers3D(this.step, newSelectedLayerIds);
        },

        /**
         * Toggles map layers according to the selection for the step
         * @param {Array} newSelectedLayerIds the selected layers
         * @returns {void}
         */
        "step.layers" (newSelectedLayerIds) {
            this.watchStepLayers(this.step, newSelectedLayerIds);
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
            console.log("is3d");
            this.step.navigation3D = this.get3DMapCenter();
            this.mapMovedPosition = this.step.navigation3D;
            this.step.is3D = newState;
        },

        "step.is3D" (value) {
            this.step.is3D = value;
            this.activate3DMap(value);
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
        }
    },
    async mounted () {
        this.loadStep();
    },

    beforeDestroy () {
        if (!this.preventDestroyActions) {
            this.disableLayersByName(this.importedFileNames);
            this.disableStepLayers(this.step);


            this.$store.commit("Maps/setMode", "2D");
            this.$store.commit("Tools/Draw/setActive", false);
            this.switchBackgroundMap(this.visibleBackgroundMap);
        }
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

        async getCameraPosition () {

            if (!this.step.navigation3D) {
                await this.set3DMapCenter();
            }

            return this.step.navigation3D.cameraPosition;
        },


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

        /**
         * Switches the background map
         * @param {String} value the value of the background map
         * @returns {void}
         */

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

                        this.addFiles([file]);
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
        addFiles (files) {
            Array.from(files).forEach(file => {
                const reader = new FileReader();

                reader.onload = f => {
                    const layerName = this.getLayerNameFromFile(file.name),
                        checkSameLayer = this.importedFileNames.filter(importedFileName => {
                            return this.getLayerNameFromFile(file.name) === this.getLayerNameFromFile(importedFileName);
                        });

                    this.importKML({
                        raw: f.target.result,
                        checkSameLayer: checkSameLayer,
                        layerName: layerName,
                        filename: file.name,
                        pointImages: this.pointImages,
                        textColors: this.textColors,
                        textSizes: this.textSizes
                    });
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
            this.datasources = event;
            if (this.datasources.length > 0) {
                this.addFiles(this.datasources);
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
                    return this.layerConfigsByAttributes({id: capability.Title});
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
         * Sends deleteStep event to StoryCreator
         * @returns {void}
         */
        onDeleteStep () {
            const {associatedChapter, stepNumber} = this.editedStep || this.step;

            this.$emit("deleteStep", this.step, associatedChapter, stepNumber);
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
                    chapterTitle: this.step.chapterTitle
                });
            }

            if (this.step.chapterTitle !== this.currentStory.chapters[this.step.associatedChapter - 1].chapterTitle) {
                this.currentStory.steps = this.currentStory.steps.map(step => {
                    if (step.associatedChapter === this.step.associatedChapter) {
                        return {...step, chapterTitle: this.step.chapterTitle};
                    }
                    return step;
                });
                this.currentStory.chapters[this.step.associatedChapter - 1].chapterTitle = this.step.chapterTitle;
            }
            const newDatasources = Array.from(this.datasources);

            for (const raw of this.rawDatasources) {
                newDatasources.push(raw);
            }

            this.saveStoryStep({
                step: this.step,
                images: this.images,
                datasources: newDatasources,
                wmsLayers: this.wmsLayers
            });

            for (const layer of this.wmsLayers) {
                this.hideWmsLayer(layer.url);
            }
            // Trigger submit action to return to story overview
            this.$emit("return");
        },

        /**
         * Sets the 3D map center
         * @returns {void}
         */
        async set3DMapCenter () {
            this.step.navigation3D = await this.get3DMapCenter();
            if (this.step.navigation3D &&
                this.step.navigation3D.cameraPosition[0] &&
                this.step.navigation3D.cameraPosition[1] &&
                this.step.navigation3D.cameraPosition[2] &&
                this.step.navigation3D.heading &&
                this.step.navigation3D.pitch) {
                const camera = this.cesiumCamera();

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

            const isMap3d = this.isMap3D(); // Get this value from the ThreeDUtilities Mixin

            if (this.step.is3D && !isMap3d) {
                // Found in the ThreeDUtilities Mixin
                await this.enable3D();

                this.step.navigation3D = this.get3DMapCenter();
                this.mapMovedPosition = this.step.navigation3D;

                this.cesiumScene().camera.moveEnd.addEventListener(() => {
                    this.mapMovedHandler();
                });

                this.cesiumEnabled = true;

            }
            else if (!this.step.is3D && isMap3d) {
                // Found in the ThreeDUtilities Mixin
                await this.toggle3DMode(false);
            }
            this.temp.is3D = this.step.is3D;
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

            return this.step.navigation3D[0] && this.mapMovedPosition.cameraPosition[0]
                && (this.getCameraPosition()[0] !== this.mapMovedPosition.cameraPosition[0]
                    || this.getCameraPosition()[1] !== this.mapMovedPosition.cameraPosition[1]
                    || this.getCameraPosition()[2] !== this.mapMovedPosition.cameraPosition[2]);

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

            this.$emit(
                "openFileForm",
                this.step
            );
        },

        /**
         * Toggles the draw tool
         * @returns {void}
         */

        toggleDrawTool () {
            this.drawToolOpen = !this.drawToolOpen;
            this.$store.commit("Tools/Draw/setActive", this.drawToolOpen);
        },

        /**
         * Prevents the destroy actions to be called - we want to keep everything at this point
         * @returns {void}
         */

        openLayerEditor () {
            this.preventDestroyActions = true;
            this.$emit("openLayerEditor", this.step);
        },

        /**
         * Prevents the destroy actions to be called - we want to keep everything at this point
         * @returns {void}
         */

        openDataEditor () {
            this.preventDestroyActions = true;
            this.$emit("openDataEditor", this.step);
        },

        /**
         * Handles all the loading of the step
         * @returns {void}
         */
        async loadStep () {
            console.log("load");
            if (this.step.is3D && !this.is3D) {
                this.activate3DMap(true);

                await this.cesiumCamera().moveEnd.addEventListener(this.mapMovedHandler);
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
            if (Object.hasOwn(this.editedStep, "associatedChapter")) {
                this.step = this.editedStep;
            }
            else if (this.addToChapter > 0) {
                // Needs to be assigned like this for object change detection
                this.step = Object.assign({}, this.step, {associatedChapter: this.addToChapter});
                this.step = Object.assign({}, this.step, {chapterTitle: this.currentStory.chapters[this.addToChapter - 1].chapterTitle});
            }
            else {
                const diff = this.currentStory.chapters.length > 1 ? 2 : 1;

                // this.step.associatedChapter = JSON.parse(JSON.stringify(this.currentStory.chapters[this.currentStory.chapters.length - diff]));
                this.step = Object.assign({}, this.step, {associatedChapter: this.currentStory.chapters.length + 1});
            }

            if (!this.step.stepNumber) {
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

            // Radio.trigger("Menu", "rerender");
        }

    }
};
</script>

<template lang="html">
    <div
        id="tool-dataNarrator-creator-stepForm"
        class="mb-1"
    >
        <form @submit.prevent="onSubmit">
            <div class="form-group">
                <v-row
                    v-if="step.associatedChapter"
                    class="form-input-holder xs pr-4"
                >
                    <v-col
                        class="d-flex align-self-center"
                        cols="1"
                    >
                        <v-btn
                            :key="step.associatedChapter"
                            :style="{backgroundColor: colorFor(step.associatedChapter).main}"
                            :title="
                                $t(
                                    'additional:modules.tools.dataNarrator.label.chapter'
                                )
                            "
                            class="story-step-button pill-button horizontal chapter-indicator"
                            icon
                        >
                            {{ chapterLetter(step.associatedChapter) }}
                        </v-btn>
                    </v-col>

                    <v-col
                        class="text-center chapter-title-holder"
                        cols="11"
                    >
                        <v-text-field
                            id="chapter-title"
                            v-model="step.chapterTitle"
                            :label="$t(
                                'additional:modules.tools.dataNarrator.label.chapterTitle'
                            )"
                            :rules="stepNameRules"
                            class="vue-text-all-top"
                            hide-details="auto"
                        />
                    </v-col>
                </v-row>
            </div>

            <div class="form-group form-input-holder lg">
                <v-row class="pr-3">
                    <v-col
                        class="d-flex align-self-center "
                        cols="1"
                    >
                        <v-btn
                            v-if="step.associatedChapter"
                            :style="{color: colorFor(step.associatedChapter).main}"
                            :title="
                                $t(
                                    'additional:modules.tools.dataNarrator.label.stepNumber'
                                )
                            "
                            class="story-step-button pill-button step-indicator"
                            icon
                        >
                            {{ step.stepNumber }}
                        </v-btn>
                    </v-col>
                    <v-col
                        class="d-flex align-self-center step-title-holder"
                        cols="11"
                    >
                        <v-text-field
                            id="step-title"
                            v-model="step.title"
                            :label="$t(
                                'additional:modules.tools.dataNarrator.label.stepTitle'
                            )"
                            :rules="stepNameRules"
                            class="vue-text-all-top"
                            hide-details="auto"
                        />
                    </v-col>
                </v-row>
                <v-row class="mb-2">
                    <v-col
                        class="d-flex align-self-center "
                        cols="12"
                    >
                        <div class="stepForm-inputs-htmlEditor">
                            <VueEditor
                                id="step-vue-editor"
                                v-model="step.html"
                                :editor-toolbar="constants.htmlEditorToolbar"
                                :placeholder="$t('additional:modules.tools.dataNarrator.label.htmlContent')"
                                use-custom-image-handler
                                @image-added="onAddImage"
                                @image-removed="onRemoveImage"
                            />
                        </div>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col
                        class="d-flex align-self-center"
                        cols="12"
                    >
                        <div class="vue-label-style">
                            {{ $t("additional:modules.tools.dataNarrator.label.mapDisplay") }}
                        </div>
                    </v-col>
                </v-row>
                <!--                TODO: Hier kam vom Remote <div v-if="temp.is3D"> ist das wichtig? Löst das etwas-->
                <v-row
                    v-if="step.is3D && cesiumEnabled"
                    class="mb-2"
                >
                    <v-col
                        class="d-flex align-self-center mr-2"
                        cols="3"
                    >
                        <v-text-field
                            id="step-center-3d-0"
                            :class="{'positon_change': mapMovedPosition.heading && step.navigation3D.heading && step.navigation3D.heading !== mapMovedPosition.heading}"
                            :label="$t(
                                'additional:modules.tools.dataNarrator.label.heading'
                            )"
                            :title="$t(
                                'additional:modules.tools.dataNarrator.label.heading'
                            )"
                            :value="step.navigation3D.heading"
                            class="vue-text-all-top small-fieldset"
                            dense
                            disabled
                            hide-details
                            outlined
                        />
                    </v-col>
                    <v-col
                        class="d-flex align-self-center mr-2"
                        cols="1"
                    >
                        <v-btn
                            :title="
                                $t(
                                    'additional:modules.tools.dataNarrator.label.heading'
                                )
                            "
                            icon
                            @click="step.navigation3D.heading = get3DMapCenter()['heading']"
                        >
                            <v-icon>{{ icons.mdiPinOutline }}</v-icon>
                        </v-btn>
                    </v-col>
                    <v-col
                        class="d-flex align-self-center"
                        cols="3"
                    >
                        <v-text-field
                            id="step-center-3d-0"
                            :class="{'positon_change': mapMovedPosition.pitch && step.navigation3D.pitch && step.navigation3D.pitch !== mapMovedPosition.pitch}"
                            :label="$t(
                                'additional:modules.tools.dataNarrator.label.pitch'
                            )"
                            :title="$t(
                                'additional:modules.tools.dataNarrator.label.pitch'
                            )"
                            :value="step.navigation3D.pitch"
                            class="vue-text-all-top small-fieldset"
                            dense
                            disabled
                            hide-details
                            outlined
                        />
                    </v-col>
                    <v-col
                        class="d-flex align-self-center"
                        cols="1"
                    >
                        <v-btn
                            :title="
                                $t(
                                    'additional:modules.tools.dataNarrator.label.pitch'
                                )
                            "
                            icon

                            @click="step.navigation3D.pitch = get3DMapCenter()['pitch']"
                        >
                            <v-icon>{{ icons.mdiPinOutline }}</v-icon>
                        </v-btn>
                    </v-col>
                </v-row>

                <v-row
                    v-if="step.is3D && cesiumEnabled"
                    class="mb-2"
                >
                    <v-col
                        class="d-flex align-self-center mr-2"
                        cols="3"
                    >
                        <v-text-field
                            id="step-center-3d-0"
                            :class="{'positon_change': step.is3D && cesiumEnabled && isCameraPositionDifferent()}"
                            :label="$t(
                                'additional:modules.tools.dataNarrator.label.longitude'
                            )"
                            :title="$t(
                                'additional:modules.tools.dataNarrator.label.longitude'
                            )"
                            :value="step.navigation3D.cameraPosition[0] || cesiumScene.camera.position[0]"
                            class="vue-text-all-top small-fieldset"
                            dense
                            disabled
                            hide-details
                            outlined
                        />
                    </v-col>
                    <v-col
                        class="d-flex align-self-center mr-2"
                        cols="3"
                    >
                        <v-text-field
                            id="step-center-3d-1"
                            :class="{'positon_change': step.is3D && cesiumEnabled && isCameraPositionDifferent()}"
                            :label="$t(
                                'additional:modules.tools.dataNarrator.label.latitude'
                            )"
                            :title="$t(
                                'additional:modules.tools.dataNarrator.label.latitude'
                            )"
                            :value="step.navigation3D.cameraPosition[1] || cesiumScene.camera.position[1]"
                            class="vue-text-all-top small-fieldset"
                            dense
                            disabled
                            hide-details
                            outlined
                        />
                    </v-col>
                    <v-col
                        class="d-flex align-self-center"
                        cols="3"
                    >
                        <v-text-field
                            id="step-center-3d-2"
                            :class="{'positon_change': step.is3D && cesiumEnabled && isCameraPositionDifferent()}"
                            :label="$t(
                                'additional:modules.tools.dataNarrator.label.height'
                            )"
                            :title="$t(
                                'additional:modules.tools.dataNarrator.label.height'
                            )"
                            :value="step.navigation3D.cameraPosition[2] || cesiumScene.camera.position[2]"
                            class="vue-text-all-top small-fieldset"
                            dense
                            disabled
                            hide-details
                            outlined
                        />
                    </v-col>

                    <v-col
                        class="d-flex justify-center align-self-start"
                        cols="1"
                    >
                        <v-btn
                            :title="
                                $t(
                                    'additional:modules.tools.dataNarrator.label.centerCoordinate'
                                )
                            "
                            icon

                            @click="step.navigation3D.cameraPosition = get3DMapCenter()['cameraPosition']"
                        >
                            <v-icon>{{ icons.mdiPinOutline }}</v-icon>
                        </v-btn>
                    </v-col>
                </v-row>

                <v-row
                    v-if="!step.is3D"
                    class="mb-2"
                >
                    <v-col
                        class="d-flex align-self-center pr-1"
                        cols="3"
                    >
                        <v-text-field
                            id="step-center-lng"
                            :key="`centerCoordinatex${key}`"
                            v-model="step.centerCoordinate && step.centerCoordinate[0]"
                            :class="{'positon_change': step.centerCoordinate && step.centerCoordinate !== center()}"
                            :label="$t(
                                'additional:modules.tools.dataNarrator.label.longitude'
                            )"
                            :title="$t(
                                'additional:modules.tools.dataNarrator.label.longitude'
                            )"
                            class="vue-text-all-top small-fieldset"
                            dense
                            disabled
                            hide-details
                            outlined
                        />
                    </v-col>
                    <v-col
                        class="d-flex align-self-center"
                        cols="3"
                    >
                        <v-text-field
                            id="step-center-lat"
                            :key="`centerCoordinatex${key}`"
                            v-model="step.centerCoordinate && step.centerCoordinate[1]"
                            :class="{'positon_change': step.centerCoordinate && step.centerCoordinate !== center()}"
                            :label="$t(
                                'additional:modules.tools.dataNarrator.label.latitude'
                            )"
                            :title="$t(
                                'additional:modules.tools.dataNarrator.label.latitude'
                            )"
                            class="vue-text-all-top small-fieldset"
                            dense
                            disabled
                            hide-details
                            outlined
                        />
                    </v-col>
                    <v-col
                        class="d-flex justify-center align-self-start"
                        cols="1"
                    >
                        <v-btn
                            :title="
                                $t(
                                    'additional:modules.tools.dataNarrator.label.centerCoordinate'
                                )
                            "
                            icon
                            @click="() => {
                                key++;
                                step.centerCoordinate = center()
                            }"
                        >
                            <v-icon>{{ icons.mdiPinOutline }}</v-icon>
                        </v-btn>
                    </v-col>
                    <v-col
                        class="d-flex align-self-center"
                        cols="3"
                        offset="1"
                    >
                        <v-text-field
                            id="step-zoomlevel"
                            v-model="step.zoomLevel"
                            :class="{'positon_change': step.zoomLevel && step.zoomLevel !== zoom()}"
                            :label="$t(
                                'additional:modules.tools.dataNarrator.label.zoomLevel'
                            )"
                            class="vue-text-all-top small-fieldset"
                            dense
                            disabled
                            hide-details
                            outlined
                        />
                    </v-col>
                    <v-col
                        class="d-flex justify-center align-self-start"
                        cols="1"
                    >
                        <v-btn
                            :title="
                                $t(
                                    'additional:modules.tools.dataNarrator.label.setZoomLevel'
                                )
                            "
                            icon
                            @click="() => {
                                key++;
                                step.zoomLevel = zoom()
                            }"
                        >
                            <v-icon>{{ icons.mdiPinOutline }}</v-icon>
                        </v-btn>
                    </v-col>
                </v-row>
                <v-row
                    v-if="(!step.is3D && step.centerCoordinate && step.centerCoordinate !== center())
                        || (!step.is3D && step.zoomLevel && step.zoomLevel !== zoom())
                        || (step.is3D && ( cesiumEnabled && isCameraPositionDifferent())
                            || (mapMovedPosition.heading && step.navigation3D.heading && step.navigation3D.heading !== mapMovedPosition.heading)
                            || (mapMovedPosition.pitch && step.navigation3D.pitch && step.navigation3D.pitch !== mapMovedPosition.pitch))"
                    class="ma-0 pa-0 mb-2"
                >
                    <v-col
                        class="d-flex justify-center align-self-center"
                        cols="12"
                    >
                        <p
                            class="text-warning"
                        >
                            <small>
                                {{ $t("additional:modules.tools.dataNarrator.warning.mapMoved") }} {{ step.is3D }}
                            </small>
                        </p>
                    </v-col>
                </v-row>
                <v-row class="mb-2">
                    <v-col
                        class="d-flex justify-center align-self-center"
                        cols="12"
                    >
                        <BackgroundMap
                            :background-maps="backgroundMaps"
                            :selected-id="backgroundMapId"
                            @update:background-map-id="setBackgroundMap"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col
                        class="d-flex justify-center align-self-center"
                        cols="12"
                    >
                        <LayerSelectedPreview
                            :selected-layers="getSelectedLayers(step.layers, allLayerOptions.plainLayers)"
                            :selected.sync="step.layers"
                        />
                    </v-col>
                </v-row>
                <v-row class="mb-2">
                    <v-col
                        class="d-flex justify-center align-self-center"
                        cols="12"
                    >
                        <LayerSelectedPreview
                            :selected-layers="getSelectedLayers(step.layers3D, allLayerOptions.layers3D)"
                            :selected.sync="step.layers3D"
                        />
                    </v-col>
                </v-row>
            </div>

            <!-- todo: checkbox wird nicht mehr gebraucht oder? -->
            <div
                v-if="is3DLayerActive"
                class="form-group"
            >
                <label
                    class="form-label"
                    for="step-is3d"
                >
                    {{ $t("additional:modules.tools.dataNarrator.label.is3D") }}
                </label>
                <input
                    id="step-is3d"
                    v-model="step.is3D"
                    class="checkbox"
                    type="checkbox"
                >
            </div>

            <v-row class="mb-3">
                <v-col
                    class="d-flex justify-center align-self-center"
                    cols="12"
                >
                    <v-btn
                        class="add-btn add-layer-btn"
                        small
                        @click="openLayerEditor"
                    >
                        <v-icon left>
                            {{ icons.mdiMapMarkerPlusOutline }}
                        </v-icon>
                        {{ $t("additional:modules.tools.dataNarrator.label.dataLayer") }}
                    </v-btn>
                </v-col>
            </v-row>
            <v-expansion-panels
                id="advanced-options"
                class="expansion-panels"
                elevation="1"
            >
                <v-expansion-panel>
                    <v-expansion-panel-header>
                        {{
                            $t("additional:modules.tools.dataNarrator.label.ownDatasource")
                        }}
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                        <div class="form-group">
                            <v-expansion-panels
                                v-if="rawDatasources.length > 0"
                                id="step-layer"
                                class="expansion-panels"
                                dense
                                elevation="1"
                                nav
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

                            <v-row class="mb-2">
                                <v-col
                                    cols="12"
                                >
                                    <v-file-input
                                        id="own_dataSource"
                                        ref="own_dataSource_input"
                                        :label="$t(
                                            'additional:modules.tools.dataNarrator.label.ownDatasource'
                                        )"
                                        accept=".kml, .geojson, .json, .gpx"
                                        multiple
                                        name="ownDataSource"
                                        @change="onCustomDataUpload"
                                    />
                                </v-col>
                            </v-row>
                            <v-row class="mb-2">
                                <v-col
                                    class="d-flex justify-center align-self-center"
                                    cols="6"
                                    offset="3"
                                >
                                    <v-btn
                                        class="add-btn add-data-btn"
                                        small
                                        @click="toggleDrawTool"
                                    >
                                        <v-icon left>
                                            {{ icons.mdiPencilOutline }}
                                        </v-icon>
                                        {{ $t("additional:modules.tools.dataNarrator.label.openDrawTool") }}
                                    </v-btn>
                                </v-col>
                                <v-col
                                    class="d-flex justify-center align-self-center"
                                    cols="1"
                                    offset="2"
                                >
                                    <v-tooltip top>
                                        <template #activator="{ on }">
                                            <v-icon
                                                dense
                                                small
                                                v-on="on"
                                            >
                                                {{ icons.mdiHelpCircleOutline }}
                                            </v-icon>
                                        </template>
                                        <span>
                                            {{
                                                $t("additional:modules.tools.dataNarrator.dashboardView.drawToolDescription")
                                            }}
                                        </span>
                                    </v-tooltip>
                                </v-col>
                            </v-row>

                            <v-expansion-panels
                                id="step-layer"
                                class="expansion-panels"
                                dense
                                elevation="1"
                                nav
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
                                            :items="item.selectedLayers"
                                            :selected="wmsLayers.map(({url, selectedLayers}) => url === item.url ? selectedLayers : [])"
                                            item-key="Name"
                                            item-text="Title"
                                            selectable

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
                            <v-row class="mb-1">
                                <v-col>
                                    <v-text-field
                                        id="own_wmsLayers"
                                        ref="own_wmsLayers_input"
                                        :label="$t(
                                            'additional:modules.tools.dataNarrator.label.ownWmsLayers'
                                        )"
                                        :title="$t(
                                            'additional:modules.tools.dataNarrator.label.ownWmsLayers'
                                        )"
                                        class="vue-text-all-top small-fieldset"
                                        dense
                                        hide-details
                                        name="ownWms"
                                        outlined
                                        @change="onWmsLayersAdd"
                                    />
                                </v-col>
                            </v-row>

                            <v-row class="mb-2">
                                <v-col
                                    class="d-flex justify-center align-self-center"
                                    cols="12"
                                >
                                    <v-btn
                                        class="add-btn add-data-tool-btn"
                                        small
                                        @click="open3D"
                                    >
                                        <v-icon left>
                                            {{ icons.mdiHomePlusOutline }}
                                        </v-icon>
                                        {{ $t("additional:modules.tools.dataNarrator.label.threeDFiles") }}
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </div>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-expansion-panels>

            <v-expansion-panels
                id="advanced-options"
                class="expansion-panels"
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
                                :max="maxStepWidth"
                                :min="minStepWidth"
                                :value="step.stepWidth"
                                class="form-control"
                                step="10"
                                type="number"
                                @change="onChangeStepWidth"
                            >
                        </div>
                        <div class="form-group">
                            <label
                                class="form-label"
                                for="step-addons"
                            >
                                {{ $t("additional:modules.tools.dataNarrator.label.interactionAddons") }}
                            </label>
                            <v-select
                                id="step-addons"
                                v-model="step.interactionAddons"
                                :items="addonOptions"
                                dense
                                hide-details
                                multiple
                                solo
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
                    class="lighten-1 text-center"
                    flat
                    tile
                    width="100%"
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
                                        :disabled="!isValid"
                                        class=""
                                        icon
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
                    class="white"
                    fluid
                >
                    <v-row
                        class="mb-2"
                        no-gutters
                    >
                        <v-col>
                            <v-btn
                                class=""
                                color="red"
                                min-width="100%"
                                small
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
                                color="red"
                                min-width="100%"
                                small
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
                            :disabled="!isValid"
                            class=""
                            color="green"
                            small
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
    max-width: 470px;
    position: relative;

    .add-btn {
        border-radius: 20px;
        text-transform: none !important;
        min-width: 195px !important;
    }

    .add-layer-btn {
        background-color: #b8e6c2;
    }

    .add-data-btn {
        background-color: #cee1ff;
    }

    .add-data-tool-btn {
        background-color: #E6B8DC;
    }

    #tool-dataNarrator-creator-noHTML {
        margin-top: 10px;
        margin-bottom: 0;
    }

    #advanced-options {
        margin-bottom: 10px;
    }

    .expansion-panels {
        z-index: 1;
        margin-bottom: 10px;
    }

    &:deep {
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

    label.required:after {
        content: '*';
        color: red;
    }

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

    .stepForm-inputs-htmlEditor:deep {
        background: "#fff";
        padding: 0;
        width: 100%;

        .ql-snow.ql-toolbar {
            border-bottom: 0;
            border-top-left-radius: 5px;
            border-top-right-radius: 5px;
        }

        .ql-container.ql-snow {
            border-top: 0;
            border-bottom-left-radius: 5px;
            border-bottom-right-radius: 5px;
        }

        .ql-snow.ql-toolbar button {
            width: 18px;
        }

        .ql-snow.ql-toolbar button svg {
            width: 14px !important;
            height: 14px !important;
        }

        .ql-picker.ql-color-picker svg {
            width: 14px !important;
            height: 14px !important;
        }

        .quillWrapper .ql-picker-label {
            font-size: 12px !important;
        }

        .ql-toolbar.ql-snow .ql-formats {
            margin-right: 3px !important;
        }

        .ql-snow .ql-color-picker, .ql-snow .ql-icon-picker {
            width: 14px !important;
        }
    }

}
</style>
