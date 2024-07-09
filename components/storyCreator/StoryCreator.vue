<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import actions from "../../store/actionsDataNarrator";
import * as constants from "../../store/constantsDataNarrator";
import getters from "../../store/gettersDataNarrator";
import mutations from "../../store/mutationsDataNarrator";
import StoryPlayer from "../storyPlayer/StoryPlayer.vue";
import FileForm from "./FileForm.vue";
import StepForm from "./StepForm.vue";
import StoryForm from "./StoryForm.vue";
import LayerEditor from "./LayerEditor.vue";
import EntityEditor from "./EntityEditor.vue";
import LayerUtilities from "../../mixins/LayerUtilities";
import * as cesiumUtils from "../../utils/cesium";
import DataEditor from "./DataEditor.vue";

export default {
    name: "StoryCreator",
    components: {
        DataEditor,
        StoryForm,
        StepForm,
        StoryPlayer,
        FileForm,
        EntityEditor,
        LayerEditor
    },
    mixins: [LayerUtilities],
    props: {
        uid: {
            type: String,
            default: null
        }
    },
    data () {
        return {
            constants,
            view: constants.storyCreationViews.STORY_CREATION,
            stepToEdit: {},
            storyToEdit: {},
            addToChapterIndex: null
        };
    },
    computed: {
        ...mapGetters("Tools/DataNarrator", Object.keys(getters))
    },
    mounted () {
        document.getElementById("vue-tool-content-body").style.backgroundColor = "#F6f6f6";
    },
    methods: {
        ...mapMutations("Tools/DataNarrator", Object.keys(mutations)),
        ...mapActions("Tools/DataNarrator", Object.keys(actions)),
        ...cesiumUtils,
        /**
         * Handle editing a step
         * @param {Object} step the step to edit
         * @param {boolean} returnToStepForm whether to return to the step form
         * @returns {void}
         */
        onEditStep (step, returnToStepForm) {
            this.stepToEdit = step;
            if (returnToStepForm) {
                this.view = this.constants.storyCreationViews.STEP_CREATION;
            }
        },

        /**
         * Return to the story form
         * @returns {void}
         */
        returnToStoryForm () {
            this.stepToEdit = {};
            this.view = this.constants.storyCreationViews.STORY_CREATION;
        },

        /**
         * Return to the step form
         * @param {Object} step the step to edit
         * @returns {void}
         */
        returnToStepForm (step) {
            this.stepToEdit = step;
            // this.setCurrentStory(story);
            this.view = this.constants.storyCreationViews.STEP_CREATION;
        },

        /**
         * Return to the file edit form
         * @param {Object} step the step to edit
         * @returns {void}
         */
        goToFileForm (step) {
            this.stepToEdit = step;
            // this.setCurrentStory(story);
            this.view = this.constants.storyCreationViews.THREE_D;
        },

        /**
         * Opens the 3d file form
         * @returns {void}
         */
        onEdit3D () {
            this.view = this.constants.storyCreationViews.THREE_D;
        },


        /**
         * Opens the layer editor
         * @param {object} step the current step that is edited
         * @returns {void}
         */
        openLayerEditor (step) {
            this.stepToEdit = step;
            this.view = this.constants.storyCreationViews.LAYER_EDITOR;
        },


        /**
         * Opens the data editor
         * @param {object} step the current step that is edited
         * @returns {void}
         */
        openDataEditor (step) {
            this.stepToEdit = step;
            this.view = this.constants.storyCreationViews.DATA_EDITOR;
        },

        /**
         * navigates to the entityEditor
         * @param {object} step the current step that is edited
         * @returns {void}
         */
        openEntityEditor (step) {
            this.stepToEdit = step;
            // this.setCurrentStory(story);
            this.view = this.constants.storyCreationViews.ENTITY_EDITOR;
        },

        /**
         * Shows confirmation dialog
         * Deletes the step from the story if confirmed
         * @param {Object} step the step to delete
         * @param {Object} associatedChapter the chapter the step is associated with
         * @param {number} stepNumber the step number
         * @returns {void}
         */
        onDeleteStep (step, associatedChapter, stepNumber) {
            /**
             * Constant that saves all the actions on confirm
             * @returns {void}
             */
            const deleteStep = () => {
                this.deleteStoryStep({step: step});
                this.adjustStepNumbers({associatedChapter, stepNumber});
                this.returnToStoryForm();
                // Update the TOC after the story form is created
                this.$nextTick(() => {
                    this.$refs.storyForm.updateTOC();
                });
            };

            this.$emit("confirm", "deleteStep", deleteStep);
        }

    }
};
</script>

