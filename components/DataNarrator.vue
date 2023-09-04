<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import ToolTemplate from "../../../../src/modules/tools/ToolTemplate.vue";
import StoryCreator from "./storyCreator/StoryCreator.vue";
import StoryPlayer from "./storyPlayer/StoryPlayer.vue";
import fetchDataFromUrl from "../utils/getStoryFromUrl";
import * as constants from "../store/constantsDataNarrator";
import actions from "../store/actionsDataNarrator";
import getters from "../store/gettersDataNarrator";
import mutations from "../store/mutationsDataNarrator";
import SnackBar from "./snackBar/SnackBar.vue";
import CSLStorySelector from "./cslStorySelector/CSLStorySelector.vue";
import StaticStorySelector from "./cslStorySelector/StaticStorySelector.vue";
import {EventEmitter} from "./utils/EventEmitter";

export default {
    name: "DataNarrator",
    components: {
        StaticStorySelector,
        CSLStorySelector,
        SnackBar,
        ToolTemplate,
        StoryCreator,
        StoryPlayer
    },
    data () {
        return {
            constants,
            fetchDataFromUrl,
            storyConfURL: Config.storyConf ? Config.storyConf : this.getConfPathfromUrl(),
            storyList: {},
            storyId: null,
            modeOptions: null
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
    async mounted () {
        this.$root.snackB = this.$refs.snackB;
        this.applyTranslationKey(this.name);
        this.createModeOptions();

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

        if (url.searchParams.get("overview") !== null) {
            this.setMode(constants.storyTellingModes.STATIC);
        }
        else if (url.searchParams.get("dashboard") !== null) {
            this.setMode(constants.storyTellingModes.DASHBOARD);
        }
        else {
            await this.loadStoryFromFile();
            this.setMode(this.$store.state.Tools.DataNarrator.autoplay ? constants.storyTellingModes.PLAY : "");
        }
        this.activateTool();
    },
    methods: {
        ...mapMutations("Tools/DataNarrator", Object.keys(mutations)),
        ...mapActions("Tools/DataNarrator", Object.keys(actions)),

        /**
         * Handles the URL loading of the story from ath
         * @returns {void}
         */
        async loadStoryFromFile () {
            if (this.storyConfURL) {
                await fetchDataFromUrl(this.storyConfURL).then(loadedStoryConf => {
                    this.setStoryConf(loadedStoryConf);
                });
            }
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
            if (this.storyConf.isNoCreateMode) {
                this.modeOptions.filter(element => element.mode !== "play").forEach(element => {
                    element.visible = false;
                });
            }

            // Temporary for static mode
            this.modeOptions.find(element => element.mode === "static").visible = false;
        },

        /**
         * The story telling tool options
         * @returns {Object[]} mode options (icon, title and disabled)
         */
        createModeOptions () {
            this.modeOptions = Object.values(this.constants.storyTellingModes).map(
                mode => ({
                    mode,
                    icon: this.constants.storyTellingModeIcons[mode],
                    title: this.$t(
                        "additional:modules.tools.dataNarrator." + mode
                    ),
                    disabled:
                        mode === this.constants.storyTellingModes.PLAY &&
                        !this.storyConfURL,
                    visible: true
                })
            );
        },
        /**
         * Handles story telling mode changes.
         * @param {Number} index the index of the new story telling mode
         * @returns {void}
         */
        onChangeStoryTellingMode (index) {
            this.setMode(Object.values(this.constants.storyTellingModes)[index]);
        },


        /**
         * Remote control for the reset function
         * @returns {void}
         */
        resetTool () {
            this.reset();
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
                this.loadStoryFromFile();
                this.setMode(null);
                EventEmitter.$emit("resetPlayer");
            };

            if (this.isCreatingStory()) {
                const confirmActionSettings = {
                    actionConfirmedCallback: resetDataNarrator,
                    confirmCaption: this.$t(
                        "additional:modules.tools.dataNarrator.confirm.closeStoryCreation.confirmButton"
                    ),
                    denyCaption: this.$t(
                        "additional:modules.tools.dataNarrator.confirm.closeStoryCreation.denyButton"
                    ),
                    textContent: this.$t(
                        "additional:modules.tools.dataNarrator.confirm.closeStoryCreation.description"
                    ),
                    headline: this.$t(
                        "additional:modules.tools.dataNarrator.confirm.closeStoryCreation.title"
                    ),
                    forceClickToClose: true
                };

                this.$store.dispatch(
                    "ConfirmAction/addSingleAction",
                    confirmActionSettings
                );
            }
            else {
                resetDataNarrator();
            }
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

            if (this.isCreatingStory()) {
                const confirmActionSettings = {
                    actionConfirmedCallback: closeDataNarrator,
                    confirmCaption: this.$t(
                        "additional:modules.tools.dataNarrator.confirm.closeStoryCreation.confirmButton"
                    ),
                    denyCaption: this.$t(
                        "additional:modules.tools.dataNarrator.confirm.closeStoryCreation.denyButton"
                    ),
                    textContent: this.$t(
                        "additional:modules.tools.dataNarrator.confirm.closeStoryCreation.description"
                    ),
                    headline: this.$t(
                        "additional:modules.tools.dataNarrator.confirm.closeStoryCreation.title"
                    ),
                    forceClickToClose: true
                };

                this.$store.dispatch(
                    "ConfirmAction/addSingleAction",
                    confirmActionSettings
                );
            }
            else {
                closeDataNarrator();
            }
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
         * Gets the URL of a story.json from the URL parameter 'story'
         * @returns {String} the URL of the story.json
         */
        getConfPathfromUrl () {
            const queryString = window.location.search,
                urlParams = new URLSearchParams(queryString);

            return urlParams.get("story");
        },

        /**
         * Sets the storyId from the child component
         * @param {String} storyId the storyId
         * @returns {void}
         */
        setStoryIdFromChild (storyId) {
            this.storyId = storyId;
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
                <!--                <span-->
                <!--                    v-if="mode && storyConf.storyInterval"-->
                <!--                    id="tool-dataNarrator-clock"-->
                <!--                >-->
                <!--                    <span-->
                <!--                        @click="$refs.player.toggleInterval()"-->
                <!--                        @keydown="$refs.player.toggleInterval()"-->
                <!--                    >-->
                <!--                        <v-tooltip left>-->
                <!--                            <template #activator="{ on, attrs }">-->
                <!--                                <v-icon-->
                <!--                                    v-bind="attrs"-->
                <!--                                    v-on="on"-->
                <!--                                >timer-->
                <!--                                </v-icon>-->
                <!--                            </template>-->
                <!--                            <span>-->
                <!--                                {{-->
                <!--                                    $t("additional:modules.tools.dataNarrator.label.autoPLay")-->
                <!--                                }}-->
                <!--                                &lt;!&ndash;                                &nbsp;-->
                <!--                                                                {{-->
                <!--                                                                    $refs.player.getInter() !== null ? $t("additional:modules.tools.dataNarrator.label.off") :-->
                <!--                                                                    $t("additional:modules.tools.dataNarrator.label.on")-->
                <!--                                                                }}&ndash;&gt;-->
                <!--                            </span>-->
                <!--                        </v-tooltip>-->
                <!--                    </span>-->
                <!--                </span>-->
                <!--                <span-->
                <!--                    v-if="mode && mode !== constants.storyTellingModes.DASHBOARD"-->
                <!--                    id="tool-dataNarrator-reset"-->
                <!--                >-->
                <!--                    <span-->
                <!--                        @click="reset"-->
                <!--                        @keydown="reset"-->
                <!--                    >-->
                <!--                        <v-tooltip left>-->
                <!--                            <template #activator="{ on, attrs }">-->
                <!--                                <v-icon-->
                <!--                                    v-bind="attrs"-->
                <!--                                    v-on="on"-->
                <!--                                >keyboard_backspace-->
                <!--                                </v-icon>-->
                <!--                            </template>-->
                <!--                            <span>reset</span>-->
                <!--                        </v-tooltip>-->
                <!--                    </span>-->
                <!--                </span>-->
                <v-item-group
                    v-if="!mode"
                    id="tool-dataNarrator-modeSelection"
                    :value="mode"
                    @change="onChangeStoryTellingMode"
                >
                    <v-flex
                        v-for="option in modeOptions"
                        :key="option.title"
                    >
                        <v-item v-slot="{ toggle }">
                            <v-card
                                v-if="option.visible"
                                :disabled="option.disabled"
                                class="my-4"
                            >
                                <v-img
                                    v-if="option.mode === 'play'"
                                    :src="storyConf.coverImagePath"
                                    height="200px"
                                />
                                <v-card-title v-if="option.mode === 'play'">
                                    {{ storyConf.title }}
                                </v-card-title>
                                <v-card-subtitle v-if="option.mode === 'play'">
                                    {{ storyConf.description }}
                                </v-card-subtitle>
                                <v-card-actions>
                                    <v-btn
                                        v-if="option.mode === 'play'"
                                        text
                                        @click="toggle"
                                    >
                                        {{ option.title }}
                                    </v-btn>
                                    <v-col
                                        v-if="option.mode === 'create'"
                                        class="text-center"
                                    >
                                        <p><i>- Experimentell -</i></p>
                                        <v-btn
                                            outlined
                                            small
                                            color=""
                                            @click="toggle"
                                        >
                                            <v-icon>{{ option.icon }}</v-icon>
                                            Eigene {{ option.title }}
                                        </v-btn>
                                    </v-col>
                                    <v-col
                                        v-if="option.mode === 'dashboard'"
                                        class="text-center"
                                    >
                                        <p><i>- Experimentell -</i></p>
                                        <v-btn
                                            outlined
                                            small
                                            color=""
                                            @click="toggle"
                                        >
                                            <v-icon>{{ option.icon }}</v-icon>
                                            {{ option.title }}
                                        </v-btn>
                                    </v-col>
                                </v-card-actions>
                            </v-card>
                        </v-item>
                        <v-spacer />
                    </v-flex>
                </v-item-group>

                <CSLStorySelector
                    v-if="mode === constants.storyTellingModes.DASHBOARD"
                    :story-id="storyId"
                    @updateStoryId="setStoryIdFromChild"
                />

                <StaticStorySelector
                    v-if="mode === constants.storyTellingModes.STATIC"
                />

                <StoryCreator
                    v-if="mode === constants.storyTellingModes.CREATE"
                    @reset-tool="resetTool"
                />

                <StoryPlayer
                    v-if="
                        mode === constants.storyTellingModes.PLAY &&
                            storyConfURL
                    "
                    ref="player"
                    :story-conf-path="storyConfURL"
                    :story-id="storyId"
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
