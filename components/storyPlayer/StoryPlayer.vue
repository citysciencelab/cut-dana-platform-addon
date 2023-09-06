<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import StoryNavigation from "./StoryNavigation.vue";
import ScrollyTeller from "./ScrollyTeller.vue";
import DipasPlayer from "./DipasPlayer.vue";
import fetchDataFromUrl, {loadStepContent} from "../../utils/getStoryFromUrl";
import {getHTMLContentReference, getStepReference} from "../../utils/getReference";
import store from "../../../../../src/app-store";
import actions from "../../store/actionsDataNarrator";
import getters from "../../store/gettersDataNarrator";
import mutations from "../../store/mutationsDataNarrator";
import {EventEmitter} from "../utils/EventEmitter";
import ClassicPlayer from "./ClassicPlayer.vue";

export default {
    name: "StoryPlayer",
    components: {
        ClassicPlayer,
        ScrollyTeller,
        StoryNavigation,
        DipasPlayer
    },
    props: {
        // The path to the story configuration to load
        storyConfPath: {
            type: String,
            default: null
        },
        // The Story ID of the selected story
        storyId: {
            type: Number,
            default: null
        },
        // Whether the story player is in preview mode or not
        isPreview: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            getStepReference,
            fetchDataFromUrl,
            getHTMLContentReference,
            currentStepIndex: 0,
            loadedContent: null,
            isHovering: null,
            isChangeFrom3D: false,
            showMode: "",
            steps: [],
            activeTools: [],
            interval: null
        };
    },
    computed: {
        ...mapGetters("Tools/DataNarrator", Object.keys(getters)),

        /**
         * The current selected step of the story.
         * @returns {number} current step index
         */
        currentStep () {
            const stepindex = this.$store.state.Tools.DataNarrator.autoplay && this.steps.length > 0
                ? this.steps[this.currentStepIndex]
                : this.storyConf.steps[this.currentStepIndex];

            return this.currentStepIndex !== null
                ? this.storyConf && stepindex
                : null;
        },

        /**
         * The current selected chapter of the story.
         * @returns {number} current chapter
         */
        currentChapter () {
            return (
                this.storyConf && this.storyConf.chapters &&
                this.storyConf.chapters.find(
                    ({chapterNumber}) => this.currentStep &&
                        this.currentStep.associatedChapter === chapterNumber
                )
            );
        },
        stepsCopy () {
            return JSON.parse(JSON.stringify(this.storyConf.steps));
        }
    },
    watch: {
        /**
         * Handles step changes.
         * @returns {void}
         */
        currentStepIndex () {
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
        if (this.storyConf && this.storyConf.chapters?.length) {
            this.showMode = this.storyConf?.displayType ? this.storyConf.displayType : "classic";
            this.loadStep();
        }
        else if (!this.storyConf && this.storyConfPath || !this.storyConf.chapters?.length) {
            await fetchDataFromUrl(this.storyConfPath).then(loadedStoryConf => {
                this.setStoryConf(loadedStoryConf);

                let count = 0;

                this.stepsCopy.forEach(() => {
                    this.assignDepth(this.stepsCopy, 0, count);
                    count += 1;
                });

                this.showMode = this.storyConf?.displayType ? this.storyConf.displayType : "classic";
                this.createStepArray(this.stepsCopy);
                this.loadStep();
            });
        }

        if (this.isPreview && this.storyConf) {
            this.showMode = this.storyConf?.displayType ? this.storyConf.displayType : "classic";
            this.loadStep();
        }
        if (this.storyConf.storyInterval) {
            this.activateInterval();
        }
    },
    created () {
        EventEmitter.$on("toggleAutoPlay", () => {
            this.toggleInterval();
        });
        EventEmitter.$on("toggleScrollytelling", () => {
            this.toggleScrollytelling();
        });
        EventEmitter.$on("resetPlayer", () => {
            this.resetStoryPlayer();
        });
    },
    beforeDestroy () {
        // Hides all story layers
        const layerList = Radio.request("ModelList", "getModelsByAttributes", {
            isVisibleInTree: true
        });

        for (const layer of layerList) {
            const isStepLayer = (
                (this.currentStep && this.currentStep.layers) ||
                []
            ).includes(Number(layer.attributes.id));

            if (isStepLayer && layer.attributes.isVisibleInMap) {
                this.disableLayer(layer);
            }
        }
        Radio.trigger("Menu", "rerender");

        if (Object.hasOwn(this.storyConf, "displayType") && this.storyConf.displayType.toUpperCase() === "DIPAS") {
            this.$store.commit(
                "Tools/DipasStorySelector/setActive",
                true
            );
        }
        // removes event listener
        EventEmitter.$off("toggleScrollytelling", this.toggleScrollytelling());
        EventEmitter.$off("toggleAutoPlay", this.toggleInterval());
        EventEmitter.$off("resetPlayer", this.resetStoryPlayer());
    },
    methods: {
        ...mapActions("Tools", ["setToolActive"]),
        ...mapMutations("Tools/DataNarrator", Object.keys(mutations)),
        ...mapActions("Tools/DataNarrator", Object.keys(actions)),
        // These application wide getters and setters can be found in 'src/modules/map/store'
        ...mapMutations("Map", ["setCenter", "setLayerVisibility"]),
        ...mapGetters("Map", ["layerList", "visibleLayerList", "map"]),

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
            this.loadedContent = null;
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
         * Set the step index on click of a chapter
         * @param {Object} chapter the current chapter object of the iteration
         * @returns  {void}
         */
        onClickChapter (chapter) {
            this.currentStepIndex = this.storyConf.steps.findIndex(
                ({associatedChapter}) => associatedChapter === chapter.chapterNumber
            );
        },

        /**
         * Set the hover flag via stepreference
         * @param {Object} step the current step object of the iteration
         * @returns  {void}
         */
        onHoverStep (step) {
            this.isHovering = getStepReference(
                step.associatedChapter,
                step.stepNumber
            );
        },

        /**
         * Toggles the interval
         * @returns  {void}
         */
        toggleInterval () {
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
            this.interval = setInterval(() => {
                this.currentStepIndex = this.storyConf.steps.length - 1 === this.currentStepIndex ? 0 : this.currentStepIndex + 1;
                this.$emit("change", this.currentStepIndex);
            }, this.storyConf.storyInterval);
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
         * Sets up the tool window and content for the selected step.
         * @returns {void}
         */
        async loadStep () {
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

            const layerList = Radio.request(
                    "ModelList",
                    "getModelsByAttributes",
                    {isVisibleInTree: true}
                ),
                htmlReference = getHTMLContentReference(
                    this.currentStep.associatedChapter,
                    this.currentStep.stepNumber
                );

            // Updates the map layers
            for (const layer of layerList) {
                const isStepLayer = (this.currentStep.layers || []).includes(
                    layer.id
                ) || this.currentStep.layers.some(l => l.includes(layer.id));

                // if (isStepLayer && !layer.attributes.isVisibleInMap) {
                if (isStepLayer) {
                    this.enableLayer(layer);
                }
                // else if (!isStepLayer && layer.attributes.isVisibleInMap) {
                else if (!isStepLayer) {
                    this.disableLayer(layer);
                }
            }

            Radio.trigger("Menu", "rerender");

            // Updates the step html content
            if (this.storyConf.htmlFolder && this.currentStep.htmlFile && this.showMode === "classic") {
                // Load HTML file for the story step
                fetchDataFromUrl(
                    "./assets/" +
                    this.storyConf.htmlFolder +
                    "/" +
                    this.currentStep.htmlFile
                ).then(data => {
                    this.loadedContent = data;
                });
            }
            else if (this.isPreview && this.htmlContents[htmlReference]) {
                // Get temporary HTML for the story step preview
                this.loadedContent = this.htmlContents[htmlReference];
            }
            else {
                this.loadedContent = null;
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

            if (this.loadedContent === null && this.storyId) {
                loadStepContent(this.backendConfig.url, this.storyId, this.currentStep).then(data => {
                    this.loadedContent = data;
                });
            }
        },
        /*
         * Fills the steps array transforming the nested structure of the steps into a flat structure
         * @returns {void}
         */
        createStepArray (steps) {
            steps.forEach(s => {
                const step = JSON.parse(JSON.stringify(s));

                delete step.steps;
                this.steps.push(step);
                if (s.steps) {
                    this.createStepArray(s.steps);
                }
            });
        },
        /*
         * Adds the depth level of a story step to a copy of the storyConf
         * @returns {void}
         */
        assignDepth (arr, depth = 0, index = 0) {

            if (index < arr.length) {
                arr[index].depth = depth;
                if (arr[index].steps && arr[index].steps.length) {
                    return this.assignDepth(arr[index].steps, depth + 1, 0);
                }

                return this.assignDepth(arr, depth, index + 1);
            }

            return null;
        }
    }
};
</script>

<template lang="html">
    <div
        v-if="storyConf !== undefined && storyConf.steps && currentStep"
        id="tool-dataNarrator-player"
    >
        <ScrollyTeller
            v-if="showMode === 'scrolly'"
            :current-step-index="currentStepIndex"
            :story-id="storyId"
        />

        <ClassicPlayer
            v-if="showMode === 'classic'"
            :current-step-index="currentStepIndex"
            :current-chapter="currentChapter"
            :current-step="currentStep"
            :loaded-content="loadedContent"
        />

        <!--        <div-->
        <!--            v-if="showMode === 'classic'"-->
        <!--            id="tool-dataNarrator-currentStep"-->
        <!--        >-->
        <!--            <h2 v-if="currentChapter">-->
        <!--                {{ currentChapter.chapterTitle }}-->
        <!--            </h2>-->
        <!--            <h1>{{ currentStep.title }}</h1>-->

        <!--            <div-->
        <!--                v-if="currentStep"-->
        <!--                class="tool-dataNarrator-content"-->
        <!--            >-->
        <!--                <div-->
        <!--                    v-if="loadedContent"-->
        <!--                    v-html="loadedContent"-->
        <!--                />-->
        <!--            </div>-->
        <!--        </div>-->

        <StoryNavigation
            v-if="showMode === 'classic'"
            v-model="currentStepIndex"
            :current-chapter="currentStep && currentStep.associatedChapter"
            :steps="storyConf.steps"
        />

        <DipasPlayer
            v-if="showMode === 'dipas'"
            v-model="currentStepIndex"
            :story-conf-path="storyConfPath"
            :steps="steps"
        />
    </div>

    <div
        v-else
        id="tool-dataNarrator-tableOfContents"
    >
        <h1>{{ storyConf.title }}</h1>

        <h2>
            {{
                $t("additional:modules.tools.dataNarrator.tableOfContents")
            }}
        </h2>

        <ol class="tableOfContents">
            <li
                v-for="chapter in storyConf.chapters"
                :key="chapter.chapterNumber"
            >
                <span
                    :class="{
                        'primary--text': isHovering === chapter.chapterNumber
                    }"
                    role="button"
                    tabindex="0"
                    @mouseover="isHovering = chapter.chapterNumber"
                    @focus="isHovering = chapter.chapterNumber"
                    @mouseout="isHovering = null"
                    @blur="isHovering = null"
                    @click="onClickChapter(chapter)"
                    @keydown="onClickChapter(chapter)"
                >
                    {{ chapter.chapterNumber }}
                    {{ chapter.chapterTitle }}
                </span>
                <ol>
                    <li
                        v-for="(step, stepIndex) in storyConf.steps"
                        :key="step.stepNumber + step.title"
                        role="button"
                        tabindex="0"
                        :class="{
                            'primary--text':
                                isHovering ===
                                getStepReference(
                                    step.associatedChapter,
                                    step.stepNumber
                                )
                        }"
                        @mouseover.stop="onHoverStep(step)"
                        @focus="onHoverStep(step)"
                        @mouseout.stop="isHovering = null"
                        @blur="isHovering = null"
                        @click.stop="currentStepIndex = stepIndex"
                        @keydown="currentStepIndex = stepIndex"
                    >
                        <span v-if="step.associatedChapter === chapter.chapterNumber">
                            {{
                                getStepReference(
                                    step.associatedChapter,
                                    step.stepNumber
                                )
                            }}
                            {{ step.title }}
                        </span>
                    </li>
                </ol>
            </li>
        </ol>
    </div>
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
