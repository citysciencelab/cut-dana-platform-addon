<script>
import {mapActions, mapGetters, mapMutations} from "vuex";

import * as constants from "../../store/constantsDataNarrator";

import actions from "../../store/actionsDataNarrator";
import getters from "../../store/gettersDataNarrator";
import mutations from "../../store/mutationsDataNarrator";

import errorHandling from "../../utils/errorHandling";
import ShareSettings from "./inputs/ShareSettings.vue";
import CoverSelector from "./inputs/CoverSelector.vue";

import {mdiCancel, mdiCheck, mdiEyeOutline} from "@mdi/js";
import TableOfContentsDnD from "../storyPlayer/TableOfContentsDnD.vue";

export default {
    name: "StoryForm",
    components: {
        TableOfContentsDnD,
        ShareSettings,
        CoverSelector
    },
    props: {
        uid: {
            type: String,
            default: null
        }
    },
    data () {
        return {
            ruleInterval: [
                value => Boolean(value) || this.$t("additional:modules.tools.dataNarrator.warning.requiredNumeric"),
                value => (value && value >= 0 && value <= 20) || this.$t("additional:modules.tools.dataNarrator.warning.requiredNumericMinMax")
            ],
            constants,
            minInterval: 0,
            maxInterval: 59,
            notSaving: true,
            objectFile: null,
            icons: {
                mdiCancel,
                mdiCheck,
                mdiEyeOutline
            },
            rerenderKeyTOC: 0
        };
    },
    computed: {
        ...mapGetters("Tools/DataNarrator", Object.keys(getters)),
        ...mapGetters(["isMobile"]),

        storyIntervalInSeconds: {
            get () {
                return this.currentStory.storyInterval / 1000;
            },
            set (newValue) {
                this.currentStory.storyInterval = newValue * 1000;
            }
        }
    },
    mounted () {
        this.loadStoryWms();
    },
    methods: {
        ...mapMutations("Tools/DataNarrator", Object.keys(mutations)),
        ...mapActions("Tools/DataNarrator", Object.keys(actions)),

        /**
         * Save created or edited story to backend
         * @returns {void}
         */
        saveStoryToBackend () {
            this.notSaving = false;
            this.uploadStoryFiles().then(() => {
                this.notSaving = true;
                this.$root.snackB.show({
                    message: this.$t(
                        "additional:modules.tools.dataNarrator.success.storyCreated"
                    )
                });
                this.$emit("reset-tool", true);
            }).catch((error) => {
                errorHandling(error);
                this.$root.snackB.show({
                    message: this.$t(
                        "additional:modules.tools.dataNarrator.warning.storyNotSaved"
                    ), color: "red"
                });
                this.notSaving = true;
            });
        },

        /**
         * Converts the story interval for scrolling stories to seconds
         * @returns {Number} returns the story interval in seconds
         */
        getStoryInterval () {
            return this.currentStory.storyInterval / 1000;
        },

        /**
         * Change the story display type
         * @param {Event} event - The change event
         * @returns {void}
         */
        changeScrollyMode (event) {
            // Reactive setter
            this.currentStory.displayType = event ?
                this.$set(this.currentStory, "displayType", "scrolly") :
                this.$set(this.currentStory, "displayType", "classic");
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
                    // console.log(this.backendConfig.url);
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
                });
            }
        },

        /**
         * Enables the visibility of all entities in the current step
         * @returns {void}
         */
        enableThreeDModels () {
            if (this.currentStory.threeDFiles) {
                this.currentStory.threeDFiles.forEach((item) => {
                    // console.log(this.backendConfig.url);
                    this.enableEntityVisibility(item);
                });
            }
        },

        /**
         * Actually adds the enitiy to the 3D map
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
         * Returns the step reference
         * @param {Number} chapterNumber the chapter number
         * @param {Number} stepNumber the step number
         * @returns {String} the step reference
         */
        getStepReference (chapterNumber, stepNumber) {
            return `${chapterNumber}.${stepNumber}`;
        },

        /**
         * Loads the WMS layers for the current story
         * @returns {void}
         */
        loadStoryWms () {
            if (this.currentStory.steps) {
                this.currentStory.steps.forEach(step => {
                    if (step.wmsLayers) {
                        step.wmsLayers.forEach((item) => {
                            this.importWMSLayers(item.url, item.selectedLayers);
                        });
                    }
                });

            }
        },
        updateTOC () {
            this.rerenderKeyTOC++;
        }
    }
};
</script>

