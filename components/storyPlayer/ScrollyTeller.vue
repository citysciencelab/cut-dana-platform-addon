<script>
import "intersection-observer";
import scrollama from "scrollama";

import PlayerContent from "./PlayerContent.vue";
import PlayerHeader from "./PlayerHeader.vue";
import PlayerFooter from "./PlayerFooter.vue";

export default {
    name: "ScrollyTeller",
    components: {
        PlayerHeader,
        PlayerContent,
        PlayerFooter
    },
    props: {
        currentStepIndex: {
            type: Number,
            default: 0
        },
        showMode: {
            type: String,
            default: "scrolly"
        },
        chapters: {
            type: Array,
            default: () => []
        },
        steps: {
            type: Array,
            default: () => []
        }
    },
    data () {
        return {
            toolWindow: null,
            heading: null,
            toolBody: null
        };
    },
    beforeDestroy () {
        this.toolWindow.style.removeProperty("background-color");
        this.toolWindow.style.removeProperty("boxShadow");
        this.toolWindow.style.removeProperty("height");

        this.heading.style.removeProperty("display");

        this.toolBody.style.removeProperty("height");
        this.toolBody.style.removeProperty("background-color");
        this.toolBody.style.removeProperty("-ms-overflow-style");
        this.toolBody.style.removeProperty("overflow");
        this.toolBody.style.removeProperty("max-height");
        this.toolBody.style.removeProperty("padding");
    },
    mounted () {
        // We need to alter the tool window corresponding to the uiStyle
        this.toolWindow = document.querySelectorAll(".tool-window-vue, .table-tool-win-all-vue")[0];
        this.heading = this.toolWindow.getElementsByClassName("win-heading")[0];
        this.toolBody = document.getElementById("vue-tool-content-body");

        const scroller = scrollama();

        this.toolWindow.style.setProperty("background-color", "transparent", "important");
        this.toolWindow.style.setProperty("box-shadow", "none", "important");
        this.toolWindow.style.setProperty("height", "100%");

        this.heading.style.setProperty("display", "none");

        this.toolBody.style.setProperty("height", "100%");
        this.toolBody.style.setProperty("background-color", "transparent", "important");
        this.toolBody.style.setProperty("-ms-overflow-style", "none");
        this.toolBody.style.setProperty("overflow", "overlay");
        this.toolBody.style.setProperty("max-height", "100%");
        this.toolBody.style.setProperty("padding", "0");

        // toolBody.style = "height: 100%; background-color: transparent !important; -ms-overflow-style: none; overflow: overlay; max-height: 100%; padding: 0;";

        // Setup the instance, pass callback functions
        scroller
            .setup({
                step: ".stepper"
            })
            .onStepEnter((response) => {
                this.$emit("setCurrentStepIndex", response.index);
            });


        document.getElementsByClassName("stepper")[this.currentStepIndex]
            .scrollIntoView({block: "center", behavior: "smooth"});
    },
    methods: {
        /**
         * The step chapter of the story.
         * @param {Object} step current step
         * @returns {Object} current chapter
         */
        chapterFor (step) {
            return (
                this.chapters.find(
                    ({chapterNumber}) => step?.associatedChapter === chapterNumber
                )
            );
        }
    }
};
</script>

<template lang="html">
    <div
        id="scrollyteller"
    >
        <div
            v-for="(step, index) in steps"
            :key="index + step.title"
            class="stepper"
            :class="{ active: index === currentStepIndex}"
        >
            <PlayerHeader
                :chapter="chapterFor(step)"
                @click="$emit('setCurrentStepIndex', null)"
                v-on="$listeners"
            />
            <PlayerContent
                :step="step"
                class="tool-dataNarrator-content"
            />
            <PlayerFooter
                :current-step-index="currentStepIndex"
                :show-mode="showMode"
                v-on="$listeners"
            />
        </div>
    </div>
</template>

<style lang="scss">
#vue-tool-content-body::-webkit-scrollbar {
    width: 0 !important;
    background: transparent; /* make scrollbar transparent */
}
</style>

<style lang="scss" scoped>

@import "../../../../../css/mixins.scss";

#scrollyteller {

    width: var(--initialToolWidth);
    @media (max-width: 767px) {
        width: var(--initialToolWidthMobile);
    }

    .stepper {
        min-height: 200px;
        margin: 100px 0;
        background-color: transparent !important;
        padding: 20px;
        border-radius: 12px;
        visibility: hidden;
        align-content: space-between;
        display: grid;
    }

    .stepper.active {
        background-color: white !important;
        box-shadow: 0 4px 8px 0 rgb(0 0 0 / 50%);
        visibility: visible;
    }

    #story-menu {
        padding-right: 25px;
    }
}
</style>
