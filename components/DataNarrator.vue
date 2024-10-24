<script>
import {mapActions, mapGetters, mapMutations} from "vuex";

import ToolTemplate from "../../../../src/modules/tools/ToolTemplate.vue";
// login module
import OIDC from "../../../../src/modules/tools/login/utils/utilsOIDC";

import * as constants from "../store/constantsDataNarrator";
import actions from "../store/actionsDataNarrator";
import getters from "../store/gettersDataNarrator";
import mutations from "../store/mutationsDataNarrator";

import RenderUtilities from "../mixins/RenderUtilities";
import LayerUtilities from "../mixins/LayerUtilities";

import DashboardPanel from "./Dashboard/DashboardPanel.vue";
import SnackBar from "./shared/SnackBar.vue";
import StoryCreator from "./storyCreator/StoryCreator.vue";
import StoryPlayer from "./storyPlayer/StoryPlayer.vue";
import ThreeDUtilities from "../mixins/ThreeDUtilities";

export default {
    name: "DataNarrator",
    components: {
        DashboardPanel,
        SnackBar,
        ToolTemplate,
        StoryCreator,
        StoryPlayer
    },
    mixins: [RenderUtilities, LayerUtilities, ThreeDUtilities],
    data () {
        return {
            constants,
            stepIndex: 0,
            isAdmin: false,
            uid: null
        };
    },
    computed: {
        ...mapGetters("Tools/DataNarrator", Object.keys(getters)),
        ...mapGetters("Tools/Login", ["accessToken"]),
        ...mapGetters(["uiStyle"])
    },
    watch: {
        "accessToken": {
            handler (accessToken) {
                if (accessToken) {
                    const payload = OIDC.parseJwt(accessToken);

                    this.uid = payload.sub;
                    if (payload.realm_access.roles.includes("admin")) {
                        this.isAdmin = true;
                    }
                }
                else {
                    this.isAdmin = false;
                    this.uid = null;
                }
            },
            immediate: true
        },
        "mode": {
            handler () {
                this.resizeHandler();
            }
        },
        "active": {
            handler (active) {
                if (active) {
                    setTimeout(() => {
                        this.resizeHandler();
                    }, 50);
                }
            }
        }

    },
    created () {
        this.$on("close", this.close);
        window.addEventListener("resize", this.resizeHandler);
        this.resizeHandler();
    },
    beforeDestroy () {
        // removes event listener
        window.removeEventListener("resize", this.resizeHandler);
    },
    /**
     * Put initialize here if mounting occurs after config parsing
     * @returns {void}
     */
    mounted () {
        this.$root.snackB = this.$refs.snackB;
        this.applyTranslationKey(this.name);
        // this.createModeOptions();

        // Apply layout hacks to the tool window
        this.toolWindow = document.querySelectorAll(".tool-window-vue, .table-tool-win-all-vue")[0];
        this.toolWindow.style.borderRadius = "15px";
        document.getElementById("vue-tool-content-body").style.borderRadius = "15px";
        document.getElementById("vue-tool-content-body").style.padding = "15px";
        this.heading = this.toolWindow.getElementsByClassName("win-heading")[0];
        this.heading.style.border = "none";
        this.heading.style.height = "0";
        this.heading.innerHTML = "";
        // Hide the main menu
        document.getElementById("main-nav").style.display = "none";

        if (this.$store.state.Tools.DataNarrator.backendURL) {
            console.log(this.$store.state.Tools.DataNarrator.backendURL);
            this.setBackendConfig({url: this.$store.state.Tools.DataNarrator.backendURL});
        }

        const url = new URL(window.location.href);

        if (url.searchParams.get("role") !== null) {
            const role = url.searchParams.get("role").toLowerCase();

            if (role === "admin") {
                this.setUserRole(constants.dataNarratorRoles.ADMIN);
            }
        }

        if (url.searchParams.get("story") !== null) {
            this.setCurrentStoryId(url.searchParams.get("story"));
            if (url.searchParams.get("step") === "s") {
                this.loadCurrentStory({mode: constants.storyTellingModes.DASHBOARD});
            }
            else {
                this.stepIndex = parseInt(url.searchParams.get("step"), 10);
                this.loadCurrentStory({mode: constants.storyTellingModes.PLAY});
            }
        }
        else {
            this.setMode(constants.storyTellingModes.DASHBOARD);
        }
        this.rebuildLayers(this.allLayerOptions.backgroundLayers);
        this.disableBackgroundLayers();
        this.setDefaultBackgroundLayer();
        this.activateTool();
    },
    methods: {
        ...mapMutations("Tools/DataNarrator", Object.keys(mutations)),
        ...mapActions("Tools/DataNarrator", Object.keys(actions)),

        resizeHandler () {
            const doResize = this.mode === constants.storyTellingModes.DASHBOARD && this.currentStory === null;

            // mixin
            this.resizeTool(doResize, this.initialWidth);
        },

        /**
         * Active tool workaround
         * @returns {void}
         */
        activateTool () {
            this.setActive(true);

            // Workround to trigger tool visibility. The above code "this.setActive(true);" is not triggering the ToolTemplate.vue watcher for active which would trigger the code below

            if (this.uiStyle === "TABLE") {
                const toolWindow = document.getElementsByClassName("table-tool-win-all-vue")[0];

                if (toolWindow) {
                    toolWindow.style.display = "block";
                }
            }
        },

        confirmOnlyWhenCreatingStory (actionCallback, skipConfirm = false) {
            if (!skipConfirm && this.isCreatingStory()) {
                this.confirmDialog("closeStoryCreation", actionCallback);
            }
            else {
                actionCallback();
            }
        },

        /**
         * Confirms the action with a dialog when the user is creating a story
         * @param {string} tPrefix translation prefix
         * @param {function} actionCallback function that needs to be confirmed
         * @returns {void}
         */
        confirmDialog (tPrefix, actionCallback) {
            const confirmActionSettings = {
                actionConfirmedCallback: actionCallback,
                confirmCaption: this.$t(
                    `additional:modules.tools.dataNarrator.confirm.${tPrefix}.confirmButton`
                ),
                denyCaption: this.$t(
                    `additional:modules.tools.dataNarrator.confirm.${tPrefix}.denyButton`
                ),
                textContent: this.$t(
                    `additional:modules.tools.dataNarrator.confirm.${tPrefix}.description`
                ),
                headline: this.$t(
                    `additional:modules.tools.dataNarrator.confirm.${tPrefix}.title`
                ),
                forceClickToClose: true
            };

            this.$store.dispatch(
                "ConfirmAction/addSingleAction",
                confirmActionSettings
            );
        },

        resetDataNarrator () {
            if (this.currentStory) {
                this.disableStoryLayers(this.currentStory);
                for (const step of this.currentStory.steps) {
                    for (const layer of step.wmsLayers) {
                        this.hideWmsLayer(layer.url);
                    }
                }
            }
            this.disable3DLayers();
            this.disable3D();
            this.resetModule();

            this.setMode(constants.storyTellingModes.DASHBOARD);
            this.setDefaultBackgroundLayer();
        },


        /**
         * Resets the tool to its initial state
         * @param {boolean} skipConfirm true if the user shouldn't be asked to confirm the reset
         * @returns {void}
         */
        reset (skipConfirm = false) {
            this.confirmOnlyWhenCreatingStory(this.resetDataNarrator, skipConfirm);
        },

        /**
         * Closes this tool window by setting active to false
         * @returns {void}
         */
        close () {

            /**
             * Constant that saves all the actions on confirm
             * @returns {void}
             */
            const closeDataNarrator = () => {
                this.setActive(false);
                this.resetDataNarrator();

                const model = Radio.request(
                    "ModelList",
                    "getModelByAttributes",
                    {
                        id: this.$store.state.Tools.DataNarrator.id
                    }
                );

                if (model) {
                    model.set("isActive", false);
                }
            };

            this.confirmOnlyWhenCreatingStory(closeDataNarrator);
        },

        /**
         * Checks if there is a story currently being created
         * @returns {boolean} true if there is a story currently being created and no empty
         */
        isCreatingStory () {
            // Confirm tool closing if user is creating a story
            return this.mode === this.constants.storyTellingModes.CREATE && this.currentStory;
        },


        /**
         * Share the story that is selected
         * @param {integer} storyId The ID of the selected story
         * @param {integer} stepIndex The index of the selected step
         * @returns {void}
         */
        shareStory (storyId, stepIndex = "s") {
            const sharedLink = this.backendConfig.url + "/s/" + storyId + "/" + stepIndex;

            navigator.clipboard.writeText(sharedLink);

            this.$root.snackB.show({
                message: this.$t(
                    "additional:modules.tools.dataNarrator.success.storyShared"
                )
            });
        }
    }
};
</script>