<template lang="html">
    <div id="tool-dataNarrator-creator-storyForm">
        <form
            id="story-form"
            @submit.prevent="saveStoryToBackend"
        >
            <CoverSelector
                :back-button-msg="$t('additional:modules.tools.dataNarrator.button.cancel')"
                @click="$emit('reset-tool')"
            />

            <div class="form-group form-input-holder">
                <v-textarea
                    id="description"
                    v-model="currentStory.description"
                    :label="$t(
                        'additional:modules.tools.dataNarrator.label.storyDescription'
                    )"
                    hide-details="true"
                    rows="4"
                    solo
                />

                <ShareSettings
                    v-if="uid"
                    :private-story="currentStory.private"
                    :shared-with="currentStory.sharedWith"
                    @update:private-story="newValue => currentStory.private = newValue"
                    @update:shared-with="newValue => currentStory.sharedWith = newValue"
                />

                <v-expansion-panels id="advanced-options">
                    <v-expansion-panel>
                        <v-expansion-panel-header>
                            {{
                                $t("additional:modules.tools.dataNarrator.label.advancedOptions")
                            }}
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <div>
                                <v-checkbox
                                    id="story-scrolly"
                                    :label="$t('additional:modules.tools.dataNarrator.label.scrolly')"
                                    :value="currentStory?.displayType === 'scrolly'"
                                    @change="changeScrollyMode"
                                />
                            </div>
                            <div
                                v-if="currentStory?.displayType !== 'scrolly'"
                            >
                                <div class="vue-label-style">
                                    {{ $t('additional:modules.tools.dataNarrator.label.interval') }}
                                </div>
                                <v-slider
                                    id="story-interval"
                                    v-model="storyIntervalInSeconds"
                                    hide-details="true"
                                    max="40"
                                    min="0"
                                    step="1"
                                    thumb-label
                                />

                                <!--
                                TODO: Unsure if the combination of both (scroll and interval) is a necessity
                                <v-alert
                                    v-show="storyConf.displayType === 'scrolly' && storyConf.storyInterval > 0"
                                    type="info"
                                >
                                    {{
                                        $t("additional:modules.tools.dataNarrator.warning.noIntervalOnScrolly")
                                    }}
                                </v-alert>-->
                            </div>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-expansion-panels>
            </div>

            <TableOfContentsDnD
                :rerender-key="rerenderKeyTOC"
                @deleteStep="(step, associatedChapter, stepNumber) =>
                    $emit('deleteStep', step, associatedChapter, stepNumber)"
                @editStep="step => $emit('editStep', step)"
                @openView="(newView, stepChapterIndex) =>
                    $emit(
                        'openView', newView, stepChapterIndex
                    )
                "
            />

            <v-row class="mb-2">
                <v-col class="d-flex justify-center align-center">
                    <v-btn
                        :title="
                            $t(
                                'additional:modules.tools.dataNarrator.button.addChapter'
                            )
                        "
                        class="story-step-button pill-button"
                        icon
                        @click="
                            $emit(
                                'openView',
                                constants.storyCreationViews.STEP_CREATION, 0
                            )
                        "
                    >
                        <v-icon>add</v-icon>
                    </v-btn>
                    <div
                        class="vue-label-style add-step-label"
                        role="button"
                        tabindex="0"
                        @click="
                            $emit(
                                'openView',
                                constants.storyCreationViews.STEP_CREATION, 0
                            )
                        "
                        @keydown="
                            $emit(
                                'openView',
                                constants.storyCreationViews.STEP_CREATION, 0
                            )
                        "
                    >
                        {{ $t("additional:modules.tools.dataNarrator.label.addChapter") }}
                    </div>
                </v-col>
            </v-row>

            <v-progress-linear
                v-if="!notSaving"
                color="lime"
                height="10"
                indeterminate
                rounded
                striped
            />

            <v-footer
                v-if="notSaving"
                class="tool-dataNarrator-creator-actions white"
                elevation="1"
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
                                    id="reset-button"
                                    class="mr-1"
                                    v-on="on"
                                >
                                    <v-btn
                                        class=""
                                        icon
                                        @click="$emit('reset-tool')"
                                    >
                                        <v-icon size="24px">{{ icons.mdiCancel }}</v-icon>
                                    </v-btn>
                                </span>
                            </template>
                            <span>
                                {{
                                    $t("additional:modules.tools.dataNarrator.button.cancel")
                                }}
                            </span>
                        </v-tooltip>
                        <v-tooltip top>
                            <template #activator="{ on }">
                                <span
                                    id="preview-button"
                                    v-on="on"
                                >
                                    <v-btn
                                        :disabled="!currentStory.steps || !currentStory.steps.length"
                                        class=""
                                        icon
                                        @click="$emit('openView', constants.storyCreationViews.PREVIEW)"
                                    >
                                        <v-icon size="24px">{{ icons.mdiEyeOutline }}</v-icon>
                                    </v-btn>
                                </span>
                            </template>
                            <span>
                                {{
                                    $t("additional:modules.tools.dataNarrator.button.previewStory")
                                }}
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
                                        :disabled="!currentStory.steps || !currentStory.steps.length"
                                        class=""
                                        icon
                                        @click="saveStoryToBackend"
                                    >
                                        <v-icon size="24px">{{ icons.mdiCheck }}</v-icon>
                                    </v-btn>
                                </span>
                            </template>
                            <span>
                                {{
                                    $t("additional:modules.tools.dataNarrator.button.uploadStory")
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
                                @click="$emit('reset-tool')"
                            >
                                <span>
                                    {{
                                        $t("additional:modules.tools.dataNarrator.button.cancel")
                                    }}
                                </span>
                            </v-btn>
                        </v-col>
                        <v-col>
                            <v-btn
                                :disabled="!currentStory.steps || !currentStory.steps.length"
                                class=""
                                color="green"
                                min-width="100%"
                                small
                                @click="$emit('openView', constants.storyCreationViews.PREVIEW)"
                            >
                                <span>
                                    {{
                                        $t("additional:modules.tools.dataNarrator.button.previewStory")
                                    }}
                                </span>
                            </v-btn>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-btn
                            :disabled="!currentStory.steps || !currentStory.steps.length"
                            class=""
                            color="green"
                            small
                            @click="saveStoryToBackend"
                        >
                            <span>
                                {{
                                    $t("additional:modules.tools.dataNarrator.button.uploadStory")
                                }}
                            </span>
                        </v-btn>
                    </v-row>
                </v-container>
            </v-footer>

            <v-alert
                v-show="!currentStory.steps || !currentStory.steps.length"
                id="tool-dataNarrator-creator-noSteps"
                class="white"
                type="info"
            >
                {{
                    $t("additional:modules.tools.dataNarrator.warning.sendNoSteps")
                }}
            </v-alert>
        </form>
    </div>
</template>

<style lang="scss" scoped>
#description {
    line-height: 20px;
    font-size: 13px;
    padding-bottom: 5px;
    margin-top: 5px;
}

#advanced-options:deep {
    .v-expansion-panel-header {
        padding-left: 10px;
        min-height: 45px;
    }

    .v-expansion-panel-content__wrap {
        padding: 0 10px 10px 10px;
    }

    .v-input--checkbox {
        margin-top: 0px;
    }
}
</style>

<style lang="scss">
#tool-dataNarrator-creator-storyForm {
    max-width: 470px;
    position: relative;

    #tool-dataNarrator-creator-noSteps {
        margin-top: 10px;
        margin-bottom: 0;
    }

    label.required:after {
        content: '*';
        color: red;
    }

    .story-step-button {
        min-width: 46px;
        height: 46px;
        padding: 0;
    }

    .add-step-label {
        cursor: pointer;
    }

    #save-alert {
        position: fixed;
        left: 40%;
        top: 20%;
        background-color: white !important;
    }

    .b-form-tags {

        .sr-only {
            display: none !important;
        }

        .b-form-tags-list {
            display: inline-block !important;
            padding-left: 0;

            .badge {
                // color: black !important;
                background-color: #2196f3 !important;
                font-size: 1em !important;
                border-radius: 1em;
                margin-right: 0.25em;

                .b-form-tag-remove {
                    padding-left: 0.5em !important;
                }
            }
        }
    }
}
</style>
