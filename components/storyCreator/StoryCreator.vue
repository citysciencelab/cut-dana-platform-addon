<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import StoryForm from "./StoryForm.vue";
import StepForm from "./StepForm.vue";
import StoryPlayer from "../storyPlayer/StoryPlayer.vue";
import * as constants from "../../store/constantsDataNarrator";
import actions from "../../store/actionsDataNarrator";
import getters from "../../store/gettersDataNarrator";
import mutations from "../../store/mutationsDataNarrator";

export default {
    name: "StoryCreator",
    components: {
        StoryForm,
        StepForm,
        StoryPlayer
    },
    data () {
        return {
            constants,
            view: constants.storyCreationViews.STORY_CREATION,
            stepToEdit: null
        };
    },
    computed: {
        ...mapGetters("Tools/DataNarrator", Object.keys(getters))
    },
    mounted () {
        if (Object.hasOwn(this.storyConf, "storyId")) {
            // console.log(this.storyConf);
        }
        else {
            this.setStoryConf({...this.constants.emptyStoryConf});
        }

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
            this.stepToEdit = null;
            this.view = this.constants.storyCreationViews.STORY_CREATION;
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
            :is-editing="Boolean(stepToEdit)"
            :initial-step="stepToEdit"
            @return="returnToStoryForm"
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

        > button {
            position: absolute;
            left: 0;
            margin: 2px;
        }
    }
}
</style>
