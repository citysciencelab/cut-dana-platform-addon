<script>
import * as constants from "../../store/constantsDataNarrator";
import axios from "axios";
import {mapActions, mapGetters, mapMutations} from "vuex";
import mutations from "../../store/mutationsDataNarrator";
import actions from "../../store/actionsDataNarrator";
import getters from "../../store/gettersDataNarrator";

export default {
    name: "CSLStorySelector",
    props: {
        storyId: {
            type: Number,
            default: null
        }
    },
    data () {
        return {
            constants,
            storyList: {}
        };
    },
    computed: {
        ...mapGetters("Tools/DataNarrator", Object.keys(getters))
    },
    mounted () {
        this.refreshStoryList();

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
                .get(this.backendConfig.url + "story")
                .then((response) => {
                    this.storyList = response.data;
                });
        },

        /**
         * Creates a new story, switch mode
         * @returns {void}
         */
        createStory () {
            this.setMode(constants.storyTellingModes.CREATE);
        },

        /**
         * Changes the story that is selected and fetches the corresponding Story json from the API
         * @param {integer} storyId The ID of the selected story
         * @returns {void}
         */
        onStorySelectedById (storyId) {
            this.storyConfURL = this.backendConfig.url + "story/" + storyId;
            axios
                .get(this.storyConfURL)
                .then((response) => {
                    this.setStoryConf(response.data);
                    this.updateStoryId(storyId);
                    this.setMode(constants.storyTellingModes.PLAY);
                });
        },

        /**
         * Edit the story that is selected
         * @param {integer} storyId The ID of the selected story
         * @returns {void}
         */
        onStoryEditById (storyId) {
            this.storyConfURL = this.backendConfig.url + "story/" + storyId;
            axios
                .get(this.storyConfURL)
                .then((response) => {
                    this.setStoryConf(response.data);
                    this.storyConf.storyId = storyId;
                    this.updateStoryId(storyId);
                    this.setMode(constants.storyTellingModes.CREATE);
                });
        },

        /**
         * Emits the storyId to the parent component
         * @param {integer} value The storyId of the selected story
         * @returns {void}
         */
        updateStoryId: function (value) {
            this.$emit("updateStoryId", value);
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
                    this.storyConfURL = this.backendConfig.url + "delete/story/" + storyId;

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
                        }
                        );
                },
                confirmActionSettings = {
                    actionConfirmedCallback: deleteStory,
                    confirmCaption: this.$t(
                        "additional:modules.tools.dataNarrator.confirm.deleteStory.confirmButton"
                    ),
                    denyCaption: this.$t(
                        "additional:modules.tools.dataNarrator.confirm.deleteStory.denyButton"
                    ),
                    textContent: this.$t(
                        "additional:modules.tools.dataNarrator.confirm.deleteStory.description"
                    ),
                    headline: this.$t(
                        "additional:modules.tools.dataNarrator.confirm.deleteStory.title"
                    ),
                    forceClickToClose: true
                };

            this.$store.dispatch(
                "ConfirmAction/addSingleAction",
                confirmActionSettings
            );
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
                cols="9"
            >
                {{
                    $t("additional:modules.tools.dataNarrator.dashboardView.title")
                }}
            </v-col>
            <v-col cols="3">
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
        <v-row>
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
                                            v-if="item.coverImagePath"
                                            cols="6"
                                        >
                                            <v-img
                                                :src="backendConfig.url + 'image/' + item.coverImagePath"
                                                :alt="item.title"
                                                max-width="200"
                                                max-height="200"
                                            />
                                        </v-col>
                                        <v-col :cols="item.coverImagePath ? 6 : 12">
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
                                            <v-btn
                                                v-if="userRole !== constants.dataNarratorRoles.ADMIN"
                                                class="ml-2"
                                                text
                                                @click="onStorySelectedById(item.id), toggle()"
                                            >
                                                {{
                                                    $t("additional:modules.tools.dataNarrator.play")
                                                }}
                                            </v-btn>

                                            <v-tooltip
                                                v-if="userRole === constants.dataNarratorRoles.ADMIN"
                                                top
                                            >
                                                <template #activator="{ on }">
                                                    <v-icon
                                                        id="play-button"
                                                        class="ml-2 mr-1"
                                                        v-on="on"
                                                        @click="onStorySelectedById(item.id), toggle()"
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
                                                        @click="onStoryEditById(item.id), toggle()"
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
                                                        @click="onStoryDeleteById(item.id), toggle()"
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
