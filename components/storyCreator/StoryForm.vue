<script>
import {mapActions, mapGetters, mapMutations} from "vuex";

import * as constants from "../../store/constantsDataNarrator";

import actions from "../../store/actionsDataNarrator";
import getters from "../../store/gettersDataNarrator";
import mutations from "../../store/mutationsDataNarrator";

import errorHandling from "../../utils/errorHandling";
import ShareSettings from "./inputs/ShareSettings.vue";

import {
    mdiCancel,
    mdiCheck,
    mdiEyeOutline,
    mdiCamera
} from "@mdi/js";

export default {
    name: "StoryForm",
    components: {
        ShareSettings
    },
    data () {
        return {
            rules: [
                value => Boolean(value) || this.$t("additional:modules.tools.dataNarrator.warning.requiredFields"),
                value => (value && value.length >= 5) || this.$t("additional:modules.tools.dataNarrator.warning.requiredFieldMinCharacters")
            ],
            ruleInterval: [
                value => Boolean(value) || this.$t("additional:modules.tools.dataNarrator.warning.requiredNumeric"),
                value => (value && value >= 0 && value <= 20) || this.$t("additional:modules.tools.dataNarrator.warning.requiredNumericMinMax")
            ],
            constants,
            hasCover: false,
            minInterval: 0,
            maxInterval: 59,
            notSaving: true,
            icons: {
                mdiCancel,
                mdiCheck,
                mdiEyeOutline,
                mdiCamera
            }
        };
    },
    computed: {
        ...mapGetters("Tools/DataNarrator", Object.keys(getters)),
        ...mapGetters(["mobile"])
    },
    mounted () {
        if (Object.hasOwn(this.currentStory, "titleImage") && this.currentStory.titleImage !== "") {
            if (this.currentStory.titleImage instanceof File) {
                this.$refs.preview_image.src = URL.createObjectURL(this.currentStory.titleImage);
            }
            else {
                this.$refs.preview_image.src = this.currentStory.titleImage;
            }
            this.hasCover = true;
        }
        this.loadStoryWms();
    },
    methods: {
        ...mapMutations("Tools/DataNarrator", Object.keys(mutations)),
        ...mapActions("Tools/DataNarrator", Object.keys(actions)),

        /**
         * Handle the cover image change
         * @param {Event} event - The file input change event
         * @returns {void}
         */
        onCoverChange (event) {
            const file = event;

            if (!file) {
                this.$refs.preview_image.src = "";
                this.currentStory.titleImage = "";
                this.hasCover = false;
            }
            else {
                this.$refs.preview_image.src = URL.createObjectURL(file);
                this.currentStory.titleImage = file;
                this.hasCover = true;
            }
        },


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
         * Sets the story interval for scrolling stories and converts it to milliseconds
         * @param {Event} event - The change event
         * @returns {void}
         */
        setStoryInterval (event) {
            this.currentStory.storyInterval = event * 1000;
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
        }
    }
};
</script>

