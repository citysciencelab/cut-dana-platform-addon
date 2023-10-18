<script>
import axios from "axios";
import {mapGetters} from "vuex";
import Masonry from "masonry-layout";

import getters from "../../store/gettersDataNarrator";

import LanguageSwitchButton from "./Tools/LanguageSwitchButton.vue";
import LoginButton from "./Tools/LoginButton.vue";
import CreateStoryButton from "./Tools/CreateStoryButton.vue";
import StoryCard from "./Stories/StoryCard.vue";
import ListButton from "./Tools/ListButton.vue";
// import ImportStory from "./storyCreator/ImportStory.vue";

export default {
    name: "DashboardPanel",
    components: {
        LanguageSwitchButton,
        LoginButton,
        CreateStoryButton,
        StoryCard,
        ListButton
        // ImportStory
    },
    props: {
        uid: {
            type: String,
            default: null
        },
        isAdmin: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            storyList: {},
            importForm: false,
            storyListMode: "all",
            masonry: null
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
        this.masonry = new Masonry("#tool-storyTellingTool-modeSelection",
            {
                itemSelector: ".grid-item",
                columnWidth: ".grid-item",
                percentPosition: true
            });
    },
    methods: {
        /**
         * Refreshes the list of stories
         * @param {String} mode Story filter
         * @returns {void}
         */
        refreshStoryList (mode = "all") {
            const newMode = mode || this.storyListMode;

            axios
                .get(this.backendConfig.url + "/stories?mode=" + mode)
                .then((response) => {
                    this.storyListMode = newMode;
                    this.storyList = response.data;
                    this.masonry.layout();
                });
        },

        availableStoryListModes () {
            const anonymousModes = ["all", "featured", "popular"],
                loggedInModes = ["all", "featured", "popular", "my"];

            if (this.isAdmin || !this.uid) {
                return anonymousModes;
            }
            return loggedInModes;
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
                class="d-flex justify-begin align-center"
                cols="7"
            >
                <span
                    v-for="mode in availableStoryListModes()"
                    :key="mode"
                >
                    <ListButton
                        :mode="mode"
                        :current-mode="storyListMode"
                        @refreshStoryList="refreshStoryList"
                    />
                </span>
            </v-col>
            <v-col
                cols="5"
                class="d-flex justify-end align-center"
            >
                <CreateStoryButton />

                <!-- <v-tooltip left>
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
                </v-tooltip> -->

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

                <LanguageSwitchButton />
                <LoginButton />
            </v-col>
        </v-row>
        <v-row v-if="importForm">
            <v-col cols="12">
                <ImportStory @closeImportForm="closeImportForm" />
            </v-col>
        </v-row>
        <v-row>
            <div
                v-if="!importForm"
                class="container-fluid"
            >
                <v-row
                    id="tool-storyTellingTool-modeSelection"
                >
                    <StoryCard
                        v-for="(story) in storyList"
                        :key="story._id + story.updatedAt"
                        :story="story"
                        :is-admin="isAdmin"
                        :uid="uid"
                        @refreshStoryList="refreshStoryList"
                        v-on="$listeners"
                    />
                </v-row>
            </div>
        </v-row>
    </div>
</template>

<style lang="scss" scoped>
#tool-storyTellingTool-modeSelection {
    height: 100% !important;
}
#title-row {
    padding-bottom: 10px;

    #title-element {
        padding-left: calc(var(--bs-gutter-x) * 0.5);
    }
}
</style>