<template>
    <ToolTemplate
        :title="$t(name)"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivate-gfi="deactivateGFI"
        :initial-width="initialWidth"
    >
        <template #toolBody>
            <v-app
                v-if="active"
                id="tool-dataNarrator"
                :class="mode"
            >
                <StoryPlayer
                    v-if="mode === constants.storyTellingModes.PLAY"
                    ref="player"
                    :step-index="stepIndex"
                    @share-story="shareStory"
                    @reset="reset"
                />

                <StoryCreator
                    v-else-if="mode === constants.storyTellingModes.CREATE"
                    :uid="uid"
                    @confirm="confirmDialog"
                    @reset-tool="reset"
                />

                <DashboardPanel
                    v-else
                    :is-admin="isAdmin"
                    :uid="uid"
                    @confirm="confirmDialog"
                    @share-story="shareStory"
                    @reset-step-index="stepIndex = 0"
                    @resizeHandler="resizeHandler"
                />

                <SnackBar ref="snackB" />
            </v-app>
        </template>
    </ToolTemplate>
</template>

<style lang="scss" scoped>
#tool-dataNarrator::v-deep {
    .title-holder, .chapter-title-holder, .step-title-holder {
        .v-text-field .v-label--active {
            display: none;
        }
    }

    .form-group {
        width: 100%;
    }

    .small-fieldset {
        .v-input__slot fieldset {
            height: 40px;
        }
        .v-label {
            top: 5px;
        }
        .v-label--active {
            top: 10px;
        }
    }

    .v-input__slot {
        border-radius: 5px !important;
    }

    .v-textarea {
        .v-input__slot {
            border: 1px solid #707070;
            box-shadow: none;
        }
    }
}

