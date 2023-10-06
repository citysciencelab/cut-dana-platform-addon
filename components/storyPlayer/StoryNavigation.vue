<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import {getStepReference} from "../../utils/getReference";
import actions from "../../store/actionsDataNarrator";
import getters from "../../store/gettersDataNarrator";
import mutations from "../../store/mutationsDataNarrator";
import { mdiChevronLeft, mdiChevronRight } from "@mdi/js";
import { SensorThingsHttp } from "../../../../../src/utils/sensorThingsHttp";

export default {
    name: "StoryNavigation",
    model: {
        prop: "currentStepIndex",
        event: "change"
    },
    props: {
        // The index of the selected step
        currentStepIndex: {
            type: Number,
            default: null
        },
        // The chapter of the selected step
        currentChapter: {
            type: Number,
            default: null
        },
        // All steps of the current story
        steps: {
            type: Array,
            default: null
        }
    },
    data () {
        return {
            icons: {
                mdiChevronLeft,
                mdiChevronRight
            },
            getStepReference
        };
    },
    computed: {
        ...mapGetters("Tools/DataNarrator", Object.keys(getters)),

        /**
         * Get the amount of steps in the current chapter
         * @returns {number}
         */
        currentChapterStepCount () {
            return this.steps.filter(
                step => step.associatedChapter === this.currentChapter
            ).length;
        },

        /**
         * get current step index in the current chapter
         * @returns {number}
         */
        currentChapterStepIndex () {
            // Get all steps before the current step that are not in the current chapter
            const previousStepsNotInCurrentChapter =  this.steps.filter(step => step.associatedChapter < this.currentChapter);
            
            // Return the number of steps in the chapter up to and including the current step
            return this.currentStepIndex - previousStepsNotInCurrentChapter.length;
        }
    },
    methods: {
        ...mapMutations("Tools/DataNarrator", Object.keys(mutations)),
        ...mapActions("Tools/DataNarrator", Object.keys(actions)),

        /**
         * Selects the previous step
         * @returns {void}
         */
        selectPreviousStep () {
            const minStepIndex = 0,
                previousStepIndex = Math.max(
                    minStepIndex,
                    this.currentStepIndex - 1
                );

            this.$emit("change", previousStepIndex);
        },

        /**
         * Selects the next step
         * @returns {void}
         */
        selectNextStep () {
            const maxStepIndex = this.steps.length - 1,
                nextStepIndex = Math.min(
                    maxStepIndex,
                    this.currentStepIndex + 1
                );

            this.$emit("change", nextStepIndex);
        }
    }
};
</script>

<template lang="html">
    <div id="tool-dataNarrator-navigation" class="d-flex justify-content-between">
        <!-- <v-btn
            class="story-navigation-step-button"
            depressed
            rounded
            @click="$emit('change', null)"
        >
            <v-icon>list</v-icon>
        </v-btn> -->
        <div class="d-flex align-items-center">
            <v-btn
                small
                depressed
                @click="$emit('change', null)"
            >
                <v-icon left>
                    list
                </v-icon>
                Table of contents
            </v-btn>
        </div>


        <div class="d-flex">
            <v-btn
                class="story-navigation-button"
                :disabled="currentStepIndex <= 0"
                depressed
                rounded
                icon
                @click="selectPreviousStep"
            >
                <v-icon>{{ icons.mdiChevronLeft }}</v-icon>
            </v-btn>
            <!-- show the current step index from the current chapter -->
            <div class="d-flex justify-content-center align-items-center">
                {{ currentChapterStepIndex + 1 }} / {{ currentChapterStepCount }}
            </div>
            <v-btn
                class="story-navigation-button"
                :disabled="currentStepIndex >= steps.length - 1"
                depressed
                rounded
                icon
                @click="selectNextStep"
            >
                <v-icon>{{ icons.mdiChevronRight }}</v-icon>
            </v-btn>
        </div>

    </div>
</template>

<style lang="scss" scoped>
#tool-dataNarrator-navigation {
    display: flex;

    .story-navigation-button {
        min-width: 46px;
        height: 46px;
        padding: 0;
    }

    &::v-deep {
        .v-slide-group {
            flex-grow: 1;
            max-width: calc(100% - 92px);

            &__content {
                justify-content: center;
            }
        }

        .story-navigation-step-button {
            min-width: 0;
            width: 36px;
            margin: 5px;
            padding: 0;
            letter-spacing: 0;

            &.v-btn--active {
                transform: scale(1.2);
            }

            &.currentChapter {
                background: #e0eefa;
            }

            &.hidden {
                display: none;
            }
        }
    }
}
</style>
