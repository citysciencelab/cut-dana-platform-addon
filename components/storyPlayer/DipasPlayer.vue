<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import TableOfContents from "./TableOfContents.vue";
import scrollama from "scrollama";
import "intersection-observer";
import axios from "axios";
import actions from "../../store/actionsDataNarrator";
import getters from "../../store/gettersDataNarrator";
import mutations from "../../store/mutationsDataNarrator";

export default {
    name: "DipasPlayer",
    components: {
        TableOfContents
    },
    model: {
        prop: "currentStepIndex",
        event: "change"
    },
    props: {
        storyConfPath: {
            type: String,
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
            currentIndex: 0,
            loadedContent: null,
            showTableOfContents: false,
            storyProgress: 0,
            rotateRight: 0,
            rotateLeft: 0
        };
    },
    computed: {
        ...mapGetters("Tools/DataNarrator", Object.keys(getters)),
        ...mapGetters(["uiStyle"]),
        cssVars () {
            return {
                "--rotate-right": this.rotateRight + "deg",
                "--rotate-left": this.rotateLeft + "deg"
            };
        }
    },
    created () {
        this.steps.forEach((step) => {
            this.loadStoryContents(step.htmlFile).then(data => {
                this.$set(step, "loadedContent", data);
            }).catch(err => {
                console.error(err);
            });
        });
    },
    mounted () {
        // We need to alter the tool window corresponding to the uiStyle
        let toolWindowClass = "tool-window-vue";

        if (this.uiStyle === "TABLE") {
            toolWindowClass = "table-tool-win-all-vue";
        }
        const toolWindow = document.getElementsByClassName(toolWindowClass)[0],
            heading = toolWindow.getElementsByClassName("win-heading")[0],
            scrollyButton = toolWindow.getElementsByClassName("scrolly-button")[0],
            dataNarratorReset = document.getElementById("tool-dataNarrator-reset"),
            toolBody = document.getElementById("vue-tool-content-body"),
            scroller = scrollama();

        toolWindow.style.setProperty("background-color", "transparent", "important");
        toolWindow.style.boxShadow = "none";
        toolWindow.style.height = "100%";
        heading.style = "display: none;";
        toolBody.style = "height: 100%; background-color: transparent !important; -ms-overflow-style: none; overflow: overlay; max-height: 100%; padding: 0;";
        if (scrollyButton) {
            scrollyButton.style = "display: none;";
        }
        if (dataNarratorReset) {
            dataNarratorReset.style = "display: none;";
        }

        // Setup the instance, pass callback functions
        scroller
            .setup({
                step: ".stepper",
                offset: 0.5
            })
            .onStepEnter((response) => {
                this.currentIndex = response.index;
                this.$emit("change", response.index);

                response.element.classList.add("active");

                const storyProgress = 100 / this.steps.length * (response.index + 1);

                if (storyProgress > 0) {
                    if (storyProgress <= 50) {
                        this.rotateRight = this.percentageToDegrees(storyProgress);
                        this.rotateLeft = 0;
                    }
                    else {
                        this.rotateRight = 180;
                        this.rotateLeft = this.percentageToDegrees(storyProgress - 50);
                    }
                }
            })
            .onStepExit(response => {
                response.element.classList.remove("active");
            });

        document.getElementsByClassName("stepper")[0].scrollIntoView({block: "center"});
    },
    methods: {
        ...mapMutations("Tools/DataNarrator", Object.keys(mutations)),
        ...mapActions("Tools/DataNarrator", Object.keys(actions)),

        /**
         * Updates the step html content
         * @param {Object} htmlFile name of the html file to load
         * @returns {void}
         */
        async loadStoryContents (htmlFile) {
            if (this.storyConf.htmlFolder && htmlFile) {
                const storybasepath = this.storyConfPath.endsWith("/") ? this.storyConfPath : this.storyConfPath + "/",
                    response = await axios.get(storybasepath + this.storyConf.htmlFolder + "/" + htmlFile),
                    data = await response.data;

                return data;
            }
            return null;

        },
        /**
         * Closes the table of contents div
         * @returns {void}
         */
        closeTOC () {
            this.showTableOfContents = false;
        },
        /**
         * Scroll to previous step in the story
         * @returns {void}
         */
        goToPrevStep () {
            document.getElementsByClassName("stepper")[this.currentIndex - 1].scrollIntoView({block: "center"});
            this.currentIndex -= 1;
        },
        /**
         * Scroll to next step in the story
         * @returns {void}
         */
        goToNextStep () {
            document.getElementsByClassName("stepper")[this.currentIndex + 1].scrollIntoView({block: "center"});
            this.currentIndex += 1;
        },
        /**
         * Close the tool
         * @returns {void}
         */
        callClose () {
            this.setActive(false);
        },
        /**
         * Converts a percentage value into degrees
         * @param {Number} percentage Perctentage to be converted to degrees
         * @returns {Number} Progress in degrees
         */
        percentageToDegrees (percentage) {
            return percentage / 100 * 360;
        }
    }
};
</script>

