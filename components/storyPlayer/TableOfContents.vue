<script>
import {mapGetters, mapMutations} from "vuex";
import RenderUtilities from "../../mixins/RenderUtilities";
import mutations from "../../store/mutationsDataNarrator";
import getters from "../../store/gettersDataNarrator";
import ChapterTitle from "../shared/ChapterTitle.vue";
import BackButton from "../shared/BackButton.vue";

export default {
    name: "TableOfContents",
    components: {
        ChapterTitle,
        BackButton
    },
    mixins: [RenderUtilities],
    props: {
        previousStepIndex: {
            type: Number,
            default: null
        }
    },
    computed: {
        ...mapGetters("Tools/DataNarrator", Object.keys(getters)),
        currentStepId () {
            return this.currentStory.steps[this.previousStepIndex]._id;
        }
    },
    mounted () {
        this.setName("additional:modules.tools.dataNarrator.tableOfContents");
    },
    methods: {
        ...mapMutations("Tools/DataNarrator", Object.keys(mutations)),
        toStepIndex (stepIndex) {
            this.$emit("setCurrentStepIndex", stepIndex);
        },
        toStep (step) {
            const stepIndex = this.currentStory.steps.findIndex((candidateStep) => candidateStep._id === step._id);

            this.toStepIndex(stepIndex);
        },
        toChapter (chapter) {
            const step = this.currentStory.steps.find(
                ({associatedChapter}) => associatedChapter === chapter.chapterNumber
            );

            this.toStep(step);
        }
    }
};
</script>

<template lang="html">
    <div>
        <v-row>
            <v-col
                cols="12"
            >
                <BackButton
                    tooltip="additional:modules.tools.dataNarrator.button.backToStory"
                    :text="currentStory.title"
                    @click="toStepIndex(previousStepIndex)"
                />
            </v-col>
        </v-row>
        <v-list-item-group class="chapters-list">
            <template v-for="(chapter) in currentStory.chapters">
                <ChapterTitle
                    :key="`chapter_${chapter.chapterNumber}`"
                    :chapter="chapter"
                    @click="toChapter(chapter)"
                />
                <v-list-item-group
                    :key="`chapter_steps_${chapter.chapterNumber}`"
                >
                    <template
                        v-for="(step) in currentStory.steps.filter(
                            ({associatedChapter}) => associatedChapter === chapter.chapterNumber
                        )"
                    >
                        <v-list-item
                            :key="`step_${step.stepNumber}`"
                            class="step-item"
                            :style="{backgroundColor: colorFor(chapter.chapterNumber).secondary}"
                            :class="{'step-item-active': step._id === currentStepId}"
                            @click="toStep(step)"
                            @keydown="toStep(step)"
                        >
                            <v-list-item-title class="step-title">
                                {{ step.stepNumber }}.
                                {{ step.title }}
                            </v-list-item-title>
                        </v-list-item>
                    </template>
                </v-list-item-group>
            </template>
        </v-list-item-group>
    </div>
</template>

<style lang="scss" scoped>

.chapters-list {
    padding-bottom: 20px;
}

.step-item {
  min-height: 30px;
  padding: 0 10px;
  margin: 2px 13px;
  border-radius: 5px;
}

.step-item-active {
  border: 1px solid black;
  background-color: white !important;
}
</style>
