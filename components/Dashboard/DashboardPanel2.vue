<script>
import axios from "axios";
import Masonry from "masonry-layout";
import {mapGetters, mapMutations} from "vuex";

import getters from "../../store/gettersDataNarrator";
import mutations from "../../store/mutationsDataNarrator";

import StoryCard from "./Stories/StoryCard.vue";
import StoryCardSkeleton from "./Stories/StoryCardSkeleton.vue";
import DashboardHeader from "./DashboardHeader.vue";

export default {
    name: "DashboardPanel",
    components: {
        StoryCard,
        StoryCardSkeleton,
        DashboardHeader
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
        const toolWindow = document.querySelectorAll(".tool-window-vue, .table-tool-win-all-vue")[0],
            heading = toolWindow?.getElementsByClassName("title")[0];

        if (heading) {
            heading.innerHTML = this.$t("additional:modules.tools.dataNarrator.dashboardView.title");
        }
    },
    updated () {
        setTimeout(() => {
            this.masonry = new Masonry("#tool-dataNarrator-modeSelection",
                {
                    itemSelector: ".grid-item",
                    columnWidth: ".grid-item",
                    gutter: 20,
                    percentPosition: true
                });
        }, 100);
    },
    methods: {
        ...mapMutations("Tools/DataNarrator", Object.keys(mutations)),

        /**
         * Refresh masonry layout after image is loaded
         * @returns {void}
         */
        imageLoaded () {
            this.masonry?.layout();
        },

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
                });
        },

        /**
         * Refreshes the list of stories and reset current story
         * @param {String} mode Story filter
         * @returns {void}
         */
        refreshStoryListWithReset (mode = "all") {
            this.refreshStoryList(mode).then(() => {
                if (this.currentStory !== null) {
                    this.setCurrentStory(null);
                    this.$emit("resizeHandler");
                }
            });
        }
    }
};
</script>

<template>
    <div>
        <DashboardHeader
            :my-mode="!isAdmin && uid"
            :story-list-mode="storyListMode"
            @refreshStoryList="refreshStoryList"
            @refreshStoryListWithReset="refreshStoryListWithReset"
        />

        <v-row>
            <v-container fluid>
                <div>
                    <StoryCard
                        v-if="currentStory !== null"
                        :key="currentStory._id + currentStory.updatedAt"
                        :story="currentStory"
                        :is-admin="isAdmin"
                        :uid="uid"
                        :grid="false"
                        @refreshStoryList="refreshStoryList"
                        v-on="$listeners"
                    />
                    <div
                        v-else
                        id="tool-dataNarrator-modeSelection"
                    >
                        <template
                            v-if="storyList.length > 0"
                        >
                            <StoryCard
                                v-for="(story) in storyList"
                                :key="story._id + story.updatedAt"
                                :story="story"
                                :is-admin="isAdmin"
                                :uid="uid"
                                :grid="true"
                                @refreshStoryList="refreshStoryList"
                                @imageLoaded="imageLoaded"
                                v-on="$listeners"
                            />
                        </template>
                        <template
                            v-else
                        >
                            <StoryCardSkeleton
                                v-for="n in 10"
                                :key="n"
                                :is-admin="isAdmin"
                                :uid="uid"
                                :grid="true"
                                @refreshStoryList="refreshStoryList"
                                v-on="$listeners"
                            />
                        </template>
                    </div>
                </div>
            </v-container>
        </v-row>
    </div>
</template>
