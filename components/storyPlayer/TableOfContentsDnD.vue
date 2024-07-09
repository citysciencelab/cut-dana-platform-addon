<script>
import {mapGetters, mapMutations} from "vuex";
import RenderUtilities from "../../mixins/RenderUtilities";
import mutations from "../../store/mutationsDataNarrator";
import getters from "../../store/gettersDataNarrator";
import ChapterTitle from "../shared/ChapterTitle.vue";
import draggable from "vuedraggable"; // Import the Vue.Draggable library
import {mdiDragHorizontalVariant, mdiDeleteOutline, mdiNoteEditOutline} from "@mdi/js";
import CoverSelector from "../storyCreator/inputs/CoverSelector.vue";
import * as constants from "../../store/constantsDataNarrator";

export default {
    name: "TableOfContentsDnD",
    components: {
        CoverSelector,
        ChapterTitle,
        Draggable: draggable // Add draggable to your components
    },
    mixins: [RenderUtilities],
    props: {
        previousStepIndex: {
            type: Number,
            default: null
        },
        showMoreThanContents: {
            type: Boolean,
            default: false
        },
        rerenderKey: {
            type: Number,
            default: 0
        }
    },
    data () {
        return {
            icons: {
                mdiDragHorizontalVariant,
                mdiDeleteOutline,
                mdiNoteEditOutline
            },
            chaptersWithSteps: [],
            hoveredStepId: null,
            constants
        };
    },
    computed: {
        ...mapGetters("Tools/DataNarrator", Object.keys(getters)),
        isChapterWithoutStep () {
            return this.chaptersWithSteps.some(chapterWithSteps => chapterWithSteps.steps.length === 0);
        }
    },
    watch: {
        rerenderKey () {
            this.chaptersWithSteps = this.computeChapterWithSteps();
        }
    },
    created () {
        this.chaptersWithSteps = this.computeChapterWithSteps();
    },
    mounted () {
        this.setName("additional:modules.tools.dataNarrator.tableOfContents");
        document.getElementById("vue-tool-content-body").style.backgroundColor = "#F6f6f6";
    },
    beforeDestroy () {
        console.log("beforedestroy");
        if (this.isChapterWithoutStep) {
            // Prevent component destruction
            return;
        }
        this.saveOrder();
    },
    methods: {
        ...mapMutations("Tools/DataNarrator", Object.keys(mutations)),

        /**
         * This method is used to set the current step index.
         * @param {Number} stepIndex - The index of the step to be set.
         * @returns {void}
         */
        toStepIndex (stepIndex) {
            this.$emit("setCurrentStepIndex", stepIndex);
        },

        /**
         * This method is used to navigate to a specific step.
         * @param {Object} step - The step to navigate to.
         * @returns {void}
         */
        toStep (step) {
            const stepIndex = this.currentStory.steps.findIndex((candidateStep) => candidateStep._id === step._id);

            this.toStepIndex(stepIndex);
        },

        /**
         * This method is used to navigate to the first step of a specific chapter.
         * @param {Object} chapter - The chapter to navigate to.
         * @returns {void}
         */
        toChapter (chapter) {
            const step = this.currentStory.steps.find(
                ({associatedChapter}) => associatedChapter === chapter.chapterNumber
            );

            this.toStep(step);
        },

        /**
         * This method is used to compute the chapters with their steps for the DND list.
         * @returns {Array} - An array of chapters with their steps.
         */
        computeChapterWithSteps () {
            return this.currentStory.chapters.map(chapter => {
                return {
                    chapter,
                    steps: this.currentStory.steps.filter(
                        ({associatedChapter}) => associatedChapter === chapter.chapterNumber
                    )
                };
            });
        },

        /**
         * This method is used to update the order of steps and chapters when a step is moved.
         * @param {Object} event - The event object containing information about the drag and drop operation.
         * @returns {void}
         */
        updateOrder (event) {
            const movedStep = this.currentStory.steps.find(
                    step => step.stepNumber === event.item.stepNumber
                ),
                oldChapter = movedStep && this.currentStory.chapters.find(
                    chapter => chapter.chapterNumber === movedStep.associatedChapter
                ),
                newChapter = movedStep && this.currentStory.chapters[event.to.parentNode.dataset.index],
                oldChapterSteps = oldChapter && oldChapter.steps,
                newChapterSteps = newChapter && newChapter.steps;

            if (!movedStep) {
                return;
            }

            if (!oldChapter) {
                console.error("Old chapter not found");
                return;
            }

            if (!newChapter) {
                console.error("New chapter not found");
                return;
            }

            // Remove the moved step from its old chapter
            oldChapterSteps.splice(oldChapterSteps.indexOf(movedStep), 1);

            // Add the moved step to its new chapter
            newChapterSteps.splice(event.newIndex, 0, movedStep);

            // Update the associatedChapter property of the moved step
            movedStep.associatedChapter = newChapter.chapterNumber;

            // Update chaptersWithSteps
            this.chaptersWithSteps = this.currentStory.chapters.map(chapter => {
                return {
                    chapter,
                    steps: this.currentStory.steps.filter(
                        ({associatedChapter}) => associatedChapter === chapter.chapterNumber
                    )
                };
            });
        },

        /**
         * This method is used to save the current order of steps and chapters.
         * @returns {void}
         */
        saveOrder () {
            // Create new arrays for chapters and steps
            const newChapters = [],
                newSteps = [];

            // Iterate over chaptersWithSteps
            this.chaptersWithSteps.forEach((chapterWithSteps, index) => {
                // Update the chapterNumber of the chapter
                chapterWithSteps.chapter.chapterNumber = index + 1;

                // Update the associatedChapter of each step
                chapterWithSteps.steps.forEach((step, stepChapterIndex) => {
                    step.stepNumber = stepChapterIndex + 1;
                    step.associatedChapter = chapterWithSteps.chapter.chapterNumber;
                });

                // Add the updated chapter and steps to the new arrays
                newChapters.push(chapterWithSteps.chapter);
                newSteps.push(...chapterWithSteps.steps);
            });

            // Assign the updated chapters and steps back to currentStory
            this.currentStory.chapters = newChapters;
            this.currentStory.steps = newSteps;
        },

        /**
         * Sends deleteStep event to StoryCreator
         * @param {Object} step - The step to be deleted
         * @returns {void}
         */
        onDeleteStep (step) {
            const {associatedChapter, stepNumber} = step;

            this.$emit("deleteStep", step, associatedChapter, stepNumber);
        }
    }
};
</script>

