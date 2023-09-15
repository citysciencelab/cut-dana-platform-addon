<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import ToolTemplate from "../../../../src/modules/tools/ToolTemplate.vue";
import StoryCreator from "./storyCreator/StoryCreator.vue";
import StoryPlayer from "./storyPlayer/StoryPlayer.vue";
import * as constants from "../store/constantsDataNarrator";
import actions from "../store/actionsDataNarrator";
import getters from "../store/gettersDataNarrator";
import mutations from "../store/mutationsDataNarrator";
import SnackBar from "./SnackBar.vue";
import DashboardCard from "./DashboardCard.vue";
import {EventEmitter} from "./utils/EventEmitter";

export default {
    name: "DataNarrator",
    components: {
        DashboardCard,
        SnackBar,
        ToolTemplate,
        StoryCreator,
        StoryPlayer
    },
    data () {
        return {
            constants,
            stepIndex: 0
            // modeOptions: null
        };
    },
    computed: {
        ...mapGetters("Tools/DataNarrator", Object.keys(getters)),
        ...mapGetters(["uiStyle"])
    },
    watch: {
        /**
         * Listens to the active property change.
         * @param {Boolean} isActive Value deciding whether the tool gets activated or deactivated.
         * @returns {void}
         */
        active (isActive) {
            if (isActive) {
                // this.setFocusToFirstControl();
            }
        }
    },
    created () {
        this.$on("close", this.close);
        EventEmitter.$on("resetStory", () => {
            this.reset();
        });
    },
    beforeDestroy () {
        // removes event listener
        EventEmitter.$off("resetStory", this.reset());
    },
    /**
     * Put initialize here if mounting occurs after config parsing
     * @returns {void}
     */
    mounted () {
        this.$root.snackB = this.$refs.snackB;
        this.applyTranslationKey(this.name);
        // this.createModeOptions();

        if (this.$store.state.Tools.DataNarrator.backendURL) {
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
            this.stepIndex = parseInt(url.searchParams.get("step"), 10);
            this.loadCurrentStory();
        }
        else {
            this.setMode(constants.storyTellingModes.DASHBOARD);
        }
        this.activateTool();
    },
    methods: {
        ...mapMutations("Tools/DataNarrator", Object.keys(mutations)),
        ...mapActions("Tools/DataNarrator", Object.keys(actions)),

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
            // if (this.storyConf.isNoCreateMode) {
            //     this.modeOptions.filter(element => element.mode !== "play").forEach(element => {
            //         element.visible = false;
            //     });
            // }
        },

        /**
         * The story telling tool options
         * @returns {Object[]} mode options (icon, title and disabled)
         */
        // createModeOptions () {
        //     this.modeOptions = Object.values(this.constants.storyTellingModes).map(
        //         mode => ({
        //             mode,
        //             icon: this.constants.storyTellingModeIcons[mode],
        //             title: this.$t(
        //                 "additional:modules.tools.dataNarrator." + mode
        //             ),
        //             disabled:
        //                 mode === this.constants.storyTellingModes.PLAY &&
        //                 !this.storyConfURL,
        //             visible: true
        //         })
        //     );
        // },

        confirmOnlyWhenCreatingStory (actionCallback) {
            if (this.isCreatingStory()) {
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

        /**
         * Resets the tool to its initial state
         * @returns {void}
         */
        reset () {

            /**
             * Constant that saves all the actions on confirm
             * @returns {void}
             */
            const resetDataNarrator = () => {
                this.resetCreatorContent();
                this.setMode(this.constants.storyTellingModes.DASHBOARD);
                EventEmitter.$emit("resetPlayer");
            };

            this.confirmOnlyWhenCreatingStory(resetDataNarrator);
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
                this.resetModule();

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
            return this.mode === this.constants.storyTellingModes.CREATE &&
                JSON.stringify(
                    this.$store.state.Tools.DataNarrator.storyConf
                ) !== JSON.stringify(this.constants.emptyStoryConf);
        },


        /**
         * Share the story that is selected
         * @param {integer} storyId The ID of the selected story
         * @param {integer} stepIndex The index of the selected step
         * @returns {void}
         */
        shareStory (storyId, stepIndex = 0) {
            const sharedLink = this.backendConfig.url + "s/" + storyId + "/" + stepIndex;

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
        :initial-width-mobile="initialWidthMobile"
    >
        <template #toolBody>
            <v-app
                v-if="active"
                id="tool-dataNarrator"
                :class="mode"
            >
                <DashboardCard
                    v-if="!mode || mode === constants.storyTellingModes.DASHBOARD"
                    @confirm="confirmDialog"
                    @share-story="shareStory"
                    @reset-step-index="stepIndex = 0"
                />

                <StoryCreator
                    v-if="mode === constants.storyTellingModes.CREATE"
                    @reset-tool="reset"
                />

                <StoryPlayer
                    v-if="mode === constants.storyTellingModes.PLAY"
                    ref="player"
                    :step-index="stepIndex"
                    @share-story="shareStory"
                />

                <SnackBar ref="snackB" />
            </v-app>
        </template>
    </ToolTemplate>
</template>

<style lang="scss" scoped>

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
@import "../scss/fixes.scss";
@import "../scss/csl.scss";

.table-tools {
    width: 40px !important;
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
</style>
