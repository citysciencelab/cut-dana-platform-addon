<script>
import CreateStoryMixins from "../../mixins/CreateStoryMixins";
import CoverSelector from "./inputs/CoverSelector.vue";
import NavigationMixins from "../../mixins/NavigationMixins";
import {dataNarratorModes} from "../../store/contantsDataNarrator";
import {mapGetters, mapMutations} from "vuex";
import {state as editStoryState} from "../../store/FormStores/EditStoryForm";
import {mutations as editStoryMutations} from "../../store/FormStores/EditStoryForm";
import {mdiPlus} from "@mdi/js";

export default {
    name: 'StoryForm',
    data() {
        return {
            icons: {
                mdiPlus
            }
        }
    },
    computed: {
        ...mapGetters("Modules/DataNarrator/EditFormStore", Object.keys(editStoryState)),

        dataNarratorModes() {
            return dataNarratorModes
        },

        storyDescription: {
            get () {
                return this.$store.state.Modules.DataNarrator.EditFormStore.storyDescription;
            },
            set (value) {
                this.$store.commit("Modules/DataNarrator/EditFormStore/setStoryDescription", value);
            }
        }
    },
    methods: {
        ...mapMutations("Modules/DataNarrator/EditFormStore", Object.keys(editStoryMutations)),
    },
    components: {CoverSelector},
    mixins: [CreateStoryMixins, NavigationMixins],
};
</script>

<template>
    <div id="tool-dataNarrator-creator-storyForm">
        <form
            id="story-form"
            @submit.prevent="saveStory"
        >
            <CoverSelector
                :back-button-msg="$t('additional:modules.dataNarrator.button.cancel')"
                back-click="() => gotoPage(dataNarratorModes.DASHBOARD)"
            />

            <div class="form-group form-input-holder">
                <v-textarea
                    id="description"
                    v-model="storyDescription"
                    solo
                    hide-details="true"
                    rows="4"
                    :label="$t(
                        'additional:modules.dataNarrator.label.storyDescription'
                    )"
                />

                <v-expansion-panels id="advanced-options">
                    <v-expansion-panel>
                        <v-expansion-panel-title>
                            {{
                                $t("additional:modules.dataNarrator.label.advancedOptions")
                            }}
                        </v-expansion-panel-title>
                        <v-expansion-panel-text>
                            <div>
                                <v-checkbox
                                    id="story-scrolly"
                                    :value="false"
                                    :label="$t('additional:modules.dataNarrator.label.scrolly')"
                                />
                            </div>
                            <div
                                v-if="false"
                            >
                                <div class="vue-label-style">
                                    {{ $t('additional:modules.dataNarrator.label.interval') }}
                                </div>
                                <v-slider
                                    id="story-interval"
                                    step="1"
                                    max="40"
                                    min="0"
                                    thumb-label
                                    hide-details="true"
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
                        </v-expansion-panel-text>
                    </v-expansion-panel>
                </v-expansion-panels>
            </div>

            <v-row class="mb-2">
                <v-col class="d-flex justify-center align-center">
                    <v-btn
                        class="story-step-button pill-button"
                        :title="
                            $t(
                                'additional:modules.dataNarrator.button.addChapter'
                            )
                        "
                        @click="
                            $emit(
                                'openView',
                                constants.storyCreationViews.STEP_CREATION, 0
                            )
                        "
                    >
                        <v-icon>{{ icons.mdiPlus }}</v-icon>
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
                        {{ $t("additional:modules.dataNarrator.label.addChapter") }}
                    </div>
                </v-col>
            </v-row>

<!--            <v-progress-linear-->
<!--                v-if="!notSaving"-->
<!--                indeterminate-->
<!--                height="10"-->
<!--                striped-->
<!--                rounded-->
<!--                color="lime"-->
<!--            />-->

            <v-footer
                v-if="notSaving"
                class="tool-dataNarrator-creator-actions white"
                elevation="1"
                rounded
            >
                <v-card
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
                                        @click="$emit('reset-tool')"
                                    >
                                        <v-icon size="24px">{{ icons.mdiCancel }}</v-icon>
                                    </v-btn>
                                </span>
                            </template>
                            <span>
                                {{
                                    $t("additional:modules.dataNarrator.button.cancel")
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
                                    >
                                        <v-icon size="24px">{{ icons.mdiEyeOutline }}</v-icon>
                                    </v-btn>
                                </span>
                            </template>
                            <span>
                                {{
                                    $t("additional:modules.dataNarrator.button.previewStory")
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
                                    >
<!--                                        :disabled="!currentStory.steps || !currentStory.steps.length"-->
<!--                                        @click="confirmBeforeSaving"-->
                                        <v-icon size="24px">{{ icons.mdiCheck }}</v-icon>
                                    </v-btn>
                                </span>
                            </template>
                            <span>
                                {{
                                    $t("additional:modules.dataNarrator.button.uploadStory")
                                }}
                            </span>
                        </v-tooltip>
                    </v-card-text>
                </v-card>
            </v-footer>

            <v-alert
                v-show="true"
                id="tool-dataNarrator-creator-noSteps"
                type="info"
                class="white"
            >
                {{
                    $t("additional:modules.dataNarrator.warning.sendNoSteps")
                }}
            </v-alert>
        </form>
    </div>
</template>

<style scoped lang="scss">
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
