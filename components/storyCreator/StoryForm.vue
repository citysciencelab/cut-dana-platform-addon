<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import * as constants from "../../store/constantsDataNarrator";
import {getStepReference} from "../../utils/getReference";
import actions from "../../store/actionsDataNarrator";
import getters from "../../store/gettersDataNarrator";
import mutations from "../../store/mutationsDataNarrator";

export default {
    name: "StoryForm",
    components: {},
    data () {
        return {
            constants,
            getStepReference,
            hasCover: false,
            minInterval: 0,
            maxInterval: 59
        };
    },
    computed: {
        ...mapGetters("Tools/DataNarrator", Object.keys(getters))
    },
    mounted () {
        if (Object.hasOwn(this.storyConf, "titleImage") && this.storyConf.title_image !== "") {
            this.$refs.preview_image.src = URL.createObjectURL(this.storyConf.title_image);
            // this.$refs.image_input.value = this.storyConf.titleImage.name;
            this.hasCover = true;
        }
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
            const file = event.target.files[0];

            this.hasCover = true;

            this.$refs.preview_image.src = URL.createObjectURL(file);
            this.storyConf.titleImage = file;
        },

        /**
         * Upload the created story files
         * @returns {void}
         */
        async saveStoryToBackend () {
            if (Object.hasOwn(this.storyConf, "storyId")) {
                // const updateResponse = await this.updateStory();
                console.log("Editing story is not implemented yet.");
            }
            else {
                const uploadResponse = await this.uploadStoryFiles();


                if (uploadResponse.toString().indexOf("Error") !== -1) {
                    this.$root.snackB.show({
                        message: this.$t(
                            "additional:modules.tools.dataNarrator.warning.storyNotSaved"
                        ), color: "red"
                    });
                }
                else {
                    this.$root.snackB.show({
                        message: this.$t(
                            "additional:modules.tools.dataNarrator.success.storyCreated"
                        )
                    });
                    this.setStoryConf({...this.constants.emptyStoryConf});
                    this.$emit("reset-tool");
                }
            }
        },

        getStoryInterval () {
            return this.storyConf.storyInterval / 1000;
        },

        setStoryInterval (event) {
            this.storyConf.storyInterval = event.target.value * 1000;
        },

        changeScrollyMode (event) {
            // Reactive setter
            this.storyConf.displayType = event.target.checked ? this.$set(this.storyConf, "displayType", "scrolly") : this.$set(this.storyConf, "displayType", "classic");
        }
    }
};
</script>

