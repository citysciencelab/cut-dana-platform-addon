<script>

import axios from "axios";
import Masonry from "masonry-layout";
import {mapGetters, mapMutations} from "vuex";
import InfiniteLoading from "vue-infinite-loading";

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
        DashboardHeader,
        InfiniteLoading
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
            storyList: [],
            storyListMode: "all",
            storyListPage: 1,
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
         * @param {Number} page Page number
         * @returns {void}
         */
        refreshStoryList (mode = "all", page = 1) {
            const newMode = mode || this.storyListMode;

            if (newMode !== this.storyListMode) {
                this.storyListPage = 1;
                this.storyList = [];
                this.$nextTick(() => {
                    this.$refs.infiniteLoading.$emit("$InfiniteLoading:reset");
                });
            }

            return axios
                .get(this.backendConfig.url + `/stories?mode=${mode}&page=${page}`)
                .then((response) => {
                    this.storyListMode = newMode;
                    this.storyList.push(...response.data);
                    return response.data.length;
                });
        },

        /**
         * Handles the infinite loading
         * @param {Object} $state The state of the infinite loading
         * @returns {void}
         */
        infiniteHandler ($state) {
            setTimeout(() => {
                this.storyListPage += 1;
                this.refreshStoryList(this.storyListMode, this.storyListPage).then((length) => {
                    if (length === 0) {
                        $state.complete();
                    }
                    else {
                        $state.loaded();
                    }
                });
            }, 1000);
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
        <InfiniteLoading
            ref="infiniteLoading"
            @infinite="infiniteHandler"
        >
            <div slot="no-results">
                {{ $t("additional:modules.tools.dataNarrator.dashboardView.noResults") }}
            </div>
        </InfiniteLoading>
    </div>
</template>
