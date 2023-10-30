<script>
import "intersection-observer";
import scrollama from "scrollama";
import {mapActions, mapGetters, mapMutations} from "vuex";
import actions from "../../store/actionsDataNarrator";
import getters from "../../store/gettersDataNarrator";
import mutations from "../../store/mutationsDataNarrator";
import StoryMenu from "./StoryMenu.vue";


export default {
    name: "ScrollyTeller",
    components: {
        StoryMenu
    },
    model: {},
    props: {
        currentStepIndex: {
            type: Number,
            default: 0
        }
    },
    data () {
        return {
            currentIndex: 0,
            // loadedContent: null,
            steps: null,
            toolWindow: null
        };
    },
    computed: {
        ...mapGetters("Tools/DataNarrator", Object.keys(getters)),
        ...mapGetters(["uiStyle"])
    },
    watch: {
        currentStepIndex: function (newVal) {
            document.getElementsByClassName("stepper")[newVal].scrollIntoView({block: "center", behavior: "smooth"});
        }
    },
    created () {
        this.steps = this.currentStory.steps;
    },
    beforeDestroy () {
        this.currentIndex = null;
        this.toolWindow.style.removeProperty("background-color");
        this.toolWindow.style.removeProperty("boxShadow");
        this.toolWindow.style.removeProperty("height");

        const heading = this.toolWindow.getElementsByClassName("win-heading")[0],
            toolBody = document.getElementById("vue-tool-content-body");

        heading.style.removeProperty("display");

        toolBody.style.removeProperty("height");
        toolBody.style.removeProperty("background-color");
        toolBody.style.removeProperty("-ms-overflow-style");
        toolBody.style.removeProperty("overflow");
        toolBody.style.removeProperty("max-height");
        toolBody.style.removeProperty("padding");
    },
    mounted () {
        // We need to alter the tool window corresponding to the uiStyle
        let toolWindowClass = "tool-window-vue";

        if (this.uiStyle === "TABLE") {
            toolWindowClass = "table-tool-win-all-vue";
        }

        const toolWindow = document.getElementsByClassName(toolWindowClass)[0],
            heading = toolWindow.getElementsByClassName("win-heading")[0],
            toolBody = document.getElementById("vue-tool-content-body"),
            scroller = scrollama();

        this.toolWindow = toolWindow;

        toolWindow.style.setProperty("background-color", "transparent", "important");
        toolWindow.style.setProperty("box-shadow", "none", "important");
        toolWindow.style.setProperty("height", "100%");
        // toolWindow.style.boxShadow = "none";
        // toolWindow.style.height = "100%";
        // heading.style = "display: none;";
        heading.style.setProperty("display", "none");

        toolBody.style.setProperty("height", "100%");
        toolBody.style.setProperty("background-color", "transparent", "important");
        toolBody.style.setProperty("-ms-overflow-style", "none");
        toolBody.style.setProperty("overflow", "overlay");
        toolBody.style.setProperty("max-height", "100%");
        toolBody.style.setProperty("padding", "0");

        // toolBody.style = "height: 100%; background-color: transparent !important; -ms-overflow-style: none; overflow: overlay; max-height: 100%; padding: 0;";

        // Setup the instance, pass callback functions
        scroller
            .setup({
                step: ".stepper"
            })
            .onStepEnter((response) => {
                this.currentIndex = response.index;
                this.$emit("change", response.index);
            })
            .onStepExit(() => {
                // this.currentIndex = null;
            });

        document.getElementsByClassName("stepper")[0].scrollIntoView({block: "center"});
    },
    methods: {
        ...mapMutations("Tools/DataNarrator", Object.keys(mutations)),
        ...mapActions("Tools/DataNarrator", Object.keys(actions))
    }
};
</script>

<template lang="html">
    <div
        id="scrollyteller"
    >
        <div
            v-for="(step, index) in steps"
            :key="step.title"
            class="stepper"
            :class="{ active: index === currentIndex}"
        >
            <StoryMenu
                :initial-auto-play="currentStory.storyInterval !== null"
                :current-step-index="currentStepIndex"
                v-on="$listeners"
            />
            <h1 v-if="step.title">
                {{ step.title }}
            </h1>

            <div
                class="tool-dataNarrator-content"
            >
                <div
                    v-if="index === currentIndex"
                    v-html="step.html"
                />
            </div>
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
        min-height: 450px;
        // margin: 400px 0;
        background-color: transparent !important;
        padding: 20px;
        border-radius: 12px;
    }

    .stepper.active {
        background-color: white !important;
        box-shadow: 0 4px 8px 0 rgb(0 0 0 / 50%);
    }

    #story-menu {
        padding-right: 25px;
    }
}
</style>