<template lang="html">
    <div id="tool-dataNarrator-creator-storyForm">
        <h4>
            {{ $t("additional:modules.tools.dataNarrator.createStory") }}
        </h4>

        <form @submit.prevent="downloadStoryFiles">
            <div class="form-group">
                <label
                    for="title"
                    class="form-label required"
                >
                    {{
                        $t(
                            "additional:modules.tools.dataNarrator.label.storyName"
                        )
                    }}
                </label>

                <input
                    id="title"
                    v-model="storyConf.title"
                    class="form-control"
                    type="text"
                    required
                >
            </div>

            <div class="form-group">
                <label
                    for="description"
                    class="form-label"
                >
                    {{
                        $t(
                            "additional:modules.tools.dataNarrator.label.storyDescription"
                        )
                    }}
                </label>

                <textarea
                    id="description"
                    v-model="storyConf.description"
                    class="form-control"
                />
            </div>

            <div class="form-group">
                <label
                    class="form-label"
                    for="author"
                >
                    {{
                        $t(
                            "additional:modules.tools.dataNarrator.label.author"
                        )
                    }}
                </label>

                <input
                    id="author"
                    v-model="storyConf.author"
                    class="form-control"
                    type="text"
                >
            </div>

            <div class="form-group">
                <label
                    class="form-label"
                    for="cover"
                >
                    {{
                        $t(
                            "additional:modules.tools.dataNarrator.label.cover"
                        )
                    }}
                </label>
                <v-row>
                    <v-col
                        cols="10"
                    >
                        <input
                            id="cover"
                            ref="image_input"
                            type="file"
                            name="cover"
                            class="form-control"
                            accept="image/png, image/jpeg"
                            @change="onCoverChange"
                        >
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

            <div class="form-group">
                <label
                    class="form-label"
                    for="story-scrolly"
                >
                    {{
                        $t(
                            "additional:modules.tools.dataNarrator.label.scrolly"
                        )
                    }}
                </label>

                <input
                    id="story-scrolly"
                    class="checkbox"
                    type="checkbox"
                    :checked="storyConf?.displayType && storyConf.displayType === 'scrolly'"
                    @change="changeScrollyMode"
                >
            </div>

            <div class="form-group">
                <label
                    class="form-label"
                    for="story-interval"
                >
                    {{
                        $t(
                            "additional:modules.tools.dataNarrator.label.interval"
                        )
                    }}
                </label>

                <input
                    id="story-interval"
                    class="form-control"
                    type="number"
                    :value="getStoryInterval()"
                    :min="minInterval"
                    :max="maxInterval"
                    step="1"
                    @change="setStoryInterval"
                >
                <!--
                // Unsure if the combination of both (scroll and interval) is a necessity
                <v-alert
                    v-show="storyConf.displayType === 'scrolly' && storyConf.storyInterval > 0"
                    type="info"
                >
                    {{
                        $t("additional:modules.tools.dataNarrator.warning.noIntervalOnScrolly")
                    }}
                </v-alert>
                -->
            </div>

            <div class="form-group">
                <label
                    class="form-label"
                    for="slide-navigation"
                >
                    {{
                        $t(
                            "additional:modules.tools.dataNarrator.label.steps"
                        )
                    }}
                </label>

                <v-slide-group
                    id="slide-navigation"
                    show-arrows
                    center-active
                    @change="
                        stepIndex =>
                            $emit('editStep', storyConf.steps[stepIndex])
                    "
                >
                    <v-slide-item
                        v-for="step in storyConf.steps"
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
                        <v-btn
                            class="story-step-button"
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
                            <v-icon>add_circle</v-icon>
                        </v-btn>
                    </v-slide-item>
                </v-slide-group>
            </div>

            <div class="tool-dataNarrator-creator-actions">
                <v-tooltip top>
                    <template #activator="{ on }">
                        <v-icon
                            id="reset-button"
                            class="mr-1"
                            @click="$emit('reset-tool')"
                            v-on="on"
                        >
                            cancel
                        </v-icon>
                    </template>
                    <span>
                        {{
                            $t("additional:modules.tools.dataNarrator.button.cancel")
                        }}
                    </span>
                </v-tooltip>
                <v-tooltip top>
                    <template #activator="{ on }">
                        <v-icon
                            class="mr-1"
                            :disabled="!storyConf.steps || !storyConf.steps.length"
                            @click=" $emit('openView', constants.storyCreationViews.PREVIEW)"
                            v-on="on"
                        >
                            preview
                        </v-icon>
                    </template>
                    <span>
                        {{
                            $t("additional:modules.tools.dataNarrator.button.previewStory")
                        }}
                    </span>
                </v-tooltip>
                <v-tooltip top>
                    <template #activator="{ on }">
                        <v-icon
                            class="mr-1"
                            :disabled="!storyConf.steps || !storyConf.steps.length"
                            @click="downloadStoryFiles"
                            v-on="on"
                        >
                            download
                        </v-icon>
                    </template>
                    <span>
                        {{
                            $t("additional:modules.tools.dataNarrator.button.downloadStory")
                        }}
                    </span>
                </v-tooltip>
                <v-tooltip top>
                    <template #activator="{ on }">
                        <v-icon
                            class="mr-1"
                            :disabled="!storyConf.steps || !storyConf.steps.length"
                            @click="saveStoryToBackend"
                            v-on="on"
                        >
                            save
                        </v-icon>
                    </template>
                    <span>
                        {{
                            $t("additional:modules.tools.dataNarrator.button.uploadStory")
                        }}
                    </span>
                </v-tooltip>
                <p />
                <v-alert
                    v-show="!storyConf.steps || !storyConf.steps.length"
                    type="info"
                >
                    {{
                        $t("additional:modules.tools.dataNarrator.warning.sendNoSteps")
                    }}
                </v-alert>
            </div>
        </form>
    </div>
</template>

<style lang="scss" scoped>
#tool-dataNarrator-creator-storyForm {
    max-width: 460px;

    label.required:after { content: '*';color:red; }

    .story-step-button {
        min-width: 46px;
        height: 46px;
        padding: 0;
    }

    .tool-dataNarrator-creator-actions {
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
}
</style>
