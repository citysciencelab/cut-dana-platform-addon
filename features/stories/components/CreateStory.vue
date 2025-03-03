<script>
import {mapMutations} from "vuex";
import mutations from "../../../store/mutationsDataNarrator";
import DataNarratorWindowMixins from "../../../mixins/DataNarratorWindowMixins";
import ToolWindow from "../../shared/Toolwindow/ToolWindow.vue";
import CreateStoryHeader from "./CreateStoryHeader.vue";
import LoginMixin from "../../../mixins/LoginMixin";

import {mdiCancel, mdiCheck, mdiEyeOutline} from "@mdi/js";
import CreateStoryMixins from "../mixins/CreateStoryMixins";
import NavigationMixins from "../../../mixins/NavigationMixins";
import StoryForm from "./StoryForm.vue";
import * as contantsDataNarrator from "../../../store/contantsDataNarrator";

export default {
    name: "CreateStory",
    mixins: [DataNarratorWindowMixins, LoginMixin, CreateStoryMixins, NavigationMixins],
    components: {
        StoryForm,
        CreateStoryHeader, Toolwindow: ToolWindow
    },
    computed: {
        contantsDataNarrator() {
            return contantsDataNarrator
        }
    },

    data() {
        return {
            icons: {
                mdiCancel,
                mdiCheck,
                mdiEyeOutline
            },
        }
    },
    methods: {
        ...mapMutations("Modules/DataNarrator", Object.keys(mutations)),
    },

    async mounted() {
        if (this.selectedStoryId) {
            const story = await this.getStory(this.selectedStoryId);
            this.setStoryData(story);
        }
    },
    unmounted() {
        this.resetStoryForm();
    }
};
</script>

<template>
    <Toolwindow>
        <template v-slot:header>
            <CreateStoryHeader />
        </template>
        <template v-slot:default>
            <div id="tool-dataNarrator-creator-storyForm">
                <StoryForm />
            </div>
        </template>
        <template v-slot:footer>
            <div class="actions-container">
                <v-btn @click="gotoPage(contantsDataNarrator.dataNarratorModes.DASHBOARD)">Cancel</v-btn>
                <v-btn @click="saveStory">Save</v-btn>
            </div>
        </template>
    </Toolwindow>
</template>

<style scoped lang="scss">
.actions-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: .2rem;
}
</style>
