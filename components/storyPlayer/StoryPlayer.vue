<script>
import axios from "axios";
import {mapActions, mapGetters, mapMutations} from "vuex";
import store from "../../../../../src/app-store";
import fileImportGetters from "../../../../fileImportAddon/store/gettersFileImportAddon";
import actions from "../../store/actionsDataNarrator";
import getters from "../../store/gettersDataNarrator";
import mutations from "../../store/mutationsDataNarrator";
import {getMimeTypeFromExtension} from "../../utils/fileDataType";

import ClassicPlayer from "./ClassicPlayer.vue";
import ScrollyTeller from "./ScrollyTeller.vue";
import TableOfContents from "./TableOfContents.vue";

import LayerUtilities from "../../mixins/LayerUtilities";
import RenderUtilities from "../../mixins/RenderUtilities";

export default {
    name: "StoryPlayer",
    components: {
        ClassicPlayer,
        ScrollyTeller,
        TableOfContents
    },
    mixins: [LayerUtilities, RenderUtilities],
    props: {
        // Step to show
        stepIndex: {
            type: Number,
            default: 0
        }
    },
    data () {
        return {
            visibleBackgroundMap: null,
            currentStepIndex: 0,
            previousStepIndex: 0,
            isChangeFrom3D: false,
            showMode: "",
            steps: [],
            activeTools: [],
            interval: null
        };
    },
    computed: {
        ...mapGetters("Tools/DataNarrator", Object.keys(getters)),
        ...mapGetters("Tools/FileImportAddon", Object.keys(fileImportGetters)),

        /**
         * The current selected step of the story.
         * @returns {Object} current step
         */
        currentStep () {
            return this.currentStory?.steps[this.currentStepIndex];
        },

        chapters () {
            return this.currentStory?.chapters;
        },

        /**
         * The current selected chapter of the story.
         * @returns {number} current chapter
         */
        currentChapter () {
            return (
                this.chapters && this.chapters.find(
                    ({chapterNumber}) => this.currentStep?.associatedChapter === chapterNumber
                )
            );
        },

        backgroundMaps () {
            return Radio.request("ModelList", "getModelsByAttributes", {isBaseLayer: true});
        }
    },
    watch: {
        currentStepIndex (newValue, oldValue) {
            if (newValue !== oldValue) {
                this.previousStepIndex = oldValue;
                this.resizeTool(false, this.initialWidth);
                this.loadStep();
            }
            this.loadStep();
        },
        /**
         * Observes the activeTools array and detects which tools need to be closed
         * @param {Array} newVal Array including tools of active step
         * @param {Array} oldVal Array including tools of previous step
         * @returns {void}
         */
        activeTools (newVal, oldVal) {
            let toolsToRemove = [];

            if (newVal !== oldVal && oldVal !== undefined) {
                toolsToRemove = oldVal.filter(val => {
                    return !newVal.includes(val) || !newVal.length;
                });

                this.deactivateTool(toolsToRemove);
            }
        }
    },
    async mounted () {
        if (this.currentStory) {
            this.loadStep();
            this.showMode = this.currentStory?.displayType ? this.currentStory.displayType : "classic";
            this.currentStepIndex = this.stepIndex;
            if (this.currentStory.steps) {
                this.currentStory.steps.forEach(step => {
                    if (step.wmsLayers) {
                        step.wmsLayers.forEach(async layer => {
                            this.importWMSLayers(layer.url, layer.selectedLayers);
                        });
                    }
                });
            }
        }
        this.activateInterval();
        this.visibleBackgroundMap = this.backgroundMaps.find(model => model.get("isVisibleInMap"))?.id;
    },

    beforeDestroy () {
        // // Hides all story layers

        if (this.currentStory) {
            if (Object.hasOwn(this.currentStory, "displayType") && this.currentStory.displayType.toUpperCase() === "DIPAS") {
                this.$store.commit(
                    "Tools/DipasStorySelector/setActive",
                    true
                );
            }
        }

        this.switchBackgroundMap(this.visibleBackgroundMap);

        if (Radio.request("Map", "isMap3d")) {
            this.disableAllEntities();
            store.dispatch("Maps/deactivateMap3D");
        }


        this.disableOwnDatasource();
        this.disableAllEntities();
    },
    methods: {
        ...mapMutations("Tools/DataNarrator", Object.keys(mutations)),
        ...mapActions("Tools/DataNarrator", Object.keys(actions)),
        // These application wide getters and setters can be found in 'src/modules/map/store'
        ...mapMutations("Map", ["setCenter", "setLayerVisibility"]),
        ...mapGetters("Map", ["layerList", "visibleLayerList", "map"]),
        ...mapActions("Tools/FileImportAddon", [
            "importKML",
            "setSelectedFiletype"
        ]),

        switchBackgroundMap (value) {
            const selectedId = value || this.visibleBackgroundMap;

            if (selectedId) {
                this.backgroundMaps.forEach(model => {
                    const selected = model.get("id") === selectedId;

                    model.setIsSelected(selected);
                    model.setIsVisibleInMap(selected);
                });
            }
        },

        updateSelectedCapabilities (selectedCapabilities, layerUrl, allCapabilities) {

            const layer = this.currentStep.wmsLayers.find(url => url.url === layerUrl),
                layerModels = selectedCapabilities.map(capability => {
                    const parsedModel = Radio.request("Parser", "getItemByAttributes", {layers: capability});

                    let models = [];

                    Radio.trigger("ModelList", "addModelsByAttributes", parsedModel);
                    models = Radio.request("ModelList", "getModelByAttributes", {id: parsedModel.id});

                    return models;
                }),
                allCapabilitiesModels = allCapabilities.map(capability => {
                    return Radio.request("ModelList", "getModelByAttributes", {id: capability.Title});
                });

            allCapabilitiesModels.forEach(model => {
                if (model) {
                    model.setIsVisibleInMap(false);
                    model.set("isSelected", false);
                }
            });

            layerModels.forEach(model => {
                model.setIsVisibleInMap(selectedCapabilities.includes(model.get("layers")));
                model.set("isSelected", selectedCapabilities.includes(model.get("layers")));
            });

            if (layer) {
                layer.selectedLayers = selectedCapabilities;
            }
        },

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
         * Activates a tool
         * @param {Object} toolId the id of the tool to activate
         * @returns {void}
         */
        activateTool (toolId) {
            const configuredTools = this.$store.state.Tools.configuredTools,
                tool = configuredTools.find(({key}) => key === toolId);

            if (tool) {
                const toolKey = tool.key.charAt(0).toUpperCase() + tool.key.slice(1);

                this.$store.commit(
                    `Tools/${toolKey}/setActive`,
                    true
                );
            }
        },

        /**
         * Resets the storyplayer
         * @returns {void}
         */
        resetStoryPlayer () {
            // this.disableStepLayers({...this.currentStep});
            this.resizeTool(false, this.initialWidth);
            this.disableOwnDatasource();
            this.currentStepIndex = 0;
            this.$emit("reset");
        },

        /**
         * Deactivates a tool
         * @param {Array} toolsToRemove Array containing the Ids of the tools to deactivate
         * @returns {void}
         */
        deactivateTool (toolsToRemove) {
            toolsToRemove.forEach(tool => {
                if (tool) {
                    this.$store.commit(
                        `Tools/${tool.charAt(0).toUpperCase() + tool.slice(1)}/setActive`,
                        false
                    );
                }
            });
        },

        /**
         * Changing from click to scroll story mode
         * @returns  {void}
         */
        toggleScrollytelling () {
            this.showMode = this.showMode === "classic" ? "scrolly" : "classic";
        },


        /**
         * Toggles the interval
         * @returns  {void}
         */
        toggleAutoPlay () {
            if (this.interval) {
                this.deactivateInterval();
            }
            else {
                this.activateInterval();
            }
        },

        /**
         * Starts the interval to auto-run the story
         * @returns  {void}
         */
        activateInterval () {
            if (this.currentStory) {
                if (this.currentStory.storyInterval) {
                    this.interval = setInterval(() => {
                        this.currentStepIndex = this.currentStory.steps.length - 1 === this.currentStepIndex
                            ? 0
                            : this.currentStepIndex + 1;
                    }, this.currentStory.storyInterval);
                }
            }
        },

        /**
         * Stops the interval to auto-run the story
         * @returns  {void}
         */
        deactivateInterval () {
            clearInterval(this.interval);
            this.interval = null;
        },

        /**
         * requests all data sources of the current step using axios
         * @returns  {void}  Array of data sources
         */
        getDataSources () {
            if (this.currentStep) {
                const dataSources = this.currentStep.datasources || [];

                for (const dataSource of dataSources) {
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
                        });
                    }


                }

            }
        },

        disableOwnDatasource () {
            this.disableLayersByName(this.importedFileNames);
        },

        async loadThreeDFiles () {
            // Check if 3D map mode needed
            // Toggles 3D map mode

            await store.dispatch("Maps/activateMap3D");

            if (this.currentStory.threeDFiles) {
                this.currentStory.threeDFiles.forEach((item) => {
                    // console.log(this.backendConfig.url);
                    const uri = `${this.backendConfig.url}/files${this.currentStory.threeDFilesId}`,
                        modelData = this.currentStep.selectedModelIds.find(model => {
                            return model.modelId === item.id;
                        });

                    // console.log("modelData", modelData);
                    if (modelData) {
                        this.addEntity({
                            ...item,
                            ...modelData,
                            show: false
                        }, uri);
                    }
                });
            }
        },

        enableThreeDModels () {
            this.disableAllEntities();

            if (this.currentStep.selectedModelIds) {
                this.currentStep.selectedModelIds.forEach((item) => {
                    this.enableEntityVisibility({entityId: item.modelId});
                });
            }
        },

        addEntity (item, path = "") {
            // console.log(item);
            // the item is a file and not a folder
            // const hpr = new Cesium.HeadingPitchRoll(item.orientation.heading, item.orientation.pitch, item.orientation.roll),
            //     quaternion = Cesium.Transforms.headingPitchRollQuaternion(Cesium.Cartesian3.ZERO, hpr),
            // only load the file if the file is a gltf file

            if (item.file && item.file === "gltf") {
                const position = new Cesium.Cartesian3(item.position.x, item.position.y, item.position.z),
                    hpr = new Cesium.HeadingPitchRoll(item.orientation?.heading ? item.orientation.heading : 0, item.orientation?.pitch ? item.orientation.pitch : 0, item.orientation?.roll ? item.orientation.roll : 0),

                    orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);

                this.createEntity({
                    entityId: item.modelId,
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
         * Sets up the tool window and content for the selected step.
         * @returns {void}
         */
        async loadStep () {

            this.disableOwnDatasource();

            if (!this.currentStep) {
                return;
            }

            // Updates the tool width
            if (this.currentStep.stepWidth) {
                this.resizeTool(false, this.currentStep.stepWidth);
            }

            // Toggles 3D map mode
            if (this.currentStep.is3D && !Radio.request("Map", "isMap3d")) {
                await store.dispatch("Maps/activateMap3D");

                await this.loadThreeDFiles();
            }
            else if (!this.currentStep.is3D && Radio.request("Map", "isMap3d")) {
                this.isChangeFrom3D = true;
                await store.dispatch("Maps/deactivateMap3D");
            }

            // Updates the map center
            if (this.currentStep.centerCoordinate && this.currentStep.centerCoordinate.length > 0) {
                if (this.currentStep.is3D) {
                    console.warn("Dont use centerCoordinate for 3D navigation.");
                }
                else {
                    const map = Radio.request("Map", "getMap"),
                        mapView = typeof map?.getView === "function" ? map.getView() : undefined;

                    setTimeout(() => {
                        mapView.animate({
                            center: this.currentStep.centerCoordinate,
                            duration: 2000,
                            zoom: this.currentStep.zoomLevel
                        });
                        this.isChangeFrom3D = false;
                    }, this.isChangeFrom3D ? 1500 : 0);
                }
            }
            // Updates the map center for 3D
            if (this.currentStep.navigation3D
                && Object.prototype.hasOwnProperty.call(this.currentStep.navigation3D, "cameraPosition")
                && this.currentStep.navigation3D.cameraPosition.length > 0
                && this.currentStep.navigation3D.cameraPosition[0] !== null) {
                const position = this.currentStep.navigation3D.cameraPosition,
                    map3d = Radio.request("Map", "getMap3d"),
                    camera = map3d.getCesiumScene().camera,
                    destination = Cesium.Cartesian3.fromDegrees(position[0], position[1], position[2]);

                camera.flyTo({
                    destination: destination,
                    orientation: {
                        heading: this.currentStep.navigation3D.heading,
                        pitch: this.currentStep.navigation3D.pitch
                    },
                    easingFunction: Cesium.EasingFunction.QUADRATIC_OUT
                });

                this.enableThreeDModels();
            }

            const stepLayers = this.currentStep.layers || [],
                stepLayers3D = this.currentStep.layers3D || [];

            this.rebuildLayers(stepLayers.concat(stepLayers3D));
            this.switchBackgroundMap(this.currentStep.backgroundMapId);
            this.getDataSources();

            if (this.currentStep.wmsLayers) {
                this.currentStep.wmsLayers.forEach(async layer => {
                    const allCapabilities = await this.capabilityOptions(layer.url);

                    this.updateSelectedCapabilities(layer.selectedLayers, layer.url, allCapabilities);
                });
            }


            setTimeout(() => {
                Radio.trigger("Menu", "rerender");
            }, 500);

            if (!this.currentStep.is3D) {
                // Activates or deactivates tools
                const interactionAddons = this.currentStep.interactionAddons || [];

                // configuredTools = this.$store.state.Tools.configuredTools;

                this.activeTools = interactionAddons;

                // Activate all tools of the current step
                interactionAddons.forEach(this.activateTool);
            }
        }
    }
};
</script>

<template lang="html">
    <div
        v-if="currentStory !== undefined && currentStory.steps && currentStep"
        id="tool-dataNarrator-player"
    >
        <ClassicPlayer
            v-if="showMode === 'classic'"
            :current-step-index="currentStepIndex"
            :current-chapter="currentChapter"
            :current-step="currentStep"
            @setCurrentStepIndex="(index) => currentStepIndex = index"
            @toggleAutoPlay="toggleAutoPlay"
            @toggleScrollytelling="toggleScrollytelling"
            @reset="resetStoryPlayer"
            v-on="$listeners"
        />
        <ScrollyTeller
            v-else
            :current-step-index="currentStepIndex"
            :chapters="chapters"
            :steps="currentStory.steps"
            @setCurrentStepIndex="(index) => currentStepIndex = index"
            @toggleScrollytelling="toggleScrollytelling"
            @reset="resetStoryPlayer"
            v-on="$listeners"
        />
    </div>

    <TableOfContents
        v-else
        :previous-step-index="previousStepIndex"
        @setCurrentStepIndex="(index) => currentStepIndex = index"
    />
</template>

<style lang="scss" scoped>
#tool-dataNarrator-player {
    display: grid;
    grid-template-rows: 1fr auto;
    grid-template-columns: 100%;
    grid-gap: 20px;
    min-height: 0;
    height: 100%;
}

</style>

<style lang="scss">
#tool-dataNarrator-player {
    .tool-dataNarrator-content {
        overflow: scroll;

        &::v-deep {
            img {
                max-width: 100%;
            }
        }

        img {
            max-width: 100%;
        }
    }
}

</style>
