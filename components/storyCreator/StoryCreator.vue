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

export default {
    name: "StoryCreator",
    components: {
        StoryForm,
        StepForm,
        StoryPlayer,
        FileForm
    },
    data () {
        return {
            constants,
            view: constants.storyCreationViews.THREE_D,
            stepToEdit: {}
        };
    },
    computed: {
        ...mapGetters("Tools/DataNarrator", Object.keys(getters))
    },
    methods: {
        ...mapMutations("Tools/DataNarrator", Object.keys(mutations)),
        ...mapActions("Tools/DataNarrator", Object.keys(actions)),

        /**
         * Handle editing a step
         * @param {Object} step the step to edit
         * @returns {void}
         */
        onEditStep (step) {
            this.stepToEdit = step;
            this.view = this.constants.storyCreationViews.STEP_CREATION;
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
         * Opens the 3d file form
         * @returns {void}
         */
        onEdit3D () {
            this.view = this.constants.storyCreationViews.THREE_D;
        }


    }
};
</script>

<template lang="html">
    <div id="tool-dataNarrator-creator">
        <StoryForm
            v-if="view === constants.storyCreationViews.STORY_CREATION"
            @openView="newView => (view = newView)"
            @editStep="onEditStep"
            v-on="$listeners"
        />

        <StepForm
            v-if="view === constants.storyCreationViews.STEP_CREATION"
            :edited-step="stepToEdit"
            @openView="newView => (view = newView)"
            @return="returnToStoryForm"
            v-on="$listeners"
        />

        <div
            v-if="view === constants.storyCreationViews.PREVIEW"
            class="tool-dataNarrator-creator-preview"
        >
            <div class="tool-dataNarrator-creator-preview-header primary">
                <v-btn
                    color="white"
                    icon
                    @click="returnToStoryForm"
                >
                    <v-icon>arrow_back_ios_new</v-icon>
                </v-btn>
                <h4 class="white--text">
                    Vorschau
                </h4>
            </div>

            <StoryPlayer is-preview />
        </div>

        <FileForm
            v-if="view === constants.storyCreationViews.THREE_D"
            @openView="newView => (view = newView)"
            @edit3D="onEdit3D"
            @return="returnToStoryForm"
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
