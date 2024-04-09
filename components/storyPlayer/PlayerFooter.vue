<script>

import {mapGetters} from "vuex";
import getters from "../../store/gettersDataNarrator";
import ShareButton from "../Dashboard/Stories/StoryActionButtons/ShareButton.vue";

export default {
    name: "PlayerFooter",
    components: {
        ShareButton
    },
    props: {
        currentStepIndex: {
            type: Number,
            default: null
        },
        showMode: {
            type: String,
            default: "scrolly"
        }
    },
    data () {
        return {
            isScrollytelling: false,
            isAutoPlay: false
        };
    },
    computed: {
        ...mapGetters("Tools/DataNarrator", Object.keys(getters)),
        stepLength () {
            return this.currentStory.steps.length;
        }
    },
    mounted () {
        this.isAutoPlay = this.currentStory.storyInterval > 0;
    },
    methods: {
        toggleAutoPlay () {
            this.isAutoPlay = !this.isAutoPlay;
            this.$emit("toggleAutoPlay");
        },
        toggleScrollytelling () {
            this.isScrollytelling = !this.isScrollytelling;
            if (this.isScrollytelling && this.isAutoPlay) {
                this.$emit("toggleAutoPlay");
            }
            this.$emit("toggleScrollytelling");
        }
    }
};
</script>

<template>
    <div
        id="tool-dataNarrator-navigation"
        class="d-flex justify-content-between"
    >
        <div class="d-flex align-items-center">
            <span v-if="mode && currentStory.storyInterval">
                <span
                    id="auto-play-button"
                    role="button"
                    tabindex="0"
                    @click="toggleAutoPlay"
                    @keydown="toggleAutoPlay"
                >
                    <v-tooltip left>
                        <template #activator="{ on, attrs }">
                            <v-icon
                                :color="isAutoPlay ? '#66afe9' : ''"
                                v-bind="attrs"
                                v-on="on"
                            >timer
                            </v-icon>
                        </template>
                        <span>
                            {{
                                $t("additional:modules.tools.dataNarrator.label.autoPLay")
                            }}
                            {{
                                isAutoPlay ? $t("additional:modules.tools.dataNarrator.label.off") :
                                $t("additional:modules.tools.dataNarrator.label.on")
                            }}
                        </span>
                    </v-tooltip>
                </span>
            </span>
            <span
                class="scrolly-button"
                role="button"
                tabindex="0"
                @click="toggleScrollytelling"
                @keydown="toggleScrollytelling"
            >
                <v-icon>style</v-icon>
            </span>
            <ShareButton
                :story-id="currentStory._id"
                :step-index="currentStepIndex"
                v-on="$listeners"
            />
        </div>
        <div class="d-flex">
            <div class="d-flex justify-content-center align-items-center">
                {{ currentStepIndex + 1 }} / {{ stepLength }}
            </div>
        </div>

        <div
            v-if="showMode==='classic'"
            class="d-flex align-items-center"
        >
            <v-btn
                v-if="currentStepIndex > 0"
                class="mx-2"
                text
                rounded
                @click="$emit('setCurrentStepIndex', currentStepIndex - 1)"
            >
                {{ $t("additional:modules.tools.dataNarrator.button.previous") }}
            </v-btn>

            <v-btn
                v-if="currentStepIndex < stepLength - 1"
                class="mx-2"
                dark
                rounded
                @click="$emit('setCurrentStepIndex', currentStepIndex + 1)"
            >
                {{ $t("additional:modules.tools.dataNarrator.button.next") }}
            </v-btn>
        </div>
    </div>
</template>