<template lang="html">
    <div id="tool-dataNarrator-creator-storyForm">
        <h4>
            {{ $t("additional:modules.tools.dataNarrator.createStory") }}
        </h4>

        <form
            id="story-form"
            @submit.prevent="saveStoryToBackend"
        >
            <div class="form-group">
                <v-text-field
                    id="title"
                    v-model="currentStory.title"
                    :label="$t(
                        'additional:modules.tools.dataNarrator.label.storyName'
                    )"
                    :rules="rules"
                    hide-details="auto"
                />
            </div>

            <div class="form-group">
                <v-textarea
                    id="description"
                    v-model="currentStory.description"
                    solo
                    hide-details="true"
                    rows="3"
                    :label="$t(
                        'additional:modules.tools.dataNarrator.label.storyDescription'
                    )"
                />
            </div>

            <div class="form-group">
                <v-row>
                    <v-col
                        cols="10"
                    >
                        <v-file-input
                            id="cover"
                            ref="image_input"
                            :prepend-icon="icons.mdiCamera"
                            name="cover"
                            :label="$t(
                                'additional:modules.tools.dataNarrator.label.cover'
                            )"
                            accept="image/png, image/jpeg"
                            @change="onCoverChange"
                        />
                    </v-col>
                    <v-col cols2>
                        <img
                            id="preview"
                            ref="preview_image"
                            :style=" hasCover ? '' : 'display: none;' "
                            src="#"
                            alt="your uploaded image"
                        >
                    </v-col>
                </v-row>
            </div>


            <ShareSettings
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
                        <div class="form-group">
                            <v-switch
                                id="story-scrolly"
                                :value="currentStory?.displayType === 'scrolly'"
                                :label="$t('additional:modules.tools.dataNarrator.label.scrolly')"
                                @change="changeScrollyMode"
                            />
                        </div>
                        <div
                            v-if="currentStory?.displayType !== 'scrolly'"
                            class="form-group"
                        >
                            <div class="vue-label-style">
                                {{ $t('additional:modules.tools.dataNarrator.label.interval') }}
                            </div>
                            <v-slider
                                id="story-interval"
                                v-model="currentStory.storyInterval"
                                step="1"
                                max="40"
                                min="0"
                                thumb-label
                                @change="setStoryInterval"
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

            <v-divider />

            <div class="form-group">
                <v-slide-group
                    id="slide-navigation"
                    show-arrows
                    center-active
                    @change="
                        stepIndex =>
                            $emit('editStep', currentStory.steps[stepIndex])
                    "
                >
                    <v-slide-item
                        v-for="step in currentStory.steps"
                        :key="
                            getStepReference(
                                step.associatedChapter,
                                step.stepNumber
                            )
                        "
                        v-slot="{ toggle }"
                    >
                        <v-btn
                            class="story-step-button"
                            depressed
                            rounded
                            :title="step.title"
                            @click="toggle"
                        >
                            {{
                                getStepReference(
                                    step.associatedChapter,
                                    step.stepNumber
                                )
                            }}
                        </v-btn>
                    </v-slide-item>

                    <v-slide-item>
                        <v-row>
                            <v-col class="d-flex justify-center align-center">
                                <v-btn
                                    class="story-step-button story-step-button-add"
                                    icon
                                    :title="
                                        $t(
                                            'additional:modules.tools.dataNarrator.button.addStep'
                                        )
                                    "
                                    @click="
                                        $emit(
                                            'openView',
                                            constants.storyCreationViews.STEP_CREATION
                                        )
                                    "
                                >
                                    <v-icon>add</v-icon>
                                </v-btn>
                                <div
                                    class="vue-label-style add-step-label"
                                    @click="
                                        $emit(
                                            'openView',
                                            constants.storyCreationViews.STEP_CREATION
                                        )
                                    "
                                >
                                    {{ $t("additional:modules.tools.dataNarrator.label.steps") }}
                                </div>
                            </v-col>
                        </v-row>
                    </v-slide-item>
                </v-slide-group>
            </div>

            <v-progress-linear
                v-if="!notSaving"
                indeterminate
                height="10"
                striped
                rounded
                color="lime"
            />

            <v-footer
                v-if="notSaving"
                class="tool-dataNarrator-creator-actions white"
                elevation="1"
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
                                        class=""
                                        icon
                                        :disabled="!currentStory.steps || !currentStory.steps.length"
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
                                        class=""
                                        icon
                                        :disabled="!currentStory.steps || !currentStory.steps.length"
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
                                class=""
                                small
                                :disabled="!currentStory.steps || !currentStory.steps.length"
                                color="green"
                                min-width="100%"
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
                            class=""
                            small
                            :disabled="!currentStory.steps || !currentStory.steps.length"
                            color="green"
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
                type="info"
                class="white"
            >
                {{
                    $t("additional:modules.tools.dataNarrator.warning.sendNoSteps")
                }}
            </v-alert>
        </form>
    </div>
</template>

<style lang="scss">
#tool-dataNarrator-creator-storyForm {
    max-width: 460px;
    position: relative;

    #tool-dataNarrator-creator-noSteps {
        margin-top: 10px;
    }

    label.required:after { content: '*';color:red; }

    .story-step-button {
        min-width: 46px;
        height: 46px;
        padding: 0;
    }

    .story-step-button-add {
        min-width: 23px !important;
        width: 23px;
        margin-right: 10px;
        .v-btn__content {
            border: 2px solid rgba(0,0,0,.3);
            border-radius: 10px;
            width: 10px !important;
            height: 35px;
        }
    }

    .add-step-label {
        cursor: pointer;
    }

    .tool-dataNarrator-creator-actions {
        position: sticky;
        margin-top: 20px;
    }

    #save-alert {
        position: fixed;
        left: 40%;
        top: 20%;
        background-color: white !important;
    }

    #preview {
        padding-left: 5px;
        max-height: 30px;
        max-width: 70px;
    }

    .vue-label-style {
        font-size: 16px;
        color: rgba(0,0,0,.6);
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
