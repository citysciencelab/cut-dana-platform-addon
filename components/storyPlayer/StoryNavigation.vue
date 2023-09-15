<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import {getStepReference} from "../../utils/getReference";
import actions from "../../store/actionsDataNarrator";
import getters from "../../store/gettersDataNarrator";
import mutations from "../../store/mutationsDataNarrator";

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
            getStepReference
        };
    },
    computed: {
        ...mapGetters("Tools/DataNarrator", Object.keys(getters))
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
    <div id="tool-dataNarrator-navigation">
        <v-btn
            class="story-navigation-button"
            :disabled="currentStepIndex <= 0"
            depressed
            rounded
            @click="selectPreviousStep"
        >
            <v-icon>arrow_left</v-icon>
        </v-btn>

        <v-slide-group
            :value="currentStepIndex + 1"
            show-arrows
            center-active
            @change="index => $emit('change', index > 0 ? index - 1 : null)"
        >
            <v-slide-item>
                <v-btn
                    class="story-navigation-step-button"
                    depressed
                    rounded
                    @click="$emit('change', null)"
                >
                    <v-icon>list</v-icon>
                </v-btn>
            </v-slide-item>

            <v-slide-item>
                <v-btn
                    class="story-navigation-step-button"
                    depressed
                    rounded
                    @click="$parent.$emit('share-story', currentStoryId, currentStepIndex)"
                >
                    <v-icon>share</v-icon>
                </v-btn>
            </v-slide-item>

            <v-slide-item
                v-for="(step, stepIndex) in steps"
                :key="getStepReference(step.associatedChapter, step.stepNumber)"
                v-slot="{ active, toggle }"
                :value="stepIndex + 1"
            >
                <v-btn
                    :input-value="active"
                    class="story-navigation-step-button"
                    active-class="primary white--text"
                    :class="{
                        currentChapter:
                            step.associatedChapter === currentChapter,
                        hidden:
                            step.associatedChapter !== currentChapter &&
                            step.stepNumber !== 1
                    }"
                    depressed
                    rounded
                    @click="toggle"
                >
                    <template v-if="step.associatedChapter === currentChapter">
                        <span>
                            {{
                                getStepReference(
                                    step.associatedChapter,
                                    step.stepNumber
                                )
                            }}
                        </span>
                    </template>
                    <template v-else>
                        <span>
                            {{ step.associatedChapter }}
                        </span>
                    </template>
                </v-btn>
            </v-slide-item>
        </v-slide-group>

        <v-btn
            class="story-navigation-button"
            :disabled="currentStepIndex >= steps.length - 1"
            depressed
            rounded
            @click="selectNextStep"
        >
            <v-icon>arrow_right</v-icon>
        </v-btn>
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
