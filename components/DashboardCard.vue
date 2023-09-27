<script>
import * as constants from "../store/constantsDataNarrator";
import axios from "axios";
import {mapActions, mapGetters, mapMutations} from "vuex";
import mutations from "../store/mutationsDataNarrator";
import actions from "../store/actionsDataNarrator";
import getters from "../store/gettersDataNarrator";
import ImportStory from "./storyCreator/ImportStory.vue";

export default {
    name: "DashboardCard",
    components: {
        ImportStory
    },
    data () {
        return {
            constants,
            storyList: {},
            importForm: false
        };
    },
    computed: {
        ...mapGetters("Tools/DataNarrator", Object.keys(getters))
    },
    watch: {
        "backendConfig": { // Can be unavailable when the component is mounted
            handler (conf) {
                if (conf.url) { // check if it is available
                    this.refreshStoryList();
                }
            },
            immediate: true // make this watch function is called when component created
        }
    },
    mounted () {
        this.$emit("reset-step-index");

        // We need to alter the tool window corresponding to the uiStyle
        let toolWindowClass = "tool-window-vue";

        if (this.uiStyle === "TABLE") {
            toolWindowClass = "table-tool-win-all-vue";
        }
        const toolWindow = document.getElementsByClassName(toolWindowClass)[0],
            heading = toolWindow.getElementsByClassName("title")[0];

        heading.innerHTML = this.$t("additional:modules.tools.dataNarrator.dashboardView.title");
        toolWindow.style.setProperty("--initialToolWidth;", "900px", "important");
    },
    methods: {
        ...mapMutations("Tools/DataNarrator", Object.keys(mutations)),
        ...mapActions("Tools/DataNarrator", Object.keys(actions)),

        /**
         * Refreshes the list of stories
         * @returns {void}
         */
        refreshStoryList () {
            axios
                .get(this.backendConfig.url + "/stories")
                .then((response) => {
                    this.storyList = response.data;
                });
        },

        /**
         * Creates a new story, switch mode
         * @returns {void}
         */
        createStory () {
            this.setCurrentStory({chapters: [], steps: []});
            this.setCurrentStoryId(null);
            this.setMode(constants.storyTellingModes.CREATE);
        },

        /**
         * Changes the story that is selected and fetches the corresponding Story json from the API
         * @param {integer} storyId The ID of the selected story
         * @returns {void}
         */
        onStorySelectedById (storyId) {
            this.setCurrentStoryId(storyId);
            this.loadCurrentStory({mode: constants.storyTellingModes.PLAY});
        },

        /**
         * Edit the story that is selected
         * @param {integer} storyId The ID of the selected story
         * @returns {void}
         */
        onStoryEditById (storyId) {
            this.setCurrentStoryId(storyId);
            this.loadCurrentStory({mode: constants.storyTellingModes.CREATE});
        },

        /**
         * Share the story that is selected
         * @param {integer} storyId The ID of the selected story
         * @returns {void}
         */
        onShareById (storyId) {
            this.$emit("share-story", storyId, 0);
        },


        /**
         * Delete the story that is selected
         * @param {integer} storyId The ID of the selected story
         * @returns {void}
         */
        onStoryDeleteById (storyId) {

            /**
             * Constant that saves delete cofirm action
             * @returns {void}
             */
            const deleteStory = () => {
                this.storyConfURL = this.backendConfig.url + "/stories/" + storyId;

                axios
                    .delete(this.storyConfURL)
                    .then(() => {
                        this.$root.snackB.show({
                            message: this.$t(
                                "additional:modules.tools.dataNarrator.success.storyDeleted"
                            )
                        });
                        this.refreshStoryList();
                    }).catch(() => {
                        this.$root.snackB.show({
                            message: this.$t(
                                "additional:modules.tools.dataNarrator.error.storyDeleted"
                            ), color: "red"
                        });
                    });
            };

            this.$emit("confirm", "deleteStory", deleteStory);
        },

        closeImportForm () {
            this.importForm = false;
        }
    }
};
</script>

