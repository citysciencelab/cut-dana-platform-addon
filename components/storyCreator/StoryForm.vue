<script>
import CreateStoryMixins from "../../mixins/CreateStoryMixins";
import CoverSelector from "./inputs/CoverSelector.vue";

export default {
    name: 'StoryForm',
    components: {CoverSelector},
    mixins: [CreateStoryMixins],
};
</script>

<template>
  <form
      id="story-form"
      @submit.prevent="saveStory"
  >
    <input name="title" placeholder="title" v-model="title"/>
    <textarea name="description" placeholder="Description" v-model="description"/>
  </form>

    <div id="tool-dataNarrator-creator-storyForm">
        <form
            id="story-form"
        >
            <CoverSelector
                :back-button-msg="$t('additional:modules.dataNarrator.button.cancel')"
                @click=""
            />

            <div class="form-group form-input-holder">
                <v-textarea
                    id="description"
                    v-model="description"
                    solo
                    hide-details="true"
                    rows="4"
                    :label="$t(
                        'additional:modules.dataNarrator.label.storyDescription'
                    )"
                />

<!--                <ShareSettings-->
<!--                    v-if="uid"-->
<!--                    :private-story="currentStory.private"-->
<!--                    :shared-with="currentStory.sharedWith"-->
<!--                    @update:private-story="newValue => currentStory.private = newValue"-->
<!--                    @update:shared-with="newValue => currentStory.sharedWith = newValue"-->
<!--                />-->

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

<!--            <TableOfContentsDnD-->
<!--                :rerender-key="rerenderKeyTOC"-->
<!--                @openView="(newView, stepChapterIndex) =>-->
<!--                    $emit(-->
<!--                        'openView', newView, stepChapterIndex-->
<!--                    )-->
<!--                "-->
<!--                @editStep="step => $emit('editStep', step)"-->
<!--                @deleteStep="(step, associatedChapter, stepNumber) =>-->
<!--                    $emit('deleteStep', step, associatedChapter, stepNumber)"-->
<!--            />-->

            <v-row class="mb-2">
                <v-col class="d-flex justify-center align-center">
                    <v-btn
                        class="story-step-button pill-button"
                        icon
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
                        {{ $t("additional:modules.dataNarrator.label.addChapter") }}
                    </div>
                </v-col>
            </v-row>

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
                                        icon

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
                                        $t("additional:modules.dataNarrator.button.cancel")
                                    }}
                                </span>
                            </v-btn>
                        </v-col>
                        <v-col>
                            <v-btn
                                class=""
                                small
                                color="green"
                                min-width="100%"
                            >
<!--                                :disabled="!currentStory.steps || !currentStory.steps.length"-->

<!--                                @click="$emit('openView', constants.storyCreationViews.PREVIEW)"-->
                                <span>
                                    {{
                                        $t("additional:modules.dataNarrator.button.previewStory")
                                    }}
                                </span>
                            </v-btn>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-btn
                            class=""
                            small

                            color="green"

                        >
<!--                            @click="confirmBeforeSaving"-->
<!--                            :disabled="!currentStory.steps || !currentStory.steps.length"-->
                            <span>
                                {{
                                    $t("additional:modules.dataNarrator.button.uploadStory")
                                }}
                            </span>
                        </v-btn>
                    </v-row>
                </v-container>
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
#story-form {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
</style>