<template lang="html">
    <div id="tool-dataNarrator-creator">
        <StoryForm
            v-if="view === constants.storyCreationViews.STORY_CREATION"
            ref="storyForm"
            :uid="uid"
            @openView="(newView, stepChapterIndex) => (view = newView, addToChapterIndex = stepChapterIndex)"
            @editStep="(step) => onEditStep(step, true)"
            @deleteStep="(step, associatedChapter, stepNumber) => onDeleteStep(step, associatedChapter, stepNumber)"
            @stepDeleted="$emit('stepDeleted')"
            v-on="$listeners"
        />

        <StepForm
            v-if="view === constants.storyCreationViews.STEP_CREATION"
            :edited-story="currentStory"
            :edited-step="stepToEdit"
            :add-to-chapter="addToChapterIndex"
            @openView="newView => (view = newView)"
            @return="returnToStoryForm"
            @openFileForm="goToFileForm"
            @openLayerEditor="openLayerEditor"
            @openDataEditor="openDataEditor"
            @deleteStep="(step, associatedChapter, stepNumber) => onDeleteStep(step, associatedChapter, stepNumber)"
            v-on="$listeners"
        />

        <StoryPlayer
            v-if="view === constants.storyCreationViews.PREVIEW"
            @reset="returnToStoryForm"
        />

        <LayerEditor
            v-if="view === constants.storyCreationViews.LAYER_EDITOR"
            :all-layer-options="allLayerOptions"
            :step="stepToEdit"
            @return="returnToStepForm"
            v-on="$listeners"
        />

        <DataEditor
            v-if="view === constants.storyCreationViews.DATA_EDITOR"
            :step="stepToEdit"
            @return="returnToStepForm"
            v-on="$listeners"
        />

        <FileForm
            v-if="view === constants.storyCreationViews.THREE_D"
            :edited-story="currentStory"
            :edited-step="stepToEdit"
            @openView="newView => (view = newView)"
            @edit3D="onEdit3D"
            @return="returnToStepForm"
            @openEntityEditor="openEntityEditor"
            v-on="$listeners"
        />

        <EntityEditor
            v-if="view === constants.storyCreationViews.ENTITY_EDITOR"
            :edited-step="stepToEdit"
            @openView="newView => (view = newView)"
            @return="goToFileForm"
            v-on="$listeners"
        />
    </div>
</template>

<style lang="scss" scoped>
.tool-dataNarrator-creator-preview {
    display: grid;
    grid-template-rows: auto 1fr;
    grid-gap: 20px;
    max-height: calc(72vh - 40px);

    &-header {
        display: flex;
        align-items: center;
        justify-content: center;
        // width: var(--initialToolWidth);
        // @media (max-width: 767px) {
        //     width: var(--initialToolWidthMobile);
        // }

        > button {
            position: absolute;
            left: 0;
            margin: 2px;
        }
    }
}
</style>

<style lang="scss">
.vue-text-all-top {
    margin-top: 0px;
    padding-top: 0px;
}

.vue-text-all-top.positon_change {
    fieldset {
        border: 1px solid rgba(var(--bs-warning-rgb)) !important;
    }
}

.form-input-holder {
    background-color: white !important;
    padding: 5px;
}
.form-input-holder.xs {
    border-radius: 20px;
}
.form-input-holder.lg {
    border-radius: 5px;
    margin-bottom: 10px;
}
.tool-dataNarrator-creator-actions {
    position: sticky;
    z-index: 2;
    bottom: 0;

    .v-card__text {
        padding-top: 5px;
        padding-bottom: 5px;
    }
}
</style>