<template>
    <div class="d-flex w-100 justify-content-between">
        <div
            v-if="showTableOfContents"
            class="d-flex table-of-contents"
        >
            <div class="d-flex justify-content-between tob-header">
                <div> {{ $t("additional:modules.tools.dataNarrator.tableOfContents") }} </div>
                <span class="bootstrap-icon">
                    <i
                        class="bi-x"
                        @click="showTableOfContents ^= 1"
                        @keydown="showTableOfContents ^= 1"
                    />
                </span>
            </div>

            <TableOfContents
                :steps="steps"
                @close-toc="closeTOC"
            />
        </div>
        <div class="d-flex w-100 justify-content-between">
            <div
                id="dipasplayer"
            >
                <div
                    v-for="(step, index) in steps"
                    :key="step.title"
                    class="stepper"
                    :class="{firstStep: index === 0, lastStep: index === steps.length - 1}"
                >
                    <img
                        v-if="step.titleImage && step.titleImage.length"
                        alt="step.titleImageAlt"
                        :src="step.titleImage"
                    >

                    <h1 v-if="step.title">
                        {{ step.title }}
                    </h1>

                    <div
                        class="tool-dataNarrator-content"
                    >
                        <div
                            v-html="step.loadedContent"
                        />
                    </div>
                </div>
            </div>
            <div class="d-flex toolbar">
                <div class="buttonrow">
                    <div class="row d-flex mt-100">
                        <div
                            class="progress"
                            :style="cssVars"
                        >
                            <span class="progress-left">
                                <span class="progress-bar" />
                            </span>
                            <span class="progress-right">
                                <span class="progress-bar" />
                            </span>
                            <button
                                class="bootstrap-icon tob-button"
                                :class="{ tobActive: showTableOfContents }"
                                @click="showTableOfContents ^= 1"
                                @keydown="showTableOfContents ^= 1"
                            >
                                <i class="bi-list-ul" />
                            </button>
                        </div>
                    </div>
                    <div class="nav-buttons">
                        <button
                            class="bootstrap-icon"
                            :disabled="currentIndex <= 0"
                            @click="goToPrevStep"
                            @keydown="goToPrevStep"
                        >
                            <i class="bi-arrow-up" />
                        </button>
                        <button
                            class="bootstrap-icon"
                            :disabled="currentIndex >= steps.length - 1"
                            @click="goToNextStep"
                            @keydown="goToNextStep"
                        >
                            <i class="bi-arrow-down" />
                        </button>
                    </div>
                    <button
                        class="bootstrap-icon home-button"
                        @click="callClose"
                    >
                        <i class="bi-house-door-fill" />
                    </button>
                </div>
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

.table-of-contents {
    position: fixed;
    background-color: white;
    border: 1px lightgray;
    height: calc(100vh - 90px);
    width: calc(var(--initialToolWidth));
    flex-direction: column;
    z-index: 1;
    bottom: 90px;

    .tob-header {
        color: white;
        background-color: rgb(3, 3, 95);
        height: 40px;
        width: 100%;
        text-align: left;
        font-size: 1.3rem;
        padding-left: 20px;
        padding-top: 6px;

        .bootstrap-icon {
            font-size: 2rem;
            right: 15px;
        }
    }
}