<template lang="html">
    <div>
        <CoverSelector
            v-if="showMoreThanContents"
            :back-button-msg="$t('additional:modules.tools.dataNarrator.button.backToStory')"
            @click="toStepIndex(previousStepIndex)"
        />

        <v-row
            v-if="showMoreThanContents"
        >
            <v-col>
                <div class="subheader">
                    {{ $t("additional:modules.tools.dataNarrator.tableOfContents") }}
                </div>
            </v-col>
        </v-row>

        <Draggable
            :key="rerenderKey"
            v-model="chaptersWithSteps"
            group="chapters"
            @end="updateOrder"
        >
            <v-list-item-group
                v-for="(chapterWithSteps) in chaptersWithSteps"
                :key="`chapter_group_${chapterWithSteps.chapter.chapterNumber}`"
            >
                <ChapterTitle
                    :key="`chapter_${chapterWithSteps.chapter.chapterNumber}`"
                    :chapter="chapterWithSteps.chapter"
                    @click="toChapter(chapterWithSteps.chapter)"
                    @openView="(newView, stepChapterIndex) =>
                        $emit(
                            'openView', newView, stepChapterIndex
                        )
                    "
                />
                <Draggable
                    v-model="chapterWithSteps.steps"
                    group="steps"
                    @end="updateOrder"
                >
                    <v-list-item
                        v-for="(step) in chapterWithSteps.steps"
                        :key="`step_${step.stepNumber}_chapter_${step.associatedChapter}`"
                        @click="toStep(step)"
                        @keydown="toStep(step)"
                    >
                        <v-row>
                            <v-col
                                cols="1"
                                class="d-flex justify-end align-center"
                            >
                                <v-icon
                                    small
                                    class="drag-icon"
                                >
                                    {{ icons.mdiDragHorizontalVariant }}
                                </v-icon>
                            </v-col>
                            <v-col
                                cols="11"
                                class="step-item"
                                @mouseover="hoveredStepId = step._id"
                                @mouseleave="hoveredStepId = null"
                                @focusin="hoveredStepId = step._id"
                                @focusout="hoveredStepId = null"
                            >
                                {{ step.title }}
                                <v-icon
                                    v-show="hoveredStepId === step._id"
                                    class="step-icon edit-icon"
                                    small
                                    :title="$t(
                                        'additional:modules.tools.dataNarrator.creator.deleteStep'
                                    )"
                                    @click="$emit('editStep', step)"
                                >
                                    {{ icons.mdiNoteEditOutline }}
                                </v-icon>
                                <v-icon
                                    v-show="hoveredStepId === step._id"
                                    class="step-icon delete-icon"
                                    small
                                    :title="$t(
                                        'additional:modules.tools.dataNarrator.creator.editStep'
                                    )"
                                    @click="onDeleteStep(step)"
                                >
                                    {{ icons.mdiDeleteOutline }}
                                </v-icon>
                            </v-col>
                        </v-row>
                    </v-list-item>
                </Draggable>
            </v-list-item-group>
        </Draggable>
        <v-row
            v-if="isChapterWithoutStep"
            class="ma-0 pa-0"
        >
            <v-col
                cols="12"
                class="d-flex justify-center align-self-center"
            >
                <p class="text-warning">
                    <small>
                        {{ $t( "additional:modules.tools.dataNarrator.warning.noStepInChapter" ) }}
                    </small>
                </p>
            </v-col>
        </v-row>
    </div>
</template>

<style lang="scss" scoped>

.subheader {
    font-weight: bold;
    margin: 10px 0 15px 0;
    font-size: 10pt;
}

.chapters-list {
    padding-bottom: 20px;
}

.drag-icon {
    margin-right: 5px;
}

.step-item {
    background-color: white;
    border-radius: 15px;
    transition: box-shadow 0.3s ease-in-out;
    padding: 3px 3px 3px 15px;
    position: relative;

    .step-icon {
        position: absolute;
        top: 5px;
    }

    .delete-icon {
        right: 10px;
    }

    .edit-icon {
        right: 30px;
    }

    &:hover {
        box-shadow: 0px 1px 3px 0px
        rgba(0, 0, 0, 0.20),
        0px 4px 15px 3px
        rgba(0, 0, 0, 0.15);
    }

    .menu-button {
        width: 20px;
        height: 20px;
        position: absolute;
        right: 8px;
    }
}

.v-list-item {
    min-height: 35px;
}
.v-list-item:hover, .v-list-item--link:before, .v-list-item:hover:before {
    background-color: transparent !important;
}

::v-deep .theme--light.v-list-item:hover:before {
    opacity: 0 !important;
    background-color: transparent !important;
}

::v-deep .theme--light.v-list-item:focus:before {
    opacity: 0 !important;
    background-color: transparent !important;
}


</style>
