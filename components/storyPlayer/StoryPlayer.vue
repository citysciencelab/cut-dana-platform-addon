<script>
import axios from "axios";
import {mapActions, mapGetters, mapMutations} from "vuex";
import store from "../../../../../src/app-store";
import fileImportGetters from "../../../../fileImportAddon/store/gettersFileImportAddon";
import actions from "../../store/actionsDataNarrator";
import getters from "../../store/gettersDataNarrator";
import mutations from "../../store/mutationsDataNarrator";
import {getMimeTypeFromExtension} from "../../utils/fileDataType";
import PlayerContent from "./PlayerContent.vue";
import PlayerHeader from "./PlayerHeader.vue";
import PlayerFooter from "./PlayerFooter.vue";
import TableOfContents from "./TableOfContents.vue";

export default {
    name: "StoryPlayer",
    components: {
        PlayerHeader,
        PlayerContent,
        PlayerFooter,
        TableOfContents
    },
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
            loadedContent: null,
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
         * @returns {number} current step index
         */
        currentStep () {
            return this.$store.state.Tools.DataNarrator.autoplay && this.steps.length > 0
                ? this.steps[this.currentStepIndex]
                : this.currentStory.steps[this.currentStepIndex];
        },

        /**
         * The current selected chapter of the story.
         * @returns {number} current chapter
         */
        currentChapter () {
            return (
                this.currentStory?.chapters &&
                this.currentStory.chapters.find(
                    ({chapterNumber}) => this.currentStep?.associatedChapter === chapterNumber
                )
            );
        },

        stepsCopy () {
            return {...this.currentStory.steps};
        },

        backgroundMaps () {
            return Radio.request("ModelList", "getModelsByAttributes", {isBaseLayer: true});
        }
    },
    watch: {
        currentStepIndex (newValue, oldValue) {
            if (newValue !== oldValue) {
                this.previousStepIndex = oldValue;
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
            this.showMode = this.currentStory?.displayType ? this.currentStory.displayType : "classic";
            this.currentStepIndex = this.stepIndex;
            await this.loadThreeDFiles();
        }
        this.activateInterval();
        this.visibleBackgroundMap = this.backgroundMaps.find(model => model.get("isVisibleInMap"))?.id;
    },

    beforeDestroy () {
        // // Hides all story layers
        const layerList = Radio.request("ModelList", "getModelsByAttributes", {
            isVisibleInMap: true, isBaseLayer: false
        });

        for (const layer of layerList) {
            if (this.currentStep.layers.includes(layer.attributes.id)) {
                this.disableLayer(layer);
            }
        }

        if (this.currentStory) {
            if (Object.hasOwn(this.currentStory, "displayType") && this.currentStory.displayType.toUpperCase() === "DIPAS") {
                this.$store.commit(
                    "Tools/DipasStorySelector/setActive",
                    true
                );
            }
        }

        this.switchBackgroundMap(this.visibleBackgroundMap);

        if (this.currentStep.wmsLayers) {
            this.currentStep.wmsLayers.forEach(async layer => {
                this.hideWmslayer(layer.url);
            });
        }
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
                    const layerName = this.getLayerName(file.name),
                        checkSameLayer = this.importedFileNames.filter(importedFileName => {
                            return this.getLayerName(file.name) === this.getLayerName(importedFileName);
                        });

                    this.importKML({raw: f.target.result, checkSameLayer: checkSameLayer, layerName: layerName, filename: file.name, pointImages: this.pointImages, textColors: this.textColors, textSizes: this.textSizes});
                };

                reader.readAsText(file);
            });
        },
        /**
         * Getting the layer name from the file name without the postfix as file format
         * @param {String} fileName name of the file
         * @returns {String} Returns the layer name
         */
        getLayerName (fileName) {
            return fileName.substr(0, fileName.lastIndexOf("."));
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
            this.disableOwnDatasource();
            this.currentStepIndex = 0;
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
         * Toggles a layer on the map
         * @param {Object} layer the layer to enable
         * @param {Boolean} enabled enables the layer if `true`, disables the layer if `false`
         * @returns {void}
         */
        toggleLayer (layer, enabled) {
            layer.setIsVisibleInMap(enabled);
            layer.set("isSelected", enabled);
        },

        /**
         * Enables a layer on the map
         * @param {Object} layer the layer to enable
         * @returns {void}
         */
        enableLayer (layer) {
            this.toggleLayer(layer, true);
        },

        /**
         * Disables a layer on the map
         * @param {Object} layer the layer to disable
         * @returns {void}
         */
        disableLayer (layer) {
            this.toggleLayer(layer, false);
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
                        this.currentStepIndex = this.currentStory.steps.length - 1 === this.currentStepIndex ? 0 : this.currentStepIndex + 1;
                        this.$emit("change", this.currentStepIndex);
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
                        const model = Radio.request("ModelList", "getModelByAttributes", {name: dataSource.name.split(".")[0]});

                        this.enableLayer(model);
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
            for (const importedItem of this.importedFileNames) {
                const model = Radio.request("ModelList", "getModelByAttributes", {name: importedItem.split(".")[0]});

                this.disableLayer(model);
            }

        },


        async loadThreeDFiles () {
            // Toggles 3D map mode
            if (!Radio.request("Map", "isMap3d")) {
                await store.dispatch("Maps/activateMap3D");
            }
            const promises = [];

            this.currentStory.steps.forEach((step) => {
                if (step.threeDFiles) {
                    step.threeDFiles.forEach((item) => {
                        // console.log(this.backendConfig.url);
                        this.addEntity(item, `${this.backendConfig.url}/files${this.currentStory.threeDFilesId}`);
                    });
                }
            });

            console.log(this.importedEntities);

            return Promise.all(promises);
        },

        addEntity (item, path = "") {
            // the item is a file and not a folder
            // const hpr = new Cesium.HeadingPitchRoll(item.orientation.heading, item.orientation.pitch, item.orientation.roll),
            //     quaternion = Cesium.Transforms.headingPitchRollQuaternion(Cesium.Cartesian3.ZERO, hpr),


            if (item.file) {
                console.log("ITEM", item);
                const position = new Cesium.Cartesian3(item.position.x, item.position.y, item.position.z);

                this.createEntity({
                    entityId: item.id,
                    file: item.file,
                    uri: `${path}/${item.name}`,
                    scale: item.scale,
                    position: position
                    // orientation: quaternion
                });
                return;
            }
            if (item.children && item.children.length > 0) {
                item.children.forEach((child) => {
                    this.addEntity(child, `${path}/${item.name}`);
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
                this.setInitialWidth(this.currentStep.stepWidth);
            }

            // Toggles 3D map mode
            if (this.currentStep.is3D && !Radio.request("Map", "isMap3d")) {
                await store.dispatch("Maps/activateMap3D");
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
            }

            const layerList = Radio.request("Parser", "getItemsByAttributes", {type: "layer"}),
                enabledLayers = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, isBaseLayer: false}),
                stepLayers = this.currentStep.layers || [];

            for (const enabledLayer of enabledLayers) {
                this.disableLayer(enabledLayer);
            }


            for (const layer of stepLayers) {
                let layerModel;

                if (typeof layer === "string") {

                    // check if model is already in modelList
                    layerModel = Radio.request("ModelList", "getModelByAttributes", {id: layer});

                    if (!layerModel) {
                        const foundLayer = layerList.find(l => l.id === layer);

                        Radio.trigger("ModelList", "addModelsByAttributes", foundLayer);
                        layerModel = Radio.request("ModelList", "getModelByAttributes", {id: foundLayer.id});
                    }
                }
                else {
                    layerModel = Radio.request("ModelList", "getModelByAttributes", {id: layer.id});

                    if (!layerModel) {
                        const foundLayer = layerList.find(l => l.id === layer.id);

                        foundLayer.selectionIDX = layer.selectionIDX;
                        foundLayer.transparency = layer.transparency;
                        Radio.trigger("ModelList", "addModelsByAttributes", foundLayer);
                        layerModel = Radio.request("ModelList", "getModelByAttributes", {id: foundLayer.id});
                    }
                }
                this.enableLayer(layerModel);
            }


            this.switchBackgroundMap(this.currentStep.backgroundMapId);

            this.getDataSources();


            if (this.currentStep.wmsLayers) {
                this.currentStep.wmsLayers.forEach(async layer => {
                    this.importWMSLayers(layer.url, layer.selectedLayers);
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
        },

        clearAllLayers () {
            const layerList = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInTree: true, isSelected: true});

            for (const layer of layerList) {
                this.disableLayer(layer);
            }

            this.disableOwnDatasource();
        }
    }
};
</script>

<template lang="html">
    <div
        v-if="currentStory !== undefined && currentStory.steps && currentStep"
        id="tool-dataNarrator-player"
    >
        <PlayerHeader
            :chapter="currentChapter"
            @click="() => currentStepIndex = null"
            v-on="$listeners"
        />
        <PlayerContent :step="currentStep" />
        <PlayerFooter v-model="currentStepIndex" />
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

#tool-dataNarrator-tableOfContents {
    display: grid;
    grid-gap: 10px;
    overflow: hidden;
}

.tableOfContents {
    padding-left: 0;
    overflow: auto;
    font-size: 1rem;
    line-height: 1.75;

    &,
    ol {
        list-style: none;
    }

    > li {
        &:not(last-child) {
            margin-bottom: 10px;
        }

        > ol li,
        > span {
            display: block;
            cursor: pointer;
        }
    }
}
</style>

<style lang="scss">
#tool-dataNarrator-player {
    .tool-dataNarrator-content {
        overflow: auto;

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