#dipasplayer {

    width: var(--initialToolWidth);
    @media (max-width: 767px) {
        width: var(--initialToolWidthMobile);
    }

    .stepper {
        min-height: 450px;
        margin: 10px 0;
        background-color: rgb(230, 226, 226) !important;
        box-shadow: 0 4px 8px 0 rgb(0 0 0 / 50%);
        opacity: 0.5;
        position: relative;

        >img {
            width: 100%;
            object-fit: cover;
        }

        h1 {
            padding: 20px 20px 0px 20px;
        }

        &.firstStep{
            margin-top: 30vh;
        }

        &.lastStep{
            margin-bottom: 30vh;
        }

        .tool-dataNarrator-content {
            overflow: auto;
            padding: 10px 20px;

            &::v-deep {

                img {
                    max-width: calc(var(--initialToolWidth) - 50px);
                }

                .image_left {
                    .field--name-field-image {
                        float: left;
                        padding: 5px 10px 5px 0px;
                        width: 45%;
                        justify-content: center;
                        display: flex;
                        height: 100%;

                         img {
                            max-width: 100%;
                            max-height: 100%;
                            height: auto;
                            width: auto;
                        }
                    }
                }

                .image_right {
                    .field--name-field-image {
                        float: right;
                        padding: 5px 0px 5px 10px;
                        width: 45%;
                        justify-content: center;
                        display: flex;
                        height: 100%;

                        img {
                            max-width: 100%;
                            max-height: 100%;
                            height: auto;
                            width: auto;
                        }
                    }
                }
            }
        }

        &.active {
            background-color: white !important;
            opacity: 1;
        }
    }

}

.toolbar {
    position: fixed;
    height: 90px;
    bottom: 0px;
    background-color: white;
    border-top: 3px solid rgb(3, 3, 95);
    flex-direction: row;
    font-size: 1.7rem;
    text-align: center;
    display: flex;
    align-items: center;
    width: calc(var(--initialToolWidth) - 13px);

    .buttonrow {
        position: relative;
        height: 62px;
        bottom: 8px;
        width: 100%;
    }

   .progress {
        width: 47px;
        height: 47px;
        background: none;
        position: relative;
        margin-left: 10px;
        top: 4px;

        &::after {
            content: "";
            width: 100%;
            height: 100%;
            border-radius: 50%;
            border: 4px solid white;
            position: absolute;
            top: 0;
            left: 0;
        }
        >span {
            width: 50%;
            height: 100%;
            overflow: hidden;
            position: absolute;
            top: 0;
            z-index: 1;
        }
        .progress-left {
            left: 0;
            .progress-bar {
                left: 100%;
                border-top-right-radius: 80px;
                border-bottom-right-radius: 80px;
                border-left: 0;
                -webkit-transform-origin: center left;
                transform-origin: center left;
                transform: rotate(var(--rotate-left))
            }
        }
        .progress-bar {
            width: 100%;
            height: 100%;
            background: none;
            border-width: 4px;
            border-style: solid;
            position: absolute;
            top: 0;
            border-color: rgb(3, 3, 95);
        }
        .progress-right {
            right: 0;
            .progress-bar {
                left: -102%;
                border-top-left-radius: 80px;
                border-bottom-left-radius: 80px;
                border-right: 0;
                -webkit-transform-origin: center right;
                transform-origin: center right;
                transform: rotate(var(--rotate-right))
            }
        }

        .tob-button {
            text-align: center;
            border: none;
            z-index: 10;
            font-size: 1.6rem;
            background: transparent;
            left: 50%;
            transform: translateX(-50%);
        }

        .bootstrap-icon {
            ::before {
                color: rgb(3, 3, 95);
                border: 1px solid;
                border-radius: 50px;
                padding: 7px;
                background-color: white;
                cursor: pointer;
            }
        }

        .bootstrap-icon.tobActive {
            ::before {
                background-color: rgb(3, 3, 95);
                color: white;
            }
        }
    }


    .nav-buttons {
        position: absolute;
        left: 33%;
        top: 5px;
        border: none;
        background-color: white;

        :disabled {
            opacity: 0.3;
        }

        button {
            background-color: white;
            border: none;
        }
    }

    .home-button {
        position: absolute;
        right: 8px;
        top: 6px;
        border: none;
        background-color: white;
    }

    .bootstrap-icon {
        ::before {
            color: rgb(3, 3, 95);
            border: 1px solid;
            border-radius: 50px;
            padding: 7px;
            background-color: white;
            cursor: pointer;
        }
    }

}
</style>