<template>
    <div>
        <v-row id="title-row">
            <v-col
                id="title-element"
                class="text-h5"
                cols="8"
            >
                {{
                    $t("additional:modules.tools.dataNarrator.dashboardView.title")
                }}
            </v-col>
            <v-col cols="4">
                <v-tooltip left>
                    <template #activator="{ on }">
                        <v-icon
                            id="create-button"
                            class="mr-1"
                            @click="createStory()"
                            v-on="on"
                        >
                            add_circle_outline
                        </v-icon>
                    </template>
                    <span>
                        {{
                            $t("additional:modules.tools.dataNarrator.create")
                        }}
                    </span>
                </v-tooltip>

                <v-tooltip left>
                    <template #activator="{ on }">
                        <v-icon
                            id="import-button"
                            class="mr-1"
                            @click="importForm = true"
                            v-on="on"
                        >
                            exit_to_app
                        </v-icon>
                    </template>
                    <span>
                        {{
                            $t("additional:modules.tools.dataNarrator.label.importStory")
                        }}
                    </span>
                </v-tooltip>

                <v-tooltip left>
                    <template #activator="{ on }">
                        <v-icon
                            id="info-button"
                            class="mr-1"
                            v-on="on"
                        >
                            info
                        </v-icon>
                    </template>
                    <span>
                        {{
                            $t("additional:modules.tools.dataNarrator.dashboardView.total") + storyList.length
                        }}
                    </span>
                </v-tooltip>

                <v-tooltip left>
                    <template #activator="{ on }">
                        <v-icon
                            id="refresh-button"
                            class="mr-1"
                            @click="refreshStoryList()"
                            v-on="on"
                        >
                            autorenew
                        </v-icon>
                    </template>
                    <span>
                        {{
                            $t("additional:modules.tools.dataNarrator.dashboardView.refresh")
                        }}
                    </span>
                </v-tooltip>
            </v-col>
        </v-row>
        <v-row v-if="importForm">
            <v-col cols="12">
                <ImportStory @closeImportForm="closeImportForm" />
            </v-col>
        </v-row>
        <v-row v-if="!importForm">
            <v-item-group
                id="tool-storyTellingTool-modeSelection"
            >
                <v-col
                    v-for="(item, i) in storyList"
                    :key="i"
                    cols="12"
                >
                    <v-item v-slot="{ toggle }">
                        <v-card>
                            <div class="d-flex flex-no-wrap justify-space-between">
                                <div>
                                    <div class="row">
                                        <v-col
                                            v-if="item.titleImage"
                                            cols="6"
                                        >
                                            <v-img
                                                :src="item.titleImage"
                                                :alt="item.title"
                                                max-width="200"
                                                max-height="200"
                                            />
                                        </v-col>
                                        <v-col :cols="item.titleImage ? 6 : 12">
                                            <v-card-title
                                                class="text-h5"
                                            >
                                                {{ item.title }}
                                            </v-card-title>

                                            <v-card-subtitle>
                                                {{
                                                    $t("additional:modules.tools.dataNarrator.label.author")
                                                }}: &nbsp; {{ item.author }}
                                            </v-card-subtitle>
                                        </v-col>

                                        <div class="row">
                                            <v-col
                                                cols="12"
                                            >
                                                <v-card-text>
                                                    {{ item.description }}
                                                </v-card-text>
                                            </v-col>
                                        </div>
                                        <v-card-actions>
                                            <v-tooltip top>
                                                <template #activator="{ on }">
                                                    <v-icon
                                                        id="share-button"
                                                        class="ml-2 mr-1"
                                                        v-on="on"
                                                        @click="onShareById(item._id), toggle()"
                                                    >
                                                        share
                                                    </v-icon>
                                                </template>
                                                <span>
                                                    {{
                                                        $t("additional:modules.tools.dataNarrator.button.share")
                                                    }}
                                                </span>
                                            </v-tooltip>

                                            <v-tooltip top>
                                                <template #activator="{ on }">
                                                    <v-icon
                                                        id="play-button"
                                                        class="ml-2 mr-1"
                                                        v-on="on"
                                                        @click="onStorySelectedById(item._id), toggle()"
                                                    >
                                                        play_arrow
                                                    </v-icon>
                                                </template>
                                                <span>
                                                    {{
                                                        $t("additional:modules.tools.dataNarrator.play")
                                                    }}
                                                </span>
                                            </v-tooltip>

                                            <v-tooltip top>
                                                <template #activator="{ on }">
                                                    <v-icon
                                                        id="edit-button"
                                                        class="ml-2 mr-1"
                                                        v-on="on"
                                                        @click="onStoryEditById(item._id), toggle()"
                                                    >
                                                        edit_note
                                                    </v-icon>
                                                </template>
                                                <span>
                                                    {{
                                                        $t("additional:modules.tools.dataNarrator.creator.edit")
                                                    }}
                                                </span>
                                            </v-tooltip>
                                            <v-tooltip top>
                                                <template #activator="{ on }">
                                                    <v-icon
                                                        id="delete-button"
                                                        class="ml-2 mr-1"
                                                        v-on="on"
                                                        @click="onStoryDeleteById(item._id), toggle()"
                                                    >
                                                        playlist_remove
                                                    </v-icon>
                                                </template>
                                                <span>
                                                    {{
                                                        $t("additional:modules.tools.dataNarrator.creator.delete")
                                                    }}
                                                </span>
                                            </v-tooltip>
                                        </v-card-actions>
                                    </div>
                                </div>
                            </div>
                        </v-card>
                    </v-item>
                </v-col>
            </v-item-group>
        </v-row>
    </div>
</template>

<style lang="scss" scoped>
#title-row {
    padding-bottom: 10px;

    #title-element {
        padding-left: calc(var(--bs-gutter-x) * 0.5);
    }
}
</style>
