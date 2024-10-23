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
        ...mapGetters("Modules/DataNarrator", Object.keys(getters)),
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
    <v-row id="tool-dataNarrator-navigation">
        <!--
        <v-col
            cols="1"
            class="d-flex align-self-center"
        >
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
        </v-col>
        -->
        <v-col
            class="d-flex align-self-center"
            cols="2"
        >
            {{ currentStepIndex + 1 }} / {{ stepLength }}
        </v-col>
        <v-col
            class="d-flex align-self-center justify-content-end"
            cols="6"
            offset="4"
        >
            <div
                v-if="showMode==='classic'"
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
        </v-col>
    </v-row>
</template>
