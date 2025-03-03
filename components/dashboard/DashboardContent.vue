<script>
import {mapGetters, mapMutations} from "vuex";
import getters from "../../store/gettersDataNarrator";
import mutations from "../../store/mutationsDataNarrator";
import DataNarratorWindowMixins from "../../mixins/DataNarratorWindowMixins";
import ToolWindow from "../../features/shared/Toolwindow/ToolWindow.vue";
import DashboardHeader from "../dashboard/DashboardHeader.vue";
import NavigationMixins from "../../mixins/NavigationMixins";
import {dataNarratorModes} from "../../store/contantsDataNarrator";
import DashboardMixins from "../../mixins/DashboardMixins";
import CreateStoryMixins from "../../features/stories/mixins/CreateStoryMixins";

import {mutations as editStoryMutations} from "../../features/stories/store/EditStoryForm";
import StoryCard from "./Stories/StoryCard.vue";

export default {
    name: "DashboardContent",
    mixins: [DataNarratorWindowMixins, NavigationMixins, DashboardMixins, CreateStoryMixins],
    components: {StoryCard, DashboardHeader, Toolwindow: ToolWindow},
    computed: {
        ...mapGetters("Modules/DataNarrator", Object.keys(getters)),
        dataNarratorModes() {
            return dataNarratorModes
        }
    },
    methods: {
        ...mapMutations("Modules/DataNarrator", Object.keys(mutations)),
        ...mapMutations("Modules/DataNarrator/EditStoryForm", Object.keys(editStoryMutations)),


    },
    async mounted() {
        await this.getAllStories();
    }
};
</script>

<template>
    <div class="stories-card-container">
        <StoryCard
            v-for="story in stories"
            :key="story.id + story.updatedAt"
            :story="story"
            :grid="true"
            @refreshStoryList="getAllStories"
            @imageLoaded="() => {console.log('imageLoaded')}"
            v-on="$listeners"
        />
    </div>
</template>

<style scoped lang="scss">
.stories-card-container {
    display: flex;
    flex-wrap: wrap;
    padding: 1rem;
    gap: 0.4rem;

    .card {
        border: solid 1px #000;
        border-radius: .4rem;
        padding: .4rem;
        min-width: 16rem;

        .card-footer {
            display: flex;
            justify-content: flex-end;
        }
    }
}
</style>