#tool-dataNarrator {
    background: none;

    &.play {
        max-height: calc(72vh - 40px);
    }

    &::v-deep {
        .v-application--wrap {
            min-height: 0;

            > div {
                height: 100%;
            }
        }
    }
}

#tool-dataNarrator-modeSelection {
    .v-icon {
        color: currentColor;
        margin-right: 12px;
    }
}
</style>

<style lang="scss">
@import "../css/fixes.scss";
@import "../css/csl.scss";


.v-label, .vue-label-style, .v-expansion-panel-header, .ql-editor.ql-blank::before {
    font-size: 12px !important;
    color: #403d3d !important;
}

.v-text-field .v-label {
    padding-left: 5px;
}

.vue-label-style.label-subheader {
    margin-bottom: 10px;
}

.table-tools {
    width: 40px !important;
}

#login-component {
    left: 50% !important;
}

// Will put dashboard window into the center of the screen
.tool-window-vue {
    left: var(--currentPadding) !important;
}

#table-nav-main {
    flex: 0 0 auto;
    max-width: unset;
    padding: 5px;

    background-color: rgba(0, 0, 0, 0);
    background-color: white;
}

#table-tools, #table-category-list {
    background-color: white;
}

#table-tools-menu, #table-nav-cat-panel {
    background-color: white;
}

.icon-burgermenu_alt.collapsed::before {
    color: #73c1a9;
}

.table-nav-layers-panel {
    z-index: 10;
    background-color: white;
    box-shadow: 0 4px 8px 0 rgba(115, 193, 169, 0.0);
}

#table-nav-layers-panel-toggler {
    background-color: #f5f5f5 !important;

    .icon-cross1:before {
        color: rgba(0, 0, 0, .87) !important;
    }
}

.pill-button {
    min-width: 23px !important;
    width: 23px !important;
    margin-right: 10px;
    .v-btn__content {
        border: 2px solid #707070;
        border-radius: 10px;
        width: 10px !important;
        height: 35px;
        padding-top: 1px;
        font-size: 15px;
        .v-icon {
            height: 18px !important;
            font-size: 18px !important;
            font-weight: bold;
        }
    }
}

.pill-button.horizontal {
    min-height:  23px !important;
    height: 23px !important;
    min-width: 35px !important;
    border-radius: 10px;
    padding-left: 1px;
    .v-btn__content {
        height: 22px !important;
        width: 35px !important;
    }
}

.pill-button.horizontal.add-step {
    .v-btn__content {
        border: 2px solid #893d05;
        .v-icon {
            color: #893d05;
        }
    }
}

.pill-button.horizontal.chapter-indicator {
    .v-btn__content {
        border: none;
        color: white;
        padding-bottom: 2px;
        font-weight: bolder;
        cursor: default;
    }
}

.pill-button.step-indicator {
    .v-btn__content {
        border: 2px solid;
        background-color: white;
        padding-bottom: 2px;
        font-weight: bolder;
        cursor: default;
    }
}

.pill-button.step-indicator-big {
     width: 26px !important;
    .v-btn__content {
        height: 45px;
        border-radius: 20px;
    }
}

</style>
