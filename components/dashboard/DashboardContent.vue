<script>
import {mapGetters, mapMutations} from "vuex";
import getters from "../../store/gettersDataNarrator";
import mutations from "../../store/mutationsDataNarrator";
import DataNarratorWindowMixins from "../../mixins/DataNarratorWindowMixins";
import Toolwindow from "../ToolWindow/Toolwindow.vue";
import DashboardHeader from "../dashboard/DashboardHeader.vue";
import NavigationMixins from "../../mixins/NavigationMixins";
import {dataNarratorModes} from "../../store/contantsDataNarrator";
import DashboardMixins from "../../mixins/DashboardMixins";
import CreateStoryMixins from "../../mixins/CreateStoryMixins";

import {mutations as editStoryMutations} from "../../store/FormStores/EditStoryForm";

export default {
    name: "DashboardContent",
    mixins: [DataNarratorWindowMixins, NavigationMixins, DashboardMixins, CreateStoryMixins],
    components: {DashboardHeader, Toolwindow},
    computed: {
        ...mapGetters("Modules/DataNarrator", Object.keys(getters)),
        dataNarratorModes() {
            return dataNarratorModes
        }
    },
    methods: {
        ...mapMutations("Modules/DataNarrator", Object.keys(mutations)),
        ...mapMutations("Modules/DataNarrator/EditFormStore", Object.keys(editStoryMutations)),

        gotoSelectedStory(storyId) {
            this.setSelectedStoryId(storyId);
            this.gotoPage(dataNarratorModes.CREATE_STORY);
        }
    },
    async mounted() {
        await this.getStories();
    }
};
</script>

<template>
    <button @click="() => gotoPage(dataNarratorModes.CREATE_STORY)">Create story</button>
    <div class="stories-card-container">
        <div v-for="story in stories" :key="story.id" class="card">
            <img />
            <h4>{{story.title}}</h4>
            <p>{{story.description}}</p>

            <div class="card-footer">
              <button @click="gotoSelectedStory(story.id)">Edit</button>
            </div>
        </div>
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
