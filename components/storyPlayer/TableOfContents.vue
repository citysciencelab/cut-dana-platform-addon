<script>
import {mapGetters, mapMutations} from "vuex";
import AlphanumericEncoder from "alphanumeric-encoder";
import {stepPalette} from "../../store/constantsDataNarrator";
import mutations from "../../store/mutationsDataNarrator";
import getters from "../../store/gettersDataNarrator";

export default {
    name: "TableOfContents",
    props: {
        previousStepIndex: {
            type: Number,
            default: null
        }
    },
    data () {
        return {
            stepPalette,
            encoder: new AlphanumericEncoder()
        };
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
        },
        colorFor (chapterNumber) {
            const index = (chapterNumber - 1) % this.stepPalette.length;

            return this.stepPalette[index];
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
                <span
                    role="button"
                    tabindex="0"
                >
                    <v-tooltip left>
                        <template #activator="{ on, attrs }">
                            <v-icon
                                v-bind="attrs"
                                v-on="on"
                                @click="toStepIndex(previousStepIndex)"
                                @keydown="toStepIndex(previousStepIndex)"
                            >keyboard_backspace</v-icon>
                        </template>
                        <span>{{ $t("additional:modules.tools.dataNarrator.button.backToStory") }}</span>
                    </v-tooltip>
                </span>
                <span class="story-title">{{ currentStory.title }}</span>
            </v-col>
        </v-row>
        <v-list-item-group class="chapters-list">
            <template v-for="(chapter) in currentStory.chapters">
                <v-list-item
                    :key="`chapter_${chapter.chapterNumber}`"
                    class="chapter-item"
                    @click="toChapter(chapter)"
                    @keydown="toChapter(chapter)"
                >
                    <v-chip
                        :color="colorFor(chapter.chapterNumber).main"
                        pill
                        text-color="white"
                        class="toc-chips"
                    >
                        {{ encoder.encode(chapter.chapterNumber) }}
                    </v-chip>
                    <v-list-item-title class="chapter-title">
                        {{ chapter.chapterTitle }}
                    </v-list-item-title>
                </v-list-item>
                <v-list-item-group
                    :key="`chapter_steps_${chapter.chapterNumber}`"
                >
                    <template
                        v-for="(step) in currentStory.steps.filter(
                            ({associatedChapter}) =>
                                associatedChapter === chapter.chapterNumber
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
.story-title {
    font-weight: bold;
    text-transform: uppercase;
    margin-left: 10px;
}

.toc-chips {
    height: 18px;
    font-weight: bold;
    margin-right: 10px;
}
.chapter-title {
    font-weight: bold;
}

.chapter-item {
    min-height: 30px;
    padding: 0;
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
